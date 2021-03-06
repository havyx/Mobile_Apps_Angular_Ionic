import {Component, OnInit} from '@angular/core';
import {Recipe} from './recipe.module';
import {RecipesService} from './recipes.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit {
  recipes: Recipe[];

  constructor(private recipeService: RecipesService) {}

  ngOnInit() {
    console.log('ngOnInit');
  }
  ionViewWillEnter() {
    this.recipes = this.recipeService.getAllRecipes();
    console.log(this.recipes);
    console.log('ionViewWillEnter');
  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter');
  }
  ionViewWillLeave() {
    console.log('ionViewWillLeave');
  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave');
  }
}
