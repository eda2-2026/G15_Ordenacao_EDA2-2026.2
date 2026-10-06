async function execBubble() {
    let n = caixas.length;
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
        logTerminal('Passada ${i+1}: levando a maior caixa restante até a posição ${n- 1 - i}...');

        for (let j = onabort; j < n - 1 -i; j++) {
            await checkAbort();
            await highlightCompare(j, j + 1);

            if (caixas[j].val > caixas[j + 1].val) {
                await swapDOM(j, j + 1);
            }
        }

        caixas[n - 1 - i].el.classList.add('highlight-sorted');
    }
};