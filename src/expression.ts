import { isFunction as dashIsFunction } from 'lodash';

export const isFunction = (value: any): value is Function => 
  dashIsFunction(value);

export type ExpressType = FunctionExpression | number | SymbolExpression;

export class SymbolExpression {
  constructor(
    public name: string,
    public solve: ((value: { [name: string]: number }) => number) | null = null
  ) {}
}

export abstract class FunctionExpression {
  constructor(
    public args: ExpressType[],
    public solve: (...args: number[]) => number,
    public precedence: number = 2,
    public associativity: 'left' | 'right' | 'both' = 'both',
  ) {}

  abstract toString(): string;

  containsVariable(): boolean {
    return this.args.reduce((prevContainVar, arg) => {
      if (arg instanceof FunctionExpression) {
        return prevContainVar || arg.containsVariable();
      } else if (arg instanceof SymbolExpression) {
        return prevContainVar || true;
      }
      return prevContainVar || false;
    }, false);
  }

  getVariableNames(): Set<string> {
    return this.args.reduce((prevVariableNames: Set<string>, arg: ExpressType) => {
      if (arg instanceof FunctionExpression) {
        arg.getVariableNames().forEach(value => prevVariableNames.add(value));
        return prevVariableNames;
      } else if (arg instanceof SymbolExpression) {
        prevVariableNames.add(arg.name);
        return prevVariableNames;
      }
      return prevVariableNames;
    }, new Set<string>());
  }

  // static getValue(value: Expression | number): number | Function {
  //   if (value instanceof Expression) {
  //     return value.evaluate(values);
  //   } else {
  //     return value;
  //   }
  // }

  static getValue = (val: ExpressType | Function, variables: { [key: string]: number }): number => {
    if (val instanceof SymbolExpression) {
      if (typeof variables[val.name] === 'undefined') {
        throw new TypeError();
      }
      return variables[val.name];
    } else if (val instanceof FunctionExpression) {
      const evaluated = val.evaluate()
      if (isFunction(evaluated)) { // If it is a function
        return evaluated(variables); // pass in variables values
      }
      // else its a number
      return evaluated;
    } else if (isFunction(val)) {
      return val(variables);
    }
    return val;
  }

  getStringValue(val: ExpressType) {
    if (val instanceof SymbolExpression) {
      return val.name;
    } else if (val instanceof FunctionExpression) {
      // const evaluated = val.evaluate()
      // if (isFunction(evaluated)) { // If it is a function
      //   return evaluated(variables); // pass in variables values
      // }
      return val.toString();
      // else its a number
      // return evaluated;
    }
    return val;
  }

  static evaluateExpressionOrNumber = (val: FunctionExpression | number): Function | number => {
    if (val instanceof FunctionExpression) {
      return val.evaluate();
    }
    return val;
  }

  static getNonVariableValue(val: FunctionExpression | number): number {
    return val instanceof FunctionExpression ? (val.evaluate() as number) : val;
  }
  
  evaluate(): number | Function {
    const { args } = this;

    // Check if there is any variables in any of the subtrees or current node
    const treeContainsVariables = this.containsVariable();

    if (treeContainsVariables) { // If there are any variables
      return (variables: { [key: string]: number }) => { // Return a function at takes in variables
        const evaluatedVariables = args.map( // Get the values
          (arg: ExpressType | Function) => FunctionExpression.getValue(arg, variables)
        );
        return this.solve(...evaluatedVariables); // Return the resolved value
      }
    }

    // If there are no variables, get the values
    const evaluatedValues = args.map(arg => FunctionExpression.getNonVariableValue(arg as FunctionExpression | number));
    return this.solve(...evaluatedValues); // Then solve!
  }
}

export abstract class Expression extends FunctionExpression {
  constructor(
    protected a: ExpressType,
    protected b: ExpressType,
    solve: (a: number, b: number) => number,
    precedence: number = 2,
    associativity: 'left' | 'right' | 'both' = 'left'
  ) {
    super([a, b], solve);
  }

  getABString() {
    let a = this.getStringValue(this.a).toString();
    let b = this.getStringValue(this.b).toString();

    if (this.a instanceof Expression && this.a.precedence < this.precedence) { // TODO: function
      a = `(${a})`;
    }

    if (this.b instanceof Expression && this.b.precedence < this.precedence) { // TODO: function
      b = `(${b})`;
    }

    return {
      a,
      b
    }
  }
}
