# CyberThreat AI

Proyecto creado para la [Hackaton Midudev + CubePath 2026](https://github.com/midudev/hackaton-cubepath-2026).

CyberThreat AI analiza indicadores de compromiso (IoC) usando múltiples fuentes de threat intelligence (VirusTotal, AbuseIPDB, PolySwarm y Robtex), y después consulta una IA vía OpenRouter para entregar un veredicto razonado en español.

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
- Rate limit por IP en `/api/ctai` (configurable por variables de entorno).
- Selector de modelo de IA desde UI (lista permitida).
- Modal para configurar API keys del usuario (persistidas en localStorage).
- Fallback automático a variables de entorno si no se envían keys por cabecera.

## Puesta en marcha

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
  - `error`: error en stream `{ error }`

Ejemplo:

```bash
curl "http://localhost:4321/api/ctai?ioc=1.2.3.4&model=openrouter/auto"
```

Errores comunes (JSON):

```json
{ "error": "Missing IoC parameter" }
```

```json
{ "error": "Unknown IoC type" }
```

```json
{ "error": "Analysis failed" }
```

```json
{ "error": "Too many requests", "retryAfterSeconds": 12 }
```

## Modelos permitidos

La fuente única de modelos está en `src/scripts/utils.ts` (`AI_MODELS`).

Actualmente:

- `openrouter/auto`
- `openrouter/free`

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
- [TypeScript](https://www.typescriptlang.org/)
- [OpenRouter](https://openrouter.ai/)
- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/)
- [PolySwarm](https://polyswarm.io/)
- [Robtex](https://www.robtex.com/)
