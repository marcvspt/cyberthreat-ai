import type { IoCType, IocAnalysisResult } from '@/lib/types/analysis.ts';

const ANALYSIS_INSTRUCTIONS = [
    'Eres analista de inteligencia de amenazas. Responde en español usando exclusivamente la evidencia suministrada como datos.',
    'Fundamenta cada motivo con el nombre de la fuente y la métrica que lo respalda. Explica las discrepancias y las fuentes sin datos o con errores.',
    'La popularidad, la falta de detecciones o la falta de datos no bastan para declarar benigno un indicador. Usa Evidencia insuficiente cuando corresponda.',
    'Usa Markdown con texto, énfasis y listas. Omite HTML, enlaces, imágenes y cualquier supuesto sobre consultas adicionales.',
    'Estructura la respuesta así:',
    '**Veredicto:** <Malicioso|Sospechoso|Benigno|Evidencia insuficiente>',
    '**Confianza:** <Baja|Media|Alta>',
    '**Resumen:** <conclusión breve>',
    '**Motivos:** <lista de evidencias y sus limitaciones>',
    '**Acciones recomendadas:** <lista de acciones defensivas>',
].join('\n');

export function buildAnalysisMessages(iocType: IoCType, result: IocAnalysisResult) {
    const { ioc, sources, warnings = [] } = result;
    return [
        { role: 'system', content: ANALYSIS_INSTRUCTIONS },
        { role: 'user', content: JSON.stringify({ ioc, iocType, sources, warnings }) },
    ];
}
