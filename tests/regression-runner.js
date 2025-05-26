/**
 * 🚀 Runner de Testes Regressivos - AppVisita
 * Interface principal para executar todos os testes regressivos
 */

class RegressionRunner {
  constructor() {
    this.framework = null;
    this.isInitialized = false;
    this.autoRunOnChanges = false;
    this.lastRunResults = null;
  }

  // Inicializar o runner
  async initialize() {
    console.log('🚀 Inicializando Runner de Testes Regressivos...');
    
    try {
      // Aguardar framework estar disponível
      await this.waitForFramework();
      
      // Carregar todas as suites
      await this.loadTestSuites();
      
      // Configurar interface de usuário
      this.setupUI();
      
      // Configurar auto-run se habilitado
      if (this.autoRunOnChanges) {
        this.setupAutoRun();
      }
      
      this.isInitialized = true;
      console.log('✅ Runner de Testes Regressivos inicializado com sucesso');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar runner:', error);
      return false;
    }
  }

  // Aguardar framework estar disponível
  async waitForFramework(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const checkFramework = () => {
        if (window.regressionTester && window.RegressionTestFramework) {
          this.framework = window.regressionTester;
          resolve(this.framework);
        }
      };

      // Verificar imediatamente
      checkFramework();

      // Se não encontrou, aguardar
      if (!this.framework) {
        const interval = setInterval(() => {
          checkFramework();
          if (this.framework) {
            clearInterval(interval);
            resolve(this.framework);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Framework de testes não encontrado'));
        }, timeout);
      }
    });
  }

  // Carregar todas as suites de teste
  async loadTestSuites() {
    console.log('📦 Carregando suites de teste...');
    
    const suites = [
      'tests/suites/login-tests.js',
      'tests/suites/dashboard-tests.js',
      'tests/suites/performance-tests.js'
    ];

    for (const suiteUrl of suites) {
      try {
        await this.loadScript(suiteUrl);
        console.log(`✅ Suite carregada: ${suiteUrl}`);
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar suite ${suiteUrl}:`, error);
      }
    }
  }

  // Carregar script dinamicamente
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Configurar interface de usuário
  setupUI() {
    // Criar botão de testes na interface se não existir
    if (!document.getElementById('regression-test-button')) {
      this.createTestButton();
    }

    // Criar modal de resultados
    this.createResultsModal();

    // Adicionar atalhos de teclado
    this.setupKeyboardShortcuts();
  }

  // Criar botão de testes
  createTestButton() {
    const button = document.createElement('button');
    button.id = 'regression-test-button';
    button.className = 'btn btn--secondary';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #ff6b35;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    button.innerHTML = '🧪 Testes';
    button.title = 'Executar Testes Regressivos (Ctrl+Shift+T)';
    
    button.onclick = () => this.showTestMenu();
    
    document.body.appendChild(button);
  }

  // Mostrar menu de testes
  showTestMenu() {
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      z-index: 10000;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 10px;
      min-width: 200px;
    `;
    
    menu.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px;">🧪 Testes Regressivos</div>
      <button onclick="regressionRunner.runAllTests()" style="width: 100%; margin: 2px 0; padding: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;">🚀 Executar Todos</button>
      <button onclick="regressionRunner.runSmokeTests()" style="width: 100%; margin: 2px 0; padding: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;">🚨 Testes Rápidos</button>
      <button onclick="regressionRunner.runCoreTests()" style="width: 100%; margin: 2px 0; padding: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;">🎯 Testes Core</button>
      <button onclick="regressionRunner.showLastResults()" style="width: 100%; margin: 2px 0; padding: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;">📊 Último Resultado</button>
      <hr style="margin: 10px 0;">
      <button onclick="this.parentElement.remove()" style="width: 100%; margin: 2px 0; padding: 8px; border: 1px solid #ddd; background: #ffebee; cursor: pointer;">❌ Fechar</button>
    `;
    
    // Remover menus existentes
    const existingMenu = document.querySelector('[data-test-menu]');
    if (existingMenu) existingMenu.remove();
    
    menu.setAttribute('data-test-menu', 'true');
    document.body.appendChild(menu);
    
    // Fechar menu ao clicar fora
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target.id !== 'regression-test-button') {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 100);
  }

  // Criar modal de resultados
  createResultsModal() {
    if (document.getElementById('test-results-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'test-results-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10001;
    `;
    
    modal.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        min-width: 600px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">📊 Resultados dos Testes Regressivos</h2>
          <button onclick="this.closest('#test-results-modal').style.display='none'" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div id="test-results-content">
          <!-- Conteúdo dos resultados será inserido aqui -->
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Configurar atalhos de teclado
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+T - Executar todos os testes
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.runAllTests();
      }
      
      // Ctrl+Shift+R - Testes rápidos
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        this.runSmokeTests();
      }
    });
  }

  // Executar todos os testes
  async runAllTests() {
    if (!this.isInitialized) {
      console.warn('⚠️ Runner não inicializado');
      return;
    }

    console.log('🚀 Executando todos os testes regressivos...');
    this.showProgressIndicator('Executando todos os testes...');
    
    try {
      const results = await this.framework.runRegressionTests({
        parallel: false,
        stopOnCriticalError: false
      });
      
      this.lastRunResults = results;
      this.hideProgressIndicator();
      this.showResults(results);
      
      return results;
    } catch (error) {
      console.error('❌ Erro ao executar testes:', error);
      this.hideProgressIndicator();
      this.showError('Erro ao executar testes: ' + error.message);
    }
  }

  // Executar testes rápidos (smoke tests)
  async runSmokeTests() {
    if (!this.isInitialized) {
      console.warn('⚠️ Runner não inicializado');
      return;
    }

    console.log('🚨 Executando testes rápidos...');
    this.showProgressIndicator('Executando testes rápidos...');
    
    try {
      const results = await this.framework.runSmokeTests();
      
      this.lastRunResults = results;
      this.hideProgressIndicator();
      this.showResults(results);
      
      return results;
    } catch (error) {
      console.error('❌ Erro ao executar testes rápidos:', error);
      this.hideProgressIndicator();
      this.showError('Erro ao executar testes rápidos: ' + error.message);
    }
  }

  // Executar testes core (principais funcionalidades)
  async runCoreTests() {
    if (!this.isInitialized) {
      console.warn('⚠️ Runner não inicializado');
      return;
    }

    console.log('🎯 Executando testes core...');
    this.showProgressIndicator('Executando testes principais...');
    
    try {
      const results = await this.framework.runRegressionTests({
        suites: this.framework.testSuites.filter(s => 
          s.suite.category === 'core' || s.suite.category === 'smoke'
        ),
        parallel: true
      });
      
      this.lastRunResults = results;
      this.hideProgressIndicator();
      this.showResults(results);
      
      return results;
    } catch (error) {
      console.error('❌ Erro ao executar testes core:', error);
      this.hideProgressIndicator();
      this.showError('Erro ao executar testes core: ' + error.message);
    }
  }

  // Mostrar indicador de progresso
  showProgressIndicator(message = 'Executando testes...') {
    let indicator = document.getElementById('test-progress-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'test-progress-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 10002;
        text-align: center;
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = `
      <div style="margin-bottom: 10px;">${message}</div>
      <div style="width: 40px; height: 40px; border: 4px solid #ffffff33; border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    indicator.style.display = 'block';
  }

  // Esconder indicador de progresso
  hideProgressIndicator() {
    const indicator = document.getElementById('test-progress-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  // Mostrar resultados
  showResults(results) {
    const modal = document.getElementById('test-results-modal');
    const content = document.getElementById('test-results-content');
    
    if (!modal || !content) return;
    
    const successRate = results.total > 0 ? 
      ((results.passed / results.total) * 100).toFixed(1) : 0;
    
    const statusColor = results.failed === 0 ? '#4caf50' : 
                       results.failed <= 2 ? '#ff9800' : '#f44336';
    
    content.innerHTML = `
      <div style="background: ${statusColor}; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0;">📊 Resumo dos Testes</h3>
        <div style="display: flex; justify-content: space-between;">
          <span>✅ Passou: ${results.passed}</span>
          <span>❌ Falhou: ${results.failed}</span>
          <span>⚠️ Avisos: ${results.warnings}</span>
          <span>📈 Taxa: ${successRate}%</span>
        </div>
      </div>
      
      ${results.failed > 0 ? `
        <div style="background: #ffebee; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h4 style="color: #d32f2f; margin: 0 0 10px 0;">❌ Testes que Falharam</h4>
          ${results.details
            .filter(d => !d.passed && !d.warning)
            .map(d => `<div style="margin: 5px 0;"><strong>${d.test}:</strong> ${d.message}</div>`)
            .join('')
          }
        </div>
      ` : ''}
      
      ${results.warnings > 0 ? `
        <div style="background: #fff3e0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h4 style="color: #f57c00; margin: 0 0 10px 0;">⚠️ Avisos</h4>
          ${results.details
            .filter(d => d.warning)
            .map(d => `<div style="margin: 5px 0;"><strong>${d.test}:</strong> ${d.message}</div>`)
            .join('')
          }
        </div>
      ` : ''}
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 6px;">
        <h4 style="margin: 0 0 10px 0;">📋 Detalhes Completos</h4>
        <div style="max-height: 300px; overflow-y: auto;">
          ${results.details.map(d => `
            <div style="padding: 8px; margin: 4px 0; background: white; border-radius: 4px; border-left: 4px solid ${d.passed ? '#4caf50' : d.warning ? '#ff9800' : '#f44336'};">
              <strong>${d.passed ? '✅' : d.warning ? '⚠️' : '❌'} ${d.test}</strong><br>
              <small style="color: #666;">${d.message}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  // Mostrar último resultado
  showLastResults() {
    if (this.lastRunResults) {
      this.showResults(this.lastRunResults);
    } else {
      this.showError('Nenhum teste foi executado ainda');
    }
  }

  // Mostrar erro
  showError(message) {
    const modal = document.getElementById('test-results-modal');
    const content = document.getElementById('test-results-content');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
      <div style="background: #f44336; color: white; padding: 20px; border-radius: 6px; text-align: center;">
        <h3 style="margin: 0 0 10px 0;">❌ Erro</h3>
        <p style="margin: 0;">${message}</p>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  // Configurar execução automática
  setupAutoRun() {
    // Monitorar mudanças na página para executar testes automaticamente
    const observer = new MutationObserver((mutations) => {
      // Só executar se houve mudanças significativas
      const significantChanges = mutations.some(mutation => 
        mutation.type === 'childList' && 
        mutation.addedNodes.length > 0
      );
      
      if (significantChanges) {
        // Debounce para evitar execuções excessivas
        clearTimeout(this.autoRunTimeout);
        this.autoRunTimeout = setTimeout(() => {
          this.runSmokeTests();
        }, 2000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Habilitar execução automática
  enableAutoRun() {
    this.autoRunOnChanges = true;
    if (this.isInitialized) {
      this.setupAutoRun();
    }
    console.log('✅ Execução automática de testes habilitada');
  }

  // Desabilitar execução automática
  disableAutoRun() {
    this.autoRunOnChanges = false;
    console.log('❌ Execução automática de testes desabilitada');
  }
}

// Instância global
window.regressionRunner = new RegressionRunner();

// Auto-inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
  setTimeout(async () => {
    try {
      await window.regressionRunner.initialize();
    } catch (error) {
      console.warn('⚠️ Não foi possível inicializar testes regressivos:', error);
    }
  }, 1000); // Aguardar 1 segundo para garantir que tudo carregou
});

console.log('🚀 Runner de Testes Regressivos carregado'); 