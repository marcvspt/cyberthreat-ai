# Guía de contribución

Gracias por contribuir a CyberThreat AI, la aplicación para analizar indicadores de compromiso con fuentes CTI y generar un veredicto en español mediante OpenRouter. Esta guía describe cómo preparar tus cambios y escribir mensajes de commit consistentes.

## Preparar una contribución

1. Consulta [README.md](README.md) para configurar el proyecto, [package.json](package.json) para los requisitos de Node.js y scripts disponibles y [AGENTS.md](AGENTS.md) para conocer sus convenciones técnicas.
2. Si colaboras desde un fork, crea una rama para tu cambio y mantén cada contribución enfocada en un objetivo.
3. Implementa el cambio siguiendo la estructura, los componentes y los estilos existentes.
4. Para cambios de código, configuración o contenido publicado, ejecuta `pnpm build`. Si modificas la interfaz o el contenido, revisa también el resultado con `pnpm preview` en móvil y escritorio, incluyendo navegación por teclado. Los cambios únicamente de documentación no requieren una compilación.
5. Abre un pull request que explique qué cambia, por qué y cómo lo verificaste. Incluye capturas si modificas la interfaz y enlaza el issue relacionado cuando exista.

Usa pnpm y conserva `pnpm-lock.yaml` y `pnpm-workspace.yaml` coherentes con las dependencias. No edites salidas generadas en `dist/`, `.astro/`, `.netlify/` ni dependencias en `node_modules/`. No incluyas archivos `.env`, credenciales ni datos personales en commits, capturas o registros.

Cuando trabajes con un agente, el propietario ejecuta las instalaciones y los comandos del proyecto; el agente prepara los cambios e indica los comandos necesarios, según [AGENTS.md](AGENTS.md). Indica siempre qué comprobaste y qué quedó pendiente. Actualmente no hay scripts de test, lint ni check en `package.json`; la compilación no sustituye esas comprobaciones.

## Convenciones del proyecto

- Mantén Astro con salida `server`, componentes Astro para la estructura e islas React para la interacción y la respuesta progresiva. La configuración actual usa el adaptador Netlify; el README describe también el despliegue realizado en un VPS con Dokploy. Revisa el adaptador y el runtime antes de proponer cambios de despliegue.
- Separa proveedores en `src/lib/server/providers/`, análisis por tipo en `src/lib/server/analysis/` y orquestación en `src/lib/server/analysis.ts`. HTTP, resolución de solicitudes, SSE, OpenRouter y prompt tienen módulos propios en `src/lib/server/`. El cliente y hooks viven en `src/lib/ui/`; no deben importar código de servidor. Reutiliza `src/lib/validation/ioc.ts` y los tipos del archivo concreto en `src/lib/types/`.
- Conserva IPv4, IPv6, dominios y hashes MD5, SHA1 y SHA256. Distingue ausencia de datos, errores críticos y advertencias por fuente para mantener el análisis parcial.
- Si cambias el streaming, revisa productor y consumidor. Conserva los eventos SSE `meta`, `model`, `chunk`, `done` y `error`, o actualiza de forma coordinada el contrato, los tipos, la UI y la documentación.
- Gestiona modelos desde `src/lib/catalog/models.ts`, incluyendo selección persistida y fallback. Los textos propios viven en `TEXTS_GENERAL` de `src/lib/texts.ts`, agrupados por sección y con etiquetas visibles en español. Marca e idioma en `src/lib/site.ts`; enlaces con `id`, `label`, `href` en `src/lib/links.ts`. Usa alias con extensión real explícita, imports al archivo concreto y estilos compartidos.
- Declara las variables con `envField` en `astro.config.mjs` e importa secretos únicamente desde `astro:env/server`. Conserva las claves propias enviadas por cabeceras y el fallback a las claves del servidor; no expongas ni registres sus valores.
- Mantén las respuestas HTTP 429 y sus cabeceras. El límite de solicitudes usa memoria por proceso y no comparte contadores entre instancias.

## Qué comprobar según el cambio

- **Validación y API:** revisa los tipos de IoC afectados, entradas inválidas, errores JSON y respuestas 429. `/api/health` confirma que la ruta responde, sin verificar proveedores.
- **Fuentes y streaming:** comprueba el flujo de eventos, errores antes y durante SSE, advertencias parciales y ausencia de datos. Usa respuestas simuladas cuando sea posible; documenta qué casos se verificaron.
- **Claves y modelos:** revisa la prioridad de las claves de usuario, el fallback del servidor y la selección persistida del modelo, sin incluir credenciales en la evidencia.
- **Interfaz:** revisa formulario, configuración y estados de carga, error y respuesta en móvil y escritorio.
- **SEO y dominio:** tras el build, revisa sitemap, robots y canónicas. El dominio se define solo en `site` de `astro.config.mjs`; el endpoint usa `site.origin` para el referer de OpenRouter y la marca compartida para `X-Title`. Comprueba estos consumidores al cambiarlo.

Las consultas reales a proveedores pueden consumir cuota o generar cargos. Para cambios únicamente de documentación, verifica rutas y contratos por inspección, sin realizar análisis reales.

Actualiza [README.md](README.md) si cambian configuración, endpoints o comportamiento público, y [AGENTS.md](AGENTS.md) si cambian arquitectura, contratos, variables o convenciones.

## Mensajes de commit

Usa un prefijo con inicial mayúscula, seguido de dos puntos, un espacio y una descripción breve en español:

```text
Prefijo: descripción del cambio
```

Conservamos `Fix:` para corregir errores y `Feature:` para añadir funcionalidad. Usa los siguientes prefijos según el propósito principal del cambio:

| Prefijo | Cuándo usarlo | Ejemplo |
| --- | --- | --- |
| `Fix:` | Corregir un error de comportamiento o presentación. | `Fix: corrige la validación de dominios` |
| `Feature:` | Añadir una funcionalidad. | `Feature: agrega una fuente de inteligencia` |
| `Refactor:` | Reorganizar código sin cambiar su comportamiento. | `Refactor: simplifica el consumo de eventos SSE` |
| `Style:` | Ajustar el formato del código, como espacios o indentación. | `Style: unifica la indentación de componentes` |
| `UI:` | Modificar el diseño o la presentación visual. | `UI: ajusta el espaciado del encabezado` |
| `Docs:` | Añadir o actualizar documentación. | `Docs: agrega la guía de contribución` |
| `Test:` | Añadir o modificar pruebas. | `Test: cubre los indicadores inválidos` |
| `Perf:` | Mejorar el rendimiento. | `Perf: reduce el tamaño de las imágenes` |
| `Build:` | Modificar dependencias o configuración de compilación. | `Build: actualiza las dependencias de Astro` |
| `CI:` | Modificar automatizaciones de integración o despliegue. | `CI: agrega la validación de producción` |
| `Chore:` | Realizar mantenimiento que no encaje en los anteriores. | `Chore: actualiza los archivos ignorados` |
| `Revert:` | Deshacer un cambio anterior. | `Revert: revierte el cambio del menú` |

Puedes indicar el área entre paréntesis cuando ayude a identificar el cambio:

```text
Feature(sources): agrega un proveedor CTI
Fix(streaming): corrige el cierre del análisis
Docs(readme): actualiza los requisitos de Node
```

- Escribe descripciones concretas, como «corrige la validación del correo», en lugar de «varios cambios».
- Usa verbos como «agrega», «corrige», «actualiza» o «elimina» y evita el punto final en el título.
- Usa `Style:` para formato del código y `UI:` para cambios visuales. Si corriges un defecto visual, usa `Fix:`.
- Separa cambios independientes en commits distintos. Si un cambio necesita varios archivos, pueden formar parte del mismo commit.
- Para explicar una decisión o un cambio incompatible, añade detalles en el cuerpo del commit después de una línea en blanco.

Estos prefijos son la convención del proyecto. Mantén `Fix:` y `Feature:` en lugar de alternarlos con `fix:` y `feat:`.
