# 🏥 AppVisita - Sistema de Gestão Médica

<div align="center">

![AppVisita Logo](https://img.shields.io/badge/AppVisita-Sistema%20Médico-blue?style=for-the-badge&logo=medical)

**Sistema completo de gestão de pacientes e evoluções médicas**

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

## 📋 Sobre o Projeto

O **AppVisita** é um sistema web desenvolvido para facilitar o gerenciamento de pacientes em ambientes hospitalares. O sistema permite que médicos e equipes médicas registrem evoluções de pacientes, anexem imagens de exames, e mantenham um histórico completo de atendimentos.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação segura** via Firebase Authentication
- 👥 **Gestão de equipes médicas** e usuários
- 🏥 **Cadastro e gerenciamento de pacientes**
- 📝 **Registro de evoluções médicas** com histórico completo
- 📸 **Anexo de imagens** em evoluções (exames, procedimentos)
- 🔍 **Sistema de busca** avançado de pacientes
- 📊 **Dashboard administrativo** com estatísticas
- 📱 **Interface responsiva** para desktop e mobile

## 🚀 Demonstração

### Interface Principal
- **Dashboard**: Visão geral dos pacientes internados
- **Adicionar Paciente**: Formulário completo com associação de equipes
- **Evolução**: Modal com editor de texto e upload de imagens
- **Consulta**: Sistema de busca por nome ou ID de internação

### Funcionalidades Avançadas
- **Upload de Imagens**: Redimensionamento automático e otimização
- **Visualização**: Galeria com modal de visualização ampliada
- **Equipes Médicas**: Gestão completa com associação de médicos
- **Histórico**: Timeline completa de evoluções com filtros

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com Grid e Flexbox
- **JavaScript ES6+**: Funcionalidades modernas e módulos
- **Firebase SDK**: Integração completa com serviços Google

### Backend (Firebase)
- **Authentication**: Gestão de usuários e permissões
- **Firestore**: Banco de dados NoSQL em tempo real
- **Storage**: Armazenamento seguro de imagens
- **Hosting**: Deploy e CDN global

### Arquitetura
- **Modular**: Código organizado em módulos independentes
- **Responsiva**: Interface adaptável a qualquer dispositivo
- **Real-time**: Sincronização automática de dados
- **Offline-ready**: Funcionalidade básica offline

## 📦 Instalação e Configuração

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (Python, Node.js, Live Server, etc.)
- Projeto Firebase configurado

### 🔧 Configuração do Firebase

1. **Criar projeto no Firebase Console**:
   ```
   https://console.firebase.google.com/
   ```

2. **Ativar serviços necessários**:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

3. **Configurar regras de segurança**:
   ```javascript
   // Firestore Rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   
   // Storage Rules
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

4. **Obter configuração do projeto**:
   - Acesse Project Settings → General
   - Role até "Your apps" → "Web apps"
   - Copie o objeto `firebaseConfig`

5. **Configurar no código**:
   Edite os arquivos `script.js` e `script-otimizado.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "sua-api-key",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };
   ```

### 🚀 Execução Local

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/AppVisita.git
   cd AppVisita
   ```

2. **Inicie um servidor local**:
   
   **Opção A - Python**:
   ```bash
   python3 -m http.server 8000
   ```
   
   **Opção B - Node.js**:
   ```bash
   npx http-server -p 8000
   ```
   
   **Opção C - PHP**:
   ```bash
   php -S localhost:8000
   ```

3. **Acesse no navegador**:
   ```
   http://localhost:8000
   ```

### 👤 Primeiro Acesso

1. **Criar conta de administrador**:
   - Use o email configurado em `ADMIN_EMAIL`
   - Faça o primeiro login
   - O sistema criará automaticamente os privilégios de admin

2. **Criar equipe médica**:
   - Acesse "Administração" → "Equipes Médicas"
   - Clique em "Nova Equipe"
   - Adicione médicos à equipe

3. **Aprovar usuários**:
   - Acesse "Administração" → "Usuários"
   - Aprove médicos pendentes

## 📱 Como Usar

### Para Administradores

1. **Gestão de Usuários**:
   - Aprovar/rejeitar novos médicos
   - Visualizar estatísticas de uso
   - Gerenciar permissões

2. **Gestão de Equipes**:
   - Criar equipes médicas
   - Associar médicos às equipes
   - Editar/excluir equipes

### Para Médicos

1. **Adicionar Paciente**:
   - Preencher dados completos
   - Associar à equipe médica
   - Sistema detecta reinternações

2. **Registrar Evolução**:
   - Escrever texto da evolução
   - Anexar imagens (opcional)
   - Definir status do paciente

3. **Consultar Histórico**:
   - Buscar por nome ou ID
   - Visualizar timeline completa
   - Acessar imagens anexadas

## 🏗️ Estrutura do Projeto

```
AppVisita/
├── index.html                 # Página principal
├── style.css                  # Estilos principais
├── estilos-admin.css          # Estilos administrativos
├── script.js                  # Script principal (completo)
├── script-otimizado.js        # Script otimizado (API)
├── app-modulos.js             # Módulos base
├── app-login.js               # Módulo de autenticação
├── app-pacientes.js           # Módulo de pacientes
├── app-admin.js               # Módulo administrativo
├── app-equipes.js             # Módulo de equipes
├── app-ui.js                  # Módulo de interface
├── app-diagnostico.js         # Módulo de diagnóstico
├── CHANGELOG.md               # Histórico de mudanças
├── TESTE_EQUIPES.md           # Guia de testes
└── README.md                  # Este arquivo
```

### 📂 Organização dos Módulos

- **`app-modulos.js`**: Funcionalidades base e utilitários
- **`app-login.js`**: Autenticação e gestão de sessão
- **`app-pacientes.js`**: CRUD de pacientes e evoluções
- **`app-admin.js`**: Funcionalidades administrativas
- **`app-equipes.js`**: Gestão de equipes médicas
- **`app-ui.js`**: Componentes de interface
- **`app-diagnostico.js`**: Sistema de diagnóstico e logs

## 🔒 Segurança

### Autenticação
- Login obrigatório para acesso
- Senhas criptografadas pelo Firebase
- Sessões seguras com tokens JWT

### Autorização
- Níveis de acesso (Admin, Médico)
- Médicos só veem pacientes de suas equipes
- Admins têm acesso completo

### Dados
- Comunicação HTTPS obrigatória
- Regras de segurança no Firestore
- Backup automático no Firebase

### Imagens
- Upload direto para Firebase Storage
- URLs seguras e temporárias
- Redimensionamento automático

## 📊 Monitoramento e Logs

### Sistema de Debug
- Logs detalhados com emoji 🔥
- Console de desenvolvimento
- Diagnóstico automático de problemas

### Métricas
- Total de usuários e pacientes
- Estatísticas de evoluções
- Volume de imagens armazenadas

## 🤝 Contribuindo

1. **Fork o projeto**
2. **Crie uma branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit suas mudanças** (`git commit -m 'Add some AmazingFeature'`)
4. **Push para a branch** (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

### 📝 Padrões de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Atualização de documentação
- `style`: Mudanças de formatação
- `refactor`: Refatoração de código
- `test`: Adição de testes

## 📋 Roadmap

### Versão Atual (1.2.4)
- ✅ Sistema base completo
- ✅ Upload de imagens funcionando
- ✅ Gestão de equipes operacional
- ✅ Interface responsiva

### Próximas Versões
- 🔄 **v1.3.0**: Relatórios e estatísticas avançadas
- 🔄 **v1.4.0**: Sistema de notificações
- 🔄 **v1.5.0**: API REST para integrações
- 🔄 **v2.0.0**: App móvel nativo

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Rodrigo Dias Tozato**
- Email: rodrigo.tozato@icloud.com
- GitHub: [@rodrigodiastozato](https://github.com/rodrigodiastozato)

## 🙏 Agradecimentos

- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Font Awesome](https://fontawesome.com/) - Ícones
- [Google Fonts](https://fonts.google.com/) - Tipografia
- Comunidade médica que inspirou este projeto

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!**

[🐛 Reportar Bug](https://github.com/rodrigodiastozato/AppVisita/issues) • [💡 Solicitar Feature](https://github.com/rodrigodiastozato/AppVisita/issues) • [📖 Documentação](https://github.com/rodrigodiastozato/AppVisita/wiki)

</div> 