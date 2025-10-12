import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import {
  InlineLoaderComponent,
  OnigiriIconComponent,
  exhaustiveCheck
} from "@oni-shared";
import { IconKey, RequestStatus } from "@onigiri-models";

@Component({
  selector: "send-invoice-button",
  standalone: true,
  template: `
    <button
      class="send-invoice-btn o-button o-h-40"
      [class.o-button--primary]="
        status === 'not_started' || status === 'running'
      "
      [class.o-button--secondary]="status === 'completed'"
      [class.o-button--text]="status === 'completed'"
      [style.width]="status === 'completed' ? 'auto' : '150px'"
      [disabled]="disabled"
      (click)="handleClick()">
      @if(buttonIconKey) {
      <o-icon
        [key]="buttonIconKey"
        class="o-color-green-800"
        style="margin-right: 10px" />
      } @if(buttonText) {
      <span class="o-text-main font-semibold"> {{ buttonText }} </span>
      } @if(showAnimation) { <inline-loader style="color: white" /> }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .send-invoice-btn {
        overflow: hidden;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OnigiriIconComponent, InlineLoaderComponent]
})
export class SendInvoiceButtonComponent {
  @Output() onClick = new EventEmitter();

  @Input() disabled = false;
  @Input() status: RequestStatus = "not_started";

  get buttonText() {
    switch (this.status) {
      case "not_started":
        return "Send Now";
      case "completed":
        return "Invoice Sent";
      case "running":
        return "";
      case "failed":
        return "";
      default: {
        exhaustiveCheck(this.status);
        return "";
      }
    }
  }

  get buttonIconKey(): IconKey | null {
    switch (this.status) {
      case "not_started":
        return null;
      case "completed":
        return "check";
      case "running":
        return null;
      case "failed":
        return null;
      default: {
        exhaustiveCheck(this.status);
        return null;
      }
    }
  }

  get showAnimation() {
    return this.status === "running" || this.status === "failed";
  }

  handleClick() {
    if (this.disabled) {
      return;
    }
    this.onClick.emit();
  }
}
