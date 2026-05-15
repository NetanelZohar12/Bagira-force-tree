import { pool } from "../db";
import type { ForceNode, ForcePathItem, ForceSearchResult } from "../types";

type ForceNodeRow = {
  id: string;
  parent_id: string | null;
  name: string | null;
  force_type: string | null;
  has_children: boolean;
};

type SearchRow = {
  id: string;
  name: string | null;
  force_type: string | null;
  path: ForcePathItem[];
};

function mapNode(row: ForceNodeRow): ForceNode {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    forceType: row.force_type,
    hasChildren: row.has_children,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function getRootForces(): Promise<ForceNode[]> {
  const result = await pool.query<ForceNodeRow>(
    `
    SELECT
      f.id::text AS id,
      f.parent_id::text AS parent_id,
      f.name,
      f.force_type,
      EXISTS (
        SELECT 1
        FROM public.forces child
        WHERE child.parent_id = f.id
          AND child.is_deleted = false
      ) AS has_children
    FROM public.forces f
    WHERE f.parent_id IS NULL
      AND f.is_deleted = false
    ORDER BY lower(f.name), f.id
    `,
  );

  return result.rows.map(mapNode);
}

export async function getChildren(parentId: string): Promise<ForceNode[]> {
  const result = await pool.query<ForceNodeRow>(
    `
    SELECT
      f.id::text AS id,
      f.parent_id::text AS parent_id,
      f.name,
      f.force_type,
      EXISTS (
        SELECT 1
        FROM public.forces child
        WHERE child.parent_id = f.id
          AND child.is_deleted = false
      ) AS has_children
    FROM public.forces f
    WHERE f.parent_id = $1::numeric
      AND f.is_deleted = false
    ORDER BY lower(f.name), f.id
    `,
    [parentId],
  );

  return result.rows.map(mapNode);
}

export async function searchForces(
  query: string,
  limit: number,
): Promise<ForceSearchResult[]> {
  const pattern = `%${escapeLike(query)}%`;

  const result = await pool.query<SearchRow>(
    `
    WITH RECURSIVE matched AS (
      SELECT
        f.id,
        f.parent_id,
        f.name,
        f.force_type
      FROM public.forces f
      WHERE f.is_deleted = false
        AND (
          f.name ILIKE $1 ESCAPE '\\'
          OR f.force_type ILIKE $1 ESCAPE '\\'
        )
      ORDER BY lower(f.name), f.id
      LIMIT $2
    ),
    ancestors AS (
      SELECT
        m.id AS target_id,
        m.id,
        m.parent_id,
        m.name,
        m.force_type,
        0 AS depth,
        ARRAY[m.id::text] AS visited
      FROM matched m

      UNION ALL

      SELECT
        a.target_id,
        parent.id,
        parent.parent_id,
        parent.name,
        parent.force_type,
        a.depth + 1,
        a.visited || parent.id::text
      FROM ancestors a
      JOIN public.forces parent ON parent.id = a.parent_id
      WHERE parent.is_deleted = false
        AND NOT parent.id::text = ANY(a.visited)
    )
    SELECT
      m.id::text AS id,
      m.name,
      m.force_type,
      jsonb_agg(
        jsonb_build_object(
          'id', a.id::text,
          'name', a.name,
          'forceType', a.force_type
        )
        ORDER BY a.depth DESC
      ) AS path
    FROM matched m
    JOIN ancestors a ON a.target_id = m.id
    GROUP BY m.id, m.name, m.force_type
    ORDER BY lower(m.name), m.id
    `,
    [pattern, limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    forceType: row.force_type,
    path: row.path,
  }));
}
