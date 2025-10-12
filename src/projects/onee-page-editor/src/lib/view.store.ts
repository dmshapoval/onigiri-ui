import { PageViewType } from './models';
import { computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks
} from '@ngrx/signals';
import { DeviceSizeTrackingService } from '@oni-shared';
import { distinctUntilChanged, map } from 'rxjs';

interface State {
  dragging: boolean;
  onMobileDevice: boolean;
  selectedViewType: PageViewType;
}

const initState: State = {
  dragging: false,
  selectedViewType: 'desktop',
  onMobileDevice: true
};

export const PageViewStore = signalStore(
  withState(initState),

  withComputed(({ onMobileDevice, selectedViewType }) => ({
    viewType: computed(() => {
      const result: PageViewType = onMobileDevice()
        ? 'mobile'
        : selectedViewType();

      return result;
    })
  })),

  withMethods(store => {
    return {
      selectViewType(viewType: PageViewType) {
        patchState(store, { selectedViewType: viewType });
      },

      onDragStart() {
        patchState(store, { dragging: true });
      },
      onDragEnd() {
        patchState(store, { dragging: false });
      }
    };
  }),

  withHooks({
    onInit(store, deviceSizeTracking = inject(DeviceSizeTrackingService)) {
      deviceSizeTracking.deviceSize
        .pipe(
          map(w => w < 1170),
          distinctUntilChanged(),
          takeUntilDestroyed()
        )
        .subscribe(onMobileDevice => {
          patchState(store, { onMobileDevice });
        });
    }
  })
);
