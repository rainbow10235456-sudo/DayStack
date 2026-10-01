import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BellRing, CalendarDays, Check, Clock3, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button, EmptyState, Modal } from './components/common'
import type { StoredTask, TaskInput } from './types'

type Actions = { tasks: StoredTask[]; onCreate: (task: TaskInput) => Promise<void>; onUpdate: (id: string, changes: Partial<TaskInput> & { completed?: boolean }) => Promise<void>; onDelete: (id: string) => Promise<void> }
const localDate = (value: Date) => `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`
const todayKey = () => localDate(new Date())
const dayName = (date: string) => { const today=new Date(`${todayKey()}T00:00:00`); const value=new Date(`${date}T00:00:00`); const delta=Math.round((value.getTime()-today.getTime())/86400000); if(delta===0)return'Today';if(delta===-1)return'Yesterday';if(delta===1)return'Tomorrow';return value.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) }
const timeName = (time: string|null) => time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : 'Any time'

function TaskRow({task,onEdit,onUpdate,onDelete,alwaysShowActions=false}:{task:StoredTask;onEdit:()=>void;onUpdate:Actions['onUpdate'];onDelete:Actions['onDelete'];alwaysShowActions?:boolean}){return <article className={`group flex gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 ${task.completed?'opacity-60':''}`}><button aria-label="Toggle task" onClick={()=>void onUpdate(task.id,{completed:!task.completed})} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${task.completed?'border-indigo-600 bg-indigo-600 text-white':'border-slate-300'}`}>{task.completed&&<Check className="h-3.5 w-3.5"/>}</button><div className="min-w-0 flex-1"><h3 className={`font-semibold ${task.completed?'line-through':''}`}>{task.title}</h3>{task.description&&<p className="mt-1 truncate text-sm text-slate-500">{task.description}</p>}<div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="badge bg-slate-100 text-slate-600">{task.category}</span><span className="inline-flex items-center gap-1 text-slate-500"><Clock3 className="h-3.5 w-3.5"/>{timeName(task.dueTime)}</span></div></div><div className={`flex opacity-100 ${alwaysShowActions?'':'sm:opacity-0 sm:group-hover:opacity-100'}`}><button className="icon-btn h-8 w-8" onClick={onEdit} aria-label="Edit task"><Pencil className="h-4 w-4"/></button><button className="icon-btn h-8 w-8 hover:text-rose-600" onClick={()=>{if(confirm(`Delete “${task.title}”?`))void onDelete(task.id)}} aria-label="Delete task"><Trash2 className="h-4 w-4"/></button></div></article>}

function TaskEditor({task,defaultDueDate,onClose,onSave}:{task?:StoredTask;defaultDueDate?:string;onClose:()=>void;onSave:(input:TaskInput)=>Promise<void>}){const[title,setTitle]=useState(task?.title??'');const[description,setDescription]=useState(task?.description??'');const[priority,setPriority]=useState<StoredTask['priority']>(task?.priority??'Medium');const[category,setCategory]=useState<StoredTask['category']>(task?.category??'Personal');const[dueDate,setDueDate]=useState(task?.dueDate??defaultDueDate??todayKey());const[dueTime,setDueTime]=useState(task?.dueTime?.slice(0,5)??'17:00');const[saving,setSaving]=useState(false);return <Modal title={task?'Edit task':'Create task'} onClose={onClose}><form className="space-y-4" onSubmit={async e=>{e.preventDefault();setSaving(true);try{await onSave({title,description,priority,category,dueDate,dueTime})}finally{setSaving(false)}}}><input autoFocus className="field" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" required/><textarea className="field" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description"/><div className="grid grid-cols-2 gap-3"><select className="field" value={priority} onChange={e=>setPriority(e.target.value as StoredTask['priority'])}><option>High</option><option>Medium</option><option>Low</option></select><select className="field" value={category} onChange={e=>setCategory(e.target.value as StoredTask['category'])}><option>Work</option><option>Personal</option></select></div><div className="grid grid-cols-2 gap-3"><input className="field" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} required/><input className="field" type="time" value={dueTime} onChange={e=>setDueTime(e.target.value)}/></div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">{saving?'Saving…':'Save task'}</Button></div></form></Modal>}

function MissingToday({onYes}:{onYes:()=>void}){const[dismissed,setDismissed]=useState(false);if(dismissed)return null;return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex sm:items-center sm:justify-between"><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><CalendarDays className="h-5 w-5"/></span><div><h2 className="font-bold text-amber-950">You don’t have any tasks for today.</h2><p className="mt-1 text-sm text-amber-800">Would you like to create one now?</p></div></div><div className="mt-4 flex gap-2 sm:mt-0"><Button variant="secondary" onClick={()=>setDismissed(true)}>Not now</Button><Button onClick={onYes}>Yes, create a task</Button></div></section>}

function TaskList({tasks,actions,onEdit,alwaysShowActions=false}:{tasks:StoredTask[];actions:Actions;onEdit:(task:StoredTask)=>void;alwaysShowActions?:boolean}){return tasks.length?<div className="card divide-y divide-slate-100 p-2">{tasks.map(task=><TaskRow key={task.id} task={task} onEdit={()=>onEdit(task)} onUpdate={actions.onUpdate} onDelete={actions.onDelete} alwaysShowActions={alwaysShowActions}/>)}</div>:<EmptyState>No tasks here yet.</EmptyState>}

function TaskStat({label,value,detail,tone}:{label:string;value:number;detail:string;tone:string}){return <article className="card p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${tone}`}/></div><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></article>}

function DesktopTaskReminders({tasks}:{tasks:StoredTask[]}) {
  const supported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState<NotificationPermission>(supported ? Notification.permission : 'denied')
  const [enabled, setEnabled] = useState(() => localStorage.getItem('daystack.reminders.enabled') === 'true')
  const [cycle, setCycle] = useState(() => Number(localStorage.getItem('daystack.reminders.cycle') ?? 60_000))
  const [duration, setDuration] = useState(() => Number(localStorage.getItem('daystack.reminders.duration') ?? 4_000))
  const [alertVisible, setAlertVisible] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const alertTimerRef = useRef<number | null>(null)
  const incomplete = tasks.filter(task => !task.completed && task.dueDate === todayKey())
  const taskSignature = incomplete.map(task => `${task.id}:${task.completed}:${task.title}`).join('|')

  function prepareAudio() {
    const audio = audioContextRef.current ?? new AudioContext()
    audioContextRef.current = audio
    if (audio.state === 'suspended') void audio.resume()
  }

  function playChime() {
    prepareAudio()
    const audio = audioContextRef.current
    if (!audio) return
    const start = audio.currentTime
    const gain = audio.createGain()
    const oscillator = audio.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(659.25, start)
    oscillator.frequency.setValueAtTime(880, start + 0.16)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55)
    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.56)
  }

  useEffect(() => {
    localStorage.setItem('daystack.reminders.enabled', String(enabled))
    localStorage.setItem('daystack.reminders.cycle', String(cycle))
    localStorage.setItem('daystack.reminders.duration', String(duration))
  }, [enabled, cycle, duration])

  useEffect(() => {
    if (!enabled) return
    const unlockSound = () => prepareAudio()
    window.addEventListener('pointerdown', unlockSound, { once: true })
    window.addEventListener('keydown', unlockSound, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockSound)
      window.removeEventListener('keydown', unlockSound)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || permission !== 'granted' || incomplete.length === 0) return
    const notify = () => {
      const preview = incomplete.slice(0, 3).map(task => `• ${task.title}`).join('\n')
      const extra = incomplete.length > 3 ? `\n…and ${incomplete.length - 3} more` : ''
      setAlertVisible(true)
      playChime()
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current)
      alertTimerRef.current = window.setTimeout(() => setAlertVisible(false), duration)
      const notification = new Notification(`${incomplete.length} task${incomplete.length === 1 ? '' : 's'} still to do`, {
        body: `${preview}${extra}`,
        icon: '/daystack-icon.svg',
        badge: '/daystack-icon.svg',
        tag: 'daystack-incomplete-tasks',
      })
      window.setTimeout(() => notification.close(), duration)
    }
    const timer = window.setInterval(notify, cycle)
    return () => {
      window.clearInterval(timer)
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current)
    }
  }, [enabled, permission, cycle, duration, taskSignature])

  async function changeEnabled(value: boolean) {
    if (!value) { setEnabled(false); return }
    if (!supported) return
    const nextPermission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    setPermission(nextPermission)
    setEnabled(nextPermission === 'granted')
    if (nextPermission === 'granted') prepareAudio()
  }

  return <>
    <section className="card p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-sm font-bold">Desktop task reminders</h2><p className="mt-1 text-xs text-slate-500">{!supported ? 'Desktop notifications are not supported in this browser.' : permission === 'denied' ? 'Notifications are blocked. Enable them in your browser’s site settings.' : enabled ? incomplete.length ? `Watching ${incomplete.length} unfinished task${incomplete.length === 1 ? '' : 's'}.` : 'Enabled — there are no unfinished tasks.' : 'Enable native desktop alerts for unfinished tasks.'}</p></div><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-medium text-slate-500">Status<select className="field mt-1 min-w-28" value={enabled ? 'enabled' : 'disabled'} onChange={e => void changeEnabled(e.target.value === 'enabled')} disabled={!supported}><option value="disabled">Disabled</option><option value="enabled">Enabled</option></select></label>{enabled && <><label className="text-xs font-medium text-slate-500">Repeat every<select className="field mt-1 min-w-28" value={cycle} onChange={e => setCycle(Number(e.target.value))}><option value={30_000}>30 seconds</option><option value={60_000}>1 minute</option><option value={1_800_000}>30 minutes</option><option value={3_600_000}>1 hour</option></select></label><label className="text-xs font-medium text-slate-500">Show for<select className="field mt-1 min-w-24" value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={5_000}>5 seconds</option><option value={10_000}>10 seconds</option><option value={20_000}>20 seconds</option></select></label></>}</div></div></section>
    {alertVisible && <aside className="reminder-alert fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-3xl border border-indigo-300 bg-slate-950 p-6 text-white shadow-2xl sm:right-7 sm:top-7 sm:p-7" role="alert" aria-live="assertive">
      <button className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={() => setAlertVisible(false)} aria-label="Dismiss reminder"><X className="h-5 w-5"/></button>
      <div className="flex items-start gap-4 pr-8"><span className="reminder-bell grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/40"><BellRing className="h-8 w-8"/></span><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">DayStack reminder</p><h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">You still have {incomplete.length} task{incomplete.length === 1 ? '' : 's'} to complete</h2></div></div>
      <ul className="mt-5 space-y-2 rounded-2xl bg-white/10 p-4 text-base font-medium sm:text-lg">{incomplete.slice(0, 3).map(task => <li className="flex items-center gap-3" key={task.id}><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400"/><span className="truncate">{task.title}</span></li>)}{incomplete.length > 3 && <li className="pl-5 text-sm text-indigo-200">And {incomplete.length - 3} more...</li>}</ul>
      <div className="reminder-shimmer absolute inset-x-0 bottom-0 h-1.5 bg-indigo-500"/>
    </aside>}
  </>
}

export function TaskDashboard(actions:Actions){const[editor,setEditor]=useState<StoredTask|'new'|'upcoming'|null>(null);const todayKeyValue=todayKey();const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);const today=actions.tasks.filter(task=>task.dueDate===todayKeyValue);const upcomingTasks=actions.tasks.filter(task=>task.dueDate>todayKeyValue).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||String(a.dueTime??'').localeCompare(String(b.dueTime??'')));const completed=today.filter(task=>task.completed).length;const toDo=today.filter(task=>!task.completed).length;const upcomingOpen=upcomingTasks.filter(task=>!task.completed).length;return <div className="space-y-6"><section className="grid gap-4 sm:grid-cols-3"><TaskStat label="Completed" value={completed} detail="Completed today" tone="bg-emerald-500"/><TaskStat label="To Do" value={toDo} detail="Open today" tone="bg-amber-500"/><TaskStat label="Upcoming" value={upcomingOpen} detail="Still scheduled ahead" tone="bg-indigo-500"/></section><DesktopTaskReminders tasks={actions.tasks}/><section className="grid gap-6 xl:grid-cols-2"><div className="card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-indigo-600">Today</p><h2 className="text-2xl font-bold">Today’s tasks</h2></div><Button onClick={()=>setEditor('new')}><Plus className="h-4 w-4"/>Add task</Button></div>{today.length===0?<MissingToday onYes={()=>setEditor('new')}/>:<TaskList tasks={today} actions={actions} onEdit={task=>setEditor(task)}/>}</div><div className="card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-indigo-600">Plan ahead</p><h2 className="text-2xl font-bold">Upcoming tasks</h2></div><Button onClick={()=>setEditor('upcoming')}><Plus className="h-4 w-4"/>Add upcoming</Button></div>{upcomingTasks.length?<div className="space-y-1">{upcomingTasks.slice(0,5).map(task=><TaskRow key={task.id} task={task} onEdit={()=>setEditor(task)} onUpdate={actions.onUpdate} onDelete={actions.onDelete} alwaysShowActions/>)}</div>:<p className="py-8 text-center text-sm text-slate-500">No upcoming tasks yet.</p>}<Link to="/tasks?tab=upcoming" className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all upcoming tasks →</Link></div></section>{editor&&<TaskEditor task={editor==='new'||editor==='upcoming'?undefined:editor} defaultDueDate={editor==='upcoming'?localDate(tomorrow):undefined} onClose={()=>setEditor(null)} onSave={async input=>{if(editor==='new'||editor==='upcoming')await actions.onCreate(input);else await actions.onUpdate(editor.id,input);setEditor(null)}}/>}</div>}

export function StoredTasksPage(actions:Actions) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab') === 'upcoming' ? 'Upcoming' : 'Today'
  const [tab, setTab] = useState<'Today'|'All'|'Upcoming'>(requestedTab)
  const [editor, setEditor] = useState<StoredTask|'new'|'upcoming'|null>(null)
  const today = todayKey()
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1)
  const filtered = tab==='Today' ? actions.tasks.filter(t=>t.dueDate===today) : tab==='Upcoming' ? actions.tasks.filter(t=>t.dueDate>today).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||String(a.dueTime??'').localeCompare(String(b.dueTime??''))) : actions.tasks
  const groups = useMemo(() => Object.entries(filtered.reduce<Record<string,StoredTask[]>>((all,task)=>({...all,[task.dueDate]:[...(all[task.dueDate]??[]),task]}),{})).sort(([a],[b])=>b.localeCompare(a)), [filtered])
  const selectTab = (next: 'Today'|'All'|'Upcoming') => { setTab(next); setSearchParams(next === 'Upcoming' ? { tab: 'upcoming' } : {}) }

  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Tasks</h2><p className="mt-1 text-sm text-slate-500">Plan today and keep upcoming work visible.</p></div><Button onClick={()=>setEditor(tab==='Upcoming'?'upcoming':'new')}><Plus className="h-4 w-4"/>Add task</Button></div>{actions.tasks.every(t=>t.dueDate!==today)&&<MissingToday onYes={()=>setEditor('new')}/>}<div className="flex gap-2 border-b border-slate-200">{(['Today','All','Upcoming'] as const).map(item=><button key={item} onClick={()=>selectTab(item)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab===item?'border-indigo-600 text-indigo-700':'border-transparent text-slate-500'}`}>{item}</button>)}</div>{tab==='All'?<div className="space-y-4">{groups.map(([day,tasks])=><section className={`card p-3 ${day===today?'border-indigo-200 bg-indigo-50/50':''}`} key={day}><h3 className="px-2 pb-2 text-sm font-bold text-indigo-700">{dayName(day)}</h3><div className="space-y-1">{tasks.map(task=><TaskRow key={task.id} task={task} onEdit={()=>setEditor(task)} onUpdate={actions.onUpdate} onDelete={actions.onDelete}/>)}</div></section>)}</div>:<TaskList tasks={filtered} actions={actions} onEdit={task=>setEditor(task)} alwaysShowActions={tab==='Upcoming'}/>} {editor&&<TaskEditor task={editor==='new'||editor==='upcoming'?undefined:editor} defaultDueDate={editor==='upcoming'?localDate(tomorrow):undefined} onClose={()=>setEditor(null)} onSave={async input=>{if(editor==='new'||editor==='upcoming')await actions.onCreate(input);else await actions.onUpdate(editor.id,input);setEditor(null)}}/>}</div>
}
