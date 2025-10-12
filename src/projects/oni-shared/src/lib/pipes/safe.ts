import { Pipe, PipeTransform, inject } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl
} from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceUrl',
  pure: true,
  standalone: true
})
export class SafeResourceUrlPipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);

  transform(value: string | null): SafeResourceUrl | null {
    if (!value) {
      return null;
    }
    return this._sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}

@Pipe({
  name: 'safeHtml',
  pure: true,
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);

  transform(value: string | null): SafeHtml | null {
    if (!value) {
      return null;
    }
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }
}
