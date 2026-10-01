export interface AuthUser { id: string; email: string; displayName: string }
export interface AuthSession { token: string; user: AuthUser }

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001/api'
const storageKey = 'daystack.auth'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({ message: 'Unable to reach the DayStack API.' })) as T & { message?: string }
  if (!response.ok) throw new Error(data.message ?? 'Something went wrong.')
  return data
}

export async function signIn(email: string, password: string) { return request<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }) }
export async function register(displayName: string, email: string, password: string) { return request<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify({ displayName, email, password }) }) }
export async function verifySession(token: string) { return request<{ user: AuthUser }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }) }
export function readSession(): AuthSession | null { try { const saved = localStorage.getItem(storageKey); return saved ? JSON.parse(saved) as AuthSession : null } catch { return null } }
export function saveSession(session: AuthSession) { localStorage.setItem(storageKey, JSON.stringify(session)) }
export function clearSession() { localStorage.removeItem(storageKey) }
