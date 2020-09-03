/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { GLOBALS } from 'edge.js'
import info from 'property-information'
import { htmlEscape } from 'escape-goat'
import voidElements from 'html-void-elements'
import { AstElement } from '../Contracts'

/**
 * Find if element is a void element or not
 */
export function isVoidElement(element: string) {
	return voidElements.includes(element)
}

/**
 * Converts AST props to HTML
 */
export function propsToAttributes(props: any) {
	const attributes = Object.keys(props)
	if (attributes.length === 0) {
		return ''
	}

	return GLOBALS.safe(
		` ${attributes
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
	)
}

/**
 * Returns a boolean telling if an element has a specific
 * given class name
 */
export function hasClass(node: AstElement, className: string) {
	if (!node || !node.props || !node.props.className) {
		return false
	}

	if (typeof node.props.className === 'string') {
		return node.props.className === className
	}

	if (Array.isArray(node.props.className)) {
		return node.props.className.includes(className)
	}

	return false
}
