# 🤝 Guia de Contribuição - AppVisita

Obrigado por considerar contribuir com o AppVisita! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Melhorias](#sugerir-melhorias)
- [Documentação](#documentação)

## 📜 Código de Conduta

Este projeto adere ao [Código de Conduta do Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você deve seguir este código.

### Nossos Compromissos

- **Inclusão**: Criar um ambiente acolhedor para todos
- **Respeito**: Tratar todos com dignidade e respeito
- **Colaboração**: Trabalhar juntos de forma construtiva
- **Profissionalismo**: Manter padrões profissionais

## 🚀 Como Contribuir

### Tipos de Contribuição

1. **🐛 Correção de Bugs**
   - Identifique e corrija problemas existentes
   - Adicione testes para evitar regressões

2. **✨ Novas Funcionalidades**
   - Implemente recursos solicitados
   - Proponha melhorias inovadoras

3. **📚 Documentação**
   - Melhore a documentação existente
   - Adicione exemplos e tutoriais

4. **🧪 Testes**
   - Aumente a cobertura de testes
   - Melhore a qualidade dos testes

5. **🎨 Interface**
   - Melhore a experiência do usuário
   - Otimize a responsividade

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- **Node.js** 16+ 
- **npm** 8+
- **Git**
- **Conta Firebase**

### Configuração Local

1. **Fork o repositório**
   ```bash
   # Clique em "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/SEU-USUARIO/AppVisita.git
   cd AppVisita
   ```

3. **Configure o upstream**
   ```bash
   git remote add upstream https://github.com/USUARIO-ORIGINAL/AppVisita.git
   ```

4. **Instale dependências**
   ```bash
   npm install
   ```

5. **Configure Firebase**
   - Crie um projeto no Firebase Console
   - Configure Authentication, Firestore e Storage
   - Atualize `script-otimizado.js` com suas configurações

6. **Inicie o servidor**
   ```bash
   npm run dev
   ```

### Estrutura do Projeto

```
AppVisita/
├── app-*.js              # Módulos principais
├── css/                  # Estilos
├── js/services/          # Serviços
├── tests/                # Testes
├── docs/                 # Documentação
└── scripts/              # Scripts de build
```

## 📝 Padrões de Código

### JavaScript

```javascript
// ✅ Bom
const carregarPacientes = async () => {
  try {
    const pacientes = await AppVisita.Firebase.Pacientes.obterTodos();
    return pacientes;
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
    throw error;
  }
};

// ❌ Ruim
function carregarPacientes() {
  AppVisita.Firebase.Pacientes.obterTodos().then(function(pacientes) {
    return pacientes;
  }).catch(function(error) {
    console.log(error);
  });
}
```

### CSS

```css
/* ✅ Bom - Use variáveis CSS */
.btn-primary {
  background: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

/* ❌ Ruim - Valores hardcoded */
.btn-primary {
  background: #4285f4;
  padding: 16px;
  border-radius: 8px;
}
```

### Convenções de Nomenclatura

- **Variáveis**: `camelCase`
- **Funções**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Classes CSS**: `kebab-case`
- **IDs**: `kebab-case`

### Comentários

```javascript
/**
 * Carrega todos os pacientes do Firebase
 * @returns {Promise<Array>} Lista de pacientes
 * @throws {Error} Erro ao carregar dados
 */
async function carregarPacientes() {
  // Implementação...
}
```

## 🔄 Processo de Pull Request

### 1. Preparação

```bash
# Atualize seu fork
git checkout main
git pull upstream main
git push origin main

# Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade
```

### 2. Desenvolvimento

- Faça commits pequenos e focados
- Use mensagens de commit descritivas
- Adicione testes para novas funcionalidades
- Mantenha a documentação atualizada

### 3. Testes

```bash
# Execute todos os testes
npm test

# Verifique o linting
npm run lint

# Execute testes E2E
npm run test:e2e
```

### 4. Commit

```bash
# Mensagens de commit seguem o padrão:
git commit -m "feat: adiciona busca avançada de pacientes"
git commit -m "fix: corrige erro no upload de imagens"
git commit -m "docs: atualiza guia de instalação"
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### 5. Pull Request

1. **Push para seu fork**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

2. **Abra PR no GitHub**
   - Título descritivo
   - Descrição detalhada
   - Screenshots se aplicável
   - Referência a issues relacionadas

3. **Template de PR**
   ```markdown
   ## Descrição
   Breve descrição das mudanças.

   ## Tipo de Mudança
   - [ ] Bug fix
   - [ ] Nova funcionalidade
   - [ ] Breaking change
   - [ ] Documentação

   ## Como Testar
   1. Passo 1
   2. Passo 2
   3. Passo 3

   ## Screenshots
   (Se aplicável)

   ## Checklist
   - [ ] Código segue os padrões do projeto
   - [ ] Testes passando
   - [ ] Documentação atualizada
   - [ ] PR auto-revisado
   ```

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Teste na versão mais recente
3. Colete informações do ambiente

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Versão: [e.g. 22]

**Informações Adicionais**
Qualquer outra informação relevante.
```

## 💡 Sugerir Melhorias

### Template de Feature Request

```markdown
**A sua solicitação está relacionada a um problema?**
Descrição clara do problema.

**Descreva a solução que você gostaria**
Descrição clara da funcionalidade desejada.

**Descreva alternativas consideradas**
Outras soluções ou funcionalidades consideradas.

**Informações Adicionais**
Screenshots, mockups, ou exemplos.
```

## 📚 Documentação

### Contribuindo com Docs

1. **README.md**: Informações gerais
2. **TECHNICAL_DOCS.md**: Documentação técnica
3. **API.md**: Documentação da API
4. **CHANGELOG.md**: Histórico de mudanças

### Padrões de Documentação

- Use Markdown
- Inclua exemplos de código
- Mantenha atualizado
- Use linguagem clara e objetiva

## 🧪 Testes

### Tipos de Teste

1. **Unitários**: Testam funções isoladas
2. **Integração**: Testam módulos juntos
3. **E2E**: Testam fluxos completos

### Escrevendo Testes

```javascript
// tests/unit/auth.test.js
describe('Authentication Module', () => {
  beforeEach(() => {
    // Setup
  });

  test('should login with valid credentials', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'password123';

    // Act
    const result = await AuthModule.login(email, password);

    // Assert
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
});
```

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

## 🎯 Roadmap

### Próximas Versões

#### v2.1.0
- [ ] Relatórios avançados
- [ ] Exportação de dados
- [ ] Notificações push

#### v2.2.0
- [ ] API REST
- [ ] Mobile app
- [ ] Integração com sistemas externos

## 🆘 Precisa de Ajuda?

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/AppVisita/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/AppVisita/discussions)
- **Email**: dev@appvisita.com

## 🙏 Reconhecimento

Todos os contribuidores são reconhecidos no arquivo [CONTRIBUTORS.md](CONTRIBUTORS.md).

---

**Obrigado por contribuir com o AppVisita!** 🏥❤️

Sua contribuição ajuda a melhorar a gestão médica e o cuidado com pacientes. 