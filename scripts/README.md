# 🛠️ Scripts de Automação - AppVisita

Este diretório contém scripts para automatizar a criação, verificação e monitoramento da documentação do AppVisita.

## 📁 Estrutura

```
scripts/
├── check-docs.sh           # ✅ Verificação CI/CD
├── monitor-docs.py         # 📊 Monitor de docs desatualizadas  
├── create-docs.py          # 📝 Criador de documentação
├── monitor-config.json     # ⚙️ Configurações do monitor
└── README.md              # 📋 Esta documentação
```

## 🔍 check-docs.sh

**Script de verificação para CI/CD** que garante que mudanças no código sejam acompanhadas de atualizações na documentação.

### Uso
```bash
# Executar verificação manual
./scripts/check-docs.sh

# Executar no CI/CD (automático via GitHub Actions)
```

### Funcionalidades
- ✅ Detecta mudanças em arquivos de código
- ✅ Verifica se documentação foi atualizada junto
- ✅ Sugere quais documentos atualizar baseado no arquivo modificado
- ✅ Valida datas nos documentos
- ✅ Gera relatório de conformidade

### Exemplo de Output
```
🔍 Verificando atualização da documentação...
📁 Arquivos modificados/adicionados:
  - app-admin.js
  - docs/USER_MANUAL.md

🎯 Verificando requisitos específicos...
✅ Verificação de documentação aprovada
📊 Relatório:
   - Código modificado: ✅ Sim
   - Docs atualizados: ✅ Sim
   - Arquivos JS: 1 modificados
   - Arquivos de doc: 1 atualizados
```

## 📊 monitor-docs.py

**Monitor de documentação desatualizada** que analisa a idade dos documentos e envia alertas.

### Uso
```bash
# Executar monitoramento básico
python scripts/monitor-docs.py

# Executar com envio de alertas por email
python scripts/monitor-docs.py --send-alerts
```

### Funcionalidades
- 📅 Analisa datas de última modificação
- 🔄 Compara datas entre código e documentação
- 📧 Envia alertas por email
- 💾 Salva relatórios em JSON
- ⚠️ Diferentes níveis de severidade

### Configuração (monitor-config.json)
```json
{
  "email": {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "from_email": "seu-email@gmail.com",
    "from_password": "sua-senha-app",
    "alert_emails": ["admin@appvisita.com"]
  },
  "thresholds": {
    "warning_days": 7,
    "error_days": 14,
    "critical_days": 30
  }
}
```

### Exemplo de Output
```
🔍 Iniciando monitoramento de documentação...
✅ docs/ARCHITECTURE.md atualizado há 2 dias (git)
⚠️ docs/DATABASE.md não atualizado há 8 dias (git)
❌ docs/USER_MANUAL.md DESATUALIZADO há 15 dias (documento)

📊 Resumo:
   Total de documentos: 6
   ✅ Atualizados: 4
   ⚠️ Warnings: 1
   ❌ Desatualizados: 1
```

## 📝 create-docs.py

**Criador de documentação automatizado** usando templates predefinidos.

### Uso
```bash
# Executar criador interativo
python scripts/create-docs.py
```

### Menu Interativo
```
📝 Criador de Documentação AppVisita
==================================================
1. 🆕 Nova Funcionalidade
2. 🐛 Correção de Bug  
3. 🔌 Novo Endpoint de API
4. 📋 Listar documentos existentes
5. 🔍 Verificar templates
0. ❌ Sair
```

### Templates Disponíveis
- **🆕 FEATURE_TEMPLATE.md**: Para novas funcionalidades
- **🐛 BUGFIX_TEMPLATE.md**: Para correções de bugs
- **🔌 API_ENDPOINT_TEMPLATE.md**: Para novos endpoints

### Exemplo de Uso
```bash
🆕 Criando documentação de nova funcionalidade
--------------------------------------------------
Nome da funcionalidade: Dashboard de Estatísticas
Módulo (ex: app-admin.js, app-pacientes.js): app-admin.js
Nome do desenvolvedor: João Silva
Versão: v1.1.0
Objetivo/descrição da funcionalidade: Exibir estatísticas em tempo real

✅ Documentação criada: docs/features/FEATURE_dashboard_de_estatisticas.md
```

## ⚙️ Configuração

### 1. Configurar Email (Opcional)
Edite `scripts/monitor-config.json`:
```json
{
  "email": {
    "from_email": "noreply@suaempresa.com",
    "from_password": "senha-de-app-gmail",
    "alert_emails": ["dev-team@suaempresa.com"]
  }
}
```

### 2. Configurar CI/CD
O arquivo `.github/workflows/documentation-check.yml` está configurado para:
- ✅ Verificar docs em PRs
- 📊 Monitorar docs no main branch  
- 🧪 Validar templates

### 3. Secrets do GitHub (Para alertas por email)
Configure no GitHub repository:
- `SMTP_SERVER`: smtp.gmail.com
- `SMTP_PORT`: 587
- `FROM_EMAIL`: seu-email@gmail.com
- `FROM_PASSWORD`: senha-de-app
- `ALERT_EMAILS`: email1@empresa.com,email2@empresa.com

## 🚀 Uso Diário

### Para Desenvolvedores

#### 1. Antes de fazer commit
```bash
# Verificar se docs estão em dia
./scripts/check-docs.sh
```

#### 2. Ao implementar nova funcionalidade
```bash
# Criar documentação automaticamente
python scripts/create-docs.py
# Escolha opção 1 e preencha os dados
```

#### 3. Ao corrigir bugs
```bash
# Documentar a correção
python scripts/create-docs.py
# Escolha opção 2 e documente o fix
```

### Para Administradores

#### 1. Monitoramento semanal
```bash
# Verificar estado da documentação
python scripts/monitor-docs.py
```

#### 2. Relatórios automáticos
```bash
# Enviar relatório por email (se configurado)
python scripts/monitor-docs.py --send-alerts
```

## 📊 Métricas e Relatórios

### Arquivos de Log
- `logs/docs-monitor-YYYYMMDD-HHMMSS.json`: Relatórios do monitor
- Cada relatório contém:
  - Status de cada documento
  - Problemas encontrados
  - Estatísticas gerais

### Estrutura do Relatório JSON
```json
{
  "timestamp": "2025-01-23T14:30:00",
  "summary": {
    "total_docs": 6,
    "current_docs": 4,
    "warning_docs": 1,
    "outdated_docs": 1
  },
  "docs_status": {
    "docs/USER_MANUAL.md": {
      "status": "current",
      "severity": "info",
      "days_since_update": 2
    }
  },
  "warnings": [],
  "errors": []
}
```

## 🔧 Troubleshooting

### Script não executa
```bash
# Dar permissão de execução
chmod +x scripts/check-docs.sh
chmod +x scripts/monitor-docs.py
chmod +x scripts/create-docs.py
```

### Erro de template não encontrado
```bash
# Verificar se templates existem
python scripts/create-docs.py
# Escolha opção 5 para verificar
```

### Monitor não envia emails
1. Verifique configuração em `monitor-config.json`
2. Use senha de app do Gmail (não a senha normal)
3. Verifique se 2FA está ativado no Gmail

### CI/CD falhando
1. Verifique se todos os scripts têm permissão de execução
2. Confirme que arquivo `.github/workflows/documentation-check.yml` existe
3. Verifique se secrets estão configurados (para alertas)

## 🚀 Próximos Passos

### Melhorias Planejadas
- [ ] **Integração com Slack**: Alertas via webhook
- [ ] **Dashboard web**: Interface visual para métricas
- [ ] **Auto-fix**: Correção automática de datas
- [ ] **Templates customizáveis**: Templates específicos por projeto
- [ ] **Integração com Jira**: Sync com tickets

### Como Contribuir
1. Crie novo template em `templates/`
2. Adicione suporte no `create-docs.py`
3. Atualize configuração no `monitor-config.json`
4. Teste e documente

---

**📞 Suporte**: Para problemas com os scripts, consulte a equipe de desenvolvimento.

*Scripts de automação - AppVisita v1.0.0*
*Última atualização: 23 de Janeiro de 2025* 