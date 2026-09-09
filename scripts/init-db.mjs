import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'zangbao2024',
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
  password: 'zangbao2024',
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
    user_price    DECIMAL(10,2) DEFAULT NULL,
    estimated_price DECIMAL(10,2) DEFAULT NULL,
    status_desc    VARCHAR(255) DEFAULT '',
    remark         TEXT DEFAULT NULL,
    user_remark    TEXT DEFAULT NULL,
    data           JSON DEFAULT NULL,
    raw_json       JSON DEFAULT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_link (user_id, link),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id),
    INDEX idx_status_desc (status_desc),
    INDEX idx_equip_price (equip_price),
    INDEX idx_is_favorite (is_favorite)
  )
`)

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

await db.execute(`
  CREATE TABLE IF NOT EXISTS record_skills (
    record_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (record_id, skill_name),
    INDEX idx_record_skills_name (skill_name, record_id),
    CONSTRAINT fk_record_skills_record FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS record_weapons (
    record_id INT NOT NULL,
    weapon_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (record_id, weapon_name),
    INDEX idx_record_weapons_name (weapon_name, record_id),
    CONSTRAINT fk_record_weapons_record FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`)

// 创建 users 表
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    phone         VARCHAR(20) DEFAULT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname      VARCHAR(100) DEFAULT '',
    plan          VARCHAR(20) NOT NULL DEFAULT 'free',
    quota_limit   INT NOT NULL DEFAULT 2,
    plan_expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS payment_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(40) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    plan VARCHAR(20) NOT NULL,
    quota_increment INT NOT NULL,
    amount_fen INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_payment_user (user_id),
    INDEX idx_payment_status (status)
  )
`)

console.log('✅ 数据库和表创建成功！')
console.log('  数据库: zangbao')
console.log('  用户名: zangbao')
console.log('  密码: zangbao2024')

await db.end()
