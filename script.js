const defaultRecipes = [
  {
    title: "Pasta",
    ingredients: "Noodles, Tomato Sauce, Cheese",
    instructions: "Boil pasta. Add sauce. Mix well. Top with cheese."
  },
  {
    title: "Grilled Cheese",
    ingredients: "Bread, Butter, Cheese",
    instructions: "Butter bread. Add cheese. Grill until golden brown."
  }
];

function getRecipes() {
  const saved = localStorage.getItem("recipes");
  if (saved) {
    return JSON.parse(saved);
  } else {    // If no recipes are saved, initialize with default recipes
    saveRecipes(defaultRecipes);
    return [...defaultRecipes];
  }
}

function saveRecipes(recipes) {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

function createRecipeCard(recipe, index) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
    <h3>${recipe.title}</h3>
    <strong>Ingredients:</strong><p>${recipe.ingredients}</p>
    <strong>Instructions:</strong><p>${recipe.instructions}</p>
    <button class="delete-btn" data-index="${index}">Delete</button>
  `;
  return card;
}

function displayRecipes(recipes) {
  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML = "";
  recipes.forEach((recipe, idx) => {
    recipeList.appendChild(createRecipeCard(recipe, idx));
  });
}

document.getElementById("recipeList").addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-btn")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    const recipes = getRecipes();
    recipes.splice(index, 1);
    saveRecipes(recipes);
    displayRecipes(recipes);
  }
});

function showValidation(message) {
  let validation = document.getElementById("validationMsg");
  if (!validation) {
    validation = document.createElement("div");
    validation.id = "validationMsg";
    validation.style.color = "red";
    document.getElementById("recipeForm").prepend(validation);
  }
  validation.textContent = message;
}

function clearValidation() {
  const validation = document.getElementById("validationMsg");
  if (validation) validation.textContent = "";
}

document.getElementById("recipeForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const instructions = document.getElementById("instructions").value.trim();

  if (!title || !ingredients || !instructions) {
    showValidation("All fields are required.");
    return;
  }
  clearValidation();

  const newRecipe = { title, ingredients, instructions };
  const recipes = getRecipes();
  recipes.push(newRecipe);
  saveRecipes(recipes);
  displayRecipes(recipes);
  e.target.reset();
});

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearch = debounce(e => {
  const query = e.target.value.toLowerCase();
  const filtered = getRecipes().filter(recipe =>
    recipe.title.toLowerCase().includes(query)
  );
  displayRecipes(filtered);
}, 200);

document.getElementById("searchInput").addEventListener("input", handleSearch);

// Fetch and display a random recipe from TheMealDB API
function fetchAndDisplayRandomRecipe() {
  fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    .then(response => response.json())
    .then(data => {
      const meal = data.meals[0];
      const randomRecipeDiv = document.getElementById('randomRecipe');
      randomRecipeDiv.innerHTML = `
        <div class="recipe-card" style="margin-bottom:24px;">
          <h2>Random Recipe: ${meal.strMeal}</h2>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%;max-width:320px;border-radius:8px;margin-bottom:10px;">
          <strong>Category:</strong> ${meal.strCategory}<br>
          <strong>Area:</strong> ${meal.strArea}<br>
          <strong>Instructions:</strong>
          <p>${meal.strInstructions.substring(0, 200)}...</p>
          <a href="${meal.strSource || meal.strYoutube}" target="_blank">View Full Recipe</a>
        </div>
      `;
    })
    .catch(() => {
      document.getElementById('randomRecipe').innerHTML = "<p>Could not load a random recipe.</p>";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  displayRecipes(getRecipes());
  fetchAndDisplayRandomRecipe();
});

