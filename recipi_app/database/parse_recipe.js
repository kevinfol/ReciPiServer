'use strict';

/**
 * Script Name: parse_recipe.js
 * Description:
 *  Provides the function to parse a recipe from a
 *  provided URL
 */

const jsdom = require('jsdom');

/**
 * Tests a provided 'urlString' for validity.
 *
 * @param {String} urlString - a URL to test
 * @returns {Boolean} - Whether or not the 'urlString' is a valid URL
 * @example
 * // returns false
 * isURLValid("notARealURL.biz.whiz://fakeSauce")
 */
function isURLValid(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Loads the DOM from the website at the provided 'url' and
 * returns the JSDOM dom object for parsing.
 *
 * @param {String} url - a valid URL to load a recipe from
 * @returns {JSDOM} - a JSDOM object for the page.
 */
async function getDOMFromURL(url) {
  // try and get the URL
  const response = await fetch(url);
  if (response.ok) {
    const html = await response.text();
    const dom = new jsdom.JSDOM(html, {
      url: url,
      contentType: 'text/html',
    });
    return dom;
  }

  return undefined;
}

/**
 * Returns true if the provided 'jsonObj' contains an actual LD-JSON recipe,
 * false otherwise
 *
 * @param {Object} jsonObj - Object to test
 * @returns {boolean} - whether the jsonObj is a recipe.
 */
function isJSONRecipe(jsonObj) {
  return isNormalStyleRecipe(jsonObj) || isAllRecipesRecipe(jsonObj);
}

function isAllRecipesRecipe(jsonObj) {
  if (Array.isArray(jsonObj)) {
    if ((typeof jsonObj[0] === 'object') & !Array.isArray(jsonObj[0])) {
      if (Object.keys(jsonObj).includes('recipeInstructions')) {
        return true;
      }
    }
  }
  return false;
}

function isNormalStyleRecipe(jsonObj) {
  if (Object.keys(jsonObj).includes('@graph')) {
    if (jsonObj['@graph'].find((g) => g?.['@type'] === 'Recipe')) {
      return true;
    }
  }
  return false;
}

/**
 * Sometimes recipes provide yields as an array like this:
 * recipeYield: ['33', '33 cookies']
 *
 * This function tries to only return the second, more descriptive yield
 * if possible
 * @param {*} yeildObject
 * @returns most descriptive yield.
 */
function parseYield(yeildObject) {
  if (Array.isArray(yeildObject)) {
    const descriptiveYield = yeildObject.find((y) => y.trim().includes(' '));
    return descriptiveYield ? descriptiveYield : yeildObject[0];
  } else {
    return yeildObject;
  }
}

/**
 * Returns a simplified list of instructions from a standard
 * LD+JSON recipeInstructions object. (i.e. removes images and
 * other unnecessary text or video or other stuff.)
 * @param {Array} instructionsObj - raw recipeInstructions Array from website.
 * @returns {Array} - array of simplified recipeInstructions.
 */
function parseRecipeInstructions(instructionsObj) {
  const instructions = [];
  for (const instruction of instructionsObj) {
    if (instruction['@type'] === 'HowToStep') {
      instructions.push({
        '@type': instruction['@type'],
        text: instruction['text'],
      });
    } else if (instruction['@type'] === 'HowToSection') {
      const section = {
        '@type': instruction['@type'],
        name: instruction?.['name'] || instructions.length,
        itemListElement: [],
      };
      for (const subInstruction of instruction.itemListElement) {
        section['itemListElement'].push({
          '@type': subInstruction['@type'],
          text: subInstruction['text'],
        });
      }
      instructions.push(section);
    } else {
      continue;
    }
  }
  return instructions;
}

function parseRecipeImage(obj) {
  if (Array.isArray(obj)) {
    if (typeof obj[0] === 'string') {
      return obj[0];
    }
  } else if (typeof obj === 'string') {
    return obj;
  } else {
    return undefined;
  }
}

/**
 * Parses an AllRecipes formatted recipe into a ReciPi formatted recipe.
 *
 * @param {Object} jsonObj - Object containing the AllRecipes formatted recipe.
 * @returns {Object} - ReciPi formatted recipe.
 */
function parseAllRecipesFormat(jsonObj) {
  const recipe = {
    name: jsonObj[0]?.name,
    description: jsonObj[0]?.description,
    source: jsonObj[0]?.publisher?.name || jsonObj[0]?.publisher?.brand,
    imageUrl: jsonObj[0]?.image?.url,
    prepTime: jsonObj[0]?.prepTime,
    cookTime: jsonObj[0]?.cookTime,
    totalTime: jsonObj[0]?.totalTime,
    recipeYield: parseYield(jsonObj[0]?.recipeYield),
    recipeCuisine: jsonObj[0]?.recipeCuisine,
    recipeCategory: jsonObj[0]?.recipeCategory,
    recipeIngredient: jsonObj[0]?.recipeIngredient,
    recipeInstructions: parseRecipeInstructions(jsonObj[0]?.recipeInstructions),
  };
  return recipe;
}

function parseNormalRecipeFormat(jsonObj) {
  const recipeObj = jsonObj['@graph'].find((g) => g['@type'] === 'Recipe');
  const orgObj = jsonObj['@graph'].find((g) => g['@type'] === 'Organization');
  const imgObj = jsonObj['@graph'].find((g) => g['@type'] === 'ImageObject');
  const websiteObj = jsonObj['@graph'].find((g) => g['@type'] === 'WebSite');
  const recipe = {
    name: recipeObj?.name,
    description: recipeObj?.description,
    source: orgObj?.name || websiteObj?.name,
    imageUrl: parseRecipeImage(recipeObj?.image || imgObj?.url),
    prepTime: recipeObj?.prepTime,
    cookTime: recipeObj?.cookTime,
    totalTime: recipeObj?.totalTime,
    recipeYield: parseYield(recipeObj?.recipeYield),
    recipeCuisine: recipeObj?.recipeCuisine,
    recipeCategory: recipeObj?.recipeCategory,
    recipeIngredient: recipeObj?.recipeIngredient,
    recipeInstructions: parseRecipeInstructions(recipeObj?.recipeInstructions),
  };
  return recipe;
}

/**
 * Returns possible recipe LD-JSON objects from the provided 'dom'.
 *
 * @param {JSDOM} dom - JSDOM document object model containing recipes.
 * @returns {Array} - Array where each element is a possible recipe JSON
 */
function getLDJSONs(dom) {
  const ldJSONScripts = dom.window.document.querySelectorAll(`script[type="application/ld+json"]`);
  return Array.from(ldJSONScripts).map((s) => JSON.parse(s.innerHTML));
}

/**
 * Creates a recipe object from a URL, or returns undefined if any
 * error occurs.
 *
 * @param {String} recipeURL - a string containing a URL to a recipe
 * @returns {Object} recipe Object
 */
async function createRecipeFromURL(recipeURL) {
  // See if the URL is valid
  if (isURLValid(recipeURL)) {
    // Try and get the DOM
    const dom = await getDOMFromURL(recipeURL);

    if (dom) {
      // Get the LD-JSONs and filter for recipes
      const recipeJson = getLDJSONs(dom).find(isJSONRecipe);
      if (recipeJson) {
        // theoretically, the first item here is a recipe.
        // try to parse it.
        recipe = isAllRecipesRecipe(recipeJson)
          ? parseAllRecipesFormat(recipeJson)
          : parseNormalRecipeFormat(recipeJson);
        return recipe;
      }
    }
  }
  return undefined;
}

module.exports = { createRecipeFromURL };
