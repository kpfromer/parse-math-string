import { Token } from './Token';

// TODO: use operators from default mapping
const operators = [
  '+',
  '-',
  '*',
  '/',
  '^'
]

const isComma = (char: string) => char === ',';
const isDigit = (char: string) => !isNaN(parseInt(char)); 
const isLetter = (char: string) => char.match(/[a-z]/i);
const isOperator = (char: string) => operators.includes(char); 
const isLeftParenthesis = (char: string) => char === '('; 
const isRightParenthesis = (char: string) => char === ')'; 


export const tokenize = (string: string) => {
  const data = string.split('')

  const result: Token[] = [];
  let letterBuffer: string[] = [];
  let numberBuffer: string[] = [];

  const emptyNumberBufferAsLiteral = () => {
    if (numberBuffer.length > 0) {
      result.push(new Token('Literal', numberBuffer.join('')));
      numberBuffer = [];
    }
  }

  const emptyLetterBufferAsVariables = () => {
    if (letterBuffer.length > 0) {
      letterBuffer.forEach((letter, index) => {
        result.push(new Token('Variable', letter));
        if(index < letterBuffer.length - 1) { //there are more Variables left
          result.push(new Token("Operator", "*"));
        }
      });
      letterBuffer = [];
    }
  }

  data.forEach(value => {
    if (isDigit(value) || value === '.') {
      numberBuffer.push(value);
    } else if (isLetter(value)) {
      if (numberBuffer.length > 0) {
        emptyNumberBufferAsLiteral();
        result.push(new Token('Operator', '*'));
      }
      letterBuffer.push(value);
    } else if (isOperator(value)) {
      emptyNumberBufferAsLiteral();
      emptyLetterBufferAsVariables();
      if (result.length > 0) {
        const lastValue = result[result.length - 1];
        if (lastValue.type === 'Operator' && value === '-') {
          numberBuffer.push('-');
        } else {
          result.push(new Token('Operator', value));
        }
      } else { // adding a negative at the beginning of string
        numberBuffer.push('-');
      }
      
    } else if (isLeftParenthesis(value)) {
      if(letterBuffer.length > 0) {
				result.push(new Token("Function", letterBuffer.join("")));
				letterBuffer = [];
			} else if (numberBuffer.length > 0) { // If it is just parentheses
        emptyNumberBufferAsLiteral();
        result.push(new Token('Operator', '*'));
      }
      result.push(new Token('Left Parenthesis', value))
    } else if (isRightParenthesis(value)) {
      emptyLetterBufferAsVariables();
			emptyNumberBufferAsLiteral();
			result.push(new Token("Right Parenthesis", value));
    } else if (isComma(value)) {
			emptyNumberBufferAsLiteral();
			emptyLetterBufferAsVariables();
			result.push(new Token("Function Argument Separator", value));
		}
  });
  if (numberBuffer.length > 0) {
		emptyNumberBufferAsLiteral();
	}
	if(letterBuffer.length > 0) {
		emptyLetterBufferAsVariables();
	}
	return result;
};