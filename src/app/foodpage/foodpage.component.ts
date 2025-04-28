import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Food } from '../shared/Food';
import { FoodService } from '../services/food/food.service';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { TagsComponent } from '../tags/tags.component';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from '../services/services/cart/cart.service';
import { NotFoundComponent } from "../not-found/not-found.component";

@Component({
  selector: 'app-foodpage',
  imports: [CommonModule, StarRatingComponent,
    RouterModule, TagsComponent, NotFoundComponent],
  templateUrl: './foodpage.component.html',
  styleUrl: './foodpage.component.css'
})
export class FoodpageComponent {
  @Input() value: number = 0;

  @Input()
  JustifyContent: string = 'start';

  food!: Food;
  constructor (private activatedroute: ActivatedRoute, private foodservice: FoodService, private cartService:CartService, private router:Router) {
activatedroute.params.subscribe((params) => {
  const id = params['id'];
  if (id)
    this.food = foodservice.getFoodById(id);
});
   }

   ngOnInIt(): void {

   }

   addToCart() {
    this.cartService.addToCart(this.food);
    this.router.navigateByUrl('/cart-page');
   }
}
