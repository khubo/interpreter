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

class Compound {
  public children // TODO
  constructor() {
    this.children = []
  }

  addChild(child) {
    this.children = [...this.children, child]
  }
}

// hold assignment statement
class Assign {
  public left
  public token
  public right
  public op
  constructor(left, op, right) {
    this.left = left
    this.token = this.op = op
    this.right = right
  }
}

// holds variables
class Var {
  public token
  public value
  constructor(token) {
    this.token = token
    this.value = token.value
  }
}

// no operations
class NoOp { }

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
      console.log("here", this.currentToken, tokenType)

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
    } else {
      return this.variable()
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

  program() {
    // program: compound_statement DOT
    let node = this.compoundStatement()
    this.eat('DOT')
    return node
  }

  compoundStatement() {
    // compound_statement: BEGIN statement_list END
    this.eat('BEGIN')
    let nodes = this.statementList()
    this.eat('END')

    const root = new Compound()
    for (let node of nodes) {
      root.addChild(node)
    }

    return root
  }

  statementList() {
    // statementList : statement | statement SEMI statementList
    let node = this.statement()
    let results: any = [node]

    while (this.currentToken.type === "SEMI") {
      this.eat("SEMI")
      results = [...results, this.statement()]
    }

    if (this.currentToken.type === "ID") {
      this.error()
    }

    return results
  }

  statement() {
    // statement: compound_statement | assignment_statement | empty
    let node
    if (this.currentToken.type === 'BEGIN') {
      node = this.compoundStatement()
    } else if (this.currentToken.type === "ID") {
      node = this.assignmentStatement()
    } else {
      node = this.empty()
    }

    return node
  }

  empty() {
    return new NoOp()
  }

  variable() {
    let node = new Var(this.currentToken)
    this.eat('ID')
    return node
  }

  assignmentStatement() {
    let left = this.variable()
    let token = this.currentToken
    this.eat('ASSIGN')
    let right = this.expr()
    let node = new Assign(left, token, right)
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
    let node = this.program()
    if (this.currentToken.type !== 'EOF') {
      this.error()
    }

    return node
  }
}


export default Parser
