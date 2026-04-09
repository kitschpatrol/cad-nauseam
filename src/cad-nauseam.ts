/* eslint-disable no-bitwise, node/no-unsupported-features/node-builtins */
// Bitwise operators are the natural expression for Wolfram rule decoding
// (the rule is a packed 8-bit lookup table). `CustomEvent` is a DOM type used
// here in browser code; the node plugin false-positives on component source.

import type { PropertyValues } from 'lit'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

/** Highest decimal value for an elementary 1D CA rule (2^8 − 1). */
const MAX_RULE = 255

/** Total number of rule switches (one per 3-cell neighborhood state). */
const RULE_COUNT = 8

/** Shared external-link icon used inside About / Rule info buttons. */
function externalIcon() {
	return html`
		<svg width="10" height="10" viewBox="0 0 20 20" aria-hidden="true">
			<path d="M17 17H3V3h5V1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-2z"></path>
			<path d="M19 1h-8l3.29 3.29-5.73 5.73 1.42 1.42 5.73-5.73L19 9V1z"></path>
		</svg>
	`
}

/**
 * A Wolfram-style 1D elementary cellular automaton, rendered as scrolling
 * ASCII. Port of the vanilla-JS / MooTools original from frontiernerds.com.
 *
 * Importing this module self-registers `<cad-nauseam>`.
 *
 * Events dispatched by the element:
 * - `cad-rule-change` — `CustomEvent<{ rule: number }>` fired whenever the
 *   active rule number changes (UI toggle, number input, property assignment,
 *   or hash navigation).
 * - `cad-running-change` — `CustomEvent<{ running: boolean }>` fired when the
 *   play/pause state flips.
 */
@customElement('cad-nauseam')
export class CadNauseam extends LitElement {
	static override styles = css`
		:host {
			display: block;
			position: relative;
			box-sizing: border-box;
			block-size: 100%;
			overflow: auto;
			color: var(--cad-fg, black);
			background: var(--cad-bg, white);
			font-family: var(--cad-font, 'Courier New', Courier, monospace);
			font-size: var(--cad-font-size, 12px);
		}

		:host([page-scroll]) {
			block-size: auto;
			overflow: visible;
		}

		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}

		pre {
			margin: 0;
			padding-block-start: 1em;
			font-family: inherit;
			font-size: inherit;
			line-height: var(--cad-line-height, 0.8em);
			text-align: center;
		}

		.control-panel {
			position: sticky;
			inset-block-start: 20px;
			inset-inline-start: 20px;
			z-index: 1;
			inline-size: max-content;
			padding-inline-start: 20px;
		}

		:host([page-scroll]) .control-panel {
			position: fixed;
		}

		h1 {
			display: inline;
			margin: 0;
			font-size: inherit;
			font-weight: normal;
		}

		.rule-box {
			inline-size: 88px;
			margin-block: 10px;
			padding: 4px 4px 8px;
			background: var(--cad-bg, white);
			border: var(--cad-border, 1px solid currentColor);
		}

		.rule-box-label {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.number-box {
			inline-size: 40px;
			margin: 0;
			padding: 0 2px;
			color: inherit;
			background: var(--cad-bg, white);
			border: 1px solid currentColor;
			font: inherit;
			text-align: right;
			appearance: textfield;
		}

		.number-box::-webkit-outer-spin-button,
		.number-box::-webkit-inner-spin-button {
			appearance: none;
			margin: 0;
		}

		.number-box:focus {
			outline: none;
		}

		.rule-grid {
			display: grid;
			grid-template-columns: repeat(2, 36px);
			justify-content: center;
			margin-block-start: 8px;
		}

		.rule-control {
			position: relative;
			inline-size: 36px;
			block-size: 36px;
			cursor: pointer;
		}

		.rule-control:hover {
			background: var(--cad-fg, black);
		}

		.rule-control .box {
			position: absolute;
			inline-size: 8px;
			block-size: 8px;
			background: var(--cad-bg, white);
			border: 1px solid currentColor;
		}

		.rule-control:hover .box {
			border-color: var(--cad-bg, white);
		}

		.rule-control .box.on {
			background: currentColor;
		}

		.rule-control .a {
			inset-block-start: 7px;
			inset-inline-start: 4px;
		}

		.rule-control .b {
			inset-block-start: 7px;
			inset-inline-start: 14px;
		}

		.rule-control .c {
			inset-block-start: 7px;
			inset-inline-start: 24px;
		}

		.rule-control .switch {
			inset-block-start: 18px;
			inset-inline-start: 14px;
		}

		.rule-control:hover .switch {
			background: var(--cad-bg, white);
		}

		.rule-control.on .switch {
			background: currentColor;
		}

		.button {
			display: flex;
			align-items: center;
			gap: 6px;
			inline-size: 104px;
			block-size: 24px;
			margin-block-end: 8px;
			padding: 0 8px;
			color: inherit;
			background: var(--cad-bg, white);
			border: var(--cad-border, 1px solid currentColor);
			font: inherit;
			text-align: left;
			text-decoration: none;
			cursor: pointer;
			user-select: none;
		}

		.button:hover {
			color: var(--cad-bg, white);
			background: var(--cad-fg, black);
		}

		svg {
			vertical-align: middle;
			fill: currentColor;
		}
	`

	/** Horizontal cell count. */
	@property({ type: Number }) cols = 101

	/** Target tick interval in milliseconds. Throttled against rAF. */
	@property({ type: Number }) interval = 15

	/** Whether the simulation is advancing. Reflects to `running` attribute. */
	@property({ attribute: 'running', reflect: true, type: Boolean })
	isRunning = true

	/**
	 * Maximum rows retained before the oldest are dropped. `0` (default)
	 * matches the original — unbounded, memory grows linearly with runtime.
	 */
	@property({ attribute: 'max-rows', type: Number }) maxRows = 0

	/** Wolfram rule number, clamped to 0–255. Reflected to attribute. */
	@property({ reflect: true, type: Number }) rule = 90

	/**
	 * Take over window scrolling with a fixed control panel, matching the
	 * original document-dominating behavior. Off by default — the component
	 * scrolls inside its own shadow root with a sticky control panel.
	 */
	@property({ attribute: 'page-scroll', reflect: true, type: Boolean })
	shouldPageScroll = false

	/** Mirror `rule` to `window.location.hash`. Off by default. */
	@property({ attribute: 'sync-hash', type: Boolean }) shouldSyncHash = false

	#hasHashListener = false
	#lastTick = 0
	#nextGen: Uint8Array = new Uint8Array(this.cols)
	#pre: HTMLPreElement | undefined
	#rafId: number | undefined
	#ruleInput: HTMLInputElement | undefined
	#thisGen: Uint8Array = new Uint8Array(this.cols)

	override disconnectedCallback(): void {
		super.disconnectedCallback()
		this.#stopLoop()
		if (this.#hasHashListener) {
			globalThis.removeEventListener('hashchange', this.#onHashChange)
			this.#hasHashListener = false
		}
	}

	override firstUpdated(): void {
		const pre = this.renderRoot.querySelector('pre')
		this.#pre = pre ?? undefined

		const input = this.renderRoot.querySelector('.number-box')
		if (input instanceof HTMLInputElement) {
			this.#ruleInput = input
			this.#ruleInput.value = String(this.rule)
		}

		this.#seed()
		if (this.isRunning) this.#startLoop()
	}

	override render() {
		return html`
			<div class="control-panel" part="control-panel">
				<h1>CAd nauseam</h1>
				<div class="rule-box" part="rule-box">
					<label class="rule-box-label">
						Rule
						<input
							class="number-box"
							type="number"
							inputmode="numeric"
							min="0"
							max=${MAX_RULE}
							@change=${this.#onRuleChange}
						/>
					</label>
					<div class="rule-grid">
						${Array.from({ length: RULE_COUNT }, (_value, index) => this.#renderRuleControl(index))}
					</div>
				</div>
				<button type="button" class="button" part="button" @click=${this.#onReseed}>Reseed</button>
				<button type="button" class="button" part="button" @click=${this.#onTogglePlay}>
					${this.isRunning ? 'Stop' : 'Go'}
				</button>
				<a
					class="button"
					part="button"
					href="https://frontiernerds.com/ascii-ca"
					target="_blank"
					rel="noopener noreferrer"
				>
					About${externalIcon()}
				</a>
				<a
					class="button"
					part="button"
					href=${this.#infoLinkHref()}
					target="_blank"
					rel="noopener noreferrer"
				>
					Rule info${externalIcon()}
				</a>
			</div>
			<pre part="grid"></pre>
		`
	}

	override updated(changed: PropertyValues<this>): void {
		if (changed.has('cols') && this.#thisGen.length !== this.cols) {
			this.#thisGen = new Uint8Array(this.cols)
			this.#nextGen = new Uint8Array(this.cols)
			this.#seed()
		}

		if (changed.has('rule')) {
			this.#syncRuleInput()
			this.#updateHash()
			this.dispatchEvent(
				new CustomEvent('cad-rule-change', {
					bubbles: true,
					composed: true,
					detail: { rule: this.rule },
				}),
			)
		}

		if (changed.has('isRunning')) {
			if (this.isRunning) this.#startLoop()
			else this.#stopLoop()
			this.dispatchEvent(
				new CustomEvent('cad-running-change', {
					bubbles: true,
					composed: true,
					detail: { running: this.isRunning },
				}),
			)
		}

		if (changed.has('shouldSyncHash')) {
			if (this.shouldSyncHash && !this.#hasHashListener) {
				globalThis.addEventListener('hashchange', this.#onHashChange)
				this.#hasHashListener = true
				this.#applyHash()
			} else if (!this.shouldSyncHash && this.#hasHashListener) {
				globalThis.removeEventListener('hashchange', this.#onHashChange)
				this.#hasHashListener = false
			}
		}
	}

	#appendRow(): void {
		const pre = this.#pre
		if (!pre) return
		const current = this.#thisGen
		const { cols } = this
		let row = ''
		for (let i = 0; i < cols; i++) {
			row += current[i] === 1 ? 'X' : ' '
		}
		pre.append(`${row}\n`)
		if (this.maxRows > 0) {
			while (pre.childNodes.length > this.maxRows) {
				pre.firstChild?.remove()
			}
		}
	}

	#applyHash(): void {
		const hash = globalThis.location.hash.slice(1)
		if (hash.length === 0) return
		const parsed = Number.parseInt(hash, 10)
		if (!Number.isFinite(parsed)) return
		this.rule = Math.max(0, Math.min(MAX_RULE, parsed))
	}

	#autoScroll(): void {
		if (this.shouldPageScroll) {
			globalThis.scrollTo(0, document.documentElement.scrollHeight)
		} else {
			this.scrollTop = this.scrollHeight
		}
	}

	#generate(): void {
		const current = this.#thisGen
		const next = this.#nextGen
		const { cols, rule } = this
		// Edges are carried over unchanged (matching the original).
		next[0] = current[0]
		next[cols - 1] = current[cols - 1]
		// Rolling 3-cell window to avoid redundant array reads.
		let l = current[0]
		let m = current[1]
		for (let i = 1; i < cols - 1; i++) {
			const r = current[i + 1]
			next[i] = (rule >>> ((l << 2) | (m << 1) | r)) & 1
			l = m
			m = r
		}
		this.#thisGen = next
		this.#nextGen = current
	}

	#infoLinkHref(): string {
		return `https://www.wolframalpha.com/input/?i=cellular+automaton+rule+${this.rule}`
	}

	readonly #onHashChange = (): void => {
		this.#applyHash()
	}

	readonly #onReseed = (): void => {
		this.#seed()
	}

	readonly #onRuleChange = (event: Event): void => {
		const input = event.currentTarget
		if (!(input instanceof HTMLInputElement)) return
		const parsed = Number.parseInt(input.value, 10)
		const next = Number.isFinite(parsed) ? Math.max(0, Math.min(MAX_RULE, parsed)) : this.rule
		input.value = String(next)
		this.rule = next
	}

	readonly #onTogglePlay = (): void => {
		this.isRunning = !this.isRunning
	}

	#renderRuleControl(index: number) {
		// UI index i displays the (a, b, c) triple for neighborhood bit (7 − i):
		// index 0 → (1,1,1) → rule bit 7, index 7 → (0,0,0) → rule bit 0.
		const neighborhood = 7 - index
		const a = (neighborhood >> 2) & 1
		const b = (neighborhood >> 1) & 1
		const c = neighborhood & 1
		const isOn = ((this.rule >>> neighborhood) & 1) === 1
		return html`
			<div
				class=${classMap({ on: isOn, 'rule-control': true })}
				part="rule-control"
				@click=${(): void => {
					this.#toggleRuleBit(neighborhood)
				}}
			>
				<div class=${classMap({ a: true, box: true, on: a === 1 })}></div>
				<div class=${classMap({ b: true, box: true, on: b === 1 })}></div>
				<div class=${classMap({ box: true, c: true, on: c === 1 })}></div>
				<div class=${classMap({ box: true, on: isOn, switch: true })}></div>
			</div>
		`
	}

	#seed(): void {
		this.#thisGen.fill(0)
		const center = Math.floor(this.cols / 2)
		if (center >= 0 && center < this.cols) {
			this.#thisGen[center] = 1
		}
		if (this.#pre) {
			this.#pre.textContent = ''
		}
	}

	#startLoop(): void {
		if (this.#rafId !== undefined) return
		if (typeof globalThis.requestAnimationFrame !== 'function') return
		this.#lastTick = 0
		this.#rafId = globalThis.requestAnimationFrame(this.#tick)
	}

	#stopLoop(): void {
		if (this.#rafId === undefined) return
		globalThis.cancelAnimationFrame(this.#rafId)
		this.#rafId = undefined
	}

	#syncRuleInput(): void {
		const input = this.#ruleInput
		if (!input) return
		const { renderRoot } = this
		const isFocused = renderRoot instanceof ShadowRoot && renderRoot.activeElement === input
		if (!isFocused) {
			input.value = String(this.rule)
		}
	}

	readonly #tick = (timestamp: number): void => {
		this.#rafId = globalThis.requestAnimationFrame(this.#tick)
		if (!this.isRunning) return
		if (timestamp - this.#lastTick < this.interval) return
		this.#lastTick = timestamp
		this.#appendRow()
		this.#generate()
		this.#autoScroll()
	}

	#toggleRuleBit(neighborhood: number): void {
		this.rule = (this.rule ^ (1 << neighborhood)) & MAX_RULE
	}

	#updateHash(): void {
		if (!this.shouldSyncHash) return
		const desired = `#${this.rule}`
		if (globalThis.location.hash !== desired) {
			globalThis.history.replaceState(undefined, '', desired)
		}
	}
}

declare global {
	// Declaration merging into the built-in HTMLElementTagNameMap requires an
	// interface — the name is fixed by the DOM lib.
	// eslint-disable-next-line ts/consistent-type-definitions, ts/naming-convention
	interface HTMLElementTagNameMap {
		'cad-nauseam': CadNauseam
	}
}
