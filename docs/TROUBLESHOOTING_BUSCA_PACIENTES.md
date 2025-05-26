# 🔧 Troubleshooting - Busca de Pacientes para Reinternação

## 📋 Problemas Comuns e Soluções

### 🔍 **Problema: UUID aparecendo sem contexto**
**Sintoma:** UUID como `8334d467-c60a-45a6-8743-7b086e7594ad` aparece no console ou interface
**Possíveis Causas:**
- ID de paciente com dados corrompidos
- Referência a documento inexistente no Firebase
- Erro de sincronização de dados

**Soluções:**
1. **Verificar no console do navegador:**
   ```javascript
   // Abrir DevTools (F12) e executar:
   console.clear();
   // Tentar buscar novamente e verificar erros
   ```

2. **Limpar cache e dados locais:**
   ```javascript
   // No console do navegador:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### 🔎 **Problema: Sugestões não aparecem**
**Sintomas:**
- Digitando 3+ caracteres mas nenhuma sugestão aparece
- Container de sugestões não se torna visível

**Verificações:**
1. **Firebase conectado:**
   ```javascript
   // No console:
   console.log("Firebase:", !!window.db);
   console.log("Firestore disponível:", !!window.db?.collection);
   ```

2. **Dados no Firestore:**
   ```javascript
   // Verificar se há pacientes:
   window.db.collection('pacientes').limit(1).get()
     .then(snap => console.log("Pacientes encontrados:", !snap.empty))
     .catch(err => console.error("Erro:", err));
   ```

### 📊 **Problema: Erro ao buscar pacientes**
**Sintomas:**
- Mensagem "Erro ao buscar pacientes"
- Spinner infinito carregando

**Soluções:**
1. **Verificar permissões Firestore:**
   - Usuário logado tem acesso à coleção 'pacientes'
   - Regras do Firestore permitem leitura

2. **Verificar estrutura de dados:**
   ```javascript
   // Verificar estrutura de um paciente:
   window.db.collection('pacientes').limit(1).get()
     .then(snap => {
       snap.forEach(doc => {
         console.log("Estrutura do paciente:", doc.data());
       });
     });
   ```

### 🎯 **Problema: Paciente selecionado mas dados não preenchem**
**Sintomas:**
- Clica na sugestão mas campos ficam vazios
- Mensagem de reinternação não aparece

**Soluções:**
1. **Verificar IDs dos elementos HTML:**
   ```javascript
   // No console:
   console.log("Nome input:", !!document.getElementById('nome-paciente'));
   console.log("Data input:", !!document.getElementById('data-nascimento-paciente'));
   console.log("Msg container:", !!document.getElementById('msg-paciente-existente'));
   ```

2. **Verificar dados do paciente:**
   ```javascript
   // Verificar se paciente tem campos obrigatórios:
   // nome, dataNascimento, status
   ```

### 🔄 **Problema: Busca muito lenta**
**Sintomas:**
- Demora mais de 3 segundos para mostrar resultados
- Interface trava durante busca

**Otimizações:**
1. **Índices no Firestore:**
   - Criar índice composto para: `nome (asc)`
   - Verificar uso de queries eficientes

2. **Limite de resultados:**
   - Funcionalidade já limitada a 50 documentos
   - Filtros aplicados no cliente para performance

### 🚨 **Problema: Erro de permissões**
**Sintomas:**
- "Permission denied" no console
- Sugestões não carregam

**Verificações:**
1. **Login válido:**
   ```javascript
   // Verificar usuário logado:
   firebase.auth().onAuthStateChanged(user => {
     console.log("Usuário logado:", !!user, user?.email);
   });
   ```

2. **Regras Firestore:**
   ```javascript
   // Regras mínimas necessárias:
   // allow read: if request.auth != null;
   ```

## 🛠️ **Comandos de Debug Úteis**

### Verificar Estado da Aplicação:
```javascript
// No console do navegador:
console.log("=== DEBUG BUSCA PACIENTES ===");
console.log("Firebase DB:", !!window.db);
console.log("Usuário logado:", !!firebase.auth().currentUser);
console.log("Container sugestões:", !!document.querySelector('.sugestoes-container'));
console.log("Input nome:", document.getElementById('nome-paciente')?.value);
console.log("Função busca disponível:", typeof buscarPacientesParaSugestao);
```

### Testar Busca Manualmente:
```javascript
// Testar busca direta:
window.db.collection('pacientes')
  .where('nome', '>=', 'João')
  .where('nome', '<=', 'João' + '\uf8ff')
  .limit(5)
  .get()
  .then(snap => {
    console.log("Resultados encontrados:", snap.size);
    snap.forEach(doc => console.log(doc.data().nome));
  })
  .catch(err => console.error("Erro na busca:", err));
```

### Limpar Estado Completamente:
```javascript
// Reset completo:
localStorage.clear();
sessionStorage.clear();
if (document.querySelector('.sugestoes-container')) {
  document.querySelector('.sugestoes-container').style.display = 'none';
}
document.getElementById('nome-paciente').value = '';
document.getElementById('msg-paciente-existente').style.display = 'none';
```

## 📱 **Problemas Mobile Específicos**

### Touch/Clique não funciona:
- Verificar se `touch-action: manipulation` está aplicado
- Testar em diferentes navegadores mobile

### Layout quebrado:
- Verificar media queries para telas pequenas
- Container de sugestões pode sair da tela

## 🔄 **Como Reportar Problemas**

Ao encontrar um problema, colete as seguintes informações:

1. **UUID/ID específico** (como o fornecido)
2. **Mensagens de erro no console** (F12 → Console)
3. **Ações que levaram ao erro**
4. **Dados do paciente** (se aplicável)
5. **Navegador e versão**

### Template de Report:
```
🔴 PROBLEMA: [Descrição breve]
🔍 UUID/ID: [Se aplicável]
📱 Navegador: [Chrome/Firefox/Safari + versão]
🔧 Ações: [Passos para reproduzir]
💻 Console: [Mensagens de erro]
📊 Dados: [Informações relevantes]
```

## ✅ **Verificação de Funcionamento**

Para confirmar que a funcionalidade está funcionando:

1. ✅ Acessar formulário de adicionar paciente
2. ✅ Digitar 3+ caracteres no campo nome
3. ✅ Ver sugestões aparecerem em ~300ms
4. ✅ Navegar com setas ↑↓
5. ✅ Selecionar com Enter ou clique
6. ✅ Ver dados preenchidos automaticamente
7. ✅ Ver mensagem de reinternação apropriada
8. ✅ Conseguir cancelar seleção

---

**📞 Em caso de problemas persistentes:**
Forneça o UUID/ID específico e as informações de debug acima. 