const cvs = document.getElementById("Tetris");
const ctx = cvs.getContext("2d");

const Fila = 20;
const Columna = COLUMNA = 10;
const TamañoCuadr = TamañoC = 20;
const Vacante = "WHITE";

function DibujarCuadrado(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*TamañoCuadr,y*TamañoCuadr,TamañoCuadr,TamañoCuadr);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*TamañoCuadr,y*TamañoCuadr,TamañoCuadr,TamañoCuadr);
}


let tabla = [];
for( r = 0; r <Fila; r++){
    tabla[r] = [];
    for(c = 0; c < Columna; c++){
        tabla[r][c] = Vacante;
    }
}

function DibujarTabla(){
    for( r = 0; r < Fila; r++){
        for(c = 0; c < Columna; c++){
            DibujarCuadrado(c,r,tabla[r][c]);
        }
    }
}

DibujarCuadrado();

const Piezas = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];


function PiezaRandom(){
    let r = randomN = Math.floor(Math.random() * Piezas.length) 
    return new Pieza( Piezas[r][0],Piezas[r][1]);
}

let p = PiezaRandom();

function Pieza(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.x = 3;
    this.y = -2;
}

Pieza.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            if( this.activeTetromino[r][c]){
                DibujarCuadrado(this.x + c,this.y + r, color);
            }
        }
    }
}

Pieza.prototype.draw = function(){
    this.fill(this.color);
}


Pieza.prototype.unDraw = function(){
    this.fill(Vacante);
}


Pieza.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        this.lock();
        p =PiezaRandom();
    }
    
}


Pieza.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

Pieza.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

Pieza.prototype.rotar = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; 
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let puntuacion = 0;

Pieza.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Juego terminado!");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            tabla[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < Fila; r++){
        let FilaLlena = true;
        for( c = 0; c < Columna; c++){
            FilaLlena = FilaLlena && (tabla[r][c] != Vacante);
        }
        if(FilaLlena){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < Columna; c++){
                    tabla[y][c] = tabla[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < Columna; c++){
                tabla[0][c] = Vacante;
            }
            // increment the score
            puntuacion += 10;
        }
    }
    // update the board
    DibujarTabla();
    
    const scoreElement = document.getElementById("puntuacion");

    // update the score
    scoreElement.innerHTML = puntuacion;
}

// collision fucntion

Pieza.prototype.collision = function(x, y, piece){
    for(let r = 0; r < piece.length; r++){
        for(let c = 0; c < piece[r].length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // conditions
            if(newX < 0 || newX >= Columna || newY >= Fila){
                return true;
            }
            // skip newY < 0; tabla[-1] aplastará nuestro juego
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece already in place
            if(tabla[newY][newX] != Vacante){
                return true;
            }
        }
    }
    return false;
}

// CONTROL the piece

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotar();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();