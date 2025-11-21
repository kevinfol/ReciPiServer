var express = require("express");
var router = express.Router();

// Fuzzy Search
const Fuse = require("fuse.js");
const fuseOptions = {
  keys: [
    "name",
    "source",
    "description",
    "recipeCategory",
    "recipeCuisine",
    "recipeIngredient",
  ],
  includeScore: false,
};

const {
  getRecipes,
  addRecipe,
  getRecipeCount,
} = require("../database/database_operations");
const { createRecipeFromURL } = require("../database/parse_recipe");

const d = `Lorem ipsum dolor sit amet, consectetur elit. Vestibulum iaculis diam sapien, a hendrerit odio gravida et. Pellentesque eleifend lobortis magna, at pellentesque metus egestas eu. Nulla fringilla commodo diam quis condimentum. Vestibulum et est a nulla sodales tincidunt. Curabitur suscipit venenatis laoreet. Curabitur massa massa, tincidunt et nisl in, rutrum vestibulum lorem. Suspendisse eget mauris et nulla sagittis volutpat. Sed non feugiat urna, vel sollicitudin ligula. Pellentesque ac eros vestibulum, sagittis nisi at, dictum justo. Pellentesque non nunc sed massa sagittis commodo ac ac orci. Praesent libero mauris, tristique non nisl non, condimentum vulputate risus. Cras at gravida tortor, at dictum est. Aenean iaculis mattis metus, ut lobortis nibh tempor nec.`;

const r = {
  1: {
    source: "Anne'sPantsRecipes",
    name: "First Recipe",
    description: d,
    imageUrl:
      "https://joyfoodsunshine.com/wp-content/uploads/2018/02/best-chocolate-chip-cookies-recipe-1.jpg",
  },
  2: {
    source: "Super Duper Recipie",
    name: "The Second Recipe has a longer name",
    description: d,
    imageUrl:
      "https://joyfoodsunshine.com/wp-content/uploads/2018/02/best-chocolate-chip-cookies-recipe-1.jpg",
  },
  3: {
    source: "All The Best",
    name: "Three",
    description: d,
    imageUrl:
      "https://joyfoodsunshine.com/wp-content/uploads/2018/02/best-chocolate-chip-cookies-recipe-1.jpg",
  },
  4: { name: "Fourth Recipe: RRRREEEEE", source: "tata.biz", description: d },
  5: {
    name: "The Fifth Recipe has a really really really long name. Like really long.",
    source: "Amy's Shamy",
    imageUrl:
      "https://joyfoodsunshine.com/wp-content/uploads/2018/02/best-chocolate-chip-cookies-recipe-1.jpg",
  },
  6: {
    name: "recipe number 6",
    description: d,
    imageUrl:
      "https://joyfoodsunshine.com/wp-content/uploads/2018/02/best-chocolate-chip-cookies-recipe-1.jpg",
  },
};

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("server", req.app.get("SERVER_NAME"));
  const sName = req.app.get("SERVER_NAME");
  res.render("recipe-view", {
    recipes: getRecipes(),
    server_name: sName,
    num_recipes: getRecipeCount(),
    version: req.app.get("VERSION"),
  });
});

router.get("/get-recipes", (req, res) => {
  const searchTerm = req.query?.search_term;
  console.log("searchTerm", searchTerm);
  const recipes = getRecipes();
  console.log("rec", recipes);
  if (searchTerm) {
    const f = new Fuse(recipes, fuseOptions);
    const sortedRecipes = f.search(searchTerm);
    res.json(f.map((sr) => sr.item));
  } else {
    res.json(recipes);
  }
});

router.post("/add-recipe", (req, res) => {
  console.log(req.body);
  const url = req.body?.url;
  if (url) {
    createRecipeFromURL(url).then((recipe) => {
      if (recipe) {
        const key = addRecipe(recipe);
        res.send(key);
      } else {
        res.sendStatus(500);
      }
    });
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
