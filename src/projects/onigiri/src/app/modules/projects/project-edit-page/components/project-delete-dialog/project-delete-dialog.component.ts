import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { NOT_NAMED, ProjectInfo } from '@onigiri-models';
import { ProjectsApiService } from '@onigiri-api';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ProjectsStore } from '@onigiri-store';
import { constVoid } from 'fp-ts/es6/function';

export interface Props {
  projectId: string;
  name: string;
}

@Component({
  selector: 'project-delete-dialog',
  standalone: true,
  templateUrl: './project-delete-dialog.component.html',
  styleUrls: ['./project-delete-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent,
    OnigiriButtonComponent
  ]
})
export class ProjectDeleteDialogComponent implements OnInit {

  #api = inject(ProjectsApiService);
  #dialogRef = inject(DialogRef);
  #projectsStore = inject(ProjectsStore);


  data: Props = inject(DIALOG_DATA);


  ngOnInit(): void {


  }

  onDeleteConfirmed = rxMethod<void>(pipe(
    exhaustMap(() => {
      const projectId = this.data.projectId;

      return this.#api.deleteProject(projectId).pipe(
        tapResponse(
          () => {
            this.#projectsStore.projectDeleted(projectId);
            this.#dialogRef.close(true);
          },
          constVoid
        )
      )
    })
  ))


  onCancel() {
    this.#dialogRef.close(false);
  }
}
