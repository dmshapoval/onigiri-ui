import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { ProjectLinkType } from '@onigiri-models';


@Component({
  selector: 'project-link-type-select-dialog',
  standalone: true,
  templateUrl: './project-link-type-select-dialog.component.html',
  styleUrls: ['./project-link-type-select-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent,
    OnigiriButtonComponent
  ]
})
export class ProjectLinkTypeSelectDialogComponent implements OnInit {
  private _dialogRef = inject(DialogRef);
  private _data: any = inject(DIALOG_DATA);

  ngOnInit() { }

  onSelected(v: ProjectLinkType) {
    this._dialogRef.close(v);
  }

  onClose() {
    this._dialogRef.close();
  }
}