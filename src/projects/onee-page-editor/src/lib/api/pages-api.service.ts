import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  PageDto,
  ProfileImageDto,
  TileDto,
  toCreateTileDto,
  toLinkBioPage,
  toPageTile,
  toProfileImage,
  toTileViewConfigDto,
  toUpdateTileDto
} from './dto';
import { catchError, map, of, switchMap } from 'rxjs';
import {
  CreateTileData,
  PageBackground,
  PageLayoutType,
  PageMetadata,
  PageTile,
  PersistedTile,
  PreviewTile,
  ProfileImageShape,
  TileIdWithViewConfig
} from '../models';
import { APP_CONFIG } from '@oni-shared';
import { match } from 'ts-pattern';
import {
  CustomLinkDataDto,
  LinkTileFaviconDto,
  LinkTileImageDto,
  toCustomLinkData,
  toLinkTileFavicon,
  toLinkTileImage
} from './dto/tiles/link-tile';

@Injectable({ providedIn: 'root' })
export class PagesApiService {
  #http = inject(HttpClient);
  #api = inject(APP_CONFIG).oneePagesApi;

  getPage() {
    return this.#http
      .get<PageDto>(`${this.#api}/api/page`)
      .pipe(map(toLinkBioPage));
  }

  createPage(key: string) {
    return this.#http.post<void>(`${this.#api}/api/page`, { key });
  }

  deletePage() {
    return this.#http.delete<void>(`${this.#api}/api/page`);
  }

  validatePageKey(key: string) {
    return this.#http
      .post<void>(`${this.#api}/api/page/reservations`, { key })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  validatePageKey2(key: string) {
    return this.#http.post<void>(`${this.#api}/api/page/reservations`, { key });
  }

  updatePageSettings(data: { key: string; metadata: PageMetadata }) {
    const payload = {
      key: data.key,
      metadata: {
        title: data.metadata.title,
        description: data.metadata.description
      }
    };

    return this.#http.patch<void>(`${this.#api}/api/page/settings`, payload);
  }

  updateLayout(layout: PageLayoutType) {
    return this.#http.patch<void>(`${this.#api}/api/page/layout`, { layout });
  }

  setBackground(bg: PageBackground) {
    const payload = match(bg)
      .with({ _type: 'default' }, () => ({ type: 'default' }))
      .with({ _type: 'custom_color' }, ({ color }) => ({
        type: 'custom_color',
        data: { color }
      }))
      .otherwise(() => ({ type: 'default' }));

    return this.#http.patch<void>(`${this.#api}/api/page/background`, payload);
  }

  getProfileImage() {
    return this.#http
      .get<ProfileImageDto>(`${this.#api}/api/page/profile/img`)
      .pipe(map(toProfileImage));
  }

  updateProfileImageId(imageId: string | null) {
    return this.#http.patch<void>(`${this.#api}/api/page/profile/img/id`, {
      image_id: imageId
    });
  }

  updateProfileImageShape(shape: ProfileImageShape) {
    return this.#http.patch<void>(`${this.#api}/api/page/profile/img/shape`, {
      shape
    });
  }

  updateProfileName(name: string | null) {
    return this.#http.patch<void>(`${this.#api}/api/page/profile/name`, {
      name
    });
  }

  updateProfileBio(bio: string | null) {
    return this.#http.patch<void>(`${this.#api}/api/page/profile/bio`, { bio });
  }

  addPageTile(data: CreateTileData) {
    const payload = toCreateTileDto(data);

    return this.#http
      .post<TileDto>(`${this.#api}/api/page/tiles`, payload)
      .pipe(map(toPageTile));
  }

  deletePageTile(tileId: string) {
    return this.#http.delete<void>(`${this.#api}/api/page/tiles/${tileId}`);
  }

  updateTile(data: PersistedTile) {
    const payload = toUpdateTileDto(data);
    return this.#http.patch<void>(`${this.#api}/api/page/tiles`, payload);
  }

  updateTilesViewConfig(data: TileIdWithViewConfig[]) {
    const payload = data.map(t => ({
      tile_id: t.tileId,
      view_config: toTileViewConfigDto(t.viewConfig)
    }));

    return this.#http.patch<void>(
      `${this.#api}/api/page/tiles/view-config`,
      payload
    );
  }

  getLinkTileResolvedData(tileId: string) {
    return this.#http
      .get<CustomLinkDataDto>(
        `${this.#api}/api/page/link-tiles/${tileId}/link-data`
      )
      .pipe(map(toCustomLinkData));
  }

  getLinkTileFavicon(tileId: string) {
    return this.#http
      .get<LinkTileFaviconDto>(
        `${this.#api}/api/page/link-tiles/${tileId}/favicon`
      )
      .pipe(map(toLinkTileFavicon));
  }

  getLinkTileThumbnail(tileId: string) {
    return this.#http
      .get<LinkTileImageDto>(
        `${this.#api}/api/page/link-tiles/${tileId}/thumbnail`
      )
      .pipe(map(toLinkTileImage));
  }

  uploadImage(file: File) {
    return this.#http
      .post<{ image_id: string; url: string }>(
        `${this.#api}/api/images/upload/direct`,
        null
      )
      .pipe(
        switchMap(({ image_id, url }) => {
          const formData = new FormData();
          formData.append('file', file, file.name);

          return this.#http.post(url, formData).pipe(map(() => image_id));
        })
      );
  }

  uploadImageByUrl(url: string) {
    return this.#http
      .post<{ image_id: string }>(`${this.#api}/api/images/upload/by-url`, {
        url
      })
      .pipe(map(({ image_id }) => image_id));
  }
}
