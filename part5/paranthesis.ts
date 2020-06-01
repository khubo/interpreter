import * as readLine from 'readline-sync'


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
class Interpreter {
  private expr = '' //the expression being erad
  private current_token = null // current token
  private pos = 0 // character position in expression string
  private currentChar // point to the current character
  constructor(expr: string) {
    this.expr = expr
    this.currentChar = expr[0]
    this.current_token = this.getNextToken()
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


  eat(type: tokenType) {
    if (this.current_token.type === type) {
      this.current_token = this.getNextToken()
    } else {
      throw new Error("cant eat")
    }
  }

  integer() {
    const value = this.current_token.value
    this.eat('INT')
    return value
  }

  factor() {
    // if its just number return the number
    if (this.current_token.type === "INT") {
      const number = this.integer()
      return number
    }

    if (this.current_token.type === "OPEN") {
      this.eat('OPEN')
      this.advance()
      let currentPos = this.pos
      while (this.currentChar !== ')' && this.currentChar !== null) {
        this.advance()
      }
      if (this.currentChar === null) {
        throw new Error("invalid string")
      }
      const result = (new Interpreter(this.expr.slice(currentPos, this.pos))).express()
      let token = this.getNextToken()
      this.current_token = token
      this.eat("CLOSE")
      this.advance()
      this.current_token = this.getNextToken()
      return result
      // return result
    }

    throw new Error("bracket issues")
  }

  term() {
    let factor = this.factor()
    let result = factor
    while (['/', '*'].indexOf(this.current_token.value) !== -1) {
      if (this.current_token.value === '*') {
        this.eat('MUL')
        factor = this.factor()
        result = result * factor
      } else {
        this.eat('DIV')
        factor = this.factor()
        result = result / factor
      }
    }
    return result
  }

  express() {

    let term = this.term()
    let result = term
    while (['+', '-'].indexOf(this.current_token.value) !== -1) {
      if (this.current_token.value === '+') {
        this.eat('ADD')
        term = this.term()
        result = result + term
      } else {
        this.eat('SUB')
        term = this.term()
        result = result - term
      }
    }

    return result
  }

}

const main = () => {
  while (true) {
    // read the user line and evaulate it
    const line = readLine.question(">>")
    const interpreter = new Interpreter(line)
    const result = interpreter.express()

    // print the result
    console.log(":=>", result)
  }
}

main()