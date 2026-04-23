import type { Plugin } from 'vitest/config'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

/**
 * Emit `.d.ts` + `.d.ts.map` files via `tsc` as part of the Vite build.
 *
 * We shell out to TypeScript's own compiler (driven by `tsconfig.build.json`)
 * rather than use `rolldown-plugin-dts`: the latter has two bugs that hit this
 * setup — misnamed output filenames when `entryFileNames` lacks a `[name]`
 * template, and dropped class declarations after its Babel-based chunk
 * post-transform strips them. Direct `tsc` produces the canonical declaration
 * output Lit consumers expect, with zero surprise.
 */
function tscDtsPlugin(): Plugin {
	return {
		apply: 'build',
		closeBundle: {
			handler() {
				const tscBin = require.resolve('typescript/bin/tsc')
				const result = spawnSync(process.execPath, [tscBin, '-p', 'tsconfig.build.json'], {
					shell: false,
					stdio: 'inherit',
				})
				if (result.status !== 0) {
					throw new Error(`tsc exited with status ${result.status}`)
				}
			},
			order: 'post',
			sequential: true,
		},
		name: 'tsc-dts',
	}
}

export default defineConfig({
	build: {
		lib: {
			entry: fileURLToPath(new URL('src/cad-nauseam.ts', import.meta.url)),
			fileName: 'cad-nauseam',
			formats: ['es'],
		},
		minify: false,
		rolldownOptions: {
			external: [/^lit($|\/)/, /^@lit\//, /^lit-html($|\/)/, /^lit-element($|\/)/],
		},
		sourcemap: true,
		target: 'es2021',
	},
	plugins: [tscDtsPlugin()],
	server: {
		open: true,
	},
	test: {
		environment: 'happy-dom',
		include: ['test/**/*.test.ts'],
	},
})
