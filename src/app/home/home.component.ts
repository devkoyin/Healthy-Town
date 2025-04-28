import { Component } from '@angular/core';
import { FoodService } from '../services/food/food.service';
import { CommonModule } from '@angular/common';
import { Food } from '../shared/Food';
import { MatIconModule } from '@angular/material/icon';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { FormsModule } from '@angular/forms';
import { TagsComponent } from "../tags/tags.component";
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { NotFoundComponent } from '../not-found/not-found.component';
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatIconModule,
    StarRatingComponent,
    SearchComponent,
    FormsModule,
    TagsComponent,
    RouterModule,
    NotFoundComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  stars = [1, 2, 3, 4, 5];
  rating = 0;
  hoverState = 0;
  // foodUrl: string = '';
  foods: Food[] = [];
param: any;

  // Dependency injection
  constructor(
    private foodService: FoodService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.foods = this.foodService.getAll();
    this.router.events.pipe(
      // identify navigation end
      filter((event) => event instanceof NavigationEnd),
      // now query the activated route
      map(() => this.rootRoute(this.route)),
      filter((route: ActivatedRoute) => route.outlet === 'primary'),
    ).subscribe((route: ActivatedRoute) => {
      console.log(route.snapshot.paramMap.get('tag'));
      const searchTem = route.snapshot.queryParamMap.get('searchTerm');
      console.log(searchTem)
        const targ = route.snapshot.paramMap.get('tag');
      if (searchTem) {
        this.foods = this.foodService.getAllFoodsBySearchTerm(searchTem); 
        console.log(this.foods)
      } else if (targ) {
        this.foods = this.foodService.getAllFoodsByTag(targ);
        console.log(this.foods)
      } else {
        this.foods = this.foodService.getAll();
        console.log(this.foods)
      }
    });
  }

  private rootRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  setRating(rating: number) {
    this.rating = rating;
  }
  setHoverState(state: number) {
    this.hoverState = state;
  }

  updateRating(recipeId: number, newRating: number) {
    const recipe = this.foods.find((r) => r.id === recipeId);
    if (recipe) {
      recipe.stars = newRating;
    }
  }

//   showPopup = false;

// togglePopup() {
//   this.showPopup = !this.showPopup;
// }
}

// Activated router is used for reading from the route, Router is used for writing into the route.
