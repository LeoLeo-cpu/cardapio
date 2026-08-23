# Metas Diárias Customizáveis

## Contexto

O `NutritionDashboard.jsx` calcula e exibe o progresso do dia (calorias, proteínas,
carboidratos, gorduras) contra metas fixas, hardcoded no componente:

```js
const goals = { cals: 2000, p: 150, c: 200, f: 65 };
```

Isso torna o dashboard genérico demais — cada pessoa tem necessidades calóricas e de
macros diferentes. O objetivo é permitir que o usuário edite essas metas diretamente
na interface, sem abrir telas extras.

## Decisões

- **Local de edição:** inline, clicando direto no número da meta (ex: "2000" em
  "300 / 2000kcal"). Sem botão de engrenagem nem modal separado — segue o mesmo
  padrão de edição inline já usado em `EditableText.jsx` para o título da semana.
- **Escopo:** uma única meta global (não por dia da semana). Vale igualmente para
  qualquer dia visualizado no "Foco do Dia".

## Design

### Estado e persistência

Novo estado em `App.jsx`:

```js
const [goals, setGoals] = useState({ cals: 2000, p: 150, c: 200, f: 65 });
```

Nova chave de storage, seguindo o padrão existente (`STORAGE_KEY_DATA`,
`STORAGE_KEY_SHOPPING`, etc.):

```js
const STORAGE_KEY_GOALS = 'cardapio_semanal_goals_v1';
```

Carregado/salvo nos mesmos `useEffect`s de load/save que já existem, junto com
`weeklyData`, `shopping`, `stickers`, `weekLabel`.

Nova função de atualização, no mesmo estilo de `updateShoppingItem`:

```js
const updateGoal = (field, value) => {
  setGoals(prev => ({ ...prev, [field]: value }));
};
```

### Fluxo de dados (props)

```
App.jsx (goals, updateGoal)
  -> TodayView.jsx (repassa)
    -> NutritionDashboard.jsx (goals, updateGoal)
```

`WeeklyGrid`, `DayCard`, `PratoRow`, `DishModal` não são tocados — a mudança fica
isolada em `App.jsx`, `TodayView.jsx` e `NutritionDashboard.jsx`.

### UI: número editável

Dentro de `renderProgressBar` em `NutritionDashboard.jsx`, o trecho que hoje mostra
`{current} / {goal}{unit}` como texto estático vira: `{current} /` seguido de um
número clicável. Ao clicar, o número vira um `<input type="number">` inline (mesmo
tamanho de fonte/cor do texto original, sem borda visível até o foco), autofocado e
selecionado. Ao perder o foco (`onBlur`) ou pressionar Enter, salva via `updateGoal`
e volta a ser texto; ao pressionar Escape, cancela sem salvar.

### Validação

- Valor deve ser um número positivo (`> 0`).
- Se o campo ficar vazio ou inválido no blur, reverte para o valor anterior (não
  grava `0` nem `NaN`).

## Fora de escopo

- Metas por dia da semana.
- Metas por refeição.
- Qualquer alteração em `WeeklyGrid.jsx`, `DayCard.jsx`, `PratoRow.jsx`,
  `DishModal.jsx`.

## Verificação manual

1. Abrir "Foco do Dia", clicar no número de uma meta (ex: "2000" em Calorias),
   digitar um novo valor, apertar Enter — a barra de progresso e o texto devem
   refletir a nova meta imediatamente.
2. Recarregar a página — a meta customizada deve persistir (via localStorage).
3. Tentar salvar um valor vazio ou "0" — deve reverter para o valor anterior.
4. Repetir para os 4 campos (Calorias, Proteínas, Carboidratos, Gorduras).
