type tokenType = 'INT' | 'DIV' | 'MUL' | 'ADD' | 'SUB' | 'OPEN' | 'CLOSE' | 'EOF'
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

// the interpreter class
class Lexer {
  private expr = '' //the expression being erad
  private pos = 0 // character position in expression string
  private currentChar // point to the current character
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
    while (this.currentChar === " ") {
      this.advance()
    }
  }

  // parse out the consequent number
  getNumber() {
    let number = ''
    // anything other than numbers marks the begining 
    // of another token
    while (parseInt(this.currentChar)) {
      number += this.currentChar
      this.advance()
    }
    return Number(number)
  }

  // return the next token
  getNextToken() {


    // current char indicated reached the end of expression
    if (this.currentChar === null) {
      return new Token('EOF', null)
    }

    // remove white spaces
    if (this.currentChar === " ") {
      this.eatSpaces()
    }

    // concatenate the entire numbers that follows into a single one
    if (parseInt(this.currentChar)) {
      return new Token('INT', this.getNumber())
    }

    // mathematical operators
    if (['+', '-', '*', '/'].indexOf(this.currentChar) !== -1) {
      const token = new Token(operatorMap[this.currentChar], this.currentChar)
      this.advance()
      return token
    }

    if (this.currentChar === '(') return new Token('OPEN', '(')
    if (this.currentChar === ')') return new Token('CLOSE', ')')
    throw new Error("invalid tokens")
  }
}

export default Lexergo