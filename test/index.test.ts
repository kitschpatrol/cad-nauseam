/* eslint-disable node/no-unsupported-features/node-builtins */
// `CustomEvent` and `Event` are DOM types exercised in happy-dom.

import { beforeEach, describe, expect, it } from 'vitest'
import { CadNauseam } from '../src/cad-nauseam.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

async function mount(setup?: (element: CadNauseam) => void): Promise<CadNauseam> {
	const element = document.createElement('cad-nauseam')
	// Don't start the rAF loop in tests unless a specific test wants it.
	element.isRunning = false
	setup?.(element)
	document.body.append(element)
	await element.updateComplete
	return element
}

describe('cad-nauseam', () => {
	beforeEach(() => {
		for (const node of document.body.querySelectorAll('cad-nauseam')) {
			node.remove()
		}
		if (globalThis.location.hash.length > 0) {
			globalThis.history.replaceState(undefined, '', ' ')
		}
	})

	it('is registered as a custom element', () => {
		expect(customElements.get('cad-nauseam')).toBe(CadNauseam)
	})

	it('renders the control panel and an ascii grid', async () => {
		const element = await mount()
		const root = element.shadowRoot
		expect(root?.querySelector('.control-panel')).toBeTruthy()
		expect(root?.querySelector('pre')).toBeTruthy()
		expect(root?.querySelectorAll('.rule-control').length).toBe(8)
	})

	it('defaults to rule 90 and renders a matching rule-control state', async () => {
		const element = await mount()
		expect(element.rule).toBe(90)
		// Rule 90 = 0b01011010 → UI controls for neighborhood bits 6, 4, 3, 1 are on.
		const controls = element.shadowRoot?.querySelectorAll('.rule-control') ?? []
		const onBits: number[] = []
		for (const [index, node] of [...controls].entries()) {
			if (node.classList.contains('on')) onBits.push(7 - index)
		}
		expect(onBits.toSorted((a, b) => a - b)).toEqual([1, 3, 4, 6])
	})

	it('clamps rule values above 255 via the number input', async () => {
		const element = await mount()
		const input = element.shadowRoot?.querySelector('.number-box')
		if (!(input instanceof HTMLInputElement)) throw new Error('input not found')
		input.value = '999'
		input.dispatchEvent(new Event('change', { bubbles: true }))
		await element.updateComplete
		expect(element.rule).toBe(255)
		expect(input.value).toBe('255')
	})

	it('ignores non-numeric input by keeping the previous rule', async () => {
		const element = await mount((current) => {
			current.rule = 30
		})
		const input = element.shadowRoot?.querySelector('.number-box')
		if (!(input instanceof HTMLInputElement)) throw new Error('input not found')
		input.value = ''
		input.dispatchEvent(new Event('change', { bubbles: true }))
		await element.updateComplete
		expect(element.rule).toBe(30)
	})

	it('toggles a rule bit on click and fires cad-rule-change', async () => {
		const element = await mount((current) => {
			current.rule = 0
		})
		const ruleEvents: number[] = []
		element.addEventListener('cad-rule-change', (event) => {
			if (!(event instanceof CustomEvent)) return
			// eslint-disable-next-line prefer-destructuring
			const detail: unknown = event.detail
			if (isRecord(detail) && typeof detail.rule === 'number') {
				ruleEvents.push(detail.rule)
			}
		})
		// Click the last rule-control (UI index 7 → neighborhood bit 0 → rule = 1).
		const controls = element.shadowRoot?.querySelectorAll('.rule-control')
		if (!controls || controls.length === 0) throw new Error('rule-control not found')
		const last = [...controls].at(-1)
		if (!(last instanceof HTMLElement)) throw new Error('rule-control not an element')
		last.click()
		await element.updateComplete
		expect(element.rule).toBe(1)
		expect(ruleEvents).toContain(1)
	})

	it('reflects isRunning to the running attribute and fires cad-running-change', async () => {
		const element = await mount()
		let runningFromEvent: boolean | undefined
		element.addEventListener('cad-running-change', (event) => {
			if (!(event instanceof CustomEvent)) return
			// eslint-disable-next-line prefer-destructuring
			const detail: unknown = event.detail
			if (isRecord(detail) && typeof detail.running === 'boolean') {
				runningFromEvent = detail.running
			}
		})
		element.isRunning = true
		await element.updateComplete
		expect(element.hasAttribute('running')).toBe(true)
		expect(runningFromEvent).toBe(true)
		element.isRunning = false
		await element.updateComplete
		expect(element.hasAttribute('running')).toBe(false)
		expect(runningFromEvent).toBe(false)
	})

	it('reseed button clears the grid', async () => {
		const element = await mount()
		const pre = element.shadowRoot?.querySelector('pre')
		if (!pre) throw new Error('pre not found')
		// Manually dirty the grid to simulate prior ticks.
		pre.append('garbage\n')
		const buttons = element.shadowRoot?.querySelectorAll('button') ?? []
		let reseedButton: HTMLButtonElement | undefined
		for (const button of buttons) {
			if (button.textContent.trim() === 'Reseed') {
				reseedButton = button
				break
			}
		}
		if (!reseedButton) throw new Error('reseed button not found')
		reseedButton.click()
		await element.updateComplete
		expect(pre.textContent).toBe('')
	})

	it('reallocates generation buffers when cols changes', async () => {
		const element = await mount()
		element.cols = 21
		await element.updateComplete
		const pre = element.shadowRoot?.querySelector('pre')
		expect(pre?.textContent).toBe('')
		expect(element.cols).toBe(21)
	})

	it('does not touch window.location.hash when shouldSyncHash is off', async () => {
		const element = await mount((current) => {
			current.rule = 30
		})
		expect(globalThis.location.hash).toBe('')
		element.rule = 110
		await element.updateComplete
		expect(globalThis.location.hash).toBe('')
	})

	it('mirrors rule to window.location.hash when shouldSyncHash is enabled', async () => {
		const element = await mount((current) => {
			current.shouldSyncHash = true
			current.rule = 30
		})
		await element.updateComplete
		expect(globalThis.location.hash).toBe('#30')
		element.rule = 110
		await element.updateComplete
		expect(globalThis.location.hash).toBe('#110')
	})
})
