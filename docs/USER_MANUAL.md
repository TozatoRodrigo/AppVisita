# 👤 Manual do Usuário - AppVisita

## 📋 Índice
1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Módulo de Pacientes](#módulo-de-pacientes)
4. [Sistema de Evoluções](#sistema-de-evoluções)
5. [Sistema de Imagens Médicas](#sistema-de-imagens-médicas)
6. [Gestão de Equipes](#gestão-de-equipes)
7. [Painel Administrativo](#painel-administrativo)
8. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

## 🌟 Introdução

O **AppVisita** é um sistema completo de gerenciamento médico que permite o acompanhamento de pacientes, registro de evoluções médicas e gestão de equipes hospitalares.

### 🎯 Principais Funcionalidades
- ✅ Cadastro e busca de pacientes
- ✅ Registro de evoluções médicas detalhadas
- ✅ Upload e visualização de imagens médicas
- ✅ Sistema de drag & drop para anexos
- ✅ Galeria profissional com navegação por teclado
- ✅ Organização em equipes médicas
- ✅ Dashboard administrativo com estatísticas
- ✅ Sistema de aprovação de usuários
- ✅ Interface responsiva (funciona em celular/tablet)

## 🚀 Primeiros Passos

### 1. Criando sua Conta

1. **Acesse o sistema** através do navegador
2. **Clique em "Criar conta"** na tela inicial
3. **Preencha seus dados**:
   - Email profissional
   - Senha segura (mínimo 6 caracteres)
4. **Aguarde aprovação** do administrador
5. **Você receberá acesso** após a aprovação

### 2. Primeiro Login

1. **Digite seu email e senha**
2. **Complete seu perfil** (obrigatório):
   - Nome completo
   - CPF
   - Telefone
   - Especialidade médica
   - CRM (número e estado)
3. **Explore o sistema** seguindo este manual

### 3. Interface Principal

```
┌─────────────────────────────────────────┐
│ 📋 AppVisita          👤 Dr. João  [⚙️] │
├─────────────────────────────────────────┤
│ 📊 Dashboard  👥 Pacientes  🏥 Equipes   │
├─────────────────────────────────────────┤
│                                         │
│         [Conteúdo Principal]            │
│                                         │
└─────────────────────────────────────────┘
```

## 👥 Módulo de Pacientes

### Cadastrando um Novo Paciente

1. **Clique em "Adicionar Novo"** na seção Pacientes
2. **Preencha os dados básicos**:
   - Nome completo
   - CPF e RG
   - Data de nascimento
   - Telefone e email
3. **Adicione informações médicas**:
   - Alergias conhecidas
   - Medicamentos em uso
   - Comorbidades
4. **Clique em "Salvar Paciente"**

### Buscando Pacientes

#### Busca Rápida
- Digite o **nome** ou **CPF** na barra de busca
- Os resultados aparecem automaticamente

#### Busca Avançada
1. **Clique no ícone de filtro** 🔍
2. **Configure os filtros**:
   - Faixa etária
   - Convênio
   - Última consulta
3. **Aplique os filtros**

### Editando Dados do Paciente

1. **Localize o paciente** na lista
2. **Clique no botão "Editar"** ✏️
3. **Modifique as informações** necessárias
4. **Salve as alterações**

> **⚠️ Importante**: Sempre verifique os dados antes de salvar!

## 📝 Sistema de Evoluções

### Registrando uma Evolução

1. **Acesse o prontuário do paciente**
2. **Clique em "Nova Evolução"**
3. **Preencha os campos**:

#### Dados Obrigatórios
- **Data e hora** da consulta
- **Queixa principal** do paciente
- **História da doença atual**
- **Exame físico** realizado
- **Avaliação e plano** terapêutico

#### Sinais Vitais (Opcionais)
- Pressão arterial
- Frequência cardíaca
- Temperatura
- Saturação de O₂
- Peso e altura

#### Prescrições
- **Medicamentos** prescritos
- **Posologia** detalhada
- **Orientações** especiais

#### Exames Solicitados
- Lista de **exames complementares**
- **Justificativa clínica**

### Visualizando Evoluções

#### Timeline de Evoluções
```
📅 23/01/2025 - Dr. João Silva
🩺 Retorno - Dor torácica
📋 Paciente evoluindo bem...
[Ver detalhes] [Editar]

📅 20/01/2025 - Dra. Maria Santos  
🩺 Consulta inicial - Hipertensão
📋 Primeira consulta...
[Ver detalhes] [Editar]
```

#### Filtros de Evolução
- **Por período** (última semana, mês, ano)
- **Por médico** responsável
- **Por tipo** de consulta

### Exportando Evoluções

1. **Selecione o paciente**
2. **Clique em "Exportar"** 📄
3. **Escolha o formato**:
   - PDF (recomendado)
   - Texto simples
4. **Define período** se necessário

## 📸 Sistema de Imagens Médicas

### 🚀 Upload de Imagens

#### Como Anexar Imagens a uma Evolução

1. **Abra o formulário de evolução**
2. **Localize a seção "Anexar Imagens"**
3. **Escolha uma das opções**:

##### Opção A: Drag & Drop (Recomendado)
1. **Arraste os arquivos** da sua pasta para a área indicada
2. **Solte os arquivos** na zona de upload
3. **Aguarde o processamento** automático

##### Opção B: Seleção Manual
1. **Clique na área de upload** 📤
2. **Selecione os arquivos** no explorador
3. **Confirme a seleção**

#### Especificações Técnicas
- **Limite**: Até **10 imagens** por evolução
- **Formatos aceitos**: JPEG, PNG, WebP
- **Tamanho máximo**: **5MB por arquivo**
- **Compressão**: Automática para otimização

#### Sistema de Preview
```
┌─────────────────────────────────────┐
│ 📤 Área de Upload                   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ ❌ │ │ ❌ │ │ ❌ │ │ ❌ │    │
│ │IMG1│ │IMG2│ │IMG3│ │IMG4│    │
│ │120K│ │245K│ │180K│ │89K │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
│                                     │
│ ✅ 4 imagens prontas para upload    │
└─────────────────────────────────────┘
```

#### Gerenciando Imagens Antes do Upload
- **❌ Remover**: Clique no X para excluir uma imagem
- **👁️ Visualizar**: Clique na miniatura para ampliar
- **📊 Info**: Veja o tamanho de cada arquivo

### 🖼️ Visualizador Profissional

#### Visualização no Histórico
1. **Acesse o histórico** de evoluções do paciente
2. **Localize evoluções com imagens** (ícone 📸)
3. **Veja a galeria** de miniaturas

#### Modal de Visualização Ampliada
```
┌─────────────────────────────────────┐
│                               ❌    │
│                                     │
│        ┌─────────────────┐          │
│      ◀ │                 │ ▶        │
│        │   IMAGEM AMPLA  │          │
│        │                 │          │
│        └─────────────────┘          │
│                                     │
│              📊 2 / 5               │
└─────────────────────────────────────┘
```

#### Controles de Navegação

##### Teclado (Recomendado)
- **ESC**: Fechar visualizador
- **← Seta Esquerda**: Imagem anterior
- **→ Seta Direita**: Próxima imagem

##### Mouse/Touch
- **❌ Botão Fechar**: Canto superior direito
- **◀ ▶ Setas**: Laterais da imagem
- **Clique fora**: Fecha o visualizador

##### Recursos Visuais
- **Contador**: Mostra posição atual (ex: "3/7")
- **Fundo escuro**: Melhor contraste para análise
- **Zoom responsivo**: Adapta ao tamanho da tela

### 🔒 Segurança e Organização

#### Organização no Servidor
```
Firebase Storage/
├── evolucoes/
│   ├── paciente_123/
│   │   ├── evolucao_001/
│   │   │   ├── imagem1.jpg
│   │   │   └── imagem2.png
│   │   └── evolucao_002/
│   │       └── exame_raioX.jpg
│   └── paciente_456/
│       └── evolucao_001/
│           └── resultado_lab.png
```

#### Recursos de Segurança
- **URLs temporárias**: Links seguros com expiração
- **Isolamento**: Imagens separadas por paciente
- **Metadados**: Rastreamento completo de uploads
- **Backup automático**: Firebase garante redundância

### 📋 Boas Práticas para Imagens

#### ✅ O que Anexar
- **Exames complementares**: Raio-X, tomografia, ressonância
- **Resultados laboratoriais**: Laudos e gráficos
- **Feridas e lesões**: Evolução do tratamento
- **Prescrições**: Medicamentos e orientações
- **Documentos relevantes**: Atestados e relatórios

#### ❌ O que Evitar
- **Imagens pessoais** não relacionadas ao tratamento
- **Documentos confidenciais** de outros pacientes
- **Arquivos muito grandes** (acima de 5MB)
- **Formatos não suportados** (GIF, TIFF, BMP)

#### 💡 Dicas de Qualidade
- **Boa iluminação**: Garante legibilidade
- **Foco adequado**: Evite imagens desfocadas
- **Orientação correta**: Mantenha documentos na posição certa
- **Resolução suficiente**: Para permitir análise detalhada

### 🚨 Resolução de Problemas

#### Upload Falhando
1. **Verifique a conexão** com a internet
2. **Confirme o formato** do arquivo (JPEG, PNG, WebP)
3. **Reduza o tamanho** se maior que 5MB
4. **Tente novamente** após alguns segundos

#### Imagens Não Aparecem
1. **Aguarde alguns segundos** para carregamento
2. **Recarregue a página** (F5)
3. **Verifique sua conexão** com a internet
4. **Entre em contato** com o suporte se persistir

#### Modal Não Abre
1. **Clique diretamente** na miniatura da imagem
2. **Tente um navegador diferente** (Chrome recomendado)
3. **Desabilite bloqueadores** de popup temporariamente
4. **Limpe o cache** do navegador

## 🏥 Gestão de Equipes

### Visualizando suas Equipes

1. **Acesse a seção "Equipes"**
2. **Veja suas equipes ativas**:
   - Nome da equipe
   - Número de membros
   - Pacientes atendidos

### Trabalhando em Equipe

#### Pacientes Compartilhados
- Pacientes de **equipes** são visíveis para **todos os membros**
- **Evoluções** mostram qual médico registrou
- **Comunicação** entre membros facilitada

#### Responsabilidades
- **Todos os membros** podem adicionar evoluções
- **Dados sensíveis** são protegidos
- **Histórico completo** é mantido

## ⚙️ Painel Administrativo

> **👮‍♂️ Apenas para Administradores**

### Dashboard Principal

#### Estatísticas em Tempo Real
- **Total de pacientes** cadastrados
- **Médicos aprovados** no sistema
- **Equipes ativas**
- **Evoluções registradas** hoje

### Gestão de Usuários

#### Aprovando Novos Médicos
1. **Acesse "Usuários"** no painel admin
2. **Visualize usuários pendentes**
3. **Clique em "Aprovar"** ✅
4. **Confirme a aprovação**

#### Visualizando Detalhes
- **Dados pessoais** do médico
- **Informações do CRM**
- **Data de cadastro**
- **Status atual**

### Gestão de Equipes

#### Criando Nova Equipe
1. **Clique em "Nova Equipe"**
2. **Preencha informações**:
   - Nome da equipe
   - Descrição/especialidade
3. **Selecione médicos** membros
4. **Salve a equipe**

#### Editando Equipes
1. **Localize a equipe** na lista
2. **Clique em "Editar"** ✏️
3. **Modifique membros** ou informações
4. **Salve as alterações**

#### Excluindo Equipes
1. **Clique em "Excluir"** 🗑️
2. **Confirme a exclusão**
3. **⚠️ Ação irreversível!**

## 💡 Dicas e Boas Práticas

### Para Médicos

#### ✅ Registro de Evoluções
- **Registre evoluções** logo após a consulta
- **Seja detalhado** mas **objetivo**
- **Use linguagem técnica** apropriada
- **Documente exame físico** completo

#### ✅ Organização
- **Mantenha dados atualizados** dos pacientes
- **Use filtros** para encontrar informações rapidamente
- **Exporte relatórios** quando necessário

#### ✅ Segurança
- **Nunca compartilhe** sua senha
- **Faça logout** ao sair
- **Verifique dados** antes de salvar

### Para Administradores

#### ✅ Aprovação de Usuários
- **Verifique CRM** antes de aprovar
- **Confirme identidade** do médico
- **Monitore usuários** ativos

#### ✅ Gestão de Equipes
- **Organize por especialidade**
- **Mantenha equipes atualizadas**
- **Remova membros** inativos

#### ✅ Monitoramento
- **Acompanhe estatísticas** diariamente
- **Verifique performance** do sistema
- **Mantenha backups** atualizados

### Atalhos do Teclado

| Ação | Atalho |
|------|--------|
| Buscar paciente | `Ctrl + F` |
| Nova evolução | `Ctrl + N` |
| Salvar | `Ctrl + S` |
| Voltar | `Esc` |

### Performance

#### Para Melhor Experiência
- **Use navegador atualizado** (Chrome, Firefox, Safari)
- **Conexão estável** com internet
- **Resolução mínima** 1024x768
- **JavaScript habilitado**

## ❓ Problemas Comuns

### Não Consigo Fazer Login
1. **Verifique email** e senha
2. **Confirme se foi aprovado** pelo admin
3. **Tente resetar senha** se necessário
4. **Contate suporte** se persistir

### Não Vejo Alguns Pacientes
1. **Verifique filtros** aplicados
2. **Confirme se é membro** da equipe
3. **Pacientes podem ser** de outro médico

### Sistema Está Lento
1. **Feche abas desnecessárias**
2. **Verifique sua conexão**
3. **Atualize a página** (F5)
4. **Contate suporte** se persistir

### Erro ao Salvar Dados
1. **Verifique conexão** com internet
2. **Confirme campos obrigatórios**
3. **Tente novamente** em alguns minutos
4. **Contate suporte** com detalhes do erro

## 📞 Suporte

### Canais de Atendimento
- **Email**: suporte@appvisita.com
- **Telefone**: [inserir telefone]
- **Horário**: Segunda a Sexta, 8h às 18h

### Informações para Suporte
Ao entrar em contato, tenha em mãos:
- **Seu email** de login
- **Descrição detalhada** do problema
- **Mensagens de erro** (se houver)
- **Navegador** utilizado

---

**💡 Dica Final**: Este manual é atualizado regularmente. Verifique sempre a versão mais recente!

*Manual do usuário - Versão 1.0.0*
*Última atualização: 23 de Janeiro de 2025* 