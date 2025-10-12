import {
  ChangeDetectorRef,
  Directive,
  effect,
  HostBinding,
  inject
} from '@angular/core';
import { match } from 'ts-pattern';
import { createTileSizeSelector } from '../selectors';

@Directive({ selector: '[withTileSize]', standalone: true })
export class TileSizeDirective {
  #size = createTileSizeSelector();

  @HostBinding('class.tile-size--sm-h')
  isSmHorisontal = false;

  @HostBinding('class.tile-size--sm-sq')
  isSmSquare = false;

  @HostBinding('class.tile-size--md-h')
  isMdHorisontal = false;

  @HostBinding('class.tile-size--md-v')
  isMdVertical = false;

  @HostBinding('class.tile-size--lg-sq')
  isLgSquare = false;

  @HostBinding('class.tile-size--rows-1')
  oneRow = false;

  @HostBinding('class.tile-size--rows-2')
  twoRows = false;

  @HostBinding('class.tile-size--rows-4')
  fourRows = false;

  @HostBinding('class.tile-size--cols-1')
  oneColumn = false;

  @HostBinding('class.tile-size--cols-2')
  twoColumns = false;

  @HostBinding('class.tile-size--cols-4')
  fourColumns = false;

  @HostBinding('style.--tile-width')
  widthVar = '175px';

  @HostBinding('style.--tile-height')
  heightVar = '67.5px';

  #cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const size = this.#size();
      this.oneRow = size.height === 1;
      this.twoRows = size.height === 2;
      this.fourRows = size.height === 4;

      this.heightVar = match(size.height)
        .with(1, () => '67.5px')
        .with(2, () => '175px')
        .otherwise(() => '390px');

      this.oneColumn = size.width === 1;
      this.twoColumns = size.width === 2;
      this.fourColumns = size.width === 4;

      this.widthVar = match(size.width)
        .with(1, () => '175px')
        .with(2, () => '390px')
        .otherwise(() => '800px');

      this.isSmHorisontal = size.height === 1 && size.width >= 2;
      this.isSmSquare = size.height === 2 && size.width === 1;
      this.isMdHorisontal = size.height === 2 && size.width === 2;
      this.isMdVertical = size.height === 4 && size.width === 1;
      this.isLgSquare = size.height === 4 && size.width === 2;

      this.#cdr.markForCheck();
    });
  }
}
