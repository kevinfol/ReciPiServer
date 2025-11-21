"use strict";

/**
 * Script Name: database_operations.js
 * Description:
 *  Contains functions for interacting with the database.
 */

const nanoid = require("nanoid");
const fs = require("fs");
const dbFile = "./database/recipe_db.json";

/**
 * Reads the recipes object from the JSON file on the filesystem.
 *
 * @returns {Object} - recipes
 */
function readRecipeDB() {
  try {
    const recipes = fs.readFileSync(dbFile, "utf8");
    return JSON.parse(recipes);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Writes the recipe database defined by the provided 'recipes' object
 * to the filesystem.
 *
 * @param {Object} recipes
 */
function writeRecipeDB(recipes) {
  fs.writeFileSync(dbFile, JSON.stringify(recipes));
  console.log("Successfully wrote database.");
}

function getRecipes() {
  return readRecipeDB();
}

/** Clears the entire recipe database and writes an empty DB to the
 * filesystem.
 */
function clearAllRecipes() {
  writeRecipeDB([]);
}

function backupDatabase() {
  fs.copyFile(dbFile, "bak_" + dbFile, (error) => {
    if (error) throw error;
    console.log("Backed up database.");
  });
}

/**
 * Returns the number of recipes in the DB
 *
 * @returns {Number} - The number of recipes currently in the DB
 */
function getRecipeCount() {
  const recipes = readRecipeDB();
  return recipes.length;
}

/**
 * Returns an array containing unsorted recipe_keys in the DB.
 *
 * @returns {Array} - Array of recipe keys
 */
function getRecipeKeys() {
  const recipes = readRecipeDB();
  return recipes.map((r) => r.key);
}

/**
 * Gets the recipe associated with the provided 'recipe_key'
 * If the recipe_key doesn't exist in the DB, returns 'undefined'
 *
 * @param {String} recipe_key - The JSON DB key for the recipe
 * @returns {Object} - recipe object
 */
function getRecipe(recipe_key) {
  const recipes = readRecipeDB();
  const recipe = recipes.find((r) => r.key == recipe_key);
  return recipe;
}

/**
 * Deletes a recipe from the JSON database and saves the database
 *
 * @param {String} recipe_key - The JSON DB key for the recipe
 */
function deleteRecipe(recipe_key) {
  const recipes = readRecipeDB();
  const index = recipes.findIndex((r) => r.key == recipe_key);
  if (index >= 0) {
    recipes.splice(index, 1);
    writeRecipeDB(recipes);
  }
}

/**
 * Adds a recipe to the JSON database and saves the database
 *
 * @param {Object} recipe  - The recipe body
 */
function addRecipe(recipe) {
  const recipes = readRecipeDB();
  recipe.key = nanoid.nanoid();
  recipe.added_ts = new Date();
  recipes.push(recipe);
  writeRecipeDB(recipes);
  return recipe.key;
}

module.exports = {
  getRecipes,
  getRecipeCount,
  getRecipe,
  getRecipeKeys,
  deleteRecipe,
  addRecipe,
  backupDatabase,
  clearAllRecipes,
};
