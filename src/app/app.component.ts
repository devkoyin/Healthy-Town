import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
// import { HomeComponent } from './home/home.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  
})
export class AppComponent {
  title = 'food-website-course';
}
