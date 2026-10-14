// Textos de la aplicación por sección. El prompt y el Markdown de la IA quedan fuera del catálogo.
export const TEXTS_GENERAL = {
    brands: {
        cubepath: 'Cubepath', astro: 'Astro', react: 'React', tailwind: 'Tailwind CSS',
        openrouter: 'OpenRouter', virustotal: 'VirusTotal', abuseipdb: 'AbuseIPDB',
        polyswarm: 'PolySwarm', robtex: 'Robtex', poolside: 'Poolside', novita: 'NovitaAI',
    },
    social: {
        linkedin: 'LinkedIn', github: 'GitHub', hackthebox: 'HackTheBox', x: 'X/Twitter', email: 'Contactame',
    },
    models: {
        auto: 'Predeterminado - OpenRouter (automático)', free: 'OpenRouter (gratuito)',
        poolside: 'Poolside: Laguna XS 2.1 (gratuito)', novita: 'NovitaAI: Ling-3.0-flash (gratuito)',
    },
    site: {
        name: "CyberThreat AI",
        description: "Aplicación desarrollada para el Hackaton de Midudev + CubePath, con el objetivo de demostrar mis habilidades en desarrollo web y ciberseguridad.",
    },
    common: {
        errorPrefix: 'Error:',
        close: 'Cerrar',
        hide: 'Ocultar',
        show: 'Mostrar',
        cancel: 'Cancelar',
        save: 'Guardar',
    },
    header: {
        repositoryLink: 'Repo',
        aboutMeLink: 'Sobre mí',
    },
    home: {
        title: 'Inicio',
        heroStart: '¡Comienza tu ',
        heroIndicators: 'investigación de indicadores',
        heroBridge: ' de compromiso a través de ',
        heroModels: 'modelos LLM',
        heroEnd: '!',
    },
    footer: {
        hackathonTitle: 'Hackaton Midudev - CubePath',
        poweredBy: 'Desarrollado con',
        licenseNotice: 'Este proyecto está licenciado bajo los términos de la',
        licenseName: 'GNU General Public License v3.0',
    },
    search: {
        description: 'Envía una IP, un dominio o un hash y un modelo de IA redacta un veredicto del IoC basandose en la información de distintas fuentes de datos de inteligencia de amenazas y analizadores de IoC.',
        iocLabel: 'Indicador de compromiso',
        analyzingButton: 'Analizando...',
        analyzeButton: 'Iniciar análisis',
        iocPlaceholder: 'Ejemplo: 8.8.8.8, 2001:4860:4860::8888, example.org o 44d88612fea8a8f36de82e1278abb02f',
        iocTypes: ['IPv4 / IPv6', 'Dominio', 'MD5', 'SHA1', 'SHA256'],
        supportedIocTypes: 'Tipos de IoC soportados',
        modelLabel: 'Modelo:',
        loadingModel: 'Cargando modelo...',
    },
    settings: {
        configureApiKeys: 'Configurar API keys',
        apiKeysButton: 'API keys',
        openRouterKeyHint: 'Requerida para el análisis de IA',
        virusTotalKeyHint: 'Usada para IP, dominio y hash',
        abuseIpDbKeyHint: 'Usada para análisis de IP',
        polySwarmKeyHint: 'Usada para análisis de hash',
        openRouterKeyPlaceholder: 'sk-or-...',
        virusTotalKeyPlaceholder: 'Tu API key de VirusTotal',
        abuseIpDbKeyPlaceholder: 'Tu API key de AbuseIPDB',
        polySwarmKeyPlaceholder: 'Tu API key de PolySwarm',
        title: 'Configuración',
        apiKeysTitle: 'API Keys',
        keysStorageNotice: 'Las claves se guardan únicamente en tu navegador. Si las dejas vacías, el servidor usará las configuradas por defecto.',
        clearKeys: 'Limpiar todas',
    },
    results: {
        title: 'Resultados del análisis',
        iocLabel: 'IoC:',
        typeLabel: 'Tipo:',
        modelLabel: 'Modelo:',
        errorTitle: 'Error en el análisis',
        preparingAnalysis: 'Preparando contexto y consultando la IA...\n',
        invalidKeySources: (count: number) => `${count} ${count === 1 ? 'fuente' : 'fuentes'} con API Key no válida`,
        noDataSources: (count: number) => `${count} ${count === 1 ? 'fuente' : 'fuentes'} sin datos para este IoC`,
    },
    errors: {
        siteConfiguration: 'Define site en astro.config.mjs para generar las URL públicas y el referer de OpenRouter.',
        sourceNotFound: (provider: string) => `No se encontraron datos en ${provider}`,
        sourceInvalidKey: (provider: string) => `API Key incorrecta para ${provider}`,
        sourceUnavailable: (provider: string) => `${provider} no está disponible en este momento`,
        sourceUnknownError: (provider: string) => `Error desconocido en ${provider}`,
        iocNotFound: (provider?: string) => `El IoC no existe en los registros de ${provider}.`,
        invalidProviderKey: (provider?: string) => `La API Key de ${provider} es incorrecta.`,
        providerUnavailable: (provider?: string) => `La API de ${provider} no está disponible en este momento.`,
        invalidAiKey: (provider?: string) => `La API Key de ${provider} no es válida o no tiene permisos suficientes.`,
        aiUnavailable: (provider?: string) => `El servicio de ${provider} no está disponible en este momento.`,
        streamUnavailable: 'Streaming no disponible en la respuesta',
        unknownError: 'Error desconocido',
        clientAnalysisError: 'No se pudo completar el análisis',
        rateLimitError: 'Demasiadas solicitudes',
        missingIoc: "Falta el parámetro de IoC",
        invalidIoc: "Tipo de IoC desconocido",
        iocAnalysisError: 'No se pudo completar la consulta de fuentes del IoC.',
        aiAnalysisError: 'No se pudo completar el análisis con la IA.',
        modelError: 'El modelo devolvió un error inesperado durante el análisis.',
        analysisError: 'No se pudo completar el análisis.',
        unsupportedIoc: 'Tipo de IoC no soportado',
        emptyOpenRouterResponse: 'Respuesta sin cuerpo de OpenRouter',
        unsupportedPolySwarmHash: 'Tipo de hash no soportado por PolySwarm',
    },
    status: {
        labels: {
            idle: 'En espera', analyzing: 'Analizando', streaming: 'Generando respuesta', done: 'Completado', error: 'Error',
        },
        emptyMessages: {
            idle: [
                'Esperando un IoC para comenzar el análisis.',
                'Lista para inspeccionar IPs, dominios y hashes.',
                'Introduce un indicador y levantaré evidencia técnica.'
            ],
            analyzing: [
                'Investigando el indicador y cruzando señales iniciales...',
                'Recabando datos de las fuentes de inteligencia...',
                'Consultando reputación, contexto y trazas disponibles...',
                'Buscando coincidencias y patrones de riesgo...'
            ],
            streaming: [
                'La IA está redactando la respuesta...',
                'Sintetizando hallazgos y priorizando señales relevantes...',
                'Consultando contexto adicional en la deep web...',
                'Consolidando evidencias para emitir un veredicto...'
            ],
            done: [
                'El análisis terminó, pero todavía no hay texto para mostrar.',
                'La respuesta llegó vacía; revisa la siguiente consulta.',
                'No se recibió contenido visible del modelo en esta ejecución.'
            ],
            error: [
                'La consulta se interrumpió antes de devolver contenido.',
                'Hubo un error durante el análisis del IoC.',
                'No fue posible completar la respuesta de la IA.'
            ]
        },
        messages: {
            idle: 'Envía un IoC para iniciar el análisis',
            analyzing: 'Recolectando evidencias de las herramientas...',
            streaming: 'La IA está redactando la respuesta...',
            done: 'Respuesta completada',
            error: 'Algo salió mal durante el análisis',
        },
    },
};
