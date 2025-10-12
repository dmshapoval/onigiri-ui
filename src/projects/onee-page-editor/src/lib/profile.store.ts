import { effect, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';

import {
  LinkBioPage,
  ProfileImage,
  ProfileImageId,
  ProfileImageShape
} from './models';
import {
  dropUserProfileImageIdCookie,
  PagesApiService,
  setUserProfileImageIdCookie
} from '../public-api';
import { ApiRequestsService } from './api-requests.service';
import { RichText } from '@oni-shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { match } from 'ts-pattern';

interface State {
  image: ProfileImage;
  name: RichText | null;
  description: RichText | null;
}

const initState: State = {
  image: { imageId: { _type: 'none' }, shape: 'circle' },
  name: null,
  description: null
};

export const ProfileStore = signalStore(
  withState(initState),

  withMethods(
    (
      store,
      api = inject(PagesApiService),
      requests = inject(ApiRequestsService)
    ) => {
      return {
        setState({ profileImage, profileName, bio }: LinkBioPage) {
          patchState(store, {
            name: profileName,
            image: profileImage,
            description: bio
          });
        },

        updateImage(imageId: string | null) {
          requests.send(() => api.updateProfileImageId(imageId));

          const profileImageId: ProfileImageId = imageId
            ? { _type: 'custom', imageId }
            : { _type: 'none' };

          patchState(store, s => ({
            image: { ...s.image, imageId: profileImageId }
          }));
        },

        refreshProfileImage: rxMethod<void>(
          pipe(
            exhaustMap(() =>
              api.getProfileImage().pipe(
                tapResponse(
                  image => patchState(store, { image }),
                  () => {}
                )
              )
            )
          )
        ),

        updateImageShape(shape: ProfileImageShape) {
          requests.send(() => api.updateProfileImageShape(shape));

          patchState(store, s => ({
            image: { ...s.image, shape }
          }));
        },

        updateName(name: RichText | null) {
          requests.send(() => api.updateProfileName(name?.html || null));

          patchState(store, { name });
        },

        updateDescription(description: RichText | null) {
          requests.send(() => api.updateProfileBio(description?.html || null));

          patchState(store, { description });
        }
      };
    }
  ),

  withHooks({
    onInit({ image }) {
      effect(() => {
        const imageId = match(image().imageId)
          .with({ _type: 'custom' }, x => x.imageId)
          .with({ _type: 'resolved' }, x => x.imageId)
          .otherwise(() => null);

        if (imageId) {
          setUserProfileImageIdCookie(imageId);
        } else {
          dropUserProfileImageIdCookie();
        }
      });
    }
  })
);
