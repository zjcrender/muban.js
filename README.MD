# muban.js
a simple template engine for javascript, for now only supports `{{each}}` and `{{var}}` syntax.

## installation

```bash
npm install muban.js
```

## usage
For more details, see [tests](./tests)

```javascript
import Muban from "muban.js"

const result = new Muban(template).render(ctx)
```

## supported syntax

- `{{var}}` for variable interpolation
- `{{each [name] in [ctx]}}` for looping, support nested loops
  - `[name]`: the variable name for the current item
  - `$index`: the index of the current item

## example

```javascript
const template = `
fruits:
<ul>
{{each fruit in fruits}}
  <li>{{$index}}: {{fruit}}</div>
{{/each}}
</ul>
`
const data = {
  fruits: ["apple", "banana", "orange"]
}

// fruits:
// <ul>
//   <li>0: apple</li>
//   <li>1: banana</li>
//   <li>2: orange</li>
// </ul>
new Muban(template).render(data)
```
