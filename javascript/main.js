"use strict";
const main = document.querySelector("main");
const firstPoke = document.querySelector(".firstPoke");
const lastPoke = document.querySelector(".lastPoke");
const shinyInput = document.querySelector(".shiny");
const pageElements = document.querySelector(".elements");
const filterTypes = document.querySelectorAll(".type");
const btnsNext = document.querySelectorAll(".nextBtn");
const btnsBack = document.querySelectorAll(".backBtn");
let lastPage;
let currentPage = 1;
let firstPage = null;
let typesFiltered = [];
let shiny = false;
window.onload = () => {
    loadPage();
};
pageElements.onchange = () => {
    loadPage();
};
shinyInput.onchange = () => {
    if (shinyInput.checked) {
        shiny = true;
        loadPage();
    }
    else {
        shiny = false;
        loadPage();
    }
};
filterTypes.forEach((type) => {
    type.onchange = () => {
        if (type.checked) {
            typesFiltered.push(type.id);
            console.log(typesFiltered);
        }
        else {
            typesFiltered.splice(typesFiltered.findIndex((element) => element === type.id), 1);
            console.log(typesFiltered);
        }
        loadPage();
    };
});
btnsNext.forEach((btn) => {
    btn.onclick = () => {
        currentPage++;
        loadPage();
    };
});
btnsBack.forEach((btn) => {
    btn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadPage();
        }
    };
});
function loadPage() {
    if (main) {
        main.innerHTML = "";
    }
    let i = 1;
    let fetchPromises = [];
    while (i <= pageElements.valueAsNumber) {
        console.log("i:" + i);
        fetchPromises.push(fetch("https://pokeapi.co/api/v2/pokemon/" + i)
            .then((data) => data.json())
            .then((pokemon) => {
            console.log(pokemon);
            console.log(pokemon.types[0].type.name);
            console.log(typesFiltered.length);
            if (pokemon.types.some((type) => typesFiltered.includes(type.type.name)) ||
                typesFiltered.length === 0) {
                console.log("fetch:" + fetchPromises.length);
                return pokemon;
            }
        }));
        i++;
    }
    Promise.all(fetchPromises).then((results) => {
        results.forEach((pokemon) => {
            // pageSetup(pokemon);
            if (pokemon && pokemon.id) {
                createPokeBlock(pokemon);
            }
        });
    });
}
function createPokeBlock(pokemon) {
    const pokeBlock = document.createElement("div");
    pokeBlock.classList.add("pokeBlock");
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("nameContainer");
    const numP = document.createElement("div");
    numP.classList.add("numP");
    numP.textContent = "#" + pokemon.id;
    nameContainer.appendChild(numP);
    const nameP = document.createElement("div");
    nameP.classList.add("nameP");
    nameP.textContent = pokemon.name.toUpperCase();
    nameContainer.appendChild(nameP);
    pokeBlock.appendChild(nameContainer);
    const spriteP = document.createElement("img");
    spriteP.classList.add("spriteP");
    if (shiny == true) {
        spriteP.src = pokemon.sprites.front_shiny;
    }
    else {
        spriteP.src = pokemon.sprites.front_default;
    }
    pokeBlock.appendChild(spriteP);
    const typeContainer = document.createElement("div");
    typeContainer.classList.add("typeContainer");
    const type = document.createElement("div");
    type.classList.add("type");
    type.textContent = pokemon.types[0].type.name;
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
