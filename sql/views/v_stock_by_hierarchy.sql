-- =====================================================================
-- Function: shoval.get_latest_stock(p_root_unit_id)
--
-- Gets the latest stock (by date) for each (material, unit, stock_type, grade)
-- for all units in the subtree of the given root unit.
--
-- Parameters:
--   p_root_unit_id - root of the hierarchy to fetch stock for (e.g. 2777)
-- =====================================================================

DROP FUNCTION IF EXISTS shoval.get_latest_stock(integer);
DROP VIEW IF EXISTS shoval.v_latest_stock;
DROP VIEW IF EXISTS shoval.v_stock_by_hierarchy;

CREATE OR REPLACE FUNCTION shoval.get_latest_stock(p_root_unit_id integer)
RETURNS TABLE (
    material_id  character varying,
    unit_id      integer,
    stock_type   integer,
    grade        character varying,
    quantity     numeric
)
LANGUAGE sql STABLE
AS $$
WITH RECURSIVE
active_relations AS (
    SELECT  ur.unit_id         AS parent_id,
            ur.related_unit_id AS child_id
    FROM    shoval.units_relations ur
    WHERE   ur.start_date <= CURRENT_DATE
      AND   ur.end_date   >  CURRENT_DATE
),
subtree AS (
    SELECT  p_root_unit_id AS unit_id

    UNION ALL

    SELECT  ar.child_id
    FROM    subtree s
    JOIN    active_relations ar ON ar.parent_id = s.unit_id
)
SELECT  s.material_id,
        s.unit_id,
        s.stock_type,
        s.grade,
        s.quantity
FROM    shoval.stocks s
JOIN    subtree st ON st.unit_id = s.unit_id
WHERE   s.date = (
            SELECT MAX(s2.date)
            FROM   shoval.stocks s2
            WHERE  s2.material_id = s.material_id
              AND  s2.unit_id     = s.unit_id
              AND  s2.stock_type  = s.stock_type
              AND  s2.grade       = s.grade
        );
$$;

-- =====================================================================
-- View: shoval.v_latest_stock_martach
-- Latest stock for all units under Martach (2777)
-- =====================================================================
CREATE OR REPLACE VIEW shoval.v_latest_stock_martach AS
SELECT * FROM shoval.get_latest_stock(2777);

-- =====================================================================
-- Function: shoval.get_stock_by_hierarchy(p_root_unit_id)
--
-- Aggregates latest stock by the immediate children of the root unit,
-- grouping grades into display buckets.
-- =====================================================================

DROP FUNCTION IF EXISTS shoval.get_stock_by_hierarchy(integer);

CREATE OR REPLACE FUNCTION shoval.get_stock_by_hierarchy(p_root_unit_id integer)
RETURNS TABLE (
    root_unit_id          integer,
    root_unit_description character varying,
    material_id           character varying,
    category_id           character varying,
    category_description  character varying,
    grade_group           text,
    quantity              numeric,
    total_quantity        numeric
)
LANGUAGE sql STABLE
AS $$
WITH RECURSIVE
active_relations AS (
    SELECT  ur.unit_id         AS parent_id,
            ur.related_unit_id AS child_id
    FROM    shoval.units_relations ur
    WHERE   ur.start_date <= CURRENT_DATE
      AND   ur.end_date   >  CURRENT_DATE
),

-- Direct children of root, then recursively walk down keeping root_child_id
descendants AS (
    SELECT  ar.child_id AS root_child_id,
            ar.child_id AS descendant_id
    FROM    active_relations ar
    WHERE   ar.parent_id = p_root_unit_id

    UNION ALL

    SELECT  d.root_child_id,
            ar.child_id AS descendant_id
    FROM    descendants d
    JOIN    active_relations ar ON ar.parent_id = d.descendant_id
),

-- Include root itself
all_units AS (
    SELECT  p_root_unit_id AS root_child_id, p_root_unit_id AS descendant_id
    UNION ALL
    SELECT  root_child_id, descendant_id FROM descendants
),

unit_desc AS (
    SELECT DISTINCT ON (u.unit_id)
            u.unit_id,
            u.description
    FROM    shoval.units u
    WHERE   u.start_date <= CURRENT_DATE
      AND   u.end_date   >  CURRENT_DATE
      AND   u.object_type = 'O'
    ORDER   BY u.unit_id, u.start_date DESC
),

-- Get latest stock via the function
latest AS (
    SELECT * FROM shoval.get_latest_stock(p_root_unit_id)
),

-- Join stock with hierarchy grouping
stock_with_hierarchy AS (
    SELECT  au.root_child_id,
            ls.material_id,
            ls.stock_type,
            ls.grade,
            ls.quantity
    FROM    all_units au
    JOIN    latest ls ON ls.unit_id = au.descendant_id
),

stock_graded AS (
    SELECT  root_child_id,
            material_id,
            CASE
                WHEN stock_type = 1 THEN 'Ashrot'
                WHEN grade IN ('00','01','02','04') THEN '0, 1, 2, 4'
                WHEN grade = '03' THEN '3'
                WHEN grade = '05' THEN '5'
                WHEN grade IN ('06','07','08','09') THEN '6, 7, 8, 9'
                ELSE 'Other'
            END AS grade_group,
            COALESCE(quantity, 0) AS qty
    FROM    stock_with_hierarchy
),

aggregated AS (
    SELECT  sg.root_child_id,
            ud.description                              AS root_unit_description,
            sg.material_id,
            mc.main_category                            AS category_id,
            mainc.description                           AS category_description,
            sg.grade_group,
            SUM(sg.qty)                                 AS quantity
    FROM    stock_graded sg
    LEFT JOIN unit_desc ud ON ud.unit_id = sg.root_child_id
    LEFT JOIN shoval.material_categories mc ON mc.material_id = sg.material_id
    LEFT JOIN shoval.main_categories mainc ON mainc.id = mc.main_category
    GROUP BY sg.root_child_id, ud.description, sg.material_id, mc.main_category, mainc.description, sg.grade_group
)

SELECT  a.root_child_id                             AS root_unit_id,
        a.root_unit_description,
        a.material_id,
        a.category_id,
        a.category_description,
        a.grade_group,
        a.quantity,
        SUM(a.quantity) FILTER (WHERE a.grade_group <> 'Ashrot')
            OVER (PARTITION BY a.root_child_id, a.material_id)
                                                    AS total_quantity
FROM    aggregated a
ORDER BY a.root_child_id, a.material_id, a.grade_group;
$$;

-- =====================================================================
-- View: shoval.v_stock_by_hierarchy_martach
-- Stock aggregated by hierarchy under Martach (2777)
-- =====================================================================
CREATE OR REPLACE VIEW shoval.v_stock_by_hierarchy_martach AS
SELECT * FROM shoval.get_stock_by_hierarchy(2777);
