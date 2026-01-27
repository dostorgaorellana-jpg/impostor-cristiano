console.log("JS cargando");
/* =========================
   VARIABLES GLOBALES
========================= */

// Audios
const audioClick = document.getElementById("audio-click");
const audioRevelar = document.getElementById("audio-revelar");
const audioFondo = document.getElementById("audio-fondo");

let fondoIniciado = false;
let fadeInterval = null;

const inputJugadores = document.getElementById("jugadores");

inputJugadores.addEventListener("input", () => {
  let valor = parseInt(inputJugadores.value);

  if (valor > 15) {
    inputJugadores.value = 15;
  }

  if (valor < 1) {
    inputJugadores.value = 1;
  }
});


// Pantallas
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaPasar = document.getElementById("pantalla-pasar");
const pantallaRol = document.getElementById("pantalla-rol");
const pantallaJuego = document.getElementById("pantalla-juego");
const pantallaFin = document.getElementById("pantalla-fin");


// Botones
const btnIniciar = document.getElementById("btn-iniciar");
const btnVerRol = document.getElementById("btn-ver-rol");
const btnSiguiente = document.getElementById("btn-siguiente");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnSi = document.getElementById("btn-si");
const btnNo = document.getElementById("btn-no");


// Inputs y textos
const textoJugador = document.getElementById("texto-jugador");
const palabraTexto = document.getElementById("palabra");
const selectCategoria = document.getElementById("categoria");
const textoVersiculo = document.getElementById("versiculo");


// Roles
const rolNormal = document.getElementById("rol-normal");
const rolImpostor = document.getElementById("rol-impostor");

// Estado del juego
let totalJugadores = 0;
let jugadorActual = 0;
let impostor = null;
let palabra = "";

// Temporizador
const selectTiempo = document.getElementById("tiempoRonda");
const timerTexto = document.getElementById("timer");

let tiempoRestante = 0;
let intervaloTimer = null;

// Anuncio fin de ronda
const anuncioFin = document.getElementById("anuncio-fin");
const anuncioTitulo = document.getElementById("anuncio-titulo");
const anuncioTexto = document.getElementById("anuncio-texto");
const btnAnuncio = document.getElementById("btn-anuncio");


// Palabras bíblicas
const palabrasBiblicas = {
  personajes: [
    "Moisés",
    "Abraham",
    "David",
    "Judas",
    "Pedro",
    "Pablo",
    "María",
    "José",
    "Noé",
    "Juan el Bautista"
  ],
  libros: [
    "Génesis",
    "Éxodo",
    "Levítico",
    "Números",
    "Deuteronomio",
    "Salmos",
    "Proverbios",
    "Cantares",
    "Mateo",
    "Apocalipsis"
  ],
  lugares: [
    "Jerusalén",
    "Belén",
    "Nazaret",
    "Egipto",
    "Babilonia",
    "Monte Sinaí",
    "Jericó",
    "Galilea",
    "Samaria",
    "Caná"
  ]
};

// versiculos 
const versiculos = [
  "Todo tiene su tiempo. — Eclesiastés 3:1",
  "El Señor es mi pastor; nada me faltará. — Salmos 23:1",
  "Todo lo puedo en Cristo que me fortalece. — Filipenses 4:13",
  "El amor todo lo soporta. — 1 Corintios 13:7",
  "Confía en el Señor con todo tu corazón. — Proverbios 3:5",
  "La verdad los hará libres. — Juan 8:32",
  "Dios es amor. — 1 Juan 4:8",
  "Sean fuertes y valientes. — Josué 1:9"
];


/* =========================
   FUNCIONES
========================= */

function reproducirSonido(audio) {
    audio.currentTime = 0; //reiniciar el sonido
    audio.play();
}

function fadeInAudio(audio, duracion = 2500, volumenFinal = 0.3) {
  audio.volume = 0;
  audio.play();

  const pasos = 20;
  const incremento = volumenFinal / pasos;
  const intervalo = duracion / pasos;

  fadeInterval = setInterval(() => {
    if (audio.volume + incremento >= volumenFinal) {
      audio.volume = volumenFinal;
      clearInterval(fadeInterval);
    } else {
      audio.volume += incremento;
    }
  }, intervalo);
}

function fadeOutAudio(audio, duracion = 1200) {
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }

  const pasos = 20;
  const decremento = audio.volume / pasos;
  const intervalo = duracion / pasos;

  fadeInterval = setInterval(() => {
    if (audio.volume - decremento <= 0) {
      audio.volume = 0;
      audio.pause();
      clearInterval(fadeInterval);
    } else {
      audio.volume -= decremento;
    }
  }, intervalo);
}

function fadeCrossAudio(audio, duracion = 2000, volumenFinal = 0.3) {
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }

  const pasos = 20;
  const intervalo = duracion / pasos;
  const decremento = audio.volume / pasos;

  // FADE OUT
  fadeInterval = setInterval(() => {
    if (audio.volume - decremento <= 0) {
      audio.volume = 0;
      clearInterval(fadeInterval);

      // Reiniciar audio
      audio.currentTime = 0;
      audio.play();

      // FADE IN
      const incremento = volumenFinal / pasos;
      fadeInterval = setInterval(() => {
        if (audio.volume + incremento >= volumenFinal) {
          audio.volume = volumenFinal;
          clearInterval(fadeInterval);
        } else {
          audio.volume += incremento;
        }
      }, intervalo);

    } else {
      audio.volume -= decremento;
    }
  }, intervalo);
}

function mostrarAnuncio(titulo, mensaje) {
  anuncioTitulo.textContent = titulo;
  anuncioTexto.textContent = mensaje;
  anuncioFin.classList.remove("oculto");
}



// Cambiar de pantalla
function mostrarPantalla(pantalla) {
  document.querySelectorAll(".pantalla").forEach(p => {
    p.classList.remove("activa");
  });
  pantalla.classList.add("activa");
}

// Iniciar juego
function iniciarJuego() {
  totalJugadores = Number(inputJugadores.value);

  if (totalJugadores < 3) {
    alert("Debe haber al menos 3 jugadores");
    return;
  }

  // Elegir palabra y impostor
let categoriaElegida = "personajes";// valorpor defecto
if (selectCategoria) {
    categoriaElegida = selectCategoria.value;
}

const listaPalabras = palabrasBiblicas[categoriaElegida];

palabra = listaPalabras[Math.floor(Math.random() * listaPalabras.length)];
impostor = Math.floor(Math.random() * totalJugadores);

  jugadorActual = 0;
  textoJugador.textContent = `Jugador ${jugadorActual + 1}`;

  mostrarPantalla(pantallaPasar);
}

// Mostrar rol del jugador actual
function verRol() { 
  pantallaRol.classList.remove("pantalla-rol-animada");
  void pantallaRol.offsetWidth;
  pantallaRol.classList.add("pantalla-rol-animada");

  mostrarPantalla(pantallaRol);

  rolNormal.classList.add("oculto");
  rolImpostor.classList.add("oculto");

  // 🔊 SONIDO PARA TODOS
  setTimeout(() => {
    reproducirSonido(audioRevelar);
  }, 150);

  if (jugadorActual === impostor) {
    rolImpostor.classList.remove("oculto");
  } else {
    palabraTexto.textContent = palabra;
    palabraTexto.classList.remove("revelada");

    setTimeout(() => {
      palabraTexto.classList.add("revelada");
    }, 150);

    rolNormal.classList.remove("oculto");
  }

  mostrarPantalla(pantallaRol);
}

// Pasar al siguiente jugador
function siguienteJugador() {
  jugadorActual++;

  if (jugadorActual < totalJugadores) {
    textoJugador.textContent = `Jugador ${jugadorActual + 1}`;
    mostrarPantalla(pantallaPasar);
  } else {
    mostrarPantalla(pantallaJuego);
    iniciarTemporizador(); // ⏱️ AQUÍ EMPIEZA LA RONDA
  }
}

// Reiniciar todo
function reiniciarJuego() {
  inputJugadores.value = "";

  clearInterval(intervaloTimer);

 fadeCrossAudio(audioFondo, 2000, 0.1);
  fondoIniciado = false; // permite que vuelva a activarse

  mostrarVersiculoAleatorio();
  mostrarPantalla(pantallaInicio);
}

function iniciarTemporizador() {
  tiempoRestante = parseInt(selectTiempo.value);
  timerTexto.textContent = tiempoRestante;
  timerTexto.classList.remove("alerta");

  clearInterval(intervaloTimer);

  intervaloTimer = setInterval(() => {
    tiempoRestante--;
    timerTexto.textContent = tiempoRestante;

    if (tiempoRestante <= 10) {
      timerTexto.classList.add("alerta");
    }

    if (tiempoRestante <= 0) {
      clearInterval(intervaloTimer);
      finDeRonda();
    }
  }, 1000);
}

function finDeRonda() {
  timerTexto.textContent = "¡Tiempo!";

  if (navigator.vibrate) {
    navigator.vibrate(300);
  }

  // pequeño delay para que se note el final
  setTimeout(() => {
    mostrarPantalla(pantallaFin);
  }, 800);
}


  // versiculos
function mostrarVersiculoAleatorio() {
  if (!textoVersiculo) return;

  const indice = Math.floor(Math.random() * versiculos.length);
  textoVersiculo.textContent = versiculos[indice];

  // reinicia animación
  textoVersiculo.style.animation = "none";
  textoVersiculo.offsetHeight;
  textoVersiculo.style.animation = "";
}


/* =========================
   EVENTOS
========================= */

btnIniciar.addEventListener("click", () => {
    reproducirSonido(audioClick);

     // iniciar música de fondo

    iniciarJuego();
});
btnVerRol.addEventListener("click", () => {
    reproducirSonido(audioClick);
    verRol();
});
btnSiguiente.addEventListener("click", () => {
    reproducirSonido(audioClick);
    siguienteJugador();
});
btnReiniciar.addEventListener("click", () => {
    reproducirSonido(audioClick);
    reiniciarJuego();
});
inputJugadores.addEventListener("input", () => {
  if (!fondoIniciado) {
    fadeInAudio(audioFondo);
    fondoIniciado = true;
  }
});
mostrarVersiculoAleatorio();
btnSi.addEventListener("click", () => {
  reproducirSonido(audioClick);
  mostrarAnuncio(
    "🎉 ¡Leluyaaaaaaaaaa!",
    "El incircunsiso fue descubierto."
  );
});

btnNo.addEventListener("click", () => {
  reproducirSonido(audioClick);
  mostrarAnuncio(
    "Noooooo",
    "El diablo es puerco hermano."
  );
});
btnAnuncio.addEventListener("click", () => {
  reproducirSonido(audioClick);
  anuncioFin.classList.add("oculto");
  reiniciarJuego();
});

/* =========================
   CONTROL AUDIO EN MÓVIL
========================= */

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // La app ya NO está visible
    if (!audioFondo.paused) {
      audioFondo.pause();
    }
  }
});



