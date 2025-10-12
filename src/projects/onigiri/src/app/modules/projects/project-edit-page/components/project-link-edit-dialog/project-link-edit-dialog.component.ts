import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Observable, combineLatest,
  debounceTime, distinctUntilChanged, filter, map, startWith, switchMap
} from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CustomUrlProjectLinkData, URL_REGEX } from '@onigiri-models';
import { AppToolsService } from '@onigiri-api';
import { OnigiriButtonComponent, OnigiriIconComponent, ensureUrlProtocol } from '@oni-shared';
import { InputTextModule } from 'primeng/inputtext';
import { LetDirective } from '@ngrx/component';

const EMPTY_URL_DATA: CustomUrlData = {
  icon: null,
  title: null
};


@UntilDestroy()
@Component({
  selector: 'project-link-edit-dialog',
  standalone: true,
  templateUrl: 'project-link-edit-dialog.component.html',
  styleUrls: ['./project-link-edit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent, InputTextModule,
    ReactiveFormsModule, OnigiriButtonComponent,
    LetDirective
  ]
})
export class ProjectLinkEditDialogComponent implements OnInit {

  #dialogRef = inject(DialogRef);
  #appTools = inject(AppToolsService);
  #sanitizer = inject(DomSanitizer);

  url = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.pattern(URL_REGEX)],
    updateOn: 'blur'
  });

  // iconUrl = signal<SafeUrl | null>(null);
  iconUrl$: Observable<SafeUrl | null>;


  form = new FormGroup({
    icon: new FormControl<string | null>(null),
    title: new FormControl<string | null>(null),
    description: new FormControl<string | null>(null)
  });

  constructor() { }

  ngOnInit() {
    this._setupUrlDataParsing();
    this._setupIconUrlCalculation();

  }

  onCancel() {
    this.#dialogRef.close();
  }

  onSave() {
    const fv = this.form.value;
    const data: CustomUrlProjectLinkData = {
      url: ensureUrlProtocol(this.url.value!),
      icon: fv.icon!,
      description: fv.description!,
      title: fv.title!
    };

    this.#dialogRef.close(data);
  }

  private _setupUrlDataParsing() {
    const data$ = combineLatest({
      value: this.url.valueChanges,
      status: this.url.statusChanges
    }).pipe(debounceTime(50));

    // const getData = (url: string) => this._httpClient
    //   .get<CustomUrlData>(`${environment.onigiriApi}/api/utils/custom-url-info`, {
    //     params: { url }
    //   });

    const getData = (url: string) => this.#appTools.getOpenGraphMetadata(url)
      .pipe(map(r => {
        const result: CustomUrlData = r.success
          ? {
            title: r.data?.title || null,
            icon: r.data?.logo || null
          }
          : EMPTY_URL_DATA;

        return result;
      }));

    data$
      .pipe(
        filter(x => x.status === 'VALID'),
        map(x => x.value!),
        map(ensureUrlProtocol),
        distinctUntilChanged(),
        switchMap(getData),
        untilDestroyed(this)
      )
      .subscribe(d => {
        // this.iconUrl.set(d.icon ? this._sanitizer.bypassSecurityTrustResourceUrl(d.icon) : null);
        this.form.patchValue({
          title: d.title,
          icon: d.icon
        })
      });
  }

  private _setupIconUrlCalculation() {
    const control = this.form.controls.icon;

    this.iconUrl$ = control.valueChanges.pipe(
      startWith(control.value),
      distinctUntilChanged(),
      map(x => x ? this.#sanitizer.bypassSecurityTrustResourceUrl(x) : null)
    );
  }
}



interface CustomUrlData {
  icon: string | null;
  title: string | null;
}