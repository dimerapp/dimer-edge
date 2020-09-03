/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Edge } from 'edge.js'
import Markdown from '@dimerapp/markdown'

import { hasClass } from '../src/utils'
import { Renderer } from '../src/Renderer'
import { component } from '../src/component'

test.group('Renderer', () => {
	test('render markdown ast to html', async (assert) => {
		const edge = new Edge()
		new Renderer(edge)
		edge.registerTemplate('guides', { template: '@dimerTree(ast.contents.children)' })

		const markdown = ['# Hello world', 'This is a markdown paragraph'].join('\n\n')

		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { ast })
		assert.equal(
			html,
			'<h1 id="hello-world"><a href="#hello-world" aria-hidden=true><span class="icon icon-link"></span></a>Hello world</h1><p>This is a markdown paragraph</p>'
		)
	})

	test('render void elements correctly', async (assert) => {
		const edge = new Edge()
		edge.registerTemplate('guides', { template: '@dimerTree(ast.contents.children)' })
		new Renderer(edge)

		const markdown = ['![](foo.jpg)'].join('\n\n')

		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { ast })
		assert.equal(
			html,
			'<p><img src="foo.jpg"/></p>'
		)
	})

	test('render macros', async (assert) => {
		const edge = new Edge()
		edge.registerTemplate('guides', { template: '@dimerTree(ast.contents.children)' })
		new Renderer(edge)

		const markdown = ['[note]', 'Hello', '[/note]'].join('\n\n')

		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { ast })
		assert.equal(
			html,
			'<div class="alert alert-note"><p>Hello</p></div>'
		)
	})

	test('render node using custom hook', async (assert) => {
		const edge = new Edge()
		const render = new Renderer(edge)
		edge.registerTemplate('guides', { template: '@dimerTree(ast.contents.children)' })
		edge.registerTemplate('custom-alert', {
			template: ['<div class="note">', '@dimerTree(alert.children)~', '</div>'].join('\n'),
		})

		render.hook((node) => {
			if(node.tag === 'div' && hasClass(node, 'alert')) {
				return component('custom-alert', { alert: node })
			}
		})

		const markdown = ['[note]', 'Hello', '[/note]'].join('\n\n')

		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { ast })
		assert.equal(
			html,
			'<div class="note"><p>Hello</p></div>'
		)
	})

	test('skip nodes from getting rendered', async (assert) => {
		const edge = new Edge()
		const render = new Renderer(edge)
		edge.registerTemplate('guides', { template: '@dimerTree(ast.contents.children)' })

		render.hook((node) => {
			if(node.tag === 'div' && hasClass(node, 'alert')) {
				return false
			}
		})

		const markdown = ['[note]', 'Hello', '[/note]'].join('\n\n')

		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { ast })
		assert.equal(
			html,
			''
		)
	})

	test('define node listener', async (assert) => {
		const stack: any[] = []

		const edge = new Edge()
		const renderer = new Renderer(edge)
		edge.registerTemplate('guides', { template: '@dimerTree(ast.contents.children)' })

		renderer.onNode((node) => (stack.push(node)))

		const markdown = ['[note]', 'Hello', '[/note]'].join('\n\n')

		const ast = await new Markdown(markdown).toJSON()
		const html = edge.render('guides', { ast })
		assert.equal(
			html,
			'<div class="alert alert-note"><p>Hello</p></div>'
		)
		assert.deepEqual(stack, [
			{
				type: 'element',
				tag: 'div',
				props: {
					className: ['alert', 'alert-note'],
				},
				children: [
					{
						type: 'element',
						tag: 'p',
						props: {},
						children: [{ type: 'text', value: 'Hello' }],
					}
				],
			},
			{
				type: 'element',
				tag: 'p',
				props: {},
				children: [{ type: 'text', value: 'Hello' }],
			},
			{ type: 'text', value: 'Hello' }
		])
	})
})
