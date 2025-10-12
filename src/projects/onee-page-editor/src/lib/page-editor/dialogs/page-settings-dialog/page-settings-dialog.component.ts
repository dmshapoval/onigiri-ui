import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { ComingSoonChipComponent, ProgressCounterComponent } from '@oni-shared';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PageKeyInputComponent } from '../../../components';
import { debounceTime } from 'rxjs';
import { PageMetadata } from '../../../models';
import { PageDataStore } from '../../../page-data.store';
import { ProfileStore } from '../../../profile.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface PageSettingsDialogData {
  key: string;
  metadata: PageMetadata;
  name: string | null;
  bio: string | null;
}

export type PageSettingsDialogResult = {
  key: string;
  metadata: PageMetadata;
} | null;

@Component({
  selector: 'page-settings-dialog',
  standalone: true,
  templateUrl: 'page-settings-dialog.component.html',
  styleUrl: 'page-settings-dialog.component.scss',
  imports: [
    TabViewModule,
    ComingSoonChipComponent,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    ProgressCounterComponent,
    PageKeyInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSettingsDialogComponent implements OnInit {
  #dialogRef = inject(DialogRef);
  #destroyRef = inject(DestroyRef);

  profile = inject(ProfileStore);
  pageData = inject(PageDataStore);

  titleInput = new FormControl<string | null>(null, Validators.maxLength(70));
  descriptionInput = new FormControl<string | null>(
    null,
    Validators.maxLength(160)
  );

  titlePlaceholder = computed(() => {
    const name = this.profile.name();
    const fromName = name?.text.substring(0, 70) || null;

    return getRawText(fromName) || 'Add your page (meta) title';
  });

  descriptionPlaceholder = computed(() => {
    const descr = this.profile.description();
    const fromDescr = descr?.text.slice(0, 160) || null;

    return getRawText(fromDescr) || 'Add your page (meta) description';
  });

  ngOnInit() {
    this.titleInput.setValue(this.pageData.metadata().title, {
      emitEvent: false
    });

    this.descriptionInput.setValue(this.pageData.metadata().description, {
      emitEvent: false
    });

    this.titleInput.valueChanges
      .pipe(debounceTime(800), takeUntilDestroyed(this.#destroyRef))
      .subscribe(v => {
        this.pageData.updatePageTitle(v);
      });

    this.descriptionInput.valueChanges
      .pipe(debounceTime(800), takeUntilDestroyed(this.#destroyRef))
      .subscribe(v => {
        this.pageData.updatePageDescription(v);
      });
  }

  onClose() {
    this.#dialogRef.close();
  }
}

function getRawText(v: string | null) {
  if (!v) {
    return v;
  }

  const el = document.createElement('div');
  el.innerHTML = v;

  const text = el.innerText;

  return text;
}
