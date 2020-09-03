# Dimer Edge

> Render dimer AST using [Edge.js](https://preview.adonisjs.com/guides/views/introduction/) components.

[![circleci-image]][circleci-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

Dimer edge is a renderer package for dimer to hook into the process of generating HTML and use Edge components to render AST nodes.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Why use Edge.js components?](#why-use-edgejs-components)
- [Usage](#usage)
  - [Render AST to HTML](#render-ast-to-html)
- [Defining hooks](#defining-hooks)
    - [A paragraph node](#a-paragraph-node)
    - [An anchor tag node](#an-anchor-tag-node)
    - [Node for a custom macro](#node-for-a-custom-macro)
    - [Step 1: Define hook](#step-1-define-hook)
    - [Step 2: Create the component](#step-2-create-the-component)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why use Edge.js components?

The simplest option is to convert markdown to HTML directly and render it on a webpage.

To add some fun to this process (not just really for fun), we generate an AST (Abstract syntax tree) from the markdown and then convert that tree to HTML.

This AST hop in between gives us the freedom to structure our HTML the way we want over relying on the markdown engine to decide the HTML output.

## Usage

Install the package from the npm package registry.

```sh
npm i dimer-edge

# for yarn users
yarn add dimer-edge
```

### Render AST to HTML

Following is the setup code to render the AST to HTML using an edge view. Later we will look into the hooks process.

```ts
import { join } from 'path'
import { Edge } from 'edge.js'
import { Renderer } from 'dimer-edge'
import Markdown from '@dimerapp/markdown'

/**
 * Setup edge
 */
const edge = new Edge()
edge.mount(join(__dirname, 'views'))

/**
 * Instantiate renderer and pass it the edge reference
 */
new Renderer(edge)

/**
 * Dummy markdown
 */
const markdownText = `
## Heading 2

A paragraph with an [anchor]()

- List item 1
- List item 2

[note]
This is a note
[/note]
`

/**
 * Convert markdown to AST
 */
const doc = await new Markdown(markdownText).toJSON()

/**
 * Enter edge views as normal
 */
edge.render('guides', { doc })
```

Inside the `views/guides.edge` file you can make use the `@dimerTree` tag to render the AST nodes.

```edge
@dimerTree(doc.contents.children)
```

At this point, the output is not different or special over converting Markdown to HTML directly. But wait, we will make it special using hooks.

## Defining hooks

The renderer instance allows you to define hooks and use a custom component for any node of the AST. So, first let's visualize the AST nodes.

#### A paragraph node

```json
{
  "type": "element",
  "tag": "p",
  "props": {},
  "children": [{ "type": "text", "value": "Hello" }]
}
```

#### An anchor tag node

```json
{
  "type": "element",
  "tag": "a",
  "props": {
    "href": "https://google.com"
  },
  "children": [
    {
      "type": "text",
      "value": "google"
    }
  ]
}
```

#### Node for a custom macro

The following node is the output of the custom `[tip]` macro.

```json
{
  "type": "element",
  "tag": "div",
  "props": {
    "className": ["alert", "alert-tip"]
  },
  "children": [
    {
      "type": "element",
      "tag": "p",
      "props": {},
      "children": [{ "type": "text", "value": "Hello" }]
    }
  ]
}
```

Now, let's say we want to hook into the rendering processes and design the alert boxes using Tailwind CSS classes.

#### Step 1: Define hook

The first step is to define a hook to render a custom component for all the alerts.

```ts
import { utils, component } from 'dimer-edge'

const renderer = new Renderer(edge)

renderer.hook((node) => {
  if (utils.hasClass(node, 'alert')) {
    let alertType = 'alert'

    switch (node.props.className[1]) {
      case 'alert-tip':
        alertType = 'tip'
        break
      case 'alert-note':
        alertType = 'note'
        break
      case 'alert-warning':
        alertType = 'warning'
        break
    }

    return component('components/alert', {
      node: node,
      type: alertType,
    })
  }
})
```

#### Step 2: Create the component

Creating a regular edge template named `components/alert.edge`.

```edge
@set('classes', {
	tip: 'bg-teal-100 border-teal-500 text-teal-900',
	note: 'bg-indigo-100 border-indigo-500 text-indigo-900',
	warning: 'bg-orange-100 border-orange-500 text-orange-900',
})

@set('iconClasses', {
	tip: 'text-teal-500',
	note: 'text-indigo-500',
	warning: 'text-orange-500',
})

<div class="border-t-4 rounded-b px-4 py-3 shadow-md {{classes[type]}}" role="alert">
  <div class="flex">
    <div class="py-1">
      <svg
        class="fill-current h-6 w-6 {{iconClasses[type]}} mr-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path
          d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"
        />
      </svg>
    </div>
    <div>@dimerTree(node.children)~</div>
  </div>
</div>
```

As of you can notice, we can freely define the markup of our alert component. Just make sure to render all the `children` nodes using `@dimerTree` component.

[circleci-image]: https://img.shields.io/circleci/project/github/dimerapp/dimer-edge/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/dimerapp/dimer-edge 'circleci'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
[npm-image]: https://img.shields.io/npm/v/dimer-edge.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/dimer-edge 'npm'
[license-image]: https://img.shields.io/npm/l/dimer-edge?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md 'license'
