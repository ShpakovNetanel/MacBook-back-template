-- =====================================================================
-- Function: shoval.get_standard_calculation(p_managing_unit)
--
-- Reproduces the "standardQuantity" calculation used by the front-end
-- StandardDrawer (see src/entities/standard-entities/standard/utilities/
-- standard.utils.ts -> calculateStandardsForUnit + sumMaterialGroupQuantity).
--
-- Parameters:
--   p_managing_unit - filter by managing unit id, or NULL for all units.
--   p_date          - reference date (defaults to CURRENT_DATE).
--
-- Usage:
--   SELECT * FROM shoval.get_standard_calculation(NULL);              -- all, today
--   SELECT * FROM shoval.get_standard_calculation(2);                 -- unit 2, today
--   SELECT * FROM shoval.get_standard_calculation(NULL, '2026-01-15');-- all, specific date
-- =====================================================================

DROP FUNCTION IF EXISTS shoval.get_standard_calculation(integer, date);
DROP FUNCTION IF EXISTS shoval.get_standard_calculation(integer);
DROP VIEW IF EXISTS shoval.v_standard_calculation;

CREATE OR REPLACE FUNCTION shoval.get_standard_calculation(
    p_managing_unit integer DEFAULT NULL,
    p_date          date    DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    unit_id          integer,
    unit_description character varying,
    unit_level       integer,
    standard_id      integer,
    branch_tag_id    integer,
    managing_unit    integer,
    item_group_id    character varying,
    tool_group_id    character varying,
    base_quantity    numeric,
    tool_quantity    numeric,
    standard_quantity numeric,
    lowest_level     integer,
    tags             jsonb
)
LANGUAGE sql STABLE
AS $$
WITH RECURSIVE
-- All values that belong to each standard, with their tag metadata.
sv AS (
    SELECT  sv.standard_id,
            sv.tag_id,
            sv.quantity,
            st.unit_level,
            st.tag
    FROM    shoval.standard_values sv
    JOIN    shoval.standard_tags   st ON st.id = sv.tag_id
),

-- The "parallel level" of a standard = the (lowest) unit_level that has
-- more than one tag value. Matches the JS:
--   parallelLevel = first level where values.length > 1
parallel_level AS (
    SELECT  standard_id,
            MIN(unit_level) AS lvl
    FROM    (
        SELECT standard_id, unit_level, COUNT(*) AS cnt
        FROM   sv
        GROUP  BY standard_id, unit_level
    ) c
    WHERE   cnt > 1
    GROUP   BY standard_id
),

-- One "branch" per standard. Standards without a parallel level produce
-- a single branch (branch_tag_id IS NULL). Standards with a parallel
-- level produce one branch per parallel value.
branch_seed AS (
    SELECT  sv.standard_id,
            sv.tag_id        AS branch_tag_id,
            sv.tag           AS branch_tag,
            sv.unit_level    AS branch_level
    FROM    sv
    JOIN    parallel_level pl
            ON pl.standard_id = sv.standard_id
           AND pl.lvl         = sv.unit_level

    UNION ALL

    SELECT  sa.id, NULL::int, NULL::text, NULL::int
    FROM    shoval.standard_attributes sa
    WHERE   NOT EXISTS (
                SELECT 1 FROM parallel_level pl WHERE pl.standard_id = sa.id
            )
),

-- The values that make up each branch:
--   * the branch's own parallel value, AND
--   * every shared value (values at any non-parallel level).
branch_values AS (
    SELECT  bs.standard_id,
            bs.branch_tag_id,
            sv.unit_level,
            sv.tag,
            sv.quantity
    FROM    branch_seed bs
    JOIN    sv             ON sv.standard_id = bs.standard_id
    LEFT JOIN parallel_level pl ON pl.standard_id = bs.standard_id
    WHERE   pl.lvl IS NULL                       -- no parallel level => take all
       OR   sv.unit_level <> pl.lvl              -- shared (non-parallel) value
       OR   sv.tag_id = bs.branch_tag_id         -- this branch's parallel value
),

-- Per-branch summary: lowest level, total base quantity.
-- plus the full chain of tags that make up the branch (one element per
-- standard_value, ordered top-down by unit_level).
branch_summary AS (
    SELECT  bv.standard_id,
            bv.branch_tag_id,
            MAX(bv.unit_level)                                       AS lowest_level,
            SUM(COALESCE(bv.quantity, 0))                            AS base_quantity,
            (
                SELECT jsonb_agg(
                           jsonb_build_object(
                               'level',    bv2.unit_level,
                               'tag_id',   sv2.tag_id,
                               'tag',      bv2.tag,
                               'quantity', bv2.quantity
                           )
                           ORDER BY bv2.unit_level
                       )
                FROM   branch_values bv2
                JOIN   sv             sv2
                       ON sv2.standard_id = bv2.standard_id
                      AND sv2.tag        = bv2.tag
                      AND sv2.unit_level = bv2.unit_level
                WHERE  bv2.standard_id   = bv.standard_id
                  AND  bv2.branch_tag_id IS NOT DISTINCT FROM bv.branch_tag_id
            )                                                        AS tags
    FROM    branch_values bv
    GROUP   BY bv.standard_id, bv.branch_tag_id
),

-- Current effective unit row (latest start_date covering today).
current_units AS (
    SELECT DISTINCT ON (u.unit_id)
            u.unit_id,
            u.description,
            u.level_id,
            u.tsav_irgun_code AS simul
    FROM    shoval.units u
    WHERE   u.start_date <= p_date
      AND   u.end_date   >  p_date
      AND   u.object_type = 'O'                  -- OBJECT_TYPES.UNIT
    ORDER   BY u.unit_id, u.start_date DESC
),

-- Active parent -> child relations as of today.
active_relations AS (
    SELECT  ur.unit_id         AS parent_id,
            ur.related_unit_id AS child_id
    FROM    shoval.units_relations ur
    WHERE   ur.start_date <= p_date
      AND   ur.end_date   >  p_date
),

-- Ancestors of every unit (excluding self).
ancestors(unit_id, ancestor_id, depth) AS (
    SELECT  ar.child_id, ar.parent_id, 1
    FROM    active_relations ar

    UNION ALL

    SELECT  a.unit_id, ar.parent_id, a.depth + 1
    FROM    ancestors a
    JOIN    active_relations ar ON ar.child_id = a.ancestor_id
),

-- Tags a unit (directly) owns.
unit_tags AS (
    SELECT  ust.unit_id,
            st.unit_level,
            st.tag
    FROM    shoval.unit_standard_tags ust
    JOIN    shoval.standard_tags      st ON st.id = ust.tag_id
),

-- The full tag chain for each unit = own tags + every ancestor's tags.
-- (Mirrors the per-level tag match performed during recursion + the
-- ancestor-tag filter in filterStandardsByAncestorTags.)
unit_tag_chain AS (
    SELECT unit_id, unit_level, tag FROM unit_tags
    UNION
    SELECT a.unit_id, ut.unit_level, ut.tag
    FROM   ancestors a
    JOIN   unit_tags ut ON ut.unit_id = a.ancestor_id
),

-- Candidates: units whose level equals the standard branch's lowest level.
-- Filtered by p_managing_unit when provided.
candidate AS (
    SELECT  cu.unit_id,
            cu.description,
            cu.level_id,
            bs.standard_id,
            bs.branch_tag_id,
            bs.lowest_level,
            bs.base_quantity,
            bs.tags
    FROM    current_units    cu
    JOIN    branch_summary   bs ON cu.level_id = bs.lowest_level
    JOIN    shoval.standard_attributes sa2 ON sa2.id = bs.standard_id
    WHERE   p_managing_unit IS NULL
       OR   sa2.managing_unit = p_managing_unit
),

-- Path of units from the candidate up to the root, each tagged with its
-- own unit level. Used to enforce the JS rule:
--   "if the standard has a value at level L, the unit on the path at
--    level L must have a tag at L that equals the standard's tag at L"
-- (including the case 'no tag at L' => skip).
path AS (
    SELECT  c.unit_id  AS candidate_unit_id,
            c.unit_id  AS path_unit_id,
            c.level_id AS path_level
    FROM    candidate c
    UNION
    SELECT  c.unit_id, a.ancestor_id, cu.level_id
    FROM    candidate     c
    JOIN    ancestors     a  ON a.unit_id  = c.unit_id
    JOIN    current_units cu ON cu.unit_id = a.ancestor_id
),

-- A branch is applicable to a candidate unit when there is NO branch value
-- (level L, tag T) for which a path-unit at level L exists but lacks the
-- matching tag.
applicable AS (
    SELECT  c.*
    FROM    candidate c
    WHERE   NOT EXISTS (
        SELECT 1
        FROM   branch_values bv
        WHERE  bv.standard_id   = c.standard_id
          AND  bv.branch_tag_id IS NOT DISTINCT FROM c.branch_tag_id
          AND  EXISTS (
                SELECT 1 FROM path p
                WHERE  p.candidate_unit_id = c.unit_id
                  AND  p.path_level        = bv.unit_level
          )
          AND  NOT EXISTS (
                SELECT 1
                FROM   path      p
                JOIN   unit_tags ut
                       ON ut.unit_id    = p.path_unit_id
                      AND ut.unit_level = bv.unit_level
                      AND ut.tag        = bv.tag
                WHERE  p.candidate_unit_id = c.unit_id
                  AND  p.path_level        = bv.unit_level
          )
    )
),

-- Live INVENTORY quantity per (unit, material) for today's reports
-- (matches buildLiveMaterialDataByUnitId + REPORT_TYPES.INVENTORY = 1,
-- using confirmed_quantity ?? reported_quantity, ACTIVE rows only).
live_inventory AS (
    SELECT  r.unit_id,
            ri.material_id,
            SUM(COALESCE(ri.confirmed_quantity, ri.reported_quantity, 0)) AS qty
    FROM    shoval.reports      r
    JOIN    shoval.report_items ri
            ON ri.report_id = r.id
           AND ri.status    = 'ACTIVE'
    WHERE   r.report_type_id = 1                 -- REPORT_TYPES.INVENTORY
      AND   r.created_on     = p_date
    GROUP   BY r.unit_id, ri.material_id
),

-- Materials that belong to a standard_group, including the group id
-- itself (sumMaterialGroupQuantity sums both the groupId entry and its
-- member materials).
group_members AS (
    SELECT msg.group_id, msg.material_id
    FROM   shoval.material_standard_group msg
    UNION
    SELECT sg.id, sg.id
    FROM   shoval.standard_groups sg
),

-- Sum of the tool group's live inventory at the candidate unit.
tool_stock AS (
    SELECT  a.unit_id,
            a.standard_id,
            a.branch_tag_id,
            sa.tool_group_id,
            COALESCE(SUM(li.qty), 0) AS tool_quantity
    FROM    applicable                  a
    JOIN    shoval.standard_attributes  sa ON sa.id = a.standard_id
    JOIN    group_members               gm ON gm.group_id = sa.tool_group_id
    LEFT JOIN live_inventory            li
            ON  li.unit_id     = a.unit_id
           AND  li.material_id = gm.material_id
    WHERE   sa.tool_group_id IS NOT NULL
    GROUP   BY a.unit_id, a.standard_id, a.branch_tag_id, sa.tool_group_id
)

SELECT
    a.unit_id,
    a.description                                   AS unit_description,
    a.level_id                                      AS unit_level,
    a.standard_id,
    a.branch_tag_id,
    sa.managing_unit,
    sa.item_group_id,
    sa.tool_group_id,
    a.base_quantity,
    ts.tool_quantity,
    CASE
        WHEN sa.tool_group_id IS NULL THEN a.base_quantity
        ELSE a.base_quantity * COALESCE(ts.tool_quantity, 0)
    END                                             AS standard_quantity,
    a.lowest_level,
    a.tags
FROM        applicable                 a
JOIN        shoval.standard_attributes sa ON sa.id = a.standard_id
LEFT JOIN   tool_stock                 ts
        ON  ts.unit_id       = a.unit_id
       AND  ts.standard_id   = a.standard_id
       AND  ts.branch_tag_id IS NOT DISTINCT FROM a.branch_tag_id
-- Tool-based standards only materialise when today's INVENTORY reports
-- show some stock of the tool group at this unit. Non-tool standards are
-- always emitted.
WHERE       sa.tool_group_id IS NULL
       OR   COALESCE(ts.tool_quantity, 0) > 0;
$$;

-- =====================================================================
-- View 1: All managing units (no filter)
-- =====================================================================
CREATE OR REPLACE VIEW shoval.v_standard_calculation_all AS
SELECT * FROM shoval.get_standard_calculation(NULL);

-- =====================================================================
-- View 2: Managing unit = 2
-- =====================================================================
CREATE OR REPLACE VIEW shoval.v_standard_calculation_unit_2 AS
SELECT * FROM shoval.get_standard_calculation(2);
