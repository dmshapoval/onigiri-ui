import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  concatMap,
  filter,
  interval,
  of,
  pipe,
  switchMap,
  take,
  tap
} from 'rxjs';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  InlineLoaderComponent,
  OnigiriIconComponent,
  OnigiriImageUrlPipe,
  ImagesService,
  whenIsNotNull
} from '@oni-shared';

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { ProfileStore } from '../../../profile.store';
import { PageViewStore } from '../../../view.store';
import { ProfileImageShape } from '../../../models';
import { PagesApiService } from '../../../api/pages-api.service';
import { match } from 'ts-pattern';

interface ChangeRequest {
  file: File;
}

@UntilDestroy()
@Component({
  selector: 'profile-img-input',
  standalone: true,
  templateUrl: 'img-input.component.html',
  styleUrls: ['./img-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    OnigiriIconComponent,
    InlineLoaderComponent,
    OnigiriImageUrlPipe
  ]
})
export class ProfileImageInputComponent implements OnInit {
  viewStore = inject(PageViewStore);
  profileStore = inject(ProfileStore);
  #api = inject(PagesApiService);

  @ViewChild('file') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = signal(false);
  pageIsReady = false;

  image = computed(() => this.profileStore.image());

  imageId = computed(() => {
    return match(this.image().imageId)
      .with({ _type: 'custom' }, x => x.imageId)
      .with({ _type: 'resolved' }, x => x.imageId)
      .otherwise(() => null);
  });

  constructor() {
    this.#setupRefresh();
  }

  ngOnInit(): void {}

  onUpload = rxMethod<FileList | null>(
    pipe(
      whenIsNotNull,
      filter(files => files.length > 0),
      concatMap(files => {
        const file = files[0];
        this.isLoading.set(true);
        this.fileInput.nativeElement.value = '';

        return this.#api.uploadImage(file).pipe(
          tapResponse(
            imageId => {
              this.profileStore.updateImage(imageId);
              this.isLoading.set(false);
            },
            () => this.isLoading.set(false)
          )
        );
      })
    )
  );

  onClean() {
    this.profileStore.updateImage(null);
  }

  onReplace() {
    this.fileInput.nativeElement.click();
  }

  updateShape(shape: ProfileImageShape) {
    if (this.image().shape === shape) {
      return;
    }

    this.profileStore.updateImageShape(shape);
  }

  #setupRefresh() {
    rxMethod<boolean>(
      pipe(
        switchMap(need => {
          if (!need) {
            return of();
          }

          return interval(800).pipe(
            take(15),
            tap(() => this.profileStore.refreshProfileImage())
          );
        })
      )
    )(computed(() => this.image().imageId._type === 'pending'));
  }

  // rxMethod<ProfileImageShape>(pipe(
  //   withLatestFrom(this.shape$),
  //   filter(([newShape, currentShape]) => newShape !== currentShape),
  //   map(input => input[0]),
  //   tap(shape => this.pageStore.updateProfileImageShape(shape))
  // ));
}
