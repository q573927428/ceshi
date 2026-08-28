import mysql from 'mysql2/promise'

const db = await mysql.createConnection({ host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER || 'zangbao', password: process.env.MYSQL_PASSWORD || 'zangbao2024', database: process.env.MYSQL_DATABASE || 'zangbao' })
await db.query(`UPDATE users u SET quota_limit = GREATEST(0, quota_limit - (SELECT COUNT(*) FROM records r WHERE r.user_id = u.id))`)
await db.end()
console.log('用户额度已转换为剩余金币')
