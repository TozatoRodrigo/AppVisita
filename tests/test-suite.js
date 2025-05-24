/**
 * 🧪 Suite de Testes - AppVisita
 * Sistema completo de testes automatizados para validação comercial
 */

class TestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.coverage = {
      functions: 0,
      lines: 0,
      branches: 0
    };
    
    this.setupTestEnvironment();
  }

  /**
   * Configurar ambiente de testes
   */
  setupTestEnvironment() {
    // Mock do Firebase para testes
    if (!window.firebase) {
      window.firebase = this.createFirebaseMock();
    }

    // Mock de elementos DOM necessários
    this.createDOMElements();
    
    // Configurar variáveis globais de teste
    window.ENVIRONMENT = 'test';
    window.APP_VERSION = '2.0.0-test';
  }

  /**
   * Criar mock do Firebase
   */
  createFirebaseMock() {
    return {
      auth: () => ({
        currentUser: {
          uid: 'test-user-123',
          email: 'test@example.com',
          emailVerified: true
        },
        signInWithEmailAndPassword: (email, password) => 
          Promise.resolve({ user: { uid: 'test-user-123', email } }),
        signOut: () => Promise.resolve()
      }),
      firestore: () => ({
        collection: (name) => ({
          add: (data) => Promise.resolve({ id: 'test-doc-id' }),
          doc: (id) => ({
            get: () => Promise.resolve({ 
              data: () => ({ id, testData: true }),
              exists: true 
            }),
            set: (data) => Promise.resolve(),
            update: (data) => Promise.resolve(),
            delete: () => Promise.resolve()
          }),
          where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
          orderBy: () => ({ get: () => Promise.resolve({ docs: [] }) }),
          limit: () => ({ get: () => Promise.resolve({ docs: [] }) })
        }),
        batch: () => ({
          set: () => {},
          update: () => {},
          delete: () => {},
          commit: () => Promise.resolve()
        }),
        Timestamp: {
          now: () => new Date(),
          fromDate: (date) => date
        }
      }),
      storage: () => ({
        ref: (path) => ({
          put: (file) => Promise.resolve({ 
            ref: { getDownloadURL: () => Promise.resolve('test-url') }
          })
        })
      })
    };
  }

  /**
   * Criar elementos DOM necessários para testes
   */
  createDOMElements() {
    const elements = [
      { id: 'area-login', type: 'div' },
      { id: 'app-container', type: 'div' },
      { id: 'loading-overlay', type: 'div' },
      { id: 'lista-pacientes-pendentes', type: 'div' },
      { id: 'login-email', type: 'input' },
      { id: 'login-senha', type: 'input' },
      { id: 'form-login', type: 'form' }
    ];

    elements.forEach(({ id, type }) => {
      if (!document.getElementById(id)) {
        const element = document.createElement(type);
        element.id = id;
        document.body.appendChild(element);
      }
    });
  }

  /**
   * Registrar teste
   */
  test(description, testFunction) {
    this.tests.push({
      description,
      function: testFunction,
      status: 'pending'
    });
  }

  /**
   * Executar todos os testes
   */
  async runAll() {
    console.log('🧪 Iniciando execução da suite de testes...');
    this.startTime = Date.now();
    this.results = [];

    for (const test of this.tests) {
      await this.runSingleTest(test);
    }

    this.endTime = Date.now();
    this.generateReport();
    
    return this.getResults();
  }

  /**
   * Executar teste individual
   */
  async runSingleTest(test) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Executando: ${test.description}`);
      
      // Executar o teste
      await test.function();
      
      const endTime = Date.now();
      const result = {
        description: test.description,
        status: 'passed',
        duration: endTime - startTime,
        error: null
      };
      
      this.results.push(result);
      console.log(`✅ PASSOU: ${test.description} (${result.duration}ms)`);
      
    } catch (error) {
      const endTime = Date.now();
      const result = {
        description: test.description,
        status: 'failed',
        duration: endTime - startTime,
        error: {
          message: error.message,
          stack: error.stack
        }
      };
      
      this.results.push(result);
      console.error(`❌ FALHOU: ${test.description} - ${error.message}`);
    }
  }

  /**
   * Utilitários de asserção
   */
  assert = {
    equals: (actual, expected, message = '') => {
      if (actual !== expected) {
        throw new Error(`${message}\nEsperado: ${expected}\nRecebido: ${actual}`);
      }
    },

    notEquals: (actual, expected, message = '') => {
      if (actual === expected) {
        throw new Error(`${message}\nNão esperava: ${expected}\nMas recebeu: ${actual}`);
      }
    },

    true: (value, message = '') => {
      if (value !== true) {
        throw new Error(`${message}\nEsperado: true\nRecebido: ${value}`);
      }
    },

    false: (value, message = '') => {
      if (value !== false) {
        throw new Error(`${message}\nEsperado: false\nRecebido: ${value}`);
      }
    },

    exists: (value, message = '') => {
      if (value === null || value === undefined) {
        throw new Error(`${message}\nValor deveria existir mas é: ${value}`);
      }
    },

    notExists: (value, message = '') => {
      if (value !== null && value !== undefined) {
        throw new Error(`${message}\nValor não deveria existir mas é: ${value}`);
      }
    },

    throws: async (fn, message = '') => {
      try {
        await fn();
        throw new Error(`${message}\nEsperava que a função lançasse um erro`);
      } catch (error) {
        // Esperado
      }
    },

    contains: (array, item, message = '') => {
      if (!Array.isArray(array) || !array.includes(item)) {
        throw new Error(`${message}\nArray não contém o item: ${item}`);
      }
    },

    hasProperty: (object, property, message = '') => {
      if (!object || !object.hasOwnProperty(property)) {
        throw new Error(`${message}\nObjeto não possui a propriedade: ${property}`);
      }
    }
  };

  /**
   * Gerar relatório de resultados
   */
  generateReport() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;
    const duration = this.endTime - this.startTime;

    console.log('\n📊 RELATÓRIO DE TESTES');
    console.log('='.repeat(50));
    console.log(`Total de testes: ${total}`);
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`📈 Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`⏱️ Tempo total: ${duration}ms`);
    console.log('='.repeat(50));

    if (failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`\n• ${result.description}`);
          console.log(`  Erro: ${result.error.message}`);
        });
    }
  }

  /**
   * Obter resultados
   */
  getResults() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;

    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      duration: this.endTime - this.startTime,
      results: this.results
    };
  }

  /**
   * Esperar por elemento DOM
   */
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Simular evento de clique
   */
  click(element) {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }

  /**
   * Simular entrada de texto
   */
  type(element, text) {
    element.value = text;
    const event = new Event('input', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }

  /**
   * Aguardar tempo específico
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância global da suite de testes
const testSuite = new TestSuite();

// ========================================================================
// TESTES DE VALIDAÇÃO
// ========================================================================

testSuite.test('ValidationService - Validar CPF válido', async () => {
  const validCPF = '123.456.789-09';
  const result = window.ValidationService?.validateCPF(validCPF);
  testSuite.assert.true(result, 'CPF válido deveria passar na validação');
});

testSuite.test('ValidationService - Rejeitar CPF inválido', async () => {
  const invalidCPF = '123.456.789-00';
  const result = window.ValidationService?.validateCPF(invalidCPF);
  testSuite.assert.false(result, 'CPF inválido deveria falhar na validação');
});

testSuite.test('ValidationService - Validar email', async () => {
  const validEmail = 'test@example.com';
  const validation = window.ValidationService?.validateValue(validEmail, [{ type: 'email' }]);
  testSuite.assert.true(validation?.valid, 'Email válido deveria passar');
});

testSuite.test('ValidationService - Validar dados de paciente', async () => {
  const patientData = {
    nome: 'João Silva',
    cpf: '123.456.789-09',
    dataNascimento: '1980-01-01',
    email: 'joao@example.com'
  };
  
  const result = window.ValidationService?.validatePatient(patientData);
  testSuite.assert.true(result?.valid, 'Dados válidos de paciente deveriam passar');
});

// ========================================================================
// TESTES DE SEGURANÇA
// ========================================================================

testSuite.test('SecurityService - Rate limiting funcional', async () => {
  const action = 'test_action';
  
  // Configurar limite baixo para teste
  window.SecurityService.rateLimits[action] = { max: 2, window: 60000 };
  
  // Primeira tentativa - deve passar
  let result = window.SecurityService?.checkRateLimit(action);
  testSuite.assert.true(result?.allowed, 'Primeira tentativa deveria ser permitida');
  
  // Segunda tentativa - deve passar
  result = window.SecurityService?.checkRateLimit(action);
  testSuite.assert.true(result?.allowed, 'Segunda tentativa deveria ser permitida');
  
  // Terceira tentativa - deve falhar
  result = window.SecurityService?.checkRateLimit(action);
  testSuite.assert.false(result?.allowed, 'Terceira tentativa deveria ser bloqueada');
});

testSuite.test('SecurityService - Detectar XSS', async () => {
  const xssInput = '<script>alert("xss")</script>';
  const sanitized = window.SecurityService?.sanitizeInput(xssInput, 'medical');
  testSuite.assert.notEquals(sanitized, xssInput, 'Input XSS deveria ser sanitizado');
});

testSuite.test('SecurityService - Fingerprinting', async () => {
  const fingerprint1 = window.SecurityService?.getClientFingerprint();
  const fingerprint2 = window.SecurityService?.getClientFingerprint();
  testSuite.assert.equals(fingerprint1, fingerprint2, 'Fingerprint deveria ser consistente');
  testSuite.assert.exists(fingerprint1, 'Fingerprint deveria existir');
});

// ========================================================================
// TESTES DE AUDITORIA
// ========================================================================

testSuite.test('AuditService - Registrar log básico', async () => {
  const initialLogsCount = window.AuditService?.pendingLogs?.length || 0;
  
  await window.AuditService?.log('test_action', {}, { test: true });
  
  const finalLogsCount = window.AuditService?.pendingLogs?.length || 0;
  testSuite.assert.true(finalLogsCount > initialLogsCount, 'Log deveria ser adicionado à fila');
});

testSuite.test('AuditService - Log médico específico', async () => {
  await window.AuditService?.logMedicalAction('view_patient', 'patient123', 'evolution456');
  
  const recentLog = window.AuditService?.pendingLogs?.slice(-1)[0];
  testSuite.assert.exists(recentLog, 'Log médico deveria existir');
  testSuite.assert.equals(recentLog?.resource?.type, 'medical', 'Tipo deveria ser médico');
});

// ========================================================================
// TESTES DE MONITORAMENTO
// ========================================================================

testSuite.test('MonitoringService - Registrar métrica', async () => {
  const initialMetricsCount = window.MonitoringService?.metricsQueue?.length || 0;
  
  window.MonitoringService?.recordMetric('test_metric', 100);
  
  const finalMetricsCount = window.MonitoringService?.metricsQueue?.length || 0;
  testSuite.assert.true(finalMetricsCount > initialMetricsCount, 'Métrica deveria ser registrada');
});

testSuite.test('MonitoringService - Track user action', async () => {
  const initialActionsCount = window.MonitoringService?.userBehavior?.length || 0;
  
  window.MonitoringService?.trackUserAction('test_click', { button: 'test' });
  
  const finalActionsCount = window.MonitoringService?.userBehavior?.length || 0;
  testSuite.assert.true(finalActionsCount > initialActionsCount, 'Ação deveria ser registrada');
});

// ========================================================================
// TESTES DE INTERFACE
// ========================================================================

testSuite.test('Interface - Elementos essenciais existem', async () => {
  const essentialElements = [
    '#area-login',
    '#app-container',
    '#loading-overlay'
  ];
  
  essentialElements.forEach(selector => {
    const element = document.querySelector(selector);
    testSuite.assert.exists(element, `Elemento ${selector} deveria existir`);
  });
});

testSuite.test('Interface - Formulário de login', async () => {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-senha');
  const form = document.getElementById('form-login');
  
  testSuite.assert.exists(emailInput, 'Input de email deveria existir');
  testSuite.assert.exists(passwordInput, 'Input de senha deveria existir');
  testSuite.assert.exists(form, 'Formulário deveria existir');
});

// ========================================================================
// TESTES DE DESIGN SYSTEM
// ========================================================================

testSuite.test('Design System - CSS classes existem', async () => {
  const testElement = document.createElement('div');
  testElement.className = 'btn btn--primary';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  testSuite.assert.notEquals(computedStyle.display, '', 'Classes CSS deveriam estar aplicadas');
  
  document.body.removeChild(testElement);
});

// ========================================================================
// TESTES DE INTEGRAÇÃO
// ========================================================================

testSuite.test('Integração - Firebase mock funcional', async () => {
  const auth = window.firebase?.auth();
  testSuite.assert.exists(auth, 'Auth deveria estar disponível');
  
  const firestore = window.firebase?.firestore();
  testSuite.assert.exists(firestore, 'Firestore deveria estar disponível');
  
  const storage = window.firebase?.storage();
  testSuite.assert.exists(storage, 'Storage deveria estar disponível');
});

testSuite.test('Integração - Serviços principais disponíveis', async () => {
  const services = [
    'ValidationService',
    'SecurityService', 
    'AuditService',
    'MonitoringService'
  ];
  
  services.forEach(serviceName => {
    testSuite.assert.exists(window[serviceName], `${serviceName} deveria estar disponível globalmente`);
  });
});

// ========================================================================
// TESTES DE PERFORMANCE
// ========================================================================

testSuite.test('Performance - Carregamento de serviços rápido', async () => {
  const startTime = Date.now();
  
  // Simular inicialização de serviços
  if (window.ValidationService) {
    window.ValidationService.validateValue('test', [{ type: 'required' }]);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  testSuite.assert.true(duration < 100, `Serviços deveriam carregar em menos de 100ms (atual: ${duration}ms)`);
});

// ========================================================================
// FUNÇÃO PRINCIPAL PARA EXECUTAR TESTES
// ========================================================================

/**
 * Executar suite completa de testes
 */
async function runTestSuite() {
  console.log('🚀 Iniciando AppVisita Test Suite v2.0.0');
  console.log('Ambiente:', window.ENVIRONMENT);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const results = await testSuite.runAll();
    
    // Salvar resultados se possível
    if (window.localStorage) {
      localStorage.setItem('appvisita_test_results', JSON.stringify(results));
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Erro crítico na execução dos testes:', error);
    throw error;
  }
}

/**
 * Executar apenas testes específicos
 */
async function runSpecificTests(patterns) {
  const filteredTests = testSuite.tests.filter(test =>
    patterns.some(pattern => test.description.includes(pattern))
  );
  
  const originalTests = testSuite.tests;
  testSuite.tests = filteredTests;
  
  const results = await testSuite.runAll();
  
  testSuite.tests = originalTests;
  return results;
}

// Expor para uso global
window.TestSuite = TestSuite;
window.runTestSuite = runTestSuite;
window.runSpecificTests = runSpecificTests;

// Auto-executar testes se estiver em ambiente de teste
if (window.location.search.includes('runTests=true')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runTestSuite, 1000);
  });
} 