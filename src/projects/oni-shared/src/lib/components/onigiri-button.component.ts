import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  input,
  Input,
  Output
} from '@angular/core';
import { coerceBooleanProperty, BooleanInput } from '@angular/cdk/coercion';
import { InlineLoaderComponent } from './inline-loader/inline-loader.component';
import { IconKey, OnigiriIconComponent } from './onigiri-icon.component';

@Component({
  selector: 'o-button',
  standalone: true,
  imports: [OnigiriIconComponent, InlineLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="o-button"
      [class.o-button--primary]="!secondary"
      [class.o-button--secondary]="secondary"
      [class.o-button--danger]="danger"
      [class.o-button--text]="textButton"
      [disabled]="disabled">
      @if(showLoader()) {

      <inline-loader />

      } @else { @if(icon() && iconPosition() === 'before') {
      <o-icon
        [key]="icon()!"
        style="margin-right: 10px;" />
      }

      <div class="o-text-main font-semibold">
        <ng-content></ng-content>
      </div>

      @if(icon() && iconPosition() === 'after') {
      <o-icon
        [key]="icon()!"
        style="margin-left: 10px;" />
      } }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `
  ]
})
export class OnigiriButtonComponent {
  @Output() onClick = new EventEmitter<Event>();

  @HostListener('click', ['$event']) handleClicked($event: Event) {
    $event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.onClick.emit($event);
  }

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  @Input()
  get secondary() {
    return this._secondary;
  }
  set secondary(value: BooleanInput) {
    this._secondary = coerceBooleanProperty(value);
  }
  private _secondary = false;

  @Input()
  get danger() {
    return this._danger;
  }
  set danger(value: BooleanInput) {
    this._danger = coerceBooleanProperty(value);
  }
  private _danger = false;

  @Input()
  get textButton() {
    return this._textButton;
  }
  set textButton(value: BooleanInput) {
    this._textButton = coerceBooleanProperty(value);
  }
  private _textButton = false;

  iconPosition = input<'before' | 'after'>('before');
  icon = input<IconKey | null>();

  showLoader = input(false);
}
