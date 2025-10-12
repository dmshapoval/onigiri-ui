import { inject } from '@angular/core';
import { TileContainerComponent } from './tile-container/tile-container.component';

export function isHovered() {
  const tileContainer = inject(TileContainerComponent);
  return tileContainer.isHovered;
}
