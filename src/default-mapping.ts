import { SymbolExpression } from "./expression";
import { Power, Multiply, Divide, Add, Subtract, Sin, Cos, Tan, Csc, Sec, Cot } from "./default-expressions";

export const operators: {
  [operator: string]: {
    associativity: 'left' | 'right',
    precedence: number
  }
} = {
  '^': {
    associativity: 'right',
    precedence: 4
  },
  '*': {
    associativity: 'left',
    precedence: 3
  },
  '/' : {
    associativity: 'left',
    precedence: 3
  },
  '+': {
    associativity: 'left',
    precedence: 2
  },
  '-': {
    associativity: 'left',
    precedence: 2
  }
}

export const mapping: any = {
  Operator: (value: string, left: number, right: number) => {
    const operators: {[key: string]: any} = {
      '^': Power,
      '*': Multiply,
      '/': Divide,
      '+': Add,
      '-': Subtract
    };
    return new operators[value](left, right);
  },
  Literal: (value: string) => parseFloat(value),
  Variable: (value: string) => new SymbolExpression(value),
  Function: (value: string, left: number, right: number) => {
    const functions: {[key: string]: any} = {
      sin: Sin,
      cos: Cos,
      tan: Tan,
      csc: Csc,
      sec: Sec,
      cot: Cot
    }
    // NOTE: left may not have a value (since each value is append)
    // right will all was have a value!
    return new functions[value]([right, left]);
  }
}