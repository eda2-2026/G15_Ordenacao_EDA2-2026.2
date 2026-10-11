// --- ESTADO GLOBAL ---
let caixas = [];
let algoAtivo = 'insertion';
let isRunning = false;
let abortController = null;
let numCaixas = 15;
let abortando = false; // PARAR clicado, esperando o robô terminar o passo atual

// --- INTERFACE E CONTROLES ---
function selectAlgo(algo) {
  if (isRunning || abortando) return;
  algoAtivo = algo;
  
  document.querySelectorAll('.algo-btn').forEach(btn => {
    btn.classList.remove('bg-purple-700', 'text-white', 'border-purple-400', 'shadow-[0_0_10px_rgba(168,85,247,0.5)]');
    btn.classList.add('bg-gray-900', 'text-gray-400', 'border-gray-700');
  });
  const activeBtn = document.getElementById(`btn-${algo}`);
  activeBtn.classList.remove('bg-gray-900', 'text-gray-400', 'border-gray-700');
  activeBtn.classList.add('bg-purple-700', 'text-white', 'border-purple-400', 'shadow-[0_0_10px_rgba(168,85,247,0.5)]');

  const areaExtra = document.getElementById('area-extra');
  const legEstoque = document.getElementById('lbl-estoque');
  if (algo === 'merge') {
    areaExtra.classList.remove('hidden');
    areaExtra.classList.add('flex');
    document.getElementById('legenda-extra').innerText = "ÁREA DE TRANSBORDO";
    legEstoque.innerText = "GERAL (MERGE)";
  } else if (algo === 'radix') {
    areaExtra.classList.remove('hidden');
    areaExtra.classList.add('flex');
    document.getElementById('legenda-extra').innerText = "BAIAS DE DISTRIBUIÇÃO (0-9)";
    legEstoque.innerText = "CATÁLOGO (RADIX)";
  } else {
    areaExtra.classList.add('hidden');
    areaExtra.classList.remove('flex');
    legEstoque.innerText = algo === 'insertion' ? "EXPEDIÇÃO" : "GERAL";
  }

  prepararAreaExtra();
  atualizarCodigo();
}

function atualizarCodigo() {
  const p = document.getElementById('code-panel');
  if(algoAtivo === 'bubble') {
    p.innerHTML = `
      <div class="text-yellow-400 font-bold mb-2 pb-1 border-b border-gray-700 text-xs flex justify-between items-center">
        <span>BUBBLE SORT</span>
        <span class="text-[10px] text-gray-400 font-normal">O(n²)</span>
      </div>
      <div class="space-y-1 font-mono text-xs">
        <div id="step-1" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent opacity-90">
          <span class="text-purple-400 font-bold">para</span> <span class="text-sky-300">i</span> <span class="text-purple-400 font-bold">de</span> 0 <span class="text-purple-400 font-bold">até</span> n-1:
        </div>
        <div id="step-2" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-purple-400 font-bold">se</span> <span class="text-sky-300">caixas[j]</span> &gt; <span class="text-sky-300">caixas[j+1]</span>:
        </div>
        <div id="step-3" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-8 opacity-90">
          <span class="text-yellow-300 font-semibold">trocar</span>(<span class="text-sky-300">caixas[j]</span>, <span class="text-sky-300">caixas[j+1]</span>)
        </div>
        <div id="step-4" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-green-400 font-semibold">consolidar</span>(<span class="text-sky-300">caixas[n-1-i]</span>)
        </div>
      </div>
    `;
  } else if(algoAtivo === 'insertion') {
    p.innerHTML = `
      <div class="text-yellow-400 font-bold mb-2 pb-1 border-b border-gray-700 text-xs flex justify-between items-center">
        <span>INSERTION SORT</span>
        <span class="text-[10px] text-gray-400 font-normal">O(n²)</span>
      </div>
      <div class="space-y-1 font-mono text-xs">
        <div id="step-1" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent opacity-90">
          <span class="text-purple-400 font-bold">para</span> <span class="text-sky-300">i</span> <span class="text-purple-400 font-bold">de</span> 1 <span class="text-purple-400 font-bold">até</span> n-1 (<span class="text-sky-200">pivo</span> = <span class="text-sky-300">caixas[i]</span>):
        </div>
        <div id="step-2" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-purple-400 font-bold">enquanto</span> <span class="text-sky-300">j</span> &gt; 0 <span class="text-purple-400 font-bold">e</span> <span class="text-sky-300">caixas[j-1]</span> &gt; <span class="text-sky-300">pivo</span>:
        </div>
        <div id="step-3" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-8 opacity-90">
          <span class="text-yellow-300 font-semibold">deslocar</span>(<span class="text-sky-300">caixas[j-1]</span> → <span class="text-sky-300">j</span>)
        </div>
        <div id="step-4" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-green-400 font-semibold">inserir</span>(<span class="text-sky-300">pivo</span> na vaga <span class="text-sky-300">j</span>)
        </div>
      </div>
    `;
  } else if(algoAtivo === 'merge') {
    p.innerHTML = `
      <div class="text-yellow-400 font-bold mb-2 pb-1 border-b border-gray-700 text-xs flex justify-between items-center">
        <span>MERGE SORT</span>
        <span class="text-[10px] text-gray-400 font-normal">O(n log n)</span>
      </div>
      <div class="space-y-1 font-mono text-xs">
        <div id="step-1" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent opacity-90">
          <span class="text-purple-400 font-bold">dividir</span>(<span class="text-sky-300">inicio</span>, <span class="text-sky-300">meio</span>) <span class="text-purple-400 font-bold">e</span> <span class="text-purple-400 font-bold">dividir</span>(<span class="text-sky-300">meio+1</span>, <span class="text-sky-300">fim</span>)
        </div>
        <div id="step-2" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-yellow-300 font-semibold">transbordo</span> = <span class="text-sky-300">copiar</span>(<span class="text-sky-300">caixas[inicio..fim]</span>)
        </div>
        <div id="step-3" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-purple-400 font-bold">se</span> <span class="text-sky-300">transbordo[i]</span> &le; <span class="text-sky-300">transbordo[j]</span>:
        </div>
        <div id="step-4" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-8 opacity-90">
          <span class="text-green-400 font-semibold">devolverAoCorredor</span>(<span class="text-sky-300">menor_caixa</span>)
        </div>
      </div>
    `;
  } else {
    p.innerHTML = `
      <div class="text-yellow-400 font-bold mb-2 pb-1 border-b border-gray-700 text-xs flex justify-between items-center">
        <span>RADIX SORT LSD</span>
        <span class="text-[10px] text-gray-400 font-normal">O(d · n)</span>
      </div>
      <div class="space-y-1 font-mono text-xs">
        <div id="step-1" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent opacity-90">
          <span class="text-purple-400 font-bold">para cada</span> <span class="text-sky-300">digito</span> <span class="text-purple-400 font-bold">em</span> [<span class="text-yellow-300">U</span>, <span class="text-yellow-300">D</span>, <span class="text-yellow-300">C</span>]:
        </div>
        <div id="step-2" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-sky-300">d</span> = <span class="text-yellow-300 font-semibold">extrairDigito</span>(<span class="text-sky-300">caixa.sku</span>, <span class="text-sky-300">digito</span>)
        </div>
        <div id="step-3" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent pl-4 opacity-90">
          <span class="text-sky-300">baias[d]</span>.<span class="text-yellow-300 font-semibold">enfileirar</span>(<span class="text-sky-300">caixa</span>)
        </div>
        <div id="step-4" class="px-2 py-0.5 rounded transition-all border-l-4 border-transparent opacity-90">
          <span class="text-green-400 font-semibold">recolherBaias</span>(<span class="text-sky-300">baias[0..9]</span> → <span class="text-sky-300">corredor</span>)
        </div>
      </div>
    `;
  }
}

function hlStep(step) {
  for (let s = 1; s <= 4; s++) {
    const el = document.getElementById(`step-${s}`);
    if (!el) continue;
    if (step === 0) {
      el.classList.remove('bg-blue-950/80', 'border-yellow-400', 'shadow-sm', 'opacity-50');
      el.classList.add('border-transparent', 'opacity-90');
    } else if (s === step) {
      el.classList.add('bg-blue-950/80', 'border-yellow-400', 'shadow-sm');
      el.classList.remove('border-transparent', 'opacity-50');
    } else {
      el.classList.remove('bg-blue-950/80', 'border-yellow-400', 'shadow-sm');
      el.classList.add('border-transparent', 'opacity-50');
    }
  }
}

function hlCode(id, active) {
  if (!active) return;
  if (id === 'code-cmp') hlStep(2);
  else if (id === 'code-swap') hlStep(3);
  else if (id === 'code-levar') hlStep(2);
  else if (id === 'code-dist') hlStep(3);
}

function logTerminal(msg) {
  document.getElementById('log-terminal').innerText = msg;
}

// --- GERAÇÃO DO GALPÃO ---
function gerarCaixas() {
  if (isRunning || abortando) return;
  const cenario = document.getElementById('cenario').value;
  caixas = [];
  const corredor = document.getElementById('corredor');
  corredor.innerHTML = '';
  
  let valores = [];
  for(let i=0; i<numCaixas; i++) {
    valores.push(Math.floor(Math.random() * 900) + 100);
  }

  if(cenario === 'quase') {
    valores.sort((a,b) => a-b);
    let p1 = Math.floor(Math.random() * numCaixas);
    let p2 = Math.floor(Math.random() * numCaixas);
    let temp = valores[p1]; valores[p1] = valores[p2]; valores[p2] = temp;
  } else if (cenario === 'inverso') {
    valores.sort((a,b) => b-a);
  }

  valores.forEach((val, index) => {
    const height = Math.max(40, (val / 999) * 220); // max 220px
    const div = document.createElement('div');
    div.className = `box w-16 bg-amber-800 border-2 border-amber-950 flex justify-center items-center font-bold text-yellow-100 text-xs pixel-box shadow-lg`;
    div.style.height = `${height}px`;
    div.innerText = val;
    div.id = `caixa-${index}`;
    caixas.push({ id: index, val: val, el: div });
    corredor.appendChild(div);
  });

  prepararAreaExtra();
  resetMetricas();
  logTerminal("Caixas posicionadas. Aguardando...");
  
  // Posicionar robo no centro do galpão
  setTimeout(() => { robotToCenter(); }, 100);
}

// --- ANIMAÇÃO DO ROBÔ ---
function robotToCenter() {
  const galpao = document.getElementById('robo').parentNode;
  const robo = document.getElementById('robo');
  const posX = galpao.offsetWidth / 2;
  robo.style.transform = `translateX(${posX - (robo.offsetWidth / 2)}px)`;
}

function moveRobotPosition(x) {
  const robo = document.getElementById('robo');
  robo.style.transform = `translateX(${x}px)`;
}

function getDelay() {
  const speedInput = document.getElementById('speed');
  const speed = speedInput ? parseInt(speedInput.value, 10) : 50;
  
  // Curva de velocidade expandida (1 a 100):
  // 1-30: 800ms a 300ms (lento / didático)
  // 31-70: 300ms a 60ms (moderado / padrão)
  // 71-90: 60ms a 15ms (rápido)
  // 91-100: 15ms a 2ms (turbo / quase instantâneo)
  let delayMs;
  if (speed <= 30) {
    delayMs = Math.round(800 - (speed - 1) * (500 / 29));
  } else if (speed <= 70) {
    delayMs = Math.round(300 - (speed - 30) * (240 / 40));
  } else if (speed <= 90) {
    delayMs = Math.round(60 - (speed - 70) * (45 / 20));
  } else {
    delayMs = Math.max(2, Math.round(15 - (speed - 90) * (13 / 10)));
  }

  const animSeconds = Math.max(0.02, delayMs / 1000);
  document.documentElement.style.setProperty('--anim-speed', `${animSeconds}s`);

  const lbl = document.getElementById('speed-label');
  if (lbl) {
    if (speed < 30) lbl.innerText = "Lento";
    else if (speed < 65) lbl.innerText = "Médio";
    else if (speed < 88) lbl.innerText = "Rápido";
    else if (speed < 98) lbl.innerText = "Muito Rápido";
    else lbl.innerText = "⚡ Turbo";
  }

  return delayMs;
}

async function sleep(msOverride) {
  const d = msOverride !== undefined ? msOverride : getDelay();
  if (d <= 2) {
    return new Promise(resolve => {
      const timeout = setTimeout(resolve, 0);
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
  }
  return new Promise(resolve => {
    const timeout = setTimeout(resolve, d);
    if(abortController) {
      abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        resolve();
      });
    }
  });
}

async function checkAbort() {
  if(abortController && abortController.signal.aborted) throw new Error("Abortado");
}

async function moveRobotToBox(boxEl) {
  const galpaoRect = document.getElementById('robo').parentNode.getBoundingClientRect();
  const boxRect = boxEl.getBoundingClientRect();
  const robo = document.getElementById('robo');
  const posX = (boxRect.left - galpaoRect.left) + (boxRect.width / 2);
  robo.style.transform = `translateX(${posX - (robo.offsetWidth / 2)}px)`;
  await sleep(getDelay());
}

async function actRobotGarra(acao, arg = null) {
  const braco = document.getElementById('robo-braco');
  const motor = document.getElementById('robo-motor');
  const garra = document.getElementById('garra-esq');
  const gDir = document.getElementById('garra-dir');
  const delay = getDelay();
  
  let waitTime = delay;

  if (acao === 'descer' && arg) {
    const bracoRect = braco.getBoundingClientRect();
    const boxRect = arg.getBoundingClientRect();
    const targetHeight = (boxRect.top - bracoRect.top) - motor.offsetHeight - (garra.offsetHeight / 1.5);
    braco.style.height = `${targetHeight}px`;
  } else if (acao === 'descer-exato' && arg !== null) {
    braco.style.height = `${arg}px`;
  } else if (acao === 'subir') {
    braco.style.height = arg !== null ? `${arg}px` : '48px'; 
  } else if (acao === 'abrir') {
    garra.style.transform = 'rotate(-30deg)';
    gDir.style.transform = 'rotate(30deg)';
    waitTime = delay * 0.5;
  } else if (acao === 'fechar') {
    garra.style.transform = 'rotate(0deg)';
    gDir.style.transform = 'rotate(0deg)';
    waitTime = delay * 0.5;
  }
  await sleep(waitTime);
}

async function highlightCompare(i, j) {
  await highlightCompareCaixas(caixas[i], j !== undefined ? caixas[j] : undefined);
}

// Mesma leitura, mas recebendo as caixas diretamente (útil quando elas não estão no corredor)
async function highlightCompareCaixas(a, b) {
  a.el.classList.add('highlight-compare');
  if(b !== undefined) b.el.classList.add('highlight-compare');
  addMetrica('leituras', b !== undefined ? 2 : 1);
  logTerminal(`Lendo SKU: ${a.val} ${b !== undefined ? 'e '+b.val : ''}`);
  hlCode('code-cmp', true);
  
  await sleep();
  await checkAbort();
  
  hlCode('code-cmp', false);
  a.el.classList.remove('highlight-compare');
  if(b !== undefined) b.el.classList.remove('highlight-compare');
}

async function swapDOM(idxA, idxB) {
  const boxA = caixas[idxA].el;
  const boxB = caixas[idxB].el;

  logTerminal(`Movendo caixas ${caixas[idxA].val} e ${caixas[idxB].val}...`);
  hlCode('code-swap', true);
  
  const rectA = boxA.getBoundingClientRect();
  const rectB = boxB.getBoundingClientRect();
  const deltaX = rectB.left - rectA.left;
  
  // 1. O Robô vai até a caixa A, abre a garra e desce nela
  await checkAbort();
  await moveRobotToBox(boxA);
  await actRobotGarra('abrir');
  await actRobotGarra('descer', boxA);
  await actRobotGarra('fechar');
  await checkAbort();
  boxA.classList.add('highlight-swap');
  
  // Salva a altura exata que o braço precisou para encostar na caixa A no chão
  const braco = document.getElementById('robo-braco');
  const grabArmHeight = parseFloat(braco.style.height || '48');
  
  // Limita o levantamento a no máximo 70px para ser mais sutil e rápido
  const maxLift = 70;
  const newArmHeight = Math.max(48, grabArmHeight - maxLift);
  const actualLift = grabArmHeight - newArmHeight; // Valor exato que subiu
  
  // 2. Levanta o braço e a caixa ao mesmo tempo, pela mesma distância exata
  boxA.style.transform = `translateY(-${actualLift}px)`;
  await actRobotGarra('subir', newArmHeight);
  await checkAbort();
  
  // 3. Move o Robô E a Caixa A pelo ar. A Caixa B desliza por baixo para a vaga de A.
  boxA.style.transform = `translate(${deltaX}px, -${actualLift}px)`;
  boxB.style.transform = `translate(${-deltaX}px, 0px)`;
  await moveRobotToBox(boxB);
  await checkAbort();
  
  // 4. Troca real no DOM sem que o usuário perceba visualmente (FLIP invertido)
  const parent = boxA.parentNode;
  const siblingA = boxA.nextSibling === boxB ? boxA : boxA.nextSibling;
  parent.insertBefore(boxB, siblingA);
  parent.insertBefore(boxA, boxB.nextSibling);

  // Pausa as transições para não piscar
  boxA.style.transition = 'none';
  boxB.style.transition = 'none';
  
  // Como as divs agora assumiram seus novos lugares via flexbox, 
  // zeramos as correções no eixo X e mantemos só a altura exata no A
  boxA.style.transform = `translate(0px, -${actualLift}px)`;
  boxB.style.transform = ''; 
  
  // Força o navegador a recalcular o layout instantaneamente
  void boxA.offsetWidth;
  
  // Devolve as transições
  boxA.style.transition = '';
  boxB.style.transition = '';

  // Troca lógica no array
  let temp = caixas[idxA];
  caixas[idxA] = caixas[idxB];
  caixas[idxB] = temp;

  addMetrica('movs', 2);
  
  // 5. Robô desce a caixa A na sua nova posição.
  // Usamos a altura exata de captura guardada para não medir a caixa durante a animação
  boxA.style.transform = ''; 
  await actRobotGarra('descer-exato', grabArmHeight); 
  boxA.classList.remove('highlight-swap');
  
  await actRobotGarra('abrir');
  await actRobotGarra('subir'); // Sobe totalmente para a base (48px)
  await actRobotGarra('fechar');

  hlCode('code-swap', false);
}

// --- ÁREA EXTRA (TRANSBORDO DO MERGE / BAIAS DO RADIX) ---
function criarSlot() {
  const slot = document.createElement('div');
  slot.className = 'slot-vazio w-16';
  return slot;
}

function criarSlotNaBaia(digito) {
  const pilha = document.querySelectorAll('#corredor-extra .baia-pilha')[digito];
  const slot = document.createElement('div');
  slot.className = 'slot-mini';
  pilha.appendChild(slot);
  return slot;
}

function prepararAreaExtra() {
  const extra = document.getElementById('corredor-extra');
  extra.innerHTML = '';

  if (algoAtivo === 'merge') {
    // um slot por posição do corredor, alinhado logo abaixo dela
    for (let k = 0; k < caixas.length; k++) extra.appendChild(criarSlot());
  } else if (algoAtivo === 'radix') {
    for (let d = 0; d < 10; d++) {
      const baia = document.createElement('div');
      baia.className = 'baia';
      const pilha = document.createElement('div');
      pilha.className = 'baia-pilha';
      const rotulo = document.createElement('div');
      rotulo.className = 'baia-rotulo';
      rotulo.innerText = d;
      baia.appendChild(pilha);
      baia.appendChild(rotulo);
      extra.appendChild(baia);
    }
  }
}

// Recoloca todas as caixas no corredor, na ordem de `caixas`, e zera o robô
function reconstruirCorredor() {
  const corredor = document.getElementById('corredor');
  corredor.innerHTML = '';
  caixas.forEach(c => {
    c.el.classList.remove('highlight-compare', 'highlight-swap', 'highlight-sorted', 'box-mini');
    c.el.style.transform = '';
    c.el.style.transition = '';
    c.el.style.zIndex = '';
    c.el.innerText = c.val;
    corredor.appendChild(c.el);
  });
  prepararAreaExtra();
  ['code-cmp', 'code-swap', 'code-levar', 'code-dist'].forEach(id => hlCode(id, false));

  document.getElementById('robo-braco').style.height = '48px';
  document.getElementById('garra-esq').style.transform = 'rotate(0deg)';
  document.getElementById('garra-dir').style.transform = 'rotate(0deg)';
  robotToCenter();
}

// Algoritmos com área extra guardam a ordem original para desfazer se forem abortados
function salvarEstado() {
  return { ref: caixas, ordem: caixas.slice() };
}

function restaurarEstado(estado) {
  if (caixas !== estado.ref) return; // outro galpão já foi gerado nesse meio tempo
  for (let i = 0; i < estado.ordem.length; i++) caixas[i] = estado.ordem[i];
  reconstruirCorredor();
}

// Robô pega a caixa onde ela estiver e a deixa no slot de destino.
// opcoes.origemSemSlot: não deixa slot vazio onde a caixa estava (ex.: saindo de uma baia)
// opcoes.redimensionar: função chamada ao soltar quando a caixa muda de tamanho (corredor <-> baia)
async function transportar(c, slotDestino, opcoes = {}) {
  const el = c.el;
  const braco = document.getElementById('robo-braco');

  // 1. O robô vai até a caixa, abre a garra, desce e agarra
  await checkAbort();
  await moveRobotToBox(el);
  await actRobotGarra('abrir');
  await actRobotGarra('descer', el);
  await actRobotGarra('fechar');
  await checkAbort();
  el.classList.add('highlight-swap');
  el.style.zIndex = '25';

  const alturaAgarrar = parseFloat(braco.style.height || '48');

  // Mede origem e destino com a caixa parada
  const rOrigem = el.getBoundingClientRect();
  const rDestino = slotDestino.getBoundingClientRect();
  const dx = (rDestino.left + rDestino.width / 2) - (rOrigem.left + rOrigem.width / 2);
  const dy = rDestino.bottom - rOrigem.bottom;

  // 2. Levanta o braço e a caixa pela mesma distância (no máximo 70px, como no swapDOM)
  const maxLift = 70;
  const novaAltura = Math.max(48, alturaAgarrar - maxLift);
  const elevacao = alturaAgarrar - novaAltura;
  el.style.transform = `translateY(-${elevacao}px)`;
  await actRobotGarra('subir', novaAltura);
  await checkAbort();

  // 3. Leva a caixa pelo ar até o destino (o braço acompanha a diferença de altura)
  el.style.transform = `translate(${dx}px, ${dy - elevacao}px)`;
  braco.style.height = `${Math.max(0, novaAltura + dy)}px`;
  await moveRobotToBox(slotDestino);
  await checkAbort();

  // 4. A caixa assume o lugar do slot; a origem vira um espaço vazio (sem animação)
  el.style.transition = 'none';
  if (opcoes.origemSemSlot) el.remove();
  else el.replaceWith(criarSlot());
  slotDestino.replaceWith(el);

  // 5. Desce a caixa no destino
  if (opcoes.redimensionar) {
    opcoes.redimensionar(el);
    el.style.transform = '';
    void el.offsetWidth;
    el.style.transition = '';
    await actRobotGarra('descer', el);
  } else {
    el.style.transform = `translateY(-${elevacao}px)`;
    void el.offsetWidth;
    el.style.transition = '';
    el.style.transform = '';
    await actRobotGarra('descer-exato', alturaAgarrar + dy);
  }
  el.classList.remove('highlight-swap');
  el.style.zIndex = '';

  // 6. Solta e recolhe o braço
  await actRobotGarra('abrir');
  await actRobotGarra('subir');
  await actRobotGarra('fechar');
}

// --- PLACAR E SIMULAÇÃO EM LOTE ---
function formatarMoeda(val) {
  return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatarTempo(val) {
  if (val >= 3600) {
    const h = Math.floor(val / 3600);
    const m = Math.floor((val % 3600) / 60);
    return `${h}h ${m}min`;
  }
  if (val >= 60) {
    const m = Math.floor(val / 60);
    const s = Math.round(val % 60);
    return `${m}min ${s}s`;
  }
  return `${val.toFixed(1)}s`;
}

function atualizarPlacar(algo) {
  const row = document.getElementById(`row-${algo}`);
  document.getElementById(`placar-${algo}-tempo`).innerText = document.getElementById('metric-tempo').innerText;
  document.getElementById(`placar-${algo}-custo`).innerText = document.getElementById('metric-custo').innerText;
  document.getElementById(`placar-${algo}-leituras`).innerText = metricas.leituras.toLocaleString('pt-BR');
  document.getElementById(`placar-${algo}-movs`).innerText = metricas.movs.toLocaleString('pt-BR');

  const cellAvaliacao = document.getElementById(`placar-${algo}-avaliacao`);
  if (cellAvaliacao) {
    cellAvaliacao.innerHTML = `<span class="bg-purple-900/40 text-purple-300 border border-purple-500 px-2 py-1 rounded text-xs font-bold">RODADO</span>`;
  }
}

function batchBubble(orig) {
  const a = orig.slice();
  const n = a.length;
  let leituras = 0, movs = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      leituras += 2;
      if (a[j] > a[j + 1]) {
        const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
        movs += 2;
      }
    }
  }
  return { leituras, movs, area: 0 };
}

function batchInsertion(orig) {
  const a = orig.slice();
  const n = a.length;
  let leituras = 0, movs = 0;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      leituras += 2;
      if (a[j - 1] > a[j]) {
        const tmp = a[j - 1]; a[j - 1] = a[j]; a[j] = tmp;
        movs += 2;
        j--;
      } else {
        break;
      }
    }
  }
  return { leituras, movs, area: 0 };
}

function batchMerge(orig) {
  const a = orig.slice();
  const n = a.length;
  let leituras = 0, movs = 0, maxArea = 0;

  function mergeSortRec(inicio, fim) {
    if (inicio >= fim) return;
    const meio = Math.floor((inicio + fim) / 2);
    mergeSortRec(inicio, meio);
    mergeSortRec(meio + 1, fim);
    mesclar(inicio, meio, fim);
  }

  function mesclar(inicio, meio, fim) {
    const tam = fim - inicio + 1;
    if (tam > maxArea) maxArea = tam;
    movs += tam; // levar ao transbordo

    const aux = a.slice();
    let i = inicio;
    let j = meio + 1;
    let k = inicio;

    while (i <= meio && j <= fim) {
      leituras += 2;
      if (aux[i] <= aux[j]) {
        a[k] = aux[i];
        i++;
      } else {
        a[k] = aux[j];
        j++;
      }
      movs += 1; // devolver ao corredor
      k++;
    }

    while (i <= meio) {
      a[k++] = aux[i++];
      movs += 1;
    }
    while (j <= fim) {
      a[k++] = aux[j++];
      movs += 1;
    }
  }

  mergeSortRec(0, n - 1);
  return { leituras, movs, area: maxArea };
}

function batchRadix(orig) {
  const a = orig.slice();
  const n = a.length;
  let leituras = 0, movs = 0, area = n;
  let exp = 1;

  for (let d = 0; d < 3; d++) {
    const baias = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < n; i++) {
      leituras += 1;
      const dig = Math.floor(a[i] / exp) % 10;
      baias[dig].push(a[i]);
      movs += 1;
    }
    let k = 0;
    for (let b = 0; b < 10; b++) {
      for (let q = 0; q < baias[b].length; q++) {
        a[k++] = baias[b][q];
        movs += 1;
      }
    }
    exp *= 10;
  }
  return { leituras, movs, area };
}

function calcularMetricasCusto(m) {
  const modeloC = (typeof C !== 'undefined') ? C : (typeof window !== 'undefined' ? window.C : null);
  const custo = (m.leituras * modeloC.leitura.custo) + (m.movs * modeloC.movimento.custo) + (m.area * modeloC.area.custo);
  const tempo = (m.leituras * modeloC.leitura.tempo) + (m.movs * modeloC.movimento.tempo);
  return { custo, tempo, ...m };
}

function simularTodos(valores, rotulo = "Simulação") {
  if (!valores || valores.length === 0) {
    alert("Nenhuma caixa disponível para simular!");
    return;
  }

  const subtitulo = document.getElementById('placar-subtitulo');
  if (subtitulo) subtitulo.innerText = `Processando simulação para ${valores.length.toLocaleString('pt-BR')} caixas...`;

  const resultados = {
    bubble: calcularMetricasCusto(batchBubble(valores)),
    insertion: calcularMetricasCusto(batchInsertion(valores)),
    merge: calcularMetricasCusto(batchMerge(valores)),
    radix: calcularMetricasCusto(batchRadix(valores))
  };

  const algos = ['bubble', 'insertion', 'merge', 'radix'];
  const custos = algos.map(k => resultados[k].custo);
  const menorCusto = Math.min(...custos);
  const maiorCusto = Math.max(...custos);

  algos.forEach(algo => {
    const res = resultados[algo];
    const row = document.getElementById(`row-${algo}`);
    
    document.getElementById(`placar-${algo}-tempo`).innerText = formatarTempo(res.tempo);
    document.getElementById(`placar-${algo}-custo`).innerText = formatarMoeda(res.custo);
    document.getElementById(`placar-${algo}-leituras`).innerText = res.leituras.toLocaleString('pt-BR');
    document.getElementById(`placar-${algo}-movs`).innerText = res.movs.toLocaleString('pt-BR');

    if (row) {
      row.classList.remove('bg-green-950/40', 'border-l-4', 'border-green-500', 'bg-blue-950/20');
    }

    const cellAvaliacao = document.getElementById(`placar-${algo}-avaliacao`);
    if (res.custo === menorCusto) {
      if (row) row.classList.add('bg-green-950/40', 'border-l-4', 'border-green-500');
      if (cellAvaliacao) {
        cellAvaliacao.innerHTML = `<span class="bg-green-600/40 text-green-300 border border-green-500 px-2 py-1 rounded text-xs font-bold">🏆 MELHOR</span>`;
      }
    } else {
      let badge = '';
      if (res.custo <= menorCusto * 1.5) {
        badge = `<span class="bg-blue-900/40 text-blue-300 border border-blue-600 px-2 py-1 rounded text-xs font-bold">BOM</span>`;
      } else if (res.custo < maiorCusto) {
        badge = `<span class="bg-yellow-900/40 text-yellow-300 border border-yellow-600 px-2 py-1 rounded text-xs font-bold">MÉDIO</span>`;
      } else {
        badge = `<span class="bg-red-900/40 text-red-300 border border-red-600 px-2 py-1 rounded text-xs font-bold">ALTO CUSTO</span>`;
      }
      if (cellAvaliacao) cellAvaliacao.innerHTML = badge;
    }
  });

  if (subtitulo) {
    const cenarioSelect = document.getElementById('cenario');
    const cenarioTexto = cenarioSelect ? cenarioSelect.selectedOptions[0].text : '';
    subtitulo.innerHTML = `Simulação concluída com <strong class="text-white">${valores.length.toLocaleString('pt-BR')} caixas</strong> (${rotulo} - ${cenarioTexto}). Linha mais econômica destacada em <strong class="text-green-400">verde</strong>.`;
  }
}


function simularTodos1000() {
  if (isRunning) {
    alert("Aguarde ou pare a simulação atual da garra antes de simular o placar.");
    return;
  }
  const cenario = document.getElementById('cenario').value;
  let valores = [];
  for (let i = 0; i < 1000; i++) {
    valores.push(Math.floor(Math.random() * 900) + 100);
  }

  if (cenario === 'quase') {
    valores.sort((a, b) => a - b);
    for (let k = 0; k < 20; k++) {
      let p1 = Math.floor(Math.random() * 1000);
      let p2 = Math.floor(Math.random() * 1000);
      let tmp = valores[p1]; valores[p1] = valores[p2]; valores[p2] = tmp;
    }
  } else if (cenario === 'inverso') {
    valores.sort((a, b) => b - a);
  }

  simularTodos(valores, "1.000 Caixas");
}

// --- CONTROLE PRINCIPAL ---
async function startSim() {
  if (isRunning) {
    abortController.abort();
    document.getElementById('btn-iniciar').innerText = "▶ INICIAR";
    document.getElementById('btn-iniciar').classList.replace('bg-red-600', 'bg-green-600');
    document.getElementById('btn-iniciar').classList.replace('hover:bg-red-500', 'hover:bg-green-500');
    isRunning = false;
    abortando = true;
    hlStep(0);
    logTerminal("Simulação abortada.");
    return;
  }
  if (abortando) {
    logTerminal("Aguarde o robô terminar o movimento atual...");
    return;
  }

  isRunning = true;
  abortController = new AbortController();
  hlStep(0);
  document.getElementById('btn-iniciar').innerText = "◼ PARAR";
  document.getElementById('btn-iniciar').classList.replace('bg-green-600', 'bg-red-600');
  document.getElementById('btn-iniciar').classList.replace('hover:bg-green-500', 'hover:bg-red-500');
  
  caixas.forEach(c => {
      c.el.className = c.el.className.replace(/highlight-[a-z]+/g, '');
      c.el.style.transform = '';
  });
  resetMetricas();

  const algo = algoAtivo;

  try {
    if(algo === 'insertion') await execInsertion();
    else if(algo === 'bubble') await execBubble();
    else if(algo === 'merge') await execMerge();
    else if(algo === 'radix') await execRadix();

    if(!abortController.signal.aborted) {
      atualizarPlacar(algo);
      logTerminal("Ordenação concluída!");
      moveRobotPosition(0); // Volta pro começo
    }
  } catch (e) {
    if(e.message !== "Abortado") console.error(e);
  } finally {
    isRunning = false;
    abortando = false;
    hlStep(0);
    document.getElementById('btn-iniciar').innerText = "▶ INICIAR";
    document.getElementById('btn-iniciar').classList.replace('bg-red-600', 'bg-green-600');
    document.getElementById('btn-iniciar').classList.replace('hover:bg-red-500', 'hover:bg-green-500');
  }
}

// Init
window.onload = () => {
    selectAlgo('insertion');
    gerarCaixas();
    const speedInput = document.getElementById('speed');
    if (speedInput) {
      speedInput.addEventListener('input', getDelay);
      getDelay();
    }
};