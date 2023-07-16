"use strict";
const main = document.querySelector("main");
// const mainProfile: HTMLElement = document.querySelector("main_profile")!;
const headerProfile = document.querySelector("header_profile");
const firstPoke = document.querySelector(".firstPoke");
const lastPoke = document.querySelector(".lastPoke");
const shinyInput = document.querySelector(".shiny");
const pageElements = document.querySelector(".elements");
const loader = document.querySelector(".loaderContainer");
const backMenu = document.querySelector(".backMenu");
const profileWindow = document.querySelector(".profileWindow");
const closeProfileBtn = document.querySelector(".closeProfile");
const nextProfileBtn = document.querySelector(".nextProfileBtn");
const backProfileBtn = document.querySelector(".backProfileBtn");
const spritePart = document.querySelector(".spritePart");
const bottomPart = document.querySelector(".bottomPart");
let pokeBlocks = Array.from(document.querySelectorAll(".pokeBlock"));
const filterTypes = document.querySelectorAll(".type");
const btnsNextPage = document.querySelectorAll(".nextBtn");
const btnsBackPage = document.querySelectorAll(".backBtn");
let currentPage = 0;
let maxPages = 0;
let pokeId = 0;
let typesFiltered = [];
let fetchPromises = [];
let shinySprite = false;
/* FIRST WINDOW LOAD */
window.onload = () => {
    LoadMain();
};
/* MAIN BUTTONS */
/* NEXT BUTTON FUNCTIONALLITY */
btnsNextPage.forEach((btn) => {
    btn.onclick = () => {
        currentPage++;
        LoadMain();
    };
});
/* BACK BUTTON FUNCTIONALLITY */
btnsBackPage.forEach((btn) => {
    btn.onclick = () => {
        currentPage--;
        LoadMain();
    };
});
/* PROFILE BUTTONS */
/* CLOSE PROFILE BUTTON FUNCTIONALLITY */
closeProfileBtn.onclick = () => {
    profileWindow.style.animation = "slideDown 1.5s forwards";
};
/* NEXT POKEMON BUTTON FUNCTIONALLITY */
nextProfileBtn.onclick = () => {
    if (pokeId < 1009) {
        pokeId++;
        loadProfile();
    }
};
/* BACK POKEMON BUTTON FUNCTIONALLITY */
backProfileBtn.onclick = () => {
    if (pokeId > 0) {
        pokeId--;
        loadProfile();
    }
};
/* FILTER EVENTS */
/* UPDATE ELEMENTS PER PAGE */
pageElements.onchange = () => {
    currentPage = 0;
    LoadMain();
};
/* SET/UNSET SHINY SPRITE */
shinyInput.onchange = () => {
    if (shinyInput.checked) {
        shinySprite = true;
        LoadMain();
        loadProfile();
    }
    else {
        shinySprite = false;
        LoadMain();
        loadProfile();
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
        LoadMain();
    };
});
/* LOAD POKEDEX DATA NUEVO */
function LoadMain() {
    /* REMOVE PREVIOUS ELEMENTS */
    main.innerHTML = "";
    /* DEFAULT SETUP */
    if (fetchPromises.length == 0) {
        for (let i = 1; i < 1011; i++) {
            fetchPromises.push(fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((data) => data.json()));
        }
        Promise.all(fetchPromises).then((results) => {
            fetchPromises = results.map((result) => {
                return Promise.resolve({
                    id: result.id,
                    name: result.name,
                    sprites: {
                        front_shiny: result.sprites.front_shiny,
                        front_default: result.sprites.front_default,
                    },
                    types: [
                        { type: { name: result.types[0].type.name } },
                        ...(result.types[1]
                            ? [{ type: { name: result.types[1].type.name } }]
                            : []),
                    ],
                });
            });
            /* LOCAL STORAGE NO TIENE SUFICIENTE ESPACIO
            localStorage.setItem("fetchPromises", JSON.stringify(fetchPromises)); */
            loader.style.display = "none";
            results.slice(0, 20).forEach((pokemon) => {
                createPokeBlock(pokemon);
            });
        });
    }
    else {
        /* CUSTOM SETUPS */
        Promise.all(fetchPromises).then((results) => {
            let filteredResults = results;
            loader.style.display = "none";
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
    btnsNextPage.forEach((btn) => {
        btn.classList.toggle("disabled", currentPage === maxPages - 1);
    });
    btnsBackPage.forEach((btn) => {
        btn.classList.toggle("disabled", currentPage === 0);
    });
}
function loadProfile() {
    spritePart.innerHTML = "";
    bottomPart.innerHTML = "";
    fetchPromises[pokeId].then((pokemon) => {
        createPokeProfile(pokemon);
    });
}
/* POKEMON BLOCKS */
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
    /* CREATE SPRITE */
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
    pokeBlocks.push(pokeBlock);
    assignPokeBlockEvents();
}
function assignPokeBlockEvents() {
    pokeBlocks.forEach((block) => {
        block.onclick = () => {
            var _a, _b;
            pokeId =
                Number((_b = (_a = block.querySelector(".numP")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.slice(1)) - 1;
            loadProfile();
            profileWindow.style.animation = "slideUp 1.5s forwards";
        };
    });
}
/* POKEMON PROFILE */
function createPokeProfile(pokemon) {
    // console.log(pokemon);
    // /* CREATE TEXT CONTAINER */
    // const nameContainer = document.createElement("div");
    // nameContainer.classList.add("nameContainer");
    // /* CREATE ID */
    // const numP = document.createElement("div");
    // numP.classList.add("numP");
    // numP.textContent = "#" + pokemon.id;
    // nameContainer.appendChild(numP);
    // /* CREATE NAME */
    // const nameP = document.createElement("div");
    // nameP.classList.add("nameP");
    // nameP.textContent = pokemon.name.toUpperCase();
    // nameContainer.appendChild(nameP);
    // headerProfile.appendChild(nameContainer);
    // /* CREATE SPRITE */
    // const spriteP = document.createElement("img");
    // spriteP.classList.add("spriteP");
    // /* SET DEFAULT SPRITE OR SHINY SPRITE */
    // if (shinySprite == true) {
    //   spriteP.src = pokemon.sprites.front_shiny;
    // } else {
    //   spriteP.src = pokemon.sprites.front_default;
    // }
    // headerProfile.appendChild(spriteP);
    // /* CREATE TYPE CONTAINER */
    // const typeContainer = document.createElement("div");
    // typeContainer.classList.add("typeContainer");
    // /* CREATE TYPES */
    // const type = document.createElement("div");
    // type.classList.add("type");
    // type.textContent = pokemon.types[0].type.name;
    // /* CHECK FOR SECONDARY TYPE */
    // if (pokemon.types.length > 1) {
    //   type.textContent += "/" + pokemon.types[1].type.name;
    // }
    // typeContainer.appendChild(type);
    // headerProfile.appendChild(typeContainer);
    // /* CREATE TEXT CONTAINER */
    // const nameContainer = document.createElement("div");
    // nameContainer.classList.add("nameContainer");
    /* CREATE ID */
    const numberProfile = document.createElement("div");
    numberProfile.classList.add("numP");
    numberProfile.textContent = "#" + pokemon.id;
    spritePart.appendChild(numberProfile);
    /* CREATE NAME */
    const profileName = document.createElement("div");
    profileName.classList.add("nameP");
    profileName.textContent = pokemon.name.toUpperCase();
    spritePart.appendChild(profileName);
    const profileSprite = document.createElement("img");
    profileSprite.classList.add("sprite");
    if (shinySprite == true) {
        profileSprite.src = pokemon.sprites.front_shiny;
    }
    else {
        profileSprite.src = pokemon.sprites.front_default;
    }
    spritePart.appendChild(profileSprite);
    /* STATS */
    btnsNextPage.forEach((btn) => {
        btn.classList.toggle("disabled", pokeId === 1009);
    });
    btnsBackPage.forEach((btn) => {
        btn.classList.toggle("disabled", pokeId === 0);
    });
}
function assignProfileEvents() { }
/* CODIGO PENDIENTE O DEPRECADO */
/* PAGE SETUP */
// let firstPage: number | null = null;
// let lastPage: number;
// function pageSetup(pokemon: any) {
//   if (firstPage === null) {
//     firstPage = pokemon.id;
//     firstPoke.textContent = pokemon.id + "-";
//   } else if (pokemon.id - firstPage === 19) {
//     lastPoke.textContent = pokemon.id;
//     firstPage = null;
//   }
// }
/* LOAD POKEDEX DATA VIEJO */
// function LoadMain() {
//   /* REMOVE PREVIOUS ELEMENTS */
//   mainMain.innerHTML = "";
//   /* DEFAULT SETUP */
//   if (fetchPromises.length == 0) {
//     for (let i = 1; i < 1011; i++) {
//       fetchPromises.push(
//         fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((data) =>
//           data.json()
//         )
//       );
//     }
//     Promise.all(fetchPromises).then((results) => {
//       const pokemonData = results.map((result) => result);
//       console.log(pokemonData);
//       localStorage.setItem("fetchPromises", JSON.stringify(pokemonData));
//       loader.style.display = "none";
//       results.slice(0, 20).forEach((pokemon) => {
//         createPokeBlock(pokemon);
//       });
//     });
//   } else {
//     /* CUSTOM SETUPS */
//     Promise.all(fetchPromises).then((results) => {
//       let filteredResults = results;
//       loader.style.display = "none";
//       if (typesFiltered.length > 0) {
//         filteredResults = results.filter((pokemon) => {
//           return pokemon.types.some((type: any) => {
//             return typesFiltered.includes(type.type.name);
//           });
//         });
//       }
//       const startIndex = currentPage * pageElements.valueAsNumber;
//       const endIndex = startIndex + pageElements.valueAsNumber;
//       const slicedResults = filteredResults.slice(startIndex, endIndex);
//       slicedResults.forEach((pokemon) => {
//         createPokeBlock(pokemon);
//       });
//       maxPages = Math.ceil(filteredResults.length / pageElements.valueAsNumber);
//     });
//   }
//   /* UPDATE BUTTONS CLICKABILITY */
//   btnsNextPage.forEach((btn) => {
//     btn.classList.toggle("disabled", currentPage === maxPages - 1);
//   });
//   btnsBackPage.forEach((btn) => {
//     btn.classList.toggle("disabled", currentPage === 0);
//   });
// }
/* ELEMENTOS DEL LOCAL STORAGE (NO USADOS) */
// let storedFetchPromisesString = localStorage.getItem("fetchPromises");
// const storedFetchPromises = storedFetchPromisesString
//   ? JSON.parse(storedFetchPromisesString)
//   : null;
// if (storedFetchPromises && Array.isArray(storedFetchPromises)) {
//   fetchPromises = storedFetchPromises;
// }
