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
  ['record_heroes', 'hero_name', 'idx_record_heroes_name', 'fk_record_heroes_record'],
  ['record_skills', 'skill_name', 'idx_record_skills_name', 'fk_record_skills_record'],
  ['record_weapons', 'weapon_name', 'idx_record_weapons_name', 'fk_record_weapons_record'],
]

const normalizeNames = (items) => [...new Set(
  items
    .map((item) => String(item?.name || '').trim().slice(0, 100))
    .filter(Boolean)
)]

const extractNames = (rawData) => {
  let data = rawData
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { data = null }
  }
  return {
    record_heroes: normalizeNames(Array.isArray(data?.uniqueCards) ? data.uniqueCards : []),
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
    const rowsByTable = { record_heroes: [], record_skills: [], record_weapons: [] }
    for (const record of records) {
      const names = extractNames(record.data)
      for (const [table] of tableDefinitions) {
        rowsByTable[table].push(...names[table].map((name) => [Number(record.id), name]))
      }
    }

    await db.beginTransaction()
    try {
      const idPlaceholders = recordIds.map(() => '?').join(', ')
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
