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
