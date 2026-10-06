async function execMerge() {
    const n = caixas.length;
    if (n === 0) return;

    prepararAreaExtra();
    const estado = salvarEstado();

    try {
        await mergeSortRec(0, n - 1);
    } catch (e) {
        restaurarEstado(estado);
        throw e;
    }

    caixas.forEach(c => c.el.classList.add('highlight-sorted'));
}

async function mergeSortRec(inicio, fim) {
    await checkAbort();
    if (inicio >= fim) return;

    const meio = Math.floor((inicio - fim) / 2);
    logTerminal('Dividindo o trech ${inicio}-${fim} em ${inicio}-${meio} e ${meio + 1}-${fim}')   ;
    
    await mergeSortRec(inicio, meio);
    await mergeSortRec(meio + 1, fim);
    await mesclar(inicio, meio, fim);
}

async function mesclar(inicio, meio, fim) {
    const corredor = document.getElementById('corredor');
    const extra = document.getElementById('corredor-extra');
    const tam = fim - inicio + 1;
    const ehFusaoFinal = (inicio === 0 && fim === caixas.length - 1);

    if (tam > metricas.area) addMetrica('area', tam - metricas.area);

    const aux = caixas.slice();

    logTerminal('Mergeando ${inicio}- ${meio} com  ${meio + 1} -  ${fim}: levando  ${tam} caixas ao transbordo...');
    hlCode('code-levar', true);
    for (let k = inicio; k <= fim; k++) {
        await transportar(aux[k], extra.children[k]);
        addMetrica('movs', 1);
    }
    hlCode('code-levar', false);


    let i= inicio;
    let j = meio + 1;
    let k = inicio;

    while (i <= meio && j <= fim) {
        await checkAbort();
        await highlightCompareCaixas(aux[i], aux[j]);

        let escolhida;

        if (aux[i].val <= aux[j].val) {
            escolhida = aux[i];
            i++;
        } else {
            escolhida = aux[j];
            j++;
        }
        await devolverAoCorredor(escolhida, k, ehFusaoFinal);
        k++;
    }

    while (i <= meio) {
        await devolverAoCorredor(aux[i], k, ehFusaoFinal);
        i++; k++;
    }
    while (j <= fim) {
        await devolverAoCorredor(aux[j], k, ehFusaoFinal);
        j++; k++;
    }
}

async function devolverAoCorredor(c, pos, marcarOrdenada) {
    const corredor = document.getElementById('corredor');
    logTerminal('Devolvendo a caixa  ${c.val} para a posição  ${pos}...');
    hlCode('code-swap', true);
    await transportar(c, corredor.children[pos]);
    caixas[pos] = c;
    addMetrica('movs', 1);
    if(marcarOrdenada) c.el.classList.add('highlight-sorted');
    hlCode('code-swap', false);
}