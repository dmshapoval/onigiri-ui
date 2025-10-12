import { TileViewConfig } from './shared';

export interface TitleTile {
  id: string;
  type: 'title';
  text: string | null;
  viewConfig: TileViewConfig;
}

export const NULL_TITLE_TILE: TitleTile = {
  id: 'txt_null',
  type: 'title',
  text: null,
  viewConfig: {
    desktop: null,
    mobile: null
  }
};
