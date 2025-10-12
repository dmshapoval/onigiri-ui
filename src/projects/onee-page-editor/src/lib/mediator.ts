import { Injectable } from '@angular/core';
import { HasType } from '@oni-shared';
import { Subject } from 'rxjs';
import { TileType } from './models';

export type Msg =
  | HasType<'close-mobile-editor'>
  | HasType<'edit-settings'>
  | HasType<'edit-bg'>
  | HasType<'share-page'>
  | (HasType<'scroll_to_tile'> & { tileId: string })
  | (HasType<'select_tile'> & { tileId: string })
  | (HasType<'edit_tile'> & {
      tileId: string;
      tileType: TileType;
    });

@Injectable()
export class PageEditorMediator {
  #messages = new Subject<Msg>();

  messages = this.#messages.asObservable();

  send(msg: Msg) {
    this.#messages.next(msg);
  }

  schedule(delay: number, msg: Msg) {
    setTimeout(() => {
      this.#messages.next(msg);
    }, delay);
  }
}
