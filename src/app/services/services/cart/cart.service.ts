import { Injectable } from '@angular/core';
import { Cart } from '../../../shared/models/cart';
import { Food } from '../../../shared/Food';
import { CartItem } from '../../../shared/models/cartItem';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: Cart = new Cart();
  // this can be in the constructor but there is no diffrence
  // constructor() {  }
  addToCart(food: Food): void {
    let cartItem = this.cart.items.find((item) => item.food.id === food.id);

    if (cartItem) {
      this.changeQuantity(food.id, cartItem.quantity + 1);
      return;
      // returm above was used instead of else{}.
    }
    this.cart.items.push(new CartItem(food));
  }

  removeFromCart(foodId: number): void {
    this.cart.items = this.cart.items.filter((item) => item.food.id != foodId);
  }

  changeQuantity(foodId: number, quantity: number) {
    let cartItem = this.cart.items.find((item) => item.food.id === foodId);
    if (!cartItem) return;
    cartItem.quantity = quantity;
  }

  getCart(): Cart {
    return this.cart;
  }
}
