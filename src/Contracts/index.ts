/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Shape of the AST element node
 */
export type AstElement = {
	type: 'element'
	tag: string
	props: any
	children: (AstElement | AstText)[]
}

/**
 * Shape of the AST text node
 */
export type AstText = {
	type: 'text'
	value: string
}

/**
 * Output of the component method
 */
export type ComponentOutput = [string, any, any?]

/**
 * Hook callback
 */
export type HookCallback = (node: AstElement) => false | void | ComponentOutput
