# 📖 Guia de Instalação e Configuração - AppVisita

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Firebase](#configuração-do-firebase)
3. [Instalação Local](#instalação-local)
4. [Configuração de Produção](#configuração-de-produção)
5. [Verificação da Instalação](#verificação-da-instalação)
6. [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### Obrigatórios
- **Python 3.6+** (para servidor local de desenvolvimento)
- **Navegador moderno** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **Conta Google** (para Firebase)
- **Conexão com internet** (para serviços Firebase)

### Recomendados
- **Git** (para controle de versão)
- **Visual Studio Code** (IDE recomendada)
- **Extensões VS Code**:
  - Live Server
  - Firebase
  - JavaScript (ES6) code snippets

## 🔥 Configuração do Firebase

### 1. Criar Projeto Firebase

```bash
# 1. Acesse https://console.firebase.google.com/
# 2. Clique em "Adicionar projeto"
# 3. Nome do projeto: "AppVisita" (ou nome desejado)
# 4. Ative o Google Analytics (recomendado)
```

### 2. Configurar Authentication

```bash
# No console Firebase:
# 1. Vá para Authentication > Sign-in method
# 2. Ative "Email/senha"
# 3. Configure domínios autorizados (localhost e seu domínio)
```

### 3. Configurar Firestore Database

```bash
# No console Firebase:
# 1. Vá para Firestore Database
# 2. Clique em "Criar banco de dados"
# 3. Selecione "Iniciar em modo de teste" (temporariamente)
# 4. Escolha a localização mais próxima
```

### 4. Configurar Regras de Segurança

```javascript
// Regras iniciais do Firestore (Security Rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Obter Credenciais

```bash
# 1. Vá para Configurações do projeto (ícone de engrenagem)
# 2. Role para baixo até "Seus apps"
# 3. Clique em "Adicionar app" > "Web"
# 4. Registre o app com nome "AppVisita"
# 5. Copie as credenciais fornecidas
```

## 💻 Instalação Local

### 1. Download do Projeto

```bash
# Opção 1: Download direto
# Baixe o arquivo ZIP e extraia

# Opção 2: Git (se disponível)
git clone [URL_DO_REPOSITORIO]
cd AppVisita
```

### 2. Configurar Credenciais Firebase

Edite o arquivo `script-otimizado.js` nas linhas 15-25:

```javascript
// Configuração do Firebase - SUBSTITUA PELAS SUAS CREDENCIAIS
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID" // Opcional
};
```

### 3. Configurar Email do Administrador

Edite o arquivo `script-otimizado.js` na linha 60:

```javascript
// Email do administrador - SUBSTITUA PELO SEU EMAIL
window.ADMIN_EMAIL = 'seu-email-admin@exemplo.com';
```

### 4. Iniciar Servidor Local

```bash
# Navegue até a pasta do projeto
cd AppVisita

# Inicie o servidor Python
python3 -m http.server 8000

# Ou se preferir Python 2
python -m SimpleHTTPServer 8000

# Ou use outro servidor de sua preferência
```

### 5. Acessar a Aplicação

```
http://localhost:8000
```

## 🚀 Configuração de Produção

### 1. Servidor Web

```nginx
# Exemplo de configuração Nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/AppVisita;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript text/javascript;
}
```

### 2. HTTPS (Obrigatório para produção)

```bash
# Usando Certbot (Let's Encrypt)
sudo certbot --nginx -d seu-dominio.com
```

### 3. Variáveis de Ambiente

Crie arquivo `.env` (não incluir no controle de versão):

```bash
FIREBASE_API_KEY=sua_api_key
FIREBASE_PROJECT_ID=seu_project_id
ADMIN_EMAIL=admin@sua-empresa.com
ENVIRONMENT=production
```

### 4. Atualizar Domínios Autorizados

No Firebase Console:
```
Authentication > Settings > Authorized domains
Adicione: seu-dominio.com
```

## ✅ Verificação da Instalação

### 1. Checklist Básico

- [ ] Aplicação carrega em `http://localhost:8000`
- [ ] Tela de login é exibida
- [ ] Console do navegador não mostra erros críticos
- [ ] Firebase está conectado (verificar Network tab)

### 2. Teste de Funcionalidades

```javascript
// Execute no console do navegador para testar conexão Firebase
console.log('Firebase App:', window.firebase.app());
console.log('Auth:', window.firebase.auth());
console.log('Firestore:', window.firebase.firestore());
```

### 3. Criar Primeiro Usuário Admin

```bash
# 1. Acesse a aplicação
# 2. Clique em "Criar conta"
# 3. Use o email configurado como ADMIN_EMAIL
# 4. Faça login - será automaticamente admin
```

## 🔧 Troubleshooting

### Problema: "Firebase not defined"

**Solução:**
```html
<!-- Verificar se os scripts Firebase estão carregando -->
<!-- No index.html, verificar ordem dos scripts -->
<script src="https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.17.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore-compat.js"></script>
```

### Problema: "CORS Error"

**Solução:**
```bash
# Use servidor HTTP adequado, não abra arquivo diretamente no navegador
python3 -m http.server 8000
```

### Problema: "Permission Denied" no Firestore

**Solução:**
```javascript
// Verifique as regras do Firestore
// Temporariamente para teste:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // APENAS PARA TESTE!
    }
  }
}
```

### Problema: Usuário não consegue fazer login

**Verificações:**
1. Email está correto?
2. Senha atende aos requisitos (mínimo 6 caracteres)?
3. Usuário foi criado no Firebase Auth?
4. Domínio está autorizado no Firebase?

### Logs de Debug

Para ativar logs detalhados, adicione no console:
```javascript
// Ativar logs Firebase
firebase.firestore.setLogLevel('debug');

// Verificar status do AppVisita
console.log('AppVisita Status:', window.AppVisita);
```

## 📝 Próximos Passos

Após instalação bem-sucedida:

1. [Configurar backup automático](BACKUP.md)
2. [Implementar monitoramento](MONITORING.md)
3. [Configurar ambiente de desenvolvimento](DEVELOPMENT.md)
4. [Ler manual do usuário](USER_MANUAL.md)

---

**📞 Suporte:** Se problemas persistirem, consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md) ou abra um ticket de suporte.

*Última atualização: 23 de Janeiro de 2025* 