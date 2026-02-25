const form = document.querySelector("form");
const resultSection = document.querySelector(".result-section");
const searchStatusEl = document.getElementById("search-status");
let watchlist = [];

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const searchInput = formData.get("searchMovie");

    fetch(`https://www.omdbapi.com/?apikey=381dbb2&s=${searchInput}`)
      .then((res) => res.json())
      .then((data) => {
        const searchResults = data.Search;

        if (data.Response === "True") {
          searchStatusEl.textContent = `Found ${data.Search.length} movie.`;
          resultSection.innerHTML = "";
          resultSection.classList.add("results-appeared");

          searchResults.forEach((result) => {
            fetch(`https://www.omdbapi.com/?apikey=381dbb2&i=${result.imdbID}`)
              .then((res) => res.json())
              .then((movie) => {
                resultSection.innerHTML += `
                  <div class="movie-card">
                    <div class="movie-poster"> 
                      <img
                        src="${movie.Poster}"
                        alt="${movie.Title}(${movie.Year}) Poster"
                      />
                    </div>
                    <div class="movie-content">
                      <div class="movie-header">
                        <h2>${movie.Title}</h2>
                        <div class="rating-box">
                          <img src="images/star-rating-icon.svg" alt="Star rating icon" />
                          <span class="rating">${movie.Ratings?.[0]?.Value ?? "No Rating"}</span>
                        </div>
                      </div>
                      <div class="movie-features">
                        <span>${movie.Runtime}</span>
                        <span>${movie.Genre}</span>
                        ${addedToWatchlistOrNot(movie.imdbID)}
                      </div>
                      <p class="movie-description">
                        ${
                          movie.Plot.length > 131
                            ? `${movie.Plot.substring(0, 131)}... 
                            <button data-id='${movie.imdbID}' 
                              class='read-more-btn' type='button'>Read more
                            </button>`
                            : movie.Plot
                        }
                      </p>
                    </div>
                  </div>
                `;
              });
          });
        } else {
          searchStatusEl.textContent =
            "No movies found. Please try another search.";
          resultSection.innerHTML = `
            <span class="status-msg status-msg-error">
              Unable to find what you're looking for. Please try another search.
            </span>`;
          resultSection.classList.remove("results-appeared");
        }
      });
  });
}

function addedToWatchlistOrNot(movieId) {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) ?? [];

  const ifIncluded = watchlist.filter((movie) => movie.id === movieId);

  if (ifIncluded.length > 0) {
    return `
      <div class="watchlist-status"> 
        <img src="images/eye-icon.svg" alt="">
        Exists in watchlist
      </div>
    `;
  } else {
    return `
      <button type="button" class="action-btn add-btn" data-id="${movieId}">
        <img src="images/add-to-watchlist-icon.svg" alt=""/>
        Watchlist
      </button>
    `;
  }
}

resultSection.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-btn")) {
    const movieID = e.target.dataset.id;

    fetch(`https://www.omdbapi.com/?apikey=381dbb2&i=${movieID}`)
      .then((res) => res.json())
      .then((data) => {
        const id = data.imdbID;
        const Title = data.Title;
        const Poster = data.Poster;
        const Year = data.Year;
        const Rating = data.Ratings[0].Value;
        const Runtime = data.Runtime;
        const Genre = data.Genre;
        const Plot = data.Plot;

        watchlist.push({
          id,
          Title,
          Poster,
          Year,
          Rating,
          Runtime,
          Genre,
          Plot,
        });

        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        e.target.innerHTML = `
          <img src="images/add-to-watchlist-icon.svg" alt=""/> Added!
        `;
        e.target.classList.add("no-pointer-events");
      });
  }

  if (e.target.classList.contains("remove-btn")) {
    const deleteMovieId = e.target.dataset.id;
    watchlist = watchlist.filter((movie) => {
      return movie.id !== deleteMovieId;
    });

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    displayResult();
  }

  if (e.target.classList.contains("read-more-btn")) {
    const movieID = e.target.dataset.id;
    fetch(`https://www.omdbapi.com/?apikey=381dbb2&i=${movieID}`)
      .then((res) => res.json())
      .then((movie) => {
        e.target.parentElement.textContent = movie.Plot;
      });
  }
});

document.addEventListener("DOMContentLoaded", (e) => {
  if (window.location.pathname.includes("watchlist.html")) {
    if (localStorage.getItem("watchlist") !== null) {
      watchlist = JSON.parse(localStorage.getItem("watchlist"));
      displayResult();
      resultSection.classList.add("watchlist-results");
    }
  }
});

function displayResult() {
  resultSection.innerHTML = "";

  if (watchlist.length > 0) {
    watchlist.forEach((movie) => {
      resultSection.innerHTML += `
      <div class="movie-card card-watchlist">
        <div class="movie-poster"> 
          <img
            src="${movie.Poster}}"
            alt="${movie.Title}(${movie.Year}) Poster"
          />
        </div>
        <div class="movie-content">
          <div class="movie-header">
            <h2>${movie.Title}</h2>
            <div class="rating-box">
              <img src="images/star-rating-icon.svg" alt="Star rating icon" />
              <span class="rating">${movie.Rating}</span>
            </div>
          </div>
          <div class="movie-features">
            <span>${movie.Runtime}</span>
            <span>${movie.Genre}</span>
            <button type="button" class="action-btn remove-btn" data-id="${movie.id}">
              <img src="images/delete-icon.svg" alt=""/>
              Remove
            </button>
          </div>
          <p class="movie-description">
            ${
              movie.Plot.length > 131
                ? `${movie.Plot.substring(0, 131)}... 
                <button data-id='${movie.id}' class='read-more-btn' type='button'>Read more</button>`
                : movie.Plot
            }
          </p>
        </div>
      </div>
    `;
    });
  } else {
    resultSection.innerHTML = `
      <span class="status-msg">
        Your watchlist is looking a little empty...</span>
      <a href="./" class="search-link">
        <img src="images/add-to-watchlist-icon.svg" alt="" />
        Let's add some movies!
      </a>
    `;
  }
}
