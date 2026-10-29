# Instrucciones para agentes

## Contribuciones y mensajes de commit

- Seguir [CONTRIBUTING.md](CONTRIBUTING.md) para preparar contribuciones y redactar mensajes de commit; esa guía define el formato, los prefijos y la separación de cambios independientes.
- Al entregar cambios, incluir siempre una recomendación de mensaje de commit para los cambios de la tarea. Si se solicita cubrir todos los cambios pendientes, revisar `git status`, los diffs preparados y sin preparar y los archivos nuevos no ignorados antes de redactarla.
- Recomendar un mensaje no autoriza realizar el commit ni publicar cambios.

## Proyecto y entorno

CyberThreat AI es una aplicación en español para analizar indicadores de compromiso con proveedores CTI y generar un veredicto vía OpenRouter. Utiliza Astro con salida `server`, adaptador Netlify, React, TypeScript estricto y Tailwind CSS mediante Vite.

- Trabaja con Node.js >= 24.0.0 y pnpm, conforme a `engines.node` en `package.json`. Conserva `pnpm-lock.yaml` y `pnpm-workspace.yaml`.
- Comandos existentes: `pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run preview` y `pnpm exec astro`.
- El usuario ejecuta todos los comandos de pnpm, incluidos `install`, `add`, `update`, `run`, `build`, `dev`, `preview`, `exec` y `dlx`. El agente solo debe indicar el comando exacto necesario y explicar para qué sirve; no debe ejecutarlo ni sustituirlo por npm, yarn u otra herramienta para realizar la misma acción. Cualquier instalación de dependencias o herramientas también la realiza el usuario.
- No hay scripts de test, lint ni check configurados. No afirmes que se ejecutaron comprobaciones inexistentes.
- Lee el README y los archivos afectados antes de editar. Conserva los cambios previos del usuario y limita los cambios al objetivo solicitado.

## Coherencia con las tecnologías y el despliegue

- Mantén las instrucciones y las decisiones de implementación coherentes con las tecnologías y versiones declaradas en `package.json`, `astro.config.mjs` y el código actual. Revisa esos archivos antes de asumir convenciones de otra versión o introducir herramientas nuevas.
- Respeta la arquitectura de Astro: páginas y endpoints en `src/pages/`, componentes `.astro` para la estructura del sitio e islas React para la interacción. Mantén las directivas de hidratación y la separación entre código de servidor y cliente.
- Prioriza Astro SSR para el renderizado, la obtención de datos y la lógica que puedan resolverse en el servidor cuando tenga sentido para la funcionalidad. Prefiere componentes `.astro` para contenido que no necesita interacción en el navegador y limita la hidratación y el JavaScript enviado al cliente a lo necesario. Usa islas React para estado interactivo, APIs del navegador y actualización progresiva de la respuesta SSE; conserva esas capacidades al decidir qué mover al servidor.
- Utiliza Tailwind CSS 4 mediante `@tailwindcss/vite` y los estilos existentes en `src/styles/global.css`; no introduzcas configuración propia de otra versión sin que el cambio lo requiera.
- Mantén los hooks y componentes compatibles con React y SSR; accede a APIs del navegador después del montaje o desde acciones del usuario cuando corresponda.
- El rate limit actual usa `RateLimiterMemory` de `rate-limiter-flexible` en `/api/ctai`, con `RATE_LIMIT_POINTS` y `RATE_LIMIT_DURATION`. Su estado es local a cada proceso; considera esa característica al cambiar el despliegue o el número de instancias y conserva las respuestas 429 y sus cabeceras.
- El README describe un despliegue en un VPS de CubePath con Dokploy y el dominio `https://ctai.marcvspt.tech`; la configuración actual de Astro utiliza el adaptador Netlify. Distingue el despliegue documentado del adaptador configurado: no deduzcas que el sitio está alojado en Netlify solo por el adaptador. Si una tarea depende del entorno de producción, contrasta la configuración disponible y aclara cualquier discrepancia antes de hacer cambios que dependan de ella.

## Organización del código

- `src/pages/index.astro` monta `App.tsx` con `client:load`; el layout común está en `src/layouts/BaseLayout.astro`.
- `src/components/` contiene la interfaz; `src/lib/ui/` reúne los hooks de análisis, persistencia de claves, modelo y eventos, el cliente SSE y los helpers de mensajes de estado.
- `src/pages/api/ctai.ts` gestiona el endpoint GET, el rate limit por IP y las respuestas JSON/SSE; `src/pages/api/health.ts` expone el estado.
- `src/lib/server/request.ts` resuelve modelos, tipo de IoC y claves; `http.ts` gestiona JSON e IP del cliente; `analysis.ts` orquesta las fuentes y detecta ausencia de datos; `sse.ts` formatea eventos y el flujo sin datos; `openrouter.ts` produce la respuesta de IA. El prompt vive en `src/lib/server/prompts/analysis.ts`. Importar cada archivo directamente; no crear barrels ni importar módulos `server/` desde el navegador.
- `src/lib/validation/ioc.ts` centraliza la validación con Zod importado desde `astro/zod`. No mantener expresiones regulares paralelas ni validadores heredados sin consumidores.
- `src/lib/server/analysis/` coordina consultas por IP, dominio o hash; `src/lib/server/providers/` implementa proveedores CTI y el guard compartido. Mantén esa separación al añadir proveedores.
- `src/lib/types/` separa contratos de análisis y streaming (`analysis.ts`), claves (`api-keys.ts`), modelos (`model.ts`) y sitio/enlaces (`site.ts`). Importar tipos del archivo concreto, sin reexportarlos desde hooks o módulos de ejecución. `src/lib/catalog/models.ts` centraliza `AVAILABLE_MODELS`, `DEFAULT_MODEL` e `isAllowedModel`, compartidos por UI y servidor.
- `src/lib/site.ts` contiene `SITE_DATA` (nombre y descripción) y `SITE_LOCALE` (idioma del HTML); `src/lib/links.ts` reúne enlaces del encabezado, redes, recursos externos y licencia mediante el contrato `id`, `label`, `href`. No duplicar URLs en componentes ni el dominio en los datos del sitio. `src/styles/global.css` mantiene los estilos globales.
- `src/lib/texts.ts` centraliza `TEXTS_GENERAL` por secciones: `site`, `common`, `header`, `home`, `footer`, `search`, `settings`, `results`, `errors`, `status`, `brands`, `social` y `models`. Usar claves semánticas y funciones con parámetros tipados. Los códigos de estado y error, IDs de modelos y cabeceras permanecen independientes de sus etiquetas visibles en español. El prompt y el Markdown generado por la IA quedan fuera del catálogo; todavía no hay selección de idioma ni sistema i18n.

## Convenciones y contratos

- Usa siempre los alias configurados en `tsconfig.json`: `@/pages/*`, `@/layouts/*`, `@/components/*`, `@/assets/*`, `@/styles/*` y `@/lib/*`. Incluye la extensión real explícita e importa el archivo concreto, sin barrels ni resolución implícita de directorios. No uses rutas relativas para código interno de `src/`, incluidos tipos y estilos; la configuración ejecutada fuera de Astro conserva rutas relativas compatibles con Node. Los paquetes externos y módulos de Astro conservan sus nombres originales. Respeta el estilo del archivo que edites.
- Mantén los textos de la interfaz y los mensajes de análisis en español.
- Mantén la UI coherente entre todas las secciones de la aplicación: reutiliza los componentes, estilos y tokens del tema existentes para colores, tipografía, espaciado, botones, formularios, paneles y mensajes de estado. Conserva patrones de interacción, estados de carga y error, accesibilidad y comportamiento responsive consistentes. Antes de añadir o modificar una sección, revisa las secciones relacionadas y evita introducir variantes visuales o componentes duplicados sin una necesidad funcional.
- Conserva el soporte para IPv4, IPv6, dominios, MD5, SHA1 y SHA256, y los subtipos mostrados en la UI.
- Si modificas el streaming, revisa tanto productor como consumidor. Conserva los eventos `meta`, `model`, `chunk`, `done` y `error`, o actualiza de forma coordinada sus tipos, UI y documentación.
- Conserva las advertencias por fuente y el comportamiento de análisis parcial; distingue ausencia de datos de errores críticos.
- Al cambiar modelos, revisa la lista compartida, la selección persistida y el fallback del servidor.

## Claves y configuración

- Cuando sea necesario actualizar la base de datos de producción, entrega las consultas SQL directamente en el chat, en un bloque de código `sql` listo para que el usuario lo revise y ejecute. No generes archivos para entregar esas consultas, incluidos archivos `.sql` o de migración, ni las ejecutes en producción por tu cuenta.
- Utiliza siempre las APIs de variables de entorno de Astro: declara y valida las variables mediante `env.schema` y `envField` en `astro.config.mjs`, e impórtalas desde `astro:env/server` o `astro:env/client` según su contexto. No sustituyas este mecanismo por `process.env`, `import.meta.env` o lecturas manuales de `.env` en el código de la aplicación. Las variables actuales del servidor se consumen mediante `astro:env/server` y el esquema las marca como obligatorias; conserva el contexto y el nivel de acceso adecuados al añadir variables, y nunca expongas secretos al cliente.
- No publiques ni registres valores de `.env`, claves del usuario o cabeceras de autenticación. No muevas secretos del servidor a módulos importados por el cliente.
- Las claves del usuario se guardan en localStorage mediante `useApiKeys` y se envían por cabeceras `X-OpenRouter-Key`, `X-VT-Key`, `X-AbuseIPDB-Key` y `X-Polyswarm-Key`. Conserva el fallback a las claves del servidor.
- Evita consultas reales a proveedores para verificar cambios de documentación; pueden consumir cuota o generar cargos.

## Sitemap y SEO

- `astro.config.mjs` registra `@astrojs/sitemap` y define `site`. El sitemap se genera durante `pnpm run build`.
- `src/pages/robots.txt.ts` anuncia `/sitemap-index.xml` usando `site`; `BaseLayout.astro` enlaza el índice y define metadatos y canonical.
- El dominio se define únicamente en `site` de `astro.config.mjs`: el layout genera canónicas mediante `Astro.site`; robots usa el contexto; `/api/ctai` pasa `site.origin` a `createOpenRouterStream` como `siteUrl` para el referer. El título enviado a OpenRouter usa `SITE_DATA.name`. La ausencia de `site` genera un error de configuración antes de consultar proveedores. Al cambiar el dominio, modificar esa propiedad y comprobar canónicas, robots, sitemap y referer.
- No edites manualmente los XML generados ni incluyas endpoints de API en el sitemap.

## Verificación y documentación

- Para cambios de código o configuración, indica al usuario que ejecute `pnpm run build` para verificar el resultado. No lo ejecutes tú. Si el usuario comparte la salida, revísala y distingue errores previos de los introducidos; hasta entonces, informa que la compilación queda pendiente de verificación.
- Para cambios de documentación, comprueba que rutas, comandos y comportamiento descritos coincidan con el código, y ejecuta `git diff --check`.
- Si cambia el sitemap, comprueba los XML generados y las URLs del dominio configurado. Para cambios de interfaz, revisa la pantalla y los estados de carga, error y respuesta cuando sea posible.
- No versionees `dist/`, `.astro/`, `.netlify/`, `node_modules/` ni archivos de entorno.
- Actualiza el README cuando cambien configuración, comandos, endpoints o comportamiento público. Resume los cambios, la verificación realizada y cualquier limitación pendiente.
- Actualiza también este `AGENTS.md` en la misma tarea cuando haya cambios importantes en arquitectura, tecnologías, versiones que afecten las instrucciones, organización de archivos, comandos, contratos de API/SSE, variables de entorno, rate limit o despliegue. Corrige o elimina instrucciones obsoletas y mantén la coherencia entre este archivo, el README y la implementación. No es necesario modificarlo por cambios menores que no afecten las instrucciones.
