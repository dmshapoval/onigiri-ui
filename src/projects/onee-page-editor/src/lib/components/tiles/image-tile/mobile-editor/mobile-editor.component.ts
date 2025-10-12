import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  output,
  viewChild
} from '@angular/core';

import { ImageTile } from '../../../../models';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectImageTile
} from '../../../../selectors';
import { ContenteditableV2 } from '@oni-shared';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MobileEditorCloseDirective } from '../../../../directives';

@Component({
  standalone: true,
  imports: [
    ContenteditableV2,
    FormsModule,
    ReactiveFormsModule,
    MobileEditorCloseDirective
  ],
  selector: 'image-tile-mobile-editor',
  templateUrl: './mobile-editor.component.html',
  styleUrl: './mobile-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageTileMobileEditorComponent implements OnInit {
  closed = output<void>();

  #destroyRef = inject(DestroyRef);

  captionInput = viewChild<ElementRef<HTMLDivElement>>('captionInput');
  linkInput = new FormControl<string | null>(null);

  tile = selectImageTile();
  caption = computed(() => this.tile().caption || '');

  size = createTileSizeSelector();

  ngOnInit() {
    this.linkInput.setValue(this.tile().link, { emitEvent: false });

    this.linkInput.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(link => {
        this.updateTile({ link });
      });
  }

  updateTile = createTileUpdater<ImageTile>();
}
