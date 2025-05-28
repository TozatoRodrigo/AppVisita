# 📚 Documentação Técnica - AppVisita

## 🏗️ Arquitetura do Sistema

### Visão Geral
O AppVisita é uma aplicação web Progressive Web App (PWA) construída com arquitetura modular, utilizando Firebase como backend e JavaScript vanilla no frontend.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Client-Side)                   │
├─────────────────────────────────────────────────────────────┤
│  HTML5 + CSS3 + JavaScript ES6+                           │
│  ├── app-modulos.js (Core Modules)                        │
│  ├── app-ui.js (UI Components)                            │
│  ├── app-login.js (Authentication)                        │
│  ├── app-pacientes.js (Patient Management)                │
│  ├── app-equipes.js (Team Management)                     │
│  ├── app-admin.js (Administration)                        │
│  └── app-diagnostico.js (Diagnostics)                     │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND (Firebase)                       │
├─────────────────────────────────────────────────────────────┤
│  ├── Firebase Authentication (User Management)             │
│  ├── Cloud Firestore (NoSQL Database)                     │
│  ├── Firebase Storage (File Storage)                      │
│  └── Firebase Hosting (Static Hosting)                    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Arquivos

```
AppVisita/
├── index.html                 # Página principal
├── server.js                  # Servidor de desenvolvimento
├── manifest.json             # PWA manifest
├── README.md                 # Documentação principal
├── CHANGELOG.md              # Histórico de mudanças
├── TECHNICAL_DOCS.md         # Esta documentação
│
├── css/                      # Estilos
│   ├── design-system.css     # Sistema de design
│   ├── enterprise-components.css # Componentes empresariais
│   └── style.css             # Estilos principais
│
├── js/                       # JavaScript modular
│   ├── services/             # Serviços
│   │   ├── AuditService.js   # Auditoria
│   │   ├── ValidationService.js # Validação
│   │   ├── MonitoringService.js # Monitoramento
│   │   └── SecurityService.js # Segurança
│   └── admin-dashboard.js    # Dashboard administrativo
│
├── app-*.js                  # Módulos principais da aplicação
├── script-otimizado.js       # Core Firebase e utilitários
├── estilos-admin.css         # Estilos administrativos
│
├── icons/                    # Ícones PWA
├── tests/                    # Testes automatizados
└── scripts/                  # Scripts de build e deploy
```

## 🔧 Módulos Principais

### 1. app-modulos.js
**Responsabilidade**: Gerenciamento central de módulos e estado global

```javascript
window.AppModulos = {
  UI: {},           // Componentes de interface
  Pacientes: {},    // Gestão de pacientes
  Equipes: {},      // Gestão de equipes
  Admin: {},        // Administração
  Utils: {}         // Utilitários
};
```

**Funcionalidades**:
- Inicialização de módulos
- Comunicação entre módulos
- Estado global da aplicação
- Event bus interno

### 2. app-ui.js
**Responsabilidade**: Componentes de interface e interações

```javascript
AppModulos.UI = {
  mostrarLoading(mensagem),
  esconderLoading(),
  mostrarNotificacao(mensagem, tipo),
  exibirModal(titulo, conteudo, botoes),
  configurarSidebar(),
  gerenciarEstadoUI()
};
```

**Funcionalidades**:
- Loading states
- Notificações toast
- Modais dinâmicos
- Sidebar responsiva
- Feedback visual

### 3. app-login.js
**Responsabilidade**: Autenticação e gestão de usuários

```javascript
const AuthModule = {
  async login(email, senha),
  async logout(),
  async criarConta(email, senha),
  verificarStatusUsuario(),
  preencherDadosComplementares(),
  gerenciarSessao()
};
```

**Funcionalidades**:
- Login/logout
- Criação de contas
- Dados complementares
- Verificação de aprovação
- Gestão de sessão

### 4. app-pacientes.js
**Responsabilidade**: Gestão completa de pacientes

```javascript
const PacientesModule = {
  async carregarPacientes(),
  async adicionarPaciente(dados),
  async registrarEvolucao(pacienteId, evolucao),
  buscarPacientes(termo),
  filtrarPorEquipe(equipeId),
  uploadImagens(arquivos)
};
```

**Funcionalidades**:
- CRUD de pacientes
- Sistema de evoluções
- Upload de imagens
- Busca inteligente
- Filtros avançados

### 5. app-equipes.js
**Responsabilidade**: Gestão de equipes médicas

```javascript
const EquipesModule = {
  async carregarEquipes(),
  async criarEquipe(dados),
  async editarEquipe(id, dados),
  async excluirEquipe(id),
  gerenciarMembros(equipeId, membros)
};
```

**Funcionalidades**:
- CRUD de equipes
- Gestão de membros
- Atribuição de pacientes
- Filtros por equipe

### 6. app-admin.js
**Responsabilidade**: Painel administrativo completo

```javascript
const AdminModule = {
  async carregarDadosAdmin(),
  async carregarUsuarios(),
  async aprovarUsuario(userId),
  async carregarEstatisticas(),
  gerenciarEquipes(),
  configurarPermissoes()
};
```

**Funcionalidades**:
- Dashboard administrativo
- Aprovação de usuários
- Gestão de equipes
- Estatísticas em tempo real
- Controle de acesso

## 🗄️ Estrutura do Banco de Dados

### Cloud Firestore Collections

#### 1. usuarios
```javascript
{
  id: "firebase-auth-uid",
  email: "medico@exemplo.com",
  aprovado: boolean,
  dadosComplementaresPreenchidos: boolean,
  nomeCompleto: "Dr. João Silva",
  cpf: "123.456.789-00",
  telefone: "(11) 99999-9999",
  especialidade: "Cardiologia",
  crm: {
    numero: "123456",
    estado: "SP"
  },
  dataCriacao: Timestamp,
  ultimoLogin: Timestamp
}
```

**Índices**:
- `email` (único)
- `aprovado`
- `dataCriacao`

#### 2. pacientes
```javascript
{
  id: "auto-generated-id",
  nome: "Maria Santos",
  idInternacao: "INT-2024-001",
  dataNascimento: "1980-05-15",
  status: "internado", // internado, alta, obito
  equipeId: "equipe-id",
  medicoResponsavel: "medico-id",
  evolucoes: [
    {
      id: "evolucao-id",
      texto: "Paciente apresenta melhora...",
      status: "internado",
      medicoId: "medico-id",
      dataRegistro: Timestamp,
      imagens: ["storage-url-1", "storage-url-2"]
    }
  ],
  dataCriacao: Timestamp,
  ultimaAtualizacao: Timestamp
}
```

**Índices**:
- `nome`
- `idInternacao`
- `status`
- `equipeId`
- `dataCriacao`

#### 3. equipes
```javascript
{
  id: "auto-generated-id",
  nome: "Cardiologia A",
  descricao: "Equipe de cardiologia do turno A",
  membros: ["medico-id-1", "medico-id-2"],
  ativa: true,
  dataCriacao: Timestamp,
  ultimaAtualizacao: Timestamp,
  criadoPor: "admin-id"
}
```

**Índices**:
- `nome`
- `ativa`
- `dataCriacao`

## 🔐 Segurança e Permissões

### Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função para verificar se usuário está aprovado
    function isApprovedUser() {
      return request.auth != null && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.aprovado == true;
    }
    
    // Função para verificar se é admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'admin@exemplo.com';
    }
    
    // Usuários podem ler/escrever seus próprios dados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && 
                           (request.auth.uid == userId || isAdmin());
    }
    
    // Apenas usuários aprovados podem acessar pacientes
    match /pacientes/{document} {
      allow read, write: if isApprovedUser();
    }
    
    // Apenas usuários aprovados podem acessar equipes
    match /equipes/{document} {
      allow read, write: if isApprovedUser();
    }
  }
}
```

### Regras do Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /evolucoes/{allPaths=**} {
      allow read, write: if request.auth != null && 
                           request.auth.token.email_verified == true;
    }
  }
}
```

## 🔄 Fluxos de Dados

### 1. Fluxo de Autenticação
```
1. Usuário acessa sistema
2. Verifica se está logado (Firebase Auth)
3. Se não logado → Tela de login
4. Se logado → Verifica aprovação no Firestore
5. Se não aprovado → Aguarda aprovação
6. Se aprovado → Verifica dados complementares
7. Se incompletos → Formulário de dados
8. Se completos → Dashboard principal
```

### 2. Fluxo de Criação de Paciente
```
1. Usuário clica "Adicionar Paciente"
2. Valida permissões (usuário aprovado)
3. Exibe formulário de cadastro
4. Valida dados obrigatórios
5. Salva no Firestore
6. Atualiza lista em tempo real
7. Exibe confirmação
```

### 3. Fluxo de Evolução
```
1. Usuário seleciona paciente
2. Clica "Registrar Evolução"
3. Preenche texto da evolução
4. Seleciona status (internado/alta/óbito)
5. Anexa imagens (opcional)
6. Upload para Firebase Storage
7. Salva evolução no Firestore
8. Atualiza histórico
9. Notifica sucesso
```

## 🎨 Sistema de Design

### Variáveis CSS
```css
:root {
  /* Cores Primárias */
  --primary-color: #4285f4;
  --primary-light: #6ab7ff;
  --primary-dark: #2c5aa0;
  
  /* Cores Secundárias */
  --secondary-color: #34a853;
  --warning-color: #fbbc04;
  --error-color: #ea4335;
  
  /* Cores Neutras */
  --background-color: #ffffff;
  --background-secondary: #f8f9fa;
  --text-color: #202124;
  --text-secondary: #5f6368;
  --border-color: #dadce0;
  
  /* Espaçamentos */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Tipografia */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Bordas */
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  /* Sombras */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.15);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
}
```

### Componentes Reutilizáveis

#### Botões
```css
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

.btn--secondary {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}
```

#### Cards
```css
.card {
  background: var(--background-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── unit/                    # Testes unitários
│   ├── auth.test.js        # Testes de autenticação
│   ├── patients.test.js    # Testes de pacientes
│   └── teams.test.js       # Testes de equipes
├── integration/            # Testes de integração
│   ├── firebase.test.js    # Testes Firebase
│   └── ui.test.js          # Testes de UI
├── e2e/                    # Testes end-to-end
│   ├── login.e2e.js        # Fluxo de login
│   └── patient.e2e.js      # Fluxo de pacientes
└── test-suite.js           # Suite principal
```

### Exemplo de Teste
```javascript
// tests/unit/auth.test.js
describe('Authentication Module', () => {
  test('should login with valid credentials', async () => {
    const result = await AuthModule.login('test@example.com', 'password');
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
  
  test('should fail with invalid credentials', async () => {
    const result = await AuthModule.login('invalid@example.com', 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## 📊 Monitoramento e Analytics

### Métricas Coletadas
- **Performance**: Tempo de carregamento, FCP, LCP
- **Uso**: Páginas visitadas, ações realizadas
- **Erros**: JavaScript errors, falhas de rede
- **Usuários**: Sessões ativas, retenção

### Implementação
```javascript
// js/services/MonitoringService.js
const MonitoringService = {
  trackPageView(page) {
    // Google Analytics ou similar
  },
  
  trackEvent(action, category, label) {
    // Eventos customizados
  },
  
  trackError(error, context) {
    // Sentry ou similar
  },
  
  trackPerformance(metric, value) {
    // Web Vitals
  }
};
```

## 🚀 Deploy e CI/CD

### Processo de Deploy
```bash
# 1. Build da aplicação
npm run build

# 2. Testes
npm run test

# 3. Deploy para Firebase
firebase deploy

# 4. Verificação pós-deploy
npm run test:e2e:prod
```

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```javascript
// config/development.js
const config = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },
  adminEmail: process.env.ADMIN_EMAIL,
  environment: 'development'
};
```

### Scripts de Desenvolvimento
```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "npm run minify && npm run optimize",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "cypress run",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## 📈 Performance

### Otimizações Implementadas
- **Lazy Loading**: Imagens e módulos carregados sob demanda
- **Code Splitting**: Módulos separados por funcionalidade
- **Caching**: Service Worker para cache offline
- **Minificação**: CSS e JS minificados em produção
- **Compressão**: Gzip/Brotli no servidor

### Métricas Alvo
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTI**: < 3.5s

## 🔒 Conformidade e Privacidade

### LGPD Compliance
- **Consentimento**: Usuários consentem com coleta de dados
- **Minimização**: Apenas dados necessários são coletados
- **Transparência**: Política de privacidade clara
- **Direitos**: Usuários podem solicitar exclusão de dados
- **Segurança**: Dados criptografados em trânsito e repouso

### Auditoria
```javascript
// js/services/AuditService.js
const AuditService = {
  logAction(userId, action, details) {
    const auditLog = {
      userId,
      action,
      details,
      timestamp: new Date(),
      ip: this.getUserIP(),
      userAgent: navigator.userAgent
    };
    
    // Salvar no Firestore
    db.collection('audit_logs').add(auditLog);
  }
};
```

---

## 📞 Suporte Técnico

Para questões técnicas específicas:
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/AppVisita/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/AppVisita/wiki)
- **Email**: dev@appvisita.com

---

**AppVisita** - Documentação técnica mantida pela equipe de desenvolvimento. 