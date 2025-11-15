# Boom - Aplicación Web de Grabación y Edición de Video

Una poderosa aplicación web para grabar, editar y gestionar videos con características avanzadas como controles de calidad, recorte, división y unión de videos.

## Características

### 🎥 Grabación Avanzada
- Grabación de pantalla con configuraciones de calidad personalizables
- Opción de grabación de cámara web
- Grabación combinada de pantalla + cámara web
- Grabación de audio (sistema + micrófono)
- Controles de calidad:
  - Selección de resolución (4K, 1440p, 1080p, 720p, 480p)
  - Opciones de velocidad de fotogramas (60fps, 30fps, 24fps, 15fps)
  - Control de bitrate para gestión del tamaño de archivo
- Vista previa de grabación en tiempo real
- Funcionalidad de pausa/reanudar
- Temporizador de grabación e indicador de tamaño de archivo

### ✂️ Edición de Video
- **Recortar**: Corta videos a puntos de inicio y fin específicos
- **Dividir**: Divide videos en múltiples segmentos en marcas de tiempo personalizadas
- **Unir**: Combina múltiples videos en uno solo sin interrupciones

### 📹 Gestión de Videos
- Panel de biblioteca de videos
- Metadatos de video (título, fecha, duración, tamaño, calidad)
- Reproducción de video con controles personalizados
- Descargar videos
- Eliminar videos
- Almacenamiento local usando IndexedDB

### 🎨 Interfaz Moderna
- Diseño limpio y responsivo
- Soporte para modo oscuro
- Animaciones y transiciones suaves
- Controles intuitivos

## Stack Tecnológico

- **React** - Framework de UI
- **React Router** - Navegación
- **Vite** - Herramienta de construcción
- **MediaRecorder API** - Grabación de pantalla/video
- **FFmpeg.wasm** - Edición de video (recortar, dividir, unir)
- **IndexedDB** - Almacenamiento local de videos
- **CSS Variables** - Tematización

## Comenzando

### Requisitos Previos
- Node.js 16+ y npm

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd boom
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador y navega a `http://localhost:3000`

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist`.

## Uso

### Grabar un Video

1. Haz clic en "Iniciar Grabación" en la página principal
2. Ajusta la configuración de calidad si es necesario (resolución, velocidad de fotogramas, bitrate)
3. Elige qué grabar (pantalla, cámara web, audio)
4. Haz clic en "Iniciar Grabación" y permite los permisos del navegador
5. Usa los controles de pausa/reanudar durante la grabación
6. Haz clic en "Detener y Guardar" cuando termines

### Editar Videos

#### Recortar
1. Abre un video de tu biblioteca
2. Haz clic en el botón "Editar"
3. Selecciona la pestaña "Recortar"
4. Establece los puntos de inicio y fin usando los deslizadores o los botones "Establecer Actual"
5. Previsualiza la sección recortada
6. Haz clic en "Recortar Video" para guardar

#### Dividir
1. Abre un video y haz clic en "Editar"
2. Selecciona la pestaña "Dividir"
3. Reproduce el video y haz clic en "Agregar Punto de División" en las marcas de tiempo deseadas
4. Revisa los segmentos resultantes
5. Haz clic en "Dividir Video" para crear archivos separados

#### Unir
1. Abre cualquier video y haz clic en "Editar"
2. Selecciona la pestaña "Unir"
3. Selecciona múltiples videos de tu biblioteca
4. Reordénalos usando las flechas arriba/abajo
5. Haz clic en "Unir Videos" para combinarlos

## Compatibilidad de Navegadores

- Chrome 87+
- Firefox 94+
- Edge 87+
- Safari 14.1+ (soporte limitado)

**Nota**: La grabación de pantalla requiere HTTPS o localhost.

## Características en Detalle

### Configuración de Calidad

- **Resolución**: Elige desde 4K hasta 480p
- **Velocidad de Fotogramas**: 60fps para movimiento suave, o menor para archivos más pequeños
- **Bitrate**: Controla el equilibrio entre tamaño de archivo y calidad

### Almacenamiento de Videos

Los videos se almacenan localmente en tu navegador usando IndexedDB. No se envían datos a ningún servidor.

### FFmpeg.wasm

Las características de edición de video usan FFmpeg.wasm, que se ejecuta completamente en tu navegador. La primera vez que uses una función de edición, FFmpeg se descargará (~30MB).

## Limitaciones

- La edición de video requiere navegadores modernos con soporte para WebAssembly
- Los videos grandes pueden tardar en procesarse
- El almacenamiento está limitado por la cuota de IndexedDB del navegador
- Se requiere la descarga de FFmpeg.wasm para las funciones de edición

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, siéntete libre de enviar un Pull Request.

## Licencia

Licencia MIT - siéntete libre de usar este proyecto para propósitos personales o comerciales.

## Agradecimientos

- FFmpeg.wasm por las capacidades de procesamiento de video
- MediaRecorder API por la funcionalidad de grabación
- Comunidad de React por excelentes herramientas y bibliotecas
