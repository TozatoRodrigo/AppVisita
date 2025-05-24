/**
 * 🎯 Demonstração Enterprise - AppVisita
 * Script para demonstrar todas as funcionalidades de nível comercial
 */

class EnterpriseDemo {
  constructor() {
    this.demoRunning = false;
    this.demoSteps = [];
    this.currentStep = 0;
  }

  /**
   * Iniciar demonstração completa
   */
  async startDemo() {
    if (this.demoRunning) {
      console.log('🎯 Demonstração já em execução');
      return;
    }

    console.log('🚀 Iniciando Demonstração Enterprise AppVisita v2.1.0');
    console.log('='.repeat(60));
    
    this.demoRunning = true;

    try {
      await this.runSecurityDemo();
      await this.wait(2000);
      
      await this.runMonitoringDemo();
      await this.wait(2000);
      
      await this.runAuditDemo();
      await this.wait(2000);
      
      await this.runValidationDemo();
      await this.wait(2000);
      
      await this.runTestSuiteDemo();
      await this.wait(2000);
      
      await this.runDashboardDemo();
      
      this.showFinalReport();
      
    } catch (error) {
      console.error('❌ Erro na demonstração:', error);
    } finally {
      this.demoRunning = false;
    }
  }

  /**
   * Demonstração do Sistema de Segurança
   */
  async runSecurityDemo() {
    console.log('\n🔒 DEMONSTRAÇÃO: Sistema de Segurança Avançado');
    console.log('-'.repeat(50));

    // Rate Limiting
    console.log('📊 Testando Rate Limiting...');
    for (let i = 1; i <= 3; i++) {
      const result = window.SecurityService?.checkRateLimit('demo_action');
      console.log(`  Tentativa ${i}: ${result?.allowed ? '✅ Permitido' : '❌ Bloqueado'}`);
      if (!result?.allowed) {
        console.log(`  ⏰ Retry em: ${result.retryAfter}s`);
      }
    }

    // Detecção de XSS
    console.log('\n🛡️ Testando Detecção de XSS...');
    const xssTests = [
      '<script>alert("test")</script>',
      'javascript:alert("xss")',
      '<img onerror="alert(1)" src="x">'
    ];

    xssTests.forEach((xss, index) => {
      const sanitized = window.SecurityService?.sanitizeInput(xss, 'medical');
      console.log(`  XSS ${index + 1}: "${xss.substring(0, 30)}..." → "${sanitized}"`);
    });

    // Fingerprinting
    console.log('\n🔍 Gerando Fingerprint do Cliente...');
    const fingerprint = window.SecurityService?.getClientFingerprint();
    console.log(`  Fingerprint: ${fingerprint}`);

    // Status de segurança
    const securityStatus = window.SecurityService?.getSecurityStatus();
    console.log(`\n📈 Status de Segurança:`);
    console.log(`  Bloqueado: ${securityStatus?.blocked ? '❌ Sim' : '✅ Não'}`);
    console.log(`  Eventos Recentes: ${securityStatus?.recentEvents || 0}`);
    console.log(`  Atividades Suspeitas: ${securityStatus?.suspiciousActivityCount || 0}`);
  }

  /**
   * Demonstração do Sistema de Monitoramento
   */
  async runMonitoringDemo() {
    console.log('\n📊 DEMONSTRAÇÃO: Sistema de Monitoramento');
    console.log('-'.repeat(50));

    // Registrar métricas
    console.log('📈 Registrando Métricas de Performance...');
    window.MonitoringService?.recordMetric('demo_page_load', 1250, { demo: true });
    window.MonitoringService?.recordMetric('demo_api_call', 345, { endpoint: '/api/demo' });
    window.MonitoringService?.recordMetric('demo_user_action', 1, { action: 'click' });

    // Simular ações do usuário
    console.log('👤 Simulando Ações do Usuário...');
    window.MonitoringService?.trackUserAction('demo_navigation', { page: 'dashboard' });
    window.MonitoringService?.trackUserAction('demo_interaction', { element: 'button' });

    // Core Web Vitals
    console.log('🎯 Core Web Vitals Simulados:');
    const webVitals = {
      lcp: 2100,
      fid: 85,
      cls: 0.08
    };
    Object.entries(webVitals).forEach(([metric, value]) => {
      window.MonitoringService?.recordMetric(metric, value);
      console.log(`  ${metric.toUpperCase()}: ${value}${metric === 'cls' ? '' : 'ms'}`);
    });

    // Firebase operations
    console.log('\n🔥 Monitorando Operações Firebase...');
    window.MonitoringService?.trackFirebaseOperation('read', 'pacientes', 234, true);
    window.MonitoringService?.trackFirebaseOperation('write', 'evolucoes', 567, true);

    console.log(`📊 Total de Métricas: ${window.MonitoringService?.metricsQueue?.length || 0}`);
    console.log(`👥 Ações do Usuário: ${window.MonitoringService?.userBehavior?.length || 0}`);
  }

  /**
   * Demonstração do Sistema de Auditoria
   */
  async runAuditDemo() {
    console.log('\n🔍 DEMONSTRAÇÃO: Sistema de Auditoria');
    console.log('-'.repeat(50));

    // Logs básicos
    console.log('📝 Registrando Logs de Auditoria...');
    await window.AuditService?.log('demo_action', { type: 'demo' }, { test: true }, 'info');
    await window.AuditService?.logMedicalAction('demo_view_patient', 'patient_123', 'evolution_456');
    await window.AuditService?.logAuthEvent('demo_login', { success: true });
    await window.AuditService?.logSecurityEvent('demo_security_check', { result: 'passed' }, 'info');

    // Estatísticas (se for admin)
    if (window.isAdmin) {
      console.log('\n📊 Estatísticas de Auditoria:');
      try {
        const stats = await window.AuditService?.getAuditStats(1);
        console.log(`  Total de Logs: ${stats?.total || 0}`);
        console.log(`  Eventos Críticos: ${stats?.criticalEvents || 0}`);
        console.log(`  Eventos Médicos: ${stats?.medicalActions || 0}`);
      } catch (error) {
        console.log('  📊 Estatísticas disponíveis apenas para administradores');
      }
    }

    console.log(`🗂️ Logs Pendentes: ${window.AuditService?.pendingLogs?.length || 0}`);
  }

  /**
   * Demonstração do Sistema de Validação
   */
  async runValidationDemo() {
    console.log('\n✅ DEMONSTRAÇÃO: Sistema de Validação');
    console.log('-'.repeat(50));

    // Validação de CPF
    console.log('🆔 Testando Validação de CPF...');
    const cpfTests = ['123.456.789-09', '123.456.789-00', '111.111.111-11'];
    cpfTests.forEach(cpf => {
      const valid = window.ValidationService?.validateCPF(cpf);
      console.log(`  ${cpf}: ${valid ? '✅ Válido' : '❌ Inválido'}`);
    });

    // Validação de Email
    console.log('\n📧 Testando Validação de Email...');
    const emailTests = ['test@example.com', 'invalid-email', 'user@domain'];
    emailTests.forEach(email => {
      const result = window.ValidationService?.validateValue(email, [{ type: 'email' }]);
      console.log(`  ${email}: ${result?.valid ? '✅ Válido' : '❌ Inválido'}`);
    });

    // Validação de Paciente
    console.log('\n👤 Validando Dados de Paciente...');
    const patientData = {
      nome: 'João Silva',
      cpf: '123.456.789-09',
      dataNascimento: '1980-01-01',
      email: 'joao@example.com'
    };
    
    const patientValidation = window.ValidationService?.validatePatient(patientData);
    console.log(`  Dados do Paciente: ${patientValidation?.valid ? '✅ Válidos' : '❌ Inválidos'}`);
    if (!patientValidation?.valid) {
      console.log(`  Erros: ${patientValidation?.errors?.join(', ')}`);
    }

    // Sanitização
    console.log('\n🧹 Testando Sanitização...');
    const dirtyInput = '<script>alert("xss")</script>Texto normal';
    const sanitized = window.ValidationService?.sanitize({ input: dirtyInput });
    console.log(`  Original: "${dirtyInput}"`);
    console.log(`  Sanitizado: "${sanitized?.input}"`);
  }

  /**
   * Demonstração da Suite de Testes
   */
  async runTestSuiteDemo() {
    console.log('\n🧪 DEMONSTRAÇÃO: Suite de Testes');
    console.log('-'.repeat(50));

    if (typeof window.runTestSuite === 'function') {
      console.log('🚀 Executando Suite de Testes...');
      
      try {
        const results = await window.runTestSuite();
        
        console.log(`📊 Resultados dos Testes:`);
        console.log(`  Total: ${results.total}`);
        console.log(`  ✅ Passou: ${results.passed}`);
        console.log(`  ❌ Falhou: ${results.failed}`);
        console.log(`  📈 Taxa de Sucesso: ${results.successRate.toFixed(1)}%`);
        console.log(`  ⏱️ Tempo: ${results.duration}ms`);
        
        if (results.failed > 0) {
          console.log('\n❌ Testes que Falharam:');
          results.results
            .filter(r => r.status === 'failed')
            .forEach(result => {
              console.log(`  • ${result.description}: ${result.error.message}`);
            });
        }
        
      } catch (error) {
        console.log('❌ Erro ao executar testes:', error.message);
      }
    } else {
      console.log('⚠️ Suite de testes não carregada (apenas em desenvolvimento)');
    }
  }

  /**
   * Demonstração do Dashboard
   */
  async runDashboardDemo() {
    console.log('\n📊 DEMONSTRAÇÃO: Dashboard Administrativo');
    console.log('-'.repeat(50));

    if (window.isAdmin && window.AdminDashboard) {
      console.log('🎛️ Inicializando Dashboard...');
      window.AdminDashboard.showDashboard();
      
      console.log('✅ Dashboard administrativo aberto');
      console.log('📊 Carregando dados em tempo real...');
      console.log('🔄 Auto-refresh ativado (30s)');
      
      setTimeout(() => {
        console.log('📈 Dashboard atualizado com dados simulados');
      }, 2000);
      
    } else if (!window.isAdmin) {
      console.log('🔒 Dashboard disponível apenas para administradores');
      console.log('💡 Dica: Defina window.isAdmin = true para testar');
    } else {
      console.log('❌ Dashboard não inicializado');
    }
  }

  /**
   * Relatório final da demonstração
   */
  showFinalReport() {
    console.log('\n🎯 RELATÓRIO FINAL - AppVisita Enterprise v2.1.0');
    console.log('='.repeat(60));
    
    const features = {
      '🔒 Segurança Avançada': window.SecurityService ? '✅ Ativo' : '❌ Inativo',
      '📊 Monitoramento': window.MonitoringService ? '✅ Ativo' : '❌ Inativo',
      '🔍 Auditoria': window.AuditService ? '✅ Ativo' : '❌ Inativo',
      '✅ Validação': window.ValidationService ? '✅ Ativo' : '❌ Inativo',
      '🧪 Testes': typeof window.runTestSuite === 'function' ? '✅ Disponível' : '⚠️ Dev only',
      '📊 Dashboard': window.AdminDashboard ? '✅ Ativo' : '❌ Inativo'
    };

    console.log('\n📋 Status dos Recursos Enterprise:');
    Object.entries(features).forEach(([feature, status]) => {
      console.log(`  ${feature}: ${status}`);
    });

    // Métricas coletadas
    console.log('\n📈 Métricas Coletadas Durante Demo:');
    console.log(`  Métricas de Performance: ${window.MonitoringService?.metricsQueue?.length || 0}`);
    console.log(`  Ações do Usuário: ${window.MonitoringService?.userBehavior?.length || 0}`);
    console.log(`  Logs de Auditoria: ${window.AuditService?.pendingLogs?.length || 0}`);
    console.log(`  Eventos de Segurança: ${window.SecurityService?.securityEvents?.length || 0}`);

    // Recomendações
    console.log('\n💡 Recomendações para Produção:');
    console.log('  • Configure Firebase Rules para validações server-side');
    console.log('  • Implemente HTTPS obrigatório');
    console.log('  • Configure backup automático dos dados');
    console.log('  • Monitore métricas em dashboard externo');
    console.log('  • Execute testes em CI/CD pipeline');

    console.log('\n🎉 DEMONSTRAÇÃO CONCLUÍDA!');
    console.log('🚀 AppVisita está pronto para comercialização enterprise');
    console.log('='.repeat(60));
  }

  /**
   * Demonstração específica de performance
   */
  async demonstratePerformance() {
    console.log('\n⚡ DEMONSTRAÇÃO: Performance e Core Web Vitals');
    console.log('-'.repeat(50));

    // Simular métricas de performance
    const performanceMetrics = {
      'first-paint': Math.random() * 1000 + 500,
      'first-contentful-paint': Math.random() * 1200 + 800,
      'largest-contentful-paint': Math.random() * 2000 + 1500,
      'first-input-delay': Math.random() * 100 + 50,
      'cumulative-layout-shift': Math.random() * 0.1
    };

    Object.entries(performanceMetrics).forEach(([metric, value]) => {
      window.MonitoringService?.recordMetric(metric.replace('-', '_'), value);
      
      let status = '🟢 Bom';
      if (metric === 'largest-contentful-paint' && value > 2500) status = '🟡 Melhorável';
      if (metric === 'first-input-delay' && value > 100) status = '🟡 Melhorável';
      if (metric === 'cumulative-layout-shift' && value > 0.1) status = '🔴 Ruim';
      
      console.log(`  ${metric}: ${value.toFixed(2)}${metric.includes('shift') ? '' : 'ms'} ${status}`);
    });

    // Análise de performance
    if (window.MonitoringService?.generatePerformanceReport) {
      const report = window.MonitoringService.generatePerformanceReport();
      console.log('\n📊 Relatório de Performance Gerado');
    }
  }

  /**
   * Utilitário: aguardar
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Demonstração rápida (para desenvolvimento)
   */
  async quickDemo() {
    console.log('⚡ Demo Rápida - AppVisita Enterprise');
    console.log('='.repeat(40));
    
    // Teste rápido de cada serviço
    console.log('🔒 Segurança:', window.SecurityService ? '✅' : '❌');
    console.log('📊 Monitoramento:', window.MonitoringService ? '✅' : '❌');
    console.log('🔍 Auditoria:', window.AuditService ? '✅' : '❌');
    console.log('✅ Validação:', window.ValidationService ? '✅' : '❌');
    console.log('📊 Dashboard:', window.AdminDashboard ? '✅' : '❌');
    
    // Registrar algumas métricas
    window.MonitoringService?.recordMetric('quick_demo', 100);
    await window.AuditService?.log('quick_demo', {}, {}, 'info');
    
    console.log('✅ Demo rápida concluída!');
  }
}

// Instância global
window.EnterpriseDemo = new EnterpriseDemo();

// Comandos de conveniência
window.demoEnterprise = () => window.EnterpriseDemo.startDemo();
window.demoQuick = () => window.EnterpriseDemo.quickDemo();
window.demoPerformance = () => window.EnterpriseDemo.demonstratePerformance();

// Auto-execução se parâmetro estiver presente
if (window.location.search.includes('demo=enterprise')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.EnterpriseDemo.startDemo(), 2000);
  });
}

// Log de inicialização
console.log('🎯 Enterprise Demo carregado!');
console.log('📝 Comandos disponíveis:');
console.log('  • demoEnterprise() - Demonstração completa');
console.log('  • demoQuick() - Demonstração rápida');
console.log('  • demoPerformance() - Demo de performance');

// Expor para outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnterpriseDemo;
} 