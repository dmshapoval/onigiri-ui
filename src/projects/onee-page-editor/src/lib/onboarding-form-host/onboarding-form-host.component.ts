import { Component, inject, OnInit, output, signal } from '@angular/core';
import { OnboardingFormComponent } from '../components';
import { TilesStore } from '../tiles.store';
import { PageViewStore } from '../view.store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';

import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/function';
import { PagesApiService } from '../api/pages-api.service';
import { PageEditorMediator } from '../mediator';

@Component({
  standalone: true,
  imports: [OnboardingFormComponent],
  // providers: [TilesStore, PageViewStore, PageEditorMediator],
  selector: 'onboarding-form-host',
  templateUrl: 'onboarding-form-host.component.html',
  styleUrl: 'onboarding-form-host.component.scss'
})
export class OnboardingFormHost implements OnInit {
  onCompleted = output<void>();

  // #api = inject(PagesApiService);
  // #tilesStore = inject(TilesStore);

  constructor() {
    // this.#loadPage();
  }

  ngOnInit() {}

  // #loadPage = rxMethod<void>(
  //   pipe(
  //     switchMap(() =>
  //       this.#api.getPage().pipe(
  //         tapResponse(page => {
  //           this.#tilesStore.setState(page);
  //           this.isLoaded.set(true);
  //         }, constVoid)
  //       )
  //     )
  //   )
  // );
}
