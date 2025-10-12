import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';

import {
  DEFAULT_BG,
  LinkBioPage,
  PageBackground,
  PageLayoutType,
  PageMetadata
} from './models';
import { PagesApiService } from '../public-api';
import { ApiRequestsService } from './api-requests.service';
import { match } from 'ts-pattern';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, pipe, tap } from 'rxjs';

interface State {
  loaded: boolean;

  key: string;
  layout: PageLayoutType;
  background: PageBackground;
  metadata: PageMetadata;
}

const initState: State = {
  key: '',
  loaded: false,
  layout: 'profile_left',
  background: { _type: 'default' },
  metadata: { description: null, title: null }
};

export const PageDataStore = signalStore(
  withState(initState),

  withComputed(({ background }) => ({
    selectedBGColor: computed(() => {
      return match(background())
        .with({ _type: 'custom_color' }, ({ color }) => color)
        .otherwise(() => DEFAULT_BG);
    })
  })),

  withMethods(
    (
      store,
      api = inject(PagesApiService),
      requests = inject(ApiRequestsService)
    ) => {
      const onSetingsChanged = rxMethod<void>(
        pipe(
          debounceTime(1000),
          tap(() =>
            requests.send(() =>
              api.updatePageSettings({
                key: store.key(),
                metadata: store.metadata()
              })
            )
          )
        )
      );

      return {
        setState({ background, key, metadata, layout }: LinkBioPage) {
          patchState(store, {
            loaded: true,
            background,
            key,
            layout,
            metadata
          });
        },

        updatePageKey(key: string) {
          patchState(store, { key });
          onSetingsChanged();
        },

        updatePageTitle(title: string | null) {
          patchState(store, s => {
            const metadata = { ...s.metadata, title };
            return { ...s, metadata };
          });

          onSetingsChanged();
        },

        updatePageDescription(description: string | null) {
          patchState(store, s => {
            const metadata = { ...s.metadata, description };
            return { ...s, metadata };
          });

          onSetingsChanged();
        },

        updateSettings(key: string, metadata: PageMetadata) {
          patchState(store, { key, metadata });
          onSetingsChanged();
        },

        updatePageLayout(layout: PageLayoutType) {
          requests.send(() => api.updateLayout(layout));
          patchState(store, { layout });
        },

        updatePageBackground(background: PageBackground) {
          requests.send(() => api.setBackground(background));
          patchState(store, { background });
        }
      };
    }
  )
);
