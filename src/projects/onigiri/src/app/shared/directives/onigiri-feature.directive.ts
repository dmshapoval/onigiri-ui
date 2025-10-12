import { Directive, ElementRef, Input, OnInit, Renderer2, TemplateRef, ViewContainerRef, inject } from "@angular/core";
import { environment } from "../../../environments/environment";

type Features = typeof environment.features;

@Directive({
  selector: '[oFeature]',
  standalone: true,
  host: {}
})
export class OnigiriFeature implements OnInit {

  @Input('oFeature') feature: keyof Features;

  private templateRef = inject(TemplateRef<any>)
  private viewContainer = inject(ViewContainerRef);

  // private _el = inject(ElementRef);
  // private _renderer = inject(Renderer2);

  ngOnInit(): void {
    if (environment.features[this.feature]) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }

    // this._renderer.setStyle(this._el.nativeElement, 'display', 'none !important');
  }
}