# CyberThreat AI

> Proyecto creado para la [Hackaton Midudev + CubePath 2026](https://github.com/midudev/hackaton-cubepath-2026), lee mi propuesta en la [Issue #178](https://github.com/midudev/hackaton-cubepath-2026/issues/178). Puedes probar el proyecto en [https://ctai.marcvspt.tech](https://ctai.marcvspt.tech).

CyberThreat AI analiza indicadores de compromiso (IoC) usando múltiples fuentes de threat intelligence (VirusTotal, AbuseIPDB, PolySwarm y Robtex), y después consulta una IA vía OpenRouter para entregar un veredicto razonado en español.

![alt text](image-2.png)
![alt text](image-1.png)

***Use un VPS con Dokploy para el despliegue de esta plataforma CyberThreat AI. Desde que conozco Dokploy lo he querido probar más haya de una PoC simple por hobbie, y este Hakaton me dio la oportunidad de usarlo y jugar con esta herramienta***

![alt text](image.png)

## TODO

- [x] Endpoint para envío de IoCs
- [x] Formulario de envío de IoCs
- [x] Espacio para respuesta
- [x] Detección de tipo de IoC con validadores Zod (IPv4, IPv6, dominio, MD5, SHA1, SHA256)
- [x] Conexión con API de [VirusTotal](https://virustotal.com)
- [x] Conexión con API de [AbuseIPDB](https://abuseipdb.com)
- [x] Conexión con API de [PolySwarm](https://polyswarm.network)
- [x] Conexión con API de [Robtex](https://robtex.com)
- [x] Conexión con API de [OpenRouter](https://openrouter.ai)
- [x] Normalización de información
- [x] Stream de datos de la respuesta de la IA
- [x] Despliegue de la plataforma
- [x] Rate limit de consultas a la API
- [x] Colocar API keys propias de los usuarios para las herramientas utilizadas
- [x] Permitir a los usuarios usar varios modelos de IA
- [x] Sistema de advertencias por fuente (API key inválida, sin datos)
- [x] Errores específicos de OpenRouter (API key inválida, error de modelo, servicio no disponible)

## Características actuales

- Endpoint único de análisis en `/api/ctai`.
- Orquestación modular del endpoint en `src/scripts/core/ctai.ts` (rate limit, resolución de IoC/modelo, stream SSE y ejecución por tipo).
- Detección de tipo de IoC con **Zod** (`z.ipv4`, `z.ipv6`, `z.hostname`, `z.hash`) centralizada en `src/scripts/core/iocValidators.ts`.
- El campo **Tipo** en la UI muestra el subtipo exacto: `IPv4`, `IPv6`, `domain`, `hash/md5`, `hash/sha1`, `hash/sha256`.
- Arquitectura de proveedores CTI separada en `src/scripts/sources/` (VirusTotal, AbuseIPDB, Robtex, PolySwarm), agnóstica al tipo de IoC.
- Sistema de **advertencias por fuente**: si una API falla con clave inválida o sin datos, el análisis continúa con las demás fuentes y se informa en la UI sin cortar el flujo.
- Streaming en tiempo real de la respuesta de IA (SSE).
- El modelo mostrado en UI corresponde al **modelo ruteado real** por `OpenRouter` (cuando está disponible).
- Render de markdown en la UI con `Streamdown` durante el streaming de la respuesta de IA.
- Rate limit por IP en `/api/ctai` (configurable por variables de entorno).
- Selector de modelo de IA desde UI (lista permitida en `src/scripts/catalog/models.ts`).
- Modal para configurar API keys del usuario (persistidas en localStorage).
- Fallback automático a variables de entorno si no se envían keys por cabecera.

## Desplegar para desarrollo

1. Instala dependencias:

```sh
pnpm install
```

2. Crea un archivo `.env` con todas las variables siguientes. El esquema de `astro.config.mjs` las declara obligatorias; las API keys sirven como fallback del backend cuando el usuario no envía claves propias:

```env
VIRUSTOTAL_API_KEY=your-virustotal-apikey
ABUSEIPDB_API_KEY=your-abuseipdb-apikey
POLYSWARM_API_KEY=your-polyswarm-apikey
OPENROUTER_API_KEY=your-openrouter-apikey
RATE_LIMIT_POINTS=5
RATE_LIMIT_DURATION=60
```

> Robtex ofrece API pública sin API key para el flujo actual.

3. Inicia el servidor de desarrollo:

```sh
pnpm run dev #http://localhost:4321
```

## Sitemap y robots.txt

El proyecto utiliza `@astrojs/sitemap`, registrado como `sitemap()` en `astro.config.mjs`. La opción `site` está configurada como `https://ctai.marcvspt.tech` y se utiliza para generar las URLs absolutas del sitemap durante el build.

- `/sitemap-index.xml`: índice de los sitemaps generados.
- `/sitemap-0.xml`: sitemap de páginas generado con la configuración actual.
- `/robots.txt`: endpoint definido en `src/pages/robots.txt.ts`; permite el rastreo (`User-agent: *`, `Allow: /`) y anuncia la URL absoluta del índice usando `site`.
- `src/layouts/BaseLayout.astro` incluye `<link rel="sitemap" href="/sitemap-index.xml" />` para facilitar su descubrimiento desde el HTML.

La integración incluye la página de inicio (`/`). Los endpoints `/api/ctai`, `/api/health` y `/robots.txt` no son páginas y no se incluyen en el sitemap. El sitemap se genera al compilar; el servidor de desarrollo no lo genera.

Para verificarlo:

```sh
pnpm run build
```

Revisa los archivos `sitemap-index.xml` y `sitemap-0.xml` en `dist/` y, después del despliegue, comprueba las rutas públicas `/sitemap-index.xml`, `/sitemap-0.xml` y `/robots.txt`. Si cambia el dominio, actualiza `site` en `astro.config.mjs` y `SITE_DATA.url` en `src/scripts/catalog/data.ts` para mantener coherentes el sitemap, robots y la URL canónica.

## API

### 1) Health

- Ruta: `/api/health`
- Método: `GET`
- Respuesta:

```json
{
  "status": "ok"
}
```

### 2) Análisis IoC + IA en stream

- Ruta: `/api/ctai?ioc=<valor>&model=<modelo>`
- Método: `GET`
- Query params:
  - `ioc` (requerido): indicador IPv4, IPv6, dominio, MD5, SHA1 o SHA256.
  - `model` (opcional): modelo permitido; si no es válido se usa el default.

- Headers opcionales para keys de usuario:
  - `X-OpenRouter-Key`
  - `X-VT-Key`
  - `X-AbuseIPDB-Key`
  - `X-Polyswarm-Key`

- Content-Type de salida: `text/event-stream`

- Eventos SSE emitidos:

| Evento  | Payload                                  | Descripción                                       |
|---------|------------------------------------------|---------------------------------------------------|
| `meta`  | `{ ioc, type, model, warnings? }`        | Metadatos iniciales; `warnings` si hay fuentes con advertencia |
| `model` | `{ model }`                              | Modelo ruteado real por OpenRouter                |
| `chunk` | `{ content }`                            | Fragmento de texto de la respuesta IA             |
| `done`  | `{ done: true }`                         | Fin del stream                                    |
| `error` | `{ error, stage, errorType }`            | Error durante el stream                           |

- `errorType` puede ser: `invalid_api_key`, `model_error`, `api_unavailable`, `not_found`, `unknown`.

Ejemplo:

```bash
curl "http://localhost:4321/api/ctai?ioc=1.2.3.4&model=openrouter/auto"
curl "http://localhost:4321/api/ctai?ioc=2001:4860:4860::8888"
curl "http://localhost:4321/api/ctai?ioc=44d88612fea8a8f36de82e1278abb02f"
```

Comportamiento de errores:

- Si **todas** las fuentes CTI fallan críticamente, se corta el flujo y no se invoca OpenRouter.
- Si **algunas** fuentes fallan, el análisis continúa con las disponibles y se emiten advertencias en `meta.warnings`.
- Los errores de OpenRouter son específicos: clave inválida, error del modelo (p. ej. límite de contexto) o servicio no disponible.

Errores comunes (JSON):

```json
{ "error": "Falta el parámetro de IoC" }
```

```json
{ "error": "Tipo de IoC desconocido" }
```

```json
{ "error": "No se pudo completar la consulta de fuentes del IoC.", "stage": "ioc", "errorType": "unknown" }
```

```json
{ "error": "La API Key de OpenRouter no es válida o no tiene permisos suficientes.", "stage": "ai", "errorType": "invalid_api_key" }
```

```json
{ "error": "Too many requests", "retryAfterSeconds": 12 }
```

## Modelos permitidos

La lista (`AVAILABLE_MODELS`), el modelo por defecto (`DEFAULT_MODEL`) y la validación (`isAllowedModel`) se centralizan en `src/scripts/catalog/models.ts` y se comparten entre la UI y el servidor. El modelo por defecto es `openrouter/auto`; también se utiliza cuando la API recibe un modelo no permitido o no recibe el parámetro `model`.

La selección del usuario se recupera de localStorage después del montaje para mantener coherente la hidratación SSR. Si el modelo guardado ya no está permitido o el almacenamiento no está disponible, se utiliza el modelo por defecto. Si falla la persistencia de una nueva selección, esta se mantiene en memoria durante la sesión del componente.

Modelos actualmente permitidos:

- `openrouter/auto`
- `openrouter/free`
- `poolside/laguna-xs-2.1:free`
- `inclusionai/ling-3.0-flash:free`

## Estructura del proyecto

```text
src/
├── assets/
├── components/
│   ├── AIResponsePanel.tsx
│   ├── AlertBox.tsx
│   ├── ApiKeysModal.tsx
│   ├── ApiKeysSettingsButton.tsx
│   ├── App.tsx
│   ├── Footer.astro
│   ├── Header.astro
│   ├── IoCInputField.tsx
│   ├── IoCSearchForm.tsx
│   ├── IocTypeChips.tsx
│   └── ModelSelector.tsx
├── hooks/
│   ├── useAnalyzeIoC.ts
│   ├── useApiKeys.ts
│   └── useClickOutside.ts
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── robots.txt.ts
│   ├── index.astro
│   └── api/
│       ├── ctai.ts
│       └── health.ts
├── scripts/
│   ├── core/
│   │   ├── ctai.ts
│   │   ├── ctaiClient.ts
│   │   ├── errors.ts
│   │   └── iocValidators.ts
│   ├── catalog/
│   │   ├── data.ts
│   │   ├── models.ts
│   │   ├── statusMessages.ts
│   │   └── utils.ts
│   ├── iocs/
│   │   ├── domain.ts
│   │   ├── fetcher.ts
│   │   ├── hash.ts
│   │   └── ip.ts
│   ├── sources/
│   │   ├── abuseipdb.ts
│   │   ├── polyswarm.ts
│   │   ├── robtex.ts
│   │   └── virustotal.ts
│   └── types.ts
└── styles/
    └── global.css
```

## Roadmap

- [ ] Implementar test
- [ ] Refactorizar y simplificar código
- [ ] Documentar la API y todo lo que puede devolver
- [ ] Enviar multiples IoCs en la misma consulta separandolos por coma, punto y coma, y/o salto de linea.
- [ ] Enviar IoCs por lotes usando archivos **CSV** o dividos por salto
- [x] Implementar `zod` para validación de datos
- [x] Arquitectura modular por proveedor CTI (`sources/`)
- [ ] Creación de cuentas de usuarios
- [ ] Guardar historial de busquedas y respuestas
- [ ] Cache de respuestas de las APIs y de las IAs para IoCs recientes
- [ ] Implementar más herramientas de información sobre IoCs

## Stack

- [CubePath](https://cubepath.com)
- [Astro](https://astro.build/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tabler Icons](https://tabler.io/icons)
- [SVGl](https://svgl.app/)
- [Heroicons](https://heroicons.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Streamdown](https://streamdown.ai/)
- [Zod](https://zod.dev/)
- [OpenRouter](https://openrouter.ai/)
- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/)
- [PolySwarm](https://polyswarm.io/)
- [Robtex](https://www.robtex.com/)
- [GitHub Copilot](https://github.com/copilot/)

## Licencia

Este proyecto está licenciado bajo los términos de la [GNU General Public License v3.0](https://github.com/marcvspt/cyberthreat-ai/blob/master/LICENSE).
