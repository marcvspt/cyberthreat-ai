import type { StreamStatus } from '@/hooks/useAnalyzeIoC.ts';

export const EMPTY_MESSAGES: Record<StreamStatus, string[]> = {
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
};

export function getRandomMessage(messages: string[], current?: string) {
    if (messages.length === 1) {
        return messages[0];
    }

    const candidates = current ? messages.filter((message) => message !== current) : messages;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getStatusMessage(status: StreamStatus) {
    if (status === 'idle') {
        return 'Envía un IoC para iniciar el análisis';
    }

    if (status === 'analyzing') {
        return 'Recolectando evidencias de las herramientas...';
    }

    if (status === 'streaming') {
        return 'La IA está redactando la respuesta...';
    }

    if (status === 'done') {
        return 'Respuesta completada';
    }

    return 'Algo salió mal durante el análisis';
}
