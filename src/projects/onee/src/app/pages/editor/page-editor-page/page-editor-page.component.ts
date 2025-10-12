import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  OneePageEditorComponent,
  dropUserHasOneePageCookie,
  setUserHasOneePageCookie
} from '@onee-page-editor';
import {
  DeviceSizeTrackingService,
  OnigiriIconComponent,
  OnigiriTemplate
} from '@oni-shared';

import { redirectToOnigiriInvoices } from '../../../onigiri-redirects';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ExploreOnigiriModalComponent } from '../../../components/explore-onigiri-modal/explore-onigiri-modal.component';
import { distinctUntilChanged, exhaustMap, map, pipe } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AccountApiService } from '../../../services/account-api.service';
import { tapResponse } from '@ngrx/operators';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'page-editor-page',
  standalone: true,
  templateUrl: 'page-editor-page.component.html',
  styleUrl: './page-editor-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OneePageEditorComponent,
    OnigiriTemplate,
    OnigiriIconComponent,
    DialogModule,
    NgTemplateOutlet,
    AsyncPipe
  ]
})
export class PageEditorPageComponent implements OnInit {
  #accountApi = inject(AccountApiService);
  #auth = inject(Auth);
  #dialogs = inject(Dialog);
  #router = inject(Router);

  #deviceSize = inject(DeviceSizeTrackingService);

  onMobileDevice = this.#deviceSize.deviceSize.pipe(
    map(w => w < 1170),
    distinctUntilChanged()
  );

  hasOnigiri = signal(false);

  canSwitchToOnigiri = signal(false);
  showDiscoverOnigiri = signal(false);

  ngOnInit() {
    setUserHasOneePageCookie();

    this.#refreshOnigiriSubscription();
  }

  discoverOnigiri = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        const dialog = this.#dialogs.open(ExploreOnigiriModalComponent, {
          width: '860px'
        });

        return dialog.closed;
      })
    )
  );

  switchToOnigiri() {
    redirectToOnigiriInvoices();
  }

  async signOut() {
    dropUserHasOneePageCookie();
    await this.#auth.signOut();
    await this.#router.navigateByUrl('/signin');
  }

  #refreshOnigiriSubscription = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        return this.#accountApi.getOnigiriStatus().pipe(
          tapResponse(
            r => {
              this.showDiscoverOnigiri.set(!r.is_registered);
              this.canSwitchToOnigiri.set(r.is_registered);
            },
            e => {
              this.showDiscoverOnigiri.set(true);
            }
          )
        );
      })
    )
  );
}
