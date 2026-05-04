const NUM_FILOSOFOS = 5;
let talheres = [true, true, true, true, true];
let refeicoesConcluidas = [0, 0, 0, 0, 0];
let simulacaoRodando = false;
let isPausado = false;
let tempoRestante = 30; // 30 SEGUNDOS TOTAIS
let intervaloTimer;

// Formatação de hora pro Log
function getHoraAtual() {
    const agora = new Date();
    return `[${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}:${agora.getSeconds().toString().padStart(2, '0')}]`;
}

// Registrar ações
function registrarLog(mensagem, cor = "white") {
    const logDiv = document.getElementById('log-content');
    const novaLinha = document.createElement('div');
    novaLinha.innerHTML = `<span class="log-time">${getHoraAtual()}</span> <span style="color: ${cor}">${mensagem}</span>`;
    logDiv.appendChild(novaLinha);

    while (logDiv.children.length > 30) {
        logDiv.removeChild(logDiv.firstChild);
    }
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Função de espera customizada
async function esperar(ms) {
    let tempoPassado = 0;
    while (tempoPassado < ms) {
        if (!simulacaoRodando) return;
        if (!isPausado) tempoPassado += 100;
        await new Promise(r => setTimeout(r, 100));
    }
}

function atualizarEstadoVisual(id, estado, texto) {
    const el = document.getElementById(`f${id}`);
    el.className = `filosofo estado-${estado}`;
    el.innerHTML = `<span>F${id + 1}</span>${texto}`;
}

function atualizarTalherVisual(id, livre) {
    document.getElementById(`t${id}`).style.opacity = livre ? '1' : '0';
}

// Lógica: Tenta pegar os dois talheres simultaneamente
function tentarPegarTalheres(esq, dir) {
    if (talheres[esq] && talheres[dir]) {
        talheres[esq] = false;
        talheres[dir] = false;
        return true;
    }
    return false;
}

async function cicloFilosofo(id) {
    // Mapeamento correto
    const esq = (id === 0) ? 4 : id - 1;
    const dir = id;

    const nomeF = `F${id + 1}`;

    while (simulacaoRodando) {
        atualizarEstadoVisual(id, 'pensando', 'Pensando');
        await esperar(Math.random() * 1000 + 500);
        if (!simulacaoRodando) break;

        atualizarEstadoVisual(id, 'fome', 'Fome');
        registrarLog(`> ${nomeF} com fome. Aguardando talheres...`, "var(--color-hungry)");

        let comeu = false;
        while (!comeu && simulacaoRodando) {
            await esperar(200);

            if (tentarPegarTalheres(esq, dir)) {
                atualizarTalherVisual(esq, false);
                atualizarTalherVisual(dir, false);

                atualizarEstadoVisual(id, 'comendo', 'Comendo');
                registrarLog(`++ ${nomeF} pegou talheres e começou a comer.`, "var(--color-eat)");

                // 5 SEGUNDOS COMENDO
                await esperar(5000);

                if (simulacaoRodando) {
                    talheres[esq] = true;
                    talheres[dir] = true;

                    atualizarTalherVisual(esq, true);
                    atualizarTalherVisual(dir, true);

                    refeicoesConcluidas[id]++;
                    document.getElementById(`count-${id}`).innerText = refeicoesConcluidas[id];
                    registrarLog(`-- ${nomeF} concluiu a refeição.`, "var(--text-muted)");
                }
                comeu = true;
            }
        }
    }
}

function atualizarDisplayTimer() {
    let seg = tempoRestante.toString().padStart(2, '0');
    document.getElementById('timerDisplay').innerText = `00:${seg}`;
}

function resetarPainel() {
    talheres = [true, true, true, true, true];
    refeicoesConcluidas = [0, 0, 0, 0, 0];
    for (let i = 0; i < NUM_FILOSOFOS; i++) {
        atualizarTalherVisual(i, true);
        atualizarEstadoVisual(i, 'parado', 'Parado');
        document.getElementById(`count-${i}`).innerText = 0;
    }
    document.getElementById('log-content').innerHTML = '';
}

function finalizarSimulacao() {
    simulacaoRodando = false;
    isPausado = false;
    clearInterval(intervaloTimer);
    document.getElementById('btnStart').disabled = false;
    document.getElementById('btnPause').disabled = true;
    document.getElementById('btnRestart').disabled = true;
    document.getElementById('btnPause').innerHTML = "⏸ Pausar";
    registrarLog("=== TEMPO ESGOTADO ===", "#3b82f6");

    setTimeout(() => {
        talheres = [true, true, true, true, true];
        for (let i = 0; i < NUM_FILOSOFOS; i++) {
            atualizarTalherVisual(i, true);
            atualizarEstadoVisual(i, 'parado', 'Parado');
        }
    }, 500);
}

function iniciarSimulacao() {
    if(simulacaoRodando) return;
    simulacaoRodando = true;
    isPausado = false;
    tempoRestante = 30;

    resetarPainel();
    atualizarDisplayTimer();

    document.getElementById('btnStart').disabled = true;
    document.getElementById('btnPause').disabled = false;
    document.getElementById('btnRestart').disabled = false;

    registrarLog("=== SIMULAÇÃO INICIADA ===", "var(--color-think)");

    for (let i = 0; i < NUM_FILOSOFOS; i++) {
        cicloFilosofo(i);
    }

    intervaloTimer = setInterval(() => {
        if (!isPausado) {
            tempoRestante--;
            atualizarDisplayTimer();
            if(tempoRestante <= 0) {
                finalizarSimulacao();
            }
        }
    }, 1000);
}

function alternarPausa() {
    if (!simulacaoRodando) return;
    isPausado = !isPausado;
    document.getElementById('btnPause').innerText = isPausado ? "▶ Retomar" : "⏸ Pausar";
    if (isPausado) registrarLog("|| Simulação Pausada", "#f59e0b");
    else registrarLog("▶ Simulação Retomada", "var(--color-eat)");
}

function reiniciarSimulacao() {
    if (!document.getElementById('btnRestart').disabled) {
        simulacaoRodando = false;
        clearInterval(intervaloTimer);
        setTimeout(iniciarSimulacao, 300);
    }
}