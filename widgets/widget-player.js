const WIDGET_SONGS = [
    // Nota: Es mejor definir las canciones en un solo lugar (e.g., main.js)
    // Pero por simplicidad, las repetiremos aquí para el widget.
    { artista: "Thirty Seconds To Mars", titulo: "The Kill", archivo: "widgets/songs/30 Seconds to Mars - The Kill.wav" },
    { artista: "Daft Punk", titulo: "Get Lucky", archivo: "widgets/songs/Daft Punk - Get Lucky feat. Pharrell Williams and Nile Rodgers.wav" },
    { artista: "Gorillaz", titulo: "Feel Good Inc.", archivo: "widgets/songs/Gorillaz - Feel Good Inc.wav" },
	
	// Agrega una tercera canción si deseas probar el 'next'
    // { artista: "Artista 3", titulo: "Canción 3", archivo: "ruta/a/cancion3.wav" } 
];

function crearReproductorWidget() {
    let currentSongIndex = 0;
    let isPlaying = false;

    // Crear el elemento HTML del widget
    const widget = document.createElement('div');
    widget.classList.add('widget-player');
    widget.innerHTML = `
        <audio id="widget-audio-player" src="" preload="auto"></audio>
        <h3 id="widget-titulo-nombre"></h3>
        <h4 id="widget-artista-nombre"></h4>
        <div class="widget-controls">
            <button class="widget-prev-btn" style="display:;"><img src="widgets/icons/anterior.png" width="20px"></button>
            <button class="widget-play-btn">
                <img id="widget-play-icon" src="widgets/icons/play.png" alt="Play">
                <img id="widget-pause-icon" src="widgets/icons/pausa.png" alt="Pause" style="display:none;">
            </button>
            <button class="widget-next-btn"><img src="widgets/icons/siguiente.png" width="20px"></button>
        </div>
    `;

    // Obtener elementos DOM
    const audio = widget.querySelector('#widget-audio-player');
    const playBtn = widget.querySelector('.widget-play-btn');
    const nextBtn = widget.querySelector('.widget-next-btn');
    const prevBtn = widget.querySelector('.widget-prev-btn'); // Aunque oculto, se puede usar
    const playIcon = widget.querySelector('#widget-play-icon');
    const pauseIcon = widget.querySelector('#widget-pause-icon');
    const artistaH = widget.querySelector('#widget-artista-nombre');
    const tituloH = widget.querySelector('#widget-titulo-nombre');

    // Cargar información y archivo de la canción
    function loadSong(index) {
        const song = WIDGET_SONGS[index];
        audio.src = song.archivo;
        artistaH.textContent = song.artista;
        tituloH.textContent = song.titulo;
        // La precarga ('preload="auto"') debería manejar el 'load()'
    }

    // Toggle Play/Pause
    function togglePlayPause() {
        if (isPlaying) {
            audio.pause();
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        } else {
            // Se debe usar .play() dentro de un evento de usuario
            const playPromise = audio.play();
            // Manejar la Promesa de reproducción para evitar errores
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'inline';
                }).catch(error => {
                    console.warn("La reproducción fue interrumpida o falló:", error);
                    // Mostrar ícono de play si no se pudo reproducir
                    playIcon.style.display = 'inline';
                    pauseIcon.style.display = 'none';
                });
            } else {
                 playIcon.style.display = 'none';
                 pauseIcon.style.display = 'inline';
            }
        }
        isPlaying = !isPlaying;
    }

    // Saltar a la siguiente canción
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % WIDGET_SONGS.length;
        loadSong(currentSongIndex);
        // Intentar reproducir si ya estaba sonando
        if (isPlaying) {
            audio.play();
        } else {
            // Si no estaba sonando, cargar la canción y mantener en pausa
            audio.pause(); 
            // Asegurar que el ícono sea 'Play'
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }
    
    // Saltara la cancion anterior (opcional)
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + WIDGET_SONGS.length) % WIDGET_SONGS.length;
        loadSong(currentSongIndex);
        if (isPlaying) {
            audio.play();
        } else {
            audio.pause();
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }


    // Event Listeners
    playBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    
    // Auto-reproducir la siguiente canción al terminar
    audio.addEventListener('ended', nextSong);
    
    // Iniciar el widget cargando la primera canción
    loadSong(currentSongIndex);
    
    return widget;
}

// Lógica de `widgets.js` para iniciar el widget
function iniciarWidgets() {
    const widgetsContainer = document.getElementById('widgets-container');
    if (widgetsContainer) {
        widgetsContainer.appendChild(crearReproductorWidget());
    } else {
        console.error("Contenedor de widgets (#widgets-container) no encontrado.");
    }
}

// Ejecutar la función de inicio al cargar el script
iniciarWidgets();