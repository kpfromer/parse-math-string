import { Stack } from "./Stack";
import { Token } from "./Token";
import { Queue } from './Queue';
import { tokenize } from "./lexer";
import { Expression } from '../expression';
import { mapping, operators } from "../default-mapping";
import { checkForErrors } from "./CheckForErrors";

const getAssoc = (char: string) => operators[char].associativity;
const getPrecedence = (char: string) => operators[char].precedence;

const shunt = (tokens: Token[]) => {
  const output = new Queue<Token>();
  const ops = new Stack<Token>();

  tokens.forEach(token => {
    const { type, value } = token;
    if (type === 'Literal' || type === 'Variable') { // If number or variable add to the output
      output.push(token);
    } else if (type === 'Function') { // if function add to the operators stack
      ops.push(token);
    } else if (type === 'Function Argument Separator') {
      // Until there is a token at the top that is a left parenthesis
      // pop off operators from the stack and push them into the output
      while (ops.peek() && (ops.peek() as Token).type !== 'Left Parenthesis') {
        output.push(ops.pop() as Token);
      }
    } else if (type === 'Operator') {// if token is operator, o1
      while (
        // while there is operator token, o2, on top of stack
        ops.peek() && (ops.peek() as Token).type === 'Operator' &&
          (
            // while o1 is left-associative and its precedence is less than or equal to o2's precedence
            (getAssoc(value) === 'left' && getPrecedence(value) <= getPrecedence((ops.peek() as Token).value)) ||
            // or o1 is right-associative and its precedence is less than of o2's precedence
            (getAssoc(value) === 'right' && getPrecedence(value) < getPrecedence((ops.peek() as Token).value))
          )
      ) {
        // Add o2 to the output
        output.push(ops.pop() as Token);
      }
      // add token to the operators stack
      ops.push(token);
    } else if (type === 'Left Parenthesis') { // if "("
      // Push "(" to ops stack
      ops.push(token);
    } else if (type === 'Right Parenthesis') { // if ")"
      // Before
      // Ops stack: [+, +, 1, 2, 3, (] (NOTE: movement left to right is mapped on end of output as right to left)
      // After
      // output: [3, 2, 1, +, +]

      while (
        // While there are operators in the stack and the next is not a Left Parenthesis
        ops.peek() && (ops.peek() as Token).type !== 'Left Parenthesis'
      ) {
        // Add operator from stack to output
        output.push(ops.pop() as Token);
      }

      // The operator on top of stack is a Left Parenthesis, so remove it!
      ops.pop();

      if (ops.peek() && (ops.peek() as Token).type === 'Function') { // If there is a operator on top that is a function
        // Pop it into the output
        output.push(ops.pop() as Token);
      }
    }
  })

  // If there are an remaining operators, add them to the end of the output
  ops.asArray().reverse().forEach(op => output.push(op));

  return output.asArray();
}
// '5 + max(1,3, 4, 5) ^ 2 + 1'
// should be '5 1 3 4 5 max 2 ^ + 1 +'
// console.log(shunt(tokenize('5 + max(1,3, 4, 5) ^ 2 + 1')));

// Notice that the order of the numbers change, BUT NOT THE OPERATIONS
// This is the key to evaluating parenthesis!
// console.log(shunt(tokenize('(5*3)+1')));
// console.log(shunt(tokenize('1+(5*3)')));

class ASTNode {
  constructor(
    public token: Token,
    public left: ASTNode | null,
    public right: ASTNode | null
  ) {}

  toString(count: number = 1): string {
    if (!this.left && !this.right)
      return this.token + "\t=>null\n" + Array(count + 1).join("\t") + "=>null";
    count++;
    return this.token + "\t=>" + (!this.left ? 'null' : (this.left as ASTNode).toString(count)) + "\n" + Array(count).join("\t") + "=>" + (!this.right ? 'null' : (this.right as ASTNode).toString(count));
    // const left = !this.left ? 'null' : this.left.toString();
    // const right = !this.right ? 'null' : this.right.toString();
    // return `${this.token.value} =>\n\t${left}\n\t${right}`
  }
}

const createAbstractSyntaxTree = (tokens: Token[]) => {
  const out = new Stack<ASTNode>();
  const ops = new Stack<Token>();

  const addNode = (operator: Token) => {
    const rightChild = out.pop() as ASTNode;
    const leftChild = out.pop() as ASTNode;
    out.push(new ASTNode(operator, leftChild, rightChild));
  }

  tokens.forEach(token => {
    const { type, value } = token;

    if (type === 'Literal' || type === 'Variable') {
      out.push(new ASTNode(token, null, null));
    } else if (type === 'Function') {
      ops.push(token);
    } else if (type === 'Function Argument Separator') {
      while (ops.isNext() && (ops.peek() as Token).type !== 'Left Parenthesis') {
        addNode(ops.pop() as Token)
      }
    } else if (type === 'Operator') {
      while(
        (ops.isNext() && (ops.peek() as Token).type === 'Operator') &&
        (
          getAssoc(value) === 'left' && getPrecedence(value) <= getPrecedence((ops.peek() as Token).value) ||
          getAssoc(value) === 'right' && getPrecedence(value) < getPrecedence((ops.peek() as Token).value)
        )
      ) {
        addNode(ops.pop() as Token);
      }
      ops.push(token);
    } else if (type === 'Left Parenthesis') {
      ops.push(token);
    } else if (type === 'Right Parenthesis') {
      while (ops.isNext() && (ops.peek() as Token).type !== 'Left Parenthesis') {
        addNode(ops.pop() as Token);
      }
      ops.pop();

      if (ops.isNext() && (ops.peek() as Token).type === 'Function') {
        addNode(ops.pop() as Token);
      }
    }
  });
  while(ops.isNext()) {
    addNode(ops.pop() as Token);
  }

  return out.pop() as ASTNode;
}

const evaluateASTNode = (node: ASTNode): Expression | string | number => {
  const { type, value } = node.token;
  const left = !node.left ? null : evaluateASTNode(node.left);
  const right = !node.right ? null : evaluateASTNode(node.right);
  return mapping[type](value, left, right);
  // if (!mapping[type]) {
  //   return value;
  // } 
  // if (type === 'Variable') {
  //   return new mapping.Variable(value);
  // } else if (type === 'Operator') {
  //   const left: any = !node.left ? 0 : evaluateASTNode(node.left);
  //   const right: any = !node.right ? 0 : evaluateASTNode(node.right);
  //   return new mapping.Operator[value](left, right);
  // } else if (type === 'Literal') {
  //   return parseFloat(value);
  // } 
  // else if (type === 'Function') { // TODO: make better
  //   const left: any = !node.left ? 0 : evaluateASTNode(node.left);
  //   const right: any = !node.right ? 0 : evaluateASTNode(node.right);
  //   return new mapping.Function[value]([right, left]);
  // }
}

// 3+4*2/(1-5)^2^3

// TODO: fix sin(1, 3, 3)

// const node = createAbstractSyntaxTree(tokenize('5x^2+4x+3'));


// // console.log(node.toString());
// console.log(JSON.stringify(node, null, 2));

// const val = evaluateASTNode(node);
// // console.log(JSON.stringify(val, null, 2));

// console.log((val.evaluate() as Function)({x: 10}));

// const node = createAbstractSyntaxTree(tokenize('(1+2)^3*x'));

export const parse = (string: string): Expression | number | string => {
  checkForErrors(string);
  const value = evaluateASTNode(createAbstractSyntaxTree(tokenize(string)));
  if (!(value instanceof Expression)) { // if value is a number or string (just a symbol)
    return value as string | number;
  }
  return value as Expression;
}