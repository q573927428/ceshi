import mysql from 'mysql2/promise'
// 默认使用应用运行账号；如部署环境不同，请通过 MYSQL_* 环境变量覆盖。
const db = await mysql.createConnection({ host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER || 'zangbao', password: process.env.MYSQL_PASSWORD || 'zangbao2024', database: process.env.MYSQL_DATABASE || 'zangbao' })
const [columns] = await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'")
const existingColumns = new Set(columns.map((c) => c.COLUMN_NAME))
if (!existingColumns.has('plan')) await db.query("ALTER TABLE users ADD COLUMN plan VARCHAR(20) NOT NULL DEFAULT 'free'")
if (!existingColumns.has('quota_limit')) await db.query("ALTER TABLE users ADD COLUMN quota_limit INT NOT NULL DEFAULT 2")
try { await db.query('ALTER TABLE records DROP INDEX uk_link') } catch {}
try { await db.query('ALTER TABLE records ADD UNIQUE KEY uk_user_link (user_id, link)') } catch {}
// 将用户系统上线前的历史记录归属到最早创建的账号（单用户迁移场景）。
const [owners] = await db.query('SELECT id FROM users ORDER BY id ASC LIMIT 1')
if (owners.length) {
  await db.query('UPDATE records SET user_id = ? WHERE user_id IS NULL', [owners[0].id])
}
await db.end()
console.log('用户额度字段与用户链接唯一索引迁移完成')
