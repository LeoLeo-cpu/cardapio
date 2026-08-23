# Lista de Compras Automática

## Contexto

Cada prato tem um campo de ingredientes editável no `DishModal.jsx` (lista de
strings livres, tipo `{ id, text, done }`), mas hoje esses ingredientes não se
conectam a nada — a Lista de Compras (`ShoppingList.jsx`) só é preenchida
manualmente pelo usuário, item por item. O objetivo é fechar esse ciclo: um
botão que junta os ingredientes de todos os pratos da semana e os adiciona à
lista de compras.

## Decisões

- **Escopo dos ingredientes:** semana inteira (`weeklyData` completo — todos
  os 7 dias, todas as refeições), independente do modo de visualização atual
  ("Foco do Dia" ou "Semana Completa").
- **Comportamento ao gerar:** mesclar sem duplicar. Itens já presentes na
  lista de compras (comparando texto, case-insensitive, trim) não são
  duplicados; itens novos são anexados ao final. Nada é removido ou
  substituído.
- **Local do botão:** no cabeçalho do card "Lista de compras"
  (`ShoppingList.jsx`), ao lado do botão "+" já existente.

## Design

### Fonte dos dados

Estrutura existente de `weeklyData` (definida em `App.jsx`):

```
{
  [dayId]: {
    [mealId]: {
      dishes: [
        { id, name, ingredients: [{ id, text, done }] | '', calories, proteins, carbs, fats, done }
      ]
    }
  }
}
```

Nota: pratos recém-criados via `addDish` começam com `ingredients: ''`
(string vazia), não um array — só viram array quando o usuário abre o
`DishModal` e adiciona pelo menos um ingrediente. O gerador precisa tratar
esse caso sem quebrar.

### Nova função em `App.jsx`

```js
const generateShoppingList = () => {
  const existingTexts = new Set(
    shopping.map(item => (item.text || '').trim().toLowerCase())
  );
  const newTexts = new Set();

  Object.values(weeklyData).forEach(dayData => {
    Object.values(dayData).forEach(mealData => {
      (mealData.dishes || []).forEach(dish => {
        const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
        ingredients.forEach(ing => {
          const normalized = (ing.text || '').trim();
          if (!normalized) return;
          const key = normalized.toLowerCase();
          if (!existingTexts.has(key) && !newTexts.has(key)) {
            newTexts.add(key);
          }
        });
      });
    });
  });

  if (newTexts.size === 0) return;

  const newItems = [...newTexts].map((key, i) => ({
    id: `${Date.now()}-${i}`,
    text: key,
    done: false
  }));

  setShopping(prev => [...prev, ...newItems]);
};
```

Note: o texto salvo no novo item é a versão normalizada (trim, lowercase) —
ver "Fora de escopo" abaixo sobre preservar capitalização original.

### Fluxo de dados (props)

```
App.jsx (generateShoppingList)
  -> ShoppingList.jsx (recebe e chama no clique do botão)
```

Nenhum outro componente é tocado.

### UI: botão no cabeçalho da Lista de Compras

Em `ShoppingList.jsx`, ao lado do botão "+" existente (mesmo estilo
`btn btn-icon btn-ghost`), um novo botão com ícone (ex: "sparkles"/varinha do
`lucide-react`, já usado em `StickerPad.jsx`) e `title="Gerar lista da
semana"`, que chama a prop `generateShoppingList` no `onClick`.

## Fora de escopo

- Quantidades estruturadas (o campo de ingrediente é texto livre, sem
  quantidade/unidade separada).
- Remover itens da lista de compras.
- Alterar `DishModal.jsx`, `PratoRow.jsx`, `DayCard.jsx`, `WeeklyGrid.jsx`.
- Preservar a capitalização original do texto do ingrediente (a versão salva
  é normalizada em minúsculas, para simplificar a deduplicação — trade-off
  aceito pelo escopo pequeno desta feature).

## Verificação manual

1. Adicionar um prato em qualquer dia/refeição, abrir seu modal de detalhes,
   adicionar 2-3 ingredientes (ex: "Arroz", "Feijão", "Frango").
2. Clicar no botão de gerar lista no card "Lista de compras" — os 3
   ingredientes devem aparecer como novos itens.
3. Adicionar outro prato com um ingrediente repetido (ex: "arroz", minúsculo)
   e outro novo (ex: "Tomate"). Clicar em gerar novamente — só "Tomate" deve
   ser adicionado; "arroz" não deve duplicar.
4. Marcar um item da lista de compras como comprado (`done: true`), clicar em
   gerar de novo sem mudar nada nos pratos — o item marcado deve continuar
   como estava (não reseta `done`, não duplica).
5. Adicionar um item manualmente na lista de compras (ex: "Papel
   higiênico"), clicar em gerar — o item manual deve permanecer intacto.
6. Com a lista de compras vazia e nenhum prato com ingredientes, clicar em
   gerar — nada deve acontecer (sem erro, sem item vazio).
