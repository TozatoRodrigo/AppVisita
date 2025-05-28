# 🏥 AppVisita - Sistema Profissional de Gestão Médica

[![Versão](https://img.shields.io/badge/versão-2.0.0-blue.svg)](https://github.com/seu-usuario/AppVisita)
[![Status](https://img.shields.io/badge/status-Produção-green.svg)](https://github.com/seu-usuario/AppVisita)
[![Licença](https://img.shields.io/badge/licença-MIT-yellow.svg)](LICENSE)

Sistema completo de gestão médica com evoluções, equipes e anexos. Seguro, eficiente e compatível com LGPD.

## 🚀 Funcionalidades Principais

### 👨‍⚕️ **Gestão de Pacientes**
- ✅ Cadastro completo de pacientes
- ✅ Busca inteligente com sugestões em tempo real
- ✅ Histórico completo de evoluções
- ✅ Status de internação (Internado/Alta/Óbito)
- ✅ Anexos de imagens (até 10 por evolução)
- ✅ Filtros avançados por equipe e status

### 📝 **Sistema de Evoluções**
- ✅ Registro detalhado de evoluções médicas
- ✅ Upload múltiplo de imagens (JPG, PNG, GIF)
- ✅ Visualizador de imagens com navegação
- ✅ Histórico cronológico completo
- ✅ Validação de dados em tempo real

### 👥 **Gestão de Equipes Médicas**
- ✅ Criação e edição de equipes
- ✅ Atribuição de médicos às equipes
- ✅ Filtros por equipe médica
- ✅ Gestão de membros da equipe
- ✅ Interface administrativa completa

### 🔐 **Sistema de Administração**
- ✅ Painel administrativo completo
- ✅ Aprovação de novos usuários
- ✅ Gestão de equipes médicas
- ✅ Estatísticas em tempo real
- ✅ Controle de acesso por perfil

### 📊 **Dashboard e Relatórios**
- ✅ Estatísticas em tempo real
- ✅ Contadores de pacientes, médicos e equipes
- ✅ Lista de usuários pendentes
- ✅ Métricas de evolução do sistema

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo e moderno
- **JavaScript ES6+** - Lógica da aplicação
- **Font Awesome** - Ícones profissionais
- **Google Fonts** - Tipografia Inter

### **Backend & Database**
- **Firebase Authentication** - Autenticação segura
- **Cloud Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de imagens
- **Node.js** - Servidor de desenvolvimento

### **Arquitetura**
- **PWA** - Progressive Web App
- **Responsive Design** - Mobile-first
- **Modular Architecture** - Código organizado
- **Real-time Updates** - Sincronização em tempo real

## 📦 Instalação e Configuração

### **Pré-requisitos**
- Node.js 16+ instalado
- Conta no Firebase
- Git instalado

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/AppVisita.git
cd AppVisita
```

### **2. Configuração do Firebase**

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative Authentication (Email/Password)
4. Ative Cloud Firestore
5. Ative Storage
6. Copie as configurações do projeto

### **3. Configuração Local**

Edite o arquivo `script-otimizado.js` com suas configurações:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id"
};
```

### **4. Configuração do Administrador**

No arquivo `script-otimizado.js`, defina o email do administrador:

```javascript
window.ADMIN_EMAIL = 'seu-email-admin@exemplo.com';
```

### **5. Iniciar o Servidor**

```bash
# Instalar dependências (se houver package.json)
npm install

# Iniciar servidor de desenvolvimento
node server.js
```

### **6. Acessar o Sistema**

Abra seu navegador e acesse: `http://localhost:3000`

## 👤 Primeiro Acesso

### **1. Criar Conta de Administrador**
1. Acesse o sistema
2. Clique em "Criar nova conta"
3. Use o email definido como ADMIN_EMAIL
4. Complete o cadastro

### **2. Configurar Dados Complementares**
1. Após o login, preencha seus dados complementares
2. Nome completo, CPF, telefone, especialidade, CRM

### **3. Criar Primeira Equipe**
1. Acesse "Administração" → "Equipes"
2. Clique em "Nova Equipe"
3. Preencha nome e descrição
4. Selecione médicos da equipe

## 📱 Como Usar

### **Cadastrar Paciente**
1. Acesse "Pacientes Pendentes"
2. Clique em "Adicionar Paciente"
3. Preencha os dados obrigatórios
4. Selecione a equipe médica
5. Salve o cadastro

### **Registrar Evolução**
1. Encontre o paciente na lista
2. Clique em "Registrar Evolução"
3. Escreva a evolução médica
4. Defina o status (Internado/Alta/Óbito)
5. Anexe imagens se necessário
6. Salve a evolução

### **Gerenciar Equipes**
1. Acesse "Administração" (apenas admin)
2. Vá para aba "Equipes"
3. Clique em "Nova Equipe" ou "Editar"
4. Configure nome, descrição e membros
5. Salve as alterações

### **Aprovar Usuários**
1. Acesse "Administração" → "Usuários"
2. Visualize usuários pendentes
3. Clique em "Aprovar" ou "Detalhes"
4. Confirme a aprovação

## 🔧 Funcionalidades Técnicas

### **Sistema de Busca Inteligente**
- Busca por nome, ID de internação
- Sugestões em tempo real
- Filtros por equipe e status
- Ordenação personalizada

### **Upload de Imagens**
- Múltiplos formatos (JPG, PNG, GIF)
- Máximo 10 imagens por evolução
- Limite de 5MB por imagem
- Preview antes do upload
- Compressão automática

### **Segurança e Privacidade**
- Autenticação Firebase
- Validação de dados
- Logs de auditoria
- Conformidade com LGPD
- Controle de acesso por perfil

### **Performance**
- Carregamento lazy de imagens
- Cache inteligente
- Otimização de consultas
- Compressão de assets

## 📊 Estrutura do Banco de Dados

### **Coleções Principais**

#### **usuarios**
```javascript
{
  id: "user-id",
  email: "medico@exemplo.com",
  aprovado: true,
  dadosComplementaresPreenchidos: true,
  nomeCompleto: "Dr. João Silva",
  cpf: "123.456.789-00",
  telefone: "(11) 99999-9999",
  especialidade: "Cardiologia",
  crm: {
    numero: "123456",
    estado: "SP"
  },
  dataCriacao: timestamp
}
```

#### **pacientes**
```javascript
{
  id: "paciente-id",
  nome: "Maria Santos",
  idInternacao: "INT-2024-001",
  dataNascimento: "1980-05-15",
  status: "internado", // internado, alta, obito
  equipeId: "equipe-id",
  evolucoes: [
    {
      id: "evolucao-id",
      texto: "Paciente estável...",
      status: "internado",
      medicoId: "medico-id",
      dataRegistro: timestamp,
      imagens: ["url1", "url2"]
    }
  ],
  dataCriacao: timestamp
}
```

#### **equipes**
```javascript
{
  id: "equipe-id",
  nome: "Cardiologia A",
  descricao: "Equipe de cardiologia do turno A",
  membros: ["medico-id-1", "medico-id-2"],
  dataCriacao: timestamp,
  ultimaAtualizacao: timestamp
}
```

## 🚀 Deploy em Produção

### **Firebase Hosting**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto
firebase init hosting

# Deploy
firebase deploy
```

### **Configurações de Produção**
1. Configure domínio personalizado
2. Ative SSL/HTTPS
3. Configure regras de segurança
4. Otimize performance
5. Configure backup automático

## 🔒 Segurança

### **Regras do Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Apenas usuários aprovados podem acessar pacientes
    match /pacientes/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.aprovado == true;
    }
    
    // Apenas usuários aprovados podem acessar equipes
    match /equipes/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.aprovado == true;
    }
  }
}
```

### **Regras do Storage**
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

## 🧪 Testes

### **Executar Testes**
```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e
```

### **Cobertura de Testes**
- ✅ Autenticação de usuários
- ✅ CRUD de pacientes
- ✅ Sistema de evoluções
- ✅ Upload de imagens
- ✅ Gestão de equipes
- ✅ Painel administrativo

## 📈 Monitoramento

### **Métricas Disponíveis**
- Total de pacientes cadastrados
- Número de evoluções registradas
- Usuários ativos
- Equipes médicas ativas
- Performance do sistema

### **Logs e Auditoria**
- Logs de autenticação
- Logs de operações CRUD
- Logs de upload de arquivos
- Logs de erros do sistema

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- Use ESLint para JavaScript
- Siga convenções de nomenclatura
- Documente funções complexas
- Escreva testes para novas features

## 📞 Suporte

### **Documentação**
- [Wiki do Projeto](https://github.com/seu-usuario/AppVisita/wiki)
- [FAQ](https://github.com/seu-usuario/AppVisita/wiki/FAQ)
- [Troubleshooting](https://github.com/seu-usuario/AppVisita/wiki/Troubleshooting)

### **Contato**
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/AppVisita/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/AppVisita/discussions)
- **Email**: suporte@appvisita.com

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Profissionais de saúde que testaram o sistema
- Comunidade Firebase
- Contribuidores do projeto

---

**AppVisita** - Transformando a gestão médica com tecnologia moderna e segura.

*Desenvolvido com ❤️ para profissionais de saúde*