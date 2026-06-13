const meusJogos = [
    {
        titulo: "Trator Reflorestador",
        desc: "Pilote um trator ecológico para recuperar áreas desmatadas em larga escala.",
        dificuldade: "Fácil",
        dificuldadeClasse: "difficulty-easy",
        imagemUrl: "../../assets/images/trator.jpg"
    },
    {
        titulo: "Coleta Seletiva",
        desc: "Separe embalagens e resíduos nas respectivas lixeiras.",
        dificuldade: "Médio",
        dificuldadeClasse: "difficulty-medium",
        imagemUrl: "../../assets/images/coleta.jpg"
    },
    {
        titulo: "Mestre do Hectare",
        desc: "Calcule a distribuição perfeita de plantio para máxima eficiência agrícola.",
        dificuldade: "Difícil",
        dificuldadeClasse: "difficulty-hard",
        imagemUrl: "../../assets/images/hectare.png"
    },
    {
        titulo: "Lab de Sementes",
        desc: "Plante e regue sementes de acordo com suas características.",
        dificuldade: "Médio",
        dificuldadeClasse: "difficulty-medium",
        imagemUrl: "../../assets/images/sementes.png"
    }
];

const estudante = {
    nivel: 1,
    tituloNivel: "Iniciante Ecológico",
    xpAtual: 0,
    xpProximoNivel: 1000,
};

function renderizarJogos(filtro = "") {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const jogosFiltrados = meusJogos.filter(jogo => {
        const termo = filtro.toLowerCase();
        return jogo.titulo.toLowerCase().includes(termo) || jogo.desc.toLowerCase().includes(termo);
    });

    if (jogosFiltrados.length === 0) {
        const mensagemErro = document.createElement('p');
        mensagemErro.className = 'chamada-acao msg-jogos-nao-encontrados';
        mensagemErro.textContent = `Nenhum jogo encontrado para "${filtro}".`;
        grid.appendChild(mensagemErro);
        return;
    }

    jogosFiltrados.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'game-card';

        card.innerHTML = `
            <div class="game-image-container">
                <img src="${jogo.imagemUrl}" alt="${jogo.titulo}" class="game-image">
                <span class="difficulty-badge ${jogo.dificuldadeClasse}">
                    ${jogo.dificuldade}
                </span>
            </div>
            <div class="game-info-body">
                <h3 class="game-card-title">${jogo.titulo}</h3>
                <p class="game-card-desc">${jogo.desc}</p>
                <div class="game-card-action-bar">
                    <button class="play-button">Jogar</button>
                </div>
            </div>
        `;

        // Tratamento de erro de imagem
        const img = card.querySelector('.game-image');
        img.addEventListener('error', () => {
            img.classList.add('hide-image');
        });

        const btnJogar = card.querySelector('.play-button');
        btnJogar.addEventListener('click', () => {
            iniciarJogo(jogo.titulo);
        });

        grid.appendChild(card);
    });
}

function configurarBuscaDeJogos() {
    const campoBusca = document.getElementById('search-input');
    const formularioBusca = document.getElementById('search-form');
    const iconeLupa = document.getElementById('search-submit-icon');

    if (!campoBusca) return;

    campoBusca.addEventListener('input', (e) => {
        renderizarJogos(e.target.value);
    });

    if (formularioBusca) {
        formularioBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            renderizarJogos(campoBusca.value);
        });
    }

    if (iconeLupa) {
        iconeLupa.addEventListener('click', () => {
            renderizarJogos(campoBusca.value);
        });
    }
}

function inicializarDashboardEProgresso() {
    const recordeTratorSegundos = localStorage.getItem('trator_recorde');
    const recordeColeta = localStorage.getItem('coleta_recorde');
    const recordeHectare = localStorage.getItem('hectare_recorde');

    const txtRecTrator = document.getElementById('record-trator-val');
    if (txtRecTrator) {
        txtRecTrator.textContent = recordeTratorSegundos ? formatarTempoDashboard(parseInt(recordeTratorSegundos)) : "Nenhum";
    }

    const txtRecColeta = document.getElementById('record-coleta-val');
    if (txtRecColeta && recordeColeta) txtRecColeta.textContent = `${recordeColeta} pts`;

    const txtRecHectare = document.getElementById('record-hectare-val');
    if (txtRecHectare && recordeHectare) txtRecHectare.textContent = `${recordeHectare} pts`;

    let totalXPAcumulado = 0;

    const checkTrator = document.getElementById('task-reflorestar');
    const itemTrator = document.getElementById('item-task-reflorestar');
    if (recordeTratorSegundos && parseInt(recordeTratorSegundos) < 120) {
        if (checkTrator) checkTrator.checked = true;
        if (itemTrator) itemTrator.classList.add('completed');
        totalXPAcumulado += 400; 
    }

    const checkColeta = document.getElementById('task-coleta');
    const itemColeta = document.getElementById('item-task-coleta');
    if (recordeColeta && parseInt(recordeColeta) >= 10) {
        if (checkColeta) checkColeta.checked = true;
        if (itemColeta) itemColeta.classList.add('completed');
        totalXPAcumulado += 350;
    }

    const checkHectare = document.getElementById('task-hectare');
    const itemHectare = document.getElementById('item-task-hectare');
    if (recordeHectare && parseInt(recordeHectare) >= 5) {
        if (checkHectare) checkHectare.checked = true;
        if (itemHectare) itemHectare.classList.add('completed');
        totalXPAcumulado += 250;
    }

    calcularNivelProgresso(totalXPAcumulado);
}

function calcularNivelProgresso(xpTotal) {
    const xpPorNivel = estudante.xpProximoNivel;
    
    estudante.nivel = Math.floor(xpTotal / xpPorNivel) + 1;
    estudante.xpAtual = xpTotal % xpPorNivel;

    if (estudante.nivel === 2) estudante.tituloNivel = "Protetor Broto";
    else if (estudante.nivel === 3) estudante.tituloNivel = "Patrulheiro da Terra";
    else if (estudante.nivel === 4) estudante.tituloNivel = "Mestre da Silvicultura";
    else if (estudante.nivel >= 5) estudante.tituloNivel = "Guru da Agricultura";
    else estudante.tituloNivel = "Iniciante Ecológico";

    const txtLevel = document.getElementById('student-level');
    const txtTitle = document.getElementById('student-title');
    const txtXpDisplay = document.getElementById('xp-display');
    const barXpFill = document.getElementById('xp-bar-fill');

    if (txtLevel) txtLevel.textContent = `Nível ${estudante.nivel}`;
    if (txtTitle) txtTitle.textContent = estudante.tituloNivel;
    if (txtXpDisplay) txtXpDisplay.textContent = `${estudante.xpAtual} / ${estudante.xpProximoNivel} XP`;
    
    if (barXpFill) {
        const percentual = Math.min((estudante.xpAtual / estudante.xpProximoNivel) * 100, 100);
        barXpFill.style.width = `${percentual}%`;
    }
}

function iniciarJogo(nomeDoJogo) {
    const paginas = {
        "Trator Reflorestador": "trator.html",
        "Coleta Seletiva": "coletiva.html",
        "Mestre do Hectare": "hectare.html",
        "Lab de Sementes": "sementes.html"
    };

    if (paginas[nomeDoJogo]) {
        window.location.href = paginas[nomeDoJogo];
    } else {
        console.error("Página do jogo não mapeada para: " + nomeDoJogo);
    }
}

function formatarTempoDashboard(segundos) {
    let mins = Math.floor(segundos / 60);
    let segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')} Min`;
}

function configurarTarefas() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const taskItem = this.closest('.task-item');
            if (!taskItem) return;

            if (this.checked) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
        });
    });
}

function inicializarModais() {
    const btnOpenRegister = document.getElementById("open-register");
    const regModal = document.getElementById("register-modal");
    const btnCloseRegister = document.getElementById("close-register");
    const btnCloseLogin = document.getElementById("close-login");
    const loginModal = document.getElementById("login-modal");

    if (btnOpenRegister && regModal) {
        btnOpenRegister.addEventListener("click", function(e) {
            e.preventDefault();
            regModal.style.display = "block";
        });
    }

    if (btnCloseRegister && regModal) {
        btnCloseRegister.addEventListener("click", function() {
            regModal.style.display = "none";
        });
    }

    if (btnCloseLogin && loginModal) {
        btnCloseLogin.addEventListener("click", function() {
            loginModal.style.display = "none";
        });
    }
}

function inicializarModalAmigo() {
    const btnAddAmigo = document.getElementById('btn-add-amigo');
    const modalAmigo = document.getElementById('modal-amigo');
    const btnFecharModal = document.getElementById('close-modal');
    const btnConfirmarAdd = document.getElementById('btn-confirmar-add');
    const btnCopiarLink = document.getElementById('btn-copiar-link');
    const inputNickname = document.getElementById('nickname-amigo');

    if (!btnAddAmigo || !modalAmigo) return;

    btnAddAmigo.addEventListener('click', () => {
        modalAmigo.classList.add('display-flex');
    });

    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', fecharModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modalAmigo) {
            fecharModal();
        }
    });

    function fecharModal() {
        modalAmigo.classList.remove('display-flex');
        if (inputNickname) inputNickname.value = '';
    }

    if (btnConfirmarAdd && inputNickname) {
        btnConfirmarAdd.addEventListener('click', () => {
            const nickname = inputNickname.value.trim();
            
            if (nickname === "") {
                alert("Por favor, digite um nickname válido!");
                return;
            }

            alert(`Convite enviado para o jogador: ${nickname}!`);
            fecharModal();
        });
    }

    if (btnCopiarLink) {
        btnCopiarLink.addEventListener('click', () => {
            const linkDoJogo = window.location.href; 

            navigator.clipboard.writeText(linkDoJogo).then(() => {
                alert("Link do jogo copiado para a área de transferência! Envie para o seu amigo.");
            }).catch(err => {
                console.error("Erro ao copiar o link: ", err);
                alert("Não foi possível copiar o link automaticamente. Copie a URL diretamente da barra do seu navegador.");
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarJogos();
    inicializarDashboardEProgresso();
    configurarTarefas();
    inicializarModais();
    configurarBuscaDeJogos(); 
    inicializarModalAmigo();

    if (window.VLibras && window.VLibras.Widget) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
});