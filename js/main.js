import { tipoTraduccion, habilidadTraduccion, colors } from "./translations.js";
import { fetchPokemonList, changePage, fetchPokemonDetails, resetView, searchPokemon } from "./pokemonFunctions.js";
import {displaySinglePokemon} from "./displayDetails.js";

document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchPokemon(this.value);
    }
});

window.fetchPokemonDetails = fetchPokemonDetails;
window.resetView = resetView;
window.fetchPokemonList = fetchPokemonList;
window.searchPokemon = searchPokemon;
window.changePage = changePage;
window.displaySinglePokemon = displaySinglePokemon;
fetchPokemonList();
