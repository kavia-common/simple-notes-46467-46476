import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { NotesListComponent } from '../../components/notes-list/notes-list.component';
import { NoteViewComponent } from '../../components/note-view/note-view.component';
import { NoteEditorComponent, NoteEditorModel } from '../../components/note-editor/note-editor.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { NotesStorageService } from '../../core/services/notes-storage.service';
import { Note } from '../../core/models/note.model';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    NotesListComponent,
    NoteViewComponent,
    NoteEditorComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './notes-page.component.html',
  styleUrl: './notes-page.component.css'
})
export class NotesPageComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  selectedId = signal<string | null>(null);

  // UI state
  editorOpen = signal<boolean>(false);
  editorModel: NoteEditorModel = { id: null, title: '', content: '' };
  confirmOpen = signal<boolean>(false);

  private sub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private storage: NotesStorageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.storage.list().subscribe(list => {
      this.notes = list;
      // If selectedId is missing (deleted), clear
      if (this.selectedId() && !this.notes.find(n => n.id === this.selectedId())) {
        this.selectedId.set(null);
      }
    });

    // route param to open specific note
    this.routeSub = this.route.paramMap.subscribe(p => {
      const id = p.get('id');
      this.selectedId.set(id);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  onCreate() {
    this.editorModel = { id: null, title: '', content: '' };
    this.editorOpen.set(true);
  }

  onSelect(id: string) {
    this.router.navigate(['/notes', id]);
  }

  onSave(model: NoteEditorModel) {
    if (model.id) {
      this.storage.update(model.id, { title: model.title, content: model.content }).subscribe(n => {
        this.editorOpen.set(false);
        this.router.navigate(['/notes', n.id]);
      });
    } else {
      this.storage.create({ title: model.title, content: model.content }).subscribe(n => {
        this.editorOpen.set(false);
        this.router.navigate(['/notes', n.id]);
      });
    }
  }

  onEdit() {
    const id = this.selectedId();
    const current = this.notes.find(n => n.id === id!);
    if (!current) return;
    this.editorModel = { id: current.id, title: current.title, content: current.content };
    this.editorOpen.set(true);
  }

  onRequestDelete() {
    if (!this.selectedId()) return;
    this.confirmOpen.set(true);
  }

  onConfirmDelete() {
    const id = this.selectedId();
    if (!id) return;
    this.storage.delete(id).subscribe(() => {
      this.confirmOpen.set(false);
      this.router.navigate(['/notes']);
    });
  }

  onCancelDelete() {
    this.confirmOpen.set(false);
  }

  get activeNote(): Note | null {
    const id = this.selectedId();
    return id ? (this.notes.find(n => n.id === id) ?? null) : null;
  }
}
