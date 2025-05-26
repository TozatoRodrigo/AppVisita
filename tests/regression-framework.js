/**
 * 🧪 Framework de Testes Regressivos - AppVisita
 * Sistema completo para garantir estabilidade após mudanças
 */

class RegressionTestFramework {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      startTime: null,
      endTime: null,
      duration: 0,
      details: []
    };
    
    this.testSuites = [];
    this.isRunning = false;
    this.coverage = {
      login: false,
      dashboard: false,
      patients: false,
      evolution: false,
      teams: false,
      admin: false,
      security: false,
      performance: false
    };
  }

  // Registrar uma suite de testes
  registerTestSuite(name, suite) {
    this.testSuites.push({
      name,
      suite,
      enabled: true,
      priority: suite.priority || 5
    });
    console.log(`📝 Suite de teste registrada: ${name}`);
  }

  // Executar todos os testes regressivos
  async runRegressionTests(options = {}) {
    if (this.isRunning) {
      console.warn('⚠️ Testes já estão em execução');
      return this.testResults;
    }

    this.isRunning = true;
    this.testResults.startTime = new Date();
    
    try {
      console.log('🚀 Iniciando testes regressivos...');
      console.log(`📊 Total de suites: ${this.testSuites.length}`);
      
      // Ordenar por prioridade (maior prioridade primeiro)
      const sortedSuites = this.testSuites
        .filter(s => s.enabled)
        .sort((a, b) => (b.suite.priority || 5) - (a.suite.priority || 5));

      // Executar suites em paralelo se permitido
      if (options.parallel && !options.sequential) {
        await this.runParallelTests(sortedSuites, options);
      } else {
        await this.runSequentialTests(sortedSuites, options);
      }

      this.testResults.endTime = new Date();
      this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
      
      await this.generateReport(options);
      
      return this.testResults;
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
      this.recordResult('FRAMEWORK_ERROR', false, `Erro no framework: ${error.message}`);
      return this.testResults;
    } finally {
      this.isRunning = false;
    }
  }

  // Executar testes sequencialmente
  async runSequentialTests(suites, options) {
    for (const {name, suite} of suites) {
      try {
        console.log(`\n🧪 Executando suite: ${name}`);
        const suiteResults = await this.executeSuite(name, suite, options);
        this.mergeResults(suiteResults);
        
        // Parar nos primeiros erros críticos se especificado
        if (options.stopOnCriticalError && this.hasCriticalErrors()) {
          console.warn('🛑 Parando execução devido a erros críticos');
          break;
        }
      } catch (error) {
        console.error(`❌ Erro na suite ${name}:`, error);
        this.recordResult(name, false, `Erro na suite: ${error.message}`);
      }
    }
  }

  // Executar testes em paralelo
  async runParallelTests(suites, options) {
    const promises = suites.map(async ({name, suite}) => {
      try {
        console.log(`🧪 Executando suite (paralelo): ${name}`);
        const suiteResults = await this.executeSuite(name, suite, options);
        return {name, results: suiteResults};
      } catch (error) {
        console.error(`❌ Erro na suite ${name}:`, error);
        return {
          name, 
          results: {
            passed: 0,
            failed: 1,
            details: [{test: name, passed: false, message: `Erro na suite: ${error.message}`}]
          }
        };
      }
    });

    const allResults = await Promise.all(promises);
    allResults.forEach(({results}) => this.mergeResults(results));
  }

  // Executar uma suite específica
  async executeSuite(name, suite, options) {
    const suiteResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };

    try {
      // Setup da suite se disponível
      if (typeof suite.setup === 'function') {
        await suite.setup();
      }

      // Executar testes da suite
      if (typeof suite.run === 'function') {
        const results = await suite.run(options);
        if (results && Array.isArray(results)) {
          results.forEach(result => {
            if (result.passed) {
              suiteResults.passed++;
            } else if (result.warning) {
              suiteResults.warnings++;
            } else {
              suiteResults.failed++;
            }
            suiteResults.details.push({
              suite: name,
              ...result
            });
          });
        }
      }

      // Cleanup da suite se disponível
      if (typeof suite.cleanup === 'function') {
        await suite.cleanup();
      }

      // Marcar cobertura
      if (suite.coverage) {
        Object.keys(suite.coverage).forEach(area => {
          if (suite.coverage[area] && this.coverage.hasOwnProperty(area)) {
            this.coverage[area] = true;
          }
        });
      }

    } catch (error) {
      console.error(`❌ Erro executando suite ${name}:`, error);
      suiteResults.failed++;
      suiteResults.details.push({
        suite: name,
        test: 'Suite Execution',
        passed: false,
        message: `Erro na execução: ${error.message}`
      });
    }

    return suiteResults;
  }

  // Mesclar resultados de uma suite
  mergeResults(suiteResults) {
    this.testResults.passed += suiteResults.passed || 0;
    this.testResults.failed += suiteResults.failed || 0;
    this.testResults.warnings += suiteResults.warnings || 0;
    this.testResults.total = this.testResults.passed + this.testResults.failed + this.testResults.warnings;
    
    if (suiteResults.details) {
      this.testResults.details.push(...suiteResults.details);
    }
  }

  // Registrar um resultado individual
  recordResult(testName, passed, message, data = {}) {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date(),
      ...data
    };

    this.testResults.details.push(result);
    
    if (passed) {
      this.testResults.passed++;
    } else if (data.warning) {
      this.testResults.warnings++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.total++;
  }

  // Verificar se há erros críticos
  hasCriticalErrors() {
    return this.testResults.details.some(result => 
      !result.passed && result.critical === true
    );
  }

  // Gerar relatório detalhado
  async generateReport(options = {}) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        warnings: this.testResults.warnings,
        success_rate: this.testResults.total > 0 ? 
          ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) : 0,
        duration_ms: this.testResults.duration
      },
      coverage: this.coverage,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: this.testResults.startTime.toISOString()
      },
      details: this.testResults.details,
      recommendations: this.generateRecommendations()
    };

    // Salvar relatório
    await this.saveReport(report, options);

    // Exibir resumo no console
    this.displaySummary(report);

    return report;
  }

  // Gerar recomendações baseadas nos resultados
  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.failed > 0) {
      recommendations.push({
        type: 'critical',
        message: `${this.testResults.failed} teste(s) falharam. Revisar antes do deploy.`
      });
    }

    if (this.testResults.warnings > 0) {
      recommendations.push({
        type: 'warning',
        message: `${this.testResults.warnings} aviso(s) encontrado(s). Considerar correções.`
      });
    }

    const coveragePercent = Object.values(this.coverage).filter(Boolean).length / Object.keys(this.coverage).length * 100;
    if (coveragePercent < 80) {
      recommendations.push({
        type: 'info',
        message: `Cobertura de testes: ${coveragePercent.toFixed(1)}%. Considerar adicionar mais testes.`
      });
    }

    if (this.testResults.duration > 30000) { // 30 segundos
      recommendations.push({
        type: 'performance',
        message: 'Testes demoram muito. Considerar otimização ou paralelização.'
      });
    }

    return recommendations;
  }

  // Salvar relatório
  async saveReport(report, options) {
    try {
      // Salvar no localStorage para visualização
      localStorage.setItem('regression_test_report', JSON.stringify(report));
      
      // Se estiver em ambiente CI, tentar salvar como artifact
      if (options.ci && typeof fetch !== 'undefined') {
        await this.uploadReportToCI(report);
      }

      console.log('📄 Relatório salvo com sucesso');
    } catch (error) {
      console.warn('⚠️ Não foi possível salvar o relatório:', error);
    }
  }

  // Upload do relatório para CI (se disponível)
  async uploadReportToCI(report) {
    // Esta função seria implementada para integração específica com CI/CD
    console.log('📤 Tentando upload do relatório para CI...');
  }

  // Exibir resumo no console
  displaySummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES REGRESSIVOS');
    console.log('='.repeat(60));
    console.log(`✅ Passou: ${report.summary.passed}`);
    console.log(`❌ Falhou: ${report.summary.failed}`);
    console.log(`⚠️  Avisos: ${report.summary.warnings}`);
    console.log(`📈 Taxa de sucesso: ${report.summary.success_rate}%`);
    console.log(`⏱️  Duração: ${(report.summary.duration_ms / 1000).toFixed(2)}s`);
    
    if (report.summary.failed > 0) {
      console.log('\n❌ FALHAS ENCONTRADAS:');
      this.testResults.details
        .filter(d => !d.passed && !d.warning)
        .forEach(detail => {
          console.log(`  • ${detail.test}: ${detail.message}`);
        });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES:');
      report.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : 
                     rec.type === 'warning' ? '⚠️' : 
                     rec.type === 'performance' ? '⚡' : 'ℹ️';
        console.log(`  ${icon} ${rec.message}`);
      });
    }

    console.log('='.repeat(60));
  }

  // Método para executar testes rápidos (smoke test)
  async runSmokeTests() {
    console.log('🚨 Executando testes rápidos (smoke test)...');
    
    const quickSuites = this.testSuites
      .filter(s => s.suite.category === 'smoke' || s.suite.quick === true)
      .slice(0, 5); // Máximo 5 suites rápidas

    if (quickSuites.length === 0) {
      console.warn('⚠️ Nenhuma suite de smoke test encontrada');
      return this.testResults;
    }

    return this.runRegressionTests({
      suites: quickSuites,
      timeout: 10000, // 10 segundos máximo
      stopOnCriticalError: true
    });
  }

  // Resetar framework para nova execução
  reset() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      startTime: null,
      endTime: null,
      duration: 0,
      details: []
    };
    
    this.coverage = {
      login: false,
      dashboard: false,
      patients: false,
      evolution: false,
      teams: false,
      admin: false,
      security: false,
      performance: false
    };
    
    this.isRunning = false;
  }
}

// Instância global do framework
window.RegressionTestFramework = RegressionTestFramework;
window.regressionTester = new RegressionTestFramework();

// Exportar para uso em Node.js (se aplicável)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RegressionTestFramework;
}

console.log('🧪 Framework de Testes Regressivos carregado'); 