import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal
} from "@angular/core";
import { RequestStatus } from "@onigiri-models";
import { Observable, Subject, of, catchError, concatMap } from "rxjs";
import { saveAs } from "file-saver";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { InlineLoaderComponent, OnigiriIconComponent } from "@oni-shared";

@UntilDestroy()
@Component({
  selector: "download-invoice-pdf-button",
  standalone: true,
  imports: [OnigiriIconComponent, InlineLoaderComponent],
  template: `
    <button
      class="download-pdf-btn o-button o-button--secondary o-h-40"
      [disabled]="status() === 'running'"
      (click)="requests$.next()">
      @if(status() !== 'running') {
      <o-icon
        key="download"
        style="margin-right: 10px; height:16px;" />

      <span> Download PDF </span>
      } @if(status() === 'running') {
      <inline-loader class="o-color-grey-800" />
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .download-pdf-btn {
        overflow: hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadInvoicePDFButtonComponent implements OnInit {
  @Output() onClick = new EventEmitter();

  @Input({ required: true }) requestHandler: () => Observable<string | null>;

  requests$ = new Subject<void>();

  status = signal<RequestStatus>("not_started");

  ngOnInit(): void {
    this.requests$
      .pipe(
        concatMap(() => {
          this.status.set("running");
          return this.requestHandler ? this.requestHandler() : of(null);
        }),
        catchError(e => of(null)),
        untilDestroyed(this)
      )
      .subscribe(fileUrl => {
        this.status.set("completed");

        if (fileUrl) {
          saveAs(fileUrl);
        }
      });
  }
}
