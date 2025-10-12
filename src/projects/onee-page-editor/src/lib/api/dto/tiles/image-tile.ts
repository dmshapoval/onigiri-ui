import { ImageTile } from '../../../models';
import { TileViewConfigDto } from './view-config';

export interface ImageTileDto {
  tile_id: string;
  type: 'image';
  view_config: TileViewConfigDto;
  data: {
    image_id: string | null;
    caption: string | null;
    link: string | null;
  };
}

export interface UpdateImageTileDto {
  tile_id: string;
  type: 'image';
  data: {
    caption: string | null;
    link: string | null;
  };
}

export function toImageTile(dto: ImageTileDto): ImageTile {
  return {
    id: dto.tile_id,
    viewConfig: dto.view_config,
    type: 'image',
    imgId: dto.data.image_id,
    link: dto.data.link,
    caption: dto.data.caption
  };
}

export function toImageTileDto(d: ImageTile): ImageTileDto {
  return {
    tile_id: d.id,
    view_config: d.viewConfig,
    type: 'image',
    data: {
      image_id: d.imgId,
      caption: d.caption,
      link: d.link
    }
  };
}

export function toUpdateImageTileDto(d: ImageTile): UpdateImageTileDto {
  return {
    tile_id: d.id,
    type: 'image',
    data: {
      caption: d.caption,
      link: d.link
    }
  };
}
