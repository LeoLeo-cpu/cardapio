# Nova Lista de Refeições + Bebidas por Refeição

## Contexto

A lista de refeições hoje (`MEALS_CONFIG` em `DayCard.jsx`) tem 6 itens: Café
da manhã, Almoço, Lanche, Jantar, Sobremesa, Bebidas — cada um como uma
seção própria de pratos. O objetivo é reduzir para 5 refeições numa ordem
diferente, com dois lanches distintos, e mover "Bebidas" de seção
independente para uma sub-lista dentro de cada uma das 5 refeições.

## Decisões

- **Nova lista de refeições, nesta ordem:** Café da manhã, Lanche da manhã,
  Almoço, Lanche da tarde, Jantar. "Sobremesa" deixa de existir. A antiga
  seção "Bebidas" (como refeição própria) também deixa de existir.
- **Bebidas por refeição:** cada uma das 5 refeições ganha uma segunda
  lista, "Bebidas", com o mesmo formato de item que um prato
  (`{id, name, ingredients, done}`), botão "+" próprio, reaproveitando
  `PratoRow` (linha) e `DishModal` (edição de nome/ingredientes) sem
  modificá-los.
- **Sem drag & drop para bebidas:** bebidas não são arrastáveis entre
  refeições/dias (diferente de pratos, que continuam arrastáveis).
- **Macros:** o conjunto único de calorias/macros por refeição (já existente
  desde a feature anterior) cobre pratos E bebidas daquela refeição em
  conjunto — não há macros separados por bebida.
- **Lista de compras:** `generateShoppingList` passa a escanear ingredientes
  de `dishes` E `drinks` de cada refeição.
- **Sem migração:** pratos que estavam em "Sobremesa" ou na antiga seção
  "Bebidas" ficam órfãos — não há tentativa de mover esses dados para o novo
  formato. Consistente com a política já adotada nas mudanças anteriores
  (metas, macros por refeição).

## Design

### `MEALS_CONFIG` (`DayCard.jsx`)

Substitui a lista atual por 5 entradas:

```js
const MEALS_CONFIG = [
  { id: 'breakfast', name: 'Café da manhã', ... },
  { id: 'morning_snack', name: 'Lanche da manhã', ... },
  { id: 'lunch', name: 'Almoço', ... },
  { id: 'afternoon_snack', name: 'Lanche da tarde', ... },
  { id: 'dinner', name: 'Jantar', ... },
];
```

Reaproveita os ícones/cores já existentes (café, lanche, almoço, jantar);
o segundo lanche reusa o mesmo ícone/estilo visual do primeiro. O
`showDessertDrinks` prop/lógica em `DayCard.jsx`/`TodayView.jsx` é removido
por completo — não faz mais sentido, já que "dessert"/"drinks" não existem
mais como ids de refeição.

### Modelo de dados

`weeklyData[dayId][mealId]` ganha um campo novo, irmão de `dishes`:

```js
{
  dishes: [...],        // inalterado
  drinks: [...],         // novo — mesmo formato de dishes
  calories, proteins, carbs, fats   // inalterado (já existente)
}
```

### `App.jsx` — generalização das ações de CRUD

Extrai três helpers internos parametrizados por `listKey` (`'dishes'` ou
`'drinks'`):

```js
const addListItem = (dayId, mealId, listKey, item) => { /* mesma lógica de addDish hoje, generalizada */ };
const updateListItem = (dayId, mealId, listKey, itemId, patch) => { /* idem updateDish */ };
const removeListItem = (dayId, mealId, listKey, itemId) => { /* idem removeDish */ };
```

`addDish`/`updateDish`/`removeDish` viram wrappers finos chamando os
helpers com `listKey: 'dishes'` — **assinatura idêntica à atual**, nenhum
call site em `DayCard.jsx`/`WeeklyGrid.jsx`/`TodayView.jsx` precisa mudar
para pratos. `moveDish` não muda (drinks não usam essa função).

Três novas funções espelhando as de prato: `addDrink`, `updateDrink`,
`removeDrink` (sem `moveDrink`).

`generateShoppingList` passa a iterar tanto `mealData.dishes` quanto
`mealData.drinks` ao coletar ingredientes.

`calculateWeeklyCalories` não muda (já soma por refeição, não por prato —
feature anterior).

### `DayCard.jsx` — UI

Dentro de cada seção de refeição, depois da lista de pratos existente, uma
nova sub-seção "Bebidas": um cabeçalho pequeno com label "Bebidas" e um
botão "+" (mesmo estilo do "+" de pratos, só menor/mais discreto), seguido
da lista de bebidas renderizada com `PratoRow` (mesmo componente,
inalterado), usando `updateDrink`/`removeDrink` no lugar de
`updateDish`/`removeDish`. Bebidas vazias mostram "nenhuma bebida ainda"
(mesmo padrão do "nenhum prato ainda").

O estado `activeDish` (usado para abrir o `DishModal`) ganha um campo
`listKey` (`'dishes'` ou `'drinks'`) para saber, ao salvar, se chama
`updateDish` ou `updateDrink`.

## Fora de escopo

- Migração de dados de "Sobremesa"/antiga "Bebidas" para o novo formato.
- Drag & drop de bebidas.
- Macros separados por bebida.
- Alterar `PratoRow.jsx`, `DishModal.jsx`, `MealMacrosModal.jsx`,
  `NutritionDashboard.jsx` (não referenciam a lista de refeições
  diretamente).

## Verificação manual

1. Abrir "Foco do Dia" — confirmar que aparecem exatamente 5 refeições, na
   ordem: Café da manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar.
   Nenhuma "Sobremesa" ou seção "Bebidas" separada.
2. Dentro de "Café da manhã", confirmar uma sub-seção "Bebidas" com botão
   "+" próprio, abaixo da lista de pratos.
3. Adicionar uma bebida, abrir seu modal (mesmo modal de prato), definir
   nome e um ingrediente, salvar — confirmar que aparece na lista de
   bebidas daquela refeição, não na de pratos.
4. Clicar em "Gerar lista da semana" — confirmar que o ingrediente da
   bebida aparece na lista de compras.
5. Remover a bebida — confirmar que some da lista de bebidas sem afetar os
   pratos da mesma refeição.
6. Tentar arrastar uma bebida (drag) — confirmar que não é arrastável
   (sem handle de arraste, diferente do prato).
7. Recarregar a página — confirmar que a bebida persiste.
8. Conferir "Semana Completa" — mesma estrutura de 5 refeições + bebidas em
   cada dia.
