import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  Renderer2,
  SecurityContext,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { match } from 'ts-pattern';
import { isNil } from '../../tools';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RichText } from '../../models';

@Component({
  standalone: true,
  imports: [],
  selector: 'rich-text-editor',
  templateUrl: 'rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RichTextEditorComponent implements OnInit, AfterViewInit {
  value = model<RichText | null>();

  maxLength = input.required<number>();
  placeholder = input<string>('');
  lineClamp = input<number>();

  isReadOnly = input<boolean>(false);

  #sanitizer = inject(NgDompurifySanitizer);
  #cdr = inject(ChangeDetectorRef);
  #renderer = inject(Renderer2);

  #changes = new Subject<void>();

  contentInput = viewChild<ElementRef<HTMLDivElement>>('contentInput');

  #innerValue = signal<RichText>({
    html: '',
    text: ''
  });

  constructor() {
    effect(
      () => {
        const html = this.value()?.html || '';
        const text = this.value()?.text || '';
        const inner = untracked(() => this.#innerValue());

        if (html !== inner.html) {
          this.#setContent(html);
          this.#innerValue.set({ html, text });
          this.#cdr.markForCheck();
        }
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const isEditable = !this.isReadOnly();
      const inputEl = this.contentInput();

      if (inputEl) {
        this.#renderer.setAttribute(
          inputEl.nativeElement,
          'contenteditable',
          isEditable.toString()
        );
      }
    });

    this.#changes.pipe(takeUntilDestroyed()).subscribe(() => {
      const el = this.contentInput()?.nativeElement;
      const html = this.#processValue(el?.innerHTML || '');
      const text = el?.innerText || '';

      this.#innerValue.set({ html, text });
      this.value.set(html ? { html, text } : null);
    });
  }

  ngAfterViewInit(): void {
    const value = this.value()?.html || '';
    this.#setContent(value);
  }

  ngOnInit(): void {}

  onInput() {
    setTimeout(() => {
      this.#changes.next();
    }, 0);
  }

  onPaste(ev: ClipboardEvent) {
    ev.preventDefault();

    let text = ev.clipboardData?.getData('text/plain') || '';
    text =
      text.length <= this.maxLength()
        ? text
        : text.substring(0, this.maxLength());

    // const innerHtml = this.contentInput()?.nativeElement.innerHTML || '';

    try {
      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
      } else {
        // Insert text at the current position of caret
        const range = document.getSelection()!.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } catch (error) {}

    setTimeout(() => {
      this.#changes.next();
    }, 0);
  }

  onKeyDown(e: KeyboardEvent) {
    const currentLength = this.value()?.text.length || 0;
    const isReachedLimit = currentLength >= this.maxLength();

    if (isReachedLimit && !isAllowedOnLimit(e)) {
      e.preventDefault();
      return false;
    }

    return true;
  }

  #processValue(value: string | null): string {
    const processed = String(isNil(value) ? '' : value);

    const sanitized = this.#sanitizer.sanitize(
      SecurityContext.HTML,
      processed.trim() === '<br>' ? '' : processed
    );

    return sanitized || '';
  }

  #setContent(v: string) {
    const input = this.contentInput()?.nativeElement;
    //const container = this.contentContainer()?.nativeElement;

    if (input) {
      this.#renderer.setProperty(input, 'innerHTML', v);
    }

    // if (container) {
    //   this.#renderer.setProperty(container, 'innerHTML', v);
    // }
  }
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
