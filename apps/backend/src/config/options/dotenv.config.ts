import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

const ENVIRONMENT = process.env.ENVIRONMENT || 'local'
const envFilePath = `.env.${ENVIRONMENT}`

if (fs.existsSync(path.resolve(process.cwd(), envFilePath))) {
  dotenv.config({
    path: envFilePath,
    override: true,
  })
}
