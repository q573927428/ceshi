import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import formidable from 'formidable'

const writeFile = promisify(fs.writeFile)

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: true })

  const { files } = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })

  const dir = path.join(process.cwd(), 'public/rentimg')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const savedFiles = []

  const fileArray = Array.isArray(files.file) ? files.file : [files.file]

  for (const f of fileArray) {
    const filename = `${Date.now()}_${f.originalFilename}`
    const filePath = path.join(dir, filename)
    const data = fs.readFileSync(f.filepath)
    await writeFile(filePath, data)
    savedFiles.push(`/rentimg/${filename}`)
  }

  return { paths: savedFiles }
})
