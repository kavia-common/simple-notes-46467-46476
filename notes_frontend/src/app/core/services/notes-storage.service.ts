/* eslint-disable no-undef */
// Declare browser globals so eslint doesn't flag them in SSR/lint context.
/* global window, crypto */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note } from '../models/note.model';
import { NotesService } from './notes.service';

const STORAGE_KEY = 'simple_notes__items_v1';

// PUBLIC_INTERFACE
export function uuid(): string {
  // Simple UUID v4 generator, guarded for SSR
  const hasCrypto = typeof crypto !== 'undefined' && typeof (crypto as any).getRandomValues === 'function';
  if (hasCrypto) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = ((crypto as any).getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  // Fallback without crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class NotesStorageService extends NotesService {
  private notes$: BehaviorSubject<Note[]>;

  constructor() {
    super();
    const initial = this.readFromStorage();
    this.notes$ = new BehaviorSubject<Note[]>(initial);
  }

  private readFromStorage(): Note[] {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Note[]) : [];
    } catch {
      return [];
    }
  }

  private writeToStorage(notes: Note[]): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore storage errors (quota, etc.)
    }
  }

  private commit(next: Note[]): void {
    this.writeToStorage(next);
    this.notes$.next(next);
  }

  // PUBLIC_INTERFACE
  create(note: Pick<Note, 'title' | 'content'>): Observable<Note> {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: uuid(),
      title: note.title.trim(),
      content: note.content ?? '',
      createdAt: now,
      updatedAt: now,
    };
    const current = this.notes$.value.slice();
    current.unshift(newNote);
    this.commit(current);
    return of(newNote);
  }

  // PUBLIC_INTERFACE
  list(): Observable<Note[]> {
    return this.notes$.asObservable();
  }

  // PUBLIC_INTERFACE
  get(id: string): Observable<Note | undefined> {
    return this.notes$.pipe(map(list => list.find(n => n.id === id)));
  }

  // PUBLIC_INTERFACE
  update(id: string, patch: Partial<Pick<Note, 'title' | 'content'>>): Observable<Note> {
    const current = this.notes$.value.slice();
    const idx = current.findIndex(n => n.id === id);
    if (idx === -1) {
      throw new Error('Note not found');
    }
    const updated: Note = {
      ...current[idx],
      ...patch,
      title: (patch.title ?? current[idx].title).trim(),
      content: patch.content ?? current[idx].content,
      updatedAt: new Date().toISOString(),
    };
    current.splice(idx, 1);
    current.unshift(updated); // move updated note to top
    this.commit(current);
    return of(updated);
  }

  // PUBLIC_INTERFACE
  delete(id: string): Observable<void> {
    const filtered = this.notes$.value.filter(n => n.id !== id);
    this.commit(filtered);
    return of(void 0);
  }
}
