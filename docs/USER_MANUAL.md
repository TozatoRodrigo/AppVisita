# 👤 Manual do Usuário - AppVisita

## 📋 Índice
1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Módulo de Pacientes](#módulo-de-pacientes)
4. [Sistema de Evoluções](#sistema-de-evoluções)
5. [Gestão de Equipes](#gestão-de-equipes)
6. [Painel Administrativo](#painel-administrativo)
7. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

## 🌟 Introdução

O **AppVisita** é um sistema completo de gerenciamento médico que permite o acompanhamento de pacientes, registro de evoluções médicas e gestão de equipes hospitalares.

### 🎯 Principais Funcionalidades
- ✅ Cadastro e busca de pacientes
- ✅ Registro de evoluções médicas detalhadas
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