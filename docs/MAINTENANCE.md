# 🔧 Manutenção e Suporte - AppVisita

## 📋 Índice
1. [Rotinas de Manutenção](#rotinas-de-manutenção)
2. [Monitoramento do Sistema](#monitoramento-do-sistema)
3. [Procedures de Emergência](#procedures-de-emergência)
4. [Backup e Recuperação](#backup-e-recuperação)
5. [Atualizações e Deploys](#atualizações-e-deploys)
6. [Troubleshooting Comum](#troubleshooting-comum)

## 🔄 Rotinas de Manutenção

### Diárias

#### ✅ Checklist Diário
- [ ] Verificar status dos serviços Firebase
- [ ] Monitorar métricas de uso (reads/writes)
- [ ] Verificar logs de erro no console
- [ ] Confirmar backups automáticos
- [ ] Verificar usuários pendentes de aprovação

#### Comandos Úteis
```bash
# Verificar status dos serviços
curl -s https://status.firebase.google.com/incidents.json

# Verificar logs da aplicação (se usando servidor próprio)
tail -f /var/log/nginx/access.log | grep "AppVisita"

# Verificar uso de cota Firebase
firebase projects:list
```

### Semanais

#### 📊 Relatório Semanal
- Número de usuários ativos
- Total de pacientes cadastrados
- Evoluções registradas
- Estatísticas de uso por módulo
- Incidents reportados

#### Script de Relatório
```javascript
// Execute no console Firebase ou em script Node.js
async function relatorioSemanal() {
  const db = firebase.firestore();
  const agora = new Date();
  const semanaPassada = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Usuários ativos na semana
  const usuariosAtivos = await db.collection('usuarios')
    .where('ultimoLogin', '>=', semanaPassada)
    .get();
  
  // Pacientes cadastrados na semana
  const novosPacientes = await db.collection('pacientes')
    .where('dataCriacao', '>=', semanaPassada)
    .get();
  
  console.log('=== RELATÓRIO SEMANAL ===');
  console.log(`Usuários ativos: ${usuariosAtivos.size}`);
  console.log(`Novos pacientes: ${novosPacientes.size}`);
  console.log(`Período: ${semanaPassada.toLocaleDateString()} - ${agora.toLocaleDateString()}`);
}
```

### Mensais

#### 🗂️ Manutenção Mensal
- Limpeza de dados temporários
- Análise de performance
- Revisão de regras de segurança
- Auditoria de acessos
- Planejamento de capacidade

## 📊 Monitoramento do Sistema

### Métricas Críticas

#### Firebase Metrics
```javascript
// Monitorar via Firebase Console ou API
const metricas = {
  'document_reads_per_day': 'max 10,000',
  'document_writes_per_day': 'max 5,000',
  'active_connections': 'max 100',
  'storage_size': 'max 1GB',
  'bandwidth_usage': 'max 10GB/mês'
};
```

#### Alertas Automáticos
Configure alertas para:
- Uso de quota > 80%
- Erro rate > 5%
- Latência > 2 segundos
- Falhas de autenticação > 10/min

### Dashboard de Monitoramento

#### KPIs Principais
```html
<!-- Exemplo de dashboard simples -->
<div class="monitoring-dashboard">
  <div class="metric-card">
    <h3>Usuários Online</h3>
    <span id="usuarios-online">--</span>
  </div>
  <div class="metric-card">
    <h3>Pacientes Ativos</h3>
    <span id="pacientes-ativos">--</span>
  </div>
  <div class="metric-card">
    <h3>Evoluções Hoje</h3>
    <span id="evolucoes-hoje">--</span>
  </div>
</div>
```

## 🚨 Procedures de Emergência

### Incident Response

#### 1. Sistema Indisponível
```bash
# Passos de diagnóstico
1. Verificar status Firebase: https://status.firebase.google.com/
2. Testar conectividade: ping firebase.googleapis.com
3. Verificar configuração de DNS
4. Verificar certificados SSL
5. Verificar regras de firewall

# Comunicação
- Notificar administradores
- Postar status em canal de comunicação
- Documentar incident
```

#### 2. Perda de Dados
```bash
# Passos imediatos
1. PARAR todas as operações de escrita
2. Identificar escopo da perda
3. Verificar backups disponíveis
4. Isolar causa raiz
5. Iniciar procedimento de restore

# Comando de restore (exemplo)
gcloud firestore import gs://bucket-backup/backup-YYYYMMDD
```

#### 3. Brecha de Segurança
```bash
# Ações imediatas
1. Identificar usuários afetados
2. Resetar passwords comprometidos
3. Revisar regras de acesso
4. Verificar logs de audit
5. Notificar usuários se necessário

# Revogar todas as sessões
firebase auth:import --hash-algo=PBKDF2_SHA256 --rounds=120000 users.json
```

### Escalation Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| **Critical** | 15 min | Dev Lead + Admin |
| **High** | 1 hour | Dev Team |
| **Medium** | 4 hours | Support Team |
| **Low** | 24 hours | Documentation |

## 💾 Backup e Recuperação

### Estratégia de Backup

#### Automático (Recomendado)
```bash
# Script de backup automático (cron job)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BUCKET="appvisita-backups"

# Export Firestore
gcloud firestore export gs://${BUCKET}/backup_${DATE} --async

# Backup de configurações
cp /path/to/config/* /backup/config_${DATE}/

# Cleanup backups antigos (manter 30 dias)
gsutil -m rm -r gs://${BUCKET}/backup_$(date -d '30 days ago' +%Y%m%d)*
```

#### Manual
```bash
# Backup manual para momentos críticos
firebase firestore:delete --recursive -y  # CUIDADO!
gcloud firestore export gs://backup-critical/$(date +%Y%m%d_%H%M%S)
```

### Teste de Recuperação

#### Procedimento Mensal
```bash
# 1. Criar ambiente de teste
firebase projects:create appvisita-test

# 2. Restaurar backup
gcloud firestore import gs://backup/latest --project=appvisita-test

# 3. Verificar integridade dos dados
# 4. Testar funcionalidades críticas
# 5. Documentar resultados
```

## 🚀 Atualizações e Deploys

### Processo de Deploy

#### 1. Ambiente de Staging
```bash
# Configurar staging
cp .env.production .env.staging
sed -i 's/PROD/STAGING/g' .env.staging

# Deploy para staging
python3 -m http.server 8001 # Porta diferente

# Testes automáticos
npm run test:staging
```

#### 2. Deploy de Produção
```bash
# Checklist pré-deploy
- [ ] Backup atual realizado
- [ ] Testes passando em staging
- [ ] Aprovação de mudanças
- [ ] Janela de manutenção comunicada

# Deploy
rsync -av --exclude='.git' ./ /var/www/appvisita/
systemctl reload nginx

# Verificação pós-deploy
curl -f https://seu-dominio.com/health
```

### Rollback Procedure
```bash
# Em caso de problemas
1. Manter backup da versão anterior
2. Comando de rollback rápido:
   git checkout <previous-commit>
   rsync -av ./ /var/www/appvisita/
3. Verificar funcionamento
4. Comunicar aos usuários
```

## 🔧 Troubleshooting Comum

### Problemas Frequentes

#### 1. "Firebase not defined"
```javascript
// Verificar carregamento dos scripts
console.log('Firebase:', typeof firebase);
console.log('Firestore:', typeof firebase.firestore);

// Solução: Verificar ordem dos scripts no HTML
```

#### 2. Permissão negada no Firestore
```javascript
// Verificar regras de segurança
// Temporariamente para debug:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // APENAS PARA DEBUG!
    }
  }
}
```

#### 3. Usuário não consegue fazer login
```bash
# Verificações:
1. Email está correto?
2. Senha atende critérios?
3. Usuário existe no Firebase Auth?
4. Domínio está autorizado?
5. Regras de Firestore permitem acesso?
```

#### 4. Performance lenta
```javascript
// Verificar queries
console.time('query');
db.collection('pacientes').get().then(() => {
  console.timeEnd('query');
});

// Otimizações:
- Adicionar índices
- Usar limit() nas queries
- Implementar paginação
- Cache de dados frequentes
```

### Logs e Debug

#### Ativar Debug Mode
```javascript
// No console do navegador
localStorage.setItem('debug', 'true');
firebase.firestore.setLogLevel('debug');

// Verificar logs detalhados
console.log(window.AppVisita);
```

#### Logs Úteis
```bash
# Logs do servidor (se usando próprio)
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Logs do Firebase (via Console)
# Firebase Console > Functions > Logs
```

## 📞 Contatos de Emergência

### Equipe Técnica
- **Tech Lead**: [nome] - [telefone] - [email]
- **DevOps**: [nome] - [telefone] - [email]
- **DBA**: [nome] - [telefone] - [email]

### Fornecedores
- **Firebase Support**: firebase.google.com/support
- **Hosting Provider**: [contato]
- **CDN Provider**: [contato]

## 📝 Checklist de Handover

### Para Nova Equipe de Suporte
- [ ] Acesso ao Firebase Console
- [ ] Acesso ao repositório de código
- [ ] Credenciais de produção
- [ ] Documentação lida e compreendida
- [ ] Teste de procedures críticos
- [ ] Contatos atualizados
- [ ] Ferramentas de monitoramento configuradas

---

**📞 Suporte 24/7**: [telefone]
**Email**: suporte@appvisita.com
**Status Page**: status.appvisita.com

*Documentação de manutenção mantida pela equipe de DevOps*
*Última atualização: 23 de Janeiro de 2025* 