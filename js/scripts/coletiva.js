document.addEventListener("DOMContentLoaded", () => {
    const trashContainer = document.getElementById("trash-items");
    const scoreCount = document.getElementById("score-count");
    const feedbackText = document.getElementById("feedback-text");
    const btnConfirmar = document.getElementById('btn-confirm-game');
    const difficultyBadge = document.querySelector(".question-difficulty-badge");
    
    // Pega a lixeira nova de não recicláveis
    const binNaoReciclevel = document.getElementById("bin-naoreciclevel");

    // Banco de dados das fases atualizado
    const fases = [
        {
            nivel: "Fácil",
            itens: [
                { nome: "📄 Jornal Velho", tipo: "papel" },
                { nome: "🧴 Garrafa Pet", tipo: "plastico" },
                { nome: "🍌 Casca de Banana", tipo: "organico" }
            ]
        },
        {
            nivel: "Médio",
            itens: [
                { nome: "🥫 Lata de Sardinha", tipo: "metal" },
                { nome: "🍾 Garrafa de Suco", tipo: "vidro" },
                { nome: "📦 Caixa de Papelão", tipo: "papel" }
            ]
        },
        {
            nivel: "Difícil",
            itens: [
                { nome: "🍎 Resto de Maçã", tipo: "organico" },
                { nome: "🫙 Pote de Conserva", tipo: "vidro" },
                { nome: "📸 Foto Antiga", tipo: "naoreciclevel" },     
                { nome: "🩹 Curativo Usado", tipo: "naoreciclevel" },
                { nome: "☕ Copo Descartável", tipo: "plastico" }
            ]
        }
    ];

    let faseAtual = 0;
    let score = 0;

    function carregarFase() {
        trashContainer.innerHTML = ""; 
        score = 0;
        scoreCount.textContent = score;
        
        const dadosFase = fases[faseAtual];
        difficultyBadge.textContent = dadosFase.nivel;
        feedbackText.textContent = `Fase ${faseAtual + 1}: Separe os novos materiais!`;
        feedbackText.style.color = "initial";

        // LÓGICA DE MOSTRAR/ESCONDER A CAIXA:
        if (dadosFase.nivel === "Difícil") {
            binNaoReciclevel.style.display = "flex"; // Mostra a caixa de papelão no Difícil
            difficultyBadge.className = "question-difficulty-badge difficulty-hard";
        } else {
            binNaoReciclevel.style.display = "none"; // Esconde nos níveis Fácil e Médio
            if(faseAtual === 1) difficultyBadge.className = "question-difficulty-badge difficulty-medium";
            else difficultyBadge.className = "question-difficulty-badge difficulty-easy";
        }

        // Criar itens na tela
        dadosFase.itens.forEach(itemInfo => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.draggable = true;
            itemDiv.setAttribute("data-bin", itemInfo.tipo);
            itemDiv.innerText = itemInfo.nome;

            itemDiv.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", e.target.getAttribute("data-bin"));
                itemDiv.classList.add("dragging");
            });

            itemDiv.addEventListener("dragend", () => {
                itemDiv.classList.remove("dragging");
            });

            trashContainer.appendChild(itemDiv);
        });
    }

    // Configuração do Drop das Lixeiras
    const bins = document.querySelectorAll(".bin");
    bins.forEach(bin => {
        bin.addEventListener("dragover", (e) => e.preventDefault());
        bin.addEventListener("drop", (e) => {
            e.preventDefault();
            const draggedElement = document.querySelector(".dragging");
            
            if (!draggedElement) return;

            const targetBinType = bin.id.replace("bin-", "");
            const itemBinType = draggedElement.getAttribute("data-bin");

            if (itemBinType === targetBinType) {
                score++;
                scoreCount.textContent = score;
                feedbackText.textContent = "Muito bem! Destino correto.";
                feedbackText.style.color = "green";
                draggedElement.remove();

                if (score === fases[faseAtual].itens.length) {
                    if (faseAtual < fases.length - 1) {
                        feedbackText.textContent = "Boa! Avançando para a fase secreta... 🚀";
                        feedbackText.style.color = "blue";
                        setTimeout(() => {
                            faseAtual++;
                            carregarFase();
                        }, 2000);
                    } else {
                        feedbackText.textContent = "Parabéns! Você virou um mestre da Ecologia! 🎉🏆";
                        feedbackText.style.color = "gold";
                    }
                }
            } else {
                feedbackText.textContent = "Ops! Esse material não vai aí. Pense bem!";
                feedbackText.style.color = "red";
            }
        });
    });

    btnConfirmar.addEventListener('click', () => {
        feedbackText.innerText = "Verificando coleta... Bom trabalho!";
        feedbackText.style.color = "var(--main-color)";
    });

    carregarFase();
});