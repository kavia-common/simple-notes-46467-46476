import { Routes } from '@angular/router';
import { NotesPageComponent } from './pages/notes/notes-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  { path: 'notes', children: [
    { path: '', component: NotesPageComponent },
    { path: ':id', component: NotesPageComponent }
  ]},
  { path: '**', redirectTo: 'notes' }
];
