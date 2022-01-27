import {Cell} from './cell.js'
import {UI} from './ui.js'

class Game extends UI{
    #config = {
      easy: {
        rows: 8,
        cols: 8,
        mines:10,

      },
        medium: {
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
    #numbersOfRows = null;
    #numbersOfCols = null;
    #numbersOfMines = null;
    #cells = [];
    #cellsElements = null;

    #board = null;





    initializeGame(){
        this.#handleElements();
        this.#newGame()
    }
    #newGame(rows = this.#config.easy.rows, cols= this.#config.easy.cols, mines = this.#config.easy.mines){

        this.#numbersOfRows = rows;
        this.#numbersOfCols = cols;
        this.#numbersOfMines = mines;

        this.#setStyles()

        this.#generateCells()
        this.#renderBoard()
        this.#cellsElements = this.getElements(this.UiSelectors.cell)

        this.#addCellsEventListeners();
    }
    #handleElements(){
        this.#board = this.getElement(this.UiSelectors.board)
    }

    #addCellsEventListeners() {
       this.#cellsElements.forEach(element => {
           element.addEventListener('click',this.#handleCellClick)
           element.addEventListener('contextmenu',this.#handleCellContextmenu)
       })
    }

    #generateCells(){
        for (let row = 0; row < this.#numbersOfRows; row++){
            this.#cells[row] = [];
        for (let col = 0; col < this.#numbersOfCols; col++){
            this.#cells[row].push(new Cell(col, row))
        }
        }
    }

    #renderBoard(){
        this.#cells.flat().forEach(cell => {
            this.#board.insertAdjacentHTML('beforeend', cell.creatElement());
            cell.element = cell.getElement(cell.selector)



        })
    }
    #handleCellClick = (e) => {
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'),10);
        const colIndex = parseInt(target.getAttribute('data-x'),10);

        this.#cells[rowIndex][colIndex].revealCell();
    }
    #handleCellContextmenu = (e)=>{
        e.preventDefault();
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'),10);
        const colIndex = parseInt(target.getAttribute('data-x'),10);

        const cell = this.#cells[rowIndex][colIndex];

        if (cell.isReveal){return}
        cell.toggleFlag();

    }



    #setStyles(){
        document.documentElement.style.setProperty('--cells-in-row',this.#numbersOfRows)
    }



}



window.onload = function(){
    const game = new Game();

    game.initializeGame();
}