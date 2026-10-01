import type { Bookmark, Note, Reminder, Task, Video } from '../types'
export const tasks: Task[] = [
 { id: 1, title: 'Finish project proposal', description: 'Outline scope and deliverables for the new client project.', priority: 'High', category: 'Work', due: 'Today', time: '10:00 AM', completed: false },
 { id: 2, title: 'Morning workout', description: '30 minutes of strength training.', priority: 'Medium', category: 'Health', due: 'Today', time: '7:00 AM', completed: true },
 { id: 3, title: 'Reply to client emails', description: 'Clear the inbox before lunch.', priority: 'Medium', category: 'Work', due: 'Today', time: '1:00 PM', completed: false },
 { id: 4, title: 'Plan weekly meals', description: 'Create a grocery list and dinner plan.', priority: 'Low', category: 'Personal', due: 'Tomorrow', time: '6:00 PM', completed: false },
 { id: 5, title: 'Review design inspiration', description: 'Save useful dashboard patterns.', priority: 'Low', category: 'Learning', due: 'Friday', time: '3:30 PM', completed: false },
]
export const videos: Video[] = [
 { id: 1, title: 'Build better habits with systems', source: 'YouTube', category: 'Productivity', saved: 'Today', favorite: true, color: 'from-violet-500 to-indigo-600' },
 { id: 2, title: 'The fundamentals of personal finance', source: 'YouTube', category: 'Finance', saved: 'Yesterday', favorite: false, color: 'from-emerald-500 to-teal-600' },
 { id: 3, title: 'Designing calm interfaces', source: 'Vimeo', category: 'Design', saved: 'Sep 28', favorite: false, color: 'from-orange-400 to-rose-500' },
 { id: 4, title: 'Deep work: a practical guide', source: 'YouTube', category: 'Learning', saved: 'Sep 26', favorite: true, color: 'from-sky-500 to-blue-700' },
]
export const notes: Note[] = [
 { id: 1, title: 'Ideas for DayStack', content: 'Keep the dashboard focused on today. A quick capture flow should always be one click away.', updated: 'Updated today', tags: ['Product', 'Ideas'], pinned: true },
 { id: 2, title: 'Weekly reflection', content: 'What went well: protected focused time. Next week: leave more room between meetings.', updated: 'Updated yesterday', tags: ['Personal'], pinned: true },
 { id: 3, title: 'Reading list', content: 'The Design of Everyday Things, Four Thousand Weeks, Thinking in Systems.', updated: 'Updated Sep 27', tags: ['Learning'], pinned: false },
]
export const reminders: Reminder[] = [
 { id: 1, title: 'Team stand-up', description: 'Share priorities and blockers.', date: 'Today', time: '9:30 AM', repeat: 'Weekdays', completed: false },
 { id: 2, title: 'Call Mom', description: 'Catch up this evening.', date: 'Today', time: '7:00 PM', repeat: 'Never', completed: false },
 { id: 3, title: 'Pay electricity bill', description: 'Due before the end of the week.', date: 'Oct 4', time: '9:00 AM', repeat: 'Monthly', completed: false },
]
export const bookmarks: Bookmark[] = [
 { id: 1, title: 'Linear — Project management', url: 'linear.app', description: 'A thoughtfully designed issue tracker.', category: 'Work', created: 'Today', favorite: true },
 { id: 2, title: 'Smashing Magazine', url: 'smashingmagazine.com', description: 'Articles and resources for designers.', category: 'Design', created: 'Sep 29', favorite: false },
 { id: 3, title: 'Farnam Street', url: 'fs.blog', description: 'Timeless thinking and mental models.', category: 'Learning', created: 'Sep 25', favorite: true },
]
