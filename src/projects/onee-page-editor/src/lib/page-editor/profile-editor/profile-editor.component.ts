import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  viewChild
} from '@angular/core';
import { ProfileStore } from '../../profile.store';
import {
  ProgressCounterComponent,
  RichText,
  RichTextEditorComponent
} from '@oni-shared';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileImageInputComponent } from './img-input/img-input.component';
import { PageDataStore } from '../../page-data.store';
import { PageViewStore } from '../../view.store';
import { WithLayoutClsDirective } from '../../directives/with-layout-cls.directive';

@Component({
  standalone: true,
  selector: 'profile-editor',
  templateUrl: 'profile-editor.component.html',
  styleUrl: 'profile-editor.component.scss',
  imports: [
    RichTextEditorComponent,
    ProfileImageInputComponent,
    ReactiveFormsModule,
    ProgressCounterComponent,
    WithLayoutClsDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditorComponent implements OnInit {
  dataStore = inject(PageDataStore);
  viewStore = inject(PageViewStore);
  #profileStore = inject(ProfileStore);

  name = computed(() => this.#profileStore.name());
  nameLength = computed(() => this.name()?.text.length || 0);

  bio = computed(() => this.#profileStore.description());
  bioLength = computed(() => this.bio()?.text.length || 0);

  constructor() {
    this.#setupSync();
  }

  ngOnInit() {}

  updateName(v: RichText | null) {
    this.#profileStore.updateName(v);
  }

  updateDescription(v: RichText | null) {
    this.#profileStore.updateDescription(v);
  }

  #setupSync() {
    // const name = this.#profileStore.name();
    // const bio = this.#profileStore.description();
    // this.name.setValue(name || null, { emitEvent: false });
    // this.bio.setValue(bio || null, { emitEvent: false });
    // this.name.valueChanges
    //   .pipe(debounceTime(800), takeUntilDestroyed())
    //   .subscribe(fv => this.#profileStore.updateName(fv));
    // this.bio.valueChanges
    //   .pipe(debounceTime(800), takeUntilDestroyed())
    //   .subscribe(fv => this.#profileStore.updateDescription(fv));
  }
}
