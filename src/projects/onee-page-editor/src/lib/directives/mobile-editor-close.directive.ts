import { Directive, HostListener, inject } from '@angular/core';
import { PageEditorMediator } from '../mediator';

@Directive({ selector: '[mobileEditorClose]', standalone: true })
export class MobileEditorCloseDirective {
  #mediator = inject(PageEditorMediator);

  @HostListener('click')
  onClick() {
    this.#mediator.send({
      _type: 'close-mobile-editor'
    });
  }
}
