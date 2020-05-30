import * as readLine from 'readline-sync'

class Token {

  public type
  public value
  constructor(type: string, value: number | string) {
    this.type = type
    this.value = value
  }

}

class Interpreter {
  private expr = '' //the expression being erad
  private current_token = null // current token
  private pos = 0 // character position in expression string

  constructor(expr: string) {
    this.expr = expr
    this.current_token = this.getNextToken()
  }

  // return the next token
  getNextToken() {
    let expression = this.expr

    if (this.pos > expression.length - 1) {
      return new Token('EOF', null)
    }

    const currentChar = expression[this.pos]
    this.pos++


    if (parseInt(currentChar)) {
      return new Token('INT', currentChar)
    }

    if (currentChar === '+' || currentChar === "*") {
      return new Token('OPERATOR', currentChar)
    }

    console.error("invalid token")
  }


  eat(type: string) {
    if (this.current_token.type === type) {
      this.current_token = this.getNextToken()
    } else {
      console.error('invalid token')
    }
  }

  express() {
    const left = Number(this.current_token.value)
    this.eat('INT')

    const op = this.current_token.valuef
    this.eat('OPERATOR')

    const right = Number(this.current_token.value)
    this.eat('INT')

    return op === "+" ? left + right : left * right
  }

}

const main = () => {
  while (true) {
    const line = readLine.question('>> ')
    const interpreter = new Interpreter(line)
    console.log(":=>", interpreter.express())
  }
}

main()
