# Instrucciones para agentes

## Proyecto y entorno

CyberThreat AI es una aplicación en español para analizar indicadores de compromiso con proveedores CTI y generar un veredicto vía OpenRouter. Utiliza Astro con salida `server`, adaptador Netlify, React, TypeScript estricto y Tailwind CSS mediante Vite.

- Trabaja con Node.js >= 22.12.0 y pnpm. Conserva `pnpm-lock.yaml` y `pnpm-workspace.yaml`.
- Comandos existentes: `pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run preview` y `pnpm exec astro`.
- El usuario ejecuta todos los comandos de pnpm, incluidos `install`, `add`, `update`, `run`, `build`, `dev`, `preview`, `exec` y `dlx`. El agente solo debe indicar el comando exacto necesario y explicar para qué sirve; no debe ejecutarlo ni sustituirlo por npm, yarn u otra herramienta para realizar la misma acción. Cualquier instalación de dependencias o herramientas también la realiza el usuario.
- No hay scripts de test, lint ni check configurados. No afirmes que se ejecutaron comprobaciones inexistentes.
- Lee el README y los archivos afectados antes de editar. Conserva los cambios previos del usuario y limita los cambios al objetivo solicitado.

## Organización del código

- `src/pages/index.astro` monta `App.tsx` con `client:load`; el layout común está en `src/layouts/BaseLayout.astro`.
- `src/components/` contiene la interfaz; `src/hooks/` gestiona análisis, persistencia de claves y selección de modelo.
- `src/pages/api/ctai.ts` gestiona el endpoint GET, el rate limit por IP y las respuestas JSON/SSE; `src/pages/api/health.ts` expone el estado.
- `src/scripts/core/ctai.ts` resuelve modelos y claves, orquesta consultas y produce el streaming. `ctaiClient.ts` consume el flujo en el cliente.
- `src/scripts/core/iocValidators.ts` centraliza la validación con Zod importado desde `astro/zod`.
- `src/scripts/iocs/` coordina el análisis por IP, dominio o hash; `src/scripts/sources/` implementa cada proveedor CTI. Mantén esa separación al añadir proveedores.
- `src/scripts/types.ts` contiene los tipos compartidos. `src/scripts/catalog/models.ts` centraliza `AVAILABLE_MODELS`, `DEFAULT_MODEL` e `isAllowedModel`, compartidos por la UI y el servidor.
- `src/scripts/catalog/data.ts` contiene los datos del sitio y `src/styles/global.css` los estilos globales.

## Convenciones y contratos

- Utiliza los alias `@/` definidos en `tsconfig.json` y respeta el estilo del archivo que edites.
- Mantén los textos de la interfaz y los mensajes de análisis en español.
- Conserva el soporte para IPv4, IPv6, dominios, MD5, SHA1 y SHA256, y los subtipos mostrados en la UI.
- Si modificas el streaming, revisa tanto productor como consumidor. Conserva los eventos `meta`, `model`, `chunk`, `done` y `error`, o actualiza de forma coordinada sus tipos, UI y documentación.
- Conserva las advertencias por fuente y el comportamiento de análisis parcial; distingue ausencia de datos de errores críticos.
- Al cambiar modelos, revisa la lista compartida, la selección persistida y el fallback del servidor.

## Claves y configuración

- Las variables del servidor se declaran en `astro.config.mjs` y se consumen mediante `astro:env/server`. El esquema actual las marca como obligatorias.
- No publiques ni registres valores de `.env`, claves del usuario o cabeceras de autenticación. No muevas secretos del servidor a módulos importados por el cliente.
- Las claves del usuario se guardan en localStorage mediante `useApiKeys` y se envían por cabeceras `X-OpenRouter-Key`, `X-VT-Key`, `X-AbuseIPDB-Key` y `X-Polyswarm-Key`. Conserva el fallback a las claves del servidor.
- Evita consultas reales a proveedores para verificar cambios de documentación; pueden consumir cuota o generar cargos.

## Sitemap y SEO

- `astro.config.mjs` registra `@astrojs/sitemap` y define `site`. El sitemap se genera durante `pnpm run build`.
- `src/pages/robots.txt.ts` anuncia `/sitemap-index.xml` usando `site`; `BaseLayout.astro` enlaza el índice y define metadatos y canonical.
- Al cambiar el dominio, revisa `site`, `SITE_DATA.url` y el referer de OpenRouter en `core/ctai.ts`.
- No edites manualmente los XML generados ni incluyas endpoints de API en el sitemap.

## Verificación y documentación

- Para cambios de código o configuración, indica al usuario que ejecute `pnpm run build` para verificar el resultado. No lo ejecutes tú. Si el usuario comparte la salida, revísala y distingue errores previos de los introducidos; hasta entonces, informa que la compilación queda pendiente de verificación.
- Para cambios de documentación, comprueba que rutas, comandos y comportamiento descritos coincidan con el código, y ejecuta `git diff --check`.
- Si cambia el sitemap, comprueba los XML generados y las URLs del dominio configurado. Para cambios de interfaz, revisa la pantalla y los estados de carga, error y respuesta cuando sea posible.
- No versionees `dist/`, `.astro/`, `.netlify/`, `node_modules/` ni archivos de entorno.
- Actualiza el README cuando cambien configuración, comandos, endpoints o comportamiento público. Resume los cambios, la verificación realizada y cualquier limitación pendiente.
