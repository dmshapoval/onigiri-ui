import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TrackingStore, } from '@onigiri-store';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import isNumber from 'lodash/isNumber';
import { TabViewModule } from 'primeng/tabview';
import { BusinessSettingsComponent } from './components/business-settings/business-settings.component';
import { SubscriptionSettingsComponent } from './components/subscription-settings/subscription-settings.component';
import { PaymentsSettingsComponent } from './components/payments-settings/payments-settings.component';
import { AppNavStore } from '../../../store/app-nav.store';

@UntilDestroy()
@Component({
  selector: 'user-settings-page',
  standalone: true,
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TabViewModule,
    BusinessSettingsComponent,
    SubscriptionSettingsComponent,
    PaymentsSettingsComponent
  ]
})
export class SettingsPageComponent implements OnInit {

  #tracking = inject(TrackingStore);
  #cdr = inject(ChangeDetectorRef);

  #route = inject(ActivatedRoute);
  #navStore = inject(AppNavStore);

  activeTab = 0;

  ngOnInit(): void {

    this.#tracking.setTrackingSource('Settings Page');

    // TODO consifer refactoring to signals
    this.#route.queryParams.pipe(
      take(1),
      untilDestroyed(this))
      .subscribe(v => {
        const activeTab = v['t'];

        if (activeTab && isNumber(+activeTab)) {
          this.activeTab = activeTab;
          this.#cdr.markForCheck();
        }
      });
  }

  onTabChanged(t: number) {
    this.#navStore.updateQueryParams({ t });
  }
}

