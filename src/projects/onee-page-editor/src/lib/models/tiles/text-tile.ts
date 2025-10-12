import { TileViewConfig } from './shared';

export interface TextTile {
  id: string;
  type: 'text';
  text: string | null;
  viewConfig: TileViewConfig;
}

export const NULL_TEXT_TILE: TextTile = {
  id: 'txt_null',
  type: 'text',
  text: null,
  viewConfig: {
    desktop: null,
    mobile: null
  }
};
