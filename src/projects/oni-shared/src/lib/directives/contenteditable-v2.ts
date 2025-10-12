import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  Input,
  model,
  OnDestroy,
  Renderer2,
  SecurityContext,
  signal,
  untracked
} from '@angular/core';
import { constVoid } from 'fp-ts/es6/function';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import { debounceTime, filter, map, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { match } from 'ts-pattern';

interface RichText {
  original: string;
  processed: string;
}

/*
 * This is a barebones contenteditable {@link ControlValueAccessor} allowing you to use
 * Angular forms with native contenteditable HTML. For security reasons you might want
 * to consider sanitizing pasted/dropped content before using it. Also make sure that
 * you do not set any dangerous content as control value yourself, because directive
 * just outputs control value as-is.
 */
@Directive({
  selector: '[contenteditable]',
  standalone: true
})
export class ContenteditableV2 {
  content = model<string>();

  elementRef = inject(ElementRef);

  #renderer = inject(Renderer2);
  #sanitizer = inject(NgDompurifySanitizer);
  #changes = new Subject<void>();
  #processedContent = signal<string | null>(null);
  #cdr = inject(ChangeDetectorRef);

  @Input() maxLength: number | null = null;

  get currentLength() {
    return (this.elementRef.nativeElement.innerText || '').length;
  }

  get isReachedLimit() {
    return this.maxLength && this.maxLength <= this.currentLength;
  }

  constructor() {
    const el = this.elementRef.nativeElement;

    this.#changes
      .pipe(
        filter(() => el.innerHTML === '<br>'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.#renderer.setProperty(el, 'innerHTML', '');
      });

    this.#changes
      .pipe(
        map(() => el.innerHTML),
        takeUntilDestroyed()
      )
      .subscribe(v => {
        //console.log('CE ', v);

        const processed = this.#processValue(v);
        this.#processedContent.set(processed);

        setTimeout(() => {
          this.content.set(processed);
        }, 0);
      });

    effect(() => {
      const fromParent = this.content();
      const inner = untracked(this.#processedContent);

      if (fromParent !== inner) {
        this.#renderer.setProperty(el, 'innerHTML', fromParent);
        this.#cdr.markForCheck();
      }
    });
  }

  /*
   * Listen to input events to write innerHTML value into control,
   * also disconnect MutationObserver as it is not needed if this
   * event works in current browser
   */
  @HostListener('input')
  onInput() {
    this.#changes.next();
  }

  @HostListener('paste')
  onPaste() {
    const el = this.elementRef.nativeElement;

    setTimeout(() => {
      const sanitized = this.#processValue(el.innerText);

      const value = truncateIfNeeded(sanitized, this.maxLength);
      this.#renderer.setProperty(el, 'innerHTML', value);

      this.#changes.next();
      // this.#cdr.markForCheck();
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

  @HostBinding('class.empty')
  get contentIsEmpty() {
    return isEmpty(this.elementRef.nativeElement.innerText);
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
