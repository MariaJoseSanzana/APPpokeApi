import { tipoTraduccion, habilidadTraduccion, colors } from "./translations.js";

const pokemonsPerPage = 30;
let currentPage = 1;
let currentPokemons = [];

export function fetchPokemonList() {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
        .then(response => response.json())
        .then(data => {
            currentPokemons = data.results;
            displayPokemons();
        })
        .catch(error => console.error('Error al obtener la lista de Pokémon:', error));
}

export function displayPokemons() {
    const start = (currentPage - 1) * pokemonsPerPage;
    const end = start + pokemonsPerPage;
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';

    const pokemonsToShow = currentPokemons.slice(start, end);

    Promise.all(
        pokemonsToShow.map(pokemon =>
            fetch(pokemon.url)
                .then(response => response.json())
                .catch(error => console.error(`Error al obtener detalles de ${pokemon.name}:`, error))
        )
    ).then(detailedPokemons => {
        detailedPokemons.sort((a, b) => a.id - b.id);
        detailedPokemons.forEach(data => {
            const div = document.createElement('div');
            div.className = 'pokemon';
            div.innerHTML = `
                <img src="${data.sprites.front_default}" alt="${data.name}" class="pokemon-image">
                <h2>${data.name}</h2>
                <p>N° ${data.id}</p>
                <p>${data.types.map(type => tipoTraduccion[type.type.name] || type.type.name).join(', ')}</p>
                <button class="detail-button" onclick="fetchPokemonDetails('${data.name}')">Detalles</button>
            `;

            // Aplica el fondo degradado basado en los tipos de Pokémon
            if (data.types.length > 1) {
                div.style.background = `linear-gradient(150deg, ${colors[data.types[0].type.name]} 50%, ${colors[data.types[1].type.name]} 50%)`;
            } else {
                div.style.background = colors[data.types[0].type.name];
            }

            pokemonList.appendChild(div);
        });
    });

    document.getElementById('prev-button').style.display = currentPage > 1 ? 'inline' : 'none';
    document.getElementById('reset-button').style.display = currentPage > 1 ? 'block' : 'none';
    document.getElementById('next-button').style.display = end < currentPokemons.length ? 'inline' : 'none';
}


export function changePage(direction) {
    currentPage += direction;
    displayPokemons();
}

export function searchPokemon(name) {
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';
    document.getElementById('pagination').style.display = 'none';

    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => {
            if (!response.ok) throw new Error('Pokémon no encontrado');
            return response.json();
        })
        .then(pokemon => {
            displaySinglePokemon(pokemon);
            document.getElementById('reset-button').style.display = 'block';
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
            resetView(); //devolver al inicio
        });
}

export function fetchPokemonDetails(name) {
    const pokemonList = document.getElementById('pokemon-list');
    const pagination = document.getElementById('pagination'); // Selecciona el contenedor de paginación
    pagination.style.display = 'none'; // Oculta la paginación
    pokemonList.innerHTML = '';

    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => {
            if (!response.ok) throw new Error('Pokémon no encontrado');
            return response.json();
        })
        .then(pokemon => {
            displaySinglePokemon(pokemon);
            document.getElementById('reset-button').style.display = 'block';
        })
        .catch(error => console.error(error));
}

export function resetView() {
    currentPage = 1;
    fetchPokemonList(currentPage);
    document.getElementById('reset-button').style.display = 'none';
    document.getElementById('pagination').style.display = 'block';
}
