import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { map, take } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CustomersStore, ProjectsStore, TrackingStore } from '@onigiri-store';
import { OnigiriButtonComponent, OnigiriTemplate, whenIsNotNull, } from '@oni-shared';
import { TabViewModule } from 'primeng/tabview';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { ProjectEditDialogComponent } from '../project-edit-dialog/project-edit-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';

// interface ViewModel {
//   active: ProjectInfo[];
//   completed: ProjectInfo[];
// }

@UntilDestroy()
@Component({
  selector: 'app-projects-page',
  standalone: true,
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriButtonComponent, TabViewModule, AsyncPipe,
    NgTemplateOutlet, OnigiriTemplate, SkeletonModule,
    EmptyStatePlaceholderComponent, ProjectCardComponent
  ]
})
export class ProjectsPageComponent implements OnInit {

  #dialogs = inject(Dialog);
  #customers = inject(CustomersStore);
  store = inject(ProjectsStore);
  tracking = inject(TrackingStore);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  activeTab = signal(0);

  loadingActive = signal(true);
  loadingCompleted = signal(true);

  constructor() {
    this.#setupEffects();
    this.#customers.getAll();

    this.store.getActive(() => this.loadingActive.set(false));
    this.store.getCompleted(() => this.loadingCompleted.set(false));
  }

  ngOnInit() {

    this.#route.queryParamMap.pipe(
      map(p => p.get('t')),
      whenIsNotNull,
      take(1),
      untilDestroyed(this)
    ).subscribe(activeTab => {
      if (activeTab) {
        this.activeTab.set(activeTab == 'completed' ? 1 : 0);
      }
    });
  }

  onCreate() {
    this.#dialogs.open(ProjectEditDialogComponent, {
      data: {}
    });
  }


  goToProject(projectId: string) {
    this.#router.navigateByUrl(`/projects/${projectId}`);
  }

  #setupEffects() {
    effect(() => {
      const active = this.store.active();
      const completed = this.store.completed();

      this.tracking.setTrackingSource(
        active.length || completed.length
          ? 'Projects Page'
          : 'Projects Page: Empty State')
    }, { allowSignalWrites: true })
  }
}
