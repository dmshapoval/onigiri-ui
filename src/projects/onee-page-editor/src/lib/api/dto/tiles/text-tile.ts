import { TextTile } from '../../../models';
import { TileViewConfigDto } from './view-config';

export interface TextTileDto {
  tile_id: string;
  type: 'text';
  view_config: TileViewConfigDto;
  data: {
    text: string | null;
  };
}

export type UpdateTextTileDto = Omit<TextTileDto, 'view_config'>;

export function toTextTile(d: TextTileDto): TextTile {
  return {
    id: d.tile_id,
    viewConfig: d.view_config,
    type: 'text',
    text: d.data.text
  };
}

export function toTextTileDto(d: TextTile): TextTileDto {
  return {
    tile_id: d.id,
    type: 'text',
    view_config: d.viewConfig,
    data: {
      text: d.text
    }
  };
}

export function toUpdateTileDto(d: TextTile): UpdateTextTileDto {
  return {
    tile_id: d.id,
    type: 'text',
    data: {
      text: d.text
    }
  };
}
