# Checkout Payment Gateway Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder checkout dialog with a 3-step wizard (Delivery Details → Payment [Card / Bank Transfer] → Order Confirmed) styled to match the site's green palette.

**Architecture:** The existing `CheckoutModalComponent` is fully rewritten to manage `currentStep: 1 | 2 | 3` internally. Cart data is injected via `MAT_DIALOG_DATA`. A new `clearCart()` method is added to `CartService`. No new routes or components are introduced.

**Tech Stack:** Angular 19 standalone components, Angular Material Dialog, ReactiveFormsModule, Karma + Jasmine

---

## File Map

| File | Action |
|------|--------|
| `src/app/app.config.ts` | Add `provideAnimations()` |
| `src/app/services/services/cart/cart.service.ts` | Add `clearCart()` method |
| `src/app/services/services/cart/cart.service.spec.ts` | Add `clearCart()` test |
| `src/app/cart-page/cart-page.component.ts` | Update `openCheckoutModal()` to pass cart data |
| `src/app/cart-page/checkout-modal/checkout-modal.component.ts` | Full rewrite |
| `src/app/cart-page/checkout-modal/checkout-modal.component.html` | Full rewrite |
| `src/app/cart-page/checkout-modal/checkout-modal.component.css` | Full rewrite |
| `src/app/cart-page/checkout-modal/checkout-modal.component.spec.ts` | Full rewrite |

---

## Task 1: Enable Dialog Animations

**Files:**
- Modify: `src/app/app.config.ts`

- [ ] **Step 1: Add `provideAnimations()` to app config**

Replace the full file content:

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { FoodService } from './services/food/food.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    FoodService,
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/app.config.ts
git commit -m "feat: enable browser animations for Material dialog"
```

---

## Task 2: Add `clearCart()` to CartService (TDD)

**Files:**
- Modify: `src/app/services/services/cart/cart.service.spec.ts`
- Modify: `src/app/services/services/cart/cart.service.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('CartService', ...)` block in `src/app/services/services/cart/cart.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Food } from '../../../shared/Food';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear all items and reset totalPrice to zero', () => {
    const food: Food = {
      id: 99,
      name: 'Test Food',
      price: 5000,
      favourite: false,
      stars: 4,
      imageUrl: '',
      origins: [],
      cookTime: '10 mins',
    };
    service.addToCart(food);
    expect(service.getCart().items.length).toBe(1);

    service.clearCart();

    expect(service.getCart().items.length).toBe(0);
    expect(service.getCart().totalPrice).toBe(0);
  });
});
```

- [ ] **Step 2: Run test — expect it to fail**

```bash
ng test --watch=false
```

Expected: FAIL — `service.clearCart is not a function`

- [ ] **Step 3: Implement `clearCart()` in CartService**

Add this method to `src/app/services/services/cart/cart.service.ts` (inside the class, after `getCart()`):

```typescript
clearCart(): void {
  this.cart = new Cart();
}
```

Full updated file:

```typescript
import { Injectable } from '@angular/core';
import { Cart } from '../../../shared/models/cart';
import { Food } from '../../../shared/Food';
import { CartItem } from '../../../shared/models/cartItem';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: Cart = new Cart();

  addToCart(food: Food): void {
    let cartItem = this.cart.items.find((item) => item.food.id === food.id);
    if (cartItem) {
      this.changeQuantity(food.id, cartItem.quantity + 1);
      return;
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

  clearCart(): void {
    this.cart = new Cart();
  }
}
```

- [ ] **Step 4: Run test — expect it to pass**

```bash
ng test --watch=false
```

Expected: All tests PASS including `should clear all items and reset totalPrice to zero`

- [ ] **Step 5: Commit**

```bash
git add src/app/services/services/cart/cart.service.ts src/app/services/services/cart/cart.service.spec.ts
git commit -m "feat: add clearCart() to CartService with test"
```

---

## Task 3: Update CartPageComponent to Pass Cart Data to Dialog

**Files:**
- Modify: `src/app/cart-page/cart-page.component.ts`

- [ ] **Step 1: Update `openCheckoutModal()`**

Replace the full file:

```typescript
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
      width: '420px',
      disableClose: true,
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/cart-page/cart-page.component.ts
git commit -m "feat: pass cart data to checkout dialog"
```

---

## Task 4: Write CheckoutModalComponent Tests (Red State)

**Files:**
- Modify: `src/app/cart-page/checkout-modal/checkout-modal.component.spec.ts`

- [ ] **Step 1: Rewrite the spec file**

Replace the full file content:

```typescript
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CheckoutModalComponent } from './checkout-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Cart } from '../../shared/models/cart';
import { CartService } from '../../services/services/cart/cart.service';
import { Food } from '../../shared/Food';

const mockFood: Food = {
  id: 1, name: 'Fruit Tarts', price: 5999,
  favourite: false, stars: 5, imageUrl: '', origins: ['France'], cookTime: '30 mins',
};

describe('CheckoutModalComponent', () => {
  let component: CheckoutModalComponent;
  let fixture: ComponentFixture<CheckoutModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CheckoutModalComponent>>;
  let mockRouter: jasmine.SpyObj<Router>;
  let cartService: CartService;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const testCart = new Cart();

    await TestBed.configureTestingModule({
      imports: [CheckoutModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { cart: testCart, totalPrice: 17498 } },
        { provide: Router, useValue: mockRouter },
        CartService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutModalComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at step 1', () => {
    expect(component.currentStep).toBe(1);
  });

  it('should generate an order number starting with FD-', () => {
    expect(component.orderNumber).toMatch(/^FD-\d{5}$/);
  });

  it('should not advance to step 2 when delivery form is invalid', () => {
    component.goToPayment();
    expect(component.currentStep).toBe(1);
  });

  it('should advance to step 2 when delivery form is valid', () => {
    component.deliveryForm.setValue({
      fullName: 'Omolara Aworeni',
      phone: '08012345678',
      address: '12 Lekki Phase 1, Lagos',
      note: '',
    });
    component.goToPayment();
    expect(component.currentStep).toBe(2);
  });

  it('should default active payment tab to card', () => {
    expect(component.activePayTab).toBe('card');
  });

  it('should switch active payment tab to transfer', () => {
    component.setPayTab('transfer');
    expect(component.activePayTab).toBe('transfer');
  });

  it('should not advance if card form is invalid when payByCard is called', fakeAsync(() => {
    component.payByCard();
    tick(2000);
    expect(component.currentStep).toBe(1);
  }));

  it('should advance to step 3 and clear cart after payByCard with valid card form', fakeAsync(() => {
    spyOn(cartService, 'clearCart').and.callThrough();
    component.cardForm.setValue({
      cardNumber: '1234567890123456',
      expiry: '12/26',
      cvv: '123',
      cardName: 'Omolara Aworeni',
    });
    component.payByCard();
    expect(component.isProcessing).toBeTrue();
    tick(2000);
    expect(cartService.clearCart).toHaveBeenCalled();
    expect(component.currentStep).toBe(3);
    expect(component.isProcessing).toBeFalse();
  }));

  it('should advance to step 3 and clear cart after payByTransfer', fakeAsync(() => {
    spyOn(cartService, 'clearCart').and.callThrough();
    component.payByTransfer();
    expect(component.isProcessing).toBeTrue();
    tick(1000);
    expect(cartService.clearCart).toHaveBeenCalled();
    expect(component.currentStep).toBe(3);
    expect(component.isProcessing).toBeFalse();
  }));

  it('should close dialog on backToCart', () => {
    component.backToCart();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog and navigate to / on backToHomepage', () => {
    component.backToHomepage();
    expect(mockDialogRef.close).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should go back to step 1 from step 2 via goToDelivery', () => {
    component.deliveryForm.setValue({
      fullName: 'Test', phone: '08012345678', address: 'Lagos', note: '',
    });
    component.goToPayment();
    expect(component.currentStep).toBe(2);
    component.goToDelivery();
    expect(component.currentStep).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests — expect compile/runtime failures (red state)**

```bash
ng test --watch=false
```

Expected: FAIL — Properties like `currentStep`, `deliveryForm`, `goToPayment`, etc. do not exist on the current component.

---

## Task 5: Rewrite CheckoutModalComponent TypeScript

**Files:**
- Modify: `src/app/cart-page/checkout-modal/checkout-modal.component.ts`

- [ ] **Step 1: Replace the TypeScript file**

```typescript
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
```

- [ ] **Step 2: Run tests — expect all to pass**

```bash
ng test --watch=false
```

Expected: All tests PASS (including all CheckoutModalComponent and CartService tests)

- [ ] **Step 3: Commit**

```bash
git add src/app/cart-page/checkout-modal/checkout-modal.component.ts src/app/cart-page/checkout-modal/checkout-modal.component.spec.ts
git commit -m "feat: rewrite CheckoutModalComponent with 3-step payment flow"
```

---

## Task 6: Rewrite CheckoutModalComponent HTML Template

**Files:**
- Modify: `src/app/cart-page/checkout-modal/checkout-modal.component.html`

- [ ] **Step 1: Replace the template**

```html
<!-- ───── STEP 1: DELIVERY DETAILS ───── -->
<ng-container *ngIf="currentStep === 1">
  <div class="dialog-header">
    <span class="dialog-title">CHECKOUT</span>
    <button class="close-btn" (click)="backToCart()">✕</button>
  </div>

  <div class="stepper">
    <div class="step active">
      <div class="step-dot">1</div>
      <span class="step-label">Delivery</span>
    </div>
    <div class="step-line"></div>
    <div class="step inactive">
      <div class="step-dot">2</div>
      <span class="step-label">Payment</span>
    </div>
    <div class="step-line"></div>
    <div class="step inactive">
      <div class="step-dot">3</div>
      <span class="step-label">Confirm</span>
    </div>
  </div>

  <div class="dialog-body" [formGroup]="deliveryForm">
    <label class="field-label">Full Name</label>
    <input class="field" formControlName="fullName" placeholder="e.g. Omolara Aworeni" />

    <label class="field-label">Phone Number</label>
    <input class="field" formControlName="phone" placeholder="e.g. 08012345678" maxlength="11" />
    <div class="field-error"
      *ngIf="deliveryForm.get('phone')?.invalid && deliveryForm.get('phone')?.touched">
      Enter an 11-digit Nigerian phone number
    </div>

    <label class="field-label">Delivery Address</label>
    <input class="field" formControlName="address" placeholder="e.g. 12 Lekki Phase 1, Lagos" />

    <label class="field-label">
      Delivery Note <span class="optional">(optional)</span>
    </label>
    <input class="field" formControlName="note" placeholder="e.g. Call when you arrive" />

    <button class="btn-primary" (click)="goToPayment()" [disabled]="deliveryForm.invalid">
      Continue to Payment →
    </button>
    <button class="btn-secondary" (click)="backToCart()">← Back to Cart</button>
  </div>
</ng-container>

<!-- ───── STEP 2: PAYMENT ───── -->
<ng-container *ngIf="currentStep === 2">
  <div class="dialog-header">
    <span class="dialog-title">CHECKOUT</span>
    <button class="close-btn" (click)="backToCart()">✕</button>
  </div>

  <div class="stepper">
    <div class="step done">
      <div class="step-dot">✓</div>
      <span class="step-label">Delivery</span>
    </div>
    <div class="step-line done"></div>
    <div class="step active">
      <div class="step-dot">2</div>
      <span class="step-label">Payment</span>
    </div>
    <div class="step-line"></div>
    <div class="step inactive">
      <div class="step-dot">3</div>
      <span class="step-label">Confirm</span>
    </div>
  </div>

  <div class="dialog-body">
    <div class="amount-badge">Total: {{ data.totalPrice | currency:'₦':true }}</div>

    <div class="pay-tabs">
      <button class="pay-tab" [class.active]="activePayTab === 'card'" (click)="setPayTab('card')">
        💳 Card
      </button>
      <button class="pay-tab" [class.active]="activePayTab === 'transfer'" (click)="setPayTab('transfer')">
        🏦 Bank Transfer
      </button>
    </div>

    <!-- Card Tab -->
    <div *ngIf="activePayTab === 'card'" [formGroup]="cardForm">
      <div class="card-chip"></div>

      <label class="field-label">Card Number</label>
      <input class="field" formControlName="cardNumber"
        placeholder="1234 5678 9012 3456" maxlength="16" />

      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Expiry</label>
          <input class="field" formControlName="expiry" placeholder="MM/YY" maxlength="5" />
        </div>
        <div class="field-group">
          <label class="field-label">CVV</label>
          <input class="field" formControlName="cvv" placeholder="•••" maxlength="3" type="password" />
        </div>
      </div>

      <label class="field-label">Cardholder Name</label>
      <input class="field" formControlName="cardName" placeholder="As on card" />

      <button class="btn-primary" (click)="payByCard()" [disabled]="cardForm.invalid || isProcessing">
        <span *ngIf="!isProcessing">Pay {{ data.totalPrice | currency:'₦':true }} →</span>
        <span *ngIf="isProcessing" class="processing-text">Processing...</span>
      </button>
    </div>

    <!-- Bank Transfer Tab -->
    <div *ngIf="activePayTab === 'transfer'">
      <div class="bank-transfer-box">
        <p class="bank-note">Transfer exactly this amount to:</p>
        <div class="bank-name">Wema Bank</div>
        <div class="bank-acct">7823 456 001</div>
        <div class="bank-acct-name">FoodDash Nigeria Ltd</div>
        <div class="bank-timer">⏱ Expires in {{ countdownDisplay }}</div>
      </div>
      <p class="transfer-note">We'll confirm your payment automatically once received.</p>

      <button class="btn-primary" (click)="payByTransfer()" [disabled]="isProcessing">
        <span *ngIf="!isProcessing">I've Sent the Money ✓</span>
        <span *ngIf="isProcessing" class="processing-text">Confirming...</span>
      </button>
    </div>

    <button class="btn-secondary" (click)="goToDelivery()">← Back</button>
  </div>
</ng-container>

<!-- ───── STEP 3: ORDER CONFIRMED ───── -->
<ng-container *ngIf="currentStep === 3">
  <div class="success-header">
    <div class="checkmark-circle">✓</div>
    <div class="success-title">Order Placed!</div>
    <div class="success-sub">Payment received successfully</div>
    <div class="order-badge">ORDER #{{ orderNumber }}</div>
  </div>

  <div class="order-items">
    <div class="order-section-label">Your Order</div>
    <div class="order-row" *ngFor="let item of data.cart.items">
      <span class="food-name">{{ item.food.name }} × {{ item.quantity }}</span>
      <span class="food-price">{{ item.price | currency:'₦':true }}</span>
    </div>
  </div>

  <div class="order-total-row">
    <span>Total Paid</span>
    <span>{{ data.totalPrice | currency:'₦':true }}</span>
  </div>

  <div class="delivery-info">
    <div class="order-section-label">Delivery Details</div>
    <div class="delivery-detail">📍 {{ deliveryForm.get('address')?.value }}</div>
    <div class="delivery-detail">📞 {{ deliveryForm.get('phone')?.value }}</div>
    <div class="eta-badge">🚴 Estimated delivery: 30–45 mins</div>
  </div>

  <div class="success-footer">
    <button class="btn-primary success-btn" (click)="backToHomepage()">
      ← Back to Homepage
    </button>
  </div>
</ng-container>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/cart-page/checkout-modal/checkout-modal.component.html
git commit -m "feat: add 3-step checkout dialog template"
```

---

## Task 7: Rewrite CheckoutModalComponent CSS

**Files:**
- Modify: `src/app/cart-page/checkout-modal/checkout-modal.component.css`

- [ ] **Step 1: Replace the CSS file**

```css
:host {
  display: block;
}

/* ── Header ── */
.dialog-header {
  background: #06402B;
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-family: "Montserrat", sans-serif;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

/* ── Stepper ── */
.stepper {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: #f0fdf4;
  border-bottom: 1px solid #d1fae5;
}

.step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  flex: 1;
  justify-content: center;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.step.active .step-dot { background: #06402B; color: white; }
.step.done .step-dot   { background: #487800; color: white; }
.step.inactive .step-dot {
  background: #e4fde1;
  color: #aaa;
  border: 1px dashed #ccc;
}

.step.active .step-label   { color: #06402B; }
.step.done .step-label     { color: #487800; }
.step.inactive .step-label { color: #bbb; }

.step-line {
  flex: 0 0 20px;
  height: 2px;
  background: #d1fae5;
}

.step-line.done { background: #487800; }

/* ── Form body ── */
.dialog-body {
  padding: 18px 20px 20px;
}

.field-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: #487800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 4px;
  margin-top: 12px;
}

.optional {
  font-weight: 400;
  color: #aaa;
  text-transform: none;
  letter-spacing: 0;
}

.field {
  display: block;
  width: 100%;
  border: 1px solid #c6e8c0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: #06402B;
  background: #fafff9;
  outline: none;
  font-family: "Montserrat", sans-serif;
  transition: border-color 0.2s;
}

.field:focus { border-color: #487800; }
.field::placeholder { color: #aaa; }

.field-error {
  font-size: 10px;
  color: #c0392b;
  margin-top: 3px;
}

.field-row {
  display: flex;
  gap: 10px;
}

.field-group { flex: 1; }

/* ── Payment tabs ── */
.amount-badge {
  display: inline-block;
  background: #06402B;
  color: white;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 14px;
}

.pay-tabs {
  display: flex;
  border: 1px solid #c6e8c0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
}

.pay-tab {
  flex: 1;
  padding: 9px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #f0fdf4;
  color: #487800;
  font-family: "Montserrat", sans-serif;
  transition: background 0.2s, color 0.2s;
}

.pay-tab.active {
  background: #06402B;
  color: white;
}

.card-chip {
  width: 32px;
  height: 22px;
  background: linear-gradient(135deg, #d4af37, #f5e96e);
  border-radius: 4px;
  margin-bottom: 12px;
}

/* ── Bank transfer ── */
.bank-transfer-box {
  background: #f0fdf4;
  border: 1px dashed #487800;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 10px;
}

.bank-note      { font-size: 11px; color: #555; margin-bottom: 8px; }
.bank-name      { font-size: 13px; font-weight: 700; color: #06402B; }
.bank-acct      { font-size: 22px; font-weight: 800; color: #06402B; letter-spacing: 2px; margin: 6px 0; }
.bank-acct-name { font-size: 11px; color: #555; }
.bank-timer     { font-size: 12px; color: #c0392b; margin-top: 10px; font-weight: 600; }

.transfer-note {
  font-size: 11px;
  color: #487800;
  text-align: center;
  margin-bottom: 4px;
}

.processing-text { opacity: 0.75; }

/* ── Buttons ── */
.btn-primary {
  display: block;
  width: 100%;
  background: #06402B;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 11px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 16px;
  letter-spacing: 0.5px;
  font-family: "Montserrat", sans-serif;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-secondary {
  display: block;
  width: 100%;
  background: transparent;
  color: #06402B;
  border: 1px solid #487800;
  border-radius: 24px;
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  font-family: "Montserrat", sans-serif;
  transition: background 0.2s;
}

.btn-secondary:hover { background: #f0fdf4; }

/* ── Success screen ── */
.success-header {
  background: linear-gradient(135deg, #06402B, #487800);
  padding: 28px 20px 22px;
  text-align: center;
  color: white;
}

.checkmark-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 28px;
  animation: popIn 0.4s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.success-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.success-sub   { font-size: 12px; opacity: 0.85; }

.order-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 4px 16px;
  font-size: 11px;
  font-weight: 700;
  margin-top: 10px;
  letter-spacing: 1px;
}

.order-items {
  padding: 14px 20px;
  border-bottom: 1px solid #e4fde1;
  max-height: 140px;
  overflow-y: auto;
}

.order-section-label {
  font-size: 10px;
  font-weight: 700;
  color: #487800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.order-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0fdf4;
}

.order-row:last-child { border: none; }
.food-name  { color: #06402B; }
.food-price { color: #487800; font-weight: 600; }

.order-total-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: #f0fdf4;
  font-weight: 700;
  font-size: 14px;
  color: #06402B;
  border-bottom: 1px solid #d1fae5;
}

.delivery-info {
  padding: 12px 20px;
  border-bottom: 1px solid #e4fde1;
}

.delivery-detail {
  font-size: 12px;
  color: #555;
  margin-bottom: 4px;
}

.eta-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e4fde1;
  border: 1px solid #87c878;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #06402B;
  margin-top: 10px;
}

.success-footer { padding: 16px 20px; }

.success-btn { background: #487800; }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/cart-page/checkout-modal/checkout-modal.component.css
git commit -m "feat: style checkout modal with site green palette"
```

---

## Task 8: Manual Smoke Test

- [ ] **Step 1: Start the dev server**

```bash
ng serve
```

Open `http://localhost:4200` in the browser.

- [ ] **Step 2: Test the happy path — Card payment**

1. Add any food item to the cart
2. Navigate to the cart page
3. Click **Checkout** — the dialog should open on Step 1
4. Fill in: Name, Phone (11 digits), Address → click **Continue to Payment**
5. Step 2 opens — Card tab is active, total badge shows correct amount
6. Fill in: Card Number (16 digits), Expiry (e.g. `12/26`), CVV (3 digits), Cardholder Name
7. Click **Pay ₦X,XXX →** — button shows "Processing..." for 2 seconds
8. Step 3 opens — success header, animated checkmark, order number, item list, delivery address, ETA badge
9. Click **← Back to Homepage** — dialog closes, navigates to `/`, cart is empty

- [ ] **Step 3: Test the Bank Transfer tab**

1. Add items to cart, open checkout, fill delivery form
2. On Step 2, click **🏦 Bank Transfer** tab
3. Confirm: account number, bank name, countdown timer visible
4. Click **I've Sent the Money ✓** — shows "Confirming..." for 1 second, then Step 3

- [ ] **Step 4: Test form validation**

1. On Step 1, click **Continue to Payment** without filling anything — button should be disabled
2. Enter a 10-digit phone number, tab out — error message "Enter an 11-digit Nigerian phone number" appears
3. On Step 2 Card tab, click **Pay** without filling card fields — button should be disabled

- [ ] **Step 5: Run full test suite one final time**

```bash
ng test --watch=false
```

Expected: All tests PASS with no errors.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete checkout payment gateway flow with success screen"
```
