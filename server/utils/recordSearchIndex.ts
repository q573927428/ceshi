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

const normalizeHeroes = (items: any[]) => {
  const heroes = new Map<string, { heroId: number; heroName: string; season: string; advanceNum: number }>()
  for (const item of items) {
    const heroId = Number(item?.hero_id)
    const heroName = String(item?.name || '').trim().slice(0, 100)
    const season = String(item?.season || '').trim().slice(0, 20)
    if (!Number.isInteger(heroId) || heroId <= 0 || !heroName) continue

    const advanceNum = Math.min(5, Math.max(0, Math.trunc(Number(item?.advance_num) || 0)))
    const key = `${heroId}:${season}`
    const existing = heroes.get(key)
    if (!existing || advanceNum > existing.advanceNum) {
      heroes.set(key, { heroId, heroName, season, advanceNum })
    }
  }
  return [...heroes.values()]
}

export const extractRecordSearchNames = (data: any) => ({
  heroes: normalizeHeroes(Array.isArray(data?.uniqueCards) ? data.uniqueCards : []),
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

const insertHeroes = async (
  connection: PoolConnection,
  recordId: number,
  heroes: ReturnType<typeof normalizeHeroes>,
) => {
  if (!heroes.length) return
  const placeholders = heroes.map(() => '(?, ?, ?, ?, ?)').join(', ')
  await connection.execute(
    `INSERT INTO record_heroes (record_id, hero_id, hero_name, season, advance_num) VALUES ${placeholders}`,
    heroes.flatMap((hero) => [recordId, hero.heroId, hero.heroName, hero.season, hero.advanceNum]),
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
  await insertHeroes(connection, recordId, names.heroes)
  await insertNames(connection, 'record_skills', 'skill_name', recordId, names.skills)
  await insertNames(connection, 'record_weapons', 'weapon_name', recordId, names.weapons)
}
