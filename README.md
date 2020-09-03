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

At this point, the output is nothing special or different from converting Markdown to HTML directly.

## Defining hooks

The renderer instance allows you to define hooks and use a custom component for any node of the AST. So, first let's visualize the AST nodes.

#### A paragraph node
```json
{
  type: 'element',
  tag: 'p',
  props: {},
  children: [{ type: 'text', value: 'Hello' }],
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
    "className": ["alert", "alert-tip"],
  },
  "children": [
    {
      "type": "element",
      "tag": "p",
      "props": {},
      "children": [{ "type": "text", value: "Hello" }],
    }
  ],
}
```

Now, let's say we want to hook into the rendering processes and design the alert boxes using Tailwind CSS classes.

#### Step 1: Define hook

The first step is to define a hook to render a custom component for all the alerts.
 
```ts
import { utils, component } from 'dimer-edge'

renderer.hook((node) => {
  if(utils.hasClass(node, 'alert')) {
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
      type: alertType
    })
  } 
})
```

#### Step 2: Create the component

Creating a regular edge template named `components/alert.edge`.

```html

```

[circleci-image]: https://img.shields.io/circleci/project/github/dimerapp/dimer-edge/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/dimerapp/dimer-edge "circleci"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/dimer-edge.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/dimer-edge "npm"

[license-image]: https://img.shields.io/npm/l/dimer-edge?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
