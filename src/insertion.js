async function execInsertion() {
  let n = caixas.length;
  if(n === 0) return;

  const estado = salvarEstado();

  try {
    caixas[0].el.classList.add('highlight-sorted');

    for (let i = 1; i < n; i++) {
      let j = i;

      hlStep(1);
      // Mostra qual é o pivô atual (visualmente)
      logTerminal(`Avaliando caixa ${caixas[i].val} (posição ${i})...`);
      caixas[i].el.classList.add('highlight-compare');
      await sleep();
      await checkAbort();
      caixas[i].el.classList.remove('highlight-compare');

      while (j > 0) {
        await checkAbort();
        hlStep(2);
        await highlightCompare(j - 1, j);

        if (caixas[j - 1].val > caixas[j].val) {
          hlStep(3);
          await swapDOM(j - 1, j);
          j--;
        } else {
          break; // A caixa encontrou seu lugar
        }
      }

      hlStep(4);
      // Atualiza a marcação de ordenado até o 'i' atual
      for (let k = 0; k <= i; k++) {
        caixas[k].el.classList.add('highlight-sorted');
      }
    }
    hlStep(0);
  } catch (e) {
    hlStep(0);
    restaurarEstado(estado); // abortou no meio: restaura galpão original
    throw e;
  }
}
