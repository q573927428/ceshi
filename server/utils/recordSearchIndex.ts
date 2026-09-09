import type { PoolConnection } from 'mysql2/promise'

type SearchIndexTable = 'record_heroes' | 'record_skills' | 'record_weapons'

const SEARCH_INDEX_TABLES: SearchIndexTable[] = [
  'record_heroes',
  'record_skills',
  'record_weapons',
]

const normalizeNames = (items: any[]): string[] => [...new Set(
  items
    .map((item) => String(item?.name || '').trim().slice(0, 100))
    .filter(Boolean)
)]

export const extractRecordSearchNames = (data: any) => ({
  heroes: normalizeNames(Array.isArray(data?.uniqueCards) ? data.uniqueCards : []),
  skills: normalizeNames(Array.isArray(data?.skill) ? data.skill : []),
  weapons: normalizeNames([
    ...(Array.isArray(data?.redWeapons) ? data.redWeapons : []),
    ...(Array.isArray(data?.pinkWeapons) ? data.pinkWeapons : []),
    ...(Array.isArray(data?.blueWeapons) ? data.blueWeapons : []),
  ]),
})

const insertNames = async (
  connection: PoolConnection,
  table: SearchIndexTable,
  column: string,
  recordId: number,
  names: string[],
) => {
  if (!names.length) return
  const placeholders = names.map(() => '(?, ?)').join(', ')
  await connection.execute(
    `INSERT INTO ${table} (record_id, ${column}) VALUES ${placeholders}`,
    names.flatMap((name) => [recordId, name]),
  )
}

export const syncRecordSearchIndex = async (
  connection: PoolConnection,
  recordId: number,
  data: any,
) => {
  for (const table of SEARCH_INDEX_TABLES) {
    await connection.execute(`DELETE FROM ${table} WHERE record_id = ?`, [recordId])
  }

  const names = extractRecordSearchNames(data)
  await insertNames(connection, 'record_heroes', 'hero_name', recordId, names.heroes)
  await insertNames(connection, 'record_skills', 'skill_name', recordId, names.skills)
  await insertNames(connection, 'record_weapons', 'weapon_name', recordId, names.weapons)
}
