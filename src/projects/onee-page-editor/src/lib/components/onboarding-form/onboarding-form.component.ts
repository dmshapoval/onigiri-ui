import {
  Component,
  EventEmitter,
  HostBinding,
  input,
  Output
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { OnigiriImageUrlPipe } from '@oni-shared';
import { isEmpty } from 'lodash';

type Mode = 'page' | 'embedded';

const KNOWN_RESOURCES = {
  Discord: { faviconId: '7f2d2e1a-634d-4c5b-50ab-358f153e7000' },
  Dribbble: { faviconId: 'd06941cb-8698-4ec5-bb4a-5a21bad37800' },
  Facebook: { faviconId: '1494c8ba-5b57-4012-1643-cefe8e02a400' },
  Figma: { faviconId: 'd7871fe5-480e-437b-9d2f-001e7d742400' },
  GitHub: { faviconId: 'b2c4902b-0bb9-4542-acec-763c5e93b700' },
  Instagram: { faviconId: '7618756b-6f30-475a-ae16-45ef865d0000' },
  LinkedIn: { faviconId: '5d06bfb0-87ab-4f68-5930-eca35dc0ae00' },
  Spotify: { faviconId: '312db86f-a83a-4f9a-7f75-d658582bdd00' },
  Twitch: { faviconId: 'e082f51f-ec67-4686-c50c-36104acb9200' },
  Twitter: { faviconId: '2356a3d3-f2e2-4c95-f6db-19c41f814600' },
  YouTube: { faviconId: '5a8f68cc-9422-40a1-7423-866e5ca99d00' },
  Behance: { faviconId: 'a1183804-9c7f-4501-5e89-3e5b64f74b00' },
  Bluesky: { faviconId: '191542b0-a867-4e81-5222-b8a5e283be00' },
  GoogleDrive: { faviconId: '73d4c3ae-ad7a-4a21-64e6-4733bdf01500' },
  Mastodon: { faviconId: 'e5cdcd84-1bd6-4101-3213-606202434200' },
  Threads: { faviconId: '18d51432-9ba1-4899-8ee0-63fe986b7800' },
  Calendly: { faviconId: '7a91ac7e-b50e-4c38-cc4f-037393662600' },
  TikTok: { faviconId: 'a7ed78a0-7025-438b-8602-ba1be0508f00' },
  DeviantArt: { faviconId: '9c9291ee-99d0-42f0-002f-9bce47dd5600' }
};

interface OnboardingData {
  twitter: string | null | undefined;
  youtube: string | null | undefined;
  instagram: string | null | undefined;
  dribbble: string | null | undefined;
  facebook: string | null | undefined;
  github: string | null | undefined;
  linkedin: string | null | undefined;
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, OnigiriImageUrlPipe],
  selector: 'onboarding-form',
  templateUrl: './onboarding-form.component.html',
  styleUrls: ['./onboarding-form.component.scss']
})
export class OnboardingFormComponent {
  @Output() done = new EventEmitter<void>();

  mode = input.required<Mode>();

  @HostBinding('class.page-mode') get isOverlayMode() {
    return this.mode() === 'page';
  }

  form = new FormGroup({
    twitter: new FormControl<string | null>(null),
    youtube: new FormControl<string | null>(null),
    instagram: new FormControl<string | null>(null),
    dribbble: new FormControl<string | null>(null),
    facebook: new FormControl<string | null>(null),
    github: new FormControl<string | null>(null),
    linkedin: new FormControl<string | null>(null)
  });

  get canContinue() {
    const fv = this.form.getRawValue();
    return Object.values(fv).some(x => !isEmpty(x?.trim()));
  }

  icons = {
    twitter: KNOWN_RESOURCES.Twitter.faviconId,
    instagram: KNOWN_RESOURCES.Instagram.faviconId,
    facebook: KNOWN_RESOURCES.Facebook.faviconId,
    linkedin: KNOWN_RESOURCES.LinkedIn.faviconId,
    youtube: KNOWN_RESOURCES.YouTube.faviconId,
    dribbble: KNOWN_RESOURCES.Dribbble.faviconId,
    github: KNOWN_RESOURCES.GitHub.faviconId
  };

  onContinueClick() {
    const fv = this.form.getRawValue();
    const urls = resolveOnboardingResult({
      dribbble: fv.dribbble,
      facebook: fv.facebook,
      github: fv.github,
      instagram: fv.instagram,
      linkedin: fv.linkedin,
      twitter: fv.twitter,
      youtube: fv.youtube
    });

    if (urls.length) {
      localStorage.setItem(
        'ONEE_PAGE_ONBOARDING_RESULTS',
        JSON.stringify(urls)
      );
    }

    this.done.emit();

    // const size = { width: 1, height: 2 };
    // const viewType = this.#viewStore.viewType();

    // tiles.forEach(tile => {
    //   this.#tilesStore.addTile({ tile, size, viewType });
    // });

    // setTimeout(() => {
    //   this.done.emit();
    // }, 500);
  }

  onSkip() {
    this.done.emit();
  }
}

export function resolveOnboardingResult(data: OnboardingData) {
  const result: string[] = [];

  let { dribbble, facebook, github, instagram, linkedin, twitter, youtube } =
    data;

  const isUrl = (v: string) =>
    v.startsWith('http://') || v.startsWith('https://');

  const tryAddTile = (v: string | null | undefined, baseUrl: string) => {
    const trimmed = v?.trim();
    if (!trimmed) {
      return;
    }

    const url = isUrl(trimmed) ? trimmed : `${baseUrl}/${trimmed}`;

    result.push(url);
  };

  tryAddTile(dribbble, 'https://dribbble.com');
  tryAddTile(facebook, 'https://facebook.com');
  tryAddTile(github, 'https://github.com');
  tryAddTile(instagram, 'https://instagram.com');
  tryAddTile(linkedin, 'https://www.linkedin.com/in');
  tryAddTile(twitter, 'https://x.com');

  if (youtube) {
    youtube = youtube.trim();
    youtube = youtube.startsWith('@') ? youtube : `@${youtube}`;
    result.push(`https://youtube.com/${youtube}`);
  }

  return result;
}
