import { Expression, ExpressType, FunctionExpression } from "./expression";

export class Add extends Expression {
  constructor(
    a: ExpressType,
    b: ExpressType,
  ) {
    super(a, b, (a: number, b: number) => a + b, 2);
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
    super(a, b, (a: number, b: number) => a - b, 2);
  }

  toString() {
    const { a, b } = this.getABString();
    return `${a}-${b}`;
  }
}

export class Multiply extends Expression {
  constructor(
    a: ExpressType,
    b: ExpressType,
  ) {
    super(a, b, (a: number, b: number) => a * b, 3);
  }

  toString() {
    const { a, b } = this.getABString();
    return `${a}*${b}`;
  }
}

export class Divide extends Expression {
  constructor(
    a: ExpressType,
    b: ExpressType,
  ) {
    super(a, b, (a: number, b: number) => a / b, 3);
  }

  toString() {
    const { a, b } = this.getABString();
    return `${a}/${b}`;
  }
}
  
export class Power extends Expression {
  constructor(
    a: ExpressType,
    b: ExpressType,
  ) {
    super(a, b, (a: number, b: number) => Math.pow(a, b), 4);
  }
  toString() {
    const { a, b } = this.getABString();
    return `${a}^${b}`;
  }
}

export class Sin extends FunctionExpression {
  constructor(args: ExpressType[]) {
    super(args, (a: number) => Math.sin(a));
  }

  toString() {
    return `sin(${this.args[0]})`;
  }
}

export class Cos extends FunctionExpression {
  constructor(args: ExpressType[]) {
    super(args, (a: number) => Math.cos(a));
  }

  toString() {
    return `cos(${this.args[0]})`;
  }
}

export class Tan extends FunctionExpression {
  constructor(args: ExpressType[]) {
    super(args, (a: number) => Math.tan(a));
  }

  toString() {
    return `tan(${this.args[0]})`;
  }
}

export class Csc extends FunctionExpression {
  constructor(args: ExpressType[]) {
    super(args, (a: number) => 1 / Math.sin(a));
  }

  toString() {
    return `csc(${this.args[0]})`;
  }
}

export class Sec extends FunctionExpression {
  constructor(args: ExpressType[]) {
    super(args, (a: number) => 1 / Math.cos(a));
  }

  toString() {
    return `sec(${this.args[0]})`;
  }
}

export class Cot extends FunctionExpression {
  constructor(args: ExpressType[]) {
    super(args, (a: number) => 1 / Math.tan(a));
  }

  toString() {
    return `cot(${this.args[0]})`;
  }
}