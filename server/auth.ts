import bcrypt from 'bcryptjs'
import { Router, type NextFunction, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db } from './db.js'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('JWT_SECRET is required. Copy .env.example to .env and configure it.')

const credentials = z.object({
  email: z.string().trim().email().max(255).transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(100).optional(),
})

type User = { id: string; email: string; display_name: string; password_hash: string }
const toPublicUser = (user: User) => ({ id: user.id, email: user.email, displayName: user.display_name })
const createToken = (user: User) => jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' })

export const authRouter = Router()
export type AuthenticatedRequest = Request & { userId: string }

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  try {
    const token = request.header('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return response.status(401).json({ message: 'Authentication is required.' })
    const claims = jwt.verify(token, jwtSecret!)
    if (typeof claims === 'string' || !claims.sub) return response.status(401).json({ message: 'Invalid token.' })
    ;(request as AuthenticatedRequest).userId = claims.sub
    return next()
  } catch { return response.status(401).json({ message: 'Your session is invalid or has expired.' }) }
}

authRouter.post('/register', async (request, response, next) => {
  try {
    const result = credentials.safeParse(request.body)
    if (!result.success || !result.data.displayName) return response.status(400).json({ message: 'Name, a valid email, and a password of at least 8 characters are required.' })
    const { email, password, displayName } = result.data
    const existing = await db.query<User>('SELECT id, email, display_name, password_hash FROM users WHERE email = $1', [email])
    if (existing.rowCount) return response.status(409).json({ message: 'An account already exists for this email.' })
    const userResult = await db.query<User>('INSERT INTO users (id, email, password_hash, display_name) VALUES ($1, $2, $3, $4) RETURNING id, email, display_name, password_hash', [randomUUID(), email, await bcrypt.hash(password, 12), displayName])
    const user = userResult.rows[0]
    return response.status(201).json({ token: createToken(user), user: toPublicUser(user) })
  } catch (error) { next(error) }
})

authRouter.post('/login', async (request, response, next) => {
  try {
    const result = credentials.pick({ email: true, password: true }).safeParse(request.body)
    if (!result.success) return response.status(400).json({ message: 'Enter a valid email and password.' })
    const userResult = await db.query<User>('SELECT id, email, display_name, password_hash FROM users WHERE email = $1', [result.data.email])
    const user = userResult.rows[0]
    if (!user || !(await bcrypt.compare(result.data.password, user.password_hash))) return response.status(401).json({ message: 'Email or password is incorrect.' })
    return response.json({ token: createToken(user), user: toPublicUser(user) })
  } catch (error) { next(error) }
})

authRouter.get('/me', async (request, response, next) => {
  try {
    const token = request.header('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return response.status(401).json({ message: 'Authentication is required.' })
    const claims = jwt.verify(token, jwtSecret)
    if (typeof claims === 'string' || !claims.sub) return response.status(401).json({ message: 'Invalid token.' })
    const userResult = await db.query<User>('SELECT id, email, display_name, password_hash FROM users WHERE id = $1', [claims.sub])
    const user = userResult.rows[0]
    if (!user) return response.status(401).json({ message: 'Account not found.' })
    return response.json({ user: toPublicUser(user) })
  } catch (error) { next(error) }
})
