import { computed, effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { getState, patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ProjectInfo } from "@onigiri-models";
import { constVoid } from "fp-ts/es6/function";
import { exhaustMap, map, pipe } from "rxjs";
import { ProjectsApiService } from "@onigiri-api";
import { Callback } from "@oni-shared";
import { AccountStore } from "./account.store";

export interface ProjectsState {
  active: ProjectInfo[];
  completed: ProjectInfo[];
}

const initialState: ProjectsState = {
  active: [],
  completed: [],
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ active, completed }) => ({

    allProjects: computed(() => [...active(), ...completed()])

  })),

  withMethods((store, api = inject(ProjectsApiService)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    getAll() {
      this.getActive();
      this.getCompleted();
    },

    getActive: rxMethod<Callback | void>(pipe(
      map(cb => cb || constVoid),
      exhaustMap(cb => api.getActiveProjects().pipe(tapResponse(
        active => {
          patchState(store, { active });
          cb();
        },
        cb
      )))
    )),

    getCompleted: rxMethod<Callback | void>(pipe(
      map(cb => cb || constVoid),
      exhaustMap(cb => api.getCompletedProjects().pipe(tapResponse(
        completed => {
          patchState(store, { completed });
          cb();
        },
        cb
      )))
    )),

    projectCreated(projectId: string) {
      // TODO: improve
      this.getActive();
    },

    projectInfoUpdated(projectId: string) {
      // TODO: improve
      const isActive = getState(store).active.some(x => x.id === projectId);
      isActive ? this.getActive() : this.getCompleted();
    },

    projectCompleted(projectId: string) {

      // TODO: test

      patchState(store, state => {

        const project = state.active.find(x => x.id === projectId);
        if (!project) { return state; }

        const updatedProject: ProjectInfo = {
          ...project,
          isCompleted: true,
          completedAt: new Date()
        };

        const active = state.active.filter(x => x.id !== projectId);
        const completed = [updatedProject, ...state.completed];

        return { active, completed };
      });

    },

    projectRestored(projectId: string) {

      // TODO: test

      patchState(store, state => {
        const project = state.completed.find(x => x.id === projectId);
        if (!project) { return state; }

        const updatedProject: ProjectInfo = {
          ...project,
          isCompleted: false,
          completedAt: null
        };

        const active = [updatedProject, ...state.active];
        const completed = state.completed.filter(x => x.id !== projectId);

        return { active, completed };
      });
    },

    projectDeleted(projectId: string) {
      patchState(store, state => {
        const active = state.active.filter(x => x.id !== projectId);
        const completed = state.completed.filter(x => x.id !== projectId);
        return { active, completed };
      });
    },

  })),

  withHooks({
    onInit(store) {
      const account = inject(AccountStore);

      // signout hanlder
      effect(() => {
        const isAuthenticated = account.isAuthenticated();

        if (!isAuthenticated) {
          store.onUserSignedOut();
        }
      }, { allowSignalWrites: true })

    }
  })

);