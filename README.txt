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
----------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------



resumen de estos ~2 meses:
Refactor de modales y lógica de direcciones.
Validación estricta de datos.
Sincronización instantánea con backend.
Arquitectura modular pensada para escalar.



----------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------
Día 3/12
Problema inicial
El pin azul del mapa se podía arrastrar, pero la nueva posición no se guardaba en la base.
El PATCH nunca encontraba la trampa porque el id llegaba como undefined o 0.
Diagnóstico
MapComponent estaba enviando id=0 cuando se creaba un pin temporal.
SidebarInformes dependía de selectedLocation.id, pero ese valor no se estaba guardando en el estado.
MapaMapa armaba selectedLocation sin incluir el id real de la trampa.
El route.ts estaba correcto: esperaba { id, nuevaLat, nuevaLng }.
Cambios que hicimos
MapComponent
En el dragend ahora guarda la posición solo si hay un id válido.
Se eliminó el uso de id=0 al crear pins temporales.
MapaMapa
selectedLocation ahora incluye siempre el id de la trampa seleccionada.
En el buscador (BuscarDirecciones) ya no se pasa id=0 para nuevas ubicaciones.
SidebarInformes
Confirmamos que recibe trampaId desde selectedTrampa.id y lo usa en los PATCH de dirección/ubicación.
El botón de Modificar posición del pin activa el modo edición y el mapa guarda correctamente.
Flujo completo revisado
Sidebar activa modo edición → MapComponent permite arrastrar → dragend dispara PATCH con id válido → route actualiza base → Page refresca trampas/informes.
Resultado
El pin azul ahora se mueve y guarda la nueva posición en la base sin errores.
El flujo quedó modular pero sólido: cada archivo cumple su rol y se comunica bien.
En pocas palabras: el bug era que el id no llegaba al mapa, lo corregimos pasando siempre el id real desde MapaMapa y evitando id=0.
----------------------------------------------------------------------------------------------------------------
Día 4/12
Autocompletado en BuscarDirecciones.tsx
Antes aparecían las calles con altura (ej: Avenida Fondo de la Legua 240).
Lo ajuste para que en el autocompletado se muestre solo el nombre de la calle, sin la altura.
Además, transforme las sugerencias a mayúsculas con .toUpperCase().
SidebarInformes.tsx
En la sección de dirección, cuando no estás editando, ahora se muestra la dirección en mayúsculas.
El input de edición sigue mostrando el texto tal cual lo escribís, para que no moleste al tipear.
MapComponent.tsx
En los popups de los pins (azul, temporal y trampas), la calle se muestra en mayúsculas.
La descripción se mantiene tal cual, sin forzar mayúsculas.
BotonReverse.tsx
Ajuste la lógica para que, después de colocar una trampa, el botón vuelva automáticamente a azul (modo zoom).
Así evitamos que queden múltiples trampas si hacés varios clicks por error.
Resultado general
Todas las calles ahora se ven en mayúsculas en autocompletado, informes y popups.
El botón reverse alterna entre azul (zoom) y rojo (colocar trampa), pero tras colocar una trampa vuelve solo a azul.
Flujo más seguro: un click = una trampa, y después vuelve a zoom.
----------------------------------------------------------------------------------------------------------------
Día 5/12
Hice ajustes en MapaMapa.tsx para diferenciar correctamente el click en una trampa existente del click en el mapa vacío.
pruebas con la barra de búsqueda de direcciones (BuscarDirecciones.tsx), verificando que al ingresar una calle y altura se abra el pin correspondiente o se cree uno nuevo si no existe.
cambios en el orden de capas (z-index) para que el SidebarInformes quede por encima del menú de búsqueda.
intentos de deploy en Vercel, configurando el flujo para que el proyecto se pueda publicar online.
----------------------------------------------------------------------------------------------------------------
Día 9/12
intente trabajar con Prisma 7.1.0:
Ajuste tu package.json y corrí pnpm install.
encontre con errores de validación (P1012) porque Prisma 7 ya no acepta url dentro del datasource.
Corregí tu schema.prisma quitando el url y pasándolo al .env.
Generé el cliente con pnpm prisma generate, pero aparecieron errores nuevos relacionados con el motor “client engine” (adapter o accelerateUrl).
Probé tus endpoints (/api/trampas, /api/informes):
Seguían devolviendo 500 porque el cliente no se inicializaba bien.
Conclusión del día: avance en entender los cambios de Prisma 7, pero todavía no tenías la base funcionando.
----------------------------------------------------------------------------------------------------------------
Día 10/12
Decidí volver a Prisma 6.19.0, la versión que ya te había funcionado:
Cambie las dependencias en package.json a "@prisma/client": "6.19.0" y "prisma": "6.19.0".
Reinstale con pnpm install.
Regenere el cliente con pnpm prisma generate.
ya anda la base de datos y corre pnpm dev
----------------------------------------------------------------------------------------------------------------
Día 11/12: Corregí lat y lng para compatibilidad con MongoDB. Confirmé lecturas con GET.
Día 12/12: Unifiqué id como string en todo el flujo. Ajusté schema.prisma. Probé PATCH con coordenadas, pero no funcionó de forma consistente y volví a la versión que sólo actualizaba dirección/ubicación.
Día 15/12: Refactoricé MapComponent para que dragend reporte coordenadas. El alert no aparecía; mantuve la versión previa mientras depuraba.
Día 16/12: Revisé ActualizarProvider y Page. Cambié funciones para enviar id como string. La descripción quedó operativa; la posición seguía sin actualizar, mantuve cambios mínimos.
Día 17/12: Detecté que MapaMapa no reenviaba actualizarPosicion al MapComponent. Intenté agregar props, aparecieron errores de referencia y revertí parcialmente.
Día 18/12: Resolví ReferenceError en MapaMapa declarando la prop en la interfaz y en los parámetros. Reapliqué el cambio.
Día 19/12: Reprobé dragend: ya muestra alert y actualiza coordenadas. Confirmé id como string en Page, MapaMapa, MapComponent y Provider.
Día 21/12: Consolidé la versión estable: lat/lng en MongoDB, id como string, MapaMapa reenvía actualizarPosicion, dragend operativo. Documenté los intentos fallidos y las reversiones para trazabilidad.
----------------------------------------------------------------------------------------------------------------
Día 21/12
Me enfoqué en seguir puliendo la lógica de usuarios y rangos. Me encontré con errores de Prisma al actualizar porque no estaba pasando el id correctamente,
 y tuve que ajustar tanto el backend como el frontend para que se comuniquen bien. 
Cree un nuevo menu de usuarios y mejore la logica de rangos 
----------------------------------------------------------------------------------------------------------------
Día 22  
Me enfoqué en mejorar el menú de usuarios. Ajusté la lógica para listar usuarios por rango, agregué buscadores y botones más intuitivos, 
y empecé a trabajar en la confirmación de acciones como eliminar o quitar rangos.
 El objetivo fue que la gestión de usuarios sea más práctica y visualmente clara.
----------------------------------------------------------------------------------------------------------------
Día 23  
Avancé con la parte de creación de usuarios. Revisé la comunicación entre frontend y backend, corregí errores de Prisma al actualizar y adapté el flujo para que se pueda añadir un usuario a un rango de manera más consistente.
 También ajusté detalles del menú para que todo funcione de forma integrada.
----------------------------------------------------------------------------------------------------------------
Día 29/12
Me dediqué a revisar la interacción entre el botón de reverse geocode y el SidebarInformes. 
Descubrí que al activar el modo pin azul se seguía usando la última selectedLocation, lo que generaba confusión.
Ajusté la lógica para que al pasar a modo pin se cierre el sidebar y se limpie la selección, evitando que me pregunte por trampas ya existentes. 
Ahora el flujo de crear nuevas trampas quedó más ordenado.
----------------------------------------------------------------------------------------------------------------
Día 2/1
Se esta intentando colocar 3 ids numeroZona, numeroTrampa, numeroInforme; hay error nuevo con lat y long en trampas
