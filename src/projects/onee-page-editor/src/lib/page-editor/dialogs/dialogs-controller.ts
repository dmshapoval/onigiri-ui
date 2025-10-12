import { inject, Injectable, Injector } from '@angular/core';
import { PageEditorMediator } from '../../mediator';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { SharePageDialogComponent } from './share-page-dialog/share-page-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { match, P } from 'ts-pattern';
import { PageViewStore } from '../../view.store';
import { constVoid } from 'fp-ts/es6/function';
import { PageSettingsDialogComponent } from './page-settings-dialog/page-settings-dialog.component';
import { PageDataStore } from '../../page-data.store';

@Injectable()
export class PageEditorDialogsController {
  #viewStore = inject(PageViewStore);
  #pageDataStore = inject(PageDataStore);
  #mediator = inject(PageEditorMediator);
  #injector = inject(Injector);
  #dialogs = inject(Dialog);

  constructor() {
    this.#setupMediatorMessageHandlers();
  }

  #setupMediatorMessageHandlers() {
    this.#mediator.messages.pipe(takeUntilDestroyed()).subscribe(msg => {
      if (this.#viewStore.onMobileDevice()) {
        return;
      }

      match(msg)
        .with({ _type: 'edit-settings' }, () => this.#openPageSettingsDialog())
        .with({ _type: 'share-page' }, () => this.#openSharePageDialog())
        .otherwise(constVoid);
    });
  }

  #openSharePageDialog = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        const dialogRef = this.#dialogs.open<void>(SharePageDialogComponent, {
          injector: this.#injector,
          maxWidth: '600px',
          minWidth: '370px'
        });

        return dialogRef.closed;
      })
    )
  );

  #openPageSettingsDialog = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        // const data: PageSettingsDialogData = {
        //   key: this.#pageDataStore.key(),
        //   metadata: this.#pageDataStore.metadata(),
        //   bio: this.#profileStore.description(),
        //   name: this.#profileStore.name()
        // };

        const dialogRef = this.#dialogs.open(PageSettingsDialogComponent, {
          width: '720px',
          injector: this.#injector
        });

        return dialogRef.closed;
      })
    )
  );
}
