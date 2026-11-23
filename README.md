# IPA CENTER

Proyecto local para inspeccionar paquetes IPA y APK.

## Requisitos
- Windows 10/11
- Node.js LTS y npm
- Conexión a Internet la primera vez para descargar dependencias

## Iniciar
1. Extrae el ZIP completo.
2. Ejecuta `startergui.bat`.
3. El script instala dependencias si faltan, inicia Vite y abre `http://localhost:5173` en el navegador predeterminado (si quieres Chrome, configúralo como navegador predeterminado).

## Móvil
La interfaz es responsive para iPhone y Android. Para abrirla desde un móvil en la misma Wi-Fi, ejecuta el proyecto en el PC y visita `http://IP-LOCAL-DEL-PC:5173`. Esto es HTTP local, no HTTPS público. No publiques el servidor directamente en Internet.

## Límites importantes
- El navegador no puede instalar IPA/APK por sí solo.
- La web no firma aplicaciones, no elimina protecciones, no evade controles de Apple/Google.
- El análisis ZIP es orientativo y no es un antivirus ni una verificación criptográfica.
- IPA: intenta leer `Payload/*.app/Info.plist` cuando está en XML. Los plists binarios no se decodifican en esta versión.
- APK: lista el contenido; no interpreta el manifiesto Android binario.
- Los archivos se procesan localmente en la pestaña; no se envían a un backend propio.
