# Backup: Exportar/Importar Dados

## Contexto

Todo o estado do app (cardápio semanal, lista de compras, adesivos, título
da semana, metas diárias) vive só no `localStorage` do navegador. Limpar o
cache ou trocar de navegador apaga tudo sem aviso. O objetivo é dar um jeito
de exportar esse estado para um arquivo, e restaurá-lo depois.

## Decisões

- **Local dos botões:** cabeçalho do app, ao lado do botão "Substituições"
  já existente — dois ícones (exportar/importar), sempre visíveis.
- **Escopo do backup:** tudo que hoje está em `localStorage` — as 5 chaves
  (`weeklyData`, `shopping`, `stickers`, `weekLabel`, `goals`) num único
  arquivo JSON.
- **Importar substitui tudo:** com confirmação (`window.confirm`) antes de
  aplicar, já que é destrutivo. Sem tentativa de mesclar com o que já existe.
- **Onde vive o código:** funções `exportBackup`/`importBackup` em
  `App.jsx`, seguindo o padrão já usado para as outras ações do app (não
  cria um arquivo/módulo novo só para isso).

## Design

### Formato do arquivo

```json
{
  "exportedAt": "2026-08-23T15:30:00.000Z",
  "weeklyData": { ... },
  "shopping": [ ... ],
  "stickers": [ ... ],
  "weekLabel": "Minha semana",
  "goals": { "cals": 2000, "p": 150, "c": 200, "f": 65 }
}
```

### Exportar

```js
const exportBackup = () => {
  const backup = {
    exportedAt: new Date().toISOString(),
    weeklyData,
    shopping,
    stickers,
    weekLabel,
    goals
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cardapio-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

Botão de exportar chama essa função diretamente — sem confirmação, ação não
destrutiva.

### Importar

Um `<input type="file" accept="application/json">` oculto (via `ref`),
acionado pelo clique no botão de importar. Ao selecionar um arquivo:

1. Lê o conteúdo via `FileReader`.
2. Faz `JSON.parse`; se falhar (arquivo inválido/corrompido), mostra um
   `alert` de erro e para — nada é alterado.
3. Se o parse funcionar, mostra `window.confirm("Isso vai substituir todos
   os dados atuais. Continuar?")`. Se cancelar, para — nada é alterado.
4. Se confirmar, aplica cada campo do backup ao estado (`setWeeklyData`,
   `setShopping`, `setStickers`, `setWeekLabel`, `setGoals`), usando um
   valor padrão razoável para qualquer campo ausente no arquivo (ex:
   `weeklyData` ausente → `{}`; `goals` ausente → os defaults atuais do
   app).

O estado atualizado é persistido no `localStorage` automaticamente pelo
`useEffect` de salvamento que já existe em `App.jsx` — não precisa de
lógica extra de persistência.

### UI

Dois botões novos no cabeçalho, mesmo estilo visual do botão
"Substituições" (`btn btn-ghost`, pill, ícone + hover), um com ícone de
download (exportar) e outro com ícone de upload (importar). O botão de
importar aciona o `<input type="file">` oculto via `ref.current.click()`.

## Fora de escopo

- Backup automático/periódico.
- Backup na nuvem ou sincronização entre dispositivos.
- Importação parcial/seletiva (escolher quais campos restaurar).
- Histórico de backups anteriores dentro do app.

## Verificação manual

1. Com dados já preenchidos (pratos, bebidas, metas, adesivos), clicar em
   "Exportar" — confirmar que baixa um arquivo `cardapio-backup-*.json` com
   todo o conteúdo esperado.
2. Adicionar mais um prato (mudar o estado atual).
3. Clicar em "Importar", escolher o arquivo baixado no passo 1 — confirmar
   que aparece a pergunta de confirmação.
4. Confirmar — o app deve voltar exatamente ao estado do passo 1 (sem o
   prato adicionado no passo 2).
5. Recarregar a página — confirmar que o estado importado persistiu.
6. Tentar importar um arquivo `.json` qualquer que não seja um backup válido
   (ex: `{"foo": "bar"}`) — confirmar que não quebra a aplicação (aplica
   defaults para os campos ausentes, sem erro no console).
7. Tentar importar um arquivo que não é JSON válido — confirmar que mostra
   um alerta de erro e não altera o estado atual.
8. Clicar em "Importar" e cancelar a seleção de arquivo — confirmar que
   nada muda.
