import { tipoTraduccion, habilidadTraduccion, colors } from "./translations.js";

export function displaySinglePokemon(pokemon) {
    const pokemonList = document.getElementById('pokemon-list');
    const pagination = document.getElementById('pagination'); // Selecciona el contenedor de paginación
    pagination.style.display = 'none'; // Oculta la paginación
    pokemonList.innerHTML = '';
    const div = document.createElement('section');
    div.className = 'pokemon-detail';

    const translatedTypes = pokemon.types.map(type => tipoTraduccion[type.type.name] || type.type.name).join(', ');

    Promise.all(
        pokemon.types.map(type => fetch(type.type.url).then(response => response.json()))
    )
    .then(typeData => {
        const weaknesses = typeData
            .flatMap(type => type.damage_relations.double_damage_from)
            .map(type => tipoTraduccion[type.name] || type.name)
            .join(', ');

        div.innerHTML = `
            <section class="pokemon-header">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <h2>${pokemon.name} (#${pokemon.id})</h2>
            </section>
            <section class="pokemon-info">
                <div><strong>Tipo:</strong> ${translatedTypes}</div>
                <div><strong>Debilidades:</strong> ${weaknesses}</div>
                <div><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => habilidadTraduccion[ability.ability.name] || ability.ability.name).join(', ')}</div>
                <div><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(2)} m</div>
                <div><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(2)} kg</div>
                <div><strong>Exp. Evolución:</strong> ${pokemon.base_experience} puntos</div>
            </section>
            
        `;
        pokemonList.appendChild(div);

        fetch(pokemon.species.url)
            .then(response => response.json())
            .then(speciesData => fetchEvolutionChain(speciesData.evolution_chain.url))
            .then(evolutions => showEvolutions(evolutions, div))
            .catch(error => console.error("Error al obtener evoluciones:", error));
    })
    .catch(error => console.error('Error al obtener debilidades:', error));
}

export function fetchEvolutionChain(evolutionChainUrl) {
    return fetch(evolutionChainUrl)
        .then(response => response.json())
        .then(data => {
            let evolutions = [];
            let currentStage = data.chain;
            do {
                evolutions.push(currentStage.species.name);
                currentStage = currentStage.evolves_to[0];
            } while (currentStage);
            return evolutions;
        })
        .catch(error => console.error("Error al obtener la cadena evolutiva:", error));
}
export function showEvolutions(evolutions, parentDiv) {
    const evolutionSection = document.createElement('section');
    evolutionSection.className = 'pokemon-evolutions';
    evolutionSection.innerHTML = " <h3>Evoluciones:</h3>";

    Promise.all(evolutions.map(evolutionName =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}`).then(response => response.json())
    ))
    .then(evolutionDataArray => {
        evolutionDataArray.forEach(evolutionData => {
            const evoDiv = document.createElement('div');
            evoDiv.className = 'pokemon-evolution';
            evoDiv.innerHTML = `
                <img src="${evolutionData.sprites.front_default}" alt="${evolutionData.name}">
                <p>${evolutionData.name} (#${evolutionData.id})</p>
            `;
            evolutionSection.appendChild(evoDiv);
        });
        parentDiv.appendChild(evolutionSection);
    })
    .catch(error => console.error("Error al obtener los datos de las evoluciones:", error));
}
