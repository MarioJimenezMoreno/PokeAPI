const mainMain: HTMLElement = document.querySelector("main_main")!;
const mainProfile: HTMLElement = document.querySelector("main_profile")!;
const headerProfile: HTMLElement = document.querySelector("header_profile")!;
const firstPoke: HTMLElement = document.querySelector(".firstPoke")!;
const lastPoke: HTMLElement = document.querySelector(".lastPoke")!;
const shinyInput: HTMLInputElement = document.querySelector(".shiny")!;
const pageElements: HTMLInputElement = document.querySelector(".elements")!;
const loader: HTMLElement = document.querySelector(".loaderContainer")!;
let pokeBlocks: HTMLElement[] = Array.from(
  document.querySelectorAll(".pokeBlock")
);

const filterTypes = document.querySelectorAll(
  ".type"
) as NodeListOf<HTMLInputElement>;
const btnsNext = document.querySelectorAll(
  ".nextBtn"
) as NodeListOf<HTMLElement>;
const btnsBack = document.querySelectorAll(
  ".backBtn"
) as NodeListOf<HTMLElement>;

// let firstPage: number | null = null;
// let lastPage: number;
let currentPage: number = 0;
let maxPages: number = 0;

let typesFiltered: any[] = [];
let fetchPromises: Promise<any>[] = [];

let shinySprite: boolean = false;

if (location.pathname.endsWith("main.html")) {
  /* FIRST WINDOW LOAD */
  window.onload = () => {
    loadPage();
  };
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
  /* UPDATE ELEMENTS PER PAGE */
  pageElements.onchange = () => {
    currentPage = 0;
    loadPage();
  };
  /* SET/UNSET SHINY SPRITE */
  shinyInput.onchange = () => {
    if (shinyInput.checked) {
      shinySprite = true;
      loadPage();
    } else {
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
      } else {
        typesFiltered.splice(
          typesFiltered.findIndex((element) => element === type.id),
          1
        );
      }
      loadPage();
    };
  });
  /* LOAD POKEDEX DATA */
  function loadPage() {
    /* REMOVE PREVIOUS ELEMENTS */
    mainMain.innerHTML = "";
    /* DEFAULT SETUP */
    if (fetchPromises.length == 0) {
      for (let i = 1; i < 1011; i++) {
        fetchPromises.push(
          fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((data) =>
            data.json()
          )
        );
      }
      Promise.all(fetchPromises).then((results) => {
        loader.style.display = "none";
        results.slice(0, 20).forEach((pokemon) => {
          createPokeBlock(pokemon);
        });
      });
    } else {
      /* CUSTOM SETUPS */
      Promise.all(fetchPromises).then((results) => {
        let filteredResults = results;

        if (typesFiltered.length > 0) {
          filteredResults = results.filter((pokemon) => {
            return pokemon.types.some((type: any) => {
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
        maxPages = Math.ceil(
          filteredResults.length / pageElements.valueAsNumber
        );
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
  function createPokeBlock(pokemon: any) {
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
    } else {
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
    mainMain.appendChild(pokeBlock);

    pokeBlocks.push(pokeBlock);
    assignPokeBlockEvents();
  }

  function assignPokeBlockEvents() {
    pokeBlocks.forEach((block, i) => {
      block.onclick = () => {
        console.log(
          block.querySelector<HTMLDivElement>(".numP")?.textContent?.slice(1)
        );
        let pokeId = block
          .querySelector<HTMLDivElement>(".numP")
          ?.textContent?.slice(1);
        // createPokeProfile(pokeId);
        window.location.href = "profile.html";
      };
    });
  }
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
else if (location.pathname.endsWith("profile.html")) {
  function createPokeProfile(pokemon: any) {
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
    headerProfile.appendChild(nameContainer);

    /* CREATE SPRITE */
    const spriteP = document.createElement("img");
    spriteP.classList.add("spriteP");

    /* SET DEFAULT SPRITE OR SHINY SPRITE */
    if (shinySprite == true) {
      spriteP.src = pokemon.sprites.front_shiny;
    } else {
      spriteP.src = pokemon.sprites.front_default;
    }
    headerProfile.appendChild(spriteP);

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
    headerProfile.appendChild(typeContainer);

    /* STATS */
  }
}
