import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  model,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { constVoid } from 'fp-ts/es6/function';
import { TableModule } from 'primeng/table';
import { APP_CONFIG } from '../../../../config';
import {
  concatMap,
  debounceTime,
  delay,
  exhaustMap,
  fromEvent,
  of,
  pipe,
  startWith,
  tap,
  timer
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { Menu, MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { EditUserSubscriptionDialogComponent } from '../../components/edit-user-subscription-dialog/edit-user-subscription-dialog.component';
import { OnigiriUserDto, OneeUserDto } from '../../../../api';

@Component({
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DatePipe,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ReactiveFormsModule,
    TooltipModule,
    MenuModule
  ],
  selector: 'users-list-page',
  templateUrl: 'users-list-page.component.html'
})
export class UsersListPageComponent implements OnInit {
  #http = inject(HttpClient);
  #appConfig = inject(APP_CONFIG);

  #sanitizer = inject(DomSanitizer);
  #router = inject(Router);
  #confirmation = inject(ConfirmationService);
  #messages = inject(MessageService);
  #dialogs = inject(DialogService);

  onigiriUsers = signal<OnigiriUserDto[]>([]);
  oneeUsers = signal<OneeUserDto[]>([]);

  tableScrollHeight = signal('85vh');

  users = computed(() => {
    return combineUsers(this.onigiriUsers(), this.oneeUsers());
  });

  filter = model<string | null>(null);

  toShow = computed(() => {
    const all = this.users();
    const filter = this.filter();

    if (!filter) {
      return all;
    }
    const fv = filter.toLocaleLowerCase();

    return getFilteredUsers(all, fv);
  });

  // selectedUserId = signal<string | null>(null);

  @ViewChild('inlineMenu') inlineMenu: Menu;

  inlineMenuItems = signal<MenuItem[]>([]);

  filterInput = new FormControl<string | null>(null);
  loadingData = signal(false);

  constructor() {
    this.#setupFilter();
    this.#setupTableScrollHeighCalculation();
  }

  ngOnInit() {
    this.#loadOneeUsers();
    this.#loadOnigiriUsers();
  }

  toOneePageUrl(pageKey: string) {
    return this.#sanitizer.bypassSecurityTrustResourceUrl(
      `${this.#appConfig.urls.oneePages}/${pageKey}`
    );
  }

  copyPageUrl(pageKey: string) {
    const url = `${this.#appConfig.urls.oneePages}/${pageKey}`;
    setTimeout(() => {
      navigator.clipboard.writeText(url);
    }, 0);
  }

  onShowInlineMenu(user: AppUser, ev: Event) {
    const menuItems: MenuItem[] = [];

    if (user.onigiri) {
      menuItems.push(
        {
          icon: 'pi pi-search',
          label: 'Show details',
          styleClass: 'text-sm',
          command: () => this.#onShowUserDetails(user.onigiri!.id)
        },
        {
          icon: 'pi pi-user-edit',
          label: 'Onigiri subscription',
          styleClass: 'text-sm',
          command: () => this.#onEditSubscription(user.onigiri!.id)
        }
      );
    }

    if (user.onee) {
      menuItems.push({
        icon: 'pi pi-thumbs-down',
        label: 'Mark as poisonous',
        styleClass: 'text-sm',
        command: () => this.#onMarkAsPoisonous(user)
      });
    }

    menuItems.push(
      {
        separator: true
      },
      {
        icon: 'pi pi-trash',
        label: 'Delete',
        styleClass: 'text-sm',
        command: () => this.#onDeleteUser(user)
      }
    );

    this.inlineMenuItems.set(menuItems);
    this.inlineMenu.toggle(ev);
  }

  onInlineMenuHide() {
    this.inlineMenuItems.set([]);
  }

  #onShowUserDetails(firebaseId: string) {
    this.#router.navigateByUrl(`/users/${firebaseId}`);
  }

  #onEditSubscription = rxMethod<string>(
    pipe(
      exhaustMap(userId => {
        const ref = this.#dialogs.open(EditUserSubscriptionDialogComponent, {
          width: '720px',
          height: '600px',
          data: { userId }
        });

        return ref.onClose.pipe(
          tap(needRefresh => {
            if (needRefresh) {
              this.#loadOnigiriUsers();
            }
          })
        );
      })
    )
  );

  #onMarkAsPoisonous(user: AppUser) {
    this.#confirmation.confirm({
      message: `User <b>${user.email}</b> will be marked as Poisonous. Are you sure?`,
      accept: () => {
        this.#executeMarkAsPoisonous(user.onee!.id);
      }
    });
  }

  #executeMarkAsPoisonous = rxMethod<string>(
    pipe(
      concatMap(userId => {
        return this.#http
          .post(
            `${
              this.#appConfig.urls.onigiri
            }/api/oi/sa/users/${userId}/poisonous`,
            null
          )
          .pipe(
            tapResponse(
              () => {
                this.#messages.add({
                  severity: 'success',
                  summary: 'User marked as poisonous'
                });

                this.#loadOneeUsers;
              },
              () => {
                this.#messages.add({
                  severity: 'error',
                  summary: 'Failed to mark user as poisonous'
                });
              }
            )
          );
      })
    )
  );

  #onDeleteUser(user: AppUser) {
    this.#confirmation.confirm({
      message: `User <b>${user.email}</b> will be completely removed from the app. Are you sure?`,
      accept: () => {
        if (user.onigiri) {
          this.#deleteOnigiriUser(user.onigiri.id);
        }
        if (user.onee) {
          this.#deleteOneeUser(user.onee.id);
        }
      }
    });
  }

  #deleteOnigiriUser = rxMethod<string>(
    pipe(
      concatMap(userId => {
        return this.#http
          .delete(`${this.#appConfig.urls.onigiri}/api/oi/sa/users/${userId}`)
          .pipe(
            tapResponse(
              () => {
                this.#messages.add({
                  severity: 'success',
                  summary: 'Onigiri user deleted'
                });

                this.#loadOnigiriUsers();
              },
              () => {
                this.#messages.add({
                  severity: 'error',
                  summary: 'Failed to delete onigiri user'
                });
              }
            )
          );
      })
    )
  );

  #deleteOneeUser = rxMethod<string>(
    pipe(
      concatMap(userId => {
        return this.#http
          .delete(`${this.#appConfig.urls.oneePages}/api/oi/sa/users/${userId}`)
          .pipe(
            tapResponse(
              () => {
                this.#messages.add({
                  severity: 'success',
                  summary: 'Onee user deleted'
                });

                this.#loadOneeUsers();
              },
              () => {
                this.#messages.add({
                  severity: 'error',
                  summary: 'Failed to delete onee user'
                });
              }
            )
          );
      })
    )
  );

  #loadOneeUsers = rxMethod<void>(
    pipe(
      tap(() => this.loadingData.set(true)),
      exhaustMap(() =>
        this.#http
          .get<OneeUserDto[]>(
            `${this.#appConfig.urls.oneePages}/api/oi/sa/users`
          )
          .pipe(
            tapResponse(
              data => {
                this.oneeUsers.set(data);
                this.loadingData.set(false);
              },
              () => this.loadingData.set(false)
            )
          )
      )
    )
  );

  #loadOnigiriUsers = rxMethod<void>(
    pipe(
      tap(() => this.loadingData.set(true)),
      exhaustMap(() =>
        this.#http
          .get<OnigiriUserDto[]>(
            `${this.#appConfig.urls.onigiri}/api/oi/sa/users`
          )
          .pipe(
            tapResponse(
              data => {
                this.onigiriUsers.set(data);
                this.loadingData.set(false);
              },
              () => this.loadingData.set(false)
            )
          )
      )
    )
  );

  #setupFilter() {
    this.filterInput.valueChanges
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe(v => this.filter.set(v));
  }

  #setupTableScrollHeighCalculation() {
    fromEvent(window, 'resize')
      .pipe(startWith(null), takeUntilDestroyed())
      .subscribe(() => {
        const viewSize = window.innerHeight - 80; // 80px for top menu
        this.tableScrollHeight.set(`${viewSize}px`);
      });
  }
}

interface AppUser {
  firebase_id: string;
  email: string;
  created_at: number;

  onee: OneeUserDto | null;
  onigiri: OnigiriUserDto | null;
}

function combineUsers(
  onigiriUsers: OnigiriUserDto[],
  oneeUsers: OneeUserDto[]
) {
  const fromOnigiri = new Map<string, OnigiriUserDto>(
    onigiriUsers.map(x => [x.firebase_id, x])
  );

  const fromOnee = new Map<string, OneeUserDto>(
    oneeUsers.map(x => [x.firebase_id, x])
  );

  const ids = new Set<string>([...fromOnigiri.keys(), ...fromOnee.keys()]);

  const result = [...ids].map(firebase_id => {
    const onigiri = fromOnigiri.get(firebase_id) || null;
    const onee = fromOnee.get(firebase_id) || null;

    const email = onigiri?.email || onee?.email || '';
    const created_at =
      onigiri?.created_at || onee?.created_at || new Date().getTime();

    const user: AppUser = { firebase_id, email, created_at, onee, onigiri };

    return user;
  });

  result.sort((x, y) => y.created_at - x.created_at);

  return result;
}

function getFilteredUsers(users: AppUser[], filter: string) {
  return users.filter(x => {
    if (x.email.toLocaleLowerCase().indexOf(filter) >= 0) return true;
    if (x.onee && x.onee.page_key.indexOf(filter) >= 0) return true;

    return false;
  });
}

// interface AppUserInfoDto {
//   id: string;
//   email: string;
//   invoices_count: number;
//   page_key: string | null;
//   created_at: number | null;
//   subscription: {
//     type: string;
//     status: string;
//     starts_at: number;
//     expires_at: number | null;
//   }
// }
