import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  inject
} from "@angular/core";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map } from "rxjs";
import * as A from "fp-ts/es6/Array";
import { NOT_NAMED, ProjectInfo } from "@onigiri-models";

import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";

import { Dialog } from "@angular/cdk/dialog";
import { AutoCompleteModule } from "primeng/autocomplete";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ProjectEditDialogComponent } from "../project-edit-dialog/project-edit-dialog.component";
import { ProjectsStore } from "@onigiri-store";
import { toObservable } from "@angular/core/rxjs-interop";
import { CustomControlBase } from "@oni-shared";

interface ProjectSuggestion {
  id: string;
  name: string;
  isCompleted: boolean;
}

@UntilDestroy()
@Component({
  selector: "project-selector",
  templateUrl: "./project-selector.component.html",
  styleUrls: ["./project-selector.component.scss"],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AutoCompleteModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectSelectorComponent
  extends CustomControlBase<string>
  implements OnInit
{
  #store = inject(ProjectsStore);
  #dialogs = inject(Dialog);
  #cdr = inject(ChangeDetectorRef);
  #el = inject(ElementRef);

  #selectedProjectId: string | null = null;
  #allSuggestions: ProjectSuggestion[] = [];
  #search: string | null = null;

  filteredSuggestions: ProjectSuggestion[] = [];

  disabled = false;

  get panelWidth() {
    return this.#el.nativeElement.clientWidth;
  }

  get selectedValue() {
    return this.#selectedProjectId
      ? this.#allSuggestions.find(x => x.id === this.#selectedProjectId) || null
      : null;
  }

  set selectedValue(v: ProjectSuggestion | null) {
    if (this.#selectedProjectId === v) return;

    this.#selectedProjectId = v?.id || null;
    this.onChange(this.#selectedProjectId);
    this.#cdr.markForCheck();
  }

  constructor() {
    super();

    toObservable(this.#store.allProjects)
      .pipe(map(A.map(toSuggestion)), untilDestroyed(this))
      .subscribe(suggestions => {
        this.#allSuggestions = suggestions;
        this.#recalculateSuggestions();
        this.#cdr.markForCheck();
      });
  }

  ngOnInit(): void {}

  override writeValue(value: string | null): void {
    this.#selectedProjectId = value;
    this.#cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.#cdr.markForCheck();
  }

  onCreateNew() {
    const dialogRef = this.#dialogs.open<ProjectInfo | null>(
      ProjectEditDialogComponent,
      {
        data:
          isNil(this.#search) || isEmpty(this.#search)
            ? null
            : { name: this.#search }
      }
    );

    dialogRef.closed.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this.#selectedProjectId = v.id;
        this.onChange(v.id);
      }
    });
  }

  onSearch(ev: { originalEvent: Event; query: string }) {
    this.#search = ev.query;
    this.#recalculateSuggestions();
    this.#cdr.markForCheck();
  }

  #recalculateSuggestions() {
    const search = this.#search?.trim().toLowerCase() || null;

    if (isNil(search) || isEmpty(search)) {
      this.filteredSuggestions = [...this.#allSuggestions];
      return;
    }

    this.filteredSuggestions = this.#allSuggestions.filter(
      x => x.name.toLowerCase().indexOf(search) >= 0
    );
  }
}

function toSuggestion(p: ProjectInfo): ProjectSuggestion {
  return {
    id: p.id,
    name: p.name || NOT_NAMED,
    isCompleted: p.isCompleted
  };
}
