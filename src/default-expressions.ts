import { Expression, ExpressType, FunctionExpression } from "./expression";

export class Add extends Expression {
  constructor(
    a: ExpressType,
    b: ExpressType,
  ) {
    super(a, b, (a: number, b: number) => a + b);
  }

  toString() {
    const { a, b } = this.getABString();
    return `${a}+${b}`;
  }
}

export class Subtract extends Expression {
  constructor(
    a: ExpressType,
    b: ExpressType,
  ) {
    super(a, b, (a: number, b: number) => a - b);
  }

  toString() {
    const { a, b } = this.getABString();
    return `${a}+-${b}`;
  }
}

// export class Multiply extends Expression {
//   constructor(
//     a: ExpressType,
//     b: ExpressType,
//   ) {
//     super(a, b, (a: number, b: number) => a * b);
//   }
// }

// export class Divide extends Expression {
//   constructor(
//     a: ExpressType,
//     b: ExpressType,
//   ) {
//     super(a, b, (a: number, b: number) => a / b);
//   }
// }
  
// export class Power extends Expression {
//   constructor(
//     a: ExpressType,
//     b: ExpressType,
//   ) {
//     super(a, b, (a: number, b: number) => Math.pow(a, b));
//   }
// }

// export class Sin extends FunctionExpression {
//   constructor(args: ExpressType[]) {
//     super(args, (a: number) => Math.sin(a));
//   }
// }

// export class Cos extends FunctionExpression {
//   constructor(args: ExpressType[]) {
//     super(args, (a: number) => Math.cos(a));
//   }
// }

// export class Tan extends FunctionExpression {
//   constructor(args: ExpressType[]) {
//     super(args, (a: number) => Math.tan(a));
//   }
// }

// export class Csc extends FunctionExpression {
//   constructor(args: ExpressType[]) {
//     super(args, (a: number) => 1 / Math.sin(a));
//   }
// }

// export class Sec extends FunctionExpression {
//   constructor(args: ExpressType[]) {
//     super(args, (a: number) => 1 / Math.cos(a));
//   }
// }

// export class Cot extends FunctionExpression {
//   constructor(args: ExpressType[]) {
//     super(args, (a: number) => 1 / Math.tan(a));
//   }
// }