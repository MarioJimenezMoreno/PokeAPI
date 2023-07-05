"use strict";
const main = document.querySelector("main");
const firstPoke = document.querySelector(".firstPoke");
const lastPoke = document.querySelector(".lastPoke");
const shinyInput = document.querySelector(".shiny");
const pageElements = document.querySelector(".elements");
const filterTypes = document.querySelectorAll(".type");
const btnsNext = document.querySelectorAll(".nextBtn");
const btnsBack = document.querySelectorAll(".backBtn");
// let firstPage: number | null = null;
// let lastPage: number;
let currentPage = 0;
let maxPages = 0;
let typesFiltered = [];
let fetchPromises = [];
let shinySprite = false;
let defaultLoad = true;
/* FIRST WINDOW LOAD */
window.onload = () => {
    loadPage();
};
/* UPDATE ELEMENTS PER PAGE */
pageElements.onchange = () => {
    loadPage();
};
/* SET/UNSET SHINY SPRITE */
shinyInput.onchange = () => {
    if (shinyInput.checked) {
        shinySprite = true;
        loadPage();
    }
    else {
        shinySprite = false;
        loadPage();
    }
};
/* UPDATE TYPE FILTERS */
filterTypes.forEach((type) => {
    type.onchange = () => {
        currentPage = 0;
        if (type.checked) {
            typesFiltered.push(type.id);
        }
        else {
            typesFiltered.splice(typesFiltered.findIndex((element) => element === type.id), 1);
        }
        loadPage();
    };
});
/* NEXT BUTTON FUNCTIONALLITY */
btnsNext.forEach((btn) => {
    btn.onclick = () => {
        currentPage++;
        loadPage();
    };
});
/* BACK BUTTON FUNCTIONALLITY */
btnsBack.forEach((btn) => {
    btn.onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            loadPage();
        }
    };
});
/* LOAD POKEDEX DATA */
function loadPage() {
    /* REMOVE PREVIOUS ELEMENTS */
    main.innerHTML = "";
    /* DEFAULT SETUP */
    if (defaultLoad) {
        defaultLoad = false;
        for (let i = 1; i < 1011; i++) {
            fetchPromises.push(fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((data) => data.json()));
        }
        Promise.all(fetchPromises).then((results) => {
            results.slice(0, 20).forEach((pokemon) => {
                createPokeBlock(pokemon);
            });
        });
    }
    else {
        /* CUSTOM SETUPS */
        Promise.all(fetchPromises).then((results) => {
            let filteredResults = results;
            if (typesFiltered.length > 0) {
                filteredResults = results.filter((pokemon) => {
                    return pokemon.types.some((type) => {
                        return typesFiltered.includes(type.type.name);
                    });
                });
            }
            const startIndex = currentPage * pageElements.valueAsNumber;
            const endIndex = startIndex + pageElements.valueAsNumber;
            const slicedResults = filteredResults.slice(startIndex, endIndex);
            slicedResults.forEach((pokemon) => {
                createPokeBlock(pokemon);
            });
            maxPages = Math.ceil(filteredResults.length / pageElements.valueAsNumber);
        });
    }
    /* UPDATE BUTTONS CLICKABILITY */
    btnsNext.forEach((btn) => {
        btn.classList.toggle("disabled", currentPage === maxPages - 1);
    });
    btnsBack.forEach((btn) => {
        btn.classList.toggle("disabled", currentPage === 0);
    });
}
function createPokeBlock(pokemon) {
    /* CREATE POKEMON CONTAINER */
    const pokeBlock = document.createElement("div");
    pokeBlock.classList.add("pokeBlock");
    /* CREATE TEXT CONTAINER */
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("nameContainer");
    /* CREATE ID */
    const numP = document.createElement("div");
    numP.classList.add("numP");
    numP.textContent = "#" + pokemon.id;
    nameContainer.appendChild(numP);
    /* CREATE NAME */
    const nameP = document.createElement("div");
    nameP.classList.add("nameP");
    nameP.textContent = pokemon.name.toUpperCase();
    nameContainer.appendChild(nameP);
    pokeBlock.appendChild(nameContainer);
    /* CREATE SPIRE */
    const spriteP = document.createElement("img");
    spriteP.classList.add("spriteP");
    /* SET DEFAULT SPRITE OR SHINY SPRITE */
    if (shinySprite == true) {
        spriteP.src = pokemon.sprites.front_shiny;
    }
    else {
        spriteP.src = pokemon.sprites.front_default;
    }
    pokeBlock.appendChild(spriteP);
    /* CREATE TYPE CONTAINER */
    const typeContainer = document.createElement("div");
    typeContainer.classList.add("typeContainer");
    /* CREATE TYPES */
    const type = document.createElement("div");
    type.classList.add("type");
    type.textContent = pokemon.types[0].type.name;
    /* CHECK FOR SECONDARY TYPE */
    if (pokemon.types.length > 1) {
        type.textContent += "/" + pokemon.types[1].type.name;
    }
    typeContainer.appendChild(type);
    pokeBlock.appendChild(typeContainer);
    main.appendChild(pokeBlock);
}
// function pageSetup(pokemon: any) {
//   if (firstPage === null) {
//     firstPage = pokemon.id;
//     firstPoke.textContent = pokemon.id + "-";
//   } else if (pokemon.id - firstPage === 19) {
//     lastPoke.textContent = pokemon.id;
//     firstPage = null;
//   }
// }
