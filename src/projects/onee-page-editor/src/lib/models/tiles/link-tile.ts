import { HasType } from '@oni-shared';
import { HasId, HasViewConfig, TileViewConfig } from './shared';
import { v4 as uuidv4 } from 'uuid';

export type CustomLinkData =
  | HasType<'pending'>
  | HasType<'not_resolved'>
  | (HasType<'resolved'> & {
      title: string | null;
      faviconUrl: string | null;
      thumbImgUrl: string | null;
    });

export interface LinkTile {
  id: string;
  type: 'link';
  url: string;
  title: string | null;

  favicon: LinkTileFavicon;

  viewConfig: TileViewConfig;
  thumbImage: LinkTileImage;

  linkData: CustomLinkData;
}

// export interface KnownLinkTile {
//   id: string;
//   type: 'link';
//   isKnown: true;
//   url: string;
//   title: string | null;

//   resourceInfo: KnownResourceInfo;

//   viewConfig: TileViewConfig;
//   thumbImage: LinkTileImage;

//   linkData: CustomLinkData;
// }

export const NULL_LINK_TILE: LinkTile = {
  id: 'link_null',
  type: 'link',
  url: '',
  title: null,
  favicon: { _type: 'none' },
  viewConfig: {
    desktop: null,
    mobile: null
  },
  thumbImage: { _type: 'none' },
  linkData: { _type: 'not_resolved' }
};

export interface KnownResourceInfo {
  faviconId: string;
}

// export type LinkTile = KnownLinkTile | UnknownLinkTile;

// export type LinkTileResolvedData = LinkTile['resolvedData'];

export type LinkTileFavicon =
  | HasType<'none'>
  | HasType<'pending'>
  | (HasType<'url'> & { url: string })
  | (HasType<'resolved'> & { imageId: string })
  | (HasType<'custom'> & { imageId: string });

export type LinkTileImage =
  | HasType<'none'>
  | HasType<'pending'>
  | (HasType<'resolved'> & { imageId: string })
  | (HasType<'custom'> & { imageId: string });

export type CreateLinkTileData = HasType<'link'> &
  HasId &
  HasViewConfig & {
    url: string;
  };

// export interface KnownResourceInfo {
//   faviconId: string;
// }

// type ResolutionResult =
//   | Omit<KnownLinkTile, 'viewConfig'>
//   | Omit<UnknownLinkTile, 'viewConfig'>;

// export function resolveLinkTile(url: string): ResolutionResult {
//   const id = uuidv4();
//   const title: string | null = null;

//   const thumbImage: LinkTileImage = {
//     type: 'resolved',
//     imageId: null
//   };

//   let resourceInfo = tryGetKnownResourceInfo(url);

//   const resolvedData: LinkTileResolvedData = {
//     faviconUrl: null,
//     title: null,
//     thumbImgUrl: null
//   };

//   return resourceInfo
//     ? {
//         id,
//         type: 'link',
//         url,
//         isKnown: true as const,
//         resourceInfo,
//         thumbImage,
//         title,
//         resolvedData
//       }
//     : {
//         id,
//         type: 'link',
//         url,
//         thumbImage,
//         isKnown: false as const,
//         title,
//         favicon: { type: 'no_icon' },
//         resolvedData
//       };

//   // const tile: LinkTile =
// }

// function matchesDomain(host: string, ...domains: string[]) {
//   return domains.some(x => host === x || host.endsWith(`.${x}`));
// }

// export const KNOWN_RESOURCES = {
//   Discord: { faviconId: '7f2d2e1a-634d-4c5b-50ab-358f153e7000' },
//   Dribbble: { faviconId: 'd06941cb-8698-4ec5-bb4a-5a21bad37800' },
//   Facebook: { faviconId: '1494c8ba-5b57-4012-1643-cefe8e02a400' },
//   Figma: { faviconId: 'd7871fe5-480e-437b-9d2f-001e7d742400' },
//   GitHub: { faviconId: 'b2c4902b-0bb9-4542-acec-763c5e93b700' },
//   Instagram: { faviconId: '7618756b-6f30-475a-ae16-45ef865d0000' },
//   LinkedIn: { faviconId: '5d06bfb0-87ab-4f68-5930-eca35dc0ae00' },
//   Spotify: { faviconId: '312db86f-a83a-4f9a-7f75-d658582bdd00' },
//   Twitch: { faviconId: 'e082f51f-ec67-4686-c50c-36104acb9200' },
//   Twitter: { faviconId: '2356a3d3-f2e2-4c95-f6db-19c41f814600' },
//   YouTube: { faviconId: '5a8f68cc-9422-40a1-7423-866e5ca99d00' },
//   Behance: { faviconId: 'a1183804-9c7f-4501-5e89-3e5b64f74b00' },
//   Bluesky: { faviconId: '191542b0-a867-4e81-5222-b8a5e283be00' },
//   GoogleDrive: { faviconId: '73d4c3ae-ad7a-4a21-64e6-4733bdf01500' },
//   Mastodon: { faviconId: 'e5cdcd84-1bd6-4101-3213-606202434200' },
//   Threads: { faviconId: '18d51432-9ba1-4899-8ee0-63fe986b7800' },
//   Calendly: { faviconId: '7a91ac7e-b50e-4c38-cc4f-037393662600' },
//   TikTok: { faviconId: 'a7ed78a0-7025-438b-8602-ba1be0508f00' },
//   DeviantArt: { faviconId: '9c9291ee-99d0-42f0-002f-9bce47dd5600' }
// };

// function tryGetKnownResourceInfo(link: string): KnownResourceInfo | null {
//   try {
//     let host = new URL(link).host;

//     if (matchesDomain(host, 'x.com', 'twitter.com')) {
//       return KNOWN_RESOURCES.Twitter;
//     } else if (matchesDomain(host, 'instagram.com')) {
//       return KNOWN_RESOURCES.Instagram;
//     } else if (matchesDomain(host, 'facebook.com')) {
//       return KNOWN_RESOURCES.Facebook;
//     } else if (matchesDomain(host, 'linkedin.com', 'lnkd.in')) {
//       return KNOWN_RESOURCES.LinkedIn;
//     } else if (matchesDomain(host, 'dribbble.com')) {
//       return KNOWN_RESOURCES.Dribbble;
//     } else if (matchesDomain(host, 'github.com')) {
//       return KNOWN_RESOURCES.GitHub;
//     } else if (matchesDomain(host, 'spotify.com')) {
//       return KNOWN_RESOURCES.Spotify;
//     } else if (matchesDomain(host, 'youtube.com', 'youtu.be')) {
//       return KNOWN_RESOURCES.YouTube;
//     } else if (matchesDomain(host, 'twitch.com')) {
//       return KNOWN_RESOURCES.Twitch;
//     } else if (matchesDomain(host, 'figma.com')) {
//       return KNOWN_RESOURCES.Figma;
//     } else if (matchesDomain(host, 'discord.com')) {
//       return KNOWN_RESOURCES.Discord;
//     } else if (matchesDomain(host, 'be.net', 'behance.net')) {
//       return KNOWN_RESOURCES.Behance;
//     } else if (matchesDomain(host, 'bsky.app', 'bsky.social')) {
//       return KNOWN_RESOURCES.Bluesky;
//     } else if (matchesDomain(host, 'drive.google.com')) {
//       return KNOWN_RESOURCES.GoogleDrive;
//     } else if (matchesDomain(host, 'mastodon.social')) {
//       return KNOWN_RESOURCES.Mastodon;
//     } else if (matchesDomain(host, 'threads.net')) {
//       return KNOWN_RESOURCES.Threads;
//     } else if (matchesDomain(host, 'calendly.com')) {
//       return KNOWN_RESOURCES.Calendly;
//     } else if (matchesDomain(host, 'tiktok.com')) {
//       return KNOWN_RESOURCES.TikTok;
//     } else if (matchesDomain(host, 'deviantart.com')) {
//       return KNOWN_RESOURCES.DeviantArt;
//     } else {
//       return null;
//     }
//   } catch (error) {
//     return null;
//   }
// }

// export interface NoIconTileFavicon {
//   type: 'no_icon';
// }

// export interface UrlTileFavicon {
//   type: 'url';
//   url: string;
// }

// export interface ResolvedTileFavicon {
//   type: 'resolved';
//   imageId: string;
// }

// export interface CustomTileFavicon {
//   type: 'custom';
//   imageId: string;
// }
