import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FoodpageComponent } from './foodpage/foodpage.component';
import { CartPageComponent } from './cart-page/cart-page.component';
 

export const routes: Routes = [
    // Here we are adding a new component to the route the (''empty string after the path) indicates the home page of our application...so whever we go to the home page of our application it needs to load this component(i.e component:HomeComponent)
    {path: '', component:HomeComponent},
    {path: 'search/: searchTerm', component:HomeComponent},
    {path: 'tag/:tag', component:HomeComponent},
    {path: 'food/:id', component:FoodpageComponent},
    {path: 'cart-page' , component: CartPageComponent}
];
