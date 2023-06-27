"use strict";
const main = document.querySelector("main");
const firstPoke = document.querySelector(".firstPoke");
const lastPoke = document.querySelector(".lastPoke");
const filterTypes = document.querySelectorAll(".type");
const btnsNext = document.querySelectorAll(".nextBtn");
const btnsBack = document.querySelectorAll(".backBtn");
let lastPage;
let currentPage = 1;
let firstPage = null;
let types = [];
window.onload = () => {
    loadPage();
};
filterTypes.forEach((type) => {
    type.onfocus = () => {
        console.log("hola");
        console.log(type.id);
        types.push(type.id);
    };
    type.onblur = () => {
        console.log("adios");
        console.log(type.id);
        types.splice(types.findIndex((element) => element.id === type.id), 1);
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
    let fetchPromises = [];
    for (let i = currentPage * 20 - 19; i <= currentPage * 20; i++) {
        fetchPromises.push(fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((data) => data.json()));
    }
    Promise.all(fetchPromises).then((results) => {
        results.forEach((pokemon) => {
            pageSetup(pokemon);
            createPokeBlock(pokemon);
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
    spriteP.src = pokemon.sprites.front_default;
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
    main === null || main === void 0 ? void 0 : main.appendChild(pokeBlock);
}
function pageSetup(pokemon) {
    if (firstPoke && lastPoke) {
        if (firstPage === null) {
            firstPage = pokemon.id;
            firstPoke.textContent = pokemon.id + "-";
        }
        else if (pokemon.id - firstPage === 19) {
            lastPoke.textContent = pokemon.id;
            firstPage = null;
        }
    }
}
/* CONSOLE LOGS PARA FETCH */
// console.log(pokemon);
// console.log(pokemon.id);
// console.log(pokemon.name);
// console.log(pokemon.sprites.front_default);
// console.log(pokemon.types[0].type.url);
// console.log(pokemon.types[1].type.url);
