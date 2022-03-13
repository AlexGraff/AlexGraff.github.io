const titleInput = document.getElementById('title-input');
const searchButton = document.getElementById('search-button');
const statusOutput = document.getElementById('status-output');
const searchResultsContainer = document.getElementById('search-results-container');

let title;
let type;
let pageNumber = 1;

async function getmovieInfo(url) {
    const response = await fetch(url, {
        headers: {
            'X-API-KEY': 'fc38be4e-921f-4af0-8179-561fd1af5e4a'
        }
    });
    return await response.json();
}



 async function handleApiRequest() {

    if (!titleInput.value) {
        statusOutput.innerText = `Пустой запрос\nВведите название`
        return;
    }

    if (titleInput.value == title) {
        statusOutput.innerText = `Результат по данному запросу уже получен`
        return;
    }

    const regexp = /^[a-zа-я0-9][a-zа-я0-9 ,#:;.!?&\-]+$/i;

    if (!regexp.test(titleInput.value)) {
        statusOutput.innerText = `Ошибка в запросе\nДопустимые значения: буквы, цифры и символы ,#:;.!?&`
        return;
    }

    title = titleInput.value;
    titleInput.value = '';

    statusOutput.innerText = `Поиск по "${title}"`
    
    const movieCards = searchResultsContainer.querySelectorAll('.movie-card');
    for (const movieCard of movieCards) {
        movieCard.remove();
    }

    pageNumber = 1;
    const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films?order=RATING&type=ALL&&keyword=${title}&page=${pageNumber}`;

    const response = await getmovieInfo(url);

    const searchResults = response.items;
    console.log('searchResults :>> ', searchResults);

    processSearchResults(searchResults);


}

searchButton.addEventListener('click', handleApiRequest);
titleInput.addEventListener('keypress', (event) => event.key == 'Enter' ? handleApiRequest() : '' );

document.addEventListener('scroll', async function() {
    const availScrollHeight = document.documentElement.scrollHeight
        - document.documentElement.clientHeight;
    const currentScroll = Math.ceil(window.pageYOffset);

    if (currentScroll >= availScrollHeight) {
            pageNumber++;

            const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films?order=RATING&type=ALL&&keyword=${title}&page=${pageNumber}`;
            const response = await getmovieInfo(url);

            const searchResults = response.items;
            processSearchResults(searchResults);
        
    }

});

function processSearchResults(searchResults) {
    
    
    for (const movieInfo of searchResults) {
        
        const { posterUrlPreview, nameOriginal, nameRu, year, kinopoiskId } = movieInfo;

        const movieCard = 
            `<div class="movie-card" data-kinopoisk-id="${kinopoiskId}">
                <div class="poster">
                    <img src="${posterUrlPreview}" alt="Poster of ${nameOriginal}">
                </div>
                <div class="info">
                    <h6 class="title">${ nameOriginal ? nameOriginal : nameRu }</h6>
                    <p class="year">${year}</p>
                </div>
            </div>`;

        searchResultsContainer.insertAdjacentHTML('beforeend', movieCard);
        
    }
}

searchResultsContainer.addEventListener('click', async function(event) {

    const movieCard = event.target.closest('.movie-card');

    if (movieCard) {
        const kinopoiskId = movieCard.dataset.kinopoiskId;
        const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kinopoiskId}`;

        const movieFullInfo = await getmovieInfo(url);
        console.log('movieFullInfo :>> ', movieFullInfo);

        const { posterUrl, nameOriginal, nameRu, ratingKinopoisk, ratingImdb, year, genres, shortDescription  } = movieFullInfo;

        const movieFullCard =
            `<div id="fixed-container">
                <div class="movie-full-card">
                    <div class="poster">
                        <img src="${posterUrl}" alt="Poster of ${nameOriginal}">
                    </div>
                    <div class="info">
                        <h4 class="title">${ nameOriginal ? nameOriginal : nameRu }</h4>
                        <p class="content">Рейтинг на kinopoisk: ${ratingKinopoisk}</p>
                        <p class="content">Рейтинг на IMDB: ${ratingImdb}</p>
                        <p class="content">Жанры: ${genres.map(item => item.genre).join(', ')}</p>
                        <p class="content">Год: ${year}</p>
                        <p class="content">Сюжет:</p>
                        <p class="content"> ${shortDescription ? shortDescription : 'Не доступен'}</p>
                    </div>
                    <button>&times;</button>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', movieFullCard);

        document.querySelector('.movie-full-card button')
            .addEventListener('click', function() {
                document.querySelector('.movie-full-card').remove();
            }, { once: true });
    }
});