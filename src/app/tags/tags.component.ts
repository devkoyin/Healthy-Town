import { Component } from '@angular/core';
import { Tag } from '../shared/models/Tag';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FoodService } from '../services/food/food.service';
import { EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tags',
  imports: [CommonModule, RouterModule],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})

export class TagsComponent {
 // the ? sign is nullable  which infers that the values are only used in the specified page
  @Input()
  foodPageTags?:string[];
 
  @Input()
JustifyContent: string = 'center';

  // tags:Tag[]=[];
tags?:Tag[];

tag: any  ;
filteredFoods: any[] = [];




constructor(private foodService:FoodService,
  private router: Router,
  private route: ActivatedRoute,
) {

}

ngOnInit(): void{

  if (this.foodPageTags) {
  
  }
  else{this.tags = this.foodService.getAllTags();
    this.route.paramMap.subscribe(params => {
      this.tag = params.get('tag') || 'All';
      // console.log('tags', this.tag)
      this.filteredFoods = this.foodService.getAllFoodsByTag(this.tag);
    });}

}


}


