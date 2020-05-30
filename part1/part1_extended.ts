import * as readLine from 'readline-sync'


type tokenType = 'INT' | 'OPERATOR' | 'EOF'

class Token {

  public type
  public value
  constructor(type: tokenType, value: number | string) {
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

  eatNumber() {
    const digits = []
    while (parseInt(this.expr[this.pos])) {
      digits.push(this.expr[this.pos])
      this.pos++
    }
    return digits.join("")
  }

  // return the next token
  getNextToken() {
    let expression = this.expr

    if (this.pos > expression.length - 1) {
      return new Token('EOF', null)
    }

    while (expression[this.pos] === " ") {
      this.pos++
    }
    const currentChar = expression[this.pos]

    if (parseInt(currentChar)) {
      const num = this.eatNumber()
      return new Token('INT', num)
    }


    this.pos++
    if (currentChar === '+' || currentChar === "*") {
      return new Token('OPERATOR', currentChar)
    }

    throw new Error("invalid tokene")
  }


  eat(type: string) {
    if (this.current_token.type === type) {
      this.current_token = this.getNextToken()
    } else {
      throw new Error('invalid tokeness')
    }
  }

  express() {
    const left = Number(this.current_token.value)
    this.eat('INT')

    const op = this.current_token.value
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
