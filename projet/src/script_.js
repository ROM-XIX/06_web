
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