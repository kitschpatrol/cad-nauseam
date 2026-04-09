import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	ignores: ['scratch/**'],
	ts: {
		overrides: {
			'import/no-unresolved': [
				'error',
				{
					ignore: [
						'^astro:',
						'^@astrojs',
						'^virtual:',
						// Public Vite assets...
						'^/',
						// Package self-references in readme code samples, only
						// resolvable after `pnpm build` populates dist/.
						'^cad-nauseam$',
					],
				},
			],
		},
	},
	type: 'lib',
})
