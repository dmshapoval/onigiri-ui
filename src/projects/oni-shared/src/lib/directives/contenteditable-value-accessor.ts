import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnDestroy,
  Renderer2,
  SecurityContext
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { constVoid } from 'fp-ts/es6/function';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import { debounceTime, filter, map, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { match } from 'ts-pattern';

/*
 * This is a barebones contenteditable {@link ControlValueAccessor} allowing you to use
 * Angular forms with native contenteditable HTML. For security reasons you might want
 * to consider sanitizing pasted/dropped content before using it. Also make sure that
 * you do not set any dangerous content as control value yourself, because directive
 * just outputs control value as-is.
 */
@Directive({
  selector:
    '[contenteditable][formControlName], [contenteditable][formControl], [contenteditable][ngModel]',
  standalone: true,

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContenteditableValueAccessor),
      multi: true
    }
  ]
})
export class ContenteditableValueAccessor
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  /*
   * MutationObserver IE11 fallback (as opposed to input event for modern browsers).
   * When mutation removes a tag, i.e. delete is pressed on the last remaining character
   * inside a tag — callback is triggered before the DOM is actually changed, therefore
   * setTimeout is used
   */
  // #observer = new MutationObserver(() => {
  //   setTimeout(() => {
  //     this.#onChange(
  //       this.#processValue(this.#elementRef.nativeElement.innerHTML)
  //     );
  //   });
  // });

  #onTouched = constVoid;
  #onChange: (value: string) => void = constVoid;

  elementRef = inject(ElementRef);
  #renderer = inject(Renderer2);
  // #sanitizer = inject(DomSanitizer);
  #sanitizer = inject(NgDompurifySanitizer);
  #cdr = inject(ChangeDetectorRef);
  #changes = new Subject<void>();

  @Input() maxLength: number | null = null;

  get currentLength() {
    return (this.elementRef.nativeElement.innerText || '').length;
  }

  get isReachedLimit() {
    return this.maxLength && this.maxLength <= this.currentLength;
  }

  constructor() {
    this.#changes
      .pipe(
        filter(() => this.elementRef.nativeElement.innerHTML === '<br>'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.#renderer.setProperty(
          this.elementRef.nativeElement,
          'innerHTML',
          ''
        );
      });

    this.#changes
      .pipe(
        debounceTime(300),
        map(() => this.elementRef.nativeElement.innerHTML),
        map(v => this.#processValue(v)),
        //tap(v => console.log(v)),
        takeUntilDestroyed()
      )
      .subscribe(v => {
        //console.log('CE ', v);

        this.#onChange(v === '<br>' ? '' : v);
      });
  }

  /*
   * To support IE11 MutationObserver is used to monitor changes to the content
   */
  ngAfterViewInit() {
    // this.#observer.observe(this.#elementRef.nativeElement, {
    //   characterData: true,
    //   childList: true,
    //   subtree: true
    // });
  }

  /*
   * Disconnect MutationObserver IE11 fallback on destroy
   */
  ngOnDestroy() {
    // this.#observer.disconnect();
  }

  /*
   * Listen to input events to write innerHTML value into control,
   * also disconnect MutationObserver as it is not needed if this
   * event works in current browser
   */
  @HostListener('input')
  onInput() {
    // this.#observer.disconnect();
    // this.#onChange(
    //   this.#processValue(this.#elementRef.nativeElement.innerHTML)
    // );

    //console.log(this.elementRef.nativeElement.innerHTML);

    this.#changes.next();

    // this._refreshEmptyStateFlag();
  }

  @HostListener('paste')
  onPaste() {
    setTimeout(() => {
      const sanitized = this.#processValue(
        this.elementRef.nativeElement.innerText
      );

      const value = truncateIfNeeded(sanitized, this.maxLength);

      this.#renderer.setProperty(
        this.elementRef.nativeElement,
        'innerHTML',
        value
      );

      this.#changes.next();
      this.#cdr.markForCheck();
    }, 0);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.isReachedLimit && !isAllowedOnLimit(e)) {
      e.preventDefault();
      return false;
    }

    return true;
  }

  @HostListener('blur')
  onBlur() {
    this.#onTouched();
  }

  @HostBinding('class.empty')
  get contentIsEmpty() {
    return isEmpty(this.elementRef.nativeElement.innerText);
  }

  writeValue(value: string | null) {
    this.#renderer.setProperty(
      this.elementRef.nativeElement,
      'innerHTML',
      value
    );

    this.#cdr.markForCheck();
    // this._refreshEmptyStateFlag();
  }

  registerOnChange(onChange: (value: string) => void) {
    this.#onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.#onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.#renderer.setAttribute(
      this.elementRef.nativeElement,
      'contenteditable',
      String(!disabled)
    );
  }

  #processValue(value: string | null): string {
    const processed = String(isNil(value) ? '' : value);

    const sanitized = this.#sanitizer.sanitize(
      SecurityContext.HTML,
      processed.trim() === '<br>' ? '' : processed
    );

    return sanitized || '';
  }

  // private _refreshEmptyStateFlag() {
  //   this.contentIsEmpty = isEmpty(
  //     this.elementRef.nativeElement.innerHTML);
  // }
}

function truncateIfNeeded(value: string | null, maxLength: number | null) {
  if (!maxLength || !value) return value;

  return value.length > maxLength ? value.substring(0, maxLength + 1) : value;
}

function isAllowedOnLimit(e: KeyboardEvent) {
  return isSpecial(e) || isNavigation(e) || isSelectionUpdate();
}

function isNavigation(e: KeyboardEvent) {
  return match(e.code)
    .with('ArrowUp', () => true)
    .with('ArrowDown', () => true)
    .with('ArrowRight', () => true)
    .with('ArrowLeft', () => true)
    .otherwise(() => false);
}

function isSpecial(e: KeyboardEvent) {
  return match(e.code)
    .with('Backspace', () => true)
    .with('Shift', () => true)
    .with('Control', () => true)
    .with('Alt', () => true)
    .with('Delete', () => true)
    .otherwise(() => false);
}

function isSelectionUpdate() {
  const sel = document.getSelection()?.toString() || '';

  return sel.length >= 1;
}
