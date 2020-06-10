import Lexer from './lexer'
import { readFileSync } from 'fs'

class Program {

  constructor(public name, public block) {
    this.name = name
    this.block = block
  }
}

class Block {
  constructor(public declarations, public compoundStatement) {
    this.declarations = declarations
    this.compoundStatement = this.compoundStatement
  }
}

class VarDecl {
  constructor(public varNode, public typeNode) {
    this.varNode = varNode
    this.typeNode = typeNode
  }
}

class Type {
  public value
  constructor(public token) {
    this.token = token
    this.value = token.value
  }
}


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
      this.error()
    }
  }

  factor() {
    /**
     * factor : PLUS factor
              | MINUS factor
              | INTEGER_CONST
              | REAL_CONST
              | LPAREN expr RPAREN
              | variable
    */

    const token = this.currentToken
    if (token.type === "ADD") {
      this.eat("ADD")
      return new UnaryOp(token, this.factor())
    } else if (token.type === "SUB") {
      this.eat("SUB")
      return new UnaryOp(token, this.factor())
    }
    else if (token.type === "INTEGER_CONST") {
      this.eat("INTEGER_CONST")
      return new Num(token)
    } else if (token.type === "REAL_CONST") {
      this.eat("REAL_CONST")
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
    // term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*
    let node: any = this.factor() // TODO: fix the type

    while (this.currentToken.type === "MUL" || this.currentToken.type === "INTEGER_DIV" || this.currentToken.type === "FLOAT_DIV") {

      const token = this.currentToken
      if (token.type === "MUL") this.eat("MUL")
      else if (token.type === "INTEGER_DIV") this.eat("INTEGER_DIV")
      else this.eat("FLOAT_DIV")
      node = new BinOp(node, token, this.factor())
    }

    return node
  }


  program() {
    // program: PROGRAM variable SEMI block DOT
    this.eat("PROGRAM")
    const varNode = this.variable()
    const programName = varNode.value
    this.eat('SEMI')
    const blockNode = this.block()
    const programNode = new Program(programName, blockNode)
    this.eat('DOT')
    return programNode
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

  typeSpec() {
    // typeSpec: INTEGER | REAL
    let token = this.currentToken
    if (this.currentToken.type === 'INTEGER') {
      this.eat('INTEGER')
    } else {
      this.eat('REAL')
    }
    const node = new Type(token)
    return node
  }

  variableDeclaration() {
    // variable_declaration: ID (COMMA ID)* COLON type_spec
    let varNodes = [new Var(this.currentToken)] // first ID
    this.eat('ID')

    while (this.currentToken.type === "COMMA") {
      this.eat("COMMA")
      varNodes = [...varNodes, new Var(this.currentToken)]
      this.eat("ID")
    }
    this.eat("COLON")

    const typeNode = this.typeSpec()
    const varDeclarations = varNodes.map(varNode => new VarDecl(varNode, typeNode))
    return varDeclarations
  }

  declarations() {
    // declarations : VAR (variable_declaration SEMI) + | empty
    let declarations = []
    if (this.currentToken.type === 'VAR') {
      this.eat('VAR')
      while (this.currentToken.type === 'ID') {
        let varDecl = this.variableDeclaration()
        declarations = [...declarations, varDecl]
        this.eat('SEMI')
      }
    }
    return declarations
  }

  // 
  block() {
    // block : declarations compound_statement
    const declarationNode = this.declarations()
    const compoundStatementNode = this.compoundStatement()
    const node = new Block(declarationNode, compoundStatementNode)
    return node
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


// export default Parser

(() => {
  const program = readFileSync('./part10/program.txt', 'utf8')
  const lexer = new Lexer(program)
  const parser = new Parser(lexer)
  console.log(JSON.stringify(parser.parse()))
})()