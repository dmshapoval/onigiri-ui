import { computed, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { IconKey, isNotNil, whenIsNotNull } from "@oni-shared";
import { ProjectsApiService } from "@onigiri-api";
import { CustomUrlProjectLink, CustomUrlProjectLinkData, Project, ProjectInfo, ProjectLink, ProjectTask, TRACKING } from "@onigiri-models";
import { InvoicesStore, ProjectsStore, TrackingStore } from "@onigiri-store";
import { constVoid } from "fp-ts/es6/function";
import { concatMap, exhaustMap, map, pipe, switchMap, tap } from "rxjs";
import { InvoicesApiService } from "../../../api/invoices-api.service";

interface State {
  isLoading: boolean;
  projectId: string | null;
  name: string | null;
  description: string | null;
  customerId: string | null
  isSample: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
  links: ProjectLink[];
  tasks: ProjectTask[];
}


const initState: State = {
  isLoading: true,
  projectId: null,
  name: null,
  description: null,
  customerId: null,
  isSample: false,
  isCompleted: false,
  completedAt: null,
  links: [],
  tasks: []
}

export const ProjectEditorStore = signalStore(
  withState(initState),

  withComputed(({ isLoading, projectId, isCompleted }) => ({
    dataLoaded: computed(() => isNotNil(projectId()) && !isLoading()),

    availableActions: computed(() => getAvailableActions(isCompleted()))
  })),

  withMethods((store,
    api = inject(ProjectsApiService),
    router = inject(Router),
    invoicesApi = inject(InvoicesApiService),
    invoicesStore = inject(InvoicesStore),
    tracking = inject(TrackingStore),
    projectsStore = inject(ProjectsStore)) => ({

      // updateTasks(tasks: ProjectTask[]) {
      //   patchState(store, { tasks })
      // },

      updateTasks: rxMethod<ProjectTask[]>(pipe(
        tap(tasks => patchState(store, { tasks })),
        concatMap(tasks => api.updateTasks(store.projectId()!, tasks).pipe(
          tapResponse(constVoid, constVoid)
        ))
      )),

      loadData: rxMethod<string>(pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(id => api.getProject(id).pipe(
          tapResponse(
            data => patchState(store, {
              projectId: data.id,
              name: data.name,
              tasks: data.tasks,
              isSample: data.isSample,
              completedAt: data.completedAt,
              links: data.links,
              customerId: data.customerId,
              description: data.description,
              isCompleted: data.isCompleted,
              isLoading: false
            }),
            _ => patchState(store, { isLoading: false }),
          )
        ))
      )),

      refreshData() {
        const projectId = store.projectId();
        if (projectId) {
          this.loadData(projectId);
        }
      },

      restoreProject: rxMethod<void>(pipe(
        exhaustMap(() => {
          const projectId = store.projectId()!;

          return api.restoreProject(projectId).pipe(
            tapResponse(
              () => projectsStore.projectRestored(projectId),
              constVoid
            )
          )
        })
      )),

      complete: rxMethod<void>(pipe(
        concatMap(() => {
          const projectId = store.projectId()!

          return api.completeProject(projectId).pipe(
            tapResponse(
              () => {
                projectsStore.projectCompleted(projectId);

                // TODO: verify
                router.navigate(['./projects'], {
                  queryParams: { t: 'completed' }
                })

              },
              constVoid
            )
          );
        }))
      ),

      createInvoiceLink: rxMethod<string>(pipe(
        switchMap(projectId => invoicesApi.createInvoice(projectId).pipe(
          tapResponse(
            invoice => {
              invoicesStore.invoiceDraftCreated(invoice);
              tracking.trackEvent(TRACKING.INVOICE.CREATE);

              // TODO: verify
              router.navigate(['./invoices', invoice.id], {
                queryParams: { rtn_to: `/projects/${projectId}` }
              });

            },
            constVoid
          )
        ))
      )),

    })),

  withHooks({
    onInit(store) {
      const route = inject(ActivatedRoute);

      route.paramMap.pipe(
        map(x => x.get('id')),
        whenIsNotNull,
        takeUntilDestroyed()
      ).subscribe(id => store.loadData(id))

      // this.#route.paramMap
      // .pipe(
      //   map(x => x.get('id')),
      //   ,
      //   untilDestroyed(this)
      // )
      // .subscribe(id => this.projectId.set(id))
    }
  })
)


export type ProjectActionKey = 'delete' | 'edit' | 'complete' | 'restore';

export interface ProjectAction {
  key: ProjectActionKey;
  text: string;
  icon: IconKey;
};

function getAvailableActions(isCompleted: boolean) {

  const result: ProjectAction[] = [{
    key: 'edit',
    icon: 'edit',
    text: 'Edit project details'
  }];

  if (isCompleted) {
    result.push({
      key: 'restore',
      icon: 'restore',
      text: 'Restore'
    });
  } else {
    result.push({
      key: 'complete',
      icon: 'check',
      text: 'Complete & archive'
    });
  }

  result.push({
    key: 'delete',
    icon: 'trash',
    text: 'Delete project'
  })

  return result;
}