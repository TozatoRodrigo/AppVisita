# 🔌 [Nome do Endpoint] - AppVisita API

> **Template para documentação de novos endpoints de API**
> 
> **⚠️ INSTRUÇÕES:**
> 1. Substitua todos os textos entre [colchetes]
> 2. Remova esta seção de instruções
> 3. Atualize as datas no final

## 📋 Informações do Endpoint

**URL**: `[/api/v1/endpoint]`  
**Método**: `[GET | POST | PUT | DELETE | PATCH]`  
**Versão**: `[v1.0.0]`  
**Módulo**: `[Nome do módulo]`  
**Implementado por**: `[Nome do desenvolvedor]`  
**Data de implementação**: `[DD/MM/YYYY]`

### 🎯 Propósito
[Descrição clara do que este endpoint faz]

### 🔒 Autenticação
- [ ] **Autenticação obrigatória**: Firebase Auth Token
- [ ] **Permissões específicas**: [Admin | Médico | Usuário logado]
- [ ] **Rate limiting**: [X requests por minuto]

## 📤 Request

### Headers Obrigatórios
```http
Authorization: Bearer [firebase-token]
Content-Type: application/json
```

### Headers Opcionais
```http
X-Request-ID: [uuid-para-tracking]
Accept-Language: pt-BR
```

### Parâmetros da URL
| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `[param1]` | `string` | ✅ | [Descrição] | `abc123` |
| `[param2]` | `number` | ❌ | [Descrição] | `42` |

### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão | Exemplo |
|-----------|------|-------------|-----------|---------|---------|
| `[limit]` | `number` | ❌ | Limite de resultados | `25` | `?limit=50` |
| `[offset]` | `number` | ❌ | Offset para paginação | `0` | `?offset=100` |
| `[filter]` | `string` | ❌ | Filtro de busca | - | `?filter=nome` |

### Body do Request (se aplicável)
```json
{
  "campo1": "string",
  "campo2": 123,
  "campo3": {
    "subcampo1": "valor",
    "subcampo2": true
  },
  "campo4": ["item1", "item2"]
}
```

#### Validações do Body
| Campo | Tipo | Obrigatório | Validação | Exemplo |
|-------|------|-------------|-----------|---------|
| `campo1` | `string` | ✅ | Min: 1, Max: 100 | `"exemplo"` |
| `campo2` | `number` | ❌ | Min: 0, Max: 999 | `42` |
| `campo3` | `object` | ❌ | Estrutura específica | `{...}` |

## 📥 Response

### Status Codes
| Código | Descrição | Quando ocorre |
|--------|-----------|---------------|
| `200` | Sucesso | Operação realizada com sucesso |
| `201` | Criado | Recurso criado com sucesso |
| `400` | Bad Request | Parâmetros inválidos |
| `401` | Unauthorized | Token inválido ou ausente |
| `403` | Forbidden | Sem permissão para acessar |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito (ex: duplicata) |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Error | Erro interno do servidor |

### Response Body - Sucesso (200/201)
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "campo1": "valor",
    "campo2": 123,
    "createdAt": "2025-01-23T14:30:00Z",
    "updatedAt": "2025-01-23T14:30:00Z"
  },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 25
  }
}
```

### Response Body - Erro (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parâmetros inválidos",
    "details": [
      {
        "field": "campo1",
        "message": "Campo obrigatório",
        "code": "REQUIRED"
      }
    ]
  },
  "meta": {
    "requestId": "req-uuid-123",
    "timestamp": "2025-01-23T14:30:00Z"
  }
}
```

## 💻 Exemplos de Uso

### cURL
```bash
# Exemplo básico
curl -X [METHOD] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campo1": "valor"}' \
  "[BASE_URL]/api/v1/endpoint"

# Exemplo com parâmetros
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "[BASE_URL]/api/v1/endpoint/123?limit=10&filter=teste"
```

### JavaScript (Frontend)
```javascript
// Usando fetch
const response = await fetch('/api/v1/endpoint', {
  method: '[METHOD]',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campo1: 'valor',
    campo2: 123
  })
});

const data = await response.json();

if (data.success) {
  console.log('Sucesso:', data.data);
} else {
  console.error('Erro:', data.error);
}
```

### JavaScript (Node.js)
```javascript
const axios = require('axios');

try {
  const response = await axios({
    method: '[method]',
    url: '[BASE_URL]/api/v1/endpoint',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      campo1: 'valor',
      campo2: 123
    }
  });
  
  console.log('Sucesso:', response.data);
} catch (error) {
  console.error('Erro:', error.response.data);
}
```

### Python
```python
import requests

url = "[BASE_URL]/api/v1/endpoint"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
data = {
    "campo1": "valor",
    "campo2": 123
}

response = requests.[method](url, headers=headers, json=data)

if response.status_code == 200:
    print("Sucesso:", response.json())
else:
    print("Erro:", response.json())
```

## 🔍 Implementação Técnica

### Arquivo de Implementação
**Localização**: `[caminho/para/arquivo.js]`
**Função principal**: `[nomeDaFuncao]`

### Dependências
- [ ] **Firebase**: Para autenticação
- [ ] **[Biblioteca]**: Para [funcionalidade]
- [ ] **[Serviço]**: Para [integração]

### Validações Implementadas
```javascript
// Exemplo de validação
function validateRequest(data) {
  const errors = [];
  
  if (!data.campo1) {
    errors.push({
      field: 'campo1',
      message: 'Campo obrigatório',
      code: 'REQUIRED'
    });
  }
  
  if (data.campo2 && data.campo2 < 0) {
    errors.push({
      field: 'campo2',
      message: 'Deve ser positivo',
      code: 'INVALID_VALUE'
    });
  }
  
  return errors;
}
```

### Queries do Firebase (se aplicável)
```javascript
// Exemplo de query
const query = db.collection('[collection]')
  .where('[campo]', '==', value)
  .orderBy('[campo]', 'desc')
  .limit(limit);

const snapshot = await query.get();
```

## 🧪 Testes

### Casos de Teste
#### Teste 1: Sucesso básico
```javascript
test('POST /api/v1/endpoint - sucesso básico', async () => {
  const response = await request(app)
    .post('/api/v1/endpoint')
    .set('Authorization', `Bearer ${validToken}`)
    .send({
      campo1: 'valor válido',
      campo2: 42
    });
    
  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data.id).toBeDefined();
});
```

#### Teste 2: Validação de erro
```javascript
test('POST /api/v1/endpoint - campo obrigatório', async () => {
  const response = await request(app)
    .post('/api/v1/endpoint')
    .set('Authorization', `Bearer ${validToken}`)
    .send({
      campo2: 42  // faltando campo1
    });
    
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.error.code).toBe('VALIDATION_ERROR');
});
```

#### Teste 3: Autenticação
```javascript
test('POST /api/v1/endpoint - sem token', async () => {
  const response = await request(app)
    .post('/api/v1/endpoint')
    .send({ campo1: 'valor' });
    
  expect(response.status).toBe(401);
});
```

### Performance
- **Tempo de resposta esperado**: < [X]ms
- **Throughput**: [Y] requests/segundo
- **Memory usage**: < [Z]MB

## 📊 Monitoramento

### Métricas a Acompanhar
- **Response time**: P50, P95, P99
- **Error rate**: < 1%
- **Throughput**: requests por minuto
- **Usage patterns**: endpoints mais usados

### Alertas Configurados
- [ ] Response time > [X]ms
- [ ] Error rate > [Y]%
- [ ] Spike de uso > [Z] requests/min

### Logs Importantes
```javascript
// Logs a serem monitorados
logger.info('Endpoint chamado', {
  endpoint: '/api/v1/endpoint',
  userId: req.user.uid,
  params: req.params,
  responseTime: endTime - startTime
});

logger.error('Erro no endpoint', {
  endpoint: '/api/v1/endpoint',
  error: error.message,
  stack: error.stack,
  userId: req.user?.uid
});
```

## 🔒 Segurança

### Validações de Segurança
- [ ] **Input sanitization**: Todos os inputs são sanitizados
- [ ] **SQL Injection**: Protegido (usando queries parametrizadas)
- [ ] **XSS**: Output encoding implementado
- [ ] **CSRF**: Token validation (se aplicável)
- [ ] **Rate limiting**: Limite de requests implementado

### Dados Sensíveis
- [ ] **Não expor**: [Lista de campos sensíveis]
- [ ] **Logging cuidadoso**: Não logar dados sensíveis
- [ ] **Criptografia**: Campos criptografados quando necessário

## 📝 Changelog

### Versão 1.0.0 - [DD/MM/YYYY]
- ✅ Implementação inicial
- ✅ Validações básicas
- ✅ Testes unitários

### Próximas Versões
- [ ] **v1.1.0**: [Melhoria planejada]
- [ ] **v1.2.0**: [Nova funcionalidade]

## 📞 Suporte

**Desenvolvedor responsável**: [Nome] - [email]  
**Reviewer**: [Nome] - [email]  
**Aprovado por**: [Nome] - [Data]

### Troubleshooting
#### Erro comum 1: [Descrição]
**Causa**: [Explicação]
**Solução**: [Como resolver]

#### Erro comum 2: [Descrição]
**Causa**: [Explicação]
**Solução**: [Como resolver]

---

**📚 Documentação relacionada:**
- [Link para doc relacionada 1]
- [Link para doc relacionada 2]

*Documentação do endpoint: [Nome do Endpoint]*
*Criada em: [DD de Mês de YYYY]*
*Última atualização: [DD de Mês de YYYY]* 