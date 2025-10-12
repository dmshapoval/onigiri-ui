import {
  PageViewType,
  TileDeviceViewConfig,
  TilePosition,
  TileSize,
  TileViewConfig
} from '../../../models';

export interface TileSizeDto {
  width: number;
  height: number;
}

export interface TilePositionDto {
  column: number;
  row: number;
}

export interface TileViewConfigDto {
  mobile: TileDeviceViewConfigDto | null;
  desktop: TileDeviceViewConfigDto | null;
}

export interface TileDeviceViewConfigDto {
  position: TilePositionDto;
  size: TileSizeDto;
}

export interface TileViewConfigUpdateRequestDto {
  view_type: PageViewType;
  items: {
    tile_id: string;
    config: TileDeviceViewConfigDto;
  }[];
}

// export function toTileViewConfig(dto: TileViewConfigDto): TileViewConfig {
//   return {
//     mobile: dto.mobile ? toTileDeviceViewConfig(dto.mobile) : null,
//     desktop: dto.desktop ? toTileDeviceViewConfig(dto.desktop) : null,
//   };
// }

function toTileDeviceViewConfig(data: TileDeviceViewConfigDto) {
  const position: TilePosition = {
    row: data.position.row,
    column: data.position.column
  };

  const size: TileSize = {
    width: data.size.width,
    height: data.size.height
  };

  return { position, size };
}

export function toTileViewConfigDto(data: TileViewConfig): TileViewConfigDto {
  return {
    mobile: data.mobile ? toTileDeviceViewConfigDto(data.mobile) : null,
    desktop: data.desktop ? toTileDeviceViewConfigDto(data.desktop) : null
  };
}

export function toTileDeviceViewConfigDto(
  data: TileDeviceViewConfig
): TileDeviceViewConfigDto {
  const position: TilePosition = {
    row: data.position.row,
    column: data.position.column
  };

  const size: TileSize = {
    width: data.size.width,
    height: data.size.height
  };

  return { position, size };
}
