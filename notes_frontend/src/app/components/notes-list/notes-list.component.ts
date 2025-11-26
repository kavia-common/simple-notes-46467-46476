import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../core/models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css'
})
export class NotesListComponent {
  @Input() notes: Note[] = [];
  @Input() activeId: string | null = null;
  @Output() select = new EventEmitter<string>();
  @Output() create = new EventEmitter<void>();

  query = signal<string>('');
  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.notes.slice();
    return this.notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    );
  });

  trackById(_index: number, item: Note) { return item.id; }

  preview(content: string): string {
    const firstLine = (content || '').split('\n')[0];
    return firstLine.length > 120 ? firstLine.slice(0, 120) + '…' : firstLine;
  }

  fmt(dateIso: string): string {
    const d = new Date(dateIso);
    return d.toLocaleString();
  }
}
