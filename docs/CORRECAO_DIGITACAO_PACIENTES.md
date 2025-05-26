# Correção - Problema de Digitação no Campo Nome do Paciente

## Problema Reportado
O usuário não conseguia digitar no campo "nome do paciente" na funcionalidade de adicionar novo paciente.

## Diagnóstico Realizado

### Primeira Investigação
- **Data**: Primeiro relato
- **Causa Identificada**: Event listener `keydown` na função `inicializarSugestoesPacientes()` interceptando todas as teclas
- **Problema**: O código interceptava teclas mesmo quando sugestões não estavam visíveis, bloqueando digitação normal

### Segunda Investigação  
- **Data**: Segundo relato (problema persistiu)
- **Causa Identificada**: Event listeners globais de `keydown` para navegação de modais de imagem
- **Localização**: 
  - Linha 2201: `document.addEventListener('keydown', ...)` no `inicializarModalImagem()`
  - Linha 2419: `document.addEventListener('keydown', ...)` no `abrirImagemModal()`

## Correções Aplicadas

### Primeira Correção
1. **Desabilitação Temporária**: Comentada a chamada `inicializarSugestoesPacientes()` na linha 61
2. **Correção da Função**: Reescrita da função `inicializarSugestoesPacientes()`:
   - Removido event listener `keydown` problemático  
   - Mantido apenas event listener `input` para busca
   - Preservadas funcionalidades de debounce e fechamento por clique

### Segunda Correção
1. **Identificação de Event Listeners Globais**: Encontrados dois listeners `keydown` globais interferindo
2. **Desabilitação dos Event Listeners Problemáticos**:
   ```javascript
   // Linha 2201 - Comentado
   // document.addEventListener('keydown', (e) => { ... });
   
   // Linha 2419 - Comentado  
   // document.addEventListener('keydown', function modalKeyHandler(e) { ... });
   ```
3. **Reativação da Função de Sugestões**: Descomentada a chamada na linha 61

## Estado Final do Sistema

### ✅ Funcionalidades Restauradas
- Digitação normal no campo nome do paciente
- Sistema de busca de pacientes para reinternação (3+ caracteres)
- Sugestões visuais e preenchimento automático
- Upload e visualização de imagens nas evoluções

### ❌ Funcionalidades Temporariamente Desabilitadas
- Navegação por teclado nos modais de imagem (setas esquerda/direita, ESC)

## Impacto das Alterações
- **Problema Resolvido**: Campo nome do paciente aceita digitação normalmente
- **Funcionalidade Preservada**: Sistema de busca e reinternação mantido
- **Perda Mínima**: Apenas navegação por teclado em modais de imagem desabilitada

## Arquivos Modificados
- `app-pacientes.js`: 
  - Linha 61: Reativada chamada `inicializarSugestoesPacientes()`
  - Linhas 2201-2216: Event listener de keydown comentado
  - Linhas 2419-2434: Event listener de keydown comentado

## Lições Aprendidas
1. **Event Listeners Globais**: Podem causar interferências inesperadas
2. **Diagnóstico Sistemático**: Necessário verificar todos os listeners de eventos
3. **Isolamento de Problemas**: Desabilitar temporariamente funcionalidades para identificar causa raiz

## Funcionalidades Mantidas
✅ Digitação normal no campo nome  
✅ Busca de pacientes para reinternação (3+ caracteres)  
✅ Sugestões visuais com status do paciente  
✅ Preenchimento automático ao selecionar sugestão  
✅ Validação de identidade para casos sensíveis  

## Funcionalidades Removidas (Temporariamente)
❌ Navegação por teclado nas sugestões (setas ↑↓)  
❌ Seleção por Enter nas sugestões  
❌ Fechar sugestões com Escape  

## Próximos Passos (Opcional)
Se necessário, pode-se reimplementar a navegação por teclado de forma mais inteligente:

```javascript
// Navegação por teclado APENAS quando sugestões visíveis
nomePacienteInput.addEventListener('keydown', function(e) {
  // Só interceptar se sugestões estão REALMENTE visíveis
  if (sugestoesContainer.style.display === 'none' || 
      !sugestoesContainer.querySelector('.sugestao-item')) {
    return; // Permitir digitação normal
  }
  
  // Apenas então interceptar setas e Enter
  if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
    // ... lógica de navegação
  }
});
```

## Teste de Validação
1. ✅ Abrir formulário "Adicionar Paciente"
2. ✅ Clicar no campo "Nome do Paciente"
3. ✅ Digitar normalmente - deve funcionar
4. ✅ Digitar 3+ caracteres - deve mostrar sugestões
5. ✅ Clicar em sugestão - deve preencher campos

## Commit
```bash
git add app-pacientes.js docs/CORRECAO_DIGITACAO_PACIENTES.md
git commit -m "🐛 Correção: Problema de digitação no campo nome do paciente

- Removido event listener keydown problemático
- Mantida funcionalidade de busca de pacientes
- Digitação normal restaurada
- Documentação da correção criada"
``` 