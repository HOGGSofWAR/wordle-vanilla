const gameboardElement = document.querySelector('.gameboard');
const keypadElement = document.querySelector('.keypad');
const messageElement = document.querySelector('.messages__text');
const errorElement = document.querySelector('.error-messages__text');

const rows = 6;
const blocks = 5;
const word = 'aurei';
let gameOver = false;

const generateGameboard = () => {
    for(let i = 0; i < rows; i++) {
    let rowElement = document.createElement('div');
    rowElement.classList.add('gameboard__row');

    for(let x = 0; x < blocks; x++) {
      let blockElement = document.createElement('div');
      let p = document.createElement('p');
      blockElement.classList.add('gameboard__block');
      blockElement.appendChild(p);

      rowElement.appendChild(blockElement);
    }

    gameboardElement.appendChild(rowElement);
  }
}

generateGameboard();

const generateKeypad = () => {
  const keyboardValues = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<<']
  ];

  keyboardValues.forEach(row => {
    let rowElement = document.createElement('div');
    rowElement.classList.add('keypad__row');

    row.forEach(value => {
      let blockElement = document.createElement('button');
      blockElement.classList.add('keypad__button');
      blockElement.textContent = value;
      blockElement.setAttribute('data-letter', value);

      rowElement.appendChild(blockElement);
    })

    keypadElement.appendChild(rowElement);
  });
}

generateKeypad();

let currentRow = 0;
let currentBlock = 0;
let currentGuess = [];

const handleKeypadInput = e => {
  if(gameOver) return;
  if(!e.target.classList.contains('keypad__button')) return;
  const letter = e.target.dataset.letter;
  
  switch(letter){
    case '<<':
      handleBackspace();
      break;
    case 'Enter':
      handleEnter();
      break;
    default:
      handleLetter(letter);
  }
}

const handleBackspace = () => {
  if(currentBlock === 0) return;
  currentGuess.pop();

  currentBlock--;
  gameboardElement.children[currentRow].children[currentBlock].children[0].innerHTML = '';
}

const handleEnter = async () => {
  errorElement.innerHTML = '';
  if(currentBlock !== blocks){
    errorElement.innerHTML = 'Not enough letters';
    return;
  }
  
  const guessAsString = currentGuess.join('');
  
  async function checkWord() {
    try {
      let response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guessAsString}`);
      let data = await response.json();
      return Array.isArray(data);
    } catch (error) {
      console.log(error);
    }
  }
  
  let validWord = await checkWord();
  
  if(!validWord) {
    errorElement.innerHTML = 'This is not a valid word';
    return;
  }
  
  const wordArray = Array.from(word.toUpperCase());
  let currentExactMatches = 0;
  currentGuess.forEach((guessLetter, index) => {
    if(guessLetter === wordArray[index]){
      gameboardElement.children[currentRow].children[index].classList.add('gameboard__block--green');
      keypadElement.querySelector(`[data-letter=${guessLetter}]`).classList.add('keypad__button--green');
      currentExactMatches++;
    } else if(wordArray.includes(guessLetter)){
      gameboardElement.children[currentRow].children[index].classList.add('gameboard__block--yellow');
      keypadElement.querySelector(`[data-letter=${guessLetter}]`).classList.add('keypad__button--yellow');
      // how do we handle multiple letters?
      // check if this letter has previously been guessed and was an exact match
      // then we need to check if this same letter appears again, but ignore the other exact match
      // if it does, then show this as yellow
      // if it doesn't, then show this as grey
    } else {
      gameboardElement.children[currentRow].children[index].classList.add('gameboard__block--grey');
      keypadElement.querySelector(`[data-letter=${guessLetter}]`).classList.add('keypad__button--grey');
    }
  });
  if(currentExactMatches === blocks) {
    console.log('YOU WIN');
    messageElement.innerHTML = 'You Win!'
    gameOver = true;
  } else {
    if(currentRow === (rows - 1)){
      messageElement.innerHTML = 'You Lose!'
      gameOver = true;
    }else{
      currentRow++;
      currentBlock = 0;     
    } 
  }
    
}

const handleLetter = letter => {
  if(currentBlock > (blocks - 1)) return;
  gameboardElement.children[currentRow].children[currentBlock].children[0].innerHTML = letter;
  
  currentGuess[currentBlock] = letter;
  currentBlock++;
}

keypadElement.addEventListener('click', handleKeypadInput);