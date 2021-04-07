console.log("Thank you, Googlers!");
const GameStatus = Object.freeze({
    IN_PROGESS: 1,
    SOLVED: 2,
    SHOW_HINT: 3,
    SHUFFLE_BOARD: 4
});

const GameState = {
    STATUS: GameStatus.IN_PROGESS,
    PRIOR_STATUS: GameStatus.IN_PROGESS,
    BLOCK_WIDTH: 90,
    BLOCK_HEIGHT: 90,
    BLANK_PIECE_INDEX: 0,
    gameBlocks: [],
    initGridIndices: [],
    GLOBAL_ALPHA: 0,
    DELTA_ALPHA: 0.1,
    SOLVABLE_PUZZLE: false,
    DEBUG: false
};

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
    GameState.gameBlocks = []; 
    GameState.SOLVABLE_PUZZLE = false;

    for (let row = 0; row < rows; ++ row) {
        for (let col = 0; col < cols; ++col) {
            let blockIndex = row * cols + col;
            let spriteX = col * spriteWidth;
            let spriteY = row * spriteHeight;
            GameState.gameBlocks.push(
                new puzzleBlock(
                    blockIndex, 
                    spriteX, 
                    spriteY
                )
            );
        }
    }

    while(!GameState.SOLVABLE_PUZZLE) {
        // array of ints [0,1,2,3... WxH] to help randomize pieces on grid
        let pieces = Array.from(Array(grid.length).keys())

        // randomly assign puzzle pieces on grid
        let str = '';
        GameState.initGridIndices = [];

        for (let i = 0; i < grid.length; ++i) {
            let pieceIndex = Math.floor(Math.random() * pieces.length);
            grid[i].block = GameState.gameBlocks[pieces[pieceIndex]];

            GameState.initGridIndices.push(grid[i].block.index);

            if (GameState.DEBUG) {
                str += `${grid[i].block.index}, `;
                if ((i+1) % cols == 0) {
                    console.log(str);
                    str = '';
                }
            }
            
            if (pieces[pieceIndex] == grid.length - 1) {
                GameState.BLANK_PIECE_INDEX = i;
            }
            pieces.splice(pieceIndex, 1);
        }

        evenInversion = totalInversions() % 2 == 0;
        oddNumCols = cols % 2 != 0
        GameState.SOLVABLE_PUZZLE = evenInversion && oddNumCols;
    }

    return grid
}

function getInitGrid(rows, cols, sprite) {
    let tempGrid = [];
    for (let row=0; row<rows; ++row) {
        for (let col=0; col<cols; ++col) {
            tempGrid.push({ 
                x: col * GameState.BLOCK_WIDTH, 
                y: row * GameState.BLOCK_HEIGHT,
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
        GameState.BLOCK_WIDTH = this.canvas.width / cols;
        GameState.BLOCK_HEIGHT = this.canvas.height / rows;
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
        switch (GameState.STATUS) {
            case GameStatus.IN_PROGESS:
                let spriteWidth = this.sprite.width / this.numCols;
                let spriteHeight = this.sprite.height / this.numRows;
                for (let i = 0; i < this.gameGrid.length; ++i) {
                    let {x, y, block} = this.gameGrid[i];
                    if (i != GameState.BLANK_PIECE_INDEX) {
                        this.context.drawImage(
                            this.sprite, 
                            block.spriteX, 
                            block.spriteY, 
                            spriteWidth, 
                            spriteHeight, 
                            x, y, 
                            GameState.BLOCK_WIDTH, 
                            GameState.BLOCK_HEIGHT
                        );
                    } else {
                        this.context.fillStyle = "grey";
                        this.context.fillRect(x, y, GameState.BLOCK_WIDTH, GameState.BLOCK_HEIGHT);
                    }
                    
                }
                break;
            case GameStatus.SOLVED:
                if (GameState.DEBUG) console.log("winner!!!");
                this.showSolution();
                break;
            case GameStatus.SHOW_HINT:
                this.context.drawImage(this.sprite, 0, 0, this.canvas.width, this.canvas.height);
                break;
            case GameStatus.SHUFFLE_BOARD:
                this.shuffleBoard();
                break;
            default:
                break;
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

        if (winState)
            GameState.STATUS = GameStatus.SOLVED;
    },
    showSolution() {
        if (GameState.GLOBAL_ALPHA < 1) {
            GameState.GLOBAL_ALPHA += GameState.DELTA_ALPHA;
        }
        this.context.globalAlpha = GameState.GLOBAL_ALPHA;
        this.context.drawImage(this.sprite, 0, 0, this.canvas.width, this.canvas.height);
    },
    shuffleBoard() {
        this.gameGrid = getInitGrid(this.numRows, this.numCols, this.sprite);
        if (GameState.DEBUG) 
            console.log(`inversions: ${totalInversions()}`);

        GameState.STATUS = GameStatus.IN_PROGESS;
    }
};

function totalInversions() {
    let inversions = 0;
    for (let i = 0; i < GameState.initGridIndices.length; ++i) {
        for (let j = i+1; j < GameState.initGridIndices.length; ++j) {
            if (GameState.initGridIndices[i] > GameState.initGridIndices[j])
                ++inversions;
        }
    }

    return inversions;
}

function startGame() {
    console.log("Starting Game...");
    let numRows = 3;
    let numCols = 3;
    GameState.STATUS = GameStatus.IN_PROGESS;
    GameState.DEBUG = true;
    sliderPuzzle.start(numRows, numCols);

    if (GameState.DEBUG) 
        console.log(`inversions: ${totalInversions()}`);
}


function updateGame() {
    sliderPuzzle.clear();
    sliderPuzzle.draw();
    sliderPuzzle.checkWinState()
}

// Event System

function moveup() {
    let { numRows, numCols } = sliderPuzzle;
    let pieceAboveIndex = GameState.BLANK_PIECE_INDEX + numCols;

    if (pieceAboveIndex < numRows * numCols) {
        sliderPuzzle.swapPuzzleBlocks(pieceAboveIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceAboveIndex;
    }
}

function movedown() {
    let pieceAboveIndex = GameState.BLANK_PIECE_INDEX - sliderPuzzle.numCols;

    if (pieceAboveIndex >= 0) {
        sliderPuzzle.swapPuzzleBlocks(pieceAboveIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceAboveIndex;
    }
}

function moveleft() {
    let pieceRightIndex = GameState.BLANK_PIECE_INDEX + 1
    let { gameGrid, numRows, numCols } = sliderPuzzle;
    if (pieceRightIndex < numRows * numCols && gameGrid[pieceRightIndex].col > 0) {
        sliderPuzzle.swapPuzzleBlocks(pieceRightIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceRightIndex;
    }
}

function moveright() {
    let pieceLeftIndex = GameState.BLANK_PIECE_INDEX - 1
    let { gameGrid, numCols } = sliderPuzzle;
    if (pieceLeftIndex >= 0 && gameGrid[pieceLeftIndex].col < numCols - 1) {
        sliderPuzzle.swapPuzzleBlocks(pieceLeftIndex, GameState.BLANK_PIECE_INDEX);
        GameState.BLANK_PIECE_INDEX = pieceLeftIndex;
    }
}

function showHint() {
    GameState.PRIOR_STATUS = GameState.STATUS;
    GameState.STATUS = GameStatus.SHOW_HINT;
}

function hideHint() {
    GameState.STATUS = GameState.PRIOR_STATUS;
}

function shuffleBoard() {
    GameState.STATUS = GameStatus.SHUFFLE_BOARD;
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
