import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Observable, map } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { OnigiriIconComponent, whenIsNotNull } from '@oni-shared';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AccountStore } from '@onigiri-store';

@UntilDestroy()
@Component({
  selector: 'user-profile-btn',
  standalone: true,
  templateUrl: './user-profile-btn.component.html',
  styleUrls: ['./user-profile-btn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    OnigiriIconComponent
  ]
})
export class UserProfileBtnComponent implements OnInit {

  #auth = inject(Auth);
  #router = inject(Router);
  account = inject(AccountStore);
  #sanitizer = inject(DomSanitizer);

  avatarLoadFailed = signal(false);
  userPhoto$: Observable<SafeUrl | null>;

  ngOnInit(): void {

    this.userPhoto$ = user(this.#auth).pipe(
      whenIsNotNull,
      map(u => u.photoURL ? this.#sanitizer.bypassSecurityTrustUrl(u.photoURL) : null)
    );
  }

  async signOut() {
    await this.#auth.signOut();
    this.#router.navigateByUrl('/signin');
  }
}
