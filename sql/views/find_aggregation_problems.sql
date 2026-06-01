-- =====================================================================
-- Query: Find Aggregation Problems (שצ״ל + מלאי reports) — Full Bottom-Up
--
-- PURPOSE: For a given date, sum ALL level-4 (leaf) reports upward through
--          the entire hierarchy, and at EVERY level compare the unit's own
--          report against the true aggregated sum from the leaves below it.
--
-- HOW IT WORKS:
--   1. Get all שצ״ל (type 2) and מלאי (type 1) report_items for the target date
--   2. Walk the hierarchy: for each unit, find ALL its level-4 descendants
--   3. Sum those leaf reports to get the "true bottom-up quantity"
--   4. Compare each non-leaf unit's own report against that leaf sum
--   5. Show rows where these don't match
--
-- PARAMETERS: CURRENT_DATE (can be changed to a specific date for testing)
--
-- Result columns:
--   unit_id / unit_name       – the unit with the mismatch
--   unit_level                – its level in the hierarchy (0=top … 3)
--   report_type               – שצ״ל or מלאי
--   material_id / material_name
--   own_reported_qty          – what THIS unit reported
--   leaf_aggregated_qty       – true sum from all level-4 descendants
--   difference                – own - leaf_sum (+ = over-reports, - = under-reports)
--   pct_diff                  – severity as percentage
-- =====================================================================

WITH RECURSIVE
-- 1️⃣ Active hierarchy (today)
active_relations AS (
    SELECT  ur.unit_id         AS parent_id,
            ur.related_unit_id AS child_id
    FROM    shoval.units_relations ur
    WHERE   ur.start_date <= CURRENT_DATE
      AND   ur.end_date   >  CURRENT_DATE
),

-- 2️⃣ Unit metadata (description + level)
unit_info AS (
    SELECT DISTINCT ON (u.unit_id)
            u.unit_id,
            u.description,
            u.level_id
    FROM    shoval.units u
    WHERE   u.start_date <= CURRENT_DATE
      AND   u.end_date   >  CURRENT_DATE
      AND   u.object_type = 'O'
    ORDER BY u.unit_id, u.start_date DESC
),

-- 3️⃣ For every unit, recursively find ALL its descendants
--    ancestor_id = the unit we're rolling up to
--    descendant_id = a unit somewhere below it
subtree AS (
    -- Direct children
    SELECT  ar.parent_id  AS ancestor_id,
            ar.child_id   AS descendant_id
    FROM    active_relations ar

    UNION ALL

    -- Recurse deeper
    SELECT  st.ancestor_id,
            ar.child_id   AS descendant_id
    FROM    subtree st
    JOIN    active_relations ar ON ar.parent_id = st.descendant_id
),

-- 4️⃣ Keep only leaf descendants (level 4) for each ancestor
leaf_descendants AS (
    SELECT  st.ancestor_id,
            st.descendant_id
    FROM    subtree st
    JOIN    unit_info ui ON ui.unit_id = st.descendant_id
    WHERE   ui.level_id = 4
),

-- 5️⃣ All report_items for the target date, for שצ״ל (2) and מלאי (1)
--    Take the entry with the LOWEST reporting_level (most authoritative)
reported AS (
    SELECT DISTINCT ON (r.unit_id, r.report_type_id, ri.material_id)
            r.unit_id,
            r.report_type_id,
            ri.material_id,
            COALESCE(ri.reported_quantity, 0) AS quantity
    FROM    shoval.report_items ri
    JOIN    shoval.reports r ON r.id = ri.report_id
    WHERE   r.created_on = CURRENT_DATE
      AND   r.report_type_id IN (1, 2)     -- 1=מלאי, 2=שצ״ל
      AND   ri.status = 'ACTIVE'
    ORDER BY r.unit_id, r.report_type_id, ri.material_id, ri.reporting_level ASC
),

-- 6️⃣ For each non-leaf unit: sum ALL its leaf descendants' reports
leaf_sum AS (
    SELECT  ld.ancestor_id      AS unit_id,
            rpt.report_type_id,
            rpt.material_id,
            SUM(rpt.quantity)   AS aggregated_qty
    FROM    leaf_descendants ld
    JOIN    reported rpt ON rpt.unit_id = ld.descendant_id
    GROUP BY ld.ancestor_id, rpt.report_type_id, rpt.material_id
),

-- 7️⃣ Compare: what the unit itself reported vs the true leaf-level sum
comparison AS (
    SELECT  ls.unit_id,
            ls.report_type_id,
            ls.material_id,
            COALESCE(own.quantity, 0)                    AS own_reported_qty,
            ls.aggregated_qty                            AS leaf_aggregated_qty,
            COALESCE(own.quantity, 0) - ls.aggregated_qty AS difference
    FROM    leaf_sum ls
    LEFT JOIN reported own
           ON own.unit_id        = ls.unit_id
          AND own.report_type_id = ls.report_type_id
          AND own.material_id    = ls.material_id
)

-- 8️⃣ Show mismatches only, enriched with names
SELECT  c.unit_id,
        ui.description                              AS unit_name,
        ui.level_id                                 AS unit_level,
        CASE c.report_type_id
            WHEN 1 THEN 'מלאי'
            WHEN 2 THEN 'שצ״ל'
        END                                         AS report_type,
        c.material_id,
        m.description                               AS material_name,
        c.own_reported_qty,
        c.leaf_aggregated_qty,
        c.difference,
        CASE
            WHEN c.own_reported_qty = 0 THEN NULL
            ELSE ROUND(c.difference * 100.0 / c.own_reported_qty, 1)
        END                                         AS pct_diff
FROM    comparison c
LEFT JOIN unit_info ui ON ui.unit_id = c.unit_id
LEFT JOIN shoval.materials m ON m.id = c.material_id
WHERE   c.difference <> 0
ORDER BY ui.level_id ASC,           -- top-level mismatches first (level 0→1→2→3)
         ABS(c.difference) DESC,    -- worst gaps first within each level
         c.unit_id,
         c.material_id;
