// scripts/migrate-cbg-session.mjs
// 创建 cbg_session 表，用于存储藏宝阁 Cookie（服务端自动续期）

import mysql from 'mysql2/promise'

const db = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '90d25ae1cec0a563',
  database: 'zangbao',
})

try {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cbg_session (
      id         TINYINT PRIMARY KEY DEFAULT 1,
      cookie     TEXT NOT NULL,
      status     VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_single_row CHECK (id = 1)
    )
  `)
  console.log('✅ cbg_session 表创建成功！')

  // 插入默认行（如果不存在）
  const [rows] = await db.execute(`SELECT id FROM cbg_session WHERE id = 1`)
  if (rows.length === 0) {
    await db.execute(`INSERT INTO cbg_session (id, cookie) VALUES (1, '')`)
    console.log('  已初始化默认会话行')
  }

  console.log('✅ 迁移完成！')
} catch (err) {
  console.error('迁移失败：', err)
  process.exit(1)
} finally {
  await db.end()
}