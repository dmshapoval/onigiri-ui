import {
  style,
  animate,
  trigger,
  transition,
  state
} from '@angular/animations';

export const mobileActionsAnimation = trigger('mobileActions', [
  transition(':enter', [
    style({ opacity: 0.4, top: '-40px' }),
    animate('200ms', style({ opacity: 1, top: '-20px' }))
  ]),

  transition(':leave', animate('200ms', style({ opacity: 0, top: '-40px' })))
]);

export const desktopMenuAnimation = trigger('desktopMenu', [
  transition(':enter', [
    style({
      bottom: '-60px',
      opacity: 0
    }),
    animate(
      '200ms 100ms',
      style({
        bottom: '*',
        opacity: 1
      })
    )
  ]),

  transition(
    ':leave',
    animate('200ms 300ms', style({ opacity: 0, bottom: '-60px' }))
  )
]);

export const dragHandlerAnimation = trigger('dragHandler', [
  state('visible', style({ opacity: 1, bottom: '-20px', display: 'flex' })),
  state('hidden', style({ opacity: 0, display: 'none' })),

  transition('hidden => visible', [
    style({
      display: 'flex',
      bottom: '-40px',
      opacity: 0
    }),
    animate(
      '200ms',
      style({
        bottom: '-20px',
        opacity: 1
      })
    )
  ]),

  transition(
    'visible => hidden',
    animate(
      '200ms',
      style({
        opacity: 0,
        bottom: '-40px'
      })
    )
  )
]);
