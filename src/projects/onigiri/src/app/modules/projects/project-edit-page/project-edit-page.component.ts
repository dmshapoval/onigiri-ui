import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  CustomUrlProjectLinkData, IconKey, Project, ProjectInfo,
  ProjectLink, ProjectLinkType, ProjectTask,
  SAMPLE_PROJECT_CUSTOMER_NAME, TRACKING
} from '@onigiri-models';
import {
  CustomersStore,
  InvoicesStore, ProjectsStore,
  TrackingStore
} from '@onigiri-store';
import {
  Observable, pipe,
  concatMap, exhaustMap, filter, map,
  shareReplay, startWith, switchMap, tap,
  of
} from 'rxjs';

import { ProjectsApiService } from '@onigiri-api';

import { constVoid } from 'fp-ts/es6/function';
import { ProjectLinkTypeSelectDialogComponent } from './components/project-link-type-select-dialog/project-link-type-select-dialog.component';
import { ProjectLinkEditDialogComponent } from './components/project-link-edit-dialog/project-link-edit-dialog.component';
import { OnigiriButtonComponent, OnigiriIconComponent, exhaustiveCheck, isNotNil, whenIsNotNull } from '@oni-shared';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ProjectTasksListComponent } from './components/project-tasks-list/project-tasks-list.component';
import { ProjectLinkComponent } from './components/project-link/project-link.component';
import { SampleProjectChipComponent } from './components/sample-project-chip.component';
import { ProjectDeleteDialogComponent, Props as ProjectDeleteDialogProps } from './components/project-delete-dialog/project-delete-dialog.component';
import { InvoicesApiService } from '../../../api/invoices-api.service';
import { ProjectEditDialogComponent, Props as ProjectEditDialogProps } from '../project-edit-dialog/project-edit-dialog.component';
import { LetDirective } from '@ngrx/component';
import { ActivatedRoute, Router } from '@angular/router';
import { rxMethod, } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AppNavStore } from '../../../store/app-nav.store';
import { ProjectActionKey, ProjectEditorStore } from './project-editor.store';



// TODO: refactor

@UntilDestroy()
@Component({
  selector: 'project-edit-page',
  standalone: true,
  templateUrl: 'project-edit-page.component.html',
  styleUrls: ['./project-edit-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProjectEditorStore],
  imports: [
    SampleProjectChipComponent, NgTemplateOutlet,
    OnigiriButtonComponent, AsyncPipe, OnigiriIconComponent,
    LetDirective,
    ProjectLinkComponent, ProjectEditDialogComponent,
    ProjectTasksListComponent, ReactiveFormsModule
  ]
})
export class ProjectEditPageComponent implements OnInit {

  #store = inject(ProjectsStore);
  #tracking = inject(TrackingStore);
  #invoices = inject(InvoicesStore);
  #router = inject(Router);

  #customers = inject(CustomersStore);
  #api = inject(ProjectsApiService);
  #dialogs = inject(Dialog);

  editorStore = inject(ProjectEditorStore);

  isLoading = signal(false);

  // #route = inject(ActivatedRoute);
  // #invoicesApi = inject(InvoicesApiService);
  // projectId = signal<string | null>(null);
  // data = signal<Project | null>(null);

  // data = computed(() => {
  //   const id = this.projectId();
  //   const active = this.#store.active();
  //   const completed = this.#store.completed();
  //   return active.find(x => x.id === id) || completed.find(x => x.id === id) || null;
  // });

  // links = signal<ProjectLink[]>([]);



  // tasksTotal$: Observable<number>;
  // tasksCompleted$: Observable<number>;

  showActions = false;

  customerName = computed(() => {
    const isSample = this.editorStore.isSample();
    const customers = this.#customers.customers();
    const customeId = this.editorStore.customerId();

    if (isSample) {
      return SAMPLE_PROJECT_CUSTOMER_NAME;
    }

    const customer = customers.find(x => x.id === customeId);

    return customer ? customer.companyName || customer.contactName : null;
  });

  tasksTotal = computed(() => {
    return this.editorStore.tasks().length;
  });

  tasksCompleted = computed(() => {
    return this.editorStore.tasks().filter(x => x.isCompleted).length;
  });


  constructor() {
    this.#store.getAll();
    this.#invoices.getAll();

    this.#setupTasksProcessing();
    this.#setupAddDocumentOrLinkHandler();
    this.#setupRequestActionHandler();
    this.#setupEffects();
  }

  ngOnInit() {

    // this.#route.paramMap
    //   .pipe(
    //     map(x => x.get('id')),
    //     whenIsNotNull,
    //     untilDestroyed(this)
    //   )
    //   .subscribe(id => this.projectId.set(id))

    this.#tracking.setTrackingSource('Project edit page');
  }

  onAddDocumentOrLink: () => void = constVoid;
  requestAction: (key: ProjectActionKey) => void = constVoid;

  backToProjects() {
    this.#router.navigateByUrl('/projects');
  }


  #setupTasksProcessing() {

    // toObservable(this.projectId)
    //   .pipe(
    //     whenIsNotNull,
    //     switchMap(projectId => this.#api.getProjectTasks(projectId)
    //       .pipe(
    //         tap(tasks => {
    //           this.tasks.setValue(tasks);
    //         }),
    //         switchMap(() => this.tasks.valueChanges.pipe(
    //           concatMap(tasks => this.#api.updateTasks(projectId, tasks || []))
    //         ))
    //       )
    //     ),
    //     untilDestroyed(this)
    //   )
    //   .subscribe();


    // const tasks$ = this.tasks.valueChanges.pipe(
    //   startWith(this.tasks.value),
    //   shareReplay(1)
    // );

    // this.tasksTotal$ = tasks$.pipe(map(all => all?.length || 0));
    // this.tasksCompleted$ = tasks$.pipe(map(all => all?.filter(x => x.isCompleted).length || 0));
  }

  #setupAddDocumentOrLinkHandler() {

    const createUrlProjectLink = rxMethod<string>(pipe(
      exhaustMap(projectId => {

        const dialog = this.#dialogs.open<CustomUrlProjectLinkData | undefined>(
          ProjectLinkEditDialogComponent,
          { width: '600px' }
        );

        return dialog.closed.pipe(

          switchMap(data => {

            if (!data) { return of(); }

            return this.#api.addCustomUrlProjectLink(projectId, data).pipe(
              tapResponse(
                () => this.editorStore.refreshData(),
                constVoid
              )
            )
          })
        );
      })
    ));

    this.onAddDocumentOrLink = rxMethod<void>(pipe(
      exhaustMap(() => {
        const dialog = this.#dialogs.open<ProjectLinkType | undefined>(ProjectLinkTypeSelectDialogComponent, { width: '310px' });

        return dialog.closed.pipe(
          filter(isNotNil),
          tap(linkType => {
            const projectId = this.editorStore.projectId();

            if (!linkType || !projectId) {
              return;
            }

            switch (linkType) {
              case 'invoice': {
                this.editorStore.createInvoiceLink(projectId);
                break;
              }
              case 'url': {
                createUrlProjectLink(projectId);
                break;
              }
              default: {
                exhaustiveCheck(linkType)
                break;
              }
            }
          }))
      })
    ))
  }

  #setupRequestActionHandler() {

    const handleProjectEditRequest = rxMethod<void>(pipe(
      exhaustMap(() => {
        const data: ProjectEditDialogProps = {
          projectId: this.editorStore.projectId(),
          name: this.editorStore.name(),
          customerId: this.editorStore.customerId(),
          description: this.editorStore.description(),
        }

        return this.#dialogs
          .open<string | null>(ProjectEditDialogComponent, { data })
          .closed.pipe(tap(_ => this.editorStore.refreshData()));
      })
    ));

    const handleProjectDeleteRequest = rxMethod<void>(pipe(
      exhaustMap(() => {
        const data: ProjectDeleteDialogProps = {
          projectId: this.editorStore.projectId()!,
          name: this.editorStore.name()!,
        }

        const dialog = this.#dialogs.open<boolean>(
          ProjectDeleteDialogComponent, {
          width: '600px',
          data
        });

        return dialog.closed.pipe(
          tap(isDeleted => {
            if (isDeleted) {
              this.#router.navigateByUrl('/projects');
            }
          })
        );
      }))
    );

    this.requestAction = (key: ProjectActionKey) => {

      this.showActions = false;

      switch (key) {
        case 'edit': {
          handleProjectEditRequest();
          return;
        }
        case 'delete': {
          handleProjectDeleteRequest();
          return;
        }
        case 'complete': {
          this.editorStore.complete();
          return
        }
        case 'restore': {
          this.editorStore.restoreProject();
          return;
        }
        default: {
          exhaustiveCheck(key);
          return;
        }
      }
    };
  }

  #setupEffects() {
    // effect(() => {
    //   const projectId = this.projectId();
    //   this.links.set([]);

    //   if (projectId) {
    //     this.#refreshLinks(projectId);
    //   }
    // }, { allowSignalWrites: true });
  }
}

// function getCustomerName(data: ProjectInfo | null) {
//   if (!data) { return null; }

//   if (data.customer?.name) {
//     return data.customer.name;
//   }

//   if (data.isSample) {
//     return SAMPLE_PROJECT_CUSTOMER_NAME;
//   }

//   return null;
// }

