import { Observable } from 'rxjs';
import { Note } from '../models/note.model';

// PUBLIC_INTERFACE
export abstract class NotesService {
  /** Create a new note */
  abstract create(note: Pick<Note, 'title' | 'content'>): Observable<Note>;
  /** Get a list of all notes */
  abstract list(): Observable<Note[]>;
  /** Get a note by id */
  abstract get(id: string): Observable<Note | undefined>;
  /** Update an existing note */
  abstract update(id: string, patch: Partial<Pick<Note, 'title' | 'content'>>): Observable<Note>;
  /** Delete a note by id */
  abstract delete(id: string): Observable<void>;
}
