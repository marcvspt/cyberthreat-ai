# CyberThreat AI

> Proyecto creado para la [Hackaton Midudev + CubePath 2026](https://github.com/midudev/hackaton-cubepath-2026). Puedes probar el proyecto en [https://ctai.marcvspt.tech](https://ctai.marcvspt.tech).

CyberThreat AI analiza indicadores de compromiso (IoC) usando múltiples fuentes de threat intelligence (VirusTotal, AbuseIPDB, PolySwarm y Robtex), y después consulta una IA vía OpenRouter para entregar un veredicto razonado en español.

![alt text](image-2.png)
![alt text](image-1.png)

***Use un VPS con Dokploy para el despliegue de esta plataforma CyberThreat AI. Desde que conozco Dokploy lo he querido probar más haya de una PoC simple por hobbie, y este Hakaton me dio la oportunidad de usarlo y jugar con esta herramienta***

![alt text](image.png)

## TODO

- [x] Endpoint para envío de IoCs
- [x] Formulario de envío de IoCs
- [x] Espacio para respuesta
- [x] Creación de función para clasificar IoCs mediante regex
- [x] Conexión con API de [VirusTotal](https://virustotal.com)
- [x] Conexión con API de [AbuseIPDB](https://abuseipdb.com)
- [x] Conexión con API de [PolySwarm](https://polyswarm.network)
- [x] Conexión con API de [Robtex](https://robtex.com)
- [x] Conexión con API de [OpenRouter](https://openrouter.ai)
- [x] Normalización de información
- [x] Stream de datos de la respuesta de la IA
- [x] Despliegue de la plataforma
- [x] Rate limit de consultas  a la API
- [x] Colocar API key propias de los usuarios para las herramientas utilizadas
- [x] Permitir a los usuarios usar varios modelos de IA que quieran (**Por el momento solo las de OpenRouter**)

## Características actuales

- Endpoint único de análisis en `/api/ctai`.
- Detección de tipo de IoC por regex (IP, dominio o hash).
- Streaming en tiempo real de la respuesta de IA (SSE).
- Render de markdown en la UI con `marked` + sanitización con `DOMPurify`.
- Rate limit por IP en `/api/ctai` (configurable por variables de entorno).
- Selector de modelo de IA desde UI (lista permitida).
- Modal para configurar API keys del usuario (persistidas en localStorage).
- Fallback automático a variables de entorno si no se envían keys por cabecera.
- Manejo de errores personalizado por etapa (`ioc` o `ai`) sin exponer mensajes crudos de proveedores.
- Si falla una API de IoC, se corta el flujo y no se llama a la IA.
- Respuesta de error con API afectada (`failedApi`) cuando aplica.

## Desplegar para desarrollo

1. Instala dependencias:

```sh
pnpm install
```

1. Crea un archivo `.env` con las keys (opcionales, recomendadas para fallback backend):

```env
VIRUSTOTAL_API_KEY=your-virustotal-apikey
ABUSEIPDB_API_KEY=your-abuseipdb-apikey
POLYSWARM_API_KEY=your-polyswarm-apikey
OPENROUTER_API_KEY=your-openrouter-apikey
RATE_LIMIT_POINTS=8
RATE_LIMIT_DURATION=60
```

> Robtex ofrece API pública sin API key para el flujo actual.

1. Ejecuta en desarrollo:

```sh
pnpm run dev
```

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
  - `ioc` (requerido): indicador IP, dominio o hash.
  - `model` (opcional): modelo permitido; si no es válido se usa el default.

- Headers opcionales para keys de usuario:
  - `X-OpenRouter-Key`
  - `X-VT-Key`
  - `X-AbuseIPDB-Key`
  - `X-Polyswarm-Key`

- Content-Type de salida:
  - `text/event-stream`

- Eventos SSE emitidos:
  - `meta`: metadatos `{ ioc, type, model }`
  - `chunk`: fragmentos de texto `{ content }`
  - `done`: fin del stream `{ done: true }`
  - `error`: error en stream `{ error, stage, failedApi? }`

Ejemplo:

```bash
curl "http://localhost:4321/api/ctai?ioc=1.2.3.4&model=openrouter/auto"
```

Comportamiento de errores:

- Si falla una fuente de IoC (VirusTotal, AbuseIPDB, Robtex, PolySwarm), el backend responde error y no se invoca OpenRouter.
- Si falla la IA (OpenRouter), se devuelve un error personalizado de etapa `ai`.
- En ambos casos se evita exponer el mensaje crudo del proveedor y se informa `failedApi` cuando está disponible.

Errores comunes (JSON):

```json
{ "error": "Falta el parámetro de IoC" }
```

```json
{ "error": "Tipo de IoC desconocido" }
```

```json
{ "error": "No se pudo completar la consulta de fuentes del IoC.", "stage": "ioc", "failedApi": "VirusTotal" }
```

```json
{ "error": "No se pudo completar el análisis con la IA.", "stage": "ai", "failedApi": "OpenRouter" }
```

```json
{ "error": "Too many requests", "retryAfterSeconds": 12 }
```

## Modelos permitidos

La fuente única de modelos está en `src/scripts/utils.ts` (`AI_MODELS`).

Actualmente:

- `openrouter/auto`
- `openrouter/free`
- `stepfun/step-3.5-flash:free`

## Estructura (resumen)

```text
src/
├── assets/
├── components/
│   ├── AIResponsePanel.tsx
│   ├── ApiKeysModal.tsx
│   ├── App.tsx
│   ├── Footer.astro
│   ├── Header.astro
│   ├── IoCSearchForm.tsx
│   └── LoaderSpinner.tsx
├── hooks/
│   ├── useAnalyzeIoC.ts
│   └── useApiKeys.ts
├── pages/
│   └── api/
│       ├── ctai.ts
│       └── health.ts
├── scripts/
│   ├── data.ts
|   |-- errors.ts
│   ├── iocs/
│   │   ├── domain.ts
│   │   ├── hash.ts
│   │   └── ip.ts
│   ├── types.ts
│   └── utils.ts
└── styles/
    └── global.css
```

## Roadmap

- [ ] Implementar test
- [ ] Refactorizar y simplificar código
- [ ] Enviar multiples IoCs en la misma consulta separandolos por coma, punto y coma, y/o salto de linea.
- [ ] Enviar IoCs por lotes usando archivos **CSV** o dividos por salto
- [ ] Implementar `zod` para validación de datos
- [ ] Creación de cuentas de usuarios
- [ ] Guardar historial de busquedas y respuestas
- [ ] Cache de respuestas de las APIs y de las IAs para IoCs recientes
- [ ] Implementar más herramientas de información sobre IoCs

## Stack

- [Cubepath](https://cubepath.com)
- [Astro](https://astro.build/)
- [Preact](https://preactjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tabler Icons](https://tabler.io/icons)
- [SVGl](https://svgl.app/)
- [Heroicons](https://heroicons.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [marked](https://github.com/markedjs/marked)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [OpenRouter](https://openrouter.ai/)
- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/)
- [PolySwarm](https://polyswarm.io/)
- [Robtex](https://www.robtex.com/)
- [GitHub Copilot](https://github.com/copilot/)

Este proyecto está licenciado bajo los términos de la [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).
