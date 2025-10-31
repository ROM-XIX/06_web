// =====================================================
// CONFIG
// =====================================================
const API_BASE = 'http://localhost:8000/api/v1/titles/';
const API_GENRES = 'http://localhost:8000/api/v1/genres/';


// =====================================================
// 1. Afficher le "meilleur film" (gros bloc du haut)
// =====================================================
function displayBestMovieHeader(movie) {
  const imgEl = document.getElementById('best-movie-img');
  const titleEl = document.getElementById('best-movie-title');
  const descEl = document.getElementById('best-movie-desc');

  if (imgEl) {
    // affiche l'image principale
    imgEl.src = movie.image_url;
    imgEl.alt = movie.title;

    // si l'image échoue à charger → image de secours
    imgEl.onerror = function () {
      this.onerror = null; // évite une boucle infinie si la 2e image échoue aussi
      this.src = '../images/erreur_404.webp';
    };
  }

  if (titleEl) titleEl.textContent = movie.title;
  if (descEl) descEl.textContent = movie.long_description || movie.description || 'Aucune description disponible.';
}


// =====================================================
// 2. Remplir le modal (réutilisé par TOUTES les sections)
// =====================================================
function fillBestMovieModal(movie) {
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
  if (imgEl) {
    // affiche l'image principale
    imgEl.src = movie.image_url;
    imgEl.alt = movie.title;

    // si l'image échoue à charger → image de secours
    imgEl.onerror = function () {
      this.onerror = null; // évite une boucle infinie si la 2e image échoue aussi
      this.src = '../images/erreur_404.webp';
    };
  }
  if (imdbEl) imdbEl.textContent = `Score IMDB : ${movie.imdb_score ?? 'N/A'}`;
  if (boxOfficeEl) boxOfficeEl.textContent = `Box office : ${movie.worldwide_gross_income || movie.usa_gross_income || 'Non renseigné'}`;
  if (directorEl) directorEl.textContent = `Réalisateur : ${(movie.directors || []).join(', ')}`;
  if (summaryEl) summaryEl.textContent = movie.long_description || movie.description || 'Aucun résumé disponible.';
  if (actorsEl) actorsEl.textContent = `Acteurs : ${(movie.actors || []).join(', ')}`;
}


// =====================================================
// 3. Générer une liste de films dans une section
//    (utilisé pour : meilleurs films, sci-fi, fantasy, dynamique)
// =====================================================
function renderMoviesInSection(sectionId, movies) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const container = section.querySelector('.conteneur');
  if (!container) return;

  container.innerHTML = '';

  movies.forEach((movie, index) => {
    const box = document.createElement('div');
    box.classList.add('box');

    // responsive : 2 / 4 / 6
    if (index >= 2 && index < 4) {
      box.classList.add('box_2');
    } else if (index >= 4) {
      box.classList.add('box_3');
    }

    const img = document.createElement('img');
    // image principale si elle existe
    img.src = movie.image_url;
    img.alt = movie.title;

    // si l'image ne charge pas image par défaut
    img.onerror = function () {
      this.src = '../images/erreur_404.webp';
    };

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const h3 = document.createElement('h3');
    h3.classList.add('titre-film');
    h3.textContent = movie.title;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.textContent = 'Détails';
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#exampleModal');

    // clic détail on recharge les détails exacts du film
    btn.addEventListener('click', async () => {
      const detailUrl = movie.url ? movie.url : `${API_BASE}${movie.id}/`;
      const resp = await fetch(detailUrl);
      const fullMovie = await resp.json();
      fillBestMovieModal(fullMovie);
      const modalTitle = document.getElementById('exampleModalLabel');
      if (modalTitle) modalTitle.textContent = fullMovie.title;
    });

    overlay.appendChild(h3);
    overlay.appendChild(btn);
    box.appendChild(img);
    box.appendChild(overlay);
    container.appendChild(box);
  });
}


// =====================================================
// 4. Récupérer N meilleurs films d'un genre
// =====================================================
async function fetchBestByGenre(genreName, limit = 6) {
  let results = [];
  let url = `${API_BASE}?genre=${encodeURIComponent(genreName)}&sort_by=-imdb_score&page=1`;

  while (results.length < limit && url) {
    const resp = await fetch(url);
    const data = await resp.json();
    results = results.concat(data.results);
    url = data.next;
  }
  return results.slice(0, limit);
}


// =====================================================
// 4bis. Récupérer la liste des genres depuis l’API
// =====================================================
async function fetchAllGenres() {
  let genres = [];
  let url = API_GENRES + '?page=1';

  while (url) {
    const resp = await fetch(url);
    const data = await resp.json();
    // l’API renvoie typiquement { results: [ { name: "Action" }, ... ], next: ... }
    genres = genres.concat(data.results || []);
    url = data.next;
  }

  // on renvoie juste les noms, sans doublons
  const names = [...new Set(genres.map(g => g.name))];
  return names.sort();
}


// =====================================================
// 5. Boutons "Afficher plus / moins" (par section)
// =====================================================
function initShowMoreButtons() {
  // smartphone
  document.querySelectorAll('.btn-plus1').forEach(btn => {
    const section = btn.closest('section');
    let open = false;
    btn.addEventListener('click', () => {
      const hidden = section.querySelectorAll('.box_2, .box_3');
      open = !open;
      hidden.forEach(el => {
        el.style.display = open ? 'block' : 'none';
      });
      btn.textContent = open ? 'Afficher moins' : 'Afficher plus';
    });
  });

  // tablette
  document.querySelectorAll('.btn-plus2').forEach(btn => {
    const section = btn.closest('section');
    let open = false;
    btn.addEventListener('click', () => {
      const hidden = section.querySelectorAll('.box_3');
      open = !open;
      hidden.forEach(el => {
        el.style.display = open ? 'block' : 'none';
      });
      btn.textContent = open ? 'Afficher moins' : 'Afficher plus';
    });
  });
}


// =====================================================
// 6. Initialiser les menus déroulants avec les genres
//    et recharger les 6 films de la section au clic
// =====================================================
async function initGenreDropdowns() {
  // 1) on récupère les genres de l'API
  const genres = await fetchAllGenres();

  // 2) on cible TOUS les menus dropdown de la page
  // (dans ton HTML ils sont dans les sections dynamiques)
  const dropdowns = document.querySelectorAll('.dropdown'); // ou plus précis si tu veux

  dropdowns.forEach(drop => {
    const menu = drop.querySelector('.dropdown-menu');
    const button = drop.querySelector('button.dropdown-toggle');
    if (!menu || !button) return;

    // on vide d'abord le menu (pour enlever les "Action", "Comédie" en dur)
    menu.innerHTML = '';

    // on injecte tous les genres
    genres.forEach(genreName => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.href = '#';
      a.textContent = genreName;
      a.dataset.genre = genreName;

      // clic sur un genre → on recharge seulement la section du dropdown
      a.addEventListener('click', async (e) => {
        e.preventDefault();

        // mettre à jour le texte du bouton
        button.textContent = 'Genre : ' + genreName;

        // trouver la section parente
        const section = drop.closest('section');
        if (!section) return;

        // chaque section a un id (ex: s_dynamique, s_film_sci_fi, etc.)
        const sectionId = section.id;
        // on va chercher les 6 meilleurs films de ce genre
        const movies = await fetchBestByGenre(genreName, 6);
        // et on remplace les cartes de CETTE section uniquement
        renderMoviesInSection(sectionId, movies);
      });

      li.appendChild(a);
      menu.appendChild(li);
    });
  });
}


// =====================================================
// 7. Lancement global
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1) Meilleurs films globaux
    const resp = await fetch(`${API_BASE}?sort_by=-imdb_score&page=1`);
    const data = await resp.json();

    if (data.results && data.results.length > 0) {
      // a. meilleur film = 1er (on l’affiche rapidement avec les données de base)
      const bestMovie = data.results[0];
      displayBestMovieHeader(bestMovie);

      // b. ensuite on récupère ses détails pour enrichir l’affichage
      const detailUrl = bestMovie.url ? bestMovie.url : `${API_BASE}${bestMovie.id}/`;
      try {
        const respDetail = await fetch(detailUrl);
        const fullMovie = await respDetail.json();

        // remplissage du modal
        fillBestMovieModal(fullMovie);

        // mise à jour du bloc du haut avec la description complète
        displayBestMovieHeader(fullMovie);
      } catch (err) {
        console.error('Erreur lors du chargement du détail du meilleur film :', err);
      }

      // c. on veut 6 films SUIVANTS → on va éventuellement chercher la page 2
      let nextMovies = data.results.slice(1);
      if (nextMovies.length < 6 && data.next) {
        const resp2 = await fetch(data.next);
        const data2 = await resp2.json();
        nextMovies = nextMovies.concat(data2.results);
      }
      nextMovies = nextMovies.slice(0, 6);

      // d. on les affiche dans la section "Film les mieux notés"
      renderMoviesInSection('s_film_best_note', nextMovies);
    }

    // 2) Sci-Fi (par défaut)
    const sciFiMovies = await fetchBestByGenre('Sci-Fi', 6);
    renderMoviesInSection('s_film_sci_fi', sciFiMovies);

    // 3) Fantasy (par défaut)
    const fantasyMovies = await fetchBestByGenre('Fantasy', 6);
    renderMoviesInSection('s_film_fantasy', fantasyMovies);

    // 4) Boutons afficher +/-
    initShowMoreButtons();

    // 5) Menus déroulants dynamiques
    await initGenreDropdowns();

  } catch (err) {
    console.error('Erreur lors du chargement des films :', err);
  }
});
