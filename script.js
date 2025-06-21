// Default recipes shown on first load
const defaultRecipes = [
  {
    title: "Pasta",
    ingredients: "Noodles, Tomato Sauce, Cheese",
    instructions: "Boil pasta. Add sauce. Mix well. Top with cheese.",
    imageUrl: "https://static.vecteezy.com/system/resources/previews/027/144/753/non_2x/penne-pasta-with-tomato-sauce-parmesan-cheese-and-basil-on-transparent-background-png.png"
  },
  {
    title: "Grilled Cheese",
    ingredients: "Bread, Butter, Cheese",
    instructions: "Butter bread. Add cheese. Grill until golden brown.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT5mwhTKGnE-a1Qd2SVPtj9X4am9zLoTMaZQ&s"
  }
];

// Get recipes from localStorage or initialize with defaults
function getRecipes() {
  const saved = localStorage.getItem("recipes");
  if (saved) {
    return JSON.parse(saved);
  } else {
    saveRecipes(defaultRecipes);
    return [...defaultRecipes];
  }
}

// Save recipes to localStorage
function saveRecipes(recipes) {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

// Create a recipe card element
function createRecipeCard(recipe, index) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
    <h3>${recipe.title}</h3>
    <img src="${recipe.imageUrl || 'https://via.placeholder.com/320x180?text=No+Image'}" alt="${recipe.title}" style="width:100%;max-width:320px;border-radius:8px;margin-bottom:10px;">
    <strong>Ingredients:</strong><p>${recipe.ingredients}</p>
    <strong>Instructions:</strong><p>${recipe.instructions}</p>
    <button class="delete-btn" data-index="${index}">Delete</button>
  `;
  return card;
}

// Display all recipes in the list
function displayRecipes(recipes) {
  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML = "";
  recipes.forEach((recipe, idx) => {
    recipeList.appendChild(createRecipeCard(recipe, idx));
  });
}

// Show recipe details in a modal
function showRecipeModal(recipe) {
  let modal = document.getElementById("modalOverlay");
  let content = document.getElementById("modalContent");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modalOverlay";
    modal.style = "display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:1000;";
    content = document.createElement("div");
    content.id = "modalContent";
    content.style = "background:#fff;padding:24px;border-radius:10px;max-width:400px;width:90vw;";
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  content.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.imageUrl || 'https://via.placeholder.com/320x180?text=No+Image'}" style="width:100%;max-width:320px;border-radius:8px;margin-bottom:10px;">
    <strong>Ingredients:</strong><p>${recipe.ingredients}</p>
    <strong>Instructions:</strong><p>${recipe.instructions}</p>
    <button id="closeModal">Close</button>
  `;
  modal.style.display = "flex";
  document.getElementById("closeModal").onclick = () => modal.style.display = "none";
}

// Handle delete and modal open on card click
document.getElementById("recipeList").addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-btn")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    const recipes = getRecipes();
    recipes.splice(index, 1);
    saveRecipes(recipes);
    displayRecipes(recipes);
  } else if (e.target.closest(".recipe-card")) {
    const idx = Array.from(document.querySelectorAll('.recipe-card')).indexOf(e.target.closest('.recipe-card'));
    const recipes = getRecipes();
    showRecipeModal(recipes[idx]);
  }
});

// Show validation message above the form
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

// Clear validation message
function clearValidation() {
  const validation = document.getElementById("validationMsg");
  if (validation) validation.textContent = "";
}

// Handle recipe form submission
document.getElementById("recipeForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const instructions = document.getElementById("instructions").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();

  if (!title || !ingredients || !instructions) {
    showValidation("All fields are required.");
    return;
  }
  clearValidation();

  const newRecipe = { title, ingredients, instructions, imageUrl };
  const recipes = getRecipes();
  recipes.push(newRecipe);
  saveRecipes(recipes);
  displayRecipes(recipes);
  e.target.reset();
});

// Debounce utility for search
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Handle search input
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

// Initialize app on page load
document.addEventListener("DOMContentLoaded", () => {
  displayRecipes(getRecipes());
  fetchAndDisplayRandomRecipe();
});

