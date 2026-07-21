export interface DBConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  waitForConnections: boolean
  connectionLimit: number
  queueLimit: number
  enableKeepAlive: boolean
  keepAliveInitialDelay: number
}

export const dbConfig: DBConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'zangbao',
  password: process.env.MYSQL_PASSWORD || 'zangbao2024',
  database: process.env.MYSQL_DATABASE || 'zangbao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}