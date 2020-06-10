import { readFileSync } from 'fs'


type tokenType = 'INT' | 'DIV' | 'MUL' | 'ADD' | 'SUB' | 'OPEN' | 'CLOSE' |
  'BEGIN' | 'END' | 'ID' | 'EOF' | 'SEMI' | 'ASSIGN' | 'DOT' | 'PROGRAM' | 'VAR' |
  'DIV' | 'INTEGER' | 'REAL' | 'REAL_CONST' | 'INTEGER_CONST' | 'COMMA' | 'COLON' |
  'FLOAT_DIV'

class Token {

  public type // type of token
  public value // value of the token
  constructor(type: tokenType, value: number | string) {
    this.type = type
    this.value = value
  }

}

const operatorMap = {
  '+': "ADD",
  "-": "SUB",
  "/": "DIV",
  "*": "MUL"
}

const KEYWORDS = {
  'BEGIN': new Token('BEGIN', 'BEGIN'),
  'END': new Token('END', 'END'),
  'PROGRAM': new Token('PROGRAM', 'PROGRAM'),
  'VAR': new Token('VAR', 'VAR'),
  'DIV': new Token('DIV', 'DIV'),
  'INTEGER': new Token('INTEGER', 'INTEGER'),
  'REAL': new Token('REAL', 'REAL')
}

// the interpreter class
class Lexer {
  private expr = '' //the expression being erad
  private pos = 0 // character position in expression string
  public currentChar // point to the current character
  constructor(expr: string) {
    this.expr = expr
    this.currentChar = expr[0]
  }




  // advance the position pointer to next character in the string
  advance() {
    this.pos++
    if (this.pos > this.expr.length - 1) {
      this.currentChar = null
    } else {
      this.currentChar = this.expr[this.pos]
    }

  }

  // eat all of em white spaces
  eatSpaces() {
    while (this.currentChar === " " || this.currentChar === "\n") {
      this.advance()
    }
  }

  // skip comment section
  skipComment() {
    while (this.currentChar !== '}') {
      this.advance()
    }
    this.advance()
  }

  // peek to the next character
  peek() {
    const peekPos = this.pos + 1

    return (peekPos > this.expr.length - 1)
      ? null
      : this.expr[peekPos]
  }

  // parse out the consequent number
  getNumber() {
    let number = ''
    // anything other than numbers marks the begining 
    // of another token
    while (this.isNum(this.currentChar)) {
      number += this.currentChar
      this.advance()
    }
    if (this.currentChar === '.') {
      number += this.currentChar
      this.advance()

      while (this.isNum(this.currentChar)) {
        number += this.currentChar
        this.advance()
      }

      return new Token('REAL_CONST', Number(number))
    }
    return new Token('INTEGER_CONST', Number(number))
  }

  isAlpha(x) {
    return /^[a-z_]+$/i.test(x)
  }

  isNum(x) {
    return /^[0-9]/i.test(x)
  }

  _id() {
    let result = ''
    while (this.currentChar !== null && this.isAlpha(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    return KEYWORDS[result.toUpperCase()] || new Token('ID', result)
  }

  // return the next token
  getNextToken() {

    while (this.currentChar !== null) {

      // remove white spaces
      if (this.currentChar === " " || this.currentChar === "\n") {
        this.eatSpaces()
      }


      if (this.currentChar === '{') {
        this.advance()
        this.skipComment()
        continue
      }

      // check for alpha numeric
      if (this.isAlpha(this.currentChar)) {
        return this._id()
      }

      // concatenate the entire numbers that follows into a single one
      if (this.isNum(this.currentChar)) {
        return this.getNumber()
      }


      if (this.currentChar === ":" && this.peek() === "=") {
        this.advance()
        this.advance()
        return new Token('ASSIGN', ':=')
      }

      if (this.currentChar === ";") {
        this.advance()
        return new Token('SEMI', ';')
      }

      if (this.currentChar === ".") {
        this.advance()
        return new Token("DOT", '.')
      }


      if (this.currentChar === ":") {
        this.advance()
        return new Token('COLON', ':')
      }

      if (this.currentChar === ",") {
        this.advance()
        return new Token('COMMA', ',')
      }

      if (this.currentChar === '/') {
        this.advance()
        return new Token('FLOAT_DIV', '/')
      }

      // mathematical operators
      if (['+', '-', '*', '/'].indexOf(this.currentChar) !== -1) {
        const token = new Token(operatorMap[this.currentChar], this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '(') {
        this.advance()
        return new Token('OPEN', '(')
      }
      if (this.currentChar === ')') {
        this.advance()
        return new Token('CLOSE', ')')
      }
      throw new Error("invalid tokens")
    }

    // when you run out of characters to parse.
    return new Token('EOF', null)
  }
}

export default Lexer