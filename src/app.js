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
      <div>para <span class="text-purple-400">i</span> de 0 até fim:</div>
      <div class="pl-4">para <span class="text-purple-400">j</span> de 0 até fim - i - 1:</div>
      <div id="code-cmp" class="pl-8 py-1 transition-colors">se caixa[j] > caixa[j+1]:</div>
      <div id="code-swap" class="pl-12 text-gray-400 italic transition-colors">trocar caixa[j] com caixa[j+1]</div>
    `;
  } else if(algoAtivo === 'insertion') {
    p.innerHTML = `
      <div>para <span class="text-purple-400">i</span> de 1 até fim:</div>
      <div class="pl-4 text-gray-400">pivo = caixa[i]; j = i - 1</div>
      <div id="code-cmp" class="pl-4 py-1 transition-colors">enqnt j >= 0 e caixa[j] > pivo:</div>
      <div id="code-swap" class="pl-8 text-gray-400 italic transition-colors">caixa[j+1] = caixa[j]; j--</div>
      <div class="pl-4 text-gray-400">caixa[j+1] = pivo</div>
    `;
  } else if(algoAtivo === 'merge') {
    p.innerHTML = `
      <div>função <span class="text-purple-400">MergeSort</span>(inicio, fim):</div>
      <div class="pl-4">se inicio &lt; fim:</div>
      <div class="pl-8 text-gray-400">meio = (inicio + fim) / 2</div>
      <div class="pl-8 text-gray-400">MergeSort(inicio, meio)</div>
      <div class="pl-8 text-gray-400">MergeSort(meio + 1, fim)</div>
      <div class="pl-8 text-gray-400">Merge(inicio, meio, fim)</div>
      <div class="mt-3">função <span class="text-purple-400">Merge</span>(inicio, meio, fim):</div>
      <div id="code-levar" class="pl-4 py-1 text-gray-400 transition-colors">levar caixa[inicio..fim] ao transbordo</div>
      <div class="pl-4 text-gray-400">enqnt esq e dir tiverem caixas:</div>
      <div id="code-cmp" class="pl-8 py-1 transition-colors">se esq &lt;= dir:</div>
      <div id="code-swap" class="pl-12 text-gray-400 italic transition-colors">devolver a menor ao corredor</div>
      <div class="pl-4 text-gray-400">devolver as caixas que sobraram</div>
    `;
  } else {
    p.innerHTML = `
      <div>para <span class="text-purple-400">dígito</span> (unid, dez, cent):</div>
      <div class="pl-4 text-gray-400">para cada caixa, da esquerda p/ direita:</div>
      <div id="code-cmp" class="pl-8 py-1 transition-colors">ler o dígito da caixa</div>
      <div id="code-dist" class="pl-8 py-1 text-gray-400 transition-colors">distribuir nas baias[dígito]</div>
      <div id="code-swap" class="pl-4 text-gray-400 italic transition-colors">recolher caixas das baias (0 a 9)</div>
    `;
  }
}

function hlCode(id, active) {
  const el = document.getElementById(id);
  if(!el) return;
  if(active) {
    el.classList.add('bg-blue-900/50', 'border-l-4', 'border-yellow-400', 'font-bold', 'text-white');
    el.classList.remove('text-gray-400');
  } else {
    el.classList.remove('bg-blue-900/50', 'border-l-4', 'border-yellow-400', 'font-bold', 'text-white');
    if(id !== 'code-cmp') el.classList.add('text-gray-400');
  }
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
  const speed = document.getElementById('speed').value;
  const delayMs = 800 - (speed * 7); // Range: 100ms a 800ms
  document.documentElement.style.setProperty('--anim-speed', `${delayMs / 1000}s`);
  return delayMs;
}

async function sleep(msOverride) {
  return new Promise(resolve => {
    const timeout = setTimeout(resolve, msOverride || getDelay());
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
  await moveRobotToBox(boxA);
  await actRobotGarra('abrir');
  await actRobotGarra('descer', boxA);
  await actRobotGarra('fechar');
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
  
  // 3. Move o Robô E a Caixa A pelo ar. A Caixa B desliza por baixo para a vaga de A.
  boxA.style.transform = `translate(${deltaX}px, -${actualLift}px)`;
  boxB.style.transform = `translate(${-deltaX}px, 0px)`;
  await moveRobotToBox(boxB);
  
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

// --- PLACAR ---
function atualizarPlacar(algo) {
  document.getElementById(`placar-${algo}-tempo`).innerText = document.getElementById('metric-tempo').innerText;
  document.getElementById(`placar-${algo}-custo`).innerText = document.getElementById('metric-custo').innerText;
  document.getElementById(`placar-${algo}-leituras`).innerText = metricas.leituras;
  document.getElementById(`placar-${algo}-movs`).innerText = metricas.movs;
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
    logTerminal("Simulação abortada.");
    return;
  }
  if (abortando) {
    logTerminal("Aguarde o robô terminar o movimento atual...");
    return;
  }

  isRunning = true;
  abortController = new AbortController();
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
    document.getElementById('btn-iniciar').innerText = "▶ INICIAR";
    document.getElementById('btn-iniciar').classList.replace('bg-red-600', 'bg-green-600');
    document.getElementById('btn-iniciar').classList.replace('hover:bg-red-500', 'hover:bg-green-500');
  }
}

// Init
window.onload = () => {
    selectAlgo('insertion');
    gerarCaixas();
};