import { HasType, RichText } from '@oni-shared';
import { PageTile } from './tiles';

export interface LinkBioPage {
  key: string;
  layout: PageLayoutType;
  background: PageBackground;
  profileImage: ProfileImage;
  profileName: RichText | null;
  metadata: PageMetadata;
  bio: RichText | null;
  tiles: PageTile[];
}

export type PageLayoutType = 'profile_left' | 'profile_right' | 'profile_top';

export interface PageMetadata {
  title: string | null;
  description: string | null;
}

export type ProfileImageShape = 'circle' | 'square';
export interface ProfileImage {
  imageId: ProfileImageId;
  shape: ProfileImageShape;
}

export type ProfileImageId =
  | HasType<'none'>
  | HasType<'pending'>
  | (HasType<'resolved'> & { imageId: string })
  | (HasType<'custom'> & { imageId: string });

export type DefaultBackground = HasType<'default'>;
export type CustomColorBackground = HasType<'custom_color'> & {
  color: string;
};

export type PageBackground = DefaultBackground | CustomColorBackground;

export const DEFAULT_BG = '#F5F5F5';
export const BG_OPTIONS = [
  '#F5F5F5',
  '#F1F3EC',
  '#F3F4F0',
  '#F0F2F4',
  '#FBFAF7',
  '#F9F5F6',
  '#F0F1F4',
  '#F9F5EB',
  '#F4F0F0',
  '#F4F0F3'
];
