import { Routes } from '@angular/router';
import { EditorTestComponent } from './editor-test/editor-test.component';

export const DEV_TEST_ROUTES: Routes = [
  {
    path: 'editor',
    component: EditorTestComponent,
    title: 'Onigiri: Editor.JS',
    data: {
      hideNav: false,
      preloadAction: [],
    }
  }
];
