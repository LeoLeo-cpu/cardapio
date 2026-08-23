# Calorias e Macros por Refeição

## Contexto

Hoje calorias/proteínas/carboidratos/gorduras são editados por PRATO, no
`DishModal.jsx` — cada prato dentro de uma refeição tem seus próprios valores,
e `DayCard.jsx`/`NutritionDashboard.jsx`/`App.jsx` somam os valores de todos
os pratos para chegar nos totais do dia/semana. O objetivo é mover esses
campos para o nível da REFEIÇÃO: um único conjunto de kcal/P/C/G por
refeição (Café, Almoço, etc.), independente de quantos pratos ela tenha.

## Decisões

- **Escopo:** calorias/macros são um valor único por refeição, não mais por
  prato. Ingredientes continuam por prato (inalterado).
- **Local de edição:** clicar no cabeçalho da refeição (ex: "Almoço") abre um
  modal centralizado (mesmo padrão visual do `DishModal` atual — via
  `createPortal`, `glass-panel`) só com os 4 campos numéricos.
- **`DishModal.jsx`:** perde a seção "INFORMAÇÕES NUTRICIONAIS" — fica só
  nome e ingredientes.
- **Dados existentes:** sem migração. Valores de macro já salvos em pratos
  (ex: "Ovo com Pão Integral", 300kcal/20g/30g/15g) ficam órfãos — não são
  lidos, não são somados, e cada refeição começa zerada.

## Design

### Modelo de dados

`weeklyData[dayId][mealId]` ganha 4 campos novos, irmãos de `dishes`:

```js
{
  dishes: [...],       // inalterado (name, ingredients, done — sem mais calories/proteins/carbs/fats)
  calories: number,    // novo, default 0 quando ausente
  proteins: number,
  carbs: number,
  fats: number
}
```

### Novo componente: `MealMacrosModal.jsx`

Estrutura análoga ao `DishModal.jsx` atual, mas sem nome/ingredientes — só o
bloco de 4 inputs numéricos. Props: `mealName` (string, para o título, ex.
"Macros — Almoço"), `macros` (`{ calories, proteins, carbs, fats }`),
`onClose`, `onSave(patch)`. Renderizado via `createPortal(..., document.body)`
com `zIndex: 9999`, mesmo padrão anti-bug de z-index já usado em `DishModal`
e `SubstitutionModal`.

### `DayCard.jsx`

- Novo estado `activeMealMacros` (id da refeição sendo editada), análogo ao
  `activeDish` já existente.
- O cabeçalho de cada refeição (ícone + nome) vira clicável, abrindo
  `MealMacrosModal` para aquele `meal.id`.
- Um badge de kcal aparece ao lado do nome da refeição quando
  `mealData.calories > 0` — mesmo estilo visual do badge de total do dia que
  já existe no cabeçalho do `DayCard`.
- `totalCalories` (usado no badge do dia) passa a somar `data[meal.id]?.calories`
  diretamente por refeição, em vez de somar `dish.calories` de cada prato.

### `NutritionDashboard.jsx`

A soma de `totalCals`/`totalP`/`totalC`/`totalF` passa a iterar as refeições
de `dailyDishes` (prop já recebida, hoje é `dayData`) e somar os campos
`calories`/`proteins`/`carbs`/`fats` de cada `mealData` diretamente — sem
mais iterar `mealData.dishes`.

### `App.jsx`

- Nova ação `updateMealMacros(dayId, mealId, patch)`, seguindo o mesmo
  padrão de `updateDish`/`updateGoal` (merge parcial no estado
  `weeklyData[dayId][mealId]`, criando a entrada se ainda não existir).
- `calculateWeeklyCalories` (usada no badge "Total: X kcal" do cabeçalho do
  app) passa a somar `mealData.calories` por refeição, em vez de somar
  `dish.calories` por prato.
- `addDish`: o objeto de prato padrão deixa de incluir `calories`,
  `proteins`, `carbs`, `fats` (só `id`, `name`, `ingredients`, `done`).

### `DishModal.jsx`

Remove inteiramente o bloco `<label>INFORMAÇÕES NUTRICIONAIS</label>` e os 4
inputs associados. Fica: nome do prato + ingredientes.

### `PratoRow.jsx`

Remove o badge `{dish.calories && <span>...kcal</span>}` — o prato não
carrega mais essa informação.

## Fora de escopo

- Migração de dados antigos de macro por prato.
- Alterar `WeeklyGrid.jsx` (não referencia macros diretamente, só repassa
  props ao `DayCard`).
- Alterar `ShoppingList.jsx`/`generateShoppingList` (ingredientes continuam
  por prato, função não muda).
- Metas diárias customizáveis (`goals` em `App.jsx`/`NutritionDashboard.jsx`)
  — continuam funcionando como estão, comparando contra os novos totais
  agregados por refeição.

## Verificação manual

1. Abrir "Foco do Dia", clicar no cabeçalho de "Café da manhã" — deve abrir
   o `MealMacrosModal` com os 4 campos zerados (sem migração).
2. Preencher kcal=400, P=20, C=50, G=10, salvar. O cabeçalho da refeição deve
   mostrar um badge "400 kcal"; o Dashboard Nutricional (coluna direita) deve
   mostrar 400/2500kcal, 20/150g, 50/200g, 10/65g (ou os valores de meta que
   estiverem salvos).
3. Adicionar um prato dentro dessa refeição, abrir seu modal de detalhes —
   não deve haver mais campos de calorias/macros, só nome e ingredientes.
4. Adicionar uma segunda refeição com macros (ex: Almoço, 600kcal) — o total
   do dia (badge no cabeçalho do `DayCard`) deve mostrar 1000kcal (soma das
   duas refeições); o badge "Total: X kcal" no topo do app também deve
   refletir a soma.
5. Recarregar a página — os valores de macro por refeição devem persistir
   (localStorage, mesma chave `cardapio_semanal_data_v2` já existente, sem
   mudança de chave).
6. Confirmar que o prato "Ovo com Pão Integral" (criado antes desta mudança,
   com 300kcal salvos no nível do prato) não contribui mais para nenhum
   total — os totais vêm exclusivamente dos valores preenchidos no nível da
   refeição.
