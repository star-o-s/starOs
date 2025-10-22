let contador = 0;

// Nuevo objeto para rastrear las ventanas abiertas por su nombre
const ventanasAbiertas = {}; 






// -----------------------------------------------------
// FUNCIÓN PARA OBTENER EL CONTENIDO DE LA VENTANA
// -----------------------------------------------------
function obtenerContenido(nombre) {
  if (nombre === 'Navegador') {
	const paginaLocal = 'star website/home.html';
    return `
      <div class="browser">
        <iframe class="browser-frame" src="${paginaLocal}"></iframe>
          <input type="text" class="address-antenna" placeholder="https://example.com" value="https://example.com">
      </div>
    `;
  } else if (nombre === 'Terminal') {
    // **CONTENIDO PARA XTERM.JS**
    return `<div id="terminal-container-${contador}" class="terminal-container"></div>`;
  } else if (nombre === 'Reproductor') {
      // **CONTENIDO PARA EL REPRODUCTOR DE MÚSICA**
      return `
        <div class="player-container">
          <audio id="audio-player-${contador}" src="" preload="auto"></audio>
          <div class="song-info">
            <h3 id="player-artista-${contador}"></h3>
            <h2 id="player-titulo-${contador}"></h2>
          </div>
          
          <div class="controls-area">
            <button class="player-prev-btn" data-ventana-id="${contador}"><img src="apps/reproductor/anterior.png" width="32px"></button>
            <div class="play-circle-outer">
              <div id="player-play-btn-${contador}" class="play-circle-inner">
                <span class="play-icon"><img src="apps/reproductor/play.png" width="32px"></span>
                <span class="pause-icon" style="display:none;"><img src="apps/reproductor/pausa.png" width="32px"></span>
              </div>
            </div>
            <button class="player-next-btn" data-ventana-id="${contador}"><img src="apps/reproductor/siguiente.png" width="32px"></button>
          </div>
          
          <div class="progress-antenna-container">
            <input type="range" min="0" max="100" value="0" class="progress-antenna" id="player-progress-${contador}">
          </div>
        </div>
      `;
  }
  // Para otras ventanas, retorna el contenido por defecto
  return `<p>Ventana de ${nombre}</p>`;
}

// -----------------------------------------------------
// FUNCIÓN: Obtener la posición central de un elemento
// -----------------------------------------------------
function getElementCenterCoords(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2, // Posición central X
        y: rect.top + rect.height / 2  // Posición central Y
    };
}

// -----------------------------------------------------
// FUNCIÓN: Obtener dimensiones finales del CSS
// -----------------------------------------------------
function getFinalWindowDimensions(nombre) {
    // Usamos un elemento temporal para leer el ancho y alto final del CSS
    const tempDiv = document.createElement('div');
    // Le añadimos la clase base y la clase específica (e.g., 'ventana-terminal')
    tempDiv.classList.add('ventana', 'ventana-' + nombre.toLowerCase());
    tempDiv.style.visibility = 'hidden'; // Ocultarlo
    tempDiv.style.position = 'absolute'; // Evitar que afecte el layout
    document.body.appendChild(tempDiv);
    
    // Obtenemos los estilos calculados por el navegador
    const styles = window.getComputedStyle(tempDiv);
    const width = styles.width;
    const height = styles.height;

    document.body.removeChild(tempDiv);
    return { width, height };
}


// -----------------------------------------------------
// FUNCIÓN PRINCIPAL DE APERTURA
// -----------------------------------------------------
function abrirVentana(nombre) {
  // LÓGICA DE CIERRE SI YA ESTÁ ABIERTA
  if (ventanasAbiertas[nombre]) {
      const ventanaExistente = ventanasAbiertas[nombre];
      const iconoElement = document.querySelector(`#antenna .icon img[alt="${nombre}"]`)?.parentElement;
      cerrarVentana(ventanaExistente, iconoElement);
      return; 
  }
  
  // OBTENER COORDENADAS DEL ÍCONO Y DE LA POSICIÓN FINAL
  const iconoElement = document.querySelector(`#antenna .icon img[alt="${nombre}"]`)?.parentElement;
  if (!iconoElement) {
      console.error(`Ícono no encontrado para: ${nombre}. Asegúrate que alt="${nombre}" existe en index.html.`);
      return;
  }
  const antennaCenter = getElementCenterCoords(iconoElement);

  // 1. Obtener las dimensiones finales desde el CSS
  const finalDimensions = getFinalWindowDimensions(nombre);

  // 2. Definir la posición final: top 25px, left 50% (centrado)
  const finalTop = '50%'; 
  const finalLeft = '50%'; 

    
  const ventana = document.createElement('div');
  ventana.classList.add('ventana');
  
  // AÑADIR CLASE ESPECÍFICA PARA DECORACIÓN Y TAMAÑO
  const claseNombre = 'ventana-' + nombre.toLowerCase(); 
  ventana.classList.add(claseNombre);
  
  ventana.dataset.nombre = nombre;

  // 3. ESTABLECER VARIABLES CSS PARA LA ANIMACIÓN
  ventana.style.setProperty('--start-x', `${antennaCenter.x}px`);
  ventana.style.setProperty('--start-y', `${antennaCenter.y}px`);
  
  // Usamos '50%' y '25px' en las variables CSS
  ventana.style.setProperty('--end-x', `${finalLeft}`); 
  ventana.style.setProperty('--end-y', `${finalTop}`); 

  // Dimensiones finales de la ventana
  ventana.style.setProperty('--final-width', finalDimensions.width);
  ventana.style.setProperty('--final-height', finalDimensions.height);
  

  const terminalContainerId = `terminal-container-${contador}`;
  const audioPlayerId = `audio-player-${contador}`;

  const contenidoHTML = obtenerContenido(nombre); 

  ventana.innerHTML = `
 <div class="contenido">
  	
      ${contenidoHTML}
    </div>
  `;
  document.getElementById('ventanas').appendChild(ventana);

  // 4. INICIAR LA ANIMACIÓN (APERTURA)
  ventana.classList.add('ventana-opening');
  
  // ------------------------------------------------------------------
  // AÑADIR LÓGICA ESPECÍFICA DEL NAVEGADOR
  // ------------------------------------------------------------------
  if (nombre === 'Navegador') {
    const addressBar = ventana.querySelector('.address-antenna');
    const frame = ventana.querySelector('.browser-frame');

    addressBar.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        let url = addressBar.value;
        if (!url.startsWith('http')) url = 'https://' + url;
        frame.src = url;
        e.preventDefault(); 
      }
    });
  } 
  
  // ------------------------------------------------------------------
  // LÓGICA ESPECÍFICA DE LA TERMINAL CON XTERM.JS
  // ------------------------------------------------------------------
  if (nombre === 'Terminal') {
    const terminalElement = document.getElementById(terminalContainerId);
    
    const term = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
	  fontSize: 14,
		fontFamily: '"Courier New", monospace',
      theme: { foreground: '#0AD2FF', cursor: '#FFC683' },
		wordWrap: true,
    });
    term.open(terminalElement);
    
    let currentLine = '';
	const prompt = 'starOs: ';
    term.write(prompt);

    term.onData(e => {
      const char = e;
      
      if (char === '\r') { // Tecla Enter
        term.write('\r\n');
        
        const command = currentLine.trim();
        if (command === 'clear') {
          term.clear();
        } else if (command === 'help') {
          term.write('Comandos disponibles:\r\n');
          term.write('- help: Muestra esta ayuda.\r\n');
          term.write('- clear: Limpia la pantalla.\r\n');
          term.write('- echo <texto>: Repite el texto.\r\n');
          term.write('- exit: Cierra la ventana.\r\n'); 
        } else if (command === 'exit') {
            const iconoElement = document.querySelector(`#antenna .icon img[alt="${nombre}"]`)?.parentElement;
            cerrarVentana(ventana, iconoElement);
            return;
        } else if (command.startsWith('echo ')) {
          const text = command.substring(5);
          term.write(text + '\r\n');
        } else if (command !== '') {
          term.write(`bash: ${command}: command not found\r\n`);
        }
        
        currentLine = ''; 
        term.write(prompt); 
        
      } else if (char === '\x7F') { // Tecla Backspace
        if (currentLine.length > 0) {
          term.write('\b \b'); 
          currentLine = currentLine.substring(0, currentLine.length - 1);
        }
        
      } else if (char.length === 1) { // Cualquier otro carácter
        term.write(char);
        currentLine += char;
      }
    });
  }
  
 
  
  // --------------------------------------------------------
  // AÑADIR la ventana al rastreador de abiertas
  // --------------------------------------------------------
  ventanasAbiertas[nombre] = ventana;
  
  contador++; 
}

// -----------------------------------------------------
// FUNCIÓN PRINCIPAL DE CIERRE
// -----------------------------------------------------
function cerrarVentana(ventanaElement, iconoElement = null) {
  const nombreVentana = ventanaElement.dataset.nombre; 

  // 1. Eliminar del rastreador INMEDIATAMENTE
  if (nombreVentana && ventanasAbiertas[nombreVentana]) {
    delete ventanasAbiertas[nombreVentana];
  }
  
  // 2. Detener y liberar recursos si es un reproductor
  if (nombreVentana === 'Reproductor') {
    const audio = ventanaElement.querySelector('audio');
    if (audio) {
        audio.pause();
        audio.src = ''; 
    }
  }
  
  // 3. ESTABLECER VARIABLES CSS PARA EL CIERRE (si no se pasaron, se buscan)
  if (!iconoElement) {
      // Intentamos encontrar el ícono basado en el nombre de la ventana
      iconoElement = document.querySelector(`#antenna .icon img[alt="${nombreVentana}"]`)?.parentElement;
  }
  
  if (iconoElement) {
      const antennaCenter = getElementCenterCoords(iconoElement);
      // 'start-x/y' es el punto final del cierre (el Dock)
      ventanaElement.style.setProperty('--start-x', `${antennaCenter.x}px`);
      ventanaElement.style.setProperty('--start-y', `${antennaCenter.y}px`);
  }
  
  // 4. Añadir la clase de cierre para la animación
  ventanaElement.classList.add('ventana-closing');
  
  // 5. Eliminar el elemento del DOM solo después de que la animación termine (350ms)
  setTimeout(() => {
      ventanaElement.remove();
  }, 350); 
}

// =======================================================
// LÓGICA DE CIERRE DE TODAS LAS VENTANAS POR DOBLE CLIC
// =======================================================

// -----------------------------------------------------
// FUNCIÓN PARA CERRAR TODAS LAS VENTANAS
// -----------------------------------------------------
function ocultarTodasLasVentanas() {
    // 1. Obtener una lista ESTÁTICA de los nombres de las ventanas abiertas.
    // Esto es crucial para iterar de forma segura mientras 'cerrarVentana' modifica 'ventanasAbiertas'.
    const nombresAbiertos = Object.keys(ventanasAbiertas);

    // 2. Iterar sobre la lista estática
    for (const nombre of nombresAbiertos) {
        // Obtenemos la referencia al elemento de la ventana
        const ventanaElement = ventanasAbiertas[nombre];
        
        if (ventanaElement) {
            // Buscamos el ícono correspondiente para la animación al Dock (si existe)
            const iconoElement = document.querySelector(`#antenna .icon img[alt="${nombre}"]`)?.parentElement;
            
            // Llamamos a tu función de cierre
            // 'cerrarVentana' se encargará de eliminar la entrada de ventanasAbiertas
            cerrarVentana(ventanaElement, iconoElement);
        }
    }
}

// -----------------------------------------------------
// EVENTO DOBLE CLIC EN EL ESCRITORIO
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos el contenedor principal que representa el escritorio
    const desktop = document.getElementById('desktop'); 
    
    // Asignamos el evento dblclick al contenedor principal.
    desktop.addEventListener('dblclick', (e) => {
        // Ejecutamos la función solo si el elemento clicado (e.target) es:
        // 1. El propio elemento con id="desktop" (el fondo vacío).
        // 2. O el body (por si el evento se propaga hasta el fondo más absoluto).
        if (e.target.id === 'desktop' || e.target.tagName === 'BODY') {
            ocultarTodasLasVentanas();
        }
    });
});