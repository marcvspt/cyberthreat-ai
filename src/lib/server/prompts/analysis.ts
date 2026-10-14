import type { IoCType, IocAnalysisResult } from '@/lib/types/analysis.ts';

export function buildPrompt(ioc: string, iocType: IoCType, toolResult: IocAnalysisResult) {
    const warnings = toolResult.warnings || []
    const warningsText = warnings.length > 0
        ? `\nNote: ${warnings.map((w) => w.message).join('; ')}`
        : ''

    return [
        'You are a senior cyber threat intelligence analyst.',
        'Analyze the provided indicator of compromise and respond in Spanish.',
        'Classify it as malicious (Malicioso), suspicious (Sospechoso), or benign (Benigno).',
        'Response with markdon.',
        'Use this structure exactly:',
        '**Veredicto:** <Malicioso|Sospechoso|Benigno>',
        '**Confianza:** <Baja|Media|Alta>',
        '\n**Resumen:** <short summary of the analysis>',
        '\n**Motivos:**',
        '- <reason>',
        '- <reason>',
        '\n**Acciones recomendadas:**',
        '- <action>',
        '- <action>',
        `IoC: ${ioc}`,
        `IoC type: ${iocType}`,
        `Tool output: ${JSON.stringify(toolResult)}`,
        warningsText
    ].filter(line => line !== '').join('\n')
}
