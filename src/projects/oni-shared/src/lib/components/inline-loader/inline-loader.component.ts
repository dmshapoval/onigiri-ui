import { Component } from '@angular/core';

@Component({
  selector: 'inline-loader',
  standalone: true,
  imports: [],
  template: `  
  <div class="stage">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
  `,
  styleUrls: ['./inline-loader.component.scss']
})
export class InlineLoaderComponent { }