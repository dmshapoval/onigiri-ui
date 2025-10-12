import { ImageTile } from './image-tile';
import { CreateLinkTileData, LinkTile } from './link-tile';
import { ImageTilePreview, LinkTilePreview, PreviewTile } from './preview-tile';
import { TextTile } from './text-tile';
import { TitleTile } from './title-tile';

export * from './shared';
export * from './link-tile';
export * from './image-tile';
export * from './text-tile';
export * from './title-tile';
export * from './preview-tile';

export type PageTile =
  | ImageTile
  | TextTile
  | TitleTile
  | PreviewTile
  | LinkTile;

export type PersistedTile = Exclude<PageTile, PreviewTile>;

export function isPersistedTile(x: PageTile): x is PersistedTile {
  return x.type !== 'preview';
}

export type TileWithoutViewConfig =
  | Omit<ImageTile, 'viewConfig'>
  | Omit<TitleTile, 'viewConfig'>
  | Omit<TextTile, 'viewConfig'>
  | Omit<ImageTilePreview, 'viewConfig'>
  | Omit<LinkTilePreview, 'viewConfig'>
  | Omit<LinkTile, 'viewConfig'>;

export type TileType = PageTile['type'];

export type CreateTileData =
  | CreateLinkTileData
  | ImageTile
  | TextTile
  | TitleTile;
