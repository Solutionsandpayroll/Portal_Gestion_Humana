# Portal de Gestion Humana

Aplicacion web interna para centralizar formularios y recursos del area de Gestion Humana.

## Funcionalidades

- Dashboard principal con tres secciones:
  - Formularios
  - Beneficios
  - Recursos Corporativos
- Persistencia del usuario en `localStorage` mediante la llave `gh_usuario`.
- Formulario de Requisicion de Personal con envio de datos a Power Automate.
- Formulario de Gestion de Desempeno en tres variantes:
  - Estrategico
  - Tactico
  - Operativo
- Generacion de archivo Excel por variante de desempeno a partir de plantilla (`.xlsx`) con `JSZip`, preservando estilos y elementos del template.
- Formulario PEOPLE para seleccion de beneficios (14 opciones) y envio a Power Automate.
- Seccion de Recursos Corporativos con acceso a induccion y espacio para cursos (proximamente).

## Arquitectura y Stack

- React 19 + TypeScript
- Vite 7
- React Router DOM 7
- JSZip para manipulacion de plantillas Excel

## Estructura Principal

- `src/pages/Dashboard.tsx`: pagina de inicio y navegacion por secciones.
- `src/pages/FormularioRequisicion.tsx`: formulario de requisicion.
- `src/pages/FormularioDesempenoEstrategico.tsx`: desempeno estrategico.
- `src/pages/FormularioDesempenoTactico.tsx`: desempeno tactico.
- `src/pages/FormularioDesempenoOperativo.tsx`: desempeno operativo.
- `src/pages/FormularioPeople.tsx`: formulario de beneficios PEOPLE.
- `public/template-estrategico.xlsx`, `public/template-tactico.xlsx`, `public/template-operativo.xlsx`: plantillas base para generacion de archivos.

## Variables de Entorno

Crear un archivo `.env` en la raiz del proyecto con:

```env
VITE_PA_REQUISICION_URL=
VITE_PA_DESEMPENO_ESTRATEGICO_URL=
VITE_PA_PEOPLE_URL=
```

> Nota: Actualmente tactico y operativo usan `VITE_PA_DESEMPENO_ESTRATEGICO_URL`.

## Instalacion y Ejecucion

1. Instalar dependencias:

```bash
npm install
```

2. Levantar entorno de desarrollo:

```bash
npm run dev
```

3. Generar build de produccion:

```bash
npm run build
```

4. Previsualizar build:

```bash
npm run preview
```

## Flujo Funcional

1. El usuario ingresa su nombre desde el dashboard (guardado en `localStorage`).
2. Selecciona el formulario a diligenciar.
3. Completa la informacion requerida.
4. La aplicacion transforma los datos al formato esperado:
   - JSON para Power Automate.
   - Excel (`.xlsx`) para formularios de desempeno.
5. Se envia al endpoint configurado en variables de entorno.

## Seguridad y Buenas Practicas

- `.env` se encuentra excluido del versionamiento para evitar publicacion de URLs sensibles.
- Se incluye `.env.example` como referencia de configuracion.
- No se suben artefactos locales ni dependencias (`node_modules`, `dist`).

## Estado del Proyecto

- Funcional para uso interno en Gestion Humana.
- Pendientes funcionales opcionales:
  - Configurar URL final para `VITE_PA_PEOPLE_URL`.
  - Habilitar seccion de cursos cuando exista plataforma final.
