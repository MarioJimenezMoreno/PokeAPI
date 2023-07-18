const main: HTMLElement = document.querySelector("main")!;
const header: HTMLElement = document.querySelector("header")!;
const firstPoke: HTMLElement = document.querySelector(".firstPoke")!;
const lastPoke: HTMLElement = document.querySelector(".lastPoke")!;
const shinyInput: HTMLInputElement = document.querySelector(".shiny")!;
const pageElements: HTMLInputElement = document.querySelector(".elements")!;
const loader: HTMLElement = document.querySelector(".loaderContainer")!;
const fader: HTMLElement = document.querySelector(".fader")!;
const backMenu: HTMLElement = document.querySelector(".backMenu")!;
const profileWindow: HTMLElement = document.querySelector(".profileWindow")!;
const closeProfile: HTMLElement = document.querySelector(".closeProfile")!;
const closeProfileImage: HTMLElement =
  document.querySelector(".closeProfile img")!;
const nextProfileBtn: HTMLElement = document.querySelector(".nextProfileBtn")!;
const backProfileBtn: HTMLElement = document.querySelector(".backProfileBtn")!;
const spritePart: HTMLElement = document.querySelector(".spritePart")!;
const bottomPart: HTMLElement = document.querySelector(".bottomPart")!;
const page: NodeListOf<HTMLElement> = document.querySelectorAll(
  "main, header, footer, nav, .profileWindow"
);

let pokeBlocks: HTMLElement[] = Array.from(
  document.querySelectorAll(".pokeBlock")
);

const filterTypes = document.querySelectorAll(
  ".type"
) as NodeListOf<HTMLInputElement>;
const btnsNextPage = document.querySelectorAll(
  ".nextBtn"
) as NodeListOf<HTMLElement>;
const btnsBackPage = document.querySelectorAll(
  ".backBtn"
) as NodeListOf<HTMLElement>;

let currentPage: number = 0;
let maxPages: number = 0;
let pokeId: number = 0;
let typesFiltered: any[] = [];
let fetchPromises: Promise<any>[] = [];
let closedWindow: boolean = true;
let shinySprite: boolean = false;
let animationInProgress = false;

/* FIRST WINDOW LOAD */
window.onload = () => {
  storageManager("download");
  loadMain();
};
/* NEXT BUTTON FUNCTIONALLITY */
btnsNextPage.forEach((btn) => {
  btn.onclick = () => {
    currentPage++;
    loadMain();
  };
});
/* BACK BUTTON FUNCTIONALLITY */
btnsBackPage.forEach((btn) => {
  btn.onclick = () => {
    currentPage--;
    loadMain();
  };
});
/* CLOSE PROFILE BUTTON FUNCTIONALLITY */
closeProfile.onclick = () => {
  updateProfileBtn();
};
closeProfile.onmouseover = () => {
  animationController("onMouseEnter");
};
closeProfile.onmouseleave = () => {
  animationController("onMouseLeave");
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
/* UPDATE ELEMENTS PER PAGE */
pageElements.onchange = () => {
  currentPage = 0;
  loadMain();
};
/* SET/UNSET SHINY SPRITE */
shinyInput.onchange = () => {
  if (shinyInput.checked) {
    shinySprite = true;
    loadMain();
    loadProfile();
  } else {
    shinySprite = false;
    loadMain();
    loadProfile();
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
    loadMain();
  };
});
/* LOAD POKEDEX DATA NUEVO */
function loadMain() {
  /* REMOVE PREVIOUS ELEMENTS */
  clearInfo("main");
  /* DEFAULT SETUP */
  if (fetchPromises.length == 0) {
    for (let i = 1; i < 1011; i++) {
      fetchPromises.push(
        fetch("https://pokeapi.co/api/v2/pokemon/" + i)
          .then((data) => data.json())
          .then((result) => ({
            id: result.id,
            name: result.name,
            sprites: {
              front_shiny: result.sprites.front_shiny,
              front_default: result.sprites.front_default,
            },
            stats: {
              hp: {
                name: result.stats[0].stat.name,
                value: result.stats[0].base_stat,
              },
              attack: {
                name: result.stats[1].stat.name,
                value: result.stats[1].base_stat,
              },
              defense: {
                name: result.stats[2].stat.name,
                value: result.stats[2].base_stat,
              },
              special_attack: {
                name: result.stats[3].stat.name,
                value: result.stats[3].base_stat,
              },
              special_defense: {
                name: result.stats[4].stat.name,
                value: result.stats[4].base_stat,
              },
              speed: {
                name: result.stats[5].stat.name,
                value: result.stats[5].base_stat,
              },
            },
            types: [
              { type: { name: result.types[0].type.name } },
              ...(result.types[1]
                ? [{ type: { name: result.types[1].type.name } }]
                : []),
            ],
          }))
      );
    }

    Promise.all(fetchPromises).then((results) => {
      fetchPromises = results;

      storageManager("upload");
      animationController("pageLoaded");
      results.slice(0, 20).forEach((pokemon) => {
        createPokeBlock(pokemon);
      });
    });
  } else {
    /* CUSTOM SETUPS */
    Promise.all(fetchPromises).then((results) => {
      let filteredResults = results;
      animationController("pageLoaded"); // SI EN VEZ DE AQUÍ LO PONGO EN EL IF DE WINDOW.ONLOAD NO PARPADEA LA PANTALLA DE CARGA //
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

      pokeId = startIndex;

      slicedResults.forEach((pokemon) => {
        createPokeBlock(pokemon);
      });
      maxPages = Math.ceil(filteredResults.length / pageElements.valueAsNumber);
    });
  }

  updatePageBtns();
}
function loadProfile() {
  clearInfo("profile");
  createPokeProfile(fetchPromises[pokeId]);
}
/* POKEMON BLOCKS */
function createPokeBlock(pokemon: any) {
  /* CREATE POKEMON CONTAINER */
  const pokeBlock = document.createElement("div");
  pokeBlock.classList.add("pokeBlock");

  /* CREATE TEXT CONTAINER */
  const nameContainer = document.createElement("div");
  nameContainer.classList.add("nameContainer");

  /* CREATE ID */
  const numP = document.createElement("div");
  numP.classList.add("num");
  numP.textContent = "#" + pokemon.id;
  nameContainer.appendChild(numP);

  /* CREATE NAME */
  const nameP = document.createElement("div");
  nameP.classList.add("name");
  nameP.textContent = pokemon.name.toUpperCase();
  nameContainer.appendChild(nameP);
  pokeBlock.appendChild(nameContainer);

  /* CREATE SPRITE */
  const spriteP = document.createElement("img");
  spriteP.classList.add("sprite");

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
  main.appendChild(pokeBlock);

  pokeBlocks.push(pokeBlock);
  assignPokeBlockEvents();
}
function assignPokeBlockEvents() {
  pokeBlocks.forEach((block) => {
    block.onclick = () => {
      pokeId =
        Number(
          block.querySelector<HTMLDivElement>(".num")?.textContent?.slice(1)
        ) - 1;
      updateProfileBtn();
    };
    block.onmouseenter = () => {
      block.style.backgroundColor = "orange";
    };
    block.onmouseleave = () => {
      block.style.backgroundColor = "rgb(231, 230, 230)";
    };
  });
}
function updatePageBtns() {
  /* UPDATE BUTTONS CLICKABILITY */
  btnsNextPage.forEach((btn) => {
    btn.classList.toggle("disabled", currentPage === maxPages - 1);
  });
  btnsBackPage.forEach((btn) => {
    btn.classList.toggle("disabled", currentPage === 0);
  });
}
function updateProfileBtn() {
  if (!animationInProgress) {
    animationInProgress = true;

    animationController("profileButton");

    setTimeout(() => {
      animationInProgress = false;
    }, 1500);
  }
}
function storageManager(action: String) {
  switch (action) {
    case "download":
      if (sessionStorage.getItem("fetchPromises") != null) {
        fetchPromises = JSON.parse(
          sessionStorage.getItem("fetchPromises") as string
        );
      }
      break;
    case "upload":
      if (typeof sessionStorage !== "undefined") {
        try {
          sessionStorage.setItem(
            "fetchPromises",
            JSON.stringify(fetchPromises)
          );
          console.log("Pokedex guardada exitosamente en el sessionStorage");
        } catch (e) {
          console.log("El sessionStorage no es suficiente");
        }
        break;
      }
  }
}
function animationController(anim: String) {
  switch (anim) {
    case "pageLoaded":
      loader.style.display = "none";
      page.forEach((element) => {
        element.style.animation = "pageLoaded 2s forwards";
      });
      break;

    case "profileButton":
      if (closedWindow) {
        profileWindow.style.opacity = "1"; // TO OPTIMIZE //
        loadProfile();
        fader.style.animation = "fadeOut 1.5s forwards";
        closeProfileImage.style.transform = "rotate(90deg)";
        closeProfileImage.style.top = "55px";
        profileWindow.style.animation = "slideUp 1.5s forwards";
        closedWindow = false;
      } else {
        fader.style.animation = "fadeIn 1.5s forwards";
        closeProfileImage.style.transform = "rotate(-90deg)";
        profileWindow.style.animation = "slideDown 1.5s forwards";
        closeProfileImage.style.top = "-5px";
        closedWindow = true;
      }
      break;

    case "onMouseLeave":
      if (!animationInProgress && closedWindow) {
        profileWindow.style.animation = "openTeaseDown 0.5s forwards";
      } else if (!animationInProgress) {
        profileWindow.style.animation = "closeTeaseUp 0.5s forwards";
      }
      break;

    case "onMouseEnter":
      profileWindow.style.opacity = "1"; // TO OPTIMIZE //
      if (!animationInProgress && closedWindow) {
        profileWindow.style.animation = "openTeaseUp 0.5s forwards";
      } else if (!animationInProgress) {
        profileWindow.style.animation = "closeTeaseDown 0.5s forwards";
      }
      break;
  }
}
function clearInfo(info: String) {
  switch (info) {
    case "main":
      main.innerHTML = "";
      break;

    case "profile":
      spritePart.innerHTML = "";
      bottomPart.innerHTML = "";
      break;
  }
}
/* POKEMON PROFILE */
function createPokeProfile(pokemon: any) {
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

  /* CREATE ID */
  const numberProfile = document.createElement("div");
  numberProfile.classList.add("numProfile");
  numberProfile.textContent = "#" + pokemon.id;
  spritePart.appendChild(numberProfile);

  /* CREATE NAME */
  const profileName = document.createElement("div");
  profileName.classList.add("nameProfile");
  profileName.textContent = pokemon.name.toUpperCase();
  spritePart.appendChild(profileName);

  const spriteProfile = document.createElement("img");
  spriteProfile.classList.add("spriteProfile");

  if (shinySprite == true) {
    spriteProfile.src = pokemon.sprites.front_shiny;
  } else {
    spriteProfile.src = pokemon.sprites.front_default;
  }

  spritePart.appendChild(spriteProfile);

  /* STATS */
  /*HP*/
  const hpStat = document.createElement("div");
  hpStat.classList.add("hp");
  hpStat.textContent =
    pokemon.stats.hp.name.toUpperCase() + ": " + pokemon.stats.hp.value;
  bottomPart.appendChild(hpStat);
  /* ATTACK*/
  const atkStat = document.createElement("div");
  atkStat.classList.add("atk");
  atkStat.textContent =
    pokemon.stats.attack.name.toUpperCase() + ": " + pokemon.stats.attack.value;
  bottomPart.appendChild(atkStat);
  /* DEFENSE */
  const defStat = document.createElement("div");
  defStat.classList.add("def");
  defStat.textContent =
    pokemon.stats.defense.name.toUpperCase() +
    ": " +
    pokemon.stats.defense.value;
  bottomPart.appendChild(defStat);
  /* SPECIAL ATTACK */
  const spatkStat = document.createElement("div");
  spatkStat.classList.add("spatk");
  spatkStat.textContent =
    pokemon.stats.special_attack.name.toUpperCase() +
    ": " +
    pokemon.stats.special_attack.value;
  bottomPart.appendChild(spatkStat);
  /* SPECIAL DEFENSE */
  const spdefStat = document.createElement("div");
  spdefStat.classList.add("spdef");
  spdefStat.textContent =
    pokemon.stats.special_defense.name.toUpperCase() +
    ": " +
    pokemon.stats.special_defense.value;
  bottomPart.appendChild(spdefStat);
  /* SPEED */
  const speedStat = document.createElement("div");
  speedStat.classList.add("speed");
  speedStat.textContent =
    pokemon.stats.speed.name.toUpperCase() + ": " + pokemon.stats.speed.value;
  bottomPart.appendChild(speedStat);

  btnsNextPage.forEach((btn) => {
    btn.classList.toggle("disabled", pokeId === 1009);
  });
  btnsBackPage.forEach((btn) => {
    btn.classList.toggle("disabled", pokeId === 0);
  });
}
function assignProfileEvents() {}

/* CODIGOS PENDIENTE O DEPRECADOS */
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
// function loadMain() {
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
/* IF DE LOAD PAGE (EXCEDE QUOTA)*/
// if (fetchPromises.length == 0) {
//   for (let i = 1; i < 1011; i++) {
//     fetchPromises.push(
//       fetch("https://pokeapi.co/api/v2/pokemon/" + i)
//         .then((data) => data.json())
//         .then((result) => ({
//           id: result.id,
//           name: result.name,
//           sprites: {
//             front_shiny: result.sprites.front_shiny,
//             front_default: result.sprites.front_default,
//           },
//           stats: {
//             hp: {
//               name: result.stats[0].stat.name,
//               value: result.stats[0].base_stat,
//             },
//             attack: {
//               name: result.stats[1].stat.name,
//               value: result.stats[1].base_stat,
//             },
//             defense: {
//               name: result.stats[2].stat.name,
//               value: result.stats[2].base_stat,
//             },
//             special_attack: {
//               name: result.stats[3].stat.name,
//               value: result.stats[3].base_stat,
//             },
//             special_defense: {
//               name: result.stats[4].stat.name,
//               value: result.stats[4].base_stat,
//             },
//             speed: {
//               name: result.stats[5].stat.name,
//               value: result.stats[5].base_stat,
//             },
//           },
//           types: [
//             { type: { name: result.types[0].type.name } },
//             ...(result.types[1]
//               ? [{ type: { name: result.types[1].type.name } }]
//               : []),
//           ],
//         }))
//     );
//   }

//   Promise.all(fetchPromises).then((results) => {
//     fetchPromises = results;

//     if (typeof localStorage !== "undefined") {
//       try {
//         localStorage.setItem("fetchPromises", JSON.stringify(fetchPromises));
//       } catch (e) {
//         console.log("Available localStorage space is less than 5MB");
//       }
//     } else {
//       console.log("localStorage is not supported in this browser");
//     }
//     loader.style.display = "none";
//     results.slice(0, 20).forEach((pokemon) => {
//       createPokeBlock(pokemon);
//     });
//   });
// }
/* SIN LOCAL STORAGE */
// if (fetchPromises.length == 0) {
//   for (let i = 1; i < 1011; i++) {
//     fetchPromises.push(
//       fetch("https://pokeapi.co/api/v2/pokemon/" + i).then((data) =>
//         data.json()
//       )
//     );
//   }
//   Promise.all(fetchPromises).then((results) => {
//     fetchPromises = results.map((result) => {
//       return Promise.resolve({
//         id: result.id,
//         name: result.name,
//         sprites: {
//           front_shiny: result.sprites.front_shiny,
//           front_default: result.sprites.front_default,
//         },
//         stats: {
//           hp: {
//             name: result.stats[0].stat.name,
//             value: result.stats[0].base_stat,
//           },
//           attack: {
//             name: result.stats[1].stat.name,
//             value: result.stats[1].base_stat,
//           },
//           defense: {
//             name: result.stats[2].stat.name,
//             value: result.stats[2].base_stat,
//           },
//           special_attack: {
//             name: result.stats[3].stat.name,
//             value: result.stats[3].base_stat,
//           },
//           special_defense: {
//             name: result.stats[4].stat.name,
//             value: result.stats[4].base_stat,
//           },
//           speed: {
//             name: result.stats[5].stat.name,
//             value: result.stats[5].base_stat,
//           },
//         },
//         types: [
//           { type: { name: result.types[0].type.name } },
//           ...(result.types[1]
//             ? [{ type: { name: result.types[1].type.name } }]
//             : []),
//         ],
//       });
//     });
//     loader.style.display = "none";
//     results.slice(0, 20).forEach((pokemon) => {
//       createPokeBlock(pokemon);
//     });
//   });
