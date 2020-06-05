import * as Readline from 'readline-sync'
import Parser from './ast'
import Lexer from './lexer'

let glboalScope = {

}

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
    } else if (nodeType === "UnaryOp") {
      return this.visitUnaryOp(node)
    } else if (nodeType === "Compound") {
      return this.visitCompound(node)
    } else if (nodeType === "Assign") {
      return this.visitAssign(node)
    } else if (nodeType === "NoOp") {
      return this.visitNoOp(node)
    } else if (nodeType === "Var") {
      return this.visitVar(node)
    }

    console.log("node type is", nodeType)
    throw new Error("invalid AST")
  }
  visitUnaryOp(node) {
    if (node.op.type === "ADD") {
      return +this.visit(node.expr)
    } else {
      return -this.visit(node.expr)
    }
  }

  // do nothing
  visitNoOp(node) {

  }

  visitCompound(node) {
    for (let child of node.children) {
      this.visit(child)
    }
  }

  visitAssign(node) {
    let varName = node.left.value
    glboalScope[varName] = this.visit(node.right)
  }

  visitVar(node) {
    let varName = node.value
    let value = glboalScope[varName]
    if (!value) throw new Error("unknown variable")
    return value
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
  const program = `BEGIN
    BEGIN
        number := 2;
        a := number;
        b := 10 * a + 11 * number / 4;
        c := a - - b
    END;
    x := 11;
  END.`
  const lexer = new Lexer(program)
  const parser = new Parser(lexer)
  // console.log(JSON.stringify(parser.parse()))
  const interpreter = new Interpreter(parser)
  interpreter.interpret()
  console.log("glboal scope", glboalScope)
})()
// export default Interpreter