import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	ignore: ['archive/**'],
	ignoreDependencies: [
		'@kitschpatrol/chagent', // Typically invoked through bumpp's --execute argument, which Knip doesn't parse
	],
})
