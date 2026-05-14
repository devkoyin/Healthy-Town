import { Component } from '@angular/core';
import { CartService } from '../services/services/cart/cart.service';
import { Cart } from '../shared/models/cart';
import { CartItem } from '../shared/models/cartItem';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from '../not-found/not-found.component';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutModalComponent } from './checkout-modal/checkout-modal.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotFoundComponent,
    FormsModule,
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent {
  cart!: Cart;
  rangeNumbers: number[] = this.generateNumbersArray(1, 20);
  proceedToCheckOut: boolean = true;

  constructor(private cartService: CartService, public dialog: MatDialog) {
    this.setCart();
  }

  removeCartItem(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem.food.id);
    this.setCart();
  }

  changeQuantity(cartItem: CartItem, quantityInString: string) {
    const quantity = parseInt(quantityInString);
    this.cartService.changeQuantity(cartItem.food.id, quantity);
    this.setCart();
  }

  ngOnInit(): void {}

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

  openCheckoutModal(): void {
    this.dialog.open(CheckoutModalComponent, {
      data: { cart: this.cart, totalPrice: this.cart.totalPrice },
      width: '520px',
      disableClose: true,
    });
  }
}
