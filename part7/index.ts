import * as Readline from 'readline-sync'
import Parser from './ast'
import Lexer from './lexer'

class Interpreter {
  public parser
  constructor(parser: Parser) {
    this.parser = parser
  }

  visitNumber(node) {
    return node.value
  }

  visit(node) {
    const nodeType = node.constructor.name

    if (nodeType === "BinOp") {
      return this.visitOp(node)
    } else if (nodeType === "Num") {
      return this.visitNumber(node)
    }

    throw new Error("invalid AST")
  }

  visitOp(node) {
    if (node.op.type === 'ADD') {
      return this.visit(node.left) + this.visit(node.right)
    } else if (node.op.type === 'SUB') {
      return this.visit(node.left) - this.visit(node.right)
    } else if (node.op.type === 'MUL') {
      return this.visit(node.left) * this.visit(node.right)
    } else {
      return this.visit(node.left) / this.visit(node.right)
    }
  }

  interpret() {
    const tree = this.parser.parse()
    return this.visit(tree)
  }
}

(() => {
  while (true) {
    const line = Readline.question(">>")
    const parser = new Parser(new Lexer(line))
    const interpret = new Interpreter(parser)
    console.log(":=>", interpret.interpret())
  }
})()

