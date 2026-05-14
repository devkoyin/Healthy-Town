import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/services/cart/cart.service';
import { Cart } from '../../shared/models/cart';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './checkout-modal.component.html',
  styleUrl: './checkout-modal.component.css',
})
export class CheckoutModalComponent implements OnInit, OnDestroy {
  currentStep: 1 | 2 | 3 = 1;
  activePayTab: 'card' | 'transfer' = 'card';
  isProcessing = false;
  orderNumber = '';
  countdown = 30 * 60;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  deliveryForm!: FormGroup;
  cardForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CheckoutModalComponent>,
    private cartService: CartService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { cart: Cart; totalPrice: number }
  ) {}

  ngOnInit(): void {
    this.orderNumber = 'FD-' + Math.floor(10000 + Math.random() * 90000);

    this.deliveryForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      address: ['', Validators.required],
      note: [''],
    });

    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
      cardName: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  goToPayment(): void {
    if (this.deliveryForm.invalid) return;
    this.currentStep = 2;
    this.startCountdown();
  }

  goToDelivery(): void {
    this.currentStep = 1;
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) this.countdown--;
      else clearInterval(this.countdownInterval!);
    }, 1000);
  }

  get countdownDisplay(): string {
    const mins = Math.floor(this.countdown / 60).toString().padStart(2, '0');
    const secs = (this.countdown % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  setPayTab(tab: 'card' | 'transfer'): void {
    this.activePayTab = tab;
  }

  payByCard(): void {
    if (this.cardForm.invalid) return;
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.completeOrder();
    }, 2000);
  }

  payByTransfer(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.completeOrder();
    }, 1000);
  }

  private completeOrder(): void {
    this.cartService.clearCart();
    this.currentStep = 3;
  }

  backToCart(): void {
    this.dialogRef.close();
  }

  backToHomepage(): void {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
}
