import mysql from 'mysql2/promise'

const BATCH_SIZE = 100
const INSERT_CHUNK_SIZE = 2000

const db = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'zangbao',
  password: process.env.MYSQL_PASSWORD || 'zangbao2024',
  database: process.env.MYSQL_DATABASE || 'zangbao',
})

const tableDefinitions = [
  ['record_skills', 'skill_name', 'idx_record_skills_name', 'fk_record_skills_record'],
  ['record_weapons', 'weapon_name', 'idx_record_weapons_name', 'fk_record_weapons_record'],
]

const normalizeNames = (items) => [...new Set(
  items
    .map((item) => String(item?.name || '').trim().slice(0, 100))
    .filter(Boolean)
)]

const normalizeHeroes = (items) => {
  const heroes = new Map()
  for (const item of items) {
    const heroId = Number(item?.hero_id)
    const heroName = String(item?.name || '').trim().slice(0, 100)
    const season = String(item?.season || '').trim().slice(0, 20)
    if (!Number.isInteger(heroId) || heroId <= 0 || !heroName) continue

    const advanceNum = Math.min(5, Math.max(0, Math.trunc(Number(item?.advance_num) || 0)))
    const key = `${heroId}:${season}`
    const existing = heroes.get(key)
    if (!existing || advanceNum > existing.advanceNum) {
      heroes.set(key, [heroId, heroName, season, advanceNum])
    }
  }
  return [...heroes.values()]
}

const extractNames = (rawData) => {
  let data = rawData
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { data = null }
  }
  return {
    record_heroes: normalizeHeroes(Array.isArray(data?.uniqueCards) ? data.uniqueCards : []),
    record_skills: normalizeNames(Array.isArray(data?.skill) ? data.skill : []),
    record_weapons: normalizeNames([
      ...(Array.isArray(data?.redWeapons) ? data.redWeapons : []),
      ...(Array.isArray(data?.pinkWeapons) ? data.pinkWeapons : []),
      ...(Array.isArray(data?.blueWeapons) ? data.blueWeapons : []),
    ]),
  }
}

const insertRows = async (connection, table, column, rows) => {
  for (let start = 0; start < rows.length; start += INSERT_CHUNK_SIZE) {
    const chunk = rows.slice(start, start + INSERT_CHUNK_SIZE)
    if (!chunk.length) continue
    const placeholders = chunk.map(() => '(?, ?)').join(', ')
    await connection.execute(
      `INSERT INTO ${table} (record_id, ${column}) VALUES ${placeholders}`,
      chunk.flat(),
    )
  }
}

try {
  const [heroTables] = await db.query(`
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'record_heroes'
  `)
  const [advanceColumns] = await db.query(`
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'record_heroes' AND COLUMN_NAME = 'advance_num'
  `)
  if (heroTables.length && !advanceColumns.length) {
    // 旧表只有名称，属于可由 records.data 重建的派生数据。
    await db.execute('DROP TABLE record_heroes')
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS record_heroes (
      record_id INT NOT NULL,
      hero_id INT NOT NULL,
      hero_name VARCHAR(100) NOT NULL,
      season VARCHAR(20) NOT NULL DEFAULT '',
      advance_num TINYINT UNSIGNED NOT NULL DEFAULT 0,
      PRIMARY KEY (record_id, hero_id, season),
      INDEX idx_record_heroes_name_advance (hero_name, advance_num, record_id),
      INDEX idx_record_heroes_id_advance (hero_id, advance_num, record_id),
      CONSTRAINT fk_record_heroes_record FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  for (const [table, column, index, foreignKey] of tableDefinitions) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${table} (
        record_id INT NOT NULL,
        ${column} VARCHAR(100) NOT NULL,
        PRIMARY KEY (record_id, ${column}),
        INDEX ${index} (${column}, record_id),
        CONSTRAINT ${foreignKey} FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }

  let lastId = 0
  let migratedRecords = 0
  const totals = { record_heroes: 0, record_skills: 0, record_weapons: 0 }

  while (true) {
    const [records] = await db.execute(
      `SELECT id, data FROM records WHERE id > ? AND data IS NOT NULL ORDER BY id LIMIT ${BATCH_SIZE}`,
      [lastId],
    )
    if (!records.length) break

    const recordIds = records.map((record) => Number(record.id))
    const rowsByTable = { record_skills: [], record_weapons: [] }
    const heroRows = []
    for (const record of records) {
      const names = extractNames(record.data)
      heroRows.push(...names.record_heroes.map((hero) => [Number(record.id), ...hero]))
      for (const [table] of tableDefinitions) {
        rowsByTable[table].push(...names[table].map((name) => [Number(record.id), name]))
      }
    }

    await db.beginTransaction()
    try {
      const idPlaceholders = recordIds.map(() => '?').join(', ')
      await db.execute(`DELETE FROM record_heroes WHERE record_id IN (${idPlaceholders})`, recordIds)
      for (let start = 0; start < heroRows.length; start += INSERT_CHUNK_SIZE) {
        const chunk = heroRows.slice(start, start + INSERT_CHUNK_SIZE)
        const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(', ')
        await db.execute(
          `INSERT INTO record_heroes (record_id, hero_id, hero_name, season, advance_num) VALUES ${placeholders}`,
          chunk.flat(),
        )
      }
      totals.record_heroes += heroRows.length
      for (const [table, column] of tableDefinitions) {
        await db.execute(`DELETE FROM ${table} WHERE record_id IN (${idPlaceholders})`, recordIds)
        await insertRows(db, table, column, rowsByTable[table])
        totals[table] += rowsByTable[table].length
      }
      await db.commit()
    } catch (error) {
      await db.rollback()
      throw error
    }

    migratedRecords += records.length
    lastId = Number(records.at(-1).id)
    console.log(`已迁移 ${migratedRecords} 条账号记录`)
  }

  console.log('搜索索引迁移完成')
  console.log(`武将 ${totals.record_heroes} 条，技能 ${totals.record_skills} 条，武器 ${totals.record_weapons} 条`)
} finally {
  await db.end()
}
