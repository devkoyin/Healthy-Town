//  export in this case makes the class accessible from ooutside the ts file
// the exclamation mark means id is mandatory...if u want it to be optional use a question mark. for a default value just add the equal to sign with the default value.
export class Food{
     id!: number;
     name!: string;
     price!: number;
     tags?: string[];
     favourite: boolean = false;
     stars: number= 0;
     imageUrl!: string;
     origins!: string[];
     cookTime !: string;
  static id: number;
}