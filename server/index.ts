import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { authRouter } from './auth.js'
import { tasksRouter } from './tasks.js'

const app = express()
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173').split(',')
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '32kb' }))
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/tasks', tasksRouter)
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  response.status(500).json({ message: 'Something went wrong. Please try again.' })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => console.log(`DayStack API listening at http://localhost:${port}`))
