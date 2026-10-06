// --- ESTADO GLOBAL ---
let caixas = [];
let algoAtivo = 'insertion';
let isRunning = false;
let abortController = null;
let numCaixas = 12;

// --- INTERFACE E CONTROLES ---
function selectAlgo(algo) {
  if (isRunning) return;
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

  atualizarCodigo();
}

function atualizarCodigo() {
  const p = document.getElementById('code-panel');
  if(algoAtivo === 'bubble') {
    p.innerHTML = `
      <div class="text-gray-500 italic mb-2">// Implementação Futura (Dupla)</div>
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
      <div class="text-gray-500 italic mb-2">// Implementação Futura (Dupla)</div>
      <div>função <span class="text-purple-400">MergeSort</span>(inicio, fim):</div>
      <div class="pl-4">se inicio < fim:</div>
      <div class="pl-8 text-gray-400">meio = (inicio + fim) / 2</div>
      <div class="pl-8 text-gray-400">MergeSort(inicio, meio)</div>
      <div class="pl-8 text-gray-400">MergeSort(meio + 1, fim)</div>
      <div id="code-cmp" class="pl-8 py-1 transition-colors">Merge(inicio, meio, fim)</div>
    `;
  } else {
    p.innerHTML = `
      <div class="text-gray-500 italic mb-2">// Implementação Futura (Dupla)</div>
      <div>para <span class="text-purple-400">dígito</span> (unid, dez, cent):</div>
      <div id="code-cmp" class="pl-4 py-1 transition-colors">distribuir nas baias</div>
      <div id="code-swap" class="pl-4 text-gray-400 italic transition-colors">recolher caixas das baias</div>
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
    if(id === 'code-swap') el.classList.add('text-gray-400');
  }
}

function logTerminal(msg) {
  document.getElementById('log-terminal').innerText = msg;
}

// --- GERAÇÃO DO GALPÃO ---
function gerarCaixas() {
  if (isRunning) return;
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
  caixas[i].el.classList.add('highlight-compare');
  if(j !== undefined) caixas[j].el.classList.add('highlight-compare');
  addMetrica('leituras', j !== undefined ? 2 : 1);
  logTerminal(`Lendo SKU: ${caixas[i].val} ${j !== undefined ? 'e '+caixas[j].val : ''}`);
  hlCode('code-cmp', true);
  
  await sleep();
  await checkAbort();
  
  hlCode('code-cmp', false);
  caixas[i].el.classList.remove('highlight-compare');
  if(j !== undefined) caixas[j].el.classList.remove('highlight-compare');
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

// --- CONTROLE PRINCIPAL ---
async function startSim() {
  if (isRunning) {
    abortController.abort();
    document.getElementById('btn-iniciar').innerText = "▶ INICIAR";
    document.getElementById('btn-iniciar').classList.replace('bg-red-600', 'bg-green-600');
    document.getElementById('btn-iniciar').classList.replace('hover:bg-red-500', 'hover:bg-green-500');
    isRunning = false;
    logTerminal("Simulação abortada.");
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

  try {
    if(algoAtivo === 'insertion') {
        await execInsertion(); 
        
        // Atualiza placar
        if(!abortController.signal.aborted) {
            document.getElementById('placar-insertion-tempo').innerText = document.getElementById('metric-tempo').innerText;
            document.getElementById('placar-insertion-custo').innerText = document.getElementById('metric-custo').innerText;
            document.getElementById('placar-insertion-leituras').innerText = metricas.leituras;
            document.getElementById('placar-insertion-movs').innerText = metricas.movs;
        }
    } else {
        logTerminal(`O algoritmo ${algoAtivo} será implementado futuramente pela dupla!`);
        await sleep(1000);
    }
    
    if(!abortController.signal.aborted && algoAtivo === 'insertion') {
      logTerminal("Ordenação concluída!");
      moveRobotPosition(0); // Volta pro começo
    }
  } catch (e) {
    if(e.message !== "Abortado") console.error(e);
  } finally {
    isRunning = false;
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
