import { Food } from '../Food';

export class CartItem {
  static food: any;
  // food is a parameter passed into the constructor(injects the service)
  constructor(food: Food) {
    // here we are assigning a value to the class property(assigns value from parameter to property and makes it usable in the template)
    this.food = food;
    // this.getPrice();
    // lets's use getter and setters in type-script instead in our cart.ts file to make it neater.
  }
  food: Food;
  // The abovle line of code is a property
  quantity: number = 1;

  // getPrice()
  get price(): number {
    return this.food.price * this.quantity;
  }
}
