const main: HTMLElement | null = document.querySelector("main");
const typesP = document.querySelectorAll(".type");

for (let i = 1; i < 20; i++) {
fetch("https://pokeapi.co/api/v2/pokemon/" + i)
  .then((data) => data.json())
  .then((pokemon) => {
      createPokeBlock(pokemon);
  });
}
function createPokeBlock(pokemon:any) {
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

  main?.appendChild(pokeBlock);

}

/* CONSOLE LOGS PARA FETCH */
// console.log(pokemon);
// console.log(pokemon.id);
// console.log(pokemon.name);
// console.log(pokemon.sprites.front_default);
// console.log(pokemon.types[0].type.url);
// console.log(pokemon.types[1].type.url);
