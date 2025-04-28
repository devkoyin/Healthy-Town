import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule,RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

@Input() visible: boolean =false;
@Input() notFoundMessage: string = "Nothing Found!";
@Input() resetLinkText: string = "Reset";
@Input() resetLinkRoute: string = "/";

  constructor() {

  }

  ngOnInIt() {

  }
}
