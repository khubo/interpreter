import Lexer from './lexer'

class BinOp {
  public left
  public token
  public op
  public right
  constructor(left, op, right) {
    this.left = left
    this.op = this.token = op
    this.right = right
  }
}

class Num {
  public token
  public value
  constructor(token) {
    this.token = token
    this.value = token.value
  }
}

class UnaryOp {
  public op
  public token
  public expr
  constructor(op, expression) {
    this.token = this.op = op
    this.expr = expression
  }
}

class Parser {

  public lexer
  public currentToken

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }


  error() {
    throw new Error("invalid syntax")
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error()
    }
  }

  factor() {
    const token = this.currentToken
    if (token.type === "ADD") {
      this.eat("ADD")
      return new UnaryOp(token, this.factor())
    } else if (token.type === "SUB") {
      this.eat("SUB")
      return new UnaryOp(token, this.factor())
    }
    else if (token.type === "INT") {
      this.eat("INT")
      return new Num(token)
    } else if (token.type === 'OPEN') {
      this.eat("OPEN")
      const node = this.expr()
      this.eat("CLOSE")
      return node
    }
  }

  term() {
    let node: any = this.factor() // TODO: fix the type

    while (this.currentToken.type === "MUL" || this.currentToken.type === "DIV") {
      const token = this.currentToken
      if (token.type === "MUL") this.eat("MUL")
      else this.eat("DIV")

      node = new BinOp(node, token, this.factor())
    }

    return node
  }


  expr() {
    let node = this.term()

    while (this.currentToken.type === "ADD" || this.currentToken.type === "SUB") {
      const token = this.currentToken
      if (token.type === "ADD") this.eat("ADD")
      else this.eat("SUB")

      node = new BinOp(node, token, this.term())
    }

    return node
  }

  parse() {
    return this.expr()
  }
}

export default Parser