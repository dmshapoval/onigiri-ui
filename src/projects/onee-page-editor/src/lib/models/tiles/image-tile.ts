import { TileViewConfig } from './shared';

export interface ImageTile {
  id: string;
  type: 'image';
  imgId: string | null;
  link: string | null;
  caption: string | null;
  viewConfig: TileViewConfig;
}

export const NULL_IMAGE_TILE: ImageTile = {
  id: 'img_null',
  type: 'image',
  imgId: null,
  link: null,
  caption: null,
  viewConfig: {
    desktop: null,
    mobile: null
  }
};
