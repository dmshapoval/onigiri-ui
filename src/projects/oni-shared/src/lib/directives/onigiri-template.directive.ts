import { Directive, Input, TemplateRef, inject } from "@angular/core";

@Directive({
  selector: '[oTemplate]',
  standalone: true
})
export class OnigiriTemplate {

  @Input() type: string | undefined;
  @Input('oTemplate') name: string | undefined;

  template = inject(TemplateRef<any>)

  getType(): string {
    return this.name!;
  }
}