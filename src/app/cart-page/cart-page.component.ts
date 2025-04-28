import { Component } from '@angular/core';
import { CartService } from '../services/services/cart/cart.service';
import { Cart } from '../shared/models/cart';
import { CartItem } from '../shared/models/cartItem';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FoodService } from '../services/food/food.service';
import { NotFoundComponent } from '../not-found/not-found.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, RouterModule, NotFoundComponent, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent {
  cart!: Cart;
  rangeNumbers: number[] = this.generateNumbersArray(1, 20);
  // don't forget to remove all from the foodservice
  constructor(private cartService: CartService) {
    this.setCart();
    // console.log(this.setCart())
  }

  removeCartItem(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem.food.id);
    this.setCart();
  }

  // changeQuantity(cartItem:CartItem, quantityInString:String){
  //   const quantity = parseInt(quantityInString);
  // }

  changeQuantity(cartItem: CartItem, quantityInString: string) {
    const quantity = parseInt(quantityInString);
    this.cartService.changeQuantity(cartItem.food.id, quantity);
    this.setCart();
  }

  // changeQuantity(cartItem: any, quantityInString: string) {
  //   const quantity = parseInt(quantityInString.toString());
  //   console.log(quantity);
  //   cartItem.quantity = quantity;
  //   console.log('change quantity before service', cartItem.quantity);
  //   // this.cartService.changeQuantity(cartItem.food.id, quantity);

  //   console.log('change quantity after service', cartItem.quantity);
  //   this.setCart();
  // }

  ngOnInIt(): void {}

  setCart() {
    this.cart = this.cartService.getCart();
  }

  generateNumbersArray(start: number, end: number): number[] {
    const numbers: number[] = [];

    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }

    return numbers;
  }
}
