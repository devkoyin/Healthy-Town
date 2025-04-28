import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  searchTerm: String = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const searchTerm = params['searchTerm'];
      if (searchTerm) {
        this.searchTerm = searchTerm;
      } else {
        this.searchTerm = '';
      }
    });
  }

  search(): void{
    if(this.searchTerm)
      this.router.navigateByUrl('/?searchTerm=' + this.searchTerm); 
  }
}
