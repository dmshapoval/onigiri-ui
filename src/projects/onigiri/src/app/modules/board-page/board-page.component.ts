import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject
} from "@angular/core";
import { IconKey } from "@onigiri-models";
import { IsNewChipComponent } from "@oni-shared";
import { differenceInCalendarDays } from "date-fns";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MessageService } from "primeng/api";
import { AsyncPipe } from "@angular/common";
import {
  OnigiriButtonComponent,
  ComingSoonChipComponent,
  OnigiriIconComponent
} from "@oni-shared";
import { UserProfileBtnComponent } from "./user-profile-btn/user-profile-btn.component";
import { ToastModule } from "primeng/toast";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from "@angular/router";
import { AppNavStore } from "../../store/app-nav.store";
import { isNil } from "lodash";
import { AccountStore } from "@onigiri-store";

interface NavLinkItem {
  label: string;
  icon: IconKey;
  route: string;
  disabled: boolean;
  isNew: boolean;
}

@UntilDestroy()
@Component({
  selector: "board-page",
  standalone: true,
  templateUrl: "./board-page.component.html",
  styleUrls: ["./board-page.component.scss"],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent,
    ToastModule,
    ComingSoonChipComponent,
    IsNewChipComponent,
    AsyncPipe,
    UserProfileBtnComponent,
    OnigiriButtonComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ]
})
export class BoardPageComponent implements OnInit {
  #navStore = inject(AppNavStore);
  #account = inject(AccountStore);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  expiresInDays = computed(() => {
    const subscription = this.#account.subscription();
    if (!subscription) {
      return null;
    }

    return Math.max(
      differenceInCalendarDays(subscription.expiresAt, new Date()),
      0
    );
  });

  showNavSidebar = computed(() => {
    const navData = this.#navStore.navData();
    return navData && !navData["hideNav"];
  });

  upgradeSubscriptionBtn = computed(() => {
    const subscription = this.#account.subscription();
    const expiresInDays = this.expiresInDays();

    const isTrial = subscription?.type === "trial";
    const expired = isNil(expiresInDays) || expiresInDays <= 0;
    const notActive =
      subscription?.type === "enterprise" && subscription.status !== "active";

    return {
      showBtn: isTrial || expired || notActive,
      text:
        isTrial && expiresInDays
          ? `${expiresInDays} days left. Upgrade`
          : "Upgrade"
    };
  });

  navLinks: NavLinkItem[] = [
    {
      label: "Dashboard",
      icon: "dashboard",
      route: "./dashboard",
      disabled: false,
      isNew: false
    },
    {
      label: "Clients",
      icon: "customers",
      route: "./clients",
      disabled: false,
      isNew: false
    },
    /*{
    label: 'Projects',
    icon: 'projects',
    route: './projects',
    disabled: false,
    isNew: false
  }, */ {
      label: "Invoices",
      icon: "invoices",
      route: "./invoices",
      disabled: false,
      isNew: false
    },
    /* {
    label: 'Proposals',
    icon: 'contracts',
    route: './#',
    disabled: true,
    isNew: false
  },*/ {
      label: "Items & Services",
      icon: "services",
      route: "./services",
      disabled: false,
      isNew: false
    },
    {
      label: "Page",
      icon: "page",
      route: "./page",
      disabled: false,
      isNew: false
    }
  ];

  ngOnInit() {}

  upgradeSubscription() {
    this.#router.navigateByUrl("/upgrade-subscription");
  }
}
