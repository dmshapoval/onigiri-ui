import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  signal
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ImagesService } from "@onigiri-api";
import { constVoid } from "fp-ts/es6/function";
import {
  Observable,
  pipe,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  shareReplay,
  startWith,
  tap
} from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { LetDirective } from "@ngrx/component";
import {
  CustomControlBase,
  OnigiriIconComponent,
  whenIsNotNull
} from "@oni-shared";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";

import { SkeletonModule } from "primeng/skeleton";

@UntilDestroy()
@Component({
  selector: "image-upload",
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.scss"],
  standalone: true,
  imports: [OnigiriIconComponent, LetDirective, SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadComponent
  extends CustomControlBase<string>
  implements OnInit
{
  @Input() placeholder = "Add image";

  @ViewChild("file") fileInput: ElementRef<HTMLInputElement>;

  #hostEl = inject(ElementRef);
  #imgService = inject(ImagesService);
  #sanitizer = inject(DomSanitizer);

  isUploading = signal(false);

  get skeletonWidth() {
    const w = this.#hostEl.nativeElement.clientHeight;
    return `${w}px`;
  }

  get skeletonHeight() {
    const h = this.#hostEl.nativeElement.clientHeight;
    return `${h}px`;
  }

  innerControl = new FormControl<string | null>(null);

  imageUrl$: Observable<SafeUrl | null>;

  ngOnInit(): void {
    const imageId$ = this.innerControl.valueChanges.pipe(
      startWith(this.innerControl.value),
      distinctUntilChanged(),
      shareReplay(1)
    );

    this.imageUrl$ = imageId$.pipe(
      map(imageId => (imageId ? this.#imgService.getImageUrl(imageId) : null)),
      map(url => (url ? this.#sanitizer.bypassSecurityTrustUrl(url) : null))
    );

    imageId$
      .pipe(
        filter(v => v !== this.parentControl.value),
        untilDestroyed(this)
      )
      .subscribe(v => {
        //console.log('Updating img to', v);

        this.onChange(v);
      });
  }

  writeValue(imageId: string | null): void {
    this.innerControl.setValue(imageId);
  }

  // onUpload(files: FileList | null) {

  //   if (!files || files.length === 0) return;

  //   this._changeRequests$.next({ file: files[0] })
  // }

  onUpload = rxMethod<FileList | null>(
    pipe(
      map(files => (files && files.length > 0 ? files[0] : null)),
      whenIsNotNull,
      tap(() => this.isUploading.set(true)),
      exhaustMap(file =>
        this.#imgService.uploadImage(file).pipe(
          tapResponse(
            imageId => {
              this.innerControl.setValue(imageId);
              this.isUploading.set(false);
            },
            () => {
              // TODO: consider notifications
              this.isUploading.set(false);
            }
          )
        )
      )
    )
  );

  onClean() {
    this.innerControl.setValue(null);
  }

  onReplace(ev: Event) {
    this.fileInput.nativeElement.click();
  }

  handleClick(ev: Event) {
    if (!this.innerControl.value) {
      this.fileInput.nativeElement.click();
    }
  }

  override setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.innerControl.disable() : this.innerControl.enable();
  }

  // private _setupChangeRequestsHandling() {
  //   this._changeRequests$.pipe(
  //     concatMap(req => this.#imgService.uploadImage(req.file)
  //       .pipe(tap(imageId => this.innerControl.setValue(imageId)))
  //     ),
  //     untilDestroyed(this)
  //   ).subscribe();
  // }
}
