import { isNotNil } from '@oni-shared';
import {
  CreateLinkTileData,
  CustomLinkData,
  LinkTile,
  LinkTileFavicon,
  LinkTileImage
} from '../../../models';
import { TileViewConfigDto, toTileViewConfigDto } from './view-config';
import { match } from 'ts-pattern';

export type LinkTileFaviconDto =
  | { type: 'none' }
  | { type: 'pending' }
  | { type: 'url'; url: string }
  | { type: 'custom'; image_id: string }
  | { type: 'resolved'; image_id: string };

export type LinkTileImageDto =
  | { type: 'none' }
  | { type: 'pending' }
  | { type: 'resolved'; image_id: string }
  | { type: 'custom'; image_id: string };

export type CustomLinkDataDto =
  | { type: 'pending' }
  | { type: 'not_resolved' }
  | {
      type: 'resolved';
      title: string | null;
      favicon_url: string | null;
      thumb_img_url: string | null;
    };

export interface LinkTileDto {
  tile_id: string;
  type: 'link';
  view_config: TileViewConfigDto;
  data: {
    url: string;
    title: string | null;
    thumb_img: LinkTileImageDto;
    favicon: LinkTileFaviconDto;
    link_data: CustomLinkDataDto;
  };
}

// interface KnownLinkTileDto {
//   tile_id: string;
//   type: 'link';
//   view_config: TileViewConfigDto;
//   data: {
//     url: string;
//     title: string | null;
//     thumb_img: LinkTileImageDto;
//     resource_info: {
//       favicon_id: string;
//     };
//     link_data: CustomLinkDataDto;
//   };
// }

export interface CreateLinkTileDto {
  tile_id: string;
  type: 'link';
  view_config: TileViewConfigDto;
  data: {
    url: string;
  };
}

export interface UpdateLinkTileDto {
  tile_id: string;
  type: 'link';
  data: {
    title: string | null;
    thumb_img: LinkTileImageDto;
  };
}

export function toCreateLinkTileDto(
  data: CreateLinkTileData
): CreateLinkTileDto {
  return {
    tile_id: data.id,
    type: 'link',
    view_config: toTileViewConfigDto(data.viewConfig),
    data: {
      url: data.url
    }
  };
}

export function toUpdateLinkTileDto(data: LinkTile): UpdateLinkTileDto {
  return {
    tile_id: data.id,
    type: 'link',
    data: {
      title: data.title,
      thumb_img: toLinkTileImageDto(data.thumbImage)
    }
  };
}

function toLinkTileImageDto(dto: LinkTileImage): LinkTileImageDto {
  return match(dto)
    .returnType<LinkTileImageDto>()
    .with({ _type: 'none' }, () => ({ type: 'none' }))
    .with({ _type: 'resolved' }, ({ imageId: image_id }) => ({
      type: 'resolved',
      image_id
    }))
    .with({ _type: 'custom' }, ({ imageId: image_id }) => ({
      type: 'custom',
      image_id
    }))
    .otherwise(() => ({ type: 'none' }));
}

export function toLinkTile(dto: LinkTileDto): LinkTile {
  return {
    id: dto.tile_id,
    type: 'link',
    url: dto.data.url,
    title: dto.data.title,
    favicon: toLinkTileFavicon(dto.data.favicon),
    thumbImage: toLinkTileImage(dto.data.thumb_img),
    viewConfig: dto.view_config,
    linkData: toCustomLinkData(dto.data.link_data)
  };
}

export function toCustomLinkData(dto: CustomLinkDataDto): CustomLinkData {
  return match(dto)
    .returnType<CustomLinkData>()
    .with({ type: 'pending' }, () => ({ _type: 'pending' }))
    .with({ type: 'resolved' }, x => ({
      _type: 'resolved',
      title: x.title,
      faviconUrl: x.favicon_url,
      thumbImgUrl: x.thumb_img_url
    }))
    .otherwise(() => ({ _type: 'not_resolved' }));
}

export function toLinkTileImage(dto: LinkTileImageDto): LinkTileImage {
  return match(dto)
    .returnType<LinkTileImage>()
    .with({ type: 'pending' }, () => ({ _type: 'pending' }))
    .with({ type: 'resolved' }, ({ image_id: imageId }) => ({
      _type: 'resolved',
      imageId
    }))
    .with({ type: 'custom' }, ({ image_id: imageId }) => ({
      _type: 'custom',
      imageId
    }))
    .otherwise(() => ({ _type: 'none' }));
}

export function toLinkTileFavicon(data: LinkTileFaviconDto): LinkTileFavicon {
  return match(data)
    .returnType<LinkTileFavicon>()
    .with({ type: 'pending' }, () => ({ _type: 'pending' }))
    .with({ type: 'url' }, ({ url }) => ({ _type: 'url', url }))
    .with({ type: 'custom' }, ({ image_id: imageId }) => ({
      _type: 'custom',
      imageId
    }))
    .with({ type: 'resolved' }, ({ image_id: imageId }) => ({
      _type: 'resolved',
      imageId
    }))
    .otherwise(() => ({ _type: 'none' }));
}

// export function toLinkTile(dto: LinkTileDto): LinkTile {
//   return isKnownLinkTileDto(dto)
//     ? toKnownLinkTile(dto)
//     : toUnknownLinkTile(dto);
// }

// function isKnownLinkTileDto(dto: LinkTileDto): dto is KnownLinkTileDto {
//   return isNotNil((<KnownLinkTileDto>dto).data.resource_info);
// }

// function toUnknownLinkTile(dto: LinkTileDto): UnknownLinkTile {
//   return {
//     id: dto.tile_id,
//     type: 'link',
//     isKnown: false,
//     url: dto.data.url,
//     title: dto.data.title,
//     favicon: toFavicon(dto.data.favicon),
//     thumbImage: toLinkTileImage(dto.data.thumb_img),
//     viewConfig: dto.view_config,
//     linkData: toCustomLinkData(dto.data.link_data)
//   };
// }

// function toKnownLinkTile(dto: KnownLinkTileDto): KnownLinkTile {
//   return {
//     id: dto.tile_id,
//     type: 'link',
//     isKnown: true,
//     url: dto.data.url,
//     title: dto.data.title,
//     resourceInfo: {
//       faviconId: dto.data.resource_info.favicon_id
//     },
//     thumbImage: toLinkTileImage(dto.data.thumb_img),
//     viewConfig: dto.view_config,
//     linkData: toCustomLinkData(dto.data.link_data)
//   };
// }

// function toFaviconDto(data: LinkTileFavicon): LinkTileFaviconDto {
//   return match(data)
//     .returnType<LinkTileFaviconDto>()
//     .with({ _type: 'url' }, ({ url }) => ({ type: 'url', url }))
//     .with({ _type: 'custom' }, ({ imageId }) => ({
//       type: 'custom',
//       image_id: imageId
//     }))
//     .with({ _type: 'resolved' }, ({ imageId }) => ({
//       type: 'resolved',
//       image_id: imageId
//     }))
//     .otherwise(() => ({ type: 'none' }));
// }
