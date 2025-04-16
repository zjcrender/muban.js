type ContentBLock = {
  type: "content",
  content: string
}

type EachBlock = {
  type: "each",
  expr: {
    itemName: string,
    dataFrom: string
  }
  content: string
}

type Block = ContentBLock | EachBlock

type Context = Record<string, any>

// 简易支持循环插值的模板
export default class Muban {
  private blocks: Block[] = []

  constructor(private template: string) {
  }

  // 将内容分割成：普通内容块 和 each指令块
  private intoBlocks() {
    const re = /{{\s*each\s+([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_.$]+)\s*}}|{{\/each}}/mg;

    let match: RegExpMatchArray | null = null
    let starters: any[] = []
    let contentPos = 0
    while (match = re.exec(this.template)) {
      const isStarter = match[0] !== "{{/each}}"

      if (isStarter) {
        starters.push({
          pos: match.index,
          contentPos: re.lastIndex,
          expr: {
            itemName: match[1]!,
            dataFrom: match[2]!,
          }
        })
      } else {
        const starter = starters.pop()
        if (!starter) {
          throw new Error("Unmatched each directive")
        }

        if (starters.length === 0) {
          this.blocks.push({
            type: 'content',
            content: this.template.slice(contentPos, starter.pos),
          })
          contentPos = re.lastIndex;

          this.blocks.push({
            type: 'each',
            expr: starter.expr,
            content: this.template.slice(starter.contentPos, match.index),
          })
        }

      }
    }

    this.blocks.push({
      type: 'content',
      content: this.template.slice(contentPos),
    })
  }

  private getContextValue(path: string, context: Context): any {
    const keys = path.split('.')
    let value = ""
    try {
      value = keys.reduce((value, key) => value[key], context as any)
    } catch {
      value = ""
    }
    return value
  }

  private renderInterpolate(content: string, context: Context): string {
    return content.replace(/{{\s*([a-zA-Z0-9_.$]+)\s*}}/g, (_, expr) => this.getContextValue(expr, context));
  }

  private renderContents(block: ContentBLock, context: Context): string {
    return this.renderInterpolate(block.content, context)
  }

  private renderLoops(block: EachBlock, context: Context): string {
    const { itemName, dataFrom } = block.expr
    const array = this.getContextValue(dataFrom, context)
    if (!Array.isArray(array)) return ""

    return array
      .map((element, index) => {
        const loopContext = {
          ...context,
          $index: index,
          [itemName]: element,
        }

        return new Muban(index === 0
          ? block.content.trim()
          : block.content.trimEnd()
        ).render(loopContext)
      })
      .join('');
  }

  render(context: Context): string {

    this.intoBlocks()

    return this
      .blocks
      .map(block => {
        switch (block.type) {
          case "content":
            return this.renderContents(block, context)

          case "each":
            return this.renderLoops(block, context)
        }
      })
      .join("")
  }
}
