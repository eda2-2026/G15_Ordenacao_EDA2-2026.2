async function execBubble() {
  let n = caixas.length;
  if(n === 0) return;

  // Sem parada antecipada (como descrito no README): sempre faz as n passadas
  for (let i = 0; i < n; i++) {
    logTerminal(`Passada ${i + 1}: levando a maior caixa restante até a posição ${n - 1 - i}...`);

    for (let j = 0; j < n - i - 1; j++) {
      await checkAbort();
      await highlightCompare(j, j + 1);

      // Estável: só troca quando a da esquerda é ESTRITAMENTE maior
      if (caixas[j].val > caixas[j + 1].val) {
        await swapDOM(j, j + 1);
      }
    }

    // A última posição da passada já está definitiva
    caixas[n - 1 - i].el.classList.add('highlight-sorted');
  }
}