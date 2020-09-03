/*
 * dimer-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ComponentOutput } from './Contracts'

export function component(name: string, props: any, slots?: any): ComponentOutput {
	return [name, props, slots]
}
