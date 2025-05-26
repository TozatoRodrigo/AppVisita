/**
 * 📊 Suite de Testes Regressivos - Dashboard e Pacientes
 * Testa funcionalidades principais do sistema
 */

const DashboardTestSuite = {
  name: 'Dashboard e Pacientes',
  priority: 9, // Prioridade alta
  category: 'core',
  quick: false,
  coverage: {
    dashboard: true,
    patients: true,
    teams: true
  },

  // Setup inicial
  async setup() {
    console.log('📊 Configurando testes de dashboard...');
    
    // Verificar se usuário está logado (simular se necessário)
    const appContainer = document.getElementById('app-container');
    const areaLogin = document.getElementById('area-login');
    
    if (appContainer) appContainer.style.display = 'block';
    if (areaLogin) areaLogin.style.display = 'none';
    
    // Aguardar elementos do dashboard carregarem
    await this.waitForElement('#dashboard-section', 3000);
    
    // Simular dados de teste se necessário
    this.setupTestData();
  },

  // Configurar dados de teste
  setupTestData() {
    // Criar dados mock para testes
    window.testPatients = [
      {
        id: 'test-patient-1',
        nome: 'João Silva Test',
        status: 'internado',
        dataInternacao: new Date(),
        ultimaEvolucao: null
      },
      {
        id: 'test-patient-2', 
        nome: 'Maria Santos Test',
        status: 'internado',
        dataInternacao: new Date(),
        ultimaEvolucao: new Date()
      }
    ];
  },

  // Executar todos os testes
  async run(options = {}) {
    const results = [];
    
    try {
      // Teste 1: Elementos do dashboard estão presentes
      results.push(await this.testDashboardElements());
      
      // Teste 2: Navegação entre seções
      results.push(await this.testNavigation());
      
      // Teste 3: Separação de pacientes pendentes/visitados
      results.push(await this.testPatientSeparation());
      
      // Teste 4: Funcionalidade de adicionar paciente
      results.push(await this.testAddPatientForm());
      
      // Teste 5: Funcionalidade de busca
      results.push(await this.testSearchFunction());
      
      // Teste 6: Menu lateral (sidebar)
      results.push(await this.testSidebar());
      
      // Teste 7: Contadores dinâmicos
      results.push(await this.testDynamicCounters());
      
      // Teste 8: Responsividade do dashboard
      results.push(await this.testDashboardResponsiveness());
      
    } catch (error) {
      console.error('❌ Erro durante testes de dashboard:', error);
      results.push({
        test: 'Execução da Suite Dashboard',
        passed: false,
        message: `Erro na execução: ${error.message}`,
        critical: true
      });
    }
    
    return results;
  },

  // Teste dos elementos do dashboard
  async testDashboardElements() {
    const elements = [
      '#dashboard-section',
      '#pacientes-pendentes',
      '#pacientes-visitados',
      '#lista-pacientes-pendentes',
      '#lista-pacientes-visitados',
      '#contador-pendentes',
      '#contador-visitados',
      '#ordenar-por'
    ];
    
    const missingElements = [];
    
    for (const selector of elements) {
      const element = document.querySelector(selector);
      if (!element) {
        missingElements.push(selector);
      }
    }
    
    return {
      test: 'Elementos do Dashboard',
      passed: missingElements.length === 0,
      message: missingElements.length === 0 
        ? 'Todos os elementos do dashboard estão presentes'
        : `Elementos faltando: ${missingElements.join(', ')}`,
      critical: missingElements.length > 3 // Crítico se muitos elementos faltam
    };
  },

  // Teste da navegação entre seções
  async testNavigation() {
    const navButtons = [
      { id: 'btn-dashboard', section: 'dashboard-section' },
      { id: 'btn-adicionar-novo', section: 'adicionar-paciente-section' },
      { id: 'btn-consultar', section: 'consultar-paciente-section' }
    ];
    
    let workingButtons = 0;
    const issues = [];
    
    for (const {id, section} of navButtons) {
      const button = document.getElementById(id);
      const targetSection = document.getElementById(section);
      
      if (!button) {
        issues.push(`Botão ${id} não encontrado`);
        continue;
      }
      
      if (!targetSection) {
        issues.push(`Seção ${section} não encontrada`);
        continue;
      }
      
      // Simular clique (apenas verificar se elementos existem e são clicáveis)
      if (!button.disabled && button.offsetParent !== null) {
        workingButtons++;
      }
    }
    
    return {
      test: 'Navegação entre Seções',
      passed: workingButtons === navButtons.length && issues.length === 0,
      message: issues.length === 0 
        ? 'Navegação funcionando corretamente'
        : `Problemas encontrados: ${issues.join(', ')}`,
      data: {
        workingButtons,
        totalButtons: navButtons.length,
        issues
      }
    };
  },

  // Teste da separação de pacientes
  async testPatientSeparation() {
    const pendentesContainer = document.getElementById('lista-pacientes-pendentes');
    const visitadosContainer = document.getElementById('lista-pacientes-visitados');
    const contadorPendentes = document.getElementById('contador-pendentes');
    const contadorVisitados = document.getElementById('contador-visitados');
    
    if (!pendentesContainer || !visitadosContainer) {
      return {
        test: 'Separação de Pacientes',
        passed: false,
        message: 'Containers de pacientes não encontrados',
        critical: true
      };
    }
    
    // Verificar se containers existem e têm estrutura correta
    const hasCorrectStructure = 
      pendentesContainer.classList.contains('patients-grid') &&
      visitadosContainer.classList.contains('patients-grid');
    
    const hasCounters = contadorPendentes && contadorVisitados;
    
    return {
      test: 'Separação de Pacientes',
      passed: hasCorrectStructure && hasCounters,
      message: 'Sistema de separação de pacientes implementado',
      data: {
        pendentesContainer: !!pendentesContainer,
        visitadosContainer: !!visitadosContainer,
        hasCounters,
        correctClasses: hasCorrectStructure
      }
    };
  },

  // Teste do formulário de adicionar paciente
  async testAddPatientForm() {
    const addButton = document.getElementById('btn-adicionar-novo');
    const form = document.getElementById('form-adicionar-paciente');
    const requiredFields = [
      'nome-paciente',
      'equipe-paciente'
    ];
    
    if (!addButton || !form) {
      return {
        test: 'Formulário Adicionar Paciente',
        passed: false,
        message: 'Formulário ou botão de adicionar não encontrado',
        critical: true
      };
    }
    
    // Verificar campos obrigatórios
    const missingFields = [];
    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field) {
        missingFields.push(fieldId);
      }
    }
    
    // Verificar se há validação
    const nomeField = document.getElementById('nome-paciente');
    const hasValidation = nomeField ? nomeField.hasAttribute('required') : false;
    
    return {
      test: 'Formulário Adicionar Paciente',
      passed: missingFields.length === 0 && hasValidation,
      message: missingFields.length === 0 
        ? 'Formulário completo e funcional'
        : `Campos faltando: ${missingFields.join(', ')}`,
      data: {
        missingFields,
        hasValidation,
        formExists: !!form
      },
      warning: missingFields.length > 0 || !hasValidation
    };
  },

  // Teste da funcionalidade de busca
  async testSearchFunction() {
    const searchInput = document.getElementById('consulta-termo');
    const searchButton = document.getElementById('btn-buscar-paciente');
    const resultsContainer = document.getElementById('resultado-consulta');
    
    if (!searchInput || !searchButton) {
      return {
        test: 'Funcionalidade de Busca',
        passed: false,
        message: 'Elementos de busca não encontrados',
        warning: true
      };
    }
    
    // Testar se campo aceita entrada
    try {
      searchInput.value = 'Teste de busca';
      const acceptsInput = searchInput.value === 'Teste de busca';
      
      return {
        test: 'Funcionalidade de Busca',
        passed: acceptsInput && !!resultsContainer,
        message: 'Sistema de busca implementado',
        data: {
          searchInput: !!searchInput,
          searchButton: !!searchButton,
          resultsContainer: !!resultsContainer,
          acceptsInput
        }
      };
    } catch (error) {
      return {
        test: 'Funcionalidade de Busca',
        passed: false,
        message: `Erro ao testar busca: ${error.message}`,
        warning: true
      };
    }
  },

  // Teste do menu lateral
  async testSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    if (!sidebar || !menuToggle) {
      return {
        test: 'Menu Lateral (Sidebar)',
        passed: false,
        message: 'Sidebar ou botão de menu não encontrado',
        warning: true
      };
    }
    
    // Verificar se tem botões do menu
    const hasMenuButtons = menuButtons.length > 0;
    
    // Verificar classes responsivas
    const hasResponsiveClasses = sidebar.className.includes('sidebar') ||
                                 sidebar.classList.length > 0;
    
    return {
      test: 'Menu Lateral (Sidebar)',
      passed: hasMenuButtons && hasResponsiveClasses,
      message: 'Menu lateral implementado corretamente',
      data: {
        sidebar: !!sidebar,
        menuToggle: !!menuToggle,
        menuButtonsCount: menuButtons.length,
        hasResponsiveClasses
      }
    };
  },

  // Teste dos contadores dinâmicos
  async testDynamicCounters() {
    const contadorPendentes = document.getElementById('contador-pendentes');
    const contadorVisitados = document.getElementById('contador-visitados');
    
    if (!contadorPendentes || !contadorVisitados) {
      return {
        test: 'Contadores Dinâmicos',
        passed: false,
        message: 'Elementos de contador não encontrados',
        warning: true
      };
    }
    
    // Verificar se contadores têm valores válidos
    const pendentesValue = contadorPendentes.textContent;
    const visitadosValue = contadorVisitados.textContent;
    
    const pendentesIsValid = /^\d+$/.test(pendentesValue);
    const visitadosIsValid = /^\d+$/.test(visitadosValue);
    
    return {
      test: 'Contadores Dinâmicos',
      passed: pendentesIsValid && visitadosIsValid,
      message: 'Contadores funcionando corretamente',
      data: {
        pendentesValue,
        visitadosValue,
        pendentesIsValid,
        visitadosIsValid
      }
    };
  },

  // Teste de responsividade do dashboard
  async testDashboardResponsiveness() {
    const patientsGrids = document.querySelectorAll('.patients-grid');
    const sectionHeaders = document.querySelectorAll('.section-header');
    const cards = document.querySelectorAll('.card');
    
    // Verificar se elementos têm classes responsivas
    let responsiveElements = 0;
    
    if (patientsGrids.length > 0) responsiveElements++;
    if (sectionHeaders.length > 0) responsiveElements++;
    if (cards.length > 0) responsiveElements++;
    
    // Verificar viewport e media queries
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const hasMediaQuerySupport = window.matchMedia && window.matchMedia('(max-width: 768px)');
    
    return {
      test: 'Responsividade Dashboard',
      passed: responsiveElements >= 2 && viewportMeta && hasMediaQuerySupport,
      message: 'Dashboard preparado para responsividade',
      data: {
        responsiveElements,
        viewportMeta: !!viewportMeta,
        mediaQuerySupport: !!hasMediaQuerySupport,
        patientsGridCount: patientsGrids.length
      }
    };
  },

  // Cleanup após testes
  async cleanup() {
    console.log('🧹 Limpando após testes de dashboard...');
    
    // Limpar dados de teste
    if (window.testPatients) {
      delete window.testPatients;
    }
    
    // Limpar campos de formulário
    const searchInput = document.getElementById('consulta-termo');
    if (searchInput) searchInput.value = '';
    
    // Garantir que está na seção dashboard
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
      dashboardSection.classList.add('active-section');
    }
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
  window.regressionTester.registerTestSuite('Dashboard System', DashboardTestSuite);
}

// Exportar para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardTestSuite;
}

console.log('📊 Suite de testes de Dashboard carregada'); 