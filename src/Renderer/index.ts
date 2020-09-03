/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeContract } from 'edge.js'

import * as utils from '../utils'
import { elements } from '../elements'
import { component } from '../component'
import { DimerTree } from '../DimerTree'
import {
	AstText,
	AstElement,
	HookCallback,
	ComponentOutput
} from '../Contracts'

const NOOP = ['dimer::noop', {}] as ComponentOutput

/**
 * Renderer hooks into edge to allow rendering the dimer
 * markdown AST
 */
export class Renderer {
	/**
	 * Registered hooks
	 */
	private hooks: HookCallback[] = []

	/**
	 * Registered listeners
	 */
	private onNodeListeners: ((node: AstElement | AstText) => void)[] = []

	constructor(private edge: EdgeContract) {
		this.registerTag()
		this.registerElements()
		this.registerTextComponent()
		this.registerGlobals()
	}

	/**
	 * Registers dimer tag
	 */
	private registerTag() {
		this.edge.registerTag(DimerTree(this))
	}

	/**
	 * Registers dimer utils
	 */
	private registerGlobals() {
		this.edge.global('dimerUtils', utils)
	}

	/**
	 * Registers elements, which inturn registers components
	 */
	private registerElements() {
		Object.keys(elements).forEach((tag) => elements[tag].init(this.edge))
	}

	/**
	 * Register the component to render the final raw text node
	 */
	private registerTextComponent() {
		this.edge.registerTemplate('dimer::text', { template: '{{node.value}}' })
		this.edge.registerTemplate('dimer::noop', { template: '' })
	}

	/**
	 * Notify the listeners about the element
	 */
	private notifyListeners(node: AstElement | AstText) {
		this.onNodeListeners.forEach((listener) => listener(node))
	}

	/**
	 * Register a on node listener to observe the nodes rendered
	 * by edge
	 */
	public onNode(callback: (node: AstElement | AstText) => void): this {
		this.onNodeListeners.push(callback)
		return this
	}

	/**
	 * Register a custom hook. Hooks allows to define custom components for
	 * certain nodes
	 */
	public hook(callback: HookCallback): this {
		this.hooks.push(callback)
		return this
	}

	/**
	 * Returns the component for a given AST node
	 */
	public getComponentFor(node: AstElement | AstText): ReturnType<typeof component> {
		if (node.type === 'text') {
			this.notifyListeners(node)
			return ['dimer::text', { node }]
		}

		let customComponent: ReturnType<HookCallback>

		/**
		 * Loop all over all the hooks and stop when first hook returns a
		 * value
		 */
		for (let hook of this.hooks) {
			customComponent = hook(node)
			if (customComponent !== undefined) {
				break
			}
		}

		/**
		 * In case of false, skip the node
		 */
		if (customComponent === false) {
			return NOOP
		}

		/**
		 * Return custom component
		 */
		if (customComponent !== undefined) {
			this.notifyListeners(node)
			return customComponent
		}

		/**
		 * Pass value to the tag handler when defined
		 */
		if (elements[node.tag]) {
			this.notifyListeners(node)
			return elements[node.tag].render(node)
		}

		/**
		 * Cannot handle node
		 */
		throw new Error(`dimer-edge cannot render "${node.tag}" tag. Register custom hook to render it`)
	}
}
