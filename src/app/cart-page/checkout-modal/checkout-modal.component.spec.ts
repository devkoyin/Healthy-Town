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
