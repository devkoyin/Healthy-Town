import { Injectable } from '@angular/core';
import { Food } from '../../shared/Food';
import {Tag} from '../../shared/models/Tag';

@Injectable({
  providedIn: 'root',
})
export class FoodService {

  getFoodById(id: number): Food{
    return this.getAll().find(food => food.id == id)!;   
  }
  
  // getAllByTag(): Tag[]{};
  
  
  // Single Image: The component uses the getFoodUrl() method of the FoodService to get a single image URL.

  // Multiple Images: The component uses the getAll() method to get an array of food URLs and displays them using *ngFor.

  getFoodUrl(): string {
    return '';
  }

  constructor() {}
// we are already inside the food service therefore we can remove the this.foodservice and just use this .getAll()
  getAllFoodsBySearchTerm(searchTerm:string) :Food[] {
    return this
      .getAll()
      .filter((food: { name: string; }) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()))

  }

  getAllTags(): Tag[]{
    return[
      {name: 'All', count: 8},
      {name: 'Fruit', count: 6},
      {name: 'Vegetable', count: 2},
      {name: 'Cake', count: 2},
      {name: 'Juice', count: 1},
      {name: 'Salad', count: 1},
      {name: 'Steak', count: 1},
      {name: 'Parfait', count: 1},
    ]
 }

  getAllFoodsByTag(tag: string): Food[] {
    // this is an explanation of the code below.
    // we can use terenary operation i.e we have a statement? is it true(dojob1) if not (dojob2) = statement?dojob1:dojob2
       return tag == "All"? 
       this.getAll(): 
       this.getAll().filter(food => food.tags?.includes(tag));

      //  this is a breakdown of the code above
    // if(tag == "All")
    //   return this.getAll();
    // 
    //  return this.getAll().filter(food => food.tags?.includes(tag))
  } 

  getAll(): Food[] {
    return [
      {
        id: 1,
        name:'Vege-Creamy Mashed Potatoes',
        price: 12500,
        tags: ['Vegetable'],
        favourite: false,
        stars: 4,
        imageUrl: 'assets/images/food pics/chicken potato.jpg',
        origins: ['South America'],
        cookTime: '1 hour',
      },

      {
        id: 2,
        name: ' Creamy Berry Parfait',
        price: 7000,
        tags: ['Fruit', 'Parfait'],
        favourite: true,
        stars: 4.1,
        imageUrl:
          'assets/images/food pics/foodiesfeed.com_delicious-yogurt-parfait-with-fresh-berries.jpg',
        origins: ['France'],
        cookTime: '20 mins',
      },

      {
        id: 3,
        name: 'Fresh Chickpea Salad',
        price: 10000,
        tags: ['Fruit', 'Salad'],
        favourite: false,
        stars: 4.5,
        imageUrl:
          'assets/images/food pics/foodiesfeed.com_fresh-chickpea-salad-with-herbs-and-vegetables.jpg',
        origins: ['Arab'],
        cookTime: '45 mins',
      },

      {
        id: 4,
        name: 'Lemon Vegan Cheese Cake',
        price: 6900,
        tags: ['Fruit', 'Cake'],
        favourite: true,
        stars: 4.9,
        imageUrl:
          'assets/images/food pics/foodiesfeed.com_refreshing-lemon-cheesecake-slice-with-mint-garnish.jpg',
        origins: ['Greece'],
        cookTime: '30 mins',
      },

      {
        id: 5,
        name: 'Fruit Tarts',
        price: 5999,
        tags: ['Fruit'],
        favourite: false,
        stars: 5.0,
        imageUrl: 'assets/images/food pics/fruit tart.jpg',
        origins: ['France'],
        cookTime: '30 mins',
      },

      {
        id: 6,
        name: 'Lemon Banana Bread',
        price: 9999,
        tags: ['Fruit', 'Cake'],
        favourite: false,
        stars: 5.0,
        imageUrl: 'assets/images/food pics/lemon cake.jpg',
        origins: ['United States'],
        cookTime: '45 mins',
      },

      {
        id: 7,
        name: 'Steak with Steamed Vegetables',
        price: 15000,
        tags: ['Vegetable', 'Steak'],
        favourite: true,
        stars: 5.0,
        imageUrl: 'assets/images/food pics/steak veg.jpg',
        origins: ['Italy'],
        cookTime: '1hour 15mins',
      },

      {
        id: 8,
        name: 'Fresh Mango Juice',
        price: 4500,
        tags: ['Fruit', 'Juice'],
        favourite: false,
        stars: 4.5,
        imageUrl: 'assets/images/food pics/mango punch.jpg',
        origins: ["Southeast Asia"],
        cookTime: '10mins',
      },
    ];
  }
}
