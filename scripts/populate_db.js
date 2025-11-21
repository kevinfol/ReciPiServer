import { addRecipe, clearAllRecipes } from "../database/database_operations.js";
import { createRecipeFromURL } from "../database/parse_recipe.js";
clearAllRecipes();

const URLS = [
  "https://joyfoodsunshine.com/the-most-amazing-chocolate-chip-cookies/",
  "https://www.allrecipes.com/recipe/9174/peanut-butter-pie/",
  "https://www.loveandlemons.com/gimlet/",
  "https://www.bbcgoodfood.com/recipes/quick-gazpacho",
  "https://natashaskitchen.com/strawberries-romanoff-recipe/",
  "https://www.thespruceeats.com/russian-blini-recipe-buckwheat-pancakes-1136797",
  "https://www.sainsburysmagazine.co.uk/recipes/mains/tortang-talong",
  "https://scandinaviancookbook.com/suksessterte-success-cake/",
  "https://healthfullyeverafter.co/food-nutrition-recipe-blog/2018/oven-baked-french-fries-with-black-garlic-aioli",
];

for (const u of URLS) {
  createRecipeFromURL(u).then((recipe) => {
    if (recipe) {
      addRecipe(recipe);
    } else {
      console.log("Failed to write recipe: ", u);
    }
  });
}
