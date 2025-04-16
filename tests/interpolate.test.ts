import { describe, expect, test } from "vitest";
import Muban from '../src/index'

describe("interpolate tests", () => {

  test("renders correctly", () => {

    const template = `{{foo}}: {{bar}}`
    const context = { foo: 'foo', bar: 'bar' }
    const expected = `foo: bar`

    expect(new Muban(template).render(context)).toBe(expected)
  })


})
