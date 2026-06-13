// --- CONFIGURAÇÕES DE DADOS DOS TIPOS DE SEMENTES ---
const seedData = {
    alface: { name: "Alface", difficulty: "Fácil", waterNeed: "Alta", time: 10, desc: "Cresce super rápido na horta." },
    manjericao: { name: "Manjericão", difficulty: "Fácil", waterNeed: "Média", time: 12, desc: "Erva aromática deliciosa e companheira." },
    salsa: { name: "Salsa", difficulty: "Fácil", waterNeed: "Média", time: 15, desc: "Tempero verde clássico de horta." },
    ipe: { name: "Ipê", difficulty: "Médio", waterNeed: "Média", time: 25, desc: "Árvore nativa que precisa de paciência." },
    baoba: { name: "Baobá", difficulty: "Difícil", waterNeed: "Baixa", time: 40, desc: "Gigante da natureza, guarda muita água." }
};

// --- ESTADOS DO JOGO ---
let activeSeed = null;       
let isSimulationRunning = false; 
let moistureLevel = 0;      
let germinationTimer = null;
let moistureTimer = null;   
let timeRemaining = 0;      
let totalPlantsGrown = 0;   

// --- MAPEAMENTO DE ELEMENTOS HTML ---
const potImgState = document.getElementById("pot-img-state");
const potStatus = document.getElementById("pot-1-status");
const moistureFill = document.getElementById("moisture-1");
const timerDisplay = document.getElementById("timer-1");
const scoreGerminadas = document.getElementById("score-germinadas");
const scoreTempo = document.getElementById("score-tempo"); 
const gameOverScreen = document.getElementById("game-over-screen");
const btnRetry = document.getElementById("btn-retry");
const potVisualContainer = document.getElementById("pot-1-visual");

// Elementos do Painel de Análise
const seedNameElement = document.getElementById("seed-name");
const seedDescElement = document.getElementById("seed-description");
const traitDifficulty = document.getElementById("trait-difficulty");
const traitWater = document.getElementById("trait-water");
const traitTime = document.getElementById("trait-time");

document.querySelectorAll(".drag-item").forEach(item => {
    item.addEventListener("dragstart", (e) => {
        if (item.classList.contains("seed-item")) {
            e.dataTransfer.setData("text/plain", "seed:" + item.getAttribute("data-seed"));
        } else if (item.classList.contains("tool-item")) {
            e.dataTransfer.setData("text/plain", "tool:" + item.getAttribute("data-tool"));
        }
    });
});

const potSlot = document.querySelector(".pot-slot");

if (potSlot) {
    potSlot.addEventListener("dragover", (e) => {
        e.preventDefault(); 
        potSlot.classList.add("drag-over"); 
    });

    potSlot.addEventListener("dragleave", () => {
        potSlot.classList.remove("drag-over"); 
    });

    potSlot.addEventListener("drop", (e) => {
        e.preventDefault();
        potSlot.classList.remove("drag-over");
        
        const data = e.dataTransfer.getData("text/plain");
        if (!data) return;

        const [type, value] = data.split(":");

        if (type === "seed") {
            handleSeedDrop(value);
        } else if (type === "tool") {
            handleToolDrop(value);
        }
    });
}

function handleSeedDrop(seedId) {
    if (activeSeed !== null) return;

    activeSeed = seedData[seedId];
    isSimulationRunning = false; 
    
    potStatus.textContent = `Aguardando Água: ${activeSeed.name}`;
    potImgState.src = "../../assets/elements/vaso-vazio.png"; 
    
    if (potVisualContainer) {
        potVisualContainer.classList.remove("murcha"); 
    }
    
    seedNameElement.textContent = activeSeed.name;
    seedDescElement.textContent = `Características da Semente: ${activeSeed.desc}`;
    traitDifficulty.textContent = activeSeed.difficulty;
    traitWater.textContent = activeSeed.waterNeed;
    traitTime.textContent = `${activeSeed.time}s`;

    moistureLevel = 0; 
    timeRemaining = activeSeed.time;
    
    timerDisplay.textContent = `00:${timeRemaining < 10 ? "0" + timeRemaining : timeRemaining}`;
    if (scoreTempo) scoreTempo.textContent = `${timeRemaining}s`;
    
    updateMoistureBar();
}

function handleToolDrop(toolId) {
    if (activeSeed === null) return; 

    // Ferramenta 1: Regador de Água
    if (toolId === "water") {
        moistureLevel = Math.min(100, moistureLevel + 35); 
        updateMoistureBar();
        potStatus.textContent = `Regando: ${activeSeed.name}`;

        if (!isSimulationRunning) {
            isSimulationRunning = true;
            startSimulation();
        }
    } 
    
    // Ferramenta 2: Luz do Sol
    else if (toolId === "sun") {
        if (!isSimulationRunning) {
            alert("Dica: Use o regador primeiro para ativar a semente antes de dar banho de sol!");
            return;
        }
        
        timeRemaining = Math.max(1, timeRemaining - 3); 
        potStatus.textContent = `Fotossíntese Ativa! ☀️`;
        
        timerDisplay.textContent = `00:${timeRemaining < 10 ? "0" + timeRemaining : timeRemaining}`;
        if (scoreTempo) scoreTempo.textContent = `${timeRemaining}s`;
        
        setTimeout(() => {
            if (activeSeed) potStatus.textContent = `Cultivando: ${activeSeed.name}`;
        }, 1200);
    } 
    
    // Ferramenta 3: Solo Nutritivo
    else if (toolId === "soil") {
        moistureLevel = Math.min(100, moistureLevel + 20);
        updateMoistureBar();
        
        potStatus.textContent = `Nutrientes Aplicados! 🟫`;
        
        if (!isSimulationRunning) {
            isSimulationRunning = true;
            startSimulation();
        }

        setTimeout(() => {
            if (activeSeed) potStatus.textContent = `Cultivando: ${activeSeed.name}`;
        }, 1200);
    }
}

// --- LÓGICA DOS CRONÔMETROS ---

function startSimulation() {
    clearInterval(germinationTimer);
    clearInterval(moistureTimer);

    moistureTimer = setInterval(() => {
        moistureLevel -= 5; 
        updateMoistureBar();

        if (moistureLevel <= 0) {
            triggerGameOver();
        }
    }, 800);

    germinationTimer = setInterval(() => {
        if (moistureLevel <= 0) return; 

        timeRemaining--;
        
        timerDisplay.textContent = `00:${timeRemaining < 10 ? "0" + timeRemaining : timeRemaining}`;
        if (scoreTempo) scoreTempo.textContent = `${timeRemaining}s`;

        const totalTime = activeSeed.time;
        const percentDone = ((totalTime - timeRemaining) / totalTime) * 100;

        if (timeRemaining <= 0) {
            finishGrowth();
        } else if (percentDone >= 66) {
            potImgState.src = "../../assets/elements/planta-grande.png";  
        } else if (percentDone >= 33) {
            potImgState.src = "../../assets/elements/planta-media.png";   
        } else if (percentDone >= 1) {
            potImgState.src = "../../assets/elements/planta-pequena.png"; 
        }
    }, 1000);
}

function updateMoistureBar() {
    if (!moistureFill) return;
    
    moistureFill.style.width = moistureLevel + "%";
    
    if (moistureLevel < 25) {
        moistureFill.classList.add("critico");
    } else {
        moistureFill.classList.remove("critico");
    }
}

function verificarSubidaDeNivel() {
    if (totalPlantsGrown === 3) {
        setTimeout(() => {
            alert("✨ INCRÍVEL! Você dominou o nível básico! Novas sementes avançadas foram liberadas na sua gaveta! 🌳🌵");
            
            const sementeMedio = document.querySelector(".seed-medium");
            const sementeDificil = document.querySelector(".seed-hard");
            
            if (sementeMedio) sementeMedio.classList.remove("hidden");
            if (sementeDificil) sementeDificil.classList.remove("hidden");

            const tituloSementes = document.querySelector(".inventory-section h4");
            if (tituloSementes) tituloSementes.textContent = "1. Escolha uma Semente Avançada";

            localStorage.setItem('sementes_recorde', totalPlantsGrown.toString());
        }, 300);
    } else if (totalPlantsGrown > 3) {
        localStorage.setItem('sementes_recorde', totalPlantsGrown.toString());
    }
}

function finishGrowth() {
    clearInterval(germinationTimer);
    clearInterval(moistureTimer);

    totalPlantsGrown++;
    if (scoreGerminadas) scoreGerminadas.textContent = totalPlantsGrown;
    if (scoreTempo) scoreTempo.textContent = "0s";
    
    setTimeout(() => {
        alert(`Parabéns! Sua semente de ${activeSeed.name} cresceu saudável e forte! 🎉`);
        resetPot();
        verificarSubidaDeNivel(); 
    }, 100);
}

function triggerGameOver() {
    clearInterval(germinationTimer);
    clearInterval(moistureTimer);
    
    if (potVisualContainer) {
        potVisualContainer.classList.add("murcha");
    }
    
    if (gameOverScreen) {
        gameOverScreen.classList.remove("hidden");
    }
}

function resetPot() {
    clearInterval(germinationTimer);
    clearInterval(moistureTimer);

    activeSeed = null;
    isSimulationRunning = false;
    moistureLevel = 0;
    timeRemaining = 0;
    
    potStatus.textContent = "Livre";
    potImgState.src = "../../assets/elements/vaso-vazio.png";
    timerDisplay.textContent = "--:--";
    if (scoreTempo) scoreTempo.textContent = "0";
    
    if (potVisualContainer) {
        potVisualContainer.classList.remove("murcha");
    }
    updateMoistureBar();
    
    seedNameElement.textContent = "Selecione uma Semente";
    seedDescElement.textContent = "Características da Semente:";
    traitDifficulty.textContent = "-";
    traitWater.textContent = "-";
    traitTime.textContent = "-";
}

if (btnRetry) {
    btnRetry.addEventListener("click", () => {
        if (gameOverScreen) {
            gameOverScreen.classList.add("hidden");
        }
        resetPot();
    });
}