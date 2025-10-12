import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule],
  selector: 'board-page',
  templateUrl: 'board-page.component.html'
})
export class BoardPageComponent implements OnInit {

  ngOnInit() { }
}