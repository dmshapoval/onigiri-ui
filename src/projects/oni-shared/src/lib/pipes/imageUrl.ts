import { Pipe, PipeTransform, inject } from '@angular/core';
import { APP_CONFIG } from '../app-config';

@Pipe({
  name: 'oImageUrl',
  standalone: true,
  pure: true
})
export class OnigiriImageUrlPipe implements PipeTransform {
  private _cfAccountHash = inject(APP_CONFIG).cloudflareAccountHash;

  transform(imageId: string | null | undefined): any {
    if (!imageId) {
      return '';
    }

    const cfId = imageId.startsWith('cf:') ? imageId.substring(3) : imageId;

    return `https://imagedelivery.net/${this._cfAccountHash}/${cfId}/public`;
  }
}
