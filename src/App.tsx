import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/auth-page'
import { Layout } from './components/layout'
import { apiRequest, clearSession, readSession, saveSession, verifySession, type AuthSession } from './auth'
import { BookmarksPage, initialBookmarks, initialNotes, initialReminders, initialVideos, NotesPage, RemindersPage, SettingsPage, VideosPage } from './pages'
import { TaskDashboard, StoredTasksPage } from './task-pages'
import { createStoredTask, fetchTasks, removeStoredTask, updateStoredTask } from './task-api'
import type { StoredTask, TaskInput } from './types'

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(readSession)
  const [checking, setChecking] = useState(Boolean(session))
  const [tasks, setTasks] = useState<StoredTask[]>([])
  const [videos, setVideos] = useState(initialVideos)
  const [notes, setNotes] = useState(initialNotes)
  const [reminders, setReminders] = useState(initialReminders)
  const [bookmarks, setBookmarks] = useState(initialBookmarks)

  useEffect(() => {
    if (!session) { setChecking(false); setTasks([]); return }
    verifySession(session.token)
      .then(({ user }) => setSession(current => current ? { ...current, user } : null))
      .catch(() => { clearSession(); setSession(null) })
      .finally(() => setChecking(false))
  }, [session?.token])

  useEffect(() => {
    if (!session) return
    fetchTasks(session.token).then(setTasks).catch(console.error)
  }, [session?.token])

  function authenticated(next: AuthSession) { saveSession(next); setSession(next) }
  function logout() { clearSession(); setSession(null) }
  async function createTask(input: TaskInput) { if (!session) return; const task = await createStoredTask(session.token, input); setTasks(current => [task, ...current]) }
  async function updateTask(id: string, changes: Partial<TaskInput> & { completed?: boolean }) { if (!session) return; const task = await updateStoredTask(session.token, id, changes); setTasks(current => current.map(item => item.id === id ? task : item)) }
  async function deleteTask(id: string) { if (!session) return; await removeStoredTask(session.token, id); setTasks(current => current.filter(item => item.id !== id)) }

  if (checking) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Checking your session…</div>
  if (!session) return <AuthPage onAuthenticated={authenticated}/>
  const taskActions = { tasks, onCreate: createTask, onUpdate: updateTask, onDelete: deleteTask }
  return <Layout userName={session.user.displayName} onLogout={logout}><Routes>
    <Route path="/" element={<TaskDashboard {...taskActions}/>}/>
    <Route path="/tasks" element={<StoredTasksPage {...taskActions}/>}/>
    <Route path="/videos" element={<VideosPage {...{videos,setVideos}}/>}/>
    <Route path="/notes" element={<NotesPage {...{notes,setNotes}}/>}/>
    <Route path="/reminders" element={<RemindersPage {...{reminders,setReminders}}/>}/>
    <Route path="/bookmarks" element={<BookmarksPage {...{bookmarks,setBookmarks}}/>}/>
    <Route path="/settings" element={<SettingsPage/>}/>
  </Routes></Layout>
}
