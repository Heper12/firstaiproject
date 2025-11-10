let recipes = [];

fetch('data/recipes.json')
  .then(res => res.json())
  .then(data => {
    recipes = data;
    console.log('Рецепты загружены:', recipes.length);
  })
  .catch(err => console.error('Ошибка загрузки рецептов', err));

// Обновление даты и времени
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  };
  document.getElementById('current-datetime').textContent =
    now.toLocaleDateString('ru-RU', options);
}
updateDateTime();
setInterval(updateDateTime, 60000);

// База рецептов
const mockRecipes = [
  {
    id: 1,
    name: "Яичница-глазунья",
    cuisine: "домашняя",
    difficulty: "просто",
    time: "5 мин",
    ingredients: ["яйца", "масло", "соль"],
    steps: [
      "Разогрей сковороду на среднем огне",
      "Добавь немного масла",
      "Аккуратно разбей яйца",
      "Посоли и жарь 2–3 минуты"
    ]
  },
  {
    id: 2,
    name: "Паста с сыром",
    cuisine: "итальянская",
    difficulty: "просто",
    time: "10 мин",
    ingredients: ["макароны", "сыр", "молоко", "масло"],
    steps: [
      "Свари макароны",
      "На сковороде растопи масло, добавь молоко и сыр",
      "Смешай с макаронами — готово!"
    ]
  }
];

// Поиск рецептов
document.getElementById('search-btn').addEventListener('click', () => {
  const input = document.getElementById('ingredients-input').value.trim().toLowerCase();
  if (!input) return;

  const userIngredients = input.split(',').map(i => i.trim());

  // Ищем первый подходящий рецепт
  const selectedCuisines = getSelectedCuisines();
  const availableCuisines = selectedCuisines.length > 0 ? selectedCuisines : recipes.map(r => r.cuisine);

  const recipe = recipes.find(r =>
    r.ingredients.every(ing => userIngredients.includes(ing)) &&
    availableCuisines.includes(r.cuisine)
  );

  const recipesArea = document.getElementById('recipes-area');
  const welcomeScreen = document.getElementById('welcome-screen');

  if (recipe) {
    // Удаляем приветствие
    welcomeScreen.style.display = 'none';

    // Создаём карточку рецепта
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.innerHTML = `
      <div class="recipe-header">
        <h2>${recipe.name}</h2>
        <div class="recipe-meta">
          <span class="badge difficulty">${recipe.difficulty}</span>
          <span class="badge speed">${recipe.time}</span>
          <span class="cuisine">${recipe.cuisine}</span>
        </div>
      </div>
      <div class="recipe-image">
        <div class="placeholder-image">📸 Фото блюда</div>
      </div>
      <div class="recipe-body">
        <h3>Ингредиенты</h3>
        <ul>
          ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <h3>Как готовить</h3>
        <ol>
          ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>
    `;

    // Очищаем область и добавляем новую карточку
    recipesArea.innerHTML = '';
    recipesArea.appendChild(recipeCard);

  } else {
    // Если не нашли — показываем сообщение
    recipesArea.innerHTML = `
      <div class="no-results">
        <p>Не нашли рецепт по вашим ингредиентам 😔</p>
        <p>Попробуйте добавить больше продуктов или изменить запрос.</p>
      </div>
    `;
  }
});

document.getElementById('fridge-photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/recognize.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.error) {
      alert('Ошибка ИИ: ' + result.error);
      return;
    }

    // Автоматически подставляем распознанные ингредиенты
    document.getElementById('ingredients-input').value = result.ingredients;
    alert('ИИ распознал: ' + result.ingredients);
  } catch (err) {
    alert('Не удалось связаться с ИИ 😕');
    console.error(err);
  }
});
function getSelectedCuisines() {
  const checkboxes = document.querySelectorAll('.menu input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.dataset.cuisine);
}
function showRecipeDetail(recipe) {
  const recipesArea = document.getElementById('recipes-area');
  recipesArea.innerHTML = `
        <div class="recipe-detail" style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <button id="back-btn" style="margin-bottom: 20px;">← Назад</button>
            <h1>${recipe.name}</h1>
            <img src="images/${recipe.id}.jpg" onerror="this.src='img/placeholder.jpg'" style="width:100%; border-radius:12px; margin:16px 0;">
            <p><strong>Кухня:</strong> ${recipe.cuisine}</p>
            <p><strong>Сложность:</strong> ${recipe.difficulty} | <strong>Время:</strong> ${recipe.time}</p>
            <h3>Ингредиенты</h3>
            <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
            <h3>Инструкция</h3>
            <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
    `;

  document.getElementById('back-btn').addEventListener('click', () => {
    showRecipesList(); 
  });
}