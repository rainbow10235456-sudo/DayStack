import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireAuth, type AuthenticatedRequest } from './auth.js'
import { db } from './db.js'

type TaskRow = { id: string; title: string; description: string; priority: 'High' | 'Medium' | 'Low'; category: 'Work' | 'Personal'; due_date: string; due_time: string | null; completed: boolean; created_at: Date; updated_at: Date }
const taskInput = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(''),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  category: z.enum(['Work', 'Personal']),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must use YYYY-MM-DD.'),
  dueTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Due time must use HH:MM.').nullable().optional(),
  completed: z.boolean().optional(),
})
const toTask = (row: TaskRow) => ({ id: row.id, title: row.title, description: row.description, priority: row.priority, category: row.category, dueDate: row.due_date, dueTime: row.due_time, completed: row.completed, createdAt: row.created_at, updatedAt: row.updated_at })

export const tasksRouter = Router()
tasksRouter.use(requireAuth)

tasksRouter.get('/', async (request, response, next) => {
  try {
    const userId = (request as AuthenticatedRequest).userId
    const result = await db.query<TaskRow>("SELECT id, title, description, priority, category, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, due_time, completed, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY due_date DESC, due_time ASC NULLS LAST, created_at DESC", [userId])
    response.json({ tasks: result.rows.map(toTask) })
  } catch (error) { next(error) }
})

tasksRouter.post('/', async (request, response, next) => {
  try {
    const parsed = taskInput.safeParse(request.body)
    if (!parsed.success) return response.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid task.' })
    const task = parsed.data; const userId = (request as unknown as AuthenticatedRequest).userId
    const result = await db.query<TaskRow>("INSERT INTO tasks (id, user_id, title, description, priority, category, due_date, due_time, completed) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, title, description, priority, category, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, due_time, completed, created_at, updated_at", [randomUUID(), userId, task.title, task.description, task.priority, task.category, task.dueDate, task.dueTime ?? null, task.completed ?? false])
    response.status(201).json({ task: toTask(result.rows[0]) })
  } catch (error) { next(error) }
})

tasksRouter.patch('/:id', async (request, response, next) => {
  try {
    const parsed = taskInput.partial().safeParse(request.body)
    if (!parsed.success || Object.keys(parsed.data).length === 0) return response.status(400).json({ message: 'Provide at least one valid task field.' })
    const task = parsed.data; const userId = (request as unknown as AuthenticatedRequest).userId
    const result = await db.query<TaskRow>("UPDATE tasks SET title = COALESCE($1,title), description = COALESCE($2,description), priority = COALESCE($3,priority), category = COALESCE($4,category), due_date = COALESCE($5,due_date), due_time = COALESCE($6,due_time), completed = COALESCE($7,completed), updated_at = NOW() WHERE id = $8 AND user_id = $9 RETURNING id, title, description, priority, category, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, due_time, completed, created_at, updated_at", [task.title ?? null, task.description ?? null, task.priority ?? null, task.category ?? null, task.dueDate ?? null, task.dueTime ?? null, task.completed ?? null, request.params.id, userId])
    if (!result.rowCount) return response.status(404).json({ message: 'Task not found.' })
    response.json({ task: toTask(result.rows[0]) })
  } catch (error) { next(error) }
})

tasksRouter.delete('/:id', async (request, response, next) => {
  try {
    const userId = (request as unknown as AuthenticatedRequest).userId
    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [request.params.id, userId])
    if (!result.rowCount) return response.status(404).json({ message: 'Task not found.' })
    response.status(204).send()
  } catch (error) { next(error) }
})
