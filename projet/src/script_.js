// =====================================================
// Traitement de best movie
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. récupérer le meilleur film
  const API_BASE = 'http://localhost:8000/api/v1/titles/';

  // on demande les films triés par score IMDB décroissant
  fetch(`${API_BASE}?sort_by=-imdb_score`)
    .then(response => response.json())
    .then(data => {
      // le meilleur film est le premier élément de results
      const bestMovie = data.results && data.results.length > 0 ? data.results[0] : null;
      if (!bestMovie) return;

      // on remplit la partie visible (section du haut)
      displayBestMovieHeader(bestMovie);

      // 2. on va chercher les détails complets du film
      // l’API renvoie normalement une propriété "url", sinon on reconstruit avec l’id
      const detailUrl = bestMovie.url ? bestMovie.url : `${API_BASE}${bestMovie.id}/`;

      return fetch(detailUrl);
    })
    .then(response => {
      if (!response) return;
      return response.json();
    })
    .then(fullMovie => {
      if (!fullMovie) return;
      // remplir le modal
      fillBestMovieModal(fullMovie);

      // on stocke le film pour ouvrir le modal ensuite (optionnel)
      window.__bestMovie = fullMovie;
    })
    .catch(err => {
      console.error('Erreur lors de la récupération du meilleur film :', err);
    });
});

function displayBestMovieHeader(movie) {
  // éléments de la section
  const imgEl = document.getElementById('best-movie-img');
  const titleEl = document.getElementById('best-movie-title');
  const descEl = document.getElementById('best-movie-desc');

  if (imgEl && movie.image_url) {
    imgEl.src = movie.image_url;
    imgEl.alt = movie.title;
  }
  if (titleEl) titleEl.textContent = movie.title;
  // l’endpoint liste ne renvoie pas toujours le résumé complet → on met un fallback
  if (descEl) descEl.textContent = movie.description || 'Cliquez sur “Détails” pour plus d’informations.';
}

function fillBestMovieModal(movie) {
  // ici on utilise les champs typiques de l’API OCMovies
  // vérifie les noms exacts si tu as lancé le serveur, ils peuvent être en snake_case
  const yearEl = document.getElementById('movie-year');
  const genresEl = document.getElementById('movie-genres');
  const ratedEl = document.getElementById('movie-rated');
  const durationEl = document.getElementById('movie-duration');
  const countriesEl = document.getElementById('movie-countries');
  const imgEl = document.getElementById('movie-image');
  const imdbEl = document.getElementById('movie-imdb');
  const boxOfficeEl = document.getElementById('movie-box-office');
  const directorEl = document.getElementById('movie-director');
  const summaryEl = document.getElementById('movie-summary');
  const actorsEl = document.getElementById('movie-actors');

  if (yearEl) yearEl.textContent = `Date de sortie : ${movie.date_published || movie.year || 'Non renseigné'}`;
  if (genresEl) genresEl.textContent = `Genres : ${(movie.genres || []).join(', ')}`;
  if (ratedEl) ratedEl.textContent = `Classification : ${movie.rated || 'Non renseignée'}`;
  if (durationEl) durationEl.textContent = `Durée : ${movie.duration ? movie.duration + ' min' : 'Non renseignée'}`;
  if (countriesEl) countriesEl.textContent = `Pays : ${(movie.countries || []).join(', ')}`;
  if (imgEl && movie.image_url) {
    imgEl.src = movie.image_url;
    imgEl.alt = movie.title;
  }
  if (imdbEl) imdbEl.textContent = `Score IMDB : ${movie.imdb_score ?? 'N/A'}`;
  if (boxOfficeEl) boxOfficeEl.textContent = `Box office : ${movie.worldwide_gross_income || movie.usa_gross_income || 'Non renseigné'}`;
  if (directorEl) directorEl.textContent = `Réalisateur : ${(movie.directors || []).join(', ')}`;
  if (summaryEl) summaryEl.textContent = movie.long_description || movie.description || 'Aucun résumé disponible.';
  if (actorsEl) actorsEl.textContent = `Acteurs : ${(movie.actors || []).join(', ')}`;
}

// =====================================================
// CONFIG GÉNÉRALE
// =====================================================
const API_BASE = 'http://localhost:8000/api/v1/titles/';

// fonction générique pour aller chercher N meilleurs films d'un genre
async function fetchBestByGenre(genreName, limit = 6) {
  let results = [];
  let url = `${API_BASE}?genre=${encodeURIComponent(genreName)}&sort_by=-imdb_score&page=1`;

  while (results.length < limit && url) {
    const resp = await fetch(url);
    const data = await resp.json();
    results = results.concat(data.results);
    // l'API fournit normalement data.next pour la page suivante
    url = data.next;
  }

  // on ne garde que le nombre demandé
  return results.slice(0, limit);
}

// =====================================================
// remplit une section (ex: #s_film_sci_fi) avec des films
// =====================================================
function renderMoviesInSection(sectionId, movies) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // dans ton HTML, les cartes sont dans .conteneur
  const container = section.querySelector('.conteneur');
  if (!container) return;

  // on vide ce qu'il y avait (les fausses cartes)
  container.innerHTML = '';

  movies.forEach((movie, index) => {
    const box = document.createElement('div');
    box.classList.add('box');

    // 👇 IMPORTANT : on recrée tes classes pour que le CSS + boutons marchent
    // 0,1 → visibles
    // 2,3 → .box_2
    // 4,5 → .box_3
    if (index >= 2 && index < 4) {
      box.classList.add('box_2');
    } else if (index >= 4) {
      box.classList.add('box_3');
    }

    // image
    const img = document.createElement('img');
    img.src = movie.image_url || 'https://via.placeholder.com/400x550?text=No+Image';
    img.alt = movie.title;

    // overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const h3 = document.createElement('h3');
    h3.classList.add('titre-film');
    h3.textContent = movie.title;

    // bouton détails
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = 'Détails';
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#exampleModal');

    // quand on clique → on charge les détails précis de CE film dans le modal
    button.addEventListener('click', async () => {
      const detailUrl = movie.url ? movie.url : `${API_BASE}${movie.id}/`;
      const resp = await fetch(detailUrl);
      const fullMovie = await resp.json();
      fillBestMovieModal(fullMovie);   // on réutilise la fonction qu’on a écrite pour le meilleur film
      // on change aussi le titre du modal si tu veux
      const modalTitle = document.getElementById('exampleModalLabel');
      if (modalTitle) modalTitle.textContent = fullMovie.title;
    });

    overlay.appendChild(h3);
    overlay.appendChild(button);

    box.appendChild(img);
    box.appendChild(overlay);

    container.appendChild(box);
  });
}

// =====================================================
// CHARGEMENT DES CATÉGORIES
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. SCI-FI (si ton API utilise "Sci-Fi")
    const sciFiMovies = await fetchBestByGenre('Sci-Fi', 6);
    renderMoviesInSection('s_film_sci_fi', sciFiMovies);

    // 2. Fantasy
    const fantasyMovies = await fetchBestByGenre('Fantasy', 6);
    renderMoviesInSection('s_film_fantasy', fantasyMovies);
  } catch (err) {
    console.error('Erreur lors du chargement des catégories :', err);
  }
});


// =====================================================
// gestion des affichages de bouton plus/moins
// =====================================================
movies.forEach((movie, index) => {
  const box = document.createElement('div');
  box.classList.add('box');

  // pour que ton CSS les cache comme avant :
  if (index >= 2 && index < 4) {
    box.classList.add('box_2');
  } else if (index >= 4) {
    box.classList.add('box_2 box_3');
  }
});

// =====================================================
// Bouton afficher plus/moins pour les smartphone
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // On récupère le bouton btn-plus1 
    const btn = document.getElementById('btn-plus1');
    // On sélection tout les élément .box_2 et .box_3
    // permet de stocke ces éléménts dans une NodeList
    // permet d'étre parcouru par .forEach
    const hiddenBoxes = document.querySelectorAll('.box_2, .box_3');
    // Varibale d'état pour connaitre l'état : 
    // Au départ, c’est false, donc les éléments cachés restent cachés
    let expanded = false;

    // On vérifie que le bouton existe bien dans la page avant d’ajouter un écouteur d’événement.
    if (btn) {
        // On ajoute un écouteur d’événement (“event listener”) sur le bouton.
        // a chaque click on éxécute après la fléche
        btn.addEventListener('click', () => {
            expanded = !expanded;
            hiddenBoxes.forEach(box => {
                box.style.display = expanded ? 'block' : 'none';
            });
            btn.textContent = expanded ? 'Afficher moins' : 'Afficher plus';
        });
    }
});

// =====================================================
// Bouton affichage plus/moins pour les tablette
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-plus2');
    const hiddenBoxes = document.querySelectorAll('.box_3');
    let expanded = false;

    if (btn) {
        btn.addEventListener('click', () => {
            expanded = !expanded;
            hiddenBoxes.forEach(box => {
                box.style.display = expanded ? 'block' : 'none';
            });
            btn.textContent = expanded ? 'Afficher moins' : 'Afficher plus';
        });
    }
});

// =====================================================
// Gestion du menu déroulant
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.dropdown-item');

  items.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const genre = item.dataset.genre;
      const btn = document.getElementById('dropdownGenre');
      btn.textContent = 'Genre : ' + item.textContent; // change le texte du bouton
      console.log('Genre sélectionné :', genre);
      // 👉 ici tu peux ensuite appeler ta fonction pour filtrer les films
    });
  });
});
