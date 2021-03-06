/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import info from 'property-information'
import { htmlEscape } from 'escape-goat'
import toString from 'hast-util-to-string'
import { AstElement, AstText } from '../Contracts'

const VOID_ELEMENTS = [
	'area',
	'base',
	'basefont',
	'bgsound',
	'br',
	'col',
	'command',
	'embed',
	'frame',
	'hr',
	'image',
	'img',
	'input',
	'isindex',
	'keygen',
	'link',
	'menuitem',
	'meta',
	'nextid',
	'param',
	'source',
	'track',
	'wbr',
]

/**
 * Find if element is a void element or not
 */
export function isVoidElement(element: string) {
	return VOID_ELEMENTS.includes(element)
}

/**
 * Converts AST props to HTML
 */
export function propsToAttributes(props: any) {
	const attributes = Object.keys(props)
	if (attributes.length === 0) {
		return ''
	}

	return ` ${attributes
		.reduce<string[]>((result, key) => {
			const propInfo = info.find(info.html, key)
			if (!propInfo || propInfo.space === 'svg') {
				return result
			}

			let value = props[key]

			/**
			 * Join array values with correct seperator
			 */
			if (Array.isArray(value)) {
				value = value.join(propInfo.commaSeparated ? ',' : ' ')
			}

			/**
			 * Wrap values inside double quotes when not booleanish
			 */
			if (!propInfo.booleanish) {
				value = `"${htmlEscape(value)}"`
			}

			/**
			 * Push key value string
			 */
			result.push(`${propInfo.attribute}=${value}`)

			return result
		}, [])
		.join(' ')}`
}

/**
 * Returns a boolean telling if an element has a specific
 * given class name
 */
export function hasClass(node: AstElement, className: string) {
	return getClasses(node).includes(className)
}

/**
 * Returns an classes for a node. The method ensures that you always
 * get back an array, even when no classes are defined
 */
export function getClasses(node: AstElement): string[] {
	if (!node.props || !node.props.className) {
		return []
	}

	if (typeof node.props.className === 'string') {
		return [node.props.className]
	}

	if (Array.isArray(node.props.className)) {
		return node.props.className
	}

	return []
}

/**
 * Returns raw string for a node
 */
export function getText(node: AstElement | AstText): string {
	return toString(node)
}
