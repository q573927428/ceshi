// 为已有 records 表增加用户自定义价格字段。
import mysql from 'mysql2/promise'

const db = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'zangbao',
  password: process.env.MYSQL_PASSWORD || 'zangbao2024',
  database: process.env.MYSQL_DATABASE || 'zangbao',
})

try {
  try {
    await db.execute('ALTER TABLE records ADD COLUMN user_price DECIMAL(10,2) DEFAULT NULL AFTER equip_price')
    console.log('已添加 user_price 字段')
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') console.log('user_price 字段已存在，跳过')
    else throw error
  }
  try {
    await db.execute('ALTER TABLE records ADD COLUMN user_remark TEXT DEFAULT NULL AFTER remark')
    console.log('已添加 user_remark 字段')
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') console.log('user_remark 字段已存在，跳过')
    else throw error
  }
} finally {
  await db.end()
}
