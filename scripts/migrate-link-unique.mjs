// scripts/migrate-link-unique.mjs
// 将 records 表的唯一约束从 (user_id, link) 改为 (link) 单独唯一
// 并清理重复记录

import mysql from 'mysql2/promise'

const db = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'zangbao',
})

try {
  // 1. 查找所有重复的 link
  const [duplicates] = await db.query(`
    SELECT link, COUNT(*) as cnt
    FROM records
    GROUP BY link
    HAVING cnt > 1
  `)

  if (duplicates.length > 0) {
    console.log(`发现 ${duplicates.length} 个重复 link，正在清理...`)
    
    // 对于每个重复的 link，只保留 id 最大的那条记录
    for (const dup of duplicates) {
      const [rows] = await db.query(`
        SELECT id FROM records WHERE link = ? ORDER BY id DESC
      `, [dup.link])
      
      // 保留第一条（id最大的），删除其余
      const keepId = rows[0].id
      const deleteIds = rows.slice(1).map((r) => r.id)
      
      if (deleteIds.length > 0) {
        await db.execute(`DELETE FROM records WHERE id IN (${deleteIds.map(() => '?').join(',')})`, deleteIds)
        console.log(`  清理 link="${dup.link}"，保留 id=${keepId}，删除 ${deleteIds.length} 条`)
      }
    }
  } else {
    console.log('没有发现重复 link')
  }

  // 2. 删除旧的唯一约束
  try {
    await db.execute(`ALTER TABLE records DROP INDEX uk_user_link`)
    console.log('已删除旧唯一约束 uk_user_link')
  } catch (e) {
    // 索引可能不存在
    console.log('uk_user_link 索引不存在，跳过删除')
  }

  // 3. 添加新的唯一约束（link 单独唯一）
  try {
    await db.execute(`ALTER TABLE records ADD UNIQUE INDEX uk_link (link)`)
    console.log('已添加新唯一约束 uk_link (link)')
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      console.error('仍有重复数据，请检查后重试')
      process.exit(1)
    }
    // 索引可能已存在
    console.log('uk_link 索引可能已存在，跳过添加')
  }

  // 4. 修改 link 列长度
  try {
    await db.execute(`ALTER TABLE records MODIFY COLUMN link VARCHAR(100) NOT NULL`)
    console.log('已修改 link 列长度为 VARCHAR(100)')
  } catch (e) {
    console.log('修改列长度失败，可能已修改，跳过')
  }

  console.log('✅ 迁移完成！')
} catch (err) {
  console.error('迁移失败：', err)
  process.exit(1)
} finally {
  await db.end()
}