import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NoteEditorModel {
  id?: string | null;
  title: string;
  content: string;
}

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css'
})
export class NoteEditorComponent implements OnChanges {
  @Input() model: NoteEditorModel = { id: null, title: '', content: '' };
  @Input() open = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<NoteEditorModel>();

  local: NoteEditorModel = { id: null, title: '', content: '' };
  error = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && this.model) {
      this.local = { id: this.model.id ?? null, title: this.model.title ?? '', content: this.model.content ?? '' };
      this.error = '';
    }
  }

  submit() {
    const title = (this.local.title || '').trim();
    if (!title) {
      this.error = 'Title is required.';
      return;
    }
    this.error = '';
    this.save.emit({ ...this.local, title });
  }
}
