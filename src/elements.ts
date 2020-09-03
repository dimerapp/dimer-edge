/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeContract } from 'edge.js'

import { component } from './component'
import { AstText, AstElement } from './Contracts'
import { isVoidElement, propsToAttributes } from './utils'

/**
 * The AST tags emitted by Dimer default processor
 * https://github.com/dimerapp/markdown/blob/develop/github.json
 */
const TAGS = [
	'button',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'h7',
	'h8',
	'br',
	'b',
	'i',
	'strong',
	'em',
	'a',
	'pre',
	'code',
	'img',
	'tt',
	'div',
	'ins',
	'del',
	'sup',
	'sub',
	'p',
	'ol',
	'ul',
	'table',
	'thead',
	'tbody',
	'tfoot',
	'blockquote',
	'dl',
	'dt',
	'dd',
	'kbd',
	'q',
	'samp',
	'iframe',
	'var',
	'hr',
	'ruby',
	'rt',
	'rp',
	'li',
	'tr',
	'td',
	'input',
	'th',
	's',
	'span',
	'strike',
	'summary',
	'details',
	'video',
	'source',
]

/**
 * Converting tags to elements
 */
export const elements = TAGS.reduce<{
	[key: string]: {
		init: (edge: EdgeContract) => void
		render: (node: AstElement | AstText) => ReturnType<typeof component>
	}
}>(
	(result, tag) => {
		result[tag] = {
			init: (edge) =>
				edge.registerTemplate(`dimer::${tag}`, {
					template: isVoidElement(tag)
						? [`<${tag}{{dimerUtils.propsToAttributes(node.props)}}/>`].join('\n')
						: [
								`<${tag}{{dimerUtils.propsToAttributes(node.props)}}>`,
								'@dimerTree(node.children)~',
								`</${tag}>`,
						  ].join('\n'),
				}),
			render: (node) => component(`dimer::${tag}`, { node }),
		}
		return result
	},
	{
		dimertitle: {
			init: (edge) => edge.registerTemplate('dimer::dimertitle', { template: '' }),
			render: (node) => component('dimer::dimertitle', { node }),
		},
	}
)
