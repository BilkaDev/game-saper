import {Cell} from './cell.js';
import {UI} from './ui.js';
import { Counter } from './counter.js';
import {Timer} from "./timer.js";
import {ResetButton} from "./resetButton.js";
import {Modal} from "./modal.js";




class Game extends UI{
    #config = {
      easy: {
        rows: 8,
        cols: 8,
        mines: 10,

      },
        normal: {
            rows: 16,
            cols: 16,
            mines:40,

        },
        expert: {
            rows: 30,
            cols: 30,
            mines:99,

        },
    }
    #counter = new Counter();
    #timer = new Timer();
    #modal = new Modal();

    #numbersOfRows = null;
    #numbersOfCols = null;
    #numbersOfMines = null;
    #cells = [];
    #cellsElements = null;
    #cellsToReveal = 0;
    #revealedCells = 0;


    #board = null;

    #buttons = {
        modal: null,
        easy: null,
        normal: null,
        expert: null,
        reset: new ResetButton(),

    }


    #isGameFinished = false;





    initializeGame(){
        this.#handleElements();
        this.#counter.init();
        this.#timer.init();
        this.#addButtonsEventListener();
        this.#newGame();
    }

    #newGame(
        rows = this.#config.easy.rows,
        cols= this.#config.easy.cols,
        mines = this.#config.easy.mines){

        this.#numbersOfRows = rows;
        this.#numbersOfCols = cols;
        this.#numbersOfMines = mines;

        this.#counter.setValue(this.#numbersOfMines);
        this.#timer.resetTimer();

        this.#cellsToReveal = this.#numbersOfCols * this.#numbersOfRows - this.#numbersOfMines;



        this.#setStyles();

        this.#generateCells();
        this.#renderBoard();
        this.#placeMinesInCells();

        this.#cellsElements = this.getElements(this.UiSelectors.cell);

        this.#buttons.reset.changeEmotion('neutral');
        this.#isGameFinished = false;
        this.#revealedCells = 0;

        this.#addCellsEventListeners();
    }
    #endGame(isWin){
        this.#isGameFinished = true;
        this.#timer.stopTimer();
        this.#modal.buttonText = 'close'

        if (!isWin){
            this.#revealMines();
            this.#modal.infoText = 'You lost, try again!';
            this.#buttons.reset.changeEmotion('negative');
            this.#modal.setText();
            this.#modal.toggleModal();
            return
        }
        this.#modal.infoText = this.#timer.numberOfSeconds < this.#timer.maxNumberOfSeconds ?
            `Congratulations, You win! It took you ${this.#timer.numberOfSeconds} second`: 'Congratulations, You win!';
        this.#buttons.reset.changeEmotion('positive');
        this.#modal.setText();
        this.#modal.toggleModal();
    }

    #handleElements(){
        this.#board = this.getElement(this.UiSelectors.board);
        this.#buttons.modal = this.getElement(this.UiSelectors.modalButton)
        this.#buttons.easy = this.getElement(this.UiSelectors.easyButton)
        this.#buttons.normal = this.getElement(this.UiSelectors.normalButton)
        this.#buttons.expert = this.getElement(this.UiSelectors.expertButton)

    }

    #addCellsEventListeners() {
       this.#cellsElements.forEach(element => {
           element.addEventListener('click',this.#handleCellClick)
           element.addEventListener('contextmenu',this.#handleCellContextmenu)
       })
    }

    #addButtonsEventListener() {
        this.#buttons.modal.addEventListener('click',this.#modal.toggleModal)

        this.#buttons.easy.addEventListener('click',()=> this.#handleNewGameClick(this.#config.easy.rows,this.#config.easy.cols, this.#config.easy.mines))
        this.#buttons.normal.addEventListener('click',()=> this.#handleNewGameClick(this.#config.normal.rows,this.#config.normal.cols, this.#config.normal.mines))

        this.#buttons.expert.addEventListener('click',()=> this.#handleNewGameClick(this.#config.expert.rows,this.#config.expert.cols, this.#config.expert.mines))

        this.#buttons.reset.element.addEventListener('click',()=> this.#handleNewGameClick())

    }

    #removeCellsEventListener(){
        this.#cellsElements.forEach(element=> {
            element.removeEventListener('click', this.#handleCellClick)
            element.removeEventListener('contextmenu', this.#handleCellContextmenu)
        })
    }



    #handleNewGameClick(rows= this.#numbersOfRows, cols= this.#numbersOfCols, mines = this.#numbersOfMines){
        this.#removeCellsEventListener();
        this.#newGame(rows, cols, mines);
    }


    #generateCells(){
        this.#cells.length = 0;
        for (let row = 0; row < this.#numbersOfRows; row++){
            this.#cells[row] = [];
        for (let col = 0; col < this.#numbersOfCols; col++){
            this.#cells[row].push(new Cell(col, row))
        }
        }
    }

    #renderBoard(){
        while (this.#board.firstChild){
            this.#board.removeChild(this.#board.lastChild)
        }
        this.#cells.flat().forEach(cell => {
            this.#board.insertAdjacentHTML('beforeend', cell.creatElement());
            cell.element = cell.getElement(cell.selector)



        })
    }
    #placeMinesInCells(){
        let minesToPlace = this.#numbersOfMines;
        while(minesToPlace){
            const rowIndex = this.#getRandomInteger(0,this.#numbersOfRows-1)
            const colIndex = this.#getRandomInteger(0,this.#numbersOfCols-1)

            const cell = this.#cells[rowIndex][colIndex];

            const hasCellMine = cell.isMine

            if (!hasCellMine){
                cell.addMine();
                minesToPlace--;
            }
        }
}
    #handleCellClick = (e) => {
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'),10);
        const colIndex = parseInt(target.getAttribute('data-x'),10);

        const cell = this.#cells[rowIndex][colIndex];
        this.#clickCell(cell);
    }

    #handleCellContextmenu = (e)=>{
        e.preventDefault();
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'),10);
        const colIndex = parseInt(target.getAttribute('data-x'),10);

        const cell = this.#cells[rowIndex][colIndex];

        if (cell.isReveal || this.#isGameFinished) return;

        if (cell.isFlagged){
            this.#counter.increment()
            cell.toggleFlag()
            return;
        }
        if(!!this.#counter.value){
            this.#counter.decrement();
            cell.toggleFlag();

        }





    }
    #clickCell(cell){
        if (this.#isGameFinished || cell.isFlagged)return
        if(cell.isMine){
            this.#endGame(false);
        }
        this.#setCellValue(cell)
        if (this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished){
            this.#endGame(true);

        }
    }

    #revealMines() {
        this.#cells
            .flat()
            .filter(({isMine}) => isMine)
            .forEach(cell => {
                cell.revealCell()

            });



    }

    #setCellValue(cell){
        let minesCount = 0;
        for (let rowIndex = Math.max(cell.y - 1,0); rowIndex <= Math.min(cell.y + 1,this.#numbersOfRows-1); rowIndex++){
            for (let colIndex = Math.max(cell.x - 1,0); colIndex <= Math.min(cell.x+1,this.#numbersOfCols-1); colIndex++){
                if (this.#cells[rowIndex][colIndex].isMine){ minesCount++}
            }
        }

        cell.value = minesCount;
        cell.revealCell();
        this.#revealedCells++;
        if (!cell.value){
            for (let rowIndex = Math.max(cell.y - 1,0); rowIndex <= Math.min(cell.y + 1,this.#numbersOfRows-1); rowIndex++){
                for (let colIndex = Math.max(cell.x - 1,0); colIndex <= Math.min(cell.x+1,this.#numbersOfCols-1); colIndex++){
                    if (!this.#cells[rowIndex][colIndex].isReveal){
                        this.#clickCell(this.#cells[rowIndex][colIndex]);
                    }
                }
            }

        }
    }

    #setStyles(){
        document.documentElement.style.setProperty('--cells-in-row',this.#numbersOfRows)
    }



    #getRandomInteger(min, max){
        return Math.floor(Math.random() * (max-min +1) + min)
    }
}



window.onload = function(){
    const game = new Game();

    game.initializeGame();
}