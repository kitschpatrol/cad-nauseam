import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'

const base = '/cad-nauseam'

export default defineConfig({
	base,
	build: {
		outDir: 'site',
		sourcemap: true,
		target: 'es2021',
	},
	plugins: [
		cloudflare({
			/* eslint-disable ts/naming-convention -- Cloudflare's configuration requires these property names. */
			config: {
				assets: {
					base_path: base,
					html_handling: 'drop-trailing-slash',
				},
				compatibility_date: '2026-04-22',
				name: 'cad-nauseam',
				observability: { enabled: true },
				preview_urls: false,
				routes: [`frontiernerds.com${base}*`],
				workers_dev: false,
			},
			/* eslint-enable ts/naming-convention */
		}),
	],
	server: {
		open: process.env.CI === undefined,
	},
})
