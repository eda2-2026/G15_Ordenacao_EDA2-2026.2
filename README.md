# G15_Ordenacao_EDA2-2026.2
Repositório destinado ao trabalho 2 da matéria Estrutura de Dados 2, semestre 2026.2.

# Simulador de *Algoritmos de Ordenação* do estoque de um galpão fictício

Simulador que mostra, passo a passo, como diferentes algoritmos de ordenação organizam o estoque de um galpão bagunçado, e compara o que cada um gasta em leituras, movimentações, espaço extra, tempo e custo.

**Link do simulador (GitHub Pages):** _colar aqui o link depois do deploy_

## Vídeo da apresentação

_Colar aqui o link do vídeo (YouTube, Drive ou outro)._

## O problema
 
A **LogiMax Distribuição** (empresa fictícia) é um centro de distribuição fictício. Ela recebe carga de vários fornecedores todos os dias e guarda cada caixa no primeiro espaço livre que aparece. Com o tempo ninguém sabe mais onde está cada produto: o robô leva em média *40 minutos para localizar um item*, os pedidos atrasam há retrabalho e os robôs gastam mais energia e passam mais vezes por manutenção.

A diretoria quer o estoque ordenado pelo **código do produto (SKU)** e precisa escolher **qual algoritmo colocar nos robôs**.

## Objetivo da equipe

Simular os algoritmos e descobrir qual deles se encaixa melhor em cada cenário do galpão: a prateleira de expedição que já está quase organizada, o estoque geral totalmente bagunçado e o catálogo de SKUs numéricos. A comparação usa as mesmas medidas para todos (leituras, movimentações, espaço extra, tempo e custo), para que a escolha tenha números por trás.

## Do algoritmo ao galpão

| Conceito | No galpão |
|---|---|
| Elemento do vetor | Caixa com um SKU |
| Comparação | Leitura do código de barras de duas caixas |
| Troca ou movimentação | A garra ou o robô movendo uma caixa |
| Memória auxiliar | Área de transbordo, um espaço extra no chão |
| Estabilidade | Caixas com o mesmo SKU não trocam de lugar entre si |
| Entrada quase ordenada | Prateleira que já estava em ordem e recebeu poucas caixas novas |

## Algoritmos simulados

**Insertion Sort**
- Setor: prateleira de expedição, com cerca de 50 itens, quase em ordem.
- Por que aqui: cada caixa nova é encaixada no seu lugar, e se quase tudo já está em ordem sobra pouco para mover. Não precisa de espaço extra.
- Limite: no pior caso faz O(n²), então não serve para o galpão inteiro.

**Merge Sort (recursivo)**
- Setor: estoque geral, com muitos itens em qualquer ordem.
- Por que aqui: divide o corredor em trechos, ordena cada um e funde os trechos usando a área de transbordo. O tempo é O(n log n) mesmo no pior caso.
- Limite: precisa de espaço extra proporcional ao trecho que está sendo fundido.

**Radix Sort LSD**
- Setor: catálogo com SKUs numéricos de tamanho fixo (no simulador, 3 dígitos).
- Por que aqui: não compara caixas entre si. Em cada passada distribui as caixas em 10 baias pelo dígito (unidades, dezenas, centenas) e recolhe as baias na ordem de 0 a 9.
- Limite: só serve para chaves que podem ser separadas em dígitos e precisa de baias extras.

**Bubble Sort (sistema atual, usado como referência)**
- Compara e troca apenas caixas vizinhas. É o ponto de partida para medir o quanto os outros três melhoram.

## Por que todos os algoritmos são estáveis

Um algoritmo é estável quando, entre elementos iguais, mantém a ordem em que eles já estavam. No estoque, vários pallets podem ter o mesmo SKU. Se o algoritmo trocasse essas caixas de lugar, o robô gastaria movimentações (tempo, energia e desgaste) sem que o resultado ficasse mais ordenado, já que as caixas são iguais para o critério de ordenação. Escolhendo só algoritmos estáveis, esses movimentos desnecessários não acontecem.

Como cada um garante isso na implementação do simulador:

- **Bubble:** só troca quando a caixa da esquerda é estritamente maior que a da direita.
- **Insertion:** só desloca uma caixa quando ela é estritamente maior que a que está sendo encaixada.
- **Merge:** em caso de empate na fusão, leva primeiro a caixa do trecho da esquerda (comparação `<=`).
- **Radix LSD:** cada baia funciona como uma fila, então as caixas saem na ordem em que entraram, e isso se mantém a cada passada.

Por esse motivo, Quick Sort, Heap Sort e Selection Sort, nas versões usuais, ficaram de fora desta comparação, porque podem trocar caixas iguais de posição.

## Modelo de custo e tempo

```
Custo = leituras x custo_leitura + movimentações x custo_movimento + pallets de área extra x custo_área
Tempo = leituras x tempo_leitura + movimentações x tempo_movimento
```

Os valores abaixo são hipotéticos e ficam no objeto `C`, no início do script do simulador, para serem trocados facilmente.

| Parâmetro | Custo | Tempo |
|---|---|---|
| Leitura de código | R$ 0,01 | 0,5 s |
| Movimentação de caixa | R$ 0,50 | 2 s |
| Pallet de área extra | R$ 2,00 | não se aplica |

Como as operações são contadas:

- **Bubble:** cada troca conta como 2 movimentações.
- **Insertion:** cada deslocamento conta 1 movimentação, mais 1 para encaixar a caixa.
- **Merge:** levar ao transbordo e devolver ao corredor contam como movimentações. A área extra é o maior trecho fundido.
- **Radix:** ler um dígito conta como 1 leitura. Distribuir nas baias e recolher contam como movimentações. A área extra é o total de caixas.

## Complexidade

| Algoritmo | Melhor | Médio | Pior | Espaço extra | Estável |
|---|---|---|---|---|---|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Sim |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Sim |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Sim |
| Radix LSD | O(d·(n+k)) | O(d·(n+k)) | O(d·(n+k)) | O(n+k) | Sim |

No simulador o Bubble roda sem parada antecipada, por isso o melhor caso dele não aparece.

## Como usar o simulador

1. Escolha o algoritmo nos botões: **Bubble Sort**, **Insertion Sort**, **Merge Sort** ou **Radix LSD**.
2. Escolha o cenário inicial: **Aleatório**, **Quase Ordenado** ou **Ordem Inversa**, e clique em **Novo galpão**.
3. Use o botão **▶ Iniciar** (que se torna **◼ Parar** durante a execução), controle o ritmo na barra de **Velocidade** e gere novas configurações com **Novo galpão**.
4. Acompanhe a lógica em tempo real: o código sendo executado, a mensagem do robô no terminal, os contadores de métricas e a prateleira. O Merge exibe a área de transbordo e o Radix apresenta as 10 baias.
5. Ao concluir, confira as métricas registradas na rodada e atualizadas na tabela do placar de desempenho.

## Como rodar o projeto

Por se tratar de uma aplicação web estática (HTML, CSS e JavaScript), não há necessidade de compilação ou instalação de dependências.

### 1. Execução local
- **Opção rápida:** Abra o arquivo `index.html` diretamente no seu navegador.
- **Opção com servidor HTTP local:**
  ```bash
  python3 -m http.server 8000
  ```
  Depois, acesse no navegador: `http://localhost:8000`.

### 2. Deploy no GitHub Pages
1. No repositório no GitHub, vá em **Settings** > **Pages**.
2. Em **Source**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, e salve.
3. O simulador fica imediatamente disponível na URL raiz do Pages: `https://<usuario>.github.io/<repositorio>/`.

## Estrutura do projeto

```
G15_Ordenacao_EDA2-2026.2/
├── README.md                   # Documentação do projeto
├── index.html                  # Interface visual da aplicação (HTML/CSS)
├── docs/
│   └── img/                    # Capturas de tela e imagens da interface
└── src/                        # Funções e módulos JavaScript dos algoritmos
    ├── app.js                  # Controle central da interface, robô e estado
    ├── calculo.js              # Modelo de cálculo de métricas (custo e tempo)
    ├── bubblesort.js           # Implementação do Bubble Sort
    ├── insertion.js            # Implementação do Insertion Sort
    ├── mergesort.js            # Implementação do Merge Sort
    └── radixlsd.js             # Implementação do Radix Sort LSD
```

## Testes

_Registrar aqui os testes feitos no simulador. Modelo sugerido:_

| Cenário | Tamanho | Algoritmo | O que verificar | Resultado | Ok? |
|---|---|---|---|---|---|
| Aleatório | 15 | Todos | Corredor termina em ordem crescente | Conforme esperado | Sim |
| Quase ordenado | 15 | Insertion | Poucas movimentações em relação ao Bubble | Conforme esperado | Sim |
| Ordem inversa | 15 | Insertion | Pior caso: muitas leituras e movimentações | Conforme esperado | Sim |
| Qualquer | 15 | Radix LSD | Passadas de unidades, dezenas e centenas, com as 10 baias | Conforme esperado | Sim |
| Qualquer | 15 | Merge | Transbordo enche e esvazia a cada fusão | Conforme esperado | Sim |
| Qualquer | 15 | Todos | Valores repetidos continuam na mesma ordem relativa (estabilidade) | Conforme esperado | Sim |

## Prints da interface

_Adicionar os prints tirados da versão publicada no Pages, por exemplo em `docs/img/`._

| Tela | Print |
|---|---|
| Visão geral com o corredor e o código | `![visão geral](docs/img/visao-geral.png)` |
| Insertion Sort com a garra segurando a caixa | `![insertion](docs/img/insertion.png)` |
| Merge Sort com a área de transbordo | `![merge](docs/img/merge.png)` |
| Radix LSD com as 10 baias | `![radix](docs/img/radix.png)` |
| Placar com 1.000 caixas | `![placar](docs/img/placar.png)` |


## Equipe

<div align="center">

| [<img src="https://res.cloudinary.com/dll5ypaj7/image/fetch/f_auto,w_250,h_250,c_fill,r_30,bo_2px_solid_rgb:2d333b/https://github.com/eduarda-ogomes.png" width="200">](https://github.com/eduarda-ogomes)<br><nobr><sub style="font-size: 160%;">Maria Eduarda de Oliveira</sub></nobr> | [<img src="https://res.cloudinary.com/dll5ypaj7/image/fetch/f_auto,w_250,h_250,c_fill,r_30,bo_2px_solid_rgb:2d333b/https://github.com/pwdrinho.png" width="200">](https://github.com/pwdrinho)<br><nobr><sub style="font-size: 160%;">Pedro Lucas Barbosa</sub></nobr> |
| :---: | :---: |
| 242028842 | 241025710 |

</div>

---
