document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const formSearch = document.getElementById('form-search');
    const resultsTable = document.querySelector('#results > table');
    const resultsBody = resultsTable.querySelector('tbody')

    // Récupération des champs input/select
    const fieldFauteuils        = document.getElementById('fauteuils');
    const fieldFauteuilsOperation = document.getElementById('operation_fauteuils');

    const fieldEcrans             = document.getElementById('ecrans');
    const fieldEcransOperation    = document.getElementById('operation_ecrans');

    const fieldArrondissement     = document.getElementById('arrondissement');

    // Validation du formulaire
    formSearch.addEventListener('submit', event => {
        event.preventDefault();

        // Constitution de la requête pour le serveur
        const params = {
            'operation_fauteuils' : fieldFauteuilsOperation.value,
            'fauteuils' : fieldFauteuils.value,
            'operation_ecrans' : fieldEcransOperation.value,
            'ecrans' : fieldEcrans.value,
            'arrondissement' : fieldArrondissement.value
        };

        // Envoi au serveur
        fetch('/cinemas/api' + buildQueryString(params))
            .then(res => res.json())
            .then(data => buildResults(data))
            .catch(err => alert(`Une erreur est survenue\n${err.message || err}`));
    });

    function buildResults(data) {

        if (data.length === 0) {
            resultsTable.style.display = 'block'; 
            return resultsBody.innerHTML = '<td colspan="5">Aucun résultat pour ces paramètres</td>';
        }
        
        const resultsFragment = document.createDocumentFragment();
        resultsFragment.innerHTML = '';

        data.map(item => item.fields).forEach(item => { // Permet de trier les clés du fichier json (on ne veut que la clé fields)
            resultsFragment.innerHTML += `<tr>
                <td>${item.nom_etablissement}</td>
                <td>${item.adresse}</td>
                <td>${item.arrondissement}</td>
                <td>${item.fauteuils}</td>
                <td>${item.ecrans}</td>
            </tr>`;
        });

        resultsBody.innerHTML = resultsFragment.innerHTML;
        resultsTable.style.display = 'block';
    }

    function buildQueryString(paramsObj) {
        let qs = '?';
        for (let name in paramsObj) {
            qs += encodeURIComponent(name) + '=' + encodeURIComponent(paramsObj[name]) + '&';
        }
        return qs.slice(0, -1);
    }
})();