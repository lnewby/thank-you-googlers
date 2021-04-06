console.log("Thank you, Googlers!");
const BLOCK_WIDTH = 90;
const BLOCK_HEIGHT = 90;
let SHOW_HINT = false;
let blankPieceGridIndex;
let gameBlocks = [];

class puzzleBlock {
    constructor(index, spriteX = 0, spriteY = 0, row = 0, col = 0) {
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.row = row;
        this.col = col;
        this.index = index;
        this.deltaX = 0;
        this.deltaY = 0;
    }
}

function initPuzzleBlocks(grid, sprite, rows, cols) {
    
    // build puzzle pieces
    let spriteWidth = sprite.width / cols;
    let spriteHeight = sprite.height / rows;

    for (let row = 0; row < rows; ++ row) {
        for (let col = 0; col < cols; ++col) {
            let blockIndex = row * cols + col;
            let spriteX = col * spriteWidth;
            let spriteY = row * spriteHeight;
            gameBlocks.push(
                new puzzleBlock(
                    blockIndex, 
                    spriteX, 
                    spriteY
                )
            );
        }
    }

    // array of ints [0,1,2,3... WxH] to help randomize pieces on grid
    let pieces = Array.from(Array(grid.length).keys())

    // randomly assign puzzle pieces on grid
    for (let i = 0; i < grid.length; ++i) {
        let pieceIndex = Math.floor(Math.random() * pieces.length);
        grid[i].block = gameBlocks[pieces[pieceIndex]];
        if (pieces[pieceIndex] == 15) {
            blankPieceGridIndex = i;
        }
        pieces.splice(pieceIndex, 1);
    }

    return grid
}

function getInitGrid(rows, cols, sprite) {
    let tempGrid = [];
    for (let row=0; row<rows; ++row) {
        for (let col=0; col<cols; ++col) {
            tempGrid.push({ 
                x: col * BLOCK_WIDTH, 
                y: row * BLOCK_HEIGHT,
                row,
                col,
                block: null
            });
        }
    }

    tempGrid = initPuzzleBlocks(tempGrid, sprite, rows, cols);

    return tempGrid;
}

let sliderPuzzle = {
    canvas: document.getElementById("game-canvas"),
    gameGrid: [],
    numRows: null,
    numCols: null,
    sprite: new Image(),
    start: function(rows = 2, cols = 2) {
        this.context = this.canvas.getContext("2d"); 
        this.sprite.src = "Google.png";
        this.numRows = rows;
        this.numCols = cols;
        this.gameGrid = getInitGrid(rows, cols, this.sprite);
        this.interval = setInterval(updateGame, 20);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    draw: function() {
        if (SHOW_HINT) {
            this.context.drawImage(this.sprite, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            let spriteWidth = this.sprite.width / this.numCols;
            let spriteHeight = this.sprite.height / this.numRows;
            for (let i = 0; i < this.gameGrid.length; ++i) {
                let {x, y, block} = this.gameGrid[i];
                if (i != blankPieceGridIndex) {
                    this.context.drawImage(
                        this.sprite, 
                        block.spriteX, 
                        block.spriteY, 
                        spriteWidth, 
                        spriteHeight, 
                        x, y, 
                        BLOCK_WIDTH, 
                        BLOCK_HEIGHT
                    );
                } else {
                    this.context.fillStyle = "grey";
                    this.context.fillRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);
                }
                
            }
        }
    },
    swapPuzzleBlocks(index1, index2) {
        let tempBlock = this.gameGrid[index1].block;
        this.gameGrid[index1].block = this.gameGrid[index2].block;
        this.gameGrid[index2].block = tempBlock;
    },
    checkWinState() {
        let winState = true;

        for (let gridIndex = 0; gridIndex < this.gameGrid.length; ++gridIndex) {
            let { block } = this.gameGrid[gridIndex];
            winState &= (block.index == gridIndex);
            if (!winState) break;
        }

        if (winState) {
            
        } else {
            
        }
        
        return winState;
    }
}

function startGame() {
    console.log("Starting Game...");
    let numRows = 3;
    let numCols = 6;
    sliderPuzzle.start(numRows, numCols);
}


function updateGame() {
    sliderPuzzle.clear();
    sliderPuzzle.draw();
    sliderPuzzle.checkWinState()
}

// Event System

function moveup() {
    let pieceAboveIndex = blankPieceGridIndex + 6

    if (pieceAboveIndex < 18) {
        sliderPuzzle.swapPuzzleBlocks(pieceAboveIndex, blankPieceGridIndex);
        blankPieceGridIndex = pieceAboveIndex;
    }
}

function movedown() {
    let pieceAboveIndex = blankPieceGridIndex - 6

    if (pieceAboveIndex >= 0) {
        sliderPuzzle.swapPuzzleBlocks(pieceAboveIndex, blankPieceGridIndex);
        blankPieceGridIndex = pieceAboveIndex;
    }
}

function moveleft() {
    let pieceRightIndex = blankPieceGridIndex + 1
    let { gameGrid } = sliderPuzzle;
    if (pieceRightIndex < 18 && gameGrid[pieceRightIndex].col > 0) {
        sliderPuzzle.swapPuzzleBlocks(pieceRightIndex, blankPieceGridIndex);
        blankPieceGridIndex = pieceRightIndex;
    }
}

function moveright() {
    let pieceLeftIndex = blankPieceGridIndex - 1
    let { gameGrid } = sliderPuzzle;
    if (pieceLeftIndex >= 0 && gameGrid[pieceLeftIndex].col < 5) {
        sliderPuzzle.swapPuzzleBlocks(pieceLeftIndex, blankPieceGridIndex);
        blankPieceGridIndex = pieceLeftIndex;
    }
}

function showHint() {
    SHOW_HINT = true;
}

function hideHint() {
    SHOW_HINT = false;
}

document.addEventListener('keydown', e => {
    let key = e.key || String.fromCharCode(e.keyCode);

    if (key in ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])
        e.preventDefault();

    switch(key) {
        case "ArrowUp": 
            e.preventDefault();
            moveup();
            break;
        case "ArrowDown": 
            movedown();
            break;
        case "ArrowLeft": 
            moveleft();
            break;
        case "ArrowRight": 
            moveright();
            break;
    }
}, false);
