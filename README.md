# CyberThreat AI

Este proyecto fue realizado para participar en la [Hackathon de Midudev+Cubepath de 2026](https://github.com/midudev/hackaton-cubepath-2026). La funcionalidad se basa en adquirir información de diferentes fuentes de información de indicadores de compromiso (IoC) y ataque (IoA), luego darle esa información a la IA y que nos de su opinión sobre si es malicioso, sospechoso o seguro ese IoC.

## Para levantar el proyecto

Tienes que crear un `.env` y añadir las siguientes API KEY:

```env
VIRUSTOTAL_API_KEY=your-virustotal-apikey
ABUSEIPDB_API_KEY=your-abuseipdb-apikey
POLYSWARM_API_KEY=your-polyswarm-apikey
OTX_API_KEY=your-alienvaultotx-apikey
```

Se ejecuta de la siguiente forma:

```sh
pnpm run dev
```

## TODO

### Requeridos

- [x] Endpoint para envío de IoCs
- [x] Formulario de envío de IoCs
- [x] Espacio para respuesta (***parcialmente, solo el JSON***)
- [x] Creación de función para clasificar IoCs mediante regex
- [x] Conexión con API de [VirusTotal](https://virustotal.com)
- [x] Conexión con API de [AbuseIPDB](https://abuseipdb.com)
- [x] Conexión con API de [PolySwarm](https://polyswarm.network)
- [x] Conexión con API de [AlienVault OTX](https://otx.alienvault.com) (***Servicio login no funciona, se espera a que funicione o se buscará un remplazo***)
- [ ] Conexión con OpenRouter
- [ ] Normalización de información
- [ ] Stream de datos de la respuesta de la IA
- [ ] Colocar los tipos correctos faltantes
- [ ] Despliegue de la plataforma
- [ ] Rate limit de consultas  a la API

### Deseados a futuro

- [ ] Implementar `zod` para validación de datos
- [ ] Creación de cuentas de usuarios (Clerk?)
- [ ] Guardar historial de busquedas y respuestas
- [ ] Cache de respuestas de las APIs y de las IAs para IoCs recientes
- [ ] Implementar más herramientas de información sobre IoCs
- [ ] Colocar API KEY propias de las herramientas utilizadas
- [ ] Permitir a los usuarios usar la IA especifica que quieran

## Estructura del proyecto

```text
/
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.json
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   └── LoaderSpinner.tsx
│   ├── hooks/
│   │   └── useAnalyzeIoC.ts
│   ├── layouts/
│   │   └── LayoutBase.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       ├── ctai.ts
│   │       ├── health.ts
│   │       └── nothing.ts
│   ├── scripts/
│   │   ├── data.ts
│   │   ├── utils.ts
│   │   └── iocs/
│   │       ├── domain.ts
│   │       ├── hash.ts
│   │       └── ip.ts
│   └── styles/
│       └── global.css
```

## La API

### 1) Estado de servicio (health)

- Ruta: `/api/health`
- Método: GET
- Descripción: verifica que la API está viva.
- Respuesta de éxito **200**:

```json
  {
    "status": "ok"
  }
```

### 2) Análisis de IoC (ctai)

- Ruta: `/api/ctai?ioc=<valor>`
- Método: GET
- Parámetro:
  - `ioc` (string, requerido): indicador de compromiso (IP, dominio o hash).
- Función: detecta el tipo de IoC usando `PATTERNS` de `src/scripts/utils.ts`; luego llama a:
  - `analyzeIP(ioc)` si es IP
  - `analyzeDomain(ioc)` si es dominio
  - `analyzeHash(ioc)` si es hash

- Errores posibles:
  - **400**: falta el parámetro `ioc`.

```json
{ "error": "Missing IoC parameter" }
```

  - **400**: tipo de IoC no reconocido.

```json
{ "error": "Unknown IoC type" }
```

  - **500**: error interno en el análisis.

```json
{ "error": "Analysis failed" }
```

- Ejemplo de llamada:

```bash
curl "http://localhost:3000/api/ctai?ioc=1.2.3.4"
```

- Ejemplo de respuesta (200):

```json
{
  "ioc": "",
  "type": "ip",
  "source1": {
    "name": "VirusTotal",
    "apiResponse": { ... }
  },
  "source2": {
    "name": "AbuseIPDB",
    "apiResponse": { ... }
  }
}
```

> Nota: Para dominio y hash, `source2` es respectivamente `AlienVault OTX` o `PolySwarm`.
> El contenido real de `apiResponse` depende de las APIs externas configuradas en `.env` y de la respuesta de cada proveedor.

## Tecnologías utilizadas

- [TypeScript](https://www.typescriptlang.org/)
- [Astro](https://astro.build/)
- [Tailwind](https://tailwindcss.com/)
- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/)
- [PolySwarm](https://polyswarm.network/)
- [AlienVault OTX](https://otx.alienvault.com/)
- [OpenRouter](https://openrouter.ai/)
