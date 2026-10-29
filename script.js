/* -------------------------------------------------------------
 * SINTETIZADOR DE ÁUDIO WEB AUDIO API
 * ------------------------------------------------------------- */
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playAudio(type) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'correct' || type === 'match') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(140, now + 0.1);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'victory') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, now + idx * 0.12);
                g.gain.setValueAtTime(0.3, now + idx * 0.12);
                g.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.25);
                o.start(now + idx * 0.12);
                o.stop(now + idx * 0.12 + 0.25);
            });
        } else if (type === 'flip') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        }
    } catch(e) {
        console.log("Audio API Error:", e);
    }
}

/* -------------------------------------------------------------
 * SISTEMA DE NAVEGAÇÃO DE ETAPAS
 * ------------------------------------------------------------- */
function switchStep(stepNum) {
    playAudio('click');
    
    document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));

    const activeStep = document.getElementById(`step-${stepNum}`);
    if (activeStep) {
        activeStep.classList.remove('hidden');
    }

    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById(`nav-btn-${i}`);
        if (btn) {
            if (i === stepNum) {
                btn.className = "doodle-btn bg-[#FFB7B2] text-[#1E1E1E] px-2.5 py-1.5 text-xs sm:text-sm font-extrabold shadow-[4px_4px_0px_#1E1E1E]";
            } else {
                btn.className = "doodle-btn bg-white text-[#1E1E1E] px-2.5 py-1.5 text-xs sm:text-sm";
            }
        }
    }

    if (stepNum === 1) initStep1();
    if (stepNum === 2) initStep2();
    if (stepNum === 6) initMemoryGame();
    if (stepNum === 7) initFlowerGame();
    if (stepNum === 8) initWordSearch();
}

/* -------------------------------------------------------------
 * ETAPA 1: NÍVEL FÁCIL
 * ------------------------------------------------------------- */
const s1Data = [
    { text: "Que dia bonito_", ans: "!" },
    { text: "Qual é o seu nome_", ans: "?" },
    { text: "Eu gosto de ler livros_", ans: "." },
    { text: "Que susto você me deu_", ans: "!" },
    { text: "Onde você mora_", ans: "?" },
    { text: "A menina brinca no parque_", ans: "." },
    { text: "Nossa, que bolo gostoso_", ans: "!" },
    { text: "Você quer jogar bola_", ans: "?" },
    { text: "O sol está brilhando_", ans: "." },
    { text: "Parabéns pelo seu aniversário_", ans: "!" }
];
let s1Idx = 0;
let s1Score = 0;

function initStep1() {
    s1Idx = 0;
    s1Score = 0;
    renderStep1();
}

function renderStep1() {
    document.getElementById('s1-round').innerText = s1Idx + 1;
    document.getElementById('s1-score').innerText = s1Score;
    document.getElementById('s1-feedback').innerText = "";
    document.getElementById('s1-sentence').innerText = s1Data[s1Idx].text;
    document.getElementById('s1-next-btn').classList.add('hidden');
}

function checkStep1(choice) {
    playAudio('click');
    const feedback = document.getElementById('s1-feedback');
    if (choice === s1Data[s1Idx].ans) {
        playAudio('correct');
        s1Score += 10;
        feedback.innerText = "✨ Muito bem! Resposta correta!";
        feedback.className = "h-7 text-center font-bold text-base sm:text-lg mb-2 text-green-600 animate-bounce";
    } else {
        playAudio('wrong');
        feedback.innerText = `❌ Ops! O correto seria [ ${s1Data[s1Idx].ans} ]`;
        feedback.className = "h-7 text-center font-bold text-base sm:text-lg mb-2 text-red-500";
    }
    document.getElementById('s1-score').innerText = s1Score;

    setTimeout(() => {
        s1Idx++;
        if (s1Idx < s1Data.length) {
            renderStep1();
        } else {
            feedback.innerText = "🎉 Parabéns! Você concluiu a Etapa 1!";
            feedback.className = "h-7 text-center font-bold text-base sm:text-lg mb-2 text-blue-600";
            document.getElementById('s1-next-btn').classList.remove('hidden');
        }
    }, 1200);
}

/* -------------------------------------------------------------
 * ETAPA 2: NÍVEL DIFÍCIL
 * ------------------------------------------------------------- */
const s2Data = [
    { text: "— Aonde você vai_", ans: "?" },
    { text: "— Vou ao mercado comprar frutas_", ans: "." },
    { text: "— Cuidado com o carro_", ans: "!" },
    { text: "— Você sabia que as estrelas brilham muito_", ans: "?" },
    { text: "— Sim, é uma maravilha da natureza_", ans: "." },
    { text: "— Que surpresa incrível_", ans: "!" },
    { text: "— Quantos anos você tem_", ans: "?" },
    { text: "— Hoje é o dia mais feliz da minha vida_", ans: "!" },
    { text: "— Onde guardamos os brinquedos_", ans: "?" },
    { text: "— Eles estão no armário do quarto_", ans: "." }
];
let s2Idx = 0;
let s2Score = 0;

function initStep2() {
    s2Idx = 0;
    s2Score = 0;
    renderStep2();
}

function renderStep2() {
    document.getElementById('s2-round').innerText = s2Idx + 1;
    document.getElementById('s2-score').innerText = s2Score;
    document.getElementById('s2-feedback').innerText = "";
    document.getElementById('s2-sentence').innerText = s2Data[s2Idx].text;
    document.getElementById('s2-next-btn').classList.add('hidden');
}

function checkStep2(choice) {
    playAudio('click');
    const feedback = document.getElementById('s2-feedback');
    if (choice === s2Data[s2Idx].ans) {
        playAudio('correct');
        s2Score += 10;
        feedback.innerText = "✨ Excelente! Você acertou!";
        feedback.className = "h-7 text-center font-bold text-base sm:text-lg mb-2 text-green-600 animate-bounce";
    } else {
        playAudio('wrong');
        feedback.innerText = `❌ Ops! O sinal certo era [ ${s2Data[s2Idx].ans} ]`;
        feedback.className = "h-7 text-center font-bold text-base sm:text-lg mb-2 text-red-500";
    }
    document.getElementById('s2-score').innerText = s2Score;

    setTimeout(() => {
        s2Idx++;
        if (s2Idx < s2Data.length) {
            renderStep2();
        } else {
            feedback.innerText = "🎉 Sensacional! Você venceu o Nível Difícil!";
            feedback.className = "h-7 text-center font-bold text-base sm:text-lg mb-2 text-purple-600";
            document.getElementById('s2-next-btn').classList.remove('hidden');
        }
    }, 1200);
}

/* -------------------------------------------------------------
 * ETAPA 6: JOGO DA MEMÓRIA
 * ------------------------------------------------------------- */
let memCards = [];
let flippedCards = [];
let memMatches = 0;
let memMoves = 0;
let lockBoard = false;

const memoryData = [
    { pairId: 1, type: 'symbol', content: '.' },
    { pairId: 1, type: 'text', content: 'Ponto Final\n(Encerra frase)' },
    { pairId: 2, type: 'symbol', content: '!' },
    { pairId: 2, type: 'text', content: 'Exclamação\n(Emoção/Susto)' },
    { pairId: 3, type: 'symbol', content: '?' },
    { pairId: 3, type: 'text', content: 'Interrogação\n(Pergunta)' },
    { pairId: 4, type: 'symbol', content: ',' },
    { pairId: 4, type: 'text', content: 'Vírgula\n(Pausa na leitura)' },
    { pairId: 5, type: 'symbol', content: ':' },
    { pairId: 5, type: 'text', content: 'Dois Pontos\n(Vai explicar)' },
    { pairId: 6, type: 'symbol', content: '—' },
    { pairId: 6, type: 'text', content: 'Travessão\n(Fala no diálogo)' }
];

function initMemoryGame() {
    memMatches = 0;
    memMoves = 0;
    flippedCards = [];
    lockBoard = false;
    document.getElementById('mem-matches').innerText = memMatches;
    document.getElementById('mem-moves').innerText = memMoves;
    document.getElementById('mem-feedback').innerText = "Encontre os pares entre o Símbolo e sua Função!";
    document.getElementById('mem-next-btn').classList.add('hidden');

    memCards = [...memoryData].sort(() => Math.random() - 0.5);

    const grid = document.getElementById('mem-grid');
    grid.innerHTML = '';

    memCards.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card';
        cardEl.dataset.index = idx;
        cardEl.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front font-black text-2xl text-gray-700">❓</div>
                <div class="memory-card-back">
                    <span class="${card.type === 'symbol' ? 'text-4xl font-black text-blue-600' : 'text-xs sm:text-sm font-bold text-gray-800 leading-tight'}">
                        ${card.content.replace('\n', '<br>')}
                    </span>
                </div>
            </div>
        `;
        cardEl.onclick = () => handleCardClick(cardEl, idx);
        grid.appendChild(cardEl);
    });
}

function handleCardClick(cardEl, idx) {
    if (lockBoard || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    playAudio('flip');
    cardEl.classList.add('flipped');
    flippedCards.push({ cardEl, idx, data: memCards[idx] });

    if (flippedCards.length === 2) {
        memMoves++;
        document.getElementById('mem-moves').innerText = memMoves;
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    const [c1, c2] = flippedCards;
    if (c1.data.pairId === c2.data.pairId) {
        playAudio('match');
        c1.cardEl.classList.add('matched');
        c2.cardEl.classList.add('matched');
        memMatches++;
        document.getElementById('mem-matches').innerText = memMatches;
        flippedCards = [];

        if (memMatches === 6) {
            playAudio('victory');
            document.getElementById('mem-feedback').innerText = "🎉 Incrível! Você completou o Jogo da Memória!";
            document.getElementById('mem-next-btn').classList.remove('hidden');
        }
    } else {
        lockBoard = true;
        playAudio('wrong');
        setTimeout(() => {
            c1.cardEl.classList.remove('flipped');
            c2.cardEl.classList.remove('flipped');
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
}

/* -------------------------------------------------------------
 * ETAPA 7: FORCA DA FLORZINHA
 * ------------------------------------------------------------- */
const flowerWords = [
    { word: "PONTO", hint: "Sinal usado no final de frases declarativas." },
    { word: "EXCLAMACAO", hint: "Sinal usado para demonstrar admiração e surpresa." },
    { word: "INTERROGACAO", hint: "Sinal usado quando se faz uma pergunta." },
    { word: "VIRGULA", hint: "Sinal que indica uma pequena pausa na leitura." },
    { word: "TRAVESSAO", hint: "Sinal que indica a fala de um personagem." }
];

let currentFlowerWordObj = null;
let flowerGuessedLetters = [];
let flowerErrors = 0;

function initFlowerGame() {
    currentFlowerWordObj = flowerWords[Math.floor(Math.random() * flowerWords.length)];
    flowerGuessedLetters = [];
    flowerErrors = 0;

    document.getElementById('flower-hint').innerText = currentFlowerWordObj.hint;
    document.getElementById('flower-feedback').innerText = "";
    document.getElementById('flower-feedback').className = "h-6 text-center font-bold text-sm sm:text-base mb-2";

    const petals = document.querySelectorAll('.petal-svg');
    petals.forEach(p => p.style.display = 'block');

    renderFlowerSlots();
    renderFlowerKeyboard();
}

function renderFlowerSlots() {
    const container = document.getElementById('flower-slots');
    container.innerHTML = '';

    const word = currentFlowerWordObj.word;
    for (let char of word) {
        const slot = document.createElement('div');
        slot.className = 'w-9 h-11 sm:w-11 sm:h-12 border-3 border-[#1E1E1E] bg-white rounded-lg flex items-center justify-center font-black text-xl sm:text-2xl shadow-[2px_2px_0px_#1E1E1E] text-[#1E1E1E]';
        if (flowerGuessedLetters.includes(char)) {
            slot.innerText = char;
        } else {
            slot.innerText = '';
        }
        container.appendChild(slot);
    }
}

function renderFlowerKeyboard() {
    const container = document.getElementById('flower-keyboard');
    container.innerHTML = '';
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let letter of alphabet) {
        const btn = document.createElement('button');
        btn.className = 'doodle-btn bg-white text-[#1E1E1E] w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm flex items-center justify-center p-0 font-extrabold';
        btn.innerText = letter;

        if (flowerGuessedLetters.includes(letter)) {
            btn.disabled = true;
        } else {
            btn.onclick = () => guessFlowerLetter(letter, btn);
        }
        container.appendChild(btn);
    }
}

function guessFlowerLetter(letter, btn) {
    playAudio('click');
    flowerGuessedLetters.push(letter);
    btn.disabled = true;

    const word = currentFlowerWordObj.word;
    if (word.includes(letter)) {
        playAudio('correct');
        renderFlowerSlots();

        const isWon = word.split('').every(ch => flowerGuessedLetters.includes(ch));
        if (isWon) {
            playAudio('victory');
            const fb = document.getElementById('flower-feedback');
            fb.innerText = "🌸 PARABÉNS! Você salvou a florzinha!";
            fb.className = "h-6 text-center font-bold text-sm sm:text-base mb-2 text-green-600 animate-bounce";
        }
    } else {
        playAudio('wrong');
        flowerErrors++;
        const petals = document.querySelectorAll('.petal-svg');
        if (flowerErrors <= petals.length) {
            petals[petals.length - flowerErrors].style.display = 'none';
        }

        if (flowerErrors >= 6) {
            const fb = document.getElementById('flower-feedback');
            fb.innerText = `🥀 Ah que pena! A palavra era ${word}`;
            fb.className = "h-6 text-center font-bold text-sm sm:text-base mb-2 text-red-500";
            const buttons = document.querySelectorAll('#flower-keyboard button');
            buttons.forEach(b => b.disabled = true);
        }
    }
}

/* -------------------------------------------------------------
 * ETAPA 8: CAÇA-PALAVRAS INTERATIVO
 * ------------------------------------------------------------- */
const wsTargetWords = [
    { key: "INTERROGACAO", display: "• INTERROGAÇÃO", color: "#FFB7B2", shadow: "rgba(255, 183, 178, 0.8)" },
    { key: "EXCLAMACAO", display: "• EXCLAMAÇÃO", color: "#FFE066", shadow: "rgba(255, 224, 102, 0.8)" },
    { key: "PERGUNTA", display: "• PERGUNTA", color: "#B5EAD7", shadow: "rgba(181, 234, 215, 0.8)" },
    { key: "PONTO", display: "• PONTO", color: "#A2D2FF", shadow: "rgba(162, 210, 255, 0.8)" },
    { key: "FRASE", display: "• FRASE", color: "#E2B6FF", shadow: "rgba(226, 182, 255, 0.8)" }
];

let wsMatrix = [];
let wsFoundKeys = [];
let wsPlacedWordsMap = {}; 
let isWsDragging = false;
let wsStartCell = null;
let wsCurrentLineCells = [];
let wsDifficulty = 'easy';

function setWordSearchDifficulty(mode) {
    playAudio('click');
    wsDifficulty = mode;
    const easyBtn = document.getElementById('ws-diff-easy');
    const hardBtn = document.getElementById('ws-diff-hard');

    if (mode === 'easy') {
        easyBtn.classList.add('bg-[#FFB7B2]');
        easyBtn.classList.remove('bg-white');
        hardBtn.classList.add('bg-white');
        hardBtn.classList.remove('bg-[#FFB7B2]');
    } else {
        hardBtn.classList.add('bg-[#FFB7B2]');
        hardBtn.classList.remove('bg-white');
        easyBtn.classList.add('bg-white');
        easyBtn.classList.remove('bg-[#FFB7B2]');
    }

    initWordSearch();
}

function initWordSearch() {
    wsFoundKeys = [];
    wsPlacedWordsMap = {};
    isWsDragging = false;
    wsStartCell = null;
    wsCurrentLineCells = [];

    wsTargetWords.forEach(w => {
        const el = document.getElementById(`word-item-${w.key}`);
        if (el) {
            el.classList.remove('marker-active');
            el.style.removeProperty('--marker-color');
            el.style.removeProperty('--marker-shadow');
            const icon = el.querySelector('.check-icon');
            if (icon) icon.classList.add('hidden');
        }
    });

    generateWordSearchGrid();
    renderWordSearchGrid();
    attachWordSearchInputHandlers();
}

function generateWordSearchGrid() {
    wsMatrix = Array(11).fill(null).map(() => Array(11).fill(''));

    const easyDirections = [
        { r: 0, c: 1 },
        { r: 1, c: 0 }
    ];

    const hardDirections = [
        { r: 0, c: 1 },
        { r: 0, c: -1 },
        { r: 1, c: 0 },
        { r: -1, c: 0 },
        { r: 1, c: 1 },
        { r: -1, c: 1 },
        { r: 1, c: -1 },
        { r: -1, c: -1 }
    ];

    const directions = wsDifficulty === 'easy' ? easyDirections : hardDirections;
    const sorted = [...wsTargetWords].sort((a, b) => b.key.length - a.key.length);

    sorted.forEach(wordObj => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 600) {
            attempts++;
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const len = wordObj.key.length;

            let minR = dir.r < 0 ? len - 1 : 0;
            let maxR = dir.r > 0 ? 11 - len : 10;
            let minC = dir.c < 0 ? len - 1 : 0;
            let maxC = dir.c > 0 ? 11 - len : 10;

            if (maxR < minR || maxC < minC) continue;

            let startR = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
            let startC = Math.floor(Math.random() * (maxC - minC + 1)) + minC;

            let canPlace = true;
            let tempCoords = [];

            for (let i = 0; i < len; i++) {
                let currR = startR + dir.r * i;
                let currC = startC + dir.c * i;
                let existingChar = wsMatrix[currR][currC];

                if (existingChar !== '' && existingChar !== wordObj.key[i]) {
                    canPlace = false;
                    break;
                }
                tempCoords.push({ r: currR, c: currC });
            }

            if (canPlace) {
                tempCoords.forEach((coord, idx) => {
                    wsMatrix[coord.r][coord.c] = wordObj.key[idx];
                });
                wsPlacedWordsMap[wordObj.key] = tempCoords;
                placed = true;
            }
        }
    });

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < 11; r++) {
        for (let c = 0; c < 11; c++) {
            if (wsMatrix[r][c] === '') {
                wsMatrix[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function renderWordSearchGrid() {
    const container = document.getElementById('ws-grid-container');
    container.innerHTML = "";

    for (let r = 0; r < 11; r++) {
        for (let c = 0; c < 11; c++) {
            const cell = document.createElement('div');
            cell.className = 'ws-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.innerText = wsMatrix[r][c];
            container.appendChild(cell);
        }
    }
}

function calculateStraightLine(r1, c1, r2, c2) {
    const dr = r2 - r1;
    const dc = c2 - c1;
    const absR = Math.abs(dr);
    const absC = Math.abs(dc);

    if (absR !== 0 && absC !== 0 && absR !== absC) {
        return null;
    }

    const steps = Math.max(absR, absC);
    const stepR = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
    const stepC = dc === 0 ? 0 : (dc > 0 ? 1 : -1);

    const line = [];
    let currR = r1;
    let currC = c1;

    for (let i = 0; i <= steps; i++) {
        line.push({ r: currR, c: currC });
        currR += stepR;
        currC += stepC;
    }

    return line;
}

function attachWordSearchInputHandlers() {
    const container = document.getElementById('ws-grid-container');

    function getCellFromEvent(e) {
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const target = document.elementFromPoint(clientX, clientY);
        if (target && target.classList.contains('ws-cell')) {
            return {
                r: parseInt(target.dataset.row),
                c: parseInt(target.dataset.col),
                el: target
            };
        }
        return null;
    }

    const handleStart = (e) => {
        const cellInfo = getCellFromEvent(e);
        if (!cellInfo) return;

        if (wsStartCell && wsStartCell.r === cellInfo.r && wsStartCell.c === cellInfo.c) {
            clearSelectionHighlight();
            wsStartCell = null;
            isWsDragging = false;
            return;
        }

        if (!wsStartCell) {
            wsStartCell = cellInfo;
            isWsDragging = true;
            updateSelectionHighlight([wsStartCell]);
        } else {
            const line = calculateStraightLine(wsStartCell.r, wsStartCell.c, cellInfo.r, cellInfo.c);
            if (line) {
                checkSelectedWordMatch(line);
            }
            wsStartCell = null;
            isWsDragging = false;
        }
    };

    const handleMove = (e) => {
        if (!isWsDragging || !wsStartCell) return;
        const cellInfo = getCellFromEvent(e);
        if (!cellInfo) return;

        const line = calculateStraightLine(wsStartCell.r, wsStartCell.c, cellInfo.r, cellInfo.c);
        if (line) {
            wsCurrentLineCells = line;
            updateSelectionHighlight(line);
        }
    };

    const handleEnd = () => {
        if (isWsDragging && wsCurrentLineCells.length > 1) {
            checkSelectedWordMatch(wsCurrentLineCells);
            wsStartCell = null;
        }
        isWsDragging = false;
        wsCurrentLineCells = [];
    };

    container.onmousedown = handleStart;
    window.onmousemove = handleMove;
    window.onmouseup = handleEnd;

    container.ontouchstart = (e) => { handleStart(e); };
    window.ontouchmove = (e) => { handleMove(e); };
    window.ontouchend = handleEnd;
}

function updateSelectionHighlight(lineCoords) {
    clearSelectionHighlight();
    lineCoords.forEach(coord => {
        const cell = document.querySelector(`.ws-cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
        if (cell && !cell.classList.contains('found')) {
            cell.classList.add('selecting');
        }
    });
}

function clearSelectionHighlight() {
    document.querySelectorAll('.ws-cell.selecting').forEach(cell => {
        cell.classList.remove('selecting');
    });
}

function checkSelectedWordMatch(lineCoords) {
    clearSelectionHighlight();

    let formedWord = "";
    lineCoords.forEach(coord => {
        formedWord += wsMatrix[coord.r][coord.c];
    });

    const reversedWord = formedWord.split('').reverse().join('');
    let matchedKey = null;

    wsTargetWords.forEach(w => {
        if (wsFoundKeys.includes(w.key)) return;
        if (formedWord === w.key || reversedWord === w.key) {
            matchedKey = w.key;
        }
    });

    if (matchedKey) {
        playAudio('match');
        wsFoundKeys.push(matchedKey);

        const matchedWordObj = wsTargetWords.find(w => w.key === matchedKey);
        const wordColor = matchedWordObj ? matchedWordObj.color : '#B5EAD7';
        const wordShadow = matchedWordObj ? matchedWordObj.shadow : 'rgba(181, 234, 215, 0.8)';

        lineCoords.forEach(coord => {
            const cell = document.querySelector(`.ws-cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
            if (cell) {
                cell.style.setProperty('--cell-bg', wordColor);
                cell.classList.add('found');
            }
        });

        const listItem = document.getElementById(`word-item-${matchedKey}`);
        if (listItem) {
            listItem.style.setProperty('--marker-color', wordColor);
            listItem.style.setProperty('--marker-shadow', wordShadow);
            listItem.classList.add('marker-active');
            const icon = listItem.querySelector('.check-icon');
            if (icon) icon.classList.remove('hidden');
        }

        if (wsFoundKeys.length === wsTargetWords.length) {
            setTimeout(triggerVictoryCelebration, 400);
        }
    } else {
        playAudio('wrong');
    }
}

/* -------------------------------------------------------------
 * CELEBRAÇÃO DA VITÓRIA (CONFETES + TELA MODAL)
 * ------------------------------------------------------------- */
function triggerVictoryCelebration() {
    playAudio('victory');
    launchConfetti();
    document.getElementById('victoryModal').classList.remove('hidden');
}

function closeVictoryModal() {
    playAudio('click');
    document.getElementById('victoryModal').classList.add('hidden');
}

function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#FFB7B2', '#FFDAC1', '#B5EAD7', '#A2D2FF', '#FFE066', '#E2F0CB'];

    for (let i = 0; i < 100; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360
        });
    }

    let timer = 0;
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += 2;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        timer++;
        if (timer < 180) {
            requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animateConfetti();
}

/* -------------------------------------------------------------
 * INICIALIZAÇÃO DA APLICAÇÃO
 * ------------------------------------------------------------- */
window.onload = function() {
    initStep1();
};
