import { Component, inject, OnInit } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { constVoid } from 'fp-ts/es6/function';
import { exhaustMap, from, pipe } from 'rxjs';

import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  imports: [ButtonModule],
  selector: 'sign-in-page',
  templateUrl: 'sign-in-page.component.html'
})
export class SignInPageComponent implements OnInit {

  #auth = inject(Auth);
  #router = inject(Router);

  signInWithGoogle = rxMethod<void>(pipe(
    exhaustMap(() => from(signInWithPopup(this.#auth, new GoogleAuthProvider()))
      .pipe(tapResponse(
        () => this.#router.navigateByUrl(''),
        constVoid)
      )
    )
  ));

  ngOnInit() { }
}