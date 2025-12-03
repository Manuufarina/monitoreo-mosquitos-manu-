ESTRUCTURA

📂 Carpeta components

CameraFlyTo.tsx
Componente auxiliar que usa la API de Leaflet para hacer map.flyTo.
Se encarga de la animación de zoom/centrado en el mapa.

Header.tsx
Barra superior de la aplicación.
Contiene navegación, título y accesos rápidos.

InicioView.tsx
Vista inicial o pantalla de bienvenida.
Muestra información introductoria antes de entrar al mapa.

MapComponent.tsx
Renderiza el mapa Leaflet.
Maneja pins, trampas, reverse geocoding y vuelos (CameraFlyTo).
Es el núcleo visual del mapa.

ThemeProvider.tsx
Proveedor de tema (dark/light).
Centraliza estilos y configuración de UI.

📂 Subcarpeta mapa-mapa
MapaMapa.tsx
Componente principal de la vista del mapa.
Orquesta todo: renderiza MapComponent, paneles de búsqueda, informes y formularios.
Maneja estados globales (ubicación seleccionada, paneles abiertos, etc.).

📂 Subcarpeta vista-busqueda
SearchBar.tsx
Barra de búsqueda genérica.
Permite ingresar texto para buscar direcciones o datos.

VistaBusqueda.tsx
Vista completa de búsqueda.
Integra SearchBar y resultados.
Se usa fuera del mapa para búsquedas generales.

📂 Subcarpeta vista-complementos
AgregarCalle.tsx
Formulario para agregar nuevas calles al sistema.
Se integra con validación de direcciones.
CambiarPassword.tsx
Formulario para cambiar contraseña de usuario.
CorreoUsuario.tsx
Configuración de correo electrónico del usuario.
CrearUsuario.tsx
Formulario para crear nuevos usuarios.
VistaComplementos.tsx
Vista general de complementos.
Centraliza accesos a los formularios anteriores.

📂 Subcarpeta vista-menu
DataSummary.tsx
Panel de resumen de datos.
Muestra estadísticas rápidas (ej. cantidad de trampas, informes).
MapaMenu.tsx
orquesta la vista del mapa en la vista menu
Permite acceder a opciones adicionales (ej. filtros, configuraciones).

📂 Subcarpeta vista-mapa
MapaMapa.tsx
orquesta la vista del mapa en vista mapa.
BuscarDirecciones.tsx
Panel para buscar direcciones específicas.
Usa Nominatim y valida zonas.
Pide vuelo directo al mapa (onFlyTo).
SidebarInformes.tsx
Panel lateral de informes asociados a trampas.
Permite agregar, editar y eliminar informes.
InformesTrampas.tsx
Formulario modal para crear/editar informes.
BotonReverse.tsx
Botón para activar/desactivar modo reverse geocoding.
LogicaDirecciones.tsx
Funciones auxiliares para búsqueda y validación de direcciones.
Ej: buscarCoordenadas, procesarDireccion.
---------------------------------------------------------------------------------------------------------------
Día 24/11
Revise el SidebarInformes y corregi la sincronización de la dirección (direccionEditable) para que se actualice automáticamente al cambiar de pin azul.
Se eliminaron errores de sintaxis (un } extra antes del return).
Se comenzó a planificar el menú flotante para la descripción.

Día 25/11
Implemente el menú tipo block de notas flotante en SidebarInformes:
Botón Descripción abre un modal centrado en pantalla.
Se agregó textarea editable con botones Guardar y Cancelar.
Se implementó el PATCH a /api/trampas para guardar la descripción en la base.
Ajustamos la UX para que el modal se cierre con click afuera.

Día 26/11
ActualizarProvider:
Se agregó el campo descripcion en cada trampa.
recargarTrampas ahora trae también la descripción desde la base.
Esto permitió que tanto el SidebarInformes como el MapComponent puedan leer la descripción directamente del contexto.

Día 27/11
MapComponent:
Antes usaba ubicacion, ahora se cambió a descripcion.
En los popups de los pins azules y trampas se muestra dirección + descripción.
Se ajustó el title de los markers para incluir dirección y descripción.
Confirme que al guardar una descripción en el menú flotante, se refleja en el mapa.
 
Día 28/11
Ajuste la lógica de sincronización en SidebarInformes:
Se agregó un useEffect para que descripcionEditable se inicialice con el valor guardado en la base (igual que con dirección).
Ahora, al abrir el menú flotante, el textarea ya muestra el texto previamente guardado.
Se verificó que el flujo completo funciona:
Guardar descripción → se almacena en la base.
Seleccionar pin azul → se carga dirección + descripción.
Abrir menú flotante → aparece el texto guardado.
----------------------------------------------------------------------------------------------------------------
Día 29/11
Revise el flujo completo de descripción en la aplicación:
Confirme que el PATCH guarda correctamente la descripción en la base de datos.
Detecte que el SidebarInformes no inicializaba el campo descripcionEditable con el valor guardado, por lo que el block de notas siempre aparecía vacío.
Identifique que el MapComponent seguía usando la propiedad ubicacion en lugar de descripcion, lo que hacía que los popups de los pins mostraran siempre "Sin descripción".
Correcciones aplicadas:
En SidebarInformes se agregó un useEffect para sincronizar descripcionEditable con la prop/trampa seleccionada (selectedTrampa.descripcion).
En MapComponent se reemplazaron todas las referencias a ubicacion por descripcion, tanto en el popup del pin azul como en el renderizado de trampas.
Se verificó que el ActualizarProvider ya expone correctamente el campo descripcion en cada trampa.
Resultado:
Al guardar una descripción (ejemplo: “atrás de la casa en el patio”), esta se almacena en la base y se refleja en:
El block de notas flotante al reabrirlo (ya aparece el texto guardado).
El popup del pin azul en el mapa (dirección + descripción).
El listado de trampas renderizadas en el mapa.

Día 1/12
1. SidebarInformes
Se agregó un menú flotante tipo block de notas para editar la descripción de cada trampa.
El menú se abre al presionar el botón Descripción y permite escribir/guardar texto.
Se implementó un PATCH a /api/trampas para actualizar la descripción en la base de datos.
Se corrigió la sincronización de estados:
direccionEditable ahora se actualiza automáticamente cuando cambia la prop direccion.
Se agregó lógica para que descripcionEditable se inicialice con el valor guardado en la base (cuando se selecciona un pin azul).
2. ActualizarProvider
Se extendió el objeto trampa para incluir el campo descripcion además de direccion, lat, lng y traps.
Ahora recargarTrampas trae también la descripción desde la base y la expone en el contexto.
Esto permite que tanto el SidebarInformes como el MapComponent lean la descripción directamente del provider.
3. MapComponent
Se corrigió el uso de la propiedad: antes se usaba ubicacion, ahora se usa descripcion.
En los pins azules y en los popups de trampas se muestra:
Dirección (address)
Descripción (descripcion), o "Sin descripción" si está vacío.
De esta forma, al guardar una descripción en el menú flotante, se refleja automáticamente en el mapa.
Resultado final
Al guardar una descripción (ejemplo: “atrás de la casa en el patio”), esta se almacena en la base de datos.
Al volver a seleccionar el pin azul y abrir el menú flotante, el texto ya aparece cargado.
En el mapa, cada pin muestra dirección + descripción en el popup.
----------------------------------------------------------------------------------------------------------------
Día 2/12
Se trabajó en errores con el archivo Flyto y el boton reversegeocode,
se le dejó la función flyto únicamente a buscar-direccion, para eso se trabajo con los arrchivos:
BuscarDirecciones.tsx
Le agrege un nuevo callback onFlyTo(lat, lng) para pedir el vuelo directo al mapa.
Ahora, cuando encuentra coordenadas (existentes o nuevas), además de llamar a onLocationSelect, también invoca onFlyTo.
Se simplificó: ya no depende de flags ni de CameraFlyTo dentro del propio componente.
MapComponent.tsx
Fije el center en San Isidro para evitar remounts del mapa cada vez que cambia la selección.
Agregeuna prop flyToRequest que recibe coordenadas desde afuera.
Si flyToRequest tiene valor, se monta CameraFlyTo y el mapa hace el zoom animado.
Mantes toda la lógica de pins, trampas y reverse geocoding igual.
MapaMapa.tsx
Elimine el flag shouldFlyTo.
Cree un estado flyToRequest que se pasa directo a MapComponent.
Conecte BuscarDirecciones:
onLocationSelect actualiza la selección de trampa/ubicación.
onFlyTo setea flyToRequest → el mapa vuela directo.
Todo el CSS y la UI de búsqueda siguen en el panel, no dentro del mapa.