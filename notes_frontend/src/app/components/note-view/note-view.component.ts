import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Note } from '../../core/models/note.model';

@Component({
  selector: 'app-note-view',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './note-view.component.html',
  styleUrl: './note-view.component.css'
})
export class NoteViewComponent {
  @Input() note: Note | null = null;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  fmt(dateIso: string): string {
    const d = new Date(dateIso);
    return d.toLocaleString();
  }
}
