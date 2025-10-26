// Bouton afficher plus/moins pour les smartphone
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

// Bouton affichage plus/moins pour les tablette
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

// Gestion du menu déroulant
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