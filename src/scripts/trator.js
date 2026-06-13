if (window.VLibras) {
    new window.VLibras.Widget('https://vlibras.gov.br/app');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da Interface (DOM)
const startScreen = document.getElementById('start-screen');
const victoryScreen = document.getElementById('victory-screen');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const txtPercentage = document.getElementById('progress-percentage');
const txtTrees = document.getElementById('score-trees');
const txtRecord = document.getElementById('record-time'); 
const txtRecordMessage = document.getElementById('record-message'); 

const TILE_SIZE = 40; 
const COLS = canvas.width / TILE_SIZE; 
const ROWS = canvas.height / TILE_SIZE; 

const TILE_EMPTY = 0;           
const TILE_OBSTACLE_PEDRA = 1;  
const TILE_OBSTACLE_PRAIA = 5;  

const TILE_MUDA = 2;        
const TILE_JOVEM = 3;       
const TILE_ADULTA = 4;      

const DIR_ESQUERDA = 'esquerda';
const DIR_DIREITA = 'direita';

let grid = [];
let tractor = { 
    x: 0, 
    y: 0,
    direcao: DIR_DIREITA 
};
let totalReflorestavel = 0;
let totalPlantado = 0;
let gameActive = false;

let currentTime = 0; 
let timerInterval = null;

const imgTerra = new Image();
imgTerra.src = '../assets/elements/terra.png';

const imgObstaculoPedra = new Image();
imgObstaculoPedra.src = '../assets/elements/obstaculo-pedra.png'; 

const imgObstaculoPraia = new Image();
imgObstaculoPraia.src = '../assets/elements/obstaculo-praia.png'; 

const imgTratorDireita = new Image();
imgTratorDireita.src = '../assets/elements/trator-direita.png';

const imgTratorEsquerda = new Image();
imgTratorEsquerda.src = '../assets/elements/trator-esquerda.png';

let imagensCarregadas = 0;
const totalImagens = 5;
function aoCarregarImagem() {
    imagensCarregadas++;
    if (imagensCarregadas === totalImagens && gameActive) {
        draw();
    }
}
imgTerra.onload = aoCarregarImagem;
imgObstaculoPedra.onload = aoCarregarImagem;
imgObstaculoPraia.onload = aoCarregarImagem;
imgTratorDireita.onload = aoCarregarImagem;
imgTratorEsquerda.onload = aoCarregarImagem;

exibirRecordeInicial();

function initGame() {
    let mapaValido = false;
    
    while (!mapaValido) {
        grid = [];
        totalPlantado = 0;
        totalReflorestavel = 0;

        for (let r = 0; r < ROWS; r++) {
            grid[r] = [];
            for (let c = 0; c < COLS; c++) {
                // Força o ponto de partida (0,0) como muda inicial
                if (r === 0 && c === 0) {
                    grid[r][c] = TILE_MUDA;
                    totalPlantado = 1;
                    totalReflorestavel++; 
                    continue;
                }

                if ((r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 1)) {
                    grid[r][c] = TILE_EMPTY;
                    totalReflorestavel++;
                    continue;
                }

                let rand = Math.random();
                if (rand < 0.07) {
                    grid[r][c] = TILE_OBSTACLE_PEDRA; 
                } else if (rand < 0.12) {
                    grid[r][c] = TILE_OBSTACLE_PRAIA; 
                } else {
                    grid[r][c] = TILE_EMPTY; 
                    totalReflorestavel++;    
                }
            }
        }

        mapaValido = checarAcessibilidadeCompleta();
    }

    tractor.x = 0;
    tractor.y = 0;
    tractor.direcao = DIR_DIREITA;

    resetTimer();
    startTimer();

    updateHUD();
    draw();
}

function checarAcessibilidadeCompleta() {

    let visitados = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    let fila = [{ r: 0, c: 0 }];
    visitados[0][0] = true;
    
    let blocosAlcancaveis = 0;

    while (fila.length > 0) {
        let atual = fila.shift();
        blocosAlcancaveis++;

        let vizinhos = [
            { r: atual.r - 1, c: atual.c },
            { r: atual.r + 1, c: atual.c },
            { r: atual.r, c: atual.c - 1 },
            { r: atual.r, c: atual.c + 1 }
        ];

        for (let v of vizinhos) {
            if (v.r >= 0 && v.r < ROWS && v.c >= 0 && v.c < COLS) {
                if (!visitados[v.r][v.c]) {
                    let tipoBloco = grid[v.r][v.c];
                    // Se não for obstáculo (Pedra ou Praia), o trator consegue passar
                    if (tipoBloco !== TILE_OBSTACLE_PEDRA && tipoBloco !== TILE_OBSTACLE_PRAIA) {
                        visitados[v.r][v.c] = true;
                        fila.push(v);
                    }
                }
            }
        }
    }

    return blocosAlcancaveis === totalReflorestavel;
}

function updateHUD() {
    if (totalReflorestavel === 0) return;

    let percentage = Math.floor((totalPlantado / totalReflorestavel) * 100);
    if (percentage > 100) percentage = 100;
    
    txtPercentage.textContent = percentage;
    txtTrees.textContent = totalPlantado;

    // Condição de Vitória
    if (percentage === 100 && gameActive) {
        gameActive = false;
        clearInterval(timerInterval); 
        checarRecorde();
        victoryScreen.classList.remove('hidden');
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        currentTime++;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    currentTime = 0;
}

function formatarTempo(segundos) {
    let mins = Math.floor(segundos / 60);
    let segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')} Minutos`;
}

function exibirRecordeInicial() {
    let recordeSalvo = localStorage.getItem('trator_recorde');
    if (recordeSalvo) {
        txtRecord.textContent = formatarTempo(parseInt(recordeSalvo));
    } else {
        txtRecord.textContent = "Nenhum";
    }
}

function checarRecorde() {
    let recordeSalvo = localStorage.getItem('trator_recorde');

    if (!recordeSalvo) {
        localStorage.setItem('trator_recorde', currentTime);
        txtRecordMessage.textContent = `⏱️ Você estabeleceu um novo recorde de ${formatarTempo(currentTime)}!`;
        txtRecord.textContent = formatarTempo(currentTime);
    } else {
        let melhorTempo = parseInt(recordeSalvo);
        
        if (currentTime < melhorTempo) {
            localStorage.setItem('trator_recorde', currentTime);
            txtRecordMessage.textContent = `🎉 Incrível! Você quebrou seu recorde antigo de ${formatarTempo(melhorTempo)} com o tempo de ${formatarTempo(currentTime)}!`;
            txtRecord.textContent = formatarTempo(currentTime);
        } else {
            txtRecordMessage.textContent = `Seu tempo foi de ${formatarTempo(currentTime)}. O recorde atual é de ${formatarTempo(melhorTempo)}.`;
        }
    }
}

function growTrees() {
    if (!gameActive) return;

    let mudou = false;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === TILE_MUDA && Math.random() < 0.05) {
                grid[r][c] = TILE_JOVEM;
                mudou = true;
            } else if (grid[r][c] === TILE_JOVEM && Math.random() < 0.03) {
                grid[r][c] = TILE_ADULTA;
                mudou = true;
            }
        }
    }
    if (mudou) draw();
}

window.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    let nextX = tractor.x;
    let nextY = tractor.y;

    switch (e.key.toLowerCase()) {
        case 'w': nextY--; break;
        case 's': nextY++; break;
        case 'a': nextX--; tractor.direcao = DIR_ESQUERDA; break;
        case 'd': nextX++; tractor.direcao = DIR_DIREITA; break;
        default: return; 
    }

    if (nextX >= 0 && nextX < COLS && nextY >= 0 && nextY < ROWS) {
        let destino = grid[nextY][nextX];
        if (destino !== TILE_OBSTACLE_PEDRA && destino !== TILE_OBSTACLE_PRAIA) {
            tractor.x = nextX;
            tractor.y = nextY;

            if (grid[tractor.y][tractor.x] === TILE_EMPTY) {
                grid[tractor.y][tractor.x] = TILE_MUDA;
                totalPlantado++;
                updateHUD();
            }
            draw();
        }
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;

            switch (grid[r][c]) {
                case TILE_EMPTY:
                    if (imagensCarregadas >= 1) ctx.drawImage(imgTerra, x, y, TILE_SIZE, TILE_SIZE);
                    break;
                case TILE_OBSTACLE_PEDRA:
                    if (imagensCarregadas >= 2) ctx.drawImage(imgObstaculoPedra, x, y, TILE_SIZE, TILE_SIZE);
                    break;
                case TILE_OBSTACLE_PRAIA:
                    if (imagensCarregadas >= 3) ctx.drawImage(imgObstaculoPraia, x, y, TILE_SIZE, TILE_SIZE);
                    break;
                case TILE_MUDA:
                    if (imagensCarregadas >= 1) ctx.drawImage(imgTerra, x, y, TILE_SIZE, TILE_SIZE);
                    if (imagensCarregadas >= 1) {
                        ctx.fillStyle = '#a7f3d0'; 
                        ctx.beginPath(); 
                        ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2); 
                        ctx.fill();
                    }
                    break;
                case TILE_JOVEM:
                    if (imagensCarregadas >= 1) ctx.drawImage(imgTerra, x, y, TILE_SIZE, TILE_SIZE);
                    if (imagensCarregadas >= 1) {
                        ctx.fillStyle = '#34d399'; 
                        ctx.beginPath(); 
                        ctx.arc(x + 20, y + 20, 12, 0, Math.PI * 2); 
                        ctx.fill();
                    }
                    break;
                case TILE_ADULTA:
                    if (imagensCarregadas >= 1) ctx.drawImage(imgTerra, x, y, TILE_SIZE, TILE_SIZE);
                    if (imagensCarregadas >= 1) {
                        ctx.fillStyle = '#065f46'; 
                        ctx.beginPath(); 
                        ctx.arc(x + 20, y + 20, 16, 0, Math.PI * 2); 
                        ctx.fill();
                    }
                    break;
            }

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
    }

    let tx = tractor.x * TILE_SIZE;
    let ty = tractor.y * TILE_SIZE;

    if (tractor.direcao === DIR_DIREITA) {
        if (imagensCarregadas >= 4) ctx.drawImage(imgTratorDireita, tx, ty, TILE_SIZE, TILE_SIZE);
    } else {
        if (imagensCarregadas >= 5) ctx.drawImage(imgTratorEsquerda, tx, ty, TILE_SIZE, TILE_SIZE);
    }
}

btnStart.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameActive = true;
    initGame();
});

btnRestart.addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    gameActive = true;
    initGame();
});

setInterval(growTrees, 1500);