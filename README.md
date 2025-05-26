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
- 📸 **Sistema completo de upload de imagens** com drag & drop
- 🖼️ **Visualizador profissional de imagens** com navegação por teclado
- 🔍 **Sistema de busca** avançado de pacientes com sugestões em tempo real
- 🚫 **Validação rigorosa de reinternação** (apenas pacientes com alta hospitalar)
- 💬 **Sistema de alertas visuais** com animações e feedback contextual
- 📊 **Dashboard administrativo** com estatísticas
- 📱 **Interface responsiva** para desktop e mobile
- 🏥 **Status do paciente** (Internado, Alta, Óbito) com regras de negócio

## 📸 Sistema de Imagens Médicas

### 🚀 Upload Avançado
- **Upload múltiplo**: Até 10 imagens por evolução
- **Drag & Drop**: Interface intuitiva para arrastar arquivos
- **Preview instantâneo**: Visualização antes do upload
- **Compressão automática**: Otimização sem perda de qualidade
- **Validação rigorosa**: Tipos permitidos (JPEG, PNG, WebP)
- **Limite de tamanho**: Máximo 5MB por arquivo
- **Barra de progresso**: Feedback visual em tempo real
- **Remoção individual**: Gerenciar imagens antes do envio

### 🖼️ Visualização Profissional
- **Modal em tela cheia**: Visualização ampliada das imagens
- **Navegação por setas**: Percorrer múltiplas imagens facilmente
- **Controles de teclado**: ESC para fechar, setas para navegar
- **Contador de posição**: Indicador "1/3", "2/3", etc.
- **Design responsivo**: Adaptado para mobile e desktop
- **Fundo escuro**: Melhor contraste para visualização médica
- **Criação dinâmica**: Modal criado via JavaScript para máxima compatibilidade

### 🔒 Segurança e Performance
- **URLs seguros**: Links temporários via Firebase Storage
- **Isolamento por paciente**: Organização segura no Storage
- **Metadados completos**: Nome, tamanho, data de upload
- **IDs únicos**: Identificação exclusiva por evolução
- **Carregamento lazy**: Otimização para histórico extenso
- **Error handling**: Tratamento robusto de falhas

## 📊 Product Management

### 🎯 Estratégia de Produto

O AppVisita segue uma estratégia de crescimento estruturada com foco no mercado brasileiro de gestão médica hospitalar, utilizando metodologia MoSCoW para priorização de funcionalidades.

**Documentação Estratégica**:
- 📋 **[Product Backlog](docs/PRODUCT_BACKLOG.md)** - Roadmap completo 2025-2027
- 📊 **[Product Strategy](docs/PRODUCT_STRATEGY.md)** - Análise de mercado e positioning
- 💼 **[Executive Summary](docs/EXECUTIVE_SUMMARY.md)** - Resumo executivo para investidores

### 🚀 Roadmap de Alto Nível

#### 2025 Q1-Q2: Consolidação
- ✅ Sistema de notificações em tempo real
- ✅ Relatórios e dashboards avançados
- 🔄 App mobile nativo (iOS/Android)
- ✅ Sistema de backup e auditoria

#### 2025 Q3-Q4: Expansão
- 🔄 API REST completa
- 🔄 Sistema de telemedicina
- 🔄 Multi-tenancy para grandes redes
- 🔄 IA para sugestões clínicas

#### 2026-2027: Inovação
- 🔄 Plataforma de ecosystem médico
- 🔄 IA avançada e machine learning
- 🔄 Realidade aumentada para medicina
- 🔄 Interoperabilidade total (FHIR)

### 💰 Market Opportunity

- **TAM**: US$ 31.5B (Mercado global EMR)
- **SAM**: R$ 540M (4.500 hospitais privados Brasil)
- **SOM**: R$ 27M (Meta 5% market share em 3 anos)

### 📈 Métricas de Negócio

- **North Star Metric**: Reduzir tempo de documentação de 15 para 5 minutos
- **ARR Target 2027**: R$ 35M
- **Market Share Target**: 10% (Brasil)
- **Customer LTV/CAC**: >5:1

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
   - Sistema detecta reinternações automaticamente

2. **Registrar Evolução Completa**:
   - **Texto da evolução**: Descrever quadro clínico
   - **Status do paciente**: Internado / Alta Hospitalar / Óbito
   - **Anexar imagens**: Upload múltiplo com drag & drop
   - **Preview**: Visualizar imagens antes de salvar
   - **Remoção**: Excluir imagens específicas se necessário

3. **Visualizar Perfil Completo do Paciente** 🆕:
   - **Clique no nome**: Acesso direto aos dados completos
   - **Dados cadastrais**: Nome, CPF, idade calculada automaticamente
   - **Histórico completo**: Timeline de todas as evoluções
   - **Estatísticas inteligentes**: Dias internado, total de evoluções, imagens anexadas
   - **Navegação rápida**: Botão para registrar nova evolução diretamente do perfil

4. **Upload de Imagens**:
   - **Arrastar e soltar**: Simplesmente arraste arquivos para a área
   - **Clique para selecionar**: Botão tradicional de seleção
   - **Múltiplas imagens**: Até 10 imagens por evolução
   - **Formatos suportados**: JPEG, PNG, WebP (máx. 5MB cada)
   - **Compressão automática**: Sistema otimiza automaticamente

5. **Visualizar Histórico**:
   - **Buscar por nome ou ID**: Sistema de busca inteligente
   - **Timeline completa**: Histórico cronológico de evoluções
   - **Galeria de imagens**: Miniaturas clicáveis no histórico
   - **Visualização ampliada**: Modal profissional para imagens
   - **Navegação**: Use setas do teclado ou botões na tela

6. **Navegação nas Imagens**:
   - **Clique na miniatura**: Abre visualização em tamanho grande
   - **Teclas de atalho**: 
     - `ESC` para fechar
     - `←` seta esquerda para imagem anterior
     - `→` seta direita para próxima imagem
   - **Botões visuais**: Setas na tela para navegação
   - **Contador**: Indicação da posição atual (ex: "2/5")

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
├── README.md                  # Este arquivo
└── docs/                      # Documentação completa
    ├── PRODUCT_BACKLOG.md     # Roadmap de produto
    ├── PRODUCT_STRATEGY.md    # Estratégia de mercado
    ├── EXECUTIVE_SUMMARY.md   # Resumo executivo
    ├── USER_MANUAL.md         # Manual do usuário
    ├── ARCHITECTURE.md        # Documentação técnica
    └── features/              # Especificações de funcionalidades
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

### Versão Atual (2.6.0)
- ✅ Sistema base completo
- ✅ Upload de imagens funcionando
- ✅ Gestão de equipes operacional
- ✅ Interface responsiva
- ✅ **Visualização completa de perfil do paciente** 🆕
- ✅ Sistema de digitação corrigido
- ✅ Validação inteligente de reinternação

### Próximas Versões
- 🔄 **v2.7.0**: Exportação de relatórios PDF
- 🔄 **v2.8.0**: Gráficos de evolução temporal
- 🔄 **v2.9.0**: Sistema de notificações em tempo real
- 🔄 **v3.0.0**: Telemedicina e IA médica

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