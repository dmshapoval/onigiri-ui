import { animate, style, transition, trigger } from '@angular/animations';

export const thumbMenuAnimation = trigger('thumbMenu', [
  transition(':enter', [
    style({
      top: '-50px',
      opacity: 0
    }),
    animate(
      '200ms 100ms',
      style({
        top: '*',
        opacity: 1
      })
    )
  ]),

  transition(
    ':leave',
    animate('200ms 300ms', style({ opacity: 0, top: '-50px' }))
  )
]);
