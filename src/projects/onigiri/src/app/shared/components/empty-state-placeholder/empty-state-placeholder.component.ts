import { NgTemplateOutlet } from '@angular/common';
import {
  Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy,
  AfterContentInit, ContentChildren, QueryList, TemplateRef
} from '@angular/core';
import { OnigiriButtonComponent, OnigiriTemplate } from '@oni-shared';

@Component({
  selector: 'empty-state-placeholder',
  templateUrl: 'empty-state-placeholder.component.html',
  styleUrls: ['./empty-state-placeholder.component.scss'],
  standalone: true,
  imports: [
    OnigiriButtonComponent,
    OnigiriTemplate,
    NgTemplateOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStatePlaceholderComponent implements OnInit, AfterContentInit {

  @Output() onCreateClick = new EventEmitter<void>();

  @Input() title = '';
  @Input() subTitle = '';
  @Input() btnText = '';

  imgTemplate: TemplateRef<any> | undefined;
  actionTemplate: TemplateRef<any> | undefined;

  @ContentChildren(OnigiriTemplate) templates: QueryList<OnigiriTemplate> | undefined;

  constructor() { }

  ngOnInit() { }

  ngAfterContentInit() {
    this.imgTemplate = this.templates?.find(x => x.getType() === 'sample')?.template;
    this.actionTemplate = this.templates?.find(x => x.getType() === 'action')?.template;
  }
}