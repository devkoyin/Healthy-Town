# Checkout Payment Gateway Flow — Design Spec

**Date:** 2026-05-14  
**Status:** Approved

---

## Overview

Replace the current placeholder checkout dialog (which shows a single "Proceed to Checkout" button and calls `alert('thanks for shopping')`) with a believable, Nigerian-market payment gateway flow modelled on Paystack/Flutterwave patterns.

---

## Architecture

The flow lives entirely inside the existing Angular Material Dialog (`CheckoutModalComponent`). No new routes are added. The dialog is extended to manage an internal step state, rendering one of three step views based on `currentStep: 1 | 2 | 3`.

### Step state machine

```
[Step 1: Delivery Details]
       ↓ "Continue to Payment"
[Step 2: Payment]
  ├── Tab A: Card Payment
  └── Tab B: Bank Transfer
       ↓ "Pay" / "I've Sent the Money"
[Step 3: Order Confirmed]
       ↓ "Back to Homepage"
    [Dialog closes, router.navigate('/')]
```

---

## Components & Files

| File | Change |
|------|--------|
| `checkout-modal.component.ts` | Rewrite: add step state, form groups, mock payment logic |
| `checkout-modal.component.html` | Rewrite: stepper + 3 step views |
| `checkout-modal.component.css` | Rewrite: full styling matching site green palette |

No new components or services are needed. The order summary data is passed into the dialog via `MatDialog.open()` data injection from `CartPageComponent`.

---

## Step 1 — Delivery Details

**Fields (all required except Delivery Note):**
- Full Name
- Phone Number
- Delivery Address
- Delivery Note (optional)

**Validation:** Angular `ReactiveFormsModule` with a `FormGroup`. The "Continue to Payment" button is disabled until the required fields are valid. Phone must be 11 digits.

**Navigation:** "Continue to Payment →" advances to Step 2. "← Back to Cart" closes the dialog.

---

## Step 2 — Payment

**Header:** Displays the cart total (e.g. `Total: ₦17,498`) as a badge.

**Two tabs:** Card | Bank Transfer

### Card Tab
- Card Number (16 digits, auto-formatted with spaces)
- Expiry (MM/YY)
- CVV (3 digits, masked)
- Cardholder Name

Clicking "Pay ₦XX,XXX →" triggers a mock 2-second loading spinner, then advances to Step 3.

### Bank Transfer Tab
- Displays a static generated account number (Wema Bank, `7823 456 001`, `FoodDash Nigeria Ltd`)
- Countdown timer starting at 30:00 (cosmetic only)
- "I've Sent the Money ✓" button advances directly to Step 3 after a 1-second mock delay

**Navigation:** "← Back" returns to Step 1.

---

## Step 3 — Order Confirmed

**Header:** Green gradient, animated checkmark, "Order Placed!", "Payment received successfully", random order number (`#FD-XXXXX`).

**Body:**
- Itemized order list (food name, quantity, price) — pulled from cart data passed via dialog
- Total paid
- Delivery address (from Step 1 form)
- Phone number (from Step 1 form)
- Estimated delivery badge: "🚴 Estimated delivery: 30–45 mins"

**Footer:** "← Back to Homepage" button — closes dialog and navigates to `/`.

The cart is **cleared** when Step 3 is reached (calls `CartService.clearCart()`).

---

## Data Flow

```
CartPageComponent
  → opens MatDialog with { data: { cart, totalPrice } }
  → CheckoutModalComponent receives cart via MAT_DIALOG_DATA
  → Step 1 form collects delivery info (stored in component)
  → Step 2 mock payment fires → advances step
  → Step 3 renders order summary from cart data + delivery form values
  → On "Back to Homepage": CartService.clearCart(), dialogRef.close(), router.navigate('/')
```

---

## Styling

Matches existing site palette:
- Dark green `#06402B` — headers, primary buttons, labels
- Mid green `#487800` — secondary actions, field labels, accents
- Light green `#E4FDE1` / `#EFFDEE` — backgrounds, tab inactive states
- Font: Montserrat / Nunito (already global)
- Button shape: pill (`border-radius: 24px`) consistent with existing cart buttons

---

## CartService Addition

Add a `clearCart()` method to `CartService` that resets `this.cart` to a new empty `Cart` instance. No localStorage is involved — the service is fully in-memory.

---

## Out of Scope

- Real payment processing (no API calls)
- OTP / 3DS verification screens
- Save card for later
- Order history page
