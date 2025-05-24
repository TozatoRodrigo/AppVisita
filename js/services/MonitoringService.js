/**
 * 📊 Serviço de Monitoramento - AppVisita
 * Sistema profissional de analytics e performance monitoring
 */

class MonitoringService {
  constructor() {
    this.enabled = true;
    this.sessionStartTime = Date.now();
    this.metricsQueue = [];
    this.performanceData = {};
    this.userBehavior = [];
    this.errorCount = 0;
    this.batchSize = 20;
    
    this.initializePerformanceMonitoring();
    this.setupUserBehaviorTracking();
    
    // Enviar métricas a cada 30 segundos
    setInterval(() => this.flushMetrics(), 30000);
  }

  /**
   * Inicializar monitoramento de performance
   */
  initializePerformanceMonitoring() {
    // Performance Observer para Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('lcp', entry.startTime, {
              element: entry.element?.tagName,
              size: entry.size,
              url: entry.url
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('fid', entry.processingStart - entry.startTime, {
              eventType: entry.name,
              target: entry.target?.tagName
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.recordMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Time to First Byte (TTFB)
        const navigationObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('ttfb', entry.responseStart - entry.requestStart, {
              type: entry.type,
              redirectCount: entry.redirectCount
            });
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

      } catch (error) {
        console.warn('📊 Performance Observer não suportado:', error);
      }
    }

    // Performance básico para browsers antigos
    window.addEventListener('load', () => {
      setTimeout(() => this.recordPageLoadMetrics(), 100);
    });
  }

  /**
   * Configurar tracking de comportamento do usuário
   */
  setupUserBehaviorTracking() {
    // Cliques
    document.addEventListener('click', (event) => {
      this.trackUserAction('click', {
        element: event.target.tagName,
        id: event.target.id,
        className: event.target.className,
        text: event.target.textContent?.substring(0, 50)
      });
    });

    // Scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.trackUserAction('scroll', { depth: scrollDepth });
      }
    }, 1000));

    // Tempo na página
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.sessionStartTime;
      this.recordMetric('session_duration', timeOnPage);
      this.flushMetrics();
    });

    // Visibilidade da página
    document.addEventListener('visibilitychange', () => {
      this.trackUserAction('page_visibility', {
        visible: !document.hidden,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Registrar métrica de performance
   */
  recordMetric(metric, value, metadata = {}) {
    if (!this.enabled) return;

    const metricData = {
      metric,
      value: Math.round(value * 100) / 100, // 2 casas decimais
      timestamp: Date.now(),
      url: window.location.pathname,
      user: this.getCurrentUser(),
      device: this.getDeviceInfo(),
      connection: this.getConnectionInfo(),
      ...metadata
    };

    this.metricsQueue.push(metricData);

    // Log local para desenvolvimento
    if (window.ENVIRONMENT === 'development') {
      console.log(`📊 [METRIC] ${metric}:`, value, metadata);
    }

    // Se é uma métrica crítica, enviar imediatamente
    if (['error', 'crash', 'security'].includes(metric)) {
      this.flushMetrics();
    }
  }

  /**
   * Rastrear ação do usuário
   */
  trackUserAction(action, data = {}) {
    if (!this.enabled) return;

    const actionData = {
      action,
      timestamp: Date.now(),
      url: window.location.pathname,
      user: this.getCurrentUser(),
      sessionTime: Date.now() - this.sessionStartTime,
      ...data
    };

    this.userBehavior.push(actionData);

    // Manter apenas os últimos 100 eventos em memória
    if (this.userBehavior.length > 100) {
      this.userBehavior = this.userBehavior.slice(-50);
    }
  }

  /**
   * Registrar métricas de carregamento da página
   */
  recordPageLoadMetrics() {
    if (!performance.timing) return;

    const timing = performance.timing;
    const navigationStart = timing.navigationStart;

    const metrics = {
      'dns_lookup': timing.domainLookupEnd - timing.domainLookupStart,
      'tcp_connect': timing.connectEnd - timing.connectStart,
      'ttfb': timing.responseStart - timing.requestStart,
      'dom_parse': timing.domInteractive - timing.domLoading,
      'dom_ready': timing.domContentLoadedEventEnd - navigationStart,
      'page_load': timing.loadEventEnd - navigationStart,
      'redirect_time': timing.redirectEnd - timing.redirectStart
    };

    Object.entries(metrics).forEach(([metric, value]) => {
      if (value > 0) {
        this.recordMetric(metric, value);
      }
    });

    // First Paint e First Contentful Paint
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        this.recordMetric(entry.name.replace('-', '_'), entry.startTime);
      });
    }
  }

  /**
   * Monitorar erros JavaScript
   */
  trackError(error, context = {}) {
    this.errorCount++;
    
    this.recordMetric('javascript_error', 1, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
      errorCount: this.errorCount,
      userAgent: navigator.userAgent,
      ...context
    });
  }

  /**
   * Monitorar performance de API calls
   */
  trackApiCall(url, method, duration, status, size = 0) {
    this.recordMetric('api_call', duration, {
      url: url.replace(/\/[^\/]+\.(com|org|net|br)/, '/[domain]'), // Anonimizar domínio
      method,
      status,
      size,
      success: status >= 200 && status < 400
    });
  }

  /**
   * Monitorar performance do Firebase
   */
  trackFirebaseOperation(operation, collection, duration, success = true) {
    this.recordMetric('firebase_operation', duration, {
      operation,
      collection,
      success,
      timestamp: Date.now()
    });
  }

  /**
   * Enviar métricas para o servidor
   */
  async flushMetrics() {
    if (this.metricsQueue.length === 0) return;

    try {
      const metricsToSend = [...this.metricsQueue];
      this.metricsQueue = [];

      const payload = {
        metrics: metricsToSend,
        userBehavior: this.userBehavior.slice(-10), // Últimas 10 ações
        session: {
          id: this.getSessionId(),
          duration: Date.now() - this.sessionStartTime,
          pageViews: this.getPageViews(),
          errors: this.errorCount
        },
        app: {
          version: window.APP_VERSION,
          environment: window.ENVIRONMENT,
          buildId: window.BUILD_ID
        }
      };

      // Em desenvolvimento, só fazer log
      if (window.ENVIRONMENT === 'development') {
        console.log('📊 [METRICS] Enviando:', payload);
        return;
      }

      // Em produção, enviar para Firebase Analytics ou endpoint personalizado
      if (window.firebase && window.firebase.firestore) {
        await window.firebase.firestore()
          .collection('analytics')
          .add({
            ...payload,
            timestamp: firebase.firestore.Timestamp.now()
          });
      }

    } catch (error) {
      console.error('📊 [MONITORING ERROR] Falha ao enviar métricas:', error);
      // Recolocar métricas na fila em caso de erro
      this.metricsQueue.unshift(...this.metricsQueue);
    }
  }

  /**
   * Gerar relatório de performance
   */
  generatePerformanceReport() {
    const report = {
      coreWebVitals: this.getCoreWebVitalsScore(),
      pageLoad: this.getPageLoadScore(),
      userExperience: this.getUserExperienceScore(),
      errors: this.getErrorAnalysis(),
      recommendations: this.getRecommendations()
    };

    if (window.isAdmin) {
      console.table(report);
    }

    return report;
  }

  /**
   * Obter pontuação dos Core Web Vitals
   */
  getCoreWebVitalsScore() {
    const lcpMetrics = this.metricsQueue.filter(m => m.metric === 'lcp');
    const fidMetrics = this.metricsQueue.filter(m => m.metric === 'fid');
    const clsMetrics = this.metricsQueue.filter(m => m.metric === 'cls');

    const avgLcp = this.average(lcpMetrics.map(m => m.value));
    const avgFid = this.average(fidMetrics.map(m => m.value));
    const avgCls = this.average(clsMetrics.map(m => m.value));

    return {
      lcp: {
        value: avgLcp,
        score: avgLcp <= 2500 ? 'good' : avgLcp <= 4000 ? 'needs-improvement' : 'poor',
        threshold: '≤ 2.5s (good), ≤ 4s (needs improvement)'
      },
      fid: {
        value: avgFid,
        score: avgFid <= 100 ? 'good' : avgFid <= 300 ? 'needs-improvement' : 'poor',
        threshold: '≤ 100ms (good), ≤ 300ms (needs improvement)'
      },
      cls: {
        value: avgCls,
        score: avgCls <= 0.1 ? 'good' : avgCls <= 0.25 ? 'needs-improvement' : 'poor',
        threshold: '≤ 0.1 (good), ≤ 0.25 (needs improvement)'
      }
    };
  }

  /**
   * Utilitários
   */
  getCurrentUser() {
    const user = window.firebase?.auth()?.currentUser;
    return user ? {
      uid: user.uid,
      email: user.email?.replace(/(.{2}).*(@.*)/, '$1***$2') // Anonimizar email
    } : { uid: 'anonymous' };
  }

  getDeviceInfo() {
    return {
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      mobile: /Mobi|Android/i.test(navigator.userAgent),
      touch: 'ontouchstart' in window
    };
  }

  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : { type: 'unknown' };
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  getPageViews() {
    return this.userBehavior.filter(a => a.action === 'page_view').length + 1;
  }

  average(numbers) {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * API pública para tracking customizado
   */
  track(event, properties = {}) {
    this.trackUserAction(event, properties);
  }

  /**
   * Desabilitar monitoramento
   */
  disable() {
    this.enabled = false;
    console.warn('📊 [MONITORING] Sistema de monitoramento DESABILITADO');
  }

  /**
   * Habilitar monitoramento
   */
  enable() {
    this.enabled = true;
    console.log('📊 [MONITORING] Sistema de monitoramento HABILITADO');
  }
}

// Instância global
window.MonitoringService = new MonitoringService();

// Configurar tracking automático de erros
window.addEventListener('error', (event) => {
  window.MonitoringService?.trackError(event.error || {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  window.MonitoringService?.trackError({
    message: 'Unhandled Promise Rejection',
    reason: event.reason?.toString()
  });
});

// Expor para outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonitoringService;
} 