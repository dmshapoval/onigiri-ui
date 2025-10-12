import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { ThumbImageViewModel } from './thumb-image.viewmodel';
import { OnigiriIconComponent, OnigiriImageUrlPipe } from '@oni-shared';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  standalone: true,
  imports: [SkeletonModule, OnigiriImageUrlPipe],
  selector: 'link-tile-thumb-image',
  templateUrl: 'thumb-image.component.html',
  styleUrl: 'thumb-image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTileThumbImageComponent implements OnInit {
  vm = inject(ThumbImageViewModel);

  ngOnInit() {}
}
