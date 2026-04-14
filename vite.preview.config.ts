import { defineConfig } from 'vite';

/**
 * Config Vite pour servir le build coverage Angular.
 * Utilisé uniquement pour `vite preview` (servir dist/ avec proxy API).
 * Ne remplace pas la config de build Angular — uniquement pour le preview coverage.
 */
export default defineConfig({
    preview: {
        port: 4200,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist/etudiant-frontend/browser',
    },
});
