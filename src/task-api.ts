import { apiRequest } from './auth'
import type { StoredTask, TaskInput } from './types'

const headers = (token: string) => ({ Authorization: `Bearer ${token}` })

export async function fetchTasks(token: string) {
  return (await apiRequest<{ tasks: StoredTask[] }>('/tasks', { headers: headers(token) })).tasks
}

export async function createStoredTask(token: string, input: TaskInput) {
  return (await apiRequest<{ task: StoredTask }>('/tasks', { method: 'POST', headers: headers(token), body: JSON.stringify(input) })).task
}

export async function updateStoredTask(token: string, id: string, input: Partial<TaskInput> & { completed?: boolean }) {
  return (await apiRequest<{ task: StoredTask }>(`/tasks/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(input) })).task
}

export async function removeStoredTask(token: string, id: string) {
  await apiRequest<void>(`/tasks/${id}`, { method: 'DELETE', headers: headers(token) })
}
