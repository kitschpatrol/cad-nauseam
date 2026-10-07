import { describe, test } from 'vitest'

describe('placeholder', () => {
	// eslint-disable-next-line test/expect-expect -- Vitest 5 benchmarks run inside `test()` and make no assertions.
	test('should pass', async ({ bench }) => {
		await bench('should pass', () => {
			// Placeholder
		}).run()
	})
})
