import * as readLine from 'readline-sync'

// possible types of token
type tokenType = 'INTEGER' | 'MUL' | 'DIV' | 'EOF'

// hold the token
class Token {
  // type of the token
  public type
  //value of the token
  public value
  // an integer 6 would have 'INTEGER' as type, and '6' as value
  constructor(type: tokenType, value: number | string) {
    this.type = type
    this.value = value
  }
}


class Lexer {

  private expr // expression passed to the lexer
  private pos = 0 // position of current character in expression under scurtiny
  private currentChar // current character under scrutiny - based on 'pos'

  constructor(expression: string) {
    this.expr = expression
    this.currentChar = expression[this.pos]
  }

  // throw a lexer error
  error() {
    throw new Error('lexer: Invalid character')
  }

  // advance to next character
  advance() {
    this.pos++
    // when currentChar becomes 'null', we have reached the end 
    // of the expression                                                                              
    if (this.pos >= this.expr.length) {
      this.currentChar = null
    } else {
      this.currentChar = this.expr[this.pos]
    }
  }

  // skip white spaces till next token 
  skipSpaces() {
    while (this.currentChar === " ") {
      this.advance()
    }
  }

  // consume and return the multidigt integer consumed
  // from the input
  getNumber() {
    let number = ''
    while (this.currentChar !== null && parseInt(this.currentChar)) {
      number += this.currentChar
      this.advance()
    }
    // send it as a 'number' here to avoid further processing 
    return Number(number)
  }


  getNextToken() {

    while (this.currentChar !== null) {

      // ignore the white spaces between tokens
      if (this.currentChar === " ") {
        this.skipSpaces()
      }

      if (parseInt(this.currentChar)) {
        return new Token('INTEGER', this.getNumber())
      }

      if (this.currentChar === '*') {
        this.advance()
        return new Token('MUL', '*')
      }

      if (this.currentChar === '/') {
        this.advance()
        return new Token('DIV', '/')
      }


      this.error()
    }

    return new Token('EOF', null)
  }

}


// the parser
class Parser {
  private lexer //hold the lexer object
  private currentToken
  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }

  error() {
    throw new Error('Parser error')
  }

  // confirm the token type and advance
  eat(type: tokenType) {
    if (this.currentToken.type === type) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error
    }
  }

  factor() {
    this.eat('INTEGER')
  }

  expr() {
    this.factor()

    while (['MUL', 'DIV'].indexOf(this.currentToken.type) !== -1) {
      let token = this.currentToken
      if (token.type === 'MUL') {
        this.eat('MUL')
        this.factor()
      } else if (token.type === 'DIV') {
        this.eat('DIV')
        this.factor()
      }

    }
  }

  parse() {
    this.expr()
  }

}

(() => {
  while (true) {
    const expression = readLine.question(">>")
    const parser = new Parser(new Lexer(expression))
    parser.parse()
  }
})()