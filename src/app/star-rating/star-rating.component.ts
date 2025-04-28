import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'app-star-rating',
  imports: [CommonModule, MatIconModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css',
  standalone: true
})
export class StarRatingComponent {
  @Input() maxStars = 5;
  @Input() currentRating = 0;
  // @Input() [readonly] = true;
  @Input() readOnly = false;
  @Input() allowHalfStars = true;
  @Input() value: number = 0;
  @Output() ratingChange: EventEmitter<number> = new EventEmitter<number>();

  stars: number[] = [];

  ngOnInit() {
    this.stars = Array(this.maxStars).fill(0).map((_, i) => i + 1);
  }

  setRating(rating: number, event: MouseEvent) {
    if (this.readOnly) return;

    if (this.allowHalfStars) {
      const starElement = event.target as HTMLElement;
      const starRect = starElement.getBoundingClientRect();
      const clickPosition = event.clientX - starRect.left;
      const starWidth = starRect.width;
      
      // If clicked on the left half, set a half-star rating
      const newRating = (clickPosition < starWidth / 2) ? rating - 0.5 : rating;
      this.currentRating = newRating;
      this.ratingChange.emit(newRating);
    } else {
      this.currentRating = rating;
      this.ratingChange.emit(rating);
    }
  }


  // getClass (star, currentRating){


  //   if(star === 1 ){
  //     return false
  //   }
  //   if(star <= currentRating){
  //     return true
  //   }
  // }
}
