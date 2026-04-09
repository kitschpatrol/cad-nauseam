import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * A placeholder `<demo-component>` web component.
 *
 * Importing this module self-registers the `<demo-component>` custom element.
 */
@customElement('demo-component')
export class DemoComponent extends LitElement {
	static override styles = css`
		:host {
			display: block;
			font-family: system-ui, sans-serif;
			color: inherit;
		}

		.container {
			padding: 1rem;
			border: 1px solid currentColor;
			border-radius: 0.5rem;
		}
	`

	/** Label shown above the default slot. */
	@property({ type: String }) label = 'demo-component'

	override render() {
		return html`
			<div part="container" class="container">
				<h2>${this.label}</h2>
				<slot></slot>
			</div>
		`
	}
}

declare global {
	// Declaration merging into the built-in HTMLElementTagNameMap requires an
	// interface — the name is fixed by the DOM lib.
	// eslint-disable-next-line ts/consistent-type-definitions, ts/naming-convention
	interface HTMLElementTagNameMap {
		'demo-component': DemoComponent
	}
}
