"use strict";

/**
 * Script Name: recipe_list.js
 * Description:
 *
 */

import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs";

/**
 *
 * @param {String} sorting
 * @param {String} search_term
 */
function renderList(sorting = undefined, search_term = undefined) {
  const recipeCard = document.getElementById("recipe-card");

  // Get the recipes from the server, then render the page
  fetch(`/get-recipes?search_term=${search_term || ""}`).then(
    (response) => {
      if (response.ok) {
        response.json().then((json) => {
          const recipes = JSON.parse(json);
        });
      } else {
        alert(
          "Something is wrong with the server response: " + response.status
        );
      }
    },
    (error) => {
      alert(error);
    }
  );
}
