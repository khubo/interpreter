import * as readLine from 'readline-sync'


type tokenType = 'INT' | 'OPERATOR' | 'EOF'
class Token {

  public type // type of token
  public value // value of the token
  constructor(type: tokenType, value: number | string) {
    this.type = type
    this.value = value
  }

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
    if (this.currentChar === '+' || this.currentChar === "-") {
      const token = new Token('OPERATOR', this.currentChar)
      this.advance()
      return token
    }

    throw new Error("invalid tokens")
  }


  eat(type: string) {
    if (this.current_token.type === type) {
      this.current_token = this.getNextToken()
    } else {
      throw new Error("cant eat")
    }
  }

  express() {
    const left = this.current_token.value
    this.eat('INT')

    const op = this.current_token.value
    this.eat('OPERATOR')

    const right = this.current_token.value
    this.eat('INT')

    return op === "+" ? left + right : left * right
  }

  // expression that alternate between operand and operator
  expressAlternate() {
    let result = Number(this.current_token.value)
    this.eat('INT')
    while (this.current_token.type !== 'EOF') {
      const op = this.current_token.value
      this.eat('OPERATOR')
      const operand = Number(this.current_token.value)
      this.eat('INT')
      result = op === '-' ? result - operand : result + operand
    }

    return result
  }

}

const main = () => {
  while (true) {
    // read the user line and evaulate it
    const line = readLine.question(">>")
    const interpreter = new Interpreter(line)
    const result = interpreter.expressAlternate()

    // print the result
    console.log(":=>", result)
  }
}

main()