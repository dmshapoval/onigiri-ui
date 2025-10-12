import { TitleTile } from '../../../models';
import { TileViewConfigDto } from './view-config';

export interface TitleTileDto {
  tile_id: string;
  type: 'title';
  view_config: TileViewConfigDto;
  data: {
    text: string | null;
  };
}

export type UpdateTitleTileDto = Omit<TitleTileDto, 'view_config'>;

export function toTitleTile(d: TitleTileDto): TitleTile {
  return {
    id: d.tile_id,
    viewConfig: d.view_config,
    type: 'title',
    text: d.data.text
  };
}

export function toTitleTileDto(d: TitleTile): TitleTileDto {
  return {
    tile_id: d.id,
    view_config: d.viewConfig,
    type: 'title',
    data: {
      text: d.text
    }
  };
}
