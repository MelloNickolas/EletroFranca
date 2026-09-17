# Pasta de trabalhos (feed estilo Instagram)

Coloque aqui as fotos dos serviços realizados (formato `.jpg`, `.jpeg`, `.png` ou `.webp`, de preferência quadradas, mínimo 800x800px).

## Como adicionar uma foto no feed

1. Copie o arquivo de imagem para esta pasta, ex: `trabalhos/quadro-eletrico-01.jpg`.
2. Abra `js/main.js` e adicione uma linha no array `WORK_ITEMS`, no topo do arquivo:

```js
const WORK_ITEMS = [
  { file: "quadro-eletrico-01.jpg", title: "Troca de quadro elétrico", tag: "Instalação" },
  { file: "automacao-sala-02.jpg", title: "Automação de iluminação", tag: "Automação" },
];
```

3. Salve e recarregue o site — o card entra automaticamente no grid, com hover, lightbox (clique para ampliar) e todas as animações já configuradas.

Enquanto o array estiver vazio ou tiver poucos itens, o restante do grid mostra cards "Em breve" para o layout não ficar quebrado — pode adicionar quantas fotos quiser, o grid se ajusta sozinho.
