import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectsApiService } from '@onigiri-api';
import { ProjectsStore, TrackingStore, } from '@onigiri-store';
import { exhaustMap, pipe, tap } from 'rxjs';
import { Project, ProjectData, ProjectInfo, TRACKING } from '@onigiri-models';
import isNil from 'lodash/isNil';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { OnigiriIconComponent } from '@oni-shared';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerSelectorComponent } from '../../clients/customer-selector/customer-selector.component';
import { OnigiriButtonComponent } from '@oni-shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';

export interface Props {
  projectId: string | null;
  name: string | null;
  description: string | null;
  customerId: string | null;
}

@Component({
  selector: 'project-edit-dialog',
  templateUrl: 'project-edit-dialog.component.html',
  styleUrls: ['./project-edit-dialog.component.scss'],
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    OnigiriIconComponent, OnigiriButtonComponent,
    InputTextareaModule, InputTextModule,
    CustomerSelectorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectEditDialogComponent implements OnInit {

  #data: Props = inject(DIALOG_DATA);
  #dialogRef = inject(DialogRef);

  #api = inject(ProjectsApiService);
  #projects = inject(ProjectsStore);
  #tracking = inject(TrackingStore);


  get #projectId() {
    return this.#data?.projectId || null;
  }

  form = new FormGroup({
    name: new FormControl<string | null>(null),
    description: new FormControl<string | null>(null),
    customer: new FormControl<string | null>(null),
  });

  ngOnInit() {

    if (this.#data) {
      this.form.patchValue({
        name: this.#data.name,
        customer: this.#data.customerId,
        description: this.#data.description
      });
    }

  }

  onSave = rxMethod<void>(tap(() => {
    const fv = this.form.value;
    const data: ProjectData = {
      name: fv.name || null,
      customer: fv.customer || null,
      description: fv.description || null
    };

    const isNewProject = isNil(this.#projectId);

    isNewProject ? this.#onCreate(data) : this.#onEdit(data);
  }));


  onCancel() {
    this.#dialogRef.close();
  }

  #onCreate = rxMethod<ProjectData>(pipe(
    exhaustMap(data => this.#api.createProject(data).pipe(
      tapResponse(
        projectId => {
          this.#projects.projectCreated(projectId);
          this.#tracking.trackEvent(TRACKING.PROJECT.CREATE);
          this.#dialogRef.close(projectId);
        },
        constVoid
      )
    ))
  ));

  #onEdit = rxMethod<ProjectData>(pipe(
    exhaustMap(data => {
      const projectId = this.#projectId!;

      return this.#api.updateDetails(projectId, data).pipe(
        tapResponse(
          () => {
            this.#projects.projectInfoUpdated(projectId);
            this.#dialogRef.close(projectId);
          },
          constVoid
        )
      )
    })
  ));
}

type InnerForm = ProjectEditDialogComponent['form'];
type InnerFormValue = InnerForm['value'];

