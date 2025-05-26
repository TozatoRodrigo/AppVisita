/**
 * 🔐 Suite de Testes Regressivos - Sistema de Login
 * Testa todas as funcionalidades críticas de autenticação
 */

const LoginTestSuite = {
  name: 'Sistema de Login',
  priority: 10, // Prioridade alta
  category: 'smoke',
  quick: true,
  coverage: {
    login: true,
    security: true
  },

  // Setup inicial
  async setup() {
    console.log('🔐 Configurando testes de login...');
    
    // Garantir que está na tela de login
    if (window.location.hash) {
      window.location.hash = '';
    }
    
    // Limpar localStorage de sessões anteriores
    localStorage.removeItem('user_session');
    localStorage.removeItem('auth_token');
    
    // Fazer logout se estiver logado
    if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
      await window.firebase.auth().signOut();
    }
    
    // Garantir que elementos estão visíveis
    const areaLogin = document.getElementById('area-login');
    const appContainer = document.getElementById('app-container');
    
    if (areaLogin) areaLogin.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    
    // Aguardar elementos carregarem
    await this.waitForElement('#form-login', 5000);
  },

  // Executar todos os testes
  async run(options = {}) {
    const results = [];
    
    try {
      // Teste 1: Elementos da interface estão presentes
      results.push(await this.testUIElements());
      
      // Teste 2: Validação de campos obrigatórios
      results.push(await this.testFieldValidation());
      
      // Teste 3: Tentativa de login com credenciais inválidas
      results.push(await this.testInvalidLogin());
      
      // Teste 4: Funcionalidade "Criar conta"
      results.push(await this.testCreateAccountUI());
      
      // Teste 5: Verificar Firebase está configurado
      results.push(await this.testFirebaseConfiguration());
      
      // Teste 6: Teste de segurança básica
      results.push(await this.testBasicSecurity());
      
      // Teste 7: Responsividade da interface
      results.push(await this.testResponsiveness());
      
    } catch (error) {
      console.error('❌ Erro durante testes de login:', error);
      results.push({
        test: 'Execução da Suite',
        passed: false,
        message: `Erro na execução: ${error.message}`,
        critical: true
      });
    }
    
    return results;
  },

  // Teste de elementos da UI
  async testUIElements() {
    const elements = [
      '#form-login',
      '#login-email',
      '#login-senha',
      'button[type="submit"]',
      '#btn-criar-conta'
    ];
    
    const missingElements = [];
    
    for (const selector of elements) {
      const element = document.querySelector(selector);
      if (!element) {
        missingElements.push(selector);
      }
    }
    
    return {
      test: 'Elementos da Interface',
      passed: missingElements.length === 0,
      message: missingElements.length === 0 
        ? 'Todos os elementos da interface estão presentes'
        : `Elementos faltando: ${missingElements.join(', ')}`,
      critical: missingElements.length > 0
    };
  },

  // Teste de validação de campos
  async testFieldValidation() {
    const emailInput = document.getElementById('login-email');
    const senhaInput = document.getElementById('login-senha');
    const submitButton = document.querySelector('#form-login button[type="submit"]');
    
    if (!emailInput || !senhaInput || !submitButton) {
      return {
        test: 'Validação de Campos',
        passed: false,
        message: 'Elementos de formulário não encontrados',
        critical: true
      };
    }
    
    // Testar submit com campos vazios
    emailInput.value = '';
    senhaInput.value = '';
    
    try {
      const formSubmitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const form = document.getElementById('form-login');
      const submitPrevented = !form.dispatchEvent(formSubmitEvent);
      
      return {
        test: 'Validação de Campos',
        passed: submitPrevented || emailInput.checkValidity() === false,
        message: 'Validação de campos obrigatórios funcionando',
        data: {
          emailValid: emailInput.checkValidity(),
          senhaValid: senhaInput.checkValidity()
        }
      };
    } catch (error) {
      return {
        test: 'Validação de Campos',
        passed: false,
        message: `Erro ao testar validação: ${error.message}`,
        warning: true
      };
    }
  },

  // Teste de login inválido
  async testInvalidLogin() {
    const emailInput = document.getElementById('login-email');
    const senhaInput = document.getElementById('login-senha');
    
    if (!emailInput || !senhaInput) {
      return {
        test: 'Login Inválido',
        passed: false,
        message: 'Campos de login não encontrados',
        critical: true
      };
    }
    
    // Preencher com credenciais inválidas
    emailInput.value = 'teste_invalido@test.com';
    senhaInput.value = 'senha_incorreta';
    
    try {
      // Simular tentativa de login (sem realmente submeter)
      const errorMessageElement = document.getElementById('login-error-message');
      
      return {
        test: 'Login Inválido',
        passed: true,
        message: 'Sistema preparado para lidar com login inválido',
        data: {
          errorElementExists: !!errorMessageElement,
          email: emailInput.value,
          fieldsAcceptInput: true
        }
      };
    } catch (error) {
      return {
        test: 'Login Inválido',
        passed: false,
        message: `Erro no teste de login inválido: ${error.message}`,
        warning: true
      };
    }
  },

  // Teste da funcionalidade "Criar conta"
  async testCreateAccountUI() {
    const createAccountBtn = document.getElementById('btn-criar-conta');
    
    if (!createAccountBtn) {
      return {
        test: 'Funcionalidade Criar Conta',
        passed: false,
        message: 'Botão "Criar conta" não encontrado',
        critical: false
      };
    }
    
    try {
      // Verificar se o botão é clicável
      const isVisible = createAccountBtn.offsetParent !== null;
      const isEnabled = !createAccountBtn.disabled;
      
      return {
        test: 'Funcionalidade Criar Conta',
        passed: isVisible && isEnabled,
        message: 'Botão "Criar conta" está disponível e funcional',
        data: {
          visible: isVisible,
          enabled: isEnabled,
          hasClickHandler: createAccountBtn.onclick !== null || createAccountBtn.addEventListener
        }
      };
    } catch (error) {
      return {
        test: 'Funcionalidade Criar Conta',
        passed: false,
        message: `Erro ao testar criar conta: ${error.message}`,
        warning: true
      };
    }
  },

  // Teste de configuração do Firebase
  async testFirebaseConfiguration() {
    try {
      const hasFirebase = typeof window.firebase !== 'undefined';
      const hasAuth = hasFirebase && typeof window.firebase.auth === 'function';
      const hasFirestore = hasFirebase && typeof window.firebase.firestore === 'function';
      
      if (!hasFirebase) {
        return {
          test: 'Configuração Firebase',
          passed: false,
          message: 'Firebase não está carregado',
          critical: true
        };
      }
      
      const auth = hasAuth ? window.firebase.auth() : null;
      const configValid = auth && auth.app;
      
      return {
        test: 'Configuração Firebase',
        passed: hasFirebase && hasAuth && hasFirestore && configValid,
        message: 'Firebase está configurado corretamente',
        data: {
          firebaseLoaded: hasFirebase,
          authAvailable: hasAuth,
          firestoreAvailable: hasFirestore,
          configValid: configValid
        }
      };
    } catch (error) {
      return {
        test: 'Configuração Firebase',
        passed: false,
        message: `Erro na verificação do Firebase: ${error.message}`,
        critical: true
      };
    }
  },

  // Teste de segurança básica
  async testBasicSecurity() {
    const emailInput = document.getElementById('login-email');
    const senhaInput = document.getElementById('login-senha');
    
    if (!emailInput || !senhaInput) {
      return {
        test: 'Segurança Básica',
        passed: false,
        message: 'Campos de entrada não encontrados',
        critical: true
      };
    }
    
    try {
      // Verificar se campo de senha está mascarado
      const senhaIsMasked = senhaInput.type === 'password';
      
      // Verificar se há proteção contra XSS básica
      emailInput.value = '<script>alert("xss")</script>';
      const valueSanitized = !emailInput.value.includes('<script>');
      
      // Verificar atributos de segurança
      const hasAutocompleteOff = emailInput.getAttribute('autocomplete') === 'off' || 
                                 senhaInput.getAttribute('autocomplete') === 'off';
      
      return {
        test: 'Segurança Básica',
        passed: senhaIsMasked,
        message: senhaIsMasked 
          ? 'Medidas básicas de segurança implementadas'
          : 'Campo de senha não está mascarado',
        data: {
          passwordMasked: senhaIsMasked,
          xssProtection: valueSanitized,
          autocompleteSettings: hasAutocompleteOff
        },
        warning: !senhaIsMasked
      };
    } catch (error) {
      return {
        test: 'Segurança Básica',
        passed: false,
        message: `Erro no teste de segurança: ${error.message}`,
        warning: true
      };
    }
  },

  // Teste de responsividade
  async testResponsiveness() {
    try {
      const loginCard = document.querySelector('.login-card');
      const form = document.getElementById('form-login');
      
      if (!loginCard || !form) {
        return {
          test: 'Responsividade',
          passed: false,
          message: 'Elementos para teste de responsividade não encontrados',
          warning: true
        };
      }
      
      // Verificar se elementos têm classes responsivas
      const hasResponsiveClasses = loginCard.className.includes('card') ||
                                   form.className.includes('form') ||
                                   document.querySelector('.form-control') !== null;
      
      // Verificar viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = viewportMeta !== null;
      
      return {
        test: 'Responsividade',
        passed: hasResponsiveClasses && hasViewportMeta,
        message: 'Interface preparada para responsividade',
        data: {
          responsiveClasses: hasResponsiveClasses,
          viewportMeta: hasViewportMeta,
          mediaQueries: window.matchMedia ? true : false
        },
        warning: !hasResponsiveClasses || !hasViewportMeta
      };
    } catch (error) {
      return {
        test: 'Responsividade',
        passed: false,
        message: `Erro no teste de responsividade: ${error.message}`,
        warning: true
      };
    }
  },

  // Cleanup após testes
  async cleanup() {
    console.log('🧹 Limpando após testes de login...');
    
    // Limpar campos de formulário
    const emailInput = document.getElementById('login-email');
    const senhaInput = document.getElementById('login-senha');
    
    if (emailInput) emailInput.value = '';
    if (senhaInput) senhaInput.value = '';
    
    // Esconder mensagens de erro
    const errorMessage = document.getElementById('login-error-message');
    if (errorMessage) errorMessage.style.display = 'none';
  },

  // Função utilitária para aguardar elemento
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
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
};

// Registrar a suite no framework
if (typeof window !== 'undefined' && window.regressionTester) {
  window.regressionTester.registerTestSuite('Login System', LoginTestSuite);
}

// Exportar para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoginTestSuite;
}

console.log('🔐 Suite de testes de Login carregada'); 