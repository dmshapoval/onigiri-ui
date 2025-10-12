import { match } from 'ts-pattern';
import {
  LinkBioPage,
  PageBackground,
  PageLayoutType,
  ProfileImage,
  ProfileImageId,
  ProfileImageShape
} from '../../models';
import { TileDto, toPageTile } from './tiles';
import { toRichText } from '@oni-shared';

export interface PageDto {
  key: string;
  metadata: PageMetadataDto;
  layout: PageLayoutType;
  background: PageBackgroundDto;
  profile_img: ProfileImageDto;
  name: string | null;
  bio: string | null;
  tiles: TileDto[];
}

export interface UpdatePagePersonalInfoDto {
  name: string | null;
  bio: string | null;
}

export interface ProfileImageDto {
  shape: ProfileImageShape;
  image_id: ProfileImageIdDto;
}

export type ProfileImageIdDto =
  | { type: 'none' }
  | { type: 'pending' }
  | { type: 'resolved'; image_id: string }
  | { type: 'custom'; image_id: string };

export interface PageMetadataDto {
  title: string | null;
  description: string | null;
}

export type PageBackgroundDto =
  | { type: 'default' }
  | { type: 'custom_color'; data: { color: string } };

export function toLinkBioPage(dto: PageDto): LinkBioPage {
  return {
    key: dto.key,
    layout: dto.layout,
    metadata: {
      title: dto.metadata.title,
      description: dto.metadata.description
    },
    profileImage: toProfileImage(dto.profile_img),
    background: toPageBackground(dto.background),

    profileName: dto.name ? toRichText(dto.name) : null,
    bio: dto.bio ? toRichText(dto.bio) : null,
    tiles: dto.tiles.map(toPageTile)
  };
}

export function toProfileImage(dto: ProfileImageDto): ProfileImage {
  const imageId = match(dto.image_id)
    .returnType<ProfileImageId>()
    .with({ type: 'pending' }, () => ({ _type: 'pending' }))
    .with({ type: 'custom' }, ({ image_id: imageId }) => ({
      _type: 'custom',
      imageId
    }))
    .with({ type: 'resolved' }, ({ image_id: imageId }) => ({
      _type: 'resolved',
      imageId
    }))
    .otherwise(() => ({ _type: 'none' }));

  return {
    imageId,
    shape: dto.shape
  };
}

const defaultBG: PageBackground = { _type: 'default' };

function toPageBackground(dto: PageBackgroundDto) {
  const result: PageBackground = match(dto)
    .with({ type: 'default' }, () => defaultBG)
    .with({ type: 'custom_color' }, ({ data: { color } }) => ({
      _type: 'custom_color' as const,
      color
    }))
    .otherwise(() => defaultBG);

  return result;
}
