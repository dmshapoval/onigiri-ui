import { TileViewConfig } from './shared';

export interface ImageTilePreview {
  id: string;
  type: 'preview';
  viewConfig: TileViewConfig;
  prefiewFor: 'image';
  imageFile: File;
}

export interface LinkTilePreview {
  id: string;
  type: 'preview';
  viewConfig: TileViewConfig;
  prefiewFor: 'link';
  url: string;
}

export type PreviewTile = ImageTilePreview | LinkTilePreview;

export const NULL_PREVIEW_TILE: PreviewTile = {
  id: 'preview_null',
  type: 'preview',
  prefiewFor: 'link',
  url: '',
  viewConfig: {
    desktop: null,
    mobile: null
  }
};
