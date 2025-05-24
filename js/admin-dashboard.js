/**
 * 📊 Dashboard de Administração - AppVisita
 * Interface profissional para monitoramento e gestão do sistema
 */

class AdminDashboard {
  constructor() {
    this.refreshInterval = 30000; // 30 segundos
    this.charts = {};
    this.widgets = {};
    this.refreshTimer = null;
    
    this.initializeDashboard();
  }

  /**
   * Inicializar dashboard
   */
  async initializeDashboard() {
    if (!window.isAdmin) {
      console.warn('🔒 Acesso negado: apenas administradores podem acessar o dashboard');
      return;
    }

    await this.createDashboardLayout();
    await this.loadDashboardData();
    this.startAutoRefresh();
    
    console.log('📊 Dashboard administrativo inicializado');
  }

  /**
   * Criar layout do dashboard
   */
  async createDashboardLayout() {
    const dashboardHTML = `
      <div id="admin-dashboard" class="admin-dashboard" style="display: none;">
        <div class="dashboard-header">
          <h1 class="dashboard-title">
            <i class="fas fa-tachometer-alt"></i>
            Dashboard Administrativo
          </h1>
          <div class="dashboard-actions">
            <button id="refresh-dashboard" class="btn btn--secondary btn--sm">
              <i class="fas fa-sync-alt"></i>
              Atualizar
            </button>
            <button id="export-report" class="btn btn--primary btn--sm">
              <i class="fas fa-download"></i>
              Exportar
            </button>
            <button id="close-dashboard" class="btn btn--ghost btn--sm">
              <i class="fas fa-times"></i>
              Fechar
            </button>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- KPI Cards -->
          <div class="dashboard-section">
            <h2 class="section-title">Indicadores Principais</h2>
            <div class="kpi-grid">
              <div class="kpi-card" id="kpi-users">
                <div class="kpi-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value" id="total-users">--</div>
                  <div class="kpi-label">Usuários Ativos</div>
                  <div class="kpi-change" id="users-change">--</div>
                </div>
              </div>

              <div class="kpi-card" id="kpi-patients">
                <div class="kpi-icon">
                  <i class="fas fa-user-injured"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value" id="total-patients">--</div>
                  <div class="kpi-label">Pacientes</div>
                  <div class="kpi-change" id="patients-change">--</div>
                </div>
              </div>

              <div class="kpi-card" id="kpi-sessions">
                <div class="kpi-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value" id="active-sessions">--</div>
                  <div class="kpi-label">Sessões Ativas</div>
                  <div class="kpi-change" id="sessions-change">--</div>
                </div>
              </div>

              <div class="kpi-card" id="kpi-errors">
                <div class="kpi-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value" id="error-count">--</div>
                  <div class="kpi-label">Erros (24h)</div>
                  <div class="kpi-change" id="errors-change">--</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="dashboard-section">
            <h2 class="section-title">Performance</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Core Web Vitals</h3>
                <div id="web-vitals-chart" class="chart-container"></div>
              </div>
              <div class="metric-card">
                <h3>Tempo de Resposta</h3>
                <div id="response-time-chart" class="chart-container"></div>
              </div>
            </div>
          </div>

          <!-- Security Overview -->
          <div class="dashboard-section">
            <h2 class="section-title">Segurança</h2>
            <div class="security-grid">
              <div class="security-card">
                <h3>Eventos de Segurança</h3>
                <div id="security-events" class="event-list"></div>
              </div>
              <div class="security-card">
                <h3>Rate Limiting</h3>
                <div id="rate-limit-status" class="status-grid"></div>
              </div>
              <div class="security-card">
                <h3>IPs Bloqueados</h3>
                <div id="blocked-ips" class="blocked-list"></div>
              </div>
            </div>
          </div>

          <!-- Audit Trail -->
          <div class="dashboard-section">
            <h2 class="section-title">Auditoria</h2>
            <div class="audit-container">
              <div class="audit-filters">
                <select id="audit-level" class="form-control">
                  <option value="">Todos os níveis</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
                <select id="audit-timeframe" class="form-control">
                  <option value="1h">Última hora</option>
                  <option value="24h" selected>Últimas 24h</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                </select>
                <button id="filter-audit" class="btn btn--primary btn--sm">
                  <i class="fas fa-filter"></i>
                  Filtrar
                </button>
              </div>
              <div id="audit-logs" class="audit-table"></div>
            </div>
          </div>

          <!-- System Status -->
          <div class="dashboard-section">
            <h2 class="section-title">Status do Sistema</h2>
            <div class="status-grid">
              <div class="status-item">
                <div class="status-indicator" id="firebase-status"></div>
                <span>Firebase</span>
              </div>
              <div class="status-item">
                <div class="status-indicator" id="storage-status"></div>
                <span>Storage</span>
              </div>
              <div class="status-item">
                <div class="status-indicator" id="auth-status"></div>
                <span>Autenticação</span>
              </div>
              <div class="status-item">
                <div class="status-indicator" id="monitoring-status"></div>
                <span>Monitoramento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inserir HTML no documento
    document.body.insertAdjacentHTML('beforeend', dashboardHTML);
    
    // Configurar event listeners
    this.setupEventListeners();
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-dashboard');
    const exportBtn = document.getElementById('export-report');
    const closeBtn = document.getElementById('close-dashboard');
    const filterBtn = document.getElementById('filter-audit');

    refreshBtn?.addEventListener('click', () => this.loadDashboardData());
    exportBtn?.addEventListener('click', () => this.exportReport());
    closeBtn?.addEventListener('click', () => this.closeDashboard());
    filterBtn?.addEventListener('click', () => this.filterAuditLogs());
  }

  /**
   * Carregar dados do dashboard
   */
  async loadDashboardData() {
    console.log('📊 Carregando dados do dashboard...');
    
    try {
      await Promise.all([
        this.loadKPIs(),
        this.loadPerformanceMetrics(),
        this.loadSecurityData(),
        this.loadAuditData(),
        this.loadSystemStatus()
      ]);
      
      console.log('✅ Dados do dashboard carregados');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
    }
  }

  /**
   * Carregar KPIs principais
   */
  async loadKPIs() {
    try {
      // Simular dados (em produção, viria do Firebase)
      const kpis = {
        totalUsers: Math.floor(Math.random() * 100) + 50,
        totalPatients: Math.floor(Math.random() * 500) + 200,
        activeSessions: Math.floor(Math.random() * 20) + 5,
        errorCount: Math.floor(Math.random() * 10)
      };

      document.getElementById('total-users').textContent = kpis.totalUsers;
      document.getElementById('total-patients').textContent = kpis.totalPatients;
      document.getElementById('active-sessions').textContent = kpis.activeSessions;
      document.getElementById('error-count').textContent = kpis.errorCount;

      // Simular mudanças percentuais
      this.updateKPIChange('users-change', 5.2);
      this.updateKPIChange('patients-change', 12.8);
      this.updateKPIChange('sessions-change', -2.1);
      this.updateKPIChange('errors-change', -15.3);

    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    }
  }

  /**
   * Atualizar indicador de mudança de KPI
   */
  updateKPIChange(elementId, change) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const isPositive = change > 0;
    const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const className = isPositive ? 'kpi-positive' : 'kpi-negative';
    
    element.innerHTML = `
      <i class="fas ${icon}"></i>
      ${Math.abs(change).toFixed(1)}%
    `;
    element.className = `kpi-change ${className}`;
  }

  /**
   * Carregar métricas de performance
   */
  async loadPerformanceMetrics() {
    try {
      // Core Web Vitals
      const webVitals = this.getWebVitalsData();
      this.createWebVitalsChart(webVitals);

      // Response Times
      const responseTimes = this.getResponseTimeData();
      this.createResponseTimeChart(responseTimes);

    } catch (error) {
      console.error('Erro ao carregar métricas de performance:', error);
    }
  }

  /**
   * Obter dados dos Core Web Vitals
   */
  getWebVitalsData() {
    if (window.MonitoringService) {
      return window.MonitoringService.getCoreWebVitalsScore();
    }
    
    // Dados simulados
    return {
      lcp: { value: 2100, score: 'good' },
      fid: { value: 85, score: 'good' },
      cls: { value: 0.08, score: 'good' }
    };
  }

  /**
   * Criar gráfico de Web Vitals
   */
  createWebVitalsChart(data) {
    const container = document.getElementById('web-vitals-chart');
    if (!container) return;

    const vitalsHTML = `
      <div class="vitals-grid">
        <div class="vital-item">
          <div class="vital-label">LCP</div>
          <div class="vital-value ${data.lcp.score}">${data.lcp.value}ms</div>
          <div class="vital-bar">
            <div class="vital-progress" style="width: ${Math.min((data.lcp.value / 4000) * 100, 100)}%"></div>
          </div>
        </div>
        <div class="vital-item">
          <div class="vital-label">FID</div>
          <div class="vital-value ${data.fid.score}">${data.fid.value}ms</div>
          <div class="vital-bar">
            <div class="vital-progress" style="width: ${Math.min((data.fid.value / 300) * 100, 100)}%"></div>
          </div>
        </div>
        <div class="vital-item">
          <div class="vital-label">CLS</div>
          <div class="vital-value ${data.cls.score}">${data.cls.value.toFixed(3)}</div>
          <div class="vital-bar">
            <div class="vital-progress" style="width: ${Math.min((data.cls.value / 0.25) * 100, 100)}%"></div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = vitalsHTML;
  }

  /**
   * Carregar dados de segurança
   */
  async loadSecurityData() {
    try {
      const securityData = window.SecurityService?.getSecurityStatus() || {};
      
      // Eventos de segurança
      this.loadSecurityEvents();
      
      // Status de rate limiting
      this.loadRateLimitStatus(securityData.rateLimitStatus || []);
      
      // IPs bloqueados
      this.loadBlockedIPs(securityData);
      
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    }
  }

  /**
   * Carregar eventos de segurança
   */
  loadSecurityEvents() {
    const container = document.getElementById('security-events');
    if (!container) return;

    const events = window.SecurityService?.securityEvents?.slice(-10) || [];
    
    if (events.length === 0) {
      container.innerHTML = '<div class="no-data">Nenhum evento de segurança recente</div>';
      return;
    }

    const eventsHTML = events.map(event => {
      const timeAgo = this.timeAgo(new Date(event.timestamp));
      const levelClass = `event-${event.level}`;
      
      return `
        <div class="security-event ${levelClass}">
          <div class="event-header">
            <span class="event-type">${event.event}</span>
            <span class="event-time">${timeAgo}</span>
          </div>
          <div class="event-level">${event.level.toUpperCase()}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = eventsHTML;
  }

  /**
   * Carregar status de rate limiting
   */
  loadRateLimitStatus(rateLimitData) {
    const container = document.getElementById('rate-limit-status');
    if (!container) return;

    if (rateLimitData.length === 0) {
      container.innerHTML = '<div class="no-data">Nenhum limite ativo</div>';
      return;
    }

    const statusHTML = rateLimitData.slice(0, 5).map(([fingerprint, limits]) => {
      const limitCount = limits.size;
      return `
        <div class="rate-limit-item">
          <div class="rate-limit-id">${fingerprint.substring(0, 8)}...</div>
          <div class="rate-limit-count">${limitCount} limites</div>
        </div>
      `;
    }).join('');

    container.innerHTML = statusHTML;
  }

  /**
   * Carregar dados de auditoria
   */
  async loadAuditData() {
    try {
      const auditStats = await window.AuditService?.getAuditStats(1) || {};
      this.displayAuditLogs(auditStats);
    } catch (error) {
      console.error('Erro ao carregar dados de auditoria:', error);
    }
  }

  /**
   * Exibir logs de auditoria
   */
  displayAuditLogs(auditStats) {
    const container = document.getElementById('audit-logs');
    if (!container) return;

    const { byLevel = {}, byAction = {} } = auditStats;
    
    const logsHTML = `
      <div class="audit-summary">
        <div class="audit-stat">
          <span class="stat-label">Total de Logs:</span>
          <span class="stat-value">${auditStats.total || 0}</span>
        </div>
        <div class="audit-stat">
          <span class="stat-label">Eventos Críticos:</span>
          <span class="stat-value critical">${auditStats.criticalEvents || 0}</span>
        </div>
        <div class="audit-stat">
          <span class="stat-label">Eventos de Segurança:</span>
          <span class="stat-value warning">${auditStats.securityEvents || 0}</span>
        </div>
      </div>
      
      <div class="audit-breakdown">
        <div class="breakdown-section">
          <h4>Por Nível</h4>
          ${Object.entries(byLevel).map(([level, count]) => `
            <div class="breakdown-item">
              <span class="breakdown-label ${level}">${level}</span>
              <span class="breakdown-count">${count}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="breakdown-section">
          <h4>Por Ação</h4>
          ${Object.entries(byAction).slice(0, 5).map(([action, count]) => `
            <div class="breakdown-item">
              <span class="breakdown-label">${action}</span>
              <span class="breakdown-count">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = logsHTML;
  }

  /**
   * Carregar status do sistema
   */
  loadSystemStatus() {
    const statusChecks = {
      'firebase-status': () => !!window.firebase,
      'storage-status': () => !!window.firebase?.storage,
      'auth-status': () => !!window.firebase?.auth()?.currentUser,
      'monitoring-status': () => !!window.MonitoringService?.enabled
    };

    Object.entries(statusChecks).forEach(([elementId, checkFn]) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const isOnline = checkFn();
      element.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
      element.title = isOnline ? 'Online' : 'Offline';
    });
  }

  /**
   * Filtrar logs de auditoria
   */
  async filterAuditLogs() {
    const level = document.getElementById('audit-level')?.value;
    const timeframe = document.getElementById('audit-timeframe')?.value;
    
    console.log(`Filtrando logs: level=${level}, timeframe=${timeframe}`);
    await this.loadAuditData();
  }

  /**
   * Exportar relatório
   */
  exportReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      performance: this.getWebVitalsData(),
      security: window.SecurityService?.getSecurityStatus(),
      monitoring: {
        metricsCount: window.MonitoringService?.metricsQueue?.length || 0,
        userActions: window.MonitoringService?.userBehavior?.length || 0
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appvisita-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📊 Relatório exportado');
  }

  /**
   * Mostrar dashboard
   */
  showDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    if (dashboard) {
      dashboard.style.display = 'block';
      this.loadDashboardData();
    }
  }

  /**
   * Fechar dashboard
   */
  closeDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    if (dashboard) {
      dashboard.style.display = 'none';
    }
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Iniciar auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      this.loadDashboardData();
    }, this.refreshInterval);
  }

  /**
   * Utilitários
   */
  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
      ano: 31536000,
      mês: 2592000,
      dia: 86400,
      hora: 3600,
      minuto: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} atrás`;
      }
    }
    
    return 'agora';
  }

  getResponseTimeData() {
    // Simular dados de tempo de resposta
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      responseTime: Math.floor(Math.random() * 500) + 100
    }));
  }

  createResponseTimeChart(data) {
    const container = document.getElementById('response-time-chart');
    if (!container) return;

    const avgResponseTime = data.reduce((sum, item) => sum + item.responseTime, 0) / data.length;
    
    container.innerHTML = `
      <div class="response-summary">
        <div class="response-avg">
          <span class="response-label">Tempo Médio:</span>
          <span class="response-value">${Math.round(avgResponseTime)}ms</span>
        </div>
        <div class="response-trend">
          <span class="trend-label">Tendência:</span>
          <span class="trend-indicator positive">
            <i class="fas fa-arrow-down"></i>
            Melhorando
          </span>
        </div>
      </div>
    `;
  }
}

// Instância global
window.AdminDashboard = new AdminDashboard();

// Expor para outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminDashboard;
} 