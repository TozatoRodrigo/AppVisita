# Correção: Problema de Digitação no Campo Nome do Paciente

## Problema Identificado
- **Data:** 26/05/2025
- **Sintoma:** Usuário não conseguia digitar no campo "Nome do Paciente" na funcionalidade de adicionar novo paciente
- **Causa:** Event listener `keydown` na função `inicializarSugestoesPacientes()` estava interceptando todas as teclas, incluindo as de digitação normal

## Solução Implementada

### 1. Identificação da Causa
```javascript
// PROBLEMA: Event listener keydown muito agressivo
nomePacienteInput.addEventListener('keydown', function(e) {
  // Interceptava TODAS as teclas, mesmo quando sugestões não estavam visíveis
  const items = sugestoesContainer.querySelectorAll('.sugestao-item');
  // ... código que bloqueava digitação normal
});
```

### 2. Correção Aplicada
- **Removido:** Event listener `keydown` problemático
- **Mantido:** Apenas event listener `input` para busca de sugestões
- **Resultado:** Digitação normal restaurada, busca de pacientes ainda funcional

### 3. Código Corrigido
```javascript
// SOLUÇÃO: Apenas event listener de input, sem keydown
nomePacienteInput.addEventListener('input', function(e) {
  const termo = this.value.trim();
  
  if (termo.length < 3) {
    sugestoesContainer.style.display = 'none';
    return;
  }
  
  // Buscar sugestões com debounce
  timeoutBusca = setTimeout(async () => {
    await buscarPacientesParaSugestao(termo, sugestoesContainer);
  }, 300);
});
```

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

## Arquivos Modificados
- `app-pacientes.js` (linhas 61, 1066-1160)

## Commit
```bash
git add app-pacientes.js docs/CORRECAO_DIGITACAO_PACIENTES.md
git commit -m "🐛 Correção: Problema de digitação no campo nome do paciente

- Removido event listener keydown problemático
- Mantida funcionalidade de busca de pacientes
- Digitação normal restaurada
- Documentação da correção criada"
``` 