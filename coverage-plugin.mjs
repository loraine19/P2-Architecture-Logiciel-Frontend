/**
 * Plugin pour le coverage Cypress e2e avec Angular 21.
 *
 * Utilise l'API native d'Angular `instrumentForCoverage` (conçue pour Karma/--code-coverage),
 * qui instrumente chaque fichier TypeScript APRÈS compilation par le compilateur Angular.
 * Cela donne un coverage par fichier source (et non par bundle), compatible avec @cypress/code-coverage.
 *
 * @param {object} builderOptions - les options du builder Angular, mutées pour ajouter instrumentForCoverage
 */
export default (builderOptions) => {
    builderOptions.instrumentForCoverage = (filename) => {
        const normalized = filename.replace(/\\/g, '/');
        return (
            normalized.includes('/src/') &&
            !normalized.includes('node_modules') &&
            !normalized.includes('.spec.') &&
            !normalized.includes('.e2e.') &&
            !normalized.endsWith('/main.ts')
        );
    };

    // Aucun plugin esbuild supplémentaire nécessaire — l'instrumentation est gérée par Angular
    return [];
};

