import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
export const rootDirectory = path.resolve(__filename, '../..')
