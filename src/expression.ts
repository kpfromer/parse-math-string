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

// export abstract class FunctionExpression {
//   constructor(
//     public args: ExpressType[],
//     public solve: (...args: number[]) => number
//   ) {}

//   containsVariable(): boolean {
//     return this.args.reduce((prevContainVar, arg) => {
//       if (arg instanceof FunctionExpression || arg instanceof Expression) {
//         return prevContainVar || arg.containsVariable();
//       } else if (arg instanceof SymbolExpression) {
//         return prevContainVar || true;
//       }
//       return prevContainVar || false;
//     }, false);
//   }

//   getVariableNames(): string[] {
//     return this.args.reduce((prevVariableNames: string[], arg: ExpressType | FunctionExpression) => {
//       if (arg instanceof FunctionExpression || arg instanceof Expression) {
//         return [
//           ...prevVariableNames,
//           ...arg.getVariableNames()
//         ];
//       } else if (arg instanceof SymbolExpression) {
//         return [
//           ...prevVariableNames,
//           arg.name
//         ];
//       }
//       return prevVariableNames;
//     }, []);
//   }

//   // static getValue(value: Expression | number): number | Function {
//   //   if (value instanceof Expression) {
//   //     return value.evaluate(values);
//   //   } else {
//   //     return value;
//   //   }
//   // }

//   static getValue = (val: ExpressType | Function, variables: { [key: string]: number }): number => {
//     if (val instanceof SymbolExpression) {
//       if (typeof variables[val.name] === 'undefined') {
//         throw new TypeError();
//       }
//       return variables[val.name];
//     } else if (val instanceof Expression) {
//       const evaluated = val.evaluate()
//       if (isFunction(evaluated)) { // If it is a function
//         return evaluated(variables); // pass in variables values
//       }
//       // else its a number
//       return evaluated;
//     } else if (isFunction(val)) {
//       return val(variables);
//     }
//     return val;
//   }

//   static evaluateExpressionOrNumber = (val: Expression | number): Function | number => {
//     if (val instanceof Expression) {
//       return val.evaluate();
//     }
//     return val;
//   }
  
//   evaluate(values = {}): number | Function {
//     const { args } = this;

//     const treeContainsVariables = this.containsVariable();
//     // console.log({treeContainsVariables});

//     if (treeContainsVariables) {
//       return (variables: { [key: string]: number }) => {
//         const evaluatedVariables = args.map(
//           (arg: ExpressType | Function) => FunctionExpression.getValue(arg, variables)
//         );
//         return this.solve(...evaluatedVariables);
//       }
//     }

//     return this.solve(...args as number[]);

//     // console.log(args);

//     // const containsVariable = args.reduce((prevIsVariable, arg) => {
//     //   return arg instanceof SymbolExpression || isFunction(arg) || prevIsVariable;
//     // }, false);

//     // console.log(containsVariable);

//     // if (containsVariable) {
//     //   return (variables: { [key: string]: number }) => {
//     //     const evaluatedVariables = args.map(
//     //       (arg: ExpressType | Function) => FunctionExpression.getValue(arg, variables)
//     //     );
//     //     return this.solve(...evaluatedVariables);
//     //   }
//     // }

//     // const children = args.map(arg => FunctionExpression.evaluateExpressionOrNumber(arg as Expression | number));

//     // console.log(children);

//     // const childrenContainsVariable = children.reduce((prevIsVariable, arg) => {
//     //   return prevIsVariable || isFunction(arg);
//     // }, false);

//     // console.log(childrenContainsVariable);

//     // if (childrenContainsVariable) {
//     //   return (variables: { [key: string]: number }) => {
//     //     const values = children.map(arg => {
//     //       if (isFunction(arg)) {
//     //         return arg(variables);
//     //       }
//     //       return arg;
//     //     })
//     //     return this.solve(...values);
//     //   }
//     // }

//     // return this.solve(...children as number[]);
//   }
// }

export abstract class FunctionExpression {
  constructor(
    public args: ExpressType[],
    public solve: (...args: number[]) => number
  ) {}

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
    a: ExpressType,
    b: ExpressType,
    solve: (a: number, b: number) => number
  ) {
    super([a, b], solve);
  }
}

// export abstract class Expression {

//   constructor(
//     public a: ExpressType,
//     public b: ExpressType,
//     private solve: (a: number, b: number) => number
//   ) {}

//   containsVariable(): boolean {
//     const { a, b } = this;
//     const args = [a,b];
//     return args.reduce((prevContainVar, arg) => {
//       if (arg instanceof Expression) {
//         return prevContainVar || arg.containsVariable();
//       } else if (arg instanceof SymbolExpression) {
//         return prevContainVar || true;
//       }
//       return prevContainVar || false;
//     }, false);
//   }

//   getVariableNames(): string[] {
//     return [this.a, this.b].reduce((prevVariableNames: string[], arg) => {
//       if (arg instanceof FunctionExpression || arg instanceof Expression) {
//         return [
//           ...prevVariableNames,
//           ...arg.getVariableNames()
//         ];
//       } else if (arg instanceof SymbolExpression) {
//         return [
//           ...prevVariableNames,
//           arg.name
//         ];
//       }
//       return prevVariableNames;
//     }, []);
//   }

//   static getValue(value: Expression | number, values?: { [variable: string]: number }): number | Function {
//     if (value instanceof Expression) {
//       return value.evaluate(values);
//     } else {
//       return value;
//     }
//   }

//   // getFunctionVal = () => 

//   evaluate(values?: { [variable: string]: number }): number | Function {
//     const { a, b } = this;
//     if (
//       (a instanceof SymbolExpression || isFunction(a)) ||
//       (b instanceof SymbolExpression || isFunction(b))
//     ) {

//       const getVal = (val: SymbolExpression | Function | number, variables: { [key: string]: number }): number => {
//         if (val instanceof SymbolExpression) {
//           if (typeof variables[val.name] === 'undefined') {
//             throw new TypeError();
//           }
//           return variables[val.name];
//         } else if (isFunction(val)) {
//           return val(variables);
//         }
//         return val;
//       }

//       return (variables: { [key: string]: number }) => {
//         const aVal = getVal(a as SymbolExpression | Function, variables);
//         const bVal = getVal(b as SymbolExpression | Function, variables);

//         return this.solve(aVal, bVal);
//       }
//     }

//     const evaluatedA = Expression.getValue(a, values);
//     const evaluatedB = Expression.getValue(b, values)

//     if (isFunction(evaluatedA) || isFunction(evaluatedB)) {
//       return (variables: { [key: string]: number }) => {
//         let newA, newB;
//         if (isFunction(evaluatedA)) {
//           newA = evaluatedA(variables);
//         } 
//         else newA = evaluatedA
//         if (isFunction(evaluatedB)) {
//           newB = evaluatedB(variables);
//         } 
//         else newB = evaluatedB
//         return this.solve(newA, newB);
//       }
//     }

//     return this.solve(evaluatedA, evaluatedB);
//   }
// }

// export class Cos extends FunctionExpression {
//   solve(a: number): number {
//     return Math.cos(a);
//   }
// }

// export class Tan extends FunctionExpression {
//   solve(a: number): number {
//     return Math.tan(a);
//   }
// }

// export class Csc extends FunctionExpression {
//   solve(a: number): number {
//     return 1 / Math.sin(a);
//   }
// }

// export class Sec extends FunctionExpression {
//   solve(a: number): number {
//     return 1 / Math.cos(a);
//   }
// }

// export class Cot extends FunctionExpression {
//   solve(a: number): number {
//     return 1 / Math.tan(a);
//   }
// }