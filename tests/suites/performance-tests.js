/**
 * ⚡ Suite de Testes Regressivos - Performance e Responsividade
 * Monitora performance e tempos de resposta do sistema
 */

const PerformanceTestSuite = {
  name: 'Performance e Responsividade',
  priority: 6, // Prioridade média
  category: 'performance',
  quick: false,
  coverage: {
    performance: true
  },

  // Métricas de performance
  metrics: {
    pageLoadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    largestContentfulPaint: 0,
    memoryUsage: 0,
    networkRequests: []
  },

  // Setup inicial
  async setup() {
    console.log('⚡ Configurando testes de performance...');
    
    // Capturar métricas de carregamento da página
    this.capturePageLoadMetrics();
    
    // Inicializar observer de performance
    this.initPerformanceObserver();
    
    // Monitor de memória
    this.monitorMemory();
  },

  // Capturar métricas de carregamento
  capturePageLoadMetrics() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    }

    // Performance API moderna
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        }
      });

      const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        this.metrics.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
      }
    }
  },

  // Inicializar observer de performance
  initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // Observer para LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.largestContentfulPaint = entry.startTime;
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Observer para recursos
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.networkRequests.push({
              name: entry.name,
              duration: entry.duration,
              transferSize: entry.transferSize || 0
            });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        
      } catch (error) {
        console.warn('⚠️ PerformanceObserver não suportado:', error);
      }
    }
  },

  // Monitorar uso de memória
  monitorMemory() {
    if ('memory' in window.performance) {
      this.metrics.memoryUsage = window.performance.memory.usedJSHeapSize;
    }
  },

  // Executar todos os testes
  async run(options = {}) {
    const results = [];
    
    try {
      // Teste 1: Tempo de carregamento da página
      results.push(await this.testPageLoadTime());
      
      // Teste 2: Responsividade da interface
      results.push(await this.testUIResponsiveness());
      
      // Teste 3: Performance de rendering
      results.push(await this.testRenderingPerformance());
      
      // Teste 4: Uso de memória
      results.push(await this.testMemoryUsage());
      
      // Teste 5: Tamanho dos recursos
      results.push(await this.testResourceSizes());
      
      // Teste 6: Performance de JavaScript
      results.push(await this.testJavaScriptPerformance());
      
      // Teste 7: Layout e reflows
      results.push(await this.testLayoutPerformance());
      
    } catch (error) {
      console.error('❌ Erro durante testes de performance:', error);
      results.push({
        test: 'Execução da Suite Performance',
        passed: false,
        message: `Erro na execução: ${error.message}`,
        critical: false
      });
    }
    
    return results;
  },

  // Teste de tempo de carregamento
  async testPageLoadTime() {
    const loadTime = this.metrics.pageLoadTime;
    const domLoadTime = this.metrics.domContentLoaded;
    
    // Limites de performance (em ms)
    const LOAD_TIME_LIMIT = 5000; // 5 segundos
    const DOM_LOAD_LIMIT = 2000;  // 2 segundos
    
    const loadTimeGood = loadTime < LOAD_TIME_LIMIT;
    const domLoadTimeGood = domLoadTime < DOM_LOAD_LIMIT;
    
    return {
      test: 'Tempo de Carregamento',
      passed: loadTimeGood && domLoadTimeGood,
      message: `Carregamento: ${loadTime}ms, DOM: ${domLoadTime}ms`,
      data: {
        pageLoadTime: loadTime,
        domContentLoaded: domLoadTime,
        firstPaint: this.metrics.firstPaint,
        limits: { loadTime: LOAD_TIME_LIMIT, domLoad: DOM_LOAD_LIMIT }
      },
      warning: !loadTimeGood || !domLoadTimeGood
    };
  },

  // Teste de responsividade da UI
  async testUIResponsiveness() {
    const startTime = performance.now();
    
    // Simular interações pesadas
    const heavyOperations = [
      () => document.querySelectorAll('*'),
      () => document.getElementById('dashboard-section'),
      () => document.querySelectorAll('.btn'),
      () => document.getElementsByClassName('form-control')
    ];
    
    let maxOperationTime = 0;
    
    for (const operation of heavyOperations) {
      const opStart = performance.now();
      operation();
      const opEnd = performance.now();
      const opTime = opEnd - opStart;
      
      if (opTime > maxOperationTime) {
        maxOperationTime = opTime;
      }
    }
    
    const totalTime = performance.now() - startTime;
    const RESPONSIVENESS_LIMIT = 100; // 100ms
    
    return {
      test: 'Responsividade da UI',
      passed: maxOperationTime < RESPONSIVENESS_LIMIT && totalTime < 200,
      message: `Operação mais lenta: ${maxOperationTime.toFixed(2)}ms`,
      data: {
        maxOperationTime,
        totalTime,
        operationsCount: heavyOperations.length,
        limit: RESPONSIVENESS_LIMIT
      },
      warning: maxOperationTime > RESPONSIVENESS_LIMIT / 2
    };
  },

  // Teste de performance de rendering
  async testRenderingPerformance() {
    const startTime = performance.now();
    
    // Criar elementos para testar rendering
    const testContainer = document.createElement('div');
    testContainer.style.position = 'absolute';
    testContainer.style.left = '-9999px';
    testContainer.innerHTML = '<div class="test-element" style="width: 100px; height: 100px; background: red;"></div>'.repeat(100);
    
    document.body.appendChild(testContainer);
    
    // Forçar reflow
    testContainer.offsetHeight;
    
    const renderTime = performance.now() - startTime;
    
    // Limpar
    document.body.removeChild(testContainer);
    
    const RENDER_TIME_LIMIT = 50; // 50ms
    
    return {
      test: 'Performance de Rendering',
      passed: renderTime < RENDER_TIME_LIMIT,
      message: `Tempo de rendering: ${renderTime.toFixed(2)}ms`,
      data: {
        renderTime,
        elementsCreated: 100,
        limit: RENDER_TIME_LIMIT
      },
      warning: renderTime > RENDER_TIME_LIMIT / 2
    };
  },

  // Teste de uso de memória
  async testMemoryUsage() {
    this.monitorMemory();
    
    if (!('memory' in window.performance)) {
      return {
        test: 'Uso de Memória',
        passed: true,
        message: 'API de memória não disponível no navegador',
        warning: true
      };
    }
    
    const memory = window.performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    
    const MEMORY_LIMIT_MB = 100; // 100MB
    const memoryOk = usedMB < MEMORY_LIMIT_MB;
    
    return {
      test: 'Uso de Memória',
      passed: memoryOk,
      message: `Usando ${usedMB}MB de ${totalMB}MB (limite: ${limitMB}MB)`,
      data: {
        usedMB,
        totalMB,
        limitMB,
        thresholdMB: MEMORY_LIMIT_MB,
        usagePercent: (usedMB / totalMB * 100).toFixed(1)
      },
      warning: usedMB > MEMORY_LIMIT_MB / 2
    };
  },

  // Teste de tamanho dos recursos
  async testResourceSizes() {
    if (!window.performance || !window.performance.getEntriesByType) {
      return {
        test: 'Tamanho dos Recursos',
        passed: true,
        message: 'API de recursos não disponível',
        warning: true
      };
    }
    
    const resources = window.performance.getEntriesByType('resource');
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    
    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;
      
      if (resource.name.endsWith('.js')) {
        jsSize += size;
      } else if (resource.name.endsWith('.css')) {
        cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        imageSize += size;
      }
    });
    
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    const SIZE_LIMIT_MB = 5; // 5MB
    
    return {
      test: 'Tamanho dos Recursos',
      passed: totalSize / 1024 / 1024 < SIZE_LIMIT_MB,
      message: `Total de recursos: ${totalSizeMB}MB`,
      data: {
        totalSizeMB: parseFloat(totalSizeMB),
        jsSizeKB: Math.round(jsSize / 1024),
        cssSizeKB: Math.round(cssSize / 1024),
        imageSizeKB: Math.round(imageSize / 1024),
        resourceCount: resources.length,
        limitMB: SIZE_LIMIT_MB
      },
      warning: totalSize / 1024 / 1024 > SIZE_LIMIT_MB / 2
    };
  },

  // Teste de performance do JavaScript
  async testJavaScriptPerformance() {
    const tests = [
      {
        name: 'Array Processing',
        fn: () => {
          const arr = Array.from({ length: 10000 }, (_, i) => i);
          return arr.filter(x => x % 2 === 0).map(x => x * 2);
        }
      },
      {
        name: 'DOM Query',
        fn: () => {
          return document.querySelectorAll('*').length;
        }
      },
      {
        name: 'Object Creation',
        fn: () => {
          const objects = [];
          for (let i = 0; i < 1000; i++) {
            objects.push({ id: i, name: `Test ${i}`, active: i % 2 === 0 });
          }
          return objects;
        }
      }
    ];
    
    const results = [];
    let totalTime = 0;
    
    for (const test of tests) {
      const start = performance.now();
      test.fn();
      const end = performance.now();
      const time = end - start;
      
      results.push({ name: test.name, time });
      totalTime += time;
    }
    
    const JS_PERFORMANCE_LIMIT = 100; // 100ms total
    
    return {
      test: 'Performance JavaScript',
      passed: totalTime < JS_PERFORMANCE_LIMIT,
      message: `Testes JS executados em ${totalTime.toFixed(2)}ms`,
      data: {
        totalTime,
        tests: results,
        limit: JS_PERFORMANCE_LIMIT
      },
      warning: totalTime > JS_PERFORMANCE_LIMIT / 2
    };
  },

  // Teste de performance de layout
  async testLayoutPerformance() {
    const startTime = performance.now();
    
    // Operações que causam reflow/repaint
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    document.body.appendChild(testElement);
    
    // Múltiplas mudanças de estilo (causam reflows)
    for (let i = 0; i < 100; i++) {
      testElement.style.width = `${100 + i}px`;
      testElement.style.height = `${100 + i}px`;
      // Forçar leitura (causa reflow)
      testElement.offsetHeight;
    }
    
    const layoutTime = performance.now() - startTime;
    document.body.removeChild(testElement);
    
    const LAYOUT_TIME_LIMIT = 200; // 200ms
    
    return {
      test: 'Performance de Layout',
      passed: layoutTime < LAYOUT_TIME_LIMIT,
      message: `Operações de layout: ${layoutTime.toFixed(2)}ms`,
      data: {
        layoutTime,
        operations: 100,
        limit: LAYOUT_TIME_LIMIT
      },
      warning: layoutTime > LAYOUT_TIME_LIMIT / 2
    };
  },

  // Cleanup após testes
  async cleanup() {
    console.log('🧹 Limpando após testes de performance...');
    
    // Limpar observers de performance se necessário
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // Forçar garbage collection se disponível
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc();
      } catch (error) {
        // Ignorar erros de GC
      }
    }
  }
};

// Registrar a suite no framework
if (typeof window !== 'undefined' && window.regressionTester) {
  window.regressionTester.registerTestSuite('Performance System', PerformanceTestSuite);
}

// Exportar para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceTestSuite;
}

console.log('⚡ Suite de testes de Performance carregada'); 