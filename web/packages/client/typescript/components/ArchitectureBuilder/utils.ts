export const generateShortId = () => 'I' + Math.random().toString(16).substring(2, 10);

export function getSafeError(error: any, source: string) {
    if (error instanceof Error) {
        return { source, message: error.message || String(error), stack: error.stack || '' };
    }
    return { source, message: typeof error === 'string' ? error : JSON.stringify(error) || 'Unknown error', stack: '' };
}
