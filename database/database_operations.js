'use strict';

/**
 * Script Name: database_operations.js
 * Description:
 *  Contains functions for interacting with the database.
 */

const nanoid = require('nanoid');
const fs = require('fs');
const dbFile = 'recipe_db.json';

/**
 * Reads the recipes object from the JSON file on the filesystem.
 *
 * @returns {Object} - recipes
 */
function readRecipeDB() {
  try {
    const recipes = fs.readFileSync(dbFile, 'utf8');
    return recipes;
  } catch (error) {
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
  fs.writeFile(dbFile, JSON.stringify(recipes), (error) => {
    if (error) throw error;
    console.log('Successfully wrote database.');
  });
}

/** Clears the entire recipe database and writes an empty DB to the
 * filesystem.
 */
function clearAllRecipes() {
  writeRecipeDB({});
}

function backupDatabase() {
  fs.copyFile(dbFile, 'bak_' + dbFile, (error) => {
    if (error) throw error;
    console.log('Backed up database.');
  });
}

/**
 * Returns the number of recipes in the DB
 *
 * @returns {Number} - The number of recipes currently in the DB
 */
function getRecipeCount() {
  const recipes = readRecipeDB();
  return Object.keys(recipes).length;
}

/**
 * Returns an array containing unsorted recipe_keys in the DB.
 *
 * @returns {Array} - Array of recipe keys
 */
function getRecipeKeys() {
  const recipes = readRecipeDB();
  return Object.keys(recipes);
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
  if (Object.keys(recipes).includes(recipe_key)) {
    return recipes[recipe_key];
  }
  return undefined;
}

/**
 * Deletes a recipe from the JSON database and saves the database
 *
 * @param {String} recipe_key - The JSON DB key for the recipe
 */
function deleteRecipe(recipe_key) {
  const recipes = readRecipeDB();
  if (Object.keys(recipes).includes(recipe_key)) {
    delete recipes[recipe_key];
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
  const recipe_key = nanoid.nanoid();
  if (!Object.keys(recipes).includes(recipe_key)) {
    recipes[recipe_key] = recipe;
    writeRecipeDB(recipes);
  } else {
    throw Error(`Recipe with key: ${recipe_key} already exists. Not adding.`);
  }
}

module.exports = {
  getRecipeCount,
  getRecipe,
  getRecipeKeys,
  deleteRecipe,
  addRecipe,
  backupDatabase,
  clearAllRecipes,
};
