export type Priority = 'High' | 'Medium' | 'Low'
export interface Task { id: number; title: string; description: string; priority: Priority; category: string; due: string; time: string; completed: boolean }
export interface Video { id: number; title: string; source: string; category: string; saved: string; favorite: boolean; color: string }
export interface Note { id: number; title: string; content: string; updated: string; tags: string[]; pinned: boolean }
export interface Reminder { id: number; title: string; description: string; date: string; time: string; repeat: string; completed: boolean }
export interface Bookmark { id: number; title: string; url: string; description: string; category: string; created: string; favorite: boolean }
