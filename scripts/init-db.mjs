import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '90d25ae1cec0a563',
})

// 创建数据库（execute 不支持 CREATE DATABASE，用 query）
await connection.query(
  `CREATE DATABASE IF NOT EXISTS zangbao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
)
await connection.end()

// 重新连接，指定数据库
const db = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '90d25ae1cec0a563',
  database: 'zangbao',
})

// 创建用户
await db.query(
  `CREATE USER IF NOT EXISTS 'zangbao'@'localhost' IDENTIFIED BY 'zangbao2024'`
)
await db.query(
  `GRANT ALL PRIVILEGES ON zangbao.* TO 'zangbao'@'localhost'`
)
await db.query(`FLUSH PRIVILEGES`)

// 创建 records 表
await db.execute(`
  CREATE TABLE IF NOT EXISTS records (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT DEFAULT NULL,
    link           VARCHAR(100) NOT NULL,
    timestamp      BIGINT NOT NULL,
    is_favorite    TINYINT(1) DEFAULT 0,
    equip_price    DECIMAL(10,2) DEFAULT NULL,
    estimated_price DECIMAL(10,2) DEFAULT NULL,
    status_desc    VARCHAR(255) DEFAULT '',
    remark         TEXT DEFAULT NULL,
    data           JSON DEFAULT NULL,
    raw_json       JSON DEFAULT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_link (link),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id),
    INDEX idx_status_desc (status_desc),
    INDEX idx_equip_price (equip_price),
    INDEX idx_is_favorite (is_favorite)
  )
`)

// 创建 users 表
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname      VARCHAR(100) DEFAULT '',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`)

console.log('✅ 数据库和表创建成功！')
console.log('  数据库: zangbao')
console.log('  用户名: zangbao')
console.log('  密码: zangbao2024')

await db.end()