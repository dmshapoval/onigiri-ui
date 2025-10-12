import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  effect,
  inject,
  signal
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ProjectTask } from "@onigiri-models";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { debounceTime, Subject, Subscription } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { CheckboxModule } from "primeng/checkbox";
import { OnigiriIconComponent, CustomControlBase } from "@oni-shared";
import { ProjectEditorStore } from "../../project-editor.store";

type TaskForm = FormGroup<{
  text: FormControl<string>;
  isCompleted: FormControl<boolean>;
}>;

type TaskFormEntry = {
  subscription: Subscription;
  form: TaskForm;
};

function newTaskId() {
  return uuidv4().slice(0, 13).replace("-", "");
}

@UntilDestroy()
@Component({
  selector: "project-tasks-list",
  standalone: true,
  templateUrl: "./project-tasks-list.component.html",
  styleUrls: ["./project-tasks-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    OnigiriIconComponent,
    CheckboxModule,
    DragDropModule
  ]
})
export class ProjectTasksListComponent implements OnInit {
  #editorStore = inject(ProjectEditorStore);

  #cdr = inject(ChangeDetectorRef);
  newTaskInput = new FormControl<string | null>(null);

  #hasChanges = new Subject<void>();

  plannedTasks: TaskFormEntry[] = [];
  completedTasks: TaskFormEntry[] = [];

  isDisabled = false;

  private get aggregatedTasks() {
    const result = [
      ...this.plannedTasks.map(x => x.form.value).map(toProjectTask),
      ...this.completedTasks.map(x => x.form.value).map(toProjectTask)
    ];

    return result;
  }

  constructor() {
    this.#setupSync();
  }

  ngOnInit() {}

  // override writeValue(value: ProjectTask[] | null): void {
  //   const tasks = value || [];
  //   const plannedTasks: TaskFormEntry[] = [];
  //   const completedTasks: TaskFormEntry[] = [];

  //   tasks.forEach(t => {
  //     const target = t.isCompleted ? completedTasks : plannedTasks;
  //     const form = this.#buildTaskForm(t);
  //     target.push(form);
  //   });

  //   this.plannedTasks = plannedTasks;
  //   this.completedTasks = completedTasks;

  //   this.#cdr.markForCheck();
  // }

  onCreateTask() {
    const taskText = (this.newTaskInput.value || "").trim();

    if (!taskText) {
      return;
    }

    const t: ProjectTask = {
      isCompleted: false,
      text: taskText
    };

    this.plannedTasks.splice(0, 0, this.#buildTaskForm(t));
    this.newTaskInput.setValue("");

    this.#propagateChanges();
  }

  onReordered(event: CdkDragDrop<TaskForm[]>) {
    const prevInd = event.previousIndex;
    const curentInd = event.currentIndex;

    if (prevInd === curentInd) {
      return;
    }

    const entry = this.plannedTasks.splice(prevInd, 1);
    this.plannedTasks.splice(curentInd, 0, entry[0]);

    this.#propagateChanges();
  }

  onDeleteTask(entry: TaskFormEntry) {
    entry.subscription.unsubscribe();

    if (entry.form.value.isCompleted) {
    } else {
    }

    this.plannedTasks = this.plannedTasks.filter(x => x !== entry);
    this.completedTasks = this.completedTasks.filter(x => x !== entry);

    this.#propagateChanges();
  }

  #setupSync() {
    effect(() => {
      const fromStore = this.#editorStore.tasks();
      this.plannedTasks.forEach(t => t.subscription.unsubscribe());
      this.completedTasks.forEach(t => t.subscription.unsubscribe());

      const plannedTasks: TaskFormEntry[] = [];
      const completedTasks: TaskFormEntry[] = [];

      fromStore.forEach(t => {
        const target = t.isCompleted ? completedTasks : plannedTasks;
        const form = this.#buildTaskForm(t);
        target.push(form);
      });

      this.plannedTasks = plannedTasks;
      this.completedTasks = completedTasks;

      this.#cdr.markForCheck();
    });

    this.#hasChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.#recalculateCompletedTasks();
      this.#propagateChanges();
    });
  }

  #buildTaskForm(t: ProjectTask): TaskFormEntry {
    const form: TaskForm = new FormGroup({
      text: new FormControl<string>(t.text, {
        nonNullable: true,
        updateOn: "blur"
      }),
      isCompleted: new FormControl<boolean>(t.isCompleted, {
        nonNullable: true
      })
    });

    const subscription = form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.#hasChanges.next());

    return { form, subscription };
  }

  #recalculateCompletedTasks() {
    const planned: TaskFormEntry[] = [];
    const completed: TaskFormEntry[] = [];

    this.plannedTasks
      .filter(x => !x.form.value.isCompleted)
      .forEach(x => planned.push(x));

    this.completedTasks
      .filter(x => x.form.value.isCompleted)
      .forEach(x => completed.push(x));

    this.plannedTasks
      .filter(x => x.form.value.isCompleted)
      .forEach(x => completed.splice(0, 0, x));

    this.completedTasks
      .filter(x => !x.form.value.isCompleted)
      .forEach(x => planned.splice(0, 0, x));

    this.plannedTasks = planned;
    this.completedTasks = completed;
  }

  #propagateChanges() {
    setTimeout(() => {
      this.#editorStore.updateTasks(this.aggregatedTasks);
    }, 0);
  }
}

function toProjectTask(fv: TaskForm["value"]): ProjectTask {
  return {
    isCompleted: fv.isCompleted || false,
    text: fv.text!
  };
}
