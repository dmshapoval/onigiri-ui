import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import EditorJS from "@editorjs/editorjs";
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Marker from '@editorjs/marker';

@Component({
  selector: 'editor-test',
  standalone: true,
  templateUrl: './editor-test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorTestComponent implements OnInit, AfterViewInit {


  editor: EditorJS;

  @ViewChild('editorHost') editorHost: ElementRef<HTMLDivElement>;


  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.editor = new EditorJS({
      holder: this.editorHost.nativeElement,
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['link'],
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4],
            defaultLevel: 1
          }
        },
        list: {
          class: List,
          inlineToolbar: ['link', 'bold']
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        }
      }
    });
  }
}