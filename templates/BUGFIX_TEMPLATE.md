# 🐛 [Título do Bug Fix] - AppVisita

> **Template para documentação de correções de bugs**
> 
> **⚠️ INSTRUÇÕES:**
> 1. Substitua todos os textos entre [colchetes]
> 2. Remova esta seção de instruções  
> 3. Atualize as datas no final

## 📋 Informações do Bug

**Bug ID**: [#número ou referência]  
**Severidade**: [Crítica | Alta | Média | Baixa]  
**Módulo Afetado**: [app-admin.js | app-pacientes.js | etc.]  
**Versão Afetada**: [v1.x.x]  
**Reportado por**: [Nome/Email]  
**Corrigido por**: [Nome do desenvolvedor]  
**Data da correção**: [DD/MM/YYYY]

## 🔍 Descrição do Problema

### Sintomas Observados
[Descrição detalhada do comportamento incorreto]

### Reprodução do Bug
1. **Pré-condições**: [Estado inicial necessário]
2. **Passos para reproduzir**:
   - [Passo 1]
   - [Passo 2]
   - [Passo 3]
3. **Resultado esperado**: [O que deveria acontecer]
4. **Resultado atual**: [O que estava acontecendo]

### Impacto
- **Usuários afetados**: [Todos | Admins | Médicos específicos]
- **Frequência**: [Sempre | Às vezes | Raramente]
- **Workaround disponível**: [Sim/Não - descrever se sim]

## 🔧 Análise Técnica

### Causa Raiz
[Explicação técnica da causa do problema]

### Arquivos Analisados
- [ ] `[arquivo1.js]` - [O que foi verificado]
- [ ] `[arquivo2.css]` - [O que foi verificado]
- [ ] `[arquivo3.html]` - [O que foi verificado]

### Logs/Evidências
```
[Cole aqui logs relevantes, mensagens de erro, stack traces, etc.]
```

## 🛠️ Solução Implementada

### Mudanças no Código
#### Arquivo: `[nome-do-arquivo]`
**Localização**: Linha [X] - Função `[nomeFuncao]`

```javascript
// ANTES (código com bug)
function exemploComBug() {
  // código problemático
}

// DEPOIS (código corrigido)
function exemploCorrigido() {
  // código corrigido
  // explicação da mudança
}
```

### Mudanças no Banco de Dados (se aplicável)
```javascript
// Script de migração/correção se necessário
db.collection('[collection]').get().then(snapshot => {
  snapshot.forEach(doc => {
    // Correção de dados
  });
});
```

### Validações Adicionadas
- [ ] **Client-side**: [Nova validação implementada]
- [ ] **Server-side**: [Nova regra implementada]
- [ ] **Sanitização**: [Novo tratamento implementado]

## 🧪 Testes da Correção

### Cenários Testados
- [ ] **Reprodução original**: [Bug não ocorre mais]
- [ ] **Casos relacionados**: [Verificar se não quebrou outras funcionalidades]
- [ ] **Edge cases**: [Testar casos limite]
- [ ] **Regressão**: [Confirmar que outras funcionalidades continuam funcionando]

### Como Validar a Correção
```bash
# Passos para testar a correção
1. [Passo de teste]
2. [Verificação esperada]
3. [Confirmação de que o bug foi corrigido]
```

### Testes Automatizados Adicionados (se aplicável)
```javascript
// Exemplo de teste para evitar regressão
test('[nome-do-teste]', () => {
  // teste específico para este bug
  expect([resultado]).toBe([esperado]);
});
```

## 📊 Verificações de Qualidade

### Performance
- [ ] **Não impactou performance negativamente**
- [ ] **Melhorou performance** (se aplicável)
- [ ] **Tempo de resposta**: [X]ms (antes) → [Y]ms (depois)

### Compatibilidade
- [ ] **Chrome**: Testado e funcionando
- [ ] **Firefox**: Testado e funcionando  
- [ ] **Safari**: Testado e funcionando
- [ ] **Mobile**: Testado e funcionando

### Segurança
- [ ] **Não introduziu vulnerabilidades**
- [ ] **Melhorou segurança** (se aplicável)
- [ ] **Validações adequadas** implementadas

## 🔄 Deployment e Rollback

### Processo de Deploy
```bash
# Comandos específicos para deploy desta correção
1. [comando 1]
2. [comando 2]
3. [verificação]
```

### Plano de Rollback (se necessário)
```bash
# Como reverter se houver problemas
1. git revert [commit-hash]
2. [passos específicos]
3. [verificações necessárias]
```

### Verificações Pós-Deploy
- [ ] **Bug original corrigido** em produção
- [ ] **Funcionalidades relacionadas** funcionando
- [ ] **Métricas normais** (sem spike de erros)
- [ ] **Feedback dos usuários** positivo

## 📈 Prevenção

### Melhorias para Evitar Regressão
- [ ] **Teste automatizado** adicionado
- [ ] **Validação adicional** implementada
- [ ] **Documentação atualizada**
- [ ] **Code review mais rigoroso** na área

### Lições Aprendidas
[O que podemos aprender desta correção para evitar bugs similares]

## 📝 Documentação Atualizada

- [ ] **TROUBLESHOOTING.md**: Problema adicionado às issues conhecidas
- [ ] **USER_MANUAL.md**: Atualizado se comportamento mudou
- [ ] **ARCHITECTURE.md**: Atualizado se estrutura mudou
- [ ] **DATABASE.md**: Atualizado se banco mudou
- [ ] **Código comentado**: Explicações adicionadas onde necessário

## 🚨 Comunicação

### Usuários a Notificar
- [ ] **Reportador do bug**: Informado sobre a correção
- [ ] **Usuários afetados**: Notificados sobre a solução
- [ ] **Equipe de suporte**: Briefing sobre a correção
- [ ] **Stakeholders**: Update sobre o status

### Comunicado (se necessário)
```
[Template de comunicado para usuários]

Assunto: Correção - [Breve descrição do problema]

Prezados usuários,

Foi identificado e corrigido um problema em [descrição da área afetada].

O problema: [Breve descrição]
A solução: [Breve descrição da correção]
Status: Corrigido em [data]

Obrigado pela paciência.

Equipe AppVisita
```

## 📞 Suporte

**Desenvolvedor responsável**: [Nome] - [email]  
**Testado por**: [Nome] - [Data]  
**Aprovado por**: [Nome] - [Data]

### Referências Relacionadas
- **Issue original**: [Link ou referência]
- **Pull Request**: [Link se aplicável]
- **Documentação relacionada**: [Links]

---

**📅 Histórico**
- **[DD/MM/YYYY]**: Bug reportado
- **[DD/MM/YYYY]**: Investigação iniciada  
- **[DD/MM/YYYY]**: Causa identificada
- **[DD/MM/YYYY]**: Correção implementada
- **[DD/MM/YYYY]**: Deploy realizado
- **[DD/MM/YYYY]**: Correção validada

*Documentação da correção: [Título do Bug]*
*Criada em: [DD de Mês de YYYY]*
*Última atualização: [DD de Mês de YYYY]* 