import { describe, expect, it } from 'vitest'
import { DemoComponent } from '../src/demo-component.ts'

describe('demo-component', () => {
	it('is registered as a custom element', () => {
		expect(customElements.get('demo-component')).toBe(DemoComponent)
	})

	it('renders with the default label', async () => {
		const element = document.createElement('demo-component')
		document.body.append(element)
		await element.updateComplete
		expect(element.shadowRoot?.querySelector('h2')?.textContent).toContain('demo-component')
		element.remove()
	})

	it('reflects an updated label property', async () => {
		const element = document.createElement('demo-component')
		element.label = 'Test Label'
		document.body.append(element)
		await element.updateComplete
		expect(element.shadowRoot?.querySelector('h2')?.textContent).toContain('Test Label')
		element.remove()
	})
})
