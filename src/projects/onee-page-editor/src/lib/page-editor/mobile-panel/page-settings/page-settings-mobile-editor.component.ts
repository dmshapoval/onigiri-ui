import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { PageDataStore } from '../../../page-data.store';
import { MobileEditorCloseDirective } from '../../../directives';
import { PageKeyInputComponent } from '../../../components';
import { ProgressCounterComponent } from '@oni-shared';
import { ProfileStore } from '../../../profile.store';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageKeyInputComponent,
    MobileEditorCloseDirective,
    ProgressCounterComponent,
    InputTextModule,
    InputTextareaModule
  ],
  selector: 'page-settings-mobile-editor',
  templateUrl: 'page-settings-mobile-editor.component.html',
  styleUrl: 'page-settings-mobile-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSettingsMobileEditorComponent implements OnInit {
  pageData = inject(PageDataStore);
  profile = inject(ProfileStore);
  #destroyRef = inject(DestroyRef);

  pageKey = computed(() => this.pageData.key());

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
