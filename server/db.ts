import 'dotenv/config'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required. Copy .env.example to .env and configure PostgreSQL.')

export const db = new Pool({ connectionString: databaseUrl })
