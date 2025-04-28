import { CartItem } from "./cartItem";

export class Cart{
    // we make the cart item an empty array by default
    items: CartItem[] =[];

    get totalPrice(): number{
        let totalPrice = 0;
        this.items.forEach(item => {
            totalPrice += item.price;
        });

        return totalPrice;
    }
}