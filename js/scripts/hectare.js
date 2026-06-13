// Banco de Dados das Missões (Dataset)
const dataset = [
    {
        difficulty: "easy",
        difficultyText: "Fácil",
        dimensions: "Lote de 20.000 m²",
        text: "Uma horta escolar de plantio orgânico ocupa uma área regular de 20.000 metros quadrados (m²). Converta e responda quantos hectares essa área possui.",
        options: {
            a: "1 Hectare",
            b: "2 Hectares",
            c: "4 Hectares"
        },
        correct: "b",
        cells: 4
    },
    {
        difficulty: "easy",
        difficultyText: "Fácil",
        dimensions: "Lote de 50.000 m²",
        text: "Uma reserva de mudas nativas foi demarcada com o tamanho exato de 50.000 metros quadrados (m²). Quantos hectares essa área de preservação representa?",
        options: {
            a: "5 Hectares",
            b: "50 Hectares",
            c: "0,5 Hectares"
        },
        correct: "a",
        cells: 4
    },
    {
        difficulty: "easy",
        difficultyText: "Fácil",
        dimensions: "Lote de 10.000 m²",
        text: "Um produtor de morangos orgânicos comprou um terreno quadrado de 100m por 100m (totalizando 10.000 m²). A quantos hectares esse terreno equivale?",
        options: {
            a: "10 Hectares",
            b: "0,1 Hectares",
            c: "1 Hectare"
        },
        correct: "c",
        cells: 4
    },
    {
        difficulty: "medium",
        difficultyText: "Médio",
        dimensions: "Lote de 150m x 200m",
        text: "Um sítio agrícola retangular mede 150 metros de largura por 200 metros de comprimento. Calcule a sua área total em hectares.",
        options: {
            a: "2,5 Hectares",
            b: "3 Hectares",
            c: "3,5 Hectares"
        },
        correct: "b",
        cells: 9
    },
    {
        difficulty: "medium",
        difficultyText: "Médio",
        dimensions: "Lote de 250.000 m²",
        text: "Uma fazenda destinada ao cultivo rotativo de soja e milho possui 250.000 metros quadrados (m²). Quantos hectares tem essa propriedade?",
        options: {
            a: "25 Hectares",
            b: "250 Hectares",
            c: "15 Hectares"
        },
        correct: "a",
        cells: 9
    },
    {
        difficulty: "medium",
        difficultyText: "Médio",
        dimensions: "Lote de 80.000 m²",
        text: "Para diversificar a produção, uma agroindústria dividiu um território de 80.000 metros quadrados (m²) para plantação de cana. Quantos hectares foram utilizados?",
        options: {
            a: "80 Hectares",
            b: "8 Hectares",
            c: "0,8 Hectares"
        },
        correct: "b",
        cells: 9
    },
    {
        difficulty: "hard",
        difficultyText: "Difícil",
        dimensions: "Três Áreas Combinadas",
        text: "Um fazendeiro unificou 3 áreas vizinhas: a primeira com 35.000 m², a segunda com 2 hectares e a terceira com 45.000 m². Qual o tamanho total da propriedade unificada em hectares?",
        options: {
            a: "9 Hectares",
            b: "8 Hectares",
            c: "10 Hectares"
        },
        correct: "c",
        cells: 16
    },
    {
        difficulty: "hard",
        difficultyText: "Difícil",
        dimensions: "Fazenda de 0,5 km²",
        text: "Uma cooperativa agrícola adquiriu uma área florestal protegida de 0,5 quilômetros quadrados (km²). Sabendo que 1 km² = 1.000.000 m², quantos hectares de reserva existem?",
        options: {
            a: "50 Hectares",
            b: "500 Hectares",
            c: "5 Hectares"
        },
        correct: "a",
        cells: 16
    },
    {
        difficulty: "hard",
        difficultyText: "Difícil",
        dimensions: "Produtividade Total",
        text: "Se uma fazenda de milho produz em média 120 sacas de grãos por hectare e a colheita total deste ano pesou 4.800 sacas, qual é o tamanho da área colhida em hectares?",
        options: {
            a: "35 Hectares",
            b: "40 Hectares",
            c: "48 Hectares"
        },
        correct: "b",
        cells: 16
    }
];

// Estado do Jogo
let currentQuestionIndex = 0;
let correctAnswersCount = 0;

// Referências dos Elementos do DOM (Quiz)
const diffBadge = document.getElementById('diff-badge');
const visualMapGrid = document.getElementById('visual-map-grid');
const visualMapDimensions = document.getElementById('visual-map-dimensions');
const problemText = document.getElementById('problem-text');
const textOptionA = document.getElementById('text-option-a');
const textOptionB = document.getElementById('text-option-b');
const textOptionC = document.getElementById('text-option-c');
const feedbackText = document.getElementById('feedback-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');

// Botões das Alternativas
const btnOptionA = document.getElementById('option-a');
const btnOptionB = document.getElementById('option-b');
const btnOptionC = document.getElementById('option-c');
const btnSkipQuestion = document.getElementById('btn-reset-game');

// Referências da Calculadora
const calcScreen = document.getElementById('calc-screen');
const calcClear = document.getElementById('calc-clear');
const calcEquals = document.getElementById('calc-equals');
const calcHaHelper = document.getElementById('calc-ha-helper');
const numButtons = document.querySelectorAll('.btn-num');
const operatorButtons = document.querySelectorAll('.btn-operator');

// Referências do Quadro de Rascunho (Canvas)
const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');
const btnClearCanvas = document.getElementById('btn-clear-canvas');

// Variáveis de Controle da Calculadora
let calcExpression = "";

// Variáveis de Controle do Rascunho
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// ==========================================
// 1. LÓGICA DA CALCULADORA
// ==========================================

numButtons.forEach(button => {
    button.addEventListener('click', () => {
        const num = button.getAttribute('data-num');
        if (calcScreen.value === "0" && num !== ".") {
            calcExpression = num;
        } else {
            calcExpression += num;
        }
        calcScreen.value = calcExpression;
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        const op = button.getAttribute('data-op');
        if (calcExpression !== "" && !["+", "-", "*", "/"].includes(calcExpression.slice(-1))) {
            calcExpression += op;
            calcScreen.value = calcExpression;
        }
    });
});

calcClear.addEventListener('click', () => {
    calcExpression = "";
    calcScreen.value = "0";
});

calcHaHelper.addEventListener('click', () => {
    try {
        if (calcExpression !== "") {
            let currentVal = Function(`"use strict"; return (${calcExpression})`)();
            let haResult = currentVal / 10000;
            calcExpression = haResult.toString();
            calcScreen.value = calcExpression;
        }
    } catch (e) {
        calcScreen.value = "Erro";
        calcExpression = "";
    }
});

calcEquals.addEventListener('click', () => {
    try {
        if (calcExpression !== "") {
            let result = Function(`"use strict"; return (${calcExpression})`)();
            result = Math.round(result * 10000) / 10000;
            calcScreen.value = result;
            calcExpression = result.toString();
        }
    } catch (e) {
        calcScreen.value = "Erro";
        calcExpression = "";
    }
});

// ==========================================
// 2. LÓGICA DO QUADRO DE RASCUNHO (CANVAS)
// ==========================================

// Configurações básicas da linha do rascunho
ctx.strokeStyle = '#003688'; // Cor da linha (combina com o seu tema principal)
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 3;

// Função para pegar a posição real do clique/toque levando em consideração o redimensionamento do Canvas
function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    // Suporta tanto eventos de mouse tradicionais quanto eventos Touch (Celular)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function startDrawing(e) {
    isDrawing = true;
    const coords = getCanvasCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Impede a rolagem da página ao desenhar no celular

    const coords = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastX = coords.x;
    lastY = coords.y;
}

function stopDrawing() {
    isDrawing = false;
}

// Eventos de Rascunho para Mouse
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Eventos de Rascunho para Telas Touch (Mobile)
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

// Limpar o quadro de rascunho
btnClearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// ==========================================
// 3. LÓGICA DO JOGO (QUIZ E DIMENSÕES)
// ==========================================

btnOptionA.addEventListener('click', () => handleAnswerSubmit('a'));
btnOptionB.addEventListener('click', () => handleAnswerSubmit('b'));
btnOptionC.addEventListener('click', () => handleAnswerSubmit('c'));
btnSkipQuestion.addEventListener('click', skipQuestion);

function loadQuestion() {
    feedbackText.innerText = '';
    
    if (currentQuestionIndex >= dataset.length) {
        feedbackText.style.color = '#22c55e';
        feedbackText.innerText = '🏆 Parabéns! Você completou todas as missões e sua fazenda está totalmente próspera!';
        setButtonsState(true);
        return;
    }

    const currentData = dataset[currentQuestionIndex];

    // Atualiza o crachá de dificuldade usando as classes corretas mapeadas no CSS
    diffBadge.className = `question-difficulty-badge difficulty-${currentData.difficulty}`;
    diffBadge.innerText = currentData.difficultyText;

    problemText.innerHTML = currentData.text;
    visualMapDimensions.innerText = `Dimensões: ${currentData.dimensions}`;

    textOptionA.innerText = currentData.options.a;
    textOptionB.innerText = currentData.options.b;
    textOptionC.innerText = currentData.options.c;

    // Desenha as células internas do lote baseado na dificuldade
    visualMapGrid.innerHTML = '';
    visualMapGrid.className = `map-grid grid-${currentData.difficulty}`;
    for (let i = 0; i < currentData.cells; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        visualMapGrid.appendChild(cell);
    }
    
    setButtonsState(false);
}

function handleAnswerSubmit(choice) {
    const currentData = dataset[currentQuestionIndex];
    const cells = visualMapGrid.querySelectorAll('.grid-cell');

    setButtonsState(true);

    if (choice === currentData.correct) {
        feedbackText.style.color = '#22c55e';
        feedbackText.innerText = '🎉 Excelente cálculo! Você semeou este território com sucesso.';
        
        correctAnswersCount++;
        // Pinta os bloquinhos do mapa visual de verde (Sucesso)
        cells.forEach(c => c.style.backgroundColor = '#63f044');

        growPlantingArea();
        currentQuestionIndex++;
        setTimeout(loadQuestion, 1800);
    } else {
        feedbackText.style.color = '#ef4444';
        feedbackText.innerText = '❌ Cálculo incorreto. Tente refazer a conta na calculadora!';

        cells.forEach(c => c.style.backgroundColor = '#ef4444');
        
        setTimeout(() => {
            feedbackText.innerText = '';
            cells.forEach(c => c.style.backgroundColor = ''); 
            setButtonsState(false);
        }, 2000);
    }
}

function skipQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function setButtonsState(disabled) {
    btnOptionA.disabled = disabled;
    btnOptionB.disabled = disabled;
    btnOptionC.disabled = disabled;
}

function growPlantingArea() {
    const maxPlots = 9;
    const earnedPlots = Math.min(correctAnswersCount, maxPlots);
    const percentage = Math.round((earnedPlots / maxPlots) * 100);

    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.innerText = `${percentage}%`;

    for (let i = 1; i <= maxPlots; i++) {
        const plot = document.getElementById(`plot-${i}`);
        if (!plot) continue;

        if (i <= earnedPlots) {
            plot.className = 'planting-plot soil-harvested';
            plot.querySelector('.plot-icon').innerText = '🌾';
            plot.querySelector('.plot-label').innerText = 'Fértil';
            plot.style.backgroundColor = '#22c55e'; // Força visual verde de terra ativa
        } else if (i === earnedPlots + 1) {
            plot.className = 'planting-plot soil-seeded';
            plot.querySelector('.plot-icon').innerText = '🌱';
            plot.querySelector('.plot-label').innerText = 'Crescendo';
            plot.style.backgroundColor = '#eab308'; // Cor amarela de broto
        } else {
            plot.className = 'planting-plot soil-dry';
            plot.querySelector('.plot-icon').innerText = '🟫';
            plot.querySelector('.plot-label').innerText = `Lote ${i}`;
            plot.style.backgroundColor = ''; // Mantém a cor padrão do CSS original
        }
    }
}

// Inicia o fluxo assim que a árvore DOM estiver pronta
window.addEventListener('DOMContentLoaded', () => {
    growPlantingArea();
    loadQuestion();
});