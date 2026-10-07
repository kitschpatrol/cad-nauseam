import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	ignore: ['archive/**'],
	ignoreBinaries: ['mkcert', 'open'],
})
