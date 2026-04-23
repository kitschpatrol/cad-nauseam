import { defineConfig } from 'vite'

/**
 * Production build config for the deployable playground site.
 *
 * Separate from `vite.config.ts`, which builds the Lit component as a
 * library to `./dist/`. This config builds `index.html` into
 * `./site/cad-nauseam/` so the output mirrors the Cloudflare route
 * (`frontiernerds.com/cad-nauseam*`) — Workers Static Assets looks up
 * files by the full URL path, so files must live under a `cad-nauseam/`
 * subdirectory inside the assets directory.
 */
export default defineConfig({
	base: '/cad-nauseam/',
	build: {
		emptyOutDir: true,
		outDir: 'site/cad-nauseam',
		sourcemap: true,
		target: 'es2021',
	},
})
