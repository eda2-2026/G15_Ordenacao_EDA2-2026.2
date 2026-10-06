const DIGITOS_SKU = 3;
const NOMES_DIGITO = ['unidades', 'dezenas', 'centenas'];

async function execRadix() {
    const n = caixas.length;
    if (n == 0) return;

    prepararAreaExtra();
    const estado = salvarEstado();
    const corredor = document.getElementById('corredor');

    addMetrica('area', n);

    const baias = [];
    for (let b = 0; b < 10; b++) baias.push([]);

    try {
        let exp = 1;
        for (let d = 0; d < DIGITOS_SKU; d++) {
            const nome = NOMES_DIGITO[d];
            const ultimaPassada = (d === DIGITOS_SKU - 1);

            for (let i = 0; i < n; i++) {
                await checkAbort();
                const c = caixas[i];
                const dig = await lerDigito(c, d, exp, nome);

                logTerminal('Passada ${d + 1}/${DIGITOS_SKU}: levando ${c.val} para a baia ${dig}...');
                hlCode('code-dist', true);
                const slot = criarSlotBaia(dig);
                await transportar(c, slot, { redimensionar: el => el.classList.add('box-mini') });
                addMetrica('movs', 1);
                hlCode('code-dist', false);

                baias[dig].push(c);
                caixas[i] = null;
            }

            logTerminal('Recolhendo as baias de 0 a 9 (${nome} ordenadas)...');
            let k = 0;
            for (let b = 0; b < 10; b++) {
                for (let q = 0; q < baias[b].length; q++) {
                    const c = baias[b][q];
                    hlCode('code-swap', true);
                    await transportar(c, corredor.children[k], {
                        origemSemSlot: true,
                        redimensionar: el => el.classList.remove('box-mini')
                    });
                    addMetrica('movs', 1);
                    hlCode('code-swap', false);

                    caixas[k] = c;
                    if (ultimaPassada) c.el.classList.add('highlight-sorted');
                    k++;
                }
                baias[b].length = 0
            }

            exp = exp * 10;
        }
    } catch (e) {
        restaurarEstado(estado);
        throw e;
    }
}

async function lerDigito(c, d, exp, nome) {
    const dig = Math.floor(c.val / exp) % 10;
    const txt = String(c.val);
    const pos = txt.length - 1 - d;

    c.el.innerHTML = txt.slice(0, pos) + '<span class="digito-ativo">${txt[pos]}</span>' + txt.slice(pos + 1);
    c.el.classList.add('highlight-compare');
    addMetrica('leituras', 1);
    logTerminal('Lendo ${nome} do SKU ${c.val}: dígito ${dig}');
    hlCode('code-cmp', true);

    await sleep();
    await checkAbort();

    hlCode('code-cmp', false);
    c.el.classList.remove('highlight-compare');
    c.el.innerText = c.val;
    return dig;
}