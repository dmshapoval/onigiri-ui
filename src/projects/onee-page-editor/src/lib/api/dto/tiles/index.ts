import {
  CreateTileData,
  PageTile,
  PersistedTile,
  PreviewTile
} from '../../../models';
import {
  CreateLinkTileDto,
  LinkTileDto,
  toCreateLinkTileDto,
  toLinkTile,
  toUpdateLinkTileDto,
  UpdateLinkTileDto
} from './link-tile';

import { match, P } from 'ts-pattern';
import { ImageTileDto, toImageTile, toImageTileDto } from './image-tile';
import { TextTileDto, toTextTile, toTextTileDto } from './text-tile';
import { TitleTileDto, toTitleTile, toTitleTileDto } from './title-tile';

export type TileDto = ImageTileDto | LinkTileDto | TextTileDto | TitleTileDto;

export type CreateTileDto =
  | ImageTileDto
  | CreateLinkTileDto
  | TextTileDto
  | TitleTileDto;

export type UpdateTileDto =
  | ImageTileDto
  | UpdateLinkTileDto
  | TextTileDto
  | TitleTileDto;

export function toPageTile(dto: TileDto): PageTile {
  return match(dto)
    .returnType<PageTile>()
    .with({ type: 'image' }, toImageTile)
    .with({ type: 'text' }, toTextTile)
    .with({ type: 'title' }, toTitleTile)
    .with({ type: 'link' }, toLinkTile)
    .exhaustive();
}

export function toCreateTileDto(data: CreateTileData): CreateTileDto {
  return match(data)
    .returnType<CreateTileDto>()
    .with({ type: 'image' }, toImageTileDto)
    .with({ type: 'text' }, toTextTileDto)
    .with({ type: 'title' }, toTitleTileDto)
    .with({ _type: 'link' }, toCreateLinkTileDto)
    .exhaustive();
}

export function toUpdateTileDto(data: PersistedTile): UpdateTileDto {
  return match(data)
    .returnType<UpdateTileDto>()
    .with({ type: 'image' }, toImageTileDto)
    .with({ type: 'text' }, toTextTileDto)
    .with({ type: 'title' }, toTitleTileDto)
    .with({ type: 'link' }, toUpdateLinkTileDto)
    .exhaustive();
}

export * from './view-config';
