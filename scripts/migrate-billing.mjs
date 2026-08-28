import mysql from 'mysql2/promise'
const db = await mysql.createConnection({ host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER || 'zangbao', password: process.env.MYSQL_PASSWORD || 'zangbao2024', database: process.env.MYSQL_DATABASE || 'zangbao' })
const [cols] = await db.query('SHOW COLUMNS FROM users'); if (!cols.some(c => c.Field === 'phone')) await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL UNIQUE')
if (!cols.some(c => c.Field === 'plan_expires_at')) await db.query('ALTER TABLE users ADD COLUMN plan_expires_at TIMESTAMP NULL DEFAULT NULL')
await db.query(`CREATE TABLE IF NOT EXISTS payment_orders (id INT AUTO_INCREMENT PRIMARY KEY, order_no VARCHAR(40) NOT NULL UNIQUE, user_id INT NOT NULL, plan VARCHAR(20) NOT NULL, quota_increment INT NOT NULL, amount_fen INT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending', transaction_id VARCHAR(64) DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, paid_at TIMESTAMP NULL DEFAULT NULL, INDEX idx_payment_user (user_id))`)
await db.end(); console.log('billing migration complete')
