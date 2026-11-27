// link de la api
const URL_API = "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=100";

// lista datos 100n pokemon
let todosLosPokemon = [];

// elementos
const barraBusqueda = document.getElementById("barra-busqueda");
const mensaje = document.getElementById("mensaje");
const listaPokemon = document.getElementById("lista-pokemon");
const ventanaDetalles = document.getElementById("ventana-detalles");
const contenidoDetalles = document.getElementById("contenido-detalles");
const botonCerrar = document.getElementById("boton-cerrar");


/*
  consultado de una IA ૮ ˶ᵔ ᵕ ᵔ˶ ა
  - Consultar una API toma tiempo (viaja por internet).
  - Una función "async" puede esperar ese tiempo sin congelar la página.
  - "await" significa: "espera aquí hasta que llegue la respuesta y
    después continúa con la siguiente línea".
  - Solo se puede usar "await" dentro de una función "async".
*/

// coonsulta
async function obtenerDatosDePokemon(urlPokemon) {
  const respuesta = await fetch(urlPokemon);

  // si la api responde con un error lanza este msj
  if (!respuesta.ok) {
    throw new Error("No se pudo consultar un Pokémon");
  }

  return await respuesta.json(); // convierte la respuesta a un objeto de js
}

// consulta la lista de 100 pokemones y luego los datos de cada uno
async function cargarPokemon() {
  mensaje.textContent = "Cargando pokemon...";

  try {
    // consulta la lista de nombres y enlaces
    const respuestaLista = await fetch(URL_API);

    if (!respuestaLista.ok) {
      throw new Error("No se pudo consultar la lista");
    }

    const datosLista = await respuestaLista.json();

    // prepara la consulta x pokemon de la list
    const consultas = datosLista.results.map(function (pokemon) {
      return obtenerDatosDePokemon(pokemon.url);
    });

    // promise.all espera a que terminen las 100 consultas
    todosLosPokemon = await Promise.all(consultas);

    // si todo sale ok quita el mensaje y muestra las tarjetas
    mensaje.textContent = "";
    mostrarLista(todosLosPokemon);

  } catch (error) {
    // si algo falló en cualquier paso se muestra este mensaje
    mensaje.textContent = "Ocurrió un error al consultar la API. Intenta de nuevo más tarde.";
  }
}

// convierte los tipos del pokemon en un texto
function obtenerTipos(pokemon) {
  const nombresDeTipos = pokemon.types.map(function (tipo) {
    return tipo.type.name;
  });
  return nombresDeTipos.join(", ");
}

// convierte las habilidades del pokemon en un texto
function obtenerHabilidades(pokemon) {
  const nombresDeHabilidades = pokemon.abilities.map(function (habilidad) {
    return habilidad.ability.name;
  });
  return nombresDeHabilidades.join(", ");
}

// 
function crearImagen(pokemon) {
  const urlImagen = pokemon.sprites.front_default;

  if (urlImagen) {
    return `<img src="${urlImagen}" alt="${pokemon.name}">`;
  }
  return "<p>Sin imagen</p>";
}

// tarjeta x cada pokemon de la lista
function mostrarLista(listaDePokemon) {
  listaPokemon.innerHTML = ""; // quita las tarjetas anteriores

  listaDePokemon.forEach(function (pokemon) {
    const tarjeta = document.createElement("button");
    tarjeta.className = "tarjeta";

    tarjeta.innerHTML = `
      ${crearImagen(pokemon)}
      <p><strong>${pokemon.name}</strong></p>
      <p>N.º ${pokemon.id}</p>
      <p>Tipo: ${obtenerTipos(pokemon)}</p>
    `;

    // al hacer clic en la tarjeta se abren los detalles
    tarjeta.addEventListener("click", function () {
      mostrarDetalles(pokemon);
    });

    listaPokemon.appendChild(tarjeta);
  });
}

// Muestra la ventana con los detalles del pokemon seleccionado
function mostrarDetalles(pokemon) {
  // La api da la altura en decímetros y el peso en hectogramos.

  // Dividimos entre 10 para mostrarlos en metros y kilogramos.
  const alturaEnMetros = pokemon.height / 10;
  const pesoEnKilogramos = pokemon.weight / 10;

  contenidoDetalles.innerHTML = `
    <h2>${pokemon.name}</h2>
    ${crearImagen(pokemon)}
    <p>N.º de Pokédex: ${pokemon.id}</p>
    <p>Altura: ${alturaEnMetros} m</p>
    <p>Peso: ${pesoEnKilogramos} kg</p>
    <p>Tipos: ${obtenerTipos(pokemon)}</p>
    <p>Habilidades: ${obtenerHabilidades(pokemon)}</p>
  `;

  ventanaDetalles.showModal(); // abre la ventana
}

// Filtra los pokemon según segun lo que ponen en la search bar
function buscarPokemon() {
  const textoBuscado = barraBusqueda.value.toLowerCase().trim();

  const resultados = todosLosPokemon.filter(function (pokemon) {
    return pokemon.name.includes(textoBuscado);
  });

  if (resultados.length === 0) {
    listaPokemon.innerHTML = "";
    mensaje.textContent = "No se encontraron Pokémon con ese nombre.";
  } else {
    mensaje.textContent = "";
    mostrarLista(resultados);
  }
}

// cada vez qe se escribe en la barra, se vuelve a buscar
barraBusqueda.addEventListener("input", buscarPokemon);

// botón para cerrar la ventana de detalles
botonCerrar.addEventListener("click", function () {
  ventanaDetalles.close();
});

// al abrir la página se cargan los pokemones
cargarPokemon();