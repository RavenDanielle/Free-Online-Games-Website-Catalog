const gamesData = []; // Assume this array contains the game data fetched from the API

const pageSize = 50;
let currentPage = 1;
let showGenre = 'all'; // Default to 'all' genres

const games = document.querySelector('#games');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const pagination = document.querySelector('.pagination');
const dropdown = document.querySelector('.dropdown-content');
const dropdownItems = dropdown.querySelectorAll('li a');
const dropdownToggle = document.querySelector('.dropdown-btn');

// Function to fetch games data
const fetchGamesData = async (genre) => {
  const categoryUrl = genre === 'all'
    ? 'https://free-to-play-games-database.p.rapidapi.com/api/games'
    : `https://free-to-play-games-database.p.rapidapi.com/api/games?category=${genre}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '0b39e430a2msh13ace4d09d2be05p1f398fjsnffb8c2a42bb5',
      'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(categoryUrl, options);
    const result = await response.json();
    return result;
  } catch (error) {
    // Create a new paragraph element to display the error message
    const errorElement = document.createElement('p');
    errorElement.textContent = `An error occurred: ${error.message}`;
    errorElement.style.color = 'red';

    // Append the error message to the body of the document
    document.body.appendChild(errorElement);

    return []; // Return an empty array on error
  }
};


// Displays Games
const displayGameData = function (data, start, page) {
  const html = `
    <li class="card modalCard" data-game-index="${start}">
      <img class="card-image" src="${data.thumbnail}"/>
      <h2 class="card-title">${data.title? data.title.split(' ').slice(0, 2).join(' ') + (data.title.split(' ').length > 2? '...' : '') : ''}</h2>
      <p class="card-genre">Genre: ${data.genre}.</p>
      <p class="card-platform">Platform: ${data.platform}</p>
      <p class="card-description">${data.description? data.description.split(' ').slice(0, 6).join(' ') + (data.description.split(' ').length > 6? '...' : '') : ''}</p>
    </li>
  `;

  games.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalGenre = document.getElementById('modal-genre');
  const modalPlatform = document.getElementById('modal-platform');
  const modalDescription = document.getElementById('modal-description');
  const modalImage = document.getElementById('modal-image');
  const modalDeveloper = document.getElementById('modal-developer');
  const modalPublisher = document.getElementById('modal-publisher');
  const modalReleaseDate = document.getElementById('modal-release_date');

  const card = games.querySelector(`[data-game-index="${start}"]`);
  card.addEventListener('click', () => {
    const gameIndex = event.target.closest('.card').dataset.gameIndex;
    const gameData = gamesData[gameIndex];

    modalImage.src = gameData.thumbnail;
    modalTitle.textContent = gameData.title;
    modalGenre.textContent = `Genre: ${gameData.genre}`;
    modalPlatform.textContent = `Platform: ${gameData.platform}`;
    modalDescription.textContent = `Description: ${gameData.description}`;
    modalDeveloper.textContent = `Developer: ${gameData.developer}`;
    modalPublisher.textContent = `Publisher: ${gameData.publisher}`;
    modalReleaseDate.textContent = `Release Date: ${gameData.releaseDate}`;

    const gameURLButton = document.querySelector('.modal-game_URL');

    gameURLButton.addEventListener('click', () => {
      const gameURL = gameData.gameURL;
      window.location.href = gameURL;
    });

    modal.style.display = 'block';
  });

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      modal.style.display = 'none';
    }
  });
};

const paginateGames = function (data) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const pageData = data.slice(startIndex, endIndex);
  games.innerHTML = '';
  pageData.forEach((game, index) => displayGameData(game, startIndex + index, currentPage));

  // Create the pagination links
  const numPages = Math.ceil(data.length / pageSize);
  pagination.innerHTML = '';
  for (let i = 1; i <= numPages; i++) {
    const link = document.createElement('a');
    link.textContent = i;
    link.href = '#';
    if (i === currentPage) {
      link.classList.add('active');
    }
    link.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      paginateGames(gamesData);
    });
    pagination.appendChild(link);
  }

  const paginationLinks = document.querySelectorAll('.pagination a');

  paginationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
  // Update the previous and next buttons
  if (currentPage === 1) {
    prevButton.classList.add('disabled');
  } else {
    prevButton.classList.remove('disabled');
  }
  if (currentPage === numPages) {
    nextButton.classList.add('disabled');
  } else {
    nextButton.classList.remove('disabled');
  }
};

prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    paginateGames(gamesData);
  }
});

nextButton.addEventListener('click', () => {
  if (currentPage < Math.ceil(gamesData.length / pageSize)) {
    currentPage++;
    paginateGames(gamesData);
  }
});

// Initial fetch of all games data
(async () => {
  const initialData = await fetchGamesData(showGenre);
  gamesData.push(...initialData.map(game => ({
    title: game.title,
    genre: game.genre,
    description: game.short_description,
    thumbnail: game.thumbnail,
    developer: game.developer,
    gameURL: game.game_url,
    platform: game.platform,
    publisher: game.publisher,
    releaseDate: game.release_date,
  })));
  paginateGames(gamesData);
})();

// Function to update games based on selected genre
const updateGamesByGenre = async (genre) => {
  gamesData.length = 0; // Clear the current games data
  const newGamesData = await fetchGamesData(genre);
  gamesData.push(...newGamesData.map(game => ({
    title: game.title,
    genre: game.genre,
    description: game.short_description,
    thumbnail: game.thumbnail,
    developer: game.developer,
    gameURL: game.game_url,
    platform: game.platform,
    publisher: game.publisher,
    releaseDate: game.release_date,
  })));
  currentPage = 1; // Reset to first page
  paginateGames(gamesData);
};

// Event listener for the dropdown menu
dropdown.addEventListener('click', async (event) => {
  if (event.target.tagName === 'A') {
    const selectedGenre = event.target.textContent;
    showGenre = selectedGenre !== 'All' ? selectedGenre : 'all'; // 'All' to show all genres

    await updateGamesByGenre(showGenre);

    // Update the dropdown toggle text and add the format '▾'
    dropdownToggle.innerHTML = `${selectedGenre} ▾`;

    // Close the dropdown menu
    dropdownToggle.classList.remove('show');
    dropdownItems.forEach(item => item.classList.remove('active'));

    // Keep the background color of the selected genre active
    event.target.classList.add('active');

    // Add this line to close the dropdown when a genre is clicked
    dropdown.style.display = 'none';
  }
});


  // Toggle dropdown visibility
  dropdownToggle.addEventListener('click', () => {
  dropdown.classList.toggle('show');
});

  // Close dropdown if clicked outside of it
  window.addEventListener('click', (event) => {
      if (!event.target.matches('#dropdownToggle')) {
          dropdown.classList.remove('show');
  }
});

// Get the search input and button elements
let search_input = document.querySelector('.input-box input');
let search_button = document.querySelector('.input-box button');

// Define a function to filter the games based on the search query
function filter_games(search_query) {
    // Convert the search query to lowercase for case-insensitive search
    search_query = search_query.toLowerCase();

    // Filter the games data based on the search query
    let filtered_games = gamesData.filter(game => game['title'].toLowerCase().includes(search_query));

    // If no games are found, print a message and return
    if (!filtered_games.length) {
        games.innerHTML = `<p class="not-found">"${search_query}" Not found</p>`;
        return;
    }

    // Clear the current games data
    games.innerHTML = '';

    // Display the filtered games
    filtered_games.forEach((game, index) => displayGameData(game, index, currentPage));

    // Reset to the first page and display the filtered games
    currentPage = 1;
    paginateGames(filtered_games);
}

// Add an event listener to the search button
search_button.addEventListener('click', () => {
    // Get the search query from the search input
    let search_query = search_input.value;

    // Filter the games based on the search query
    filter_games(search_query);
});



// Get all the footer links
const footerLinks = document.querySelectorAll('.footer .nav__ul--extra li a');

// Add event listener to each link
footerLinks.forEach(link => {
  link.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default action
    const selectedGenre = event.target.textContent;
    showGenre = selectedGenre !== 'All' ? selectedGenre : 'all'; // 'All' to show all genres

    // Update the dropdown toggle text and add the format '▾'
    dropdownToggle.innerHTML = `${selectedGenre} ▾`;

    await updateGamesByGenre(showGenre);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});