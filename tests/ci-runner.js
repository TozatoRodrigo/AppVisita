#!/usr/bin/env node
/**
 * 🤖 CI Runner - Testes Regressivos AppVisita
 * Executor de testes para ambientes de CI/CD (GitHub Actions)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CIRunner {
  constructor() {
    this.browser = process.env.BROWSER || 'chrome';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    this.outputDir = 'tests/results';
    this.screenshotDir = 'tests/screenshots';
    this.coverageDir = 'tests/coverage';
    this.timeout = 120000; // 2 minutos
    
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      tests: []
    };
  }

  // Inicializar runner
  async initialize() {
    console.log('🤖 Inicializando CI Runner...');
    console.log(`📱 Browser: ${this.browser}`);
    console.log(`🌐 URL Base: ${this.baseUrl}`);
    
    // Criar diretórios necessários
    this.createDirectories();
    
    // Verificar se servidor está rodando
    await this.waitForServer();
    
    return true;
  }

  // Criar diretórios necessários
  createDirectories() {
    const dirs = [this.outputDir, this.screenshotDir, this.coverageDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${dir}`);
      }
    });
  }

  // Aguardar servidor estar disponível
  async waitForServer(maxAttempts = 30) {
    console.log(`⏳ Aguardando servidor em ${this.baseUrl}...`);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(this.baseUrl);
        if (response.ok) {
          console.log('✅ Servidor disponível');
          return true;
        }
      } catch (error) {
        // Servidor não disponível ainda
      }
      
      await this.sleep(1000);
      console.log(`⏳ Tentativa ${i + 1}/${maxAttempts}...`);
    }
    
    throw new Error('❌ Servidor não disponível após timeout');
  }

  // Executar todos os testes
  async runTests() {
    console.log('🚀 Executando testes regressivos...');
    
    const startTime = Date.now();
    
    try {
      // Executar testes no navegador
      await this.runBrowserTests();
      
      this.results.duration = Date.now() - startTime;
      
      // Gerar relatórios
      await this.generateReports();
      
      console.log('✅ Testes concluídos com sucesso');
      return this.results;
      
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
      this.results.duration = Date.now() - startTime;
      this.results.failed++;
      
      await this.generateReports();
      throw error;
    }
  }

  // Executar testes no navegador
  async runBrowserTests() {
    console.log(`🌐 Executando testes no ${this.browser}...`);
    
    // Usar Playwright para execução
    const playwright = await this.getPlaywright();
    const browser = await playwright[this.browser].launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      
      const page = await context.newPage();
      
      // Configurar handlers de erro
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error('Browser Error:', msg.text());
        }
      });
      
      page.on('pageerror', error => {
        console.error('Page Error:', error.message);
      });
      
      // Navegar para a aplicação
      console.log(`📖 Navegando para ${this.baseUrl}...`);
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Aguardar carregamento da aplicação
      await page.waitForTimeout(3000);
      
      // Executar testes injetando framework
      const testResults = await this.injectAndRunTests(page);
      
      // Capturar screenshot final
      await page.screenshot({
        path: path.join(this.screenshotDir, `final-${this.browser}.png`),
        fullPage: true
      });
      
      this.results = testResults;
      
    } finally {
      await browser.close();
    }
  }

  // Injetar framework de testes e executar
  async injectAndRunTests(page) {
    console.log('💉 Injetando framework de testes...');
    
    // Injetar framework
    const frameworkCode = fs.readFileSync('tests/regression-framework.js', 'utf8');
    await page.evaluate(frameworkCode);
    
    // Injetar suites de teste
    const testSuites = [
      'tests/suites/login-tests.js',
      'tests/suites/dashboard-tests.js',
      'tests/suites/performance-tests.js'
    ];
    
    for (const suite of testSuites) {
      if (fs.existsSync(suite)) {
        const suiteCode = fs.readFileSync(suite, 'utf8');
        await page.evaluate(suiteCode);
      }
    }
    
    // Executar testes
    console.log('🧪 Executando testes...');
    const results = await page.evaluate(async () => {
      if (!window.regressionTester) {
        throw new Error('Framework de testes não disponível');
      }
      
      return await window.regressionTester.runRegressionTests({
        parallel: false,
        timeout: 30000
      });
    });
    
    console.log(`📊 Resultados: ${results.passed} passou, ${results.failed} falhou, ${results.warnings} avisos`);
    
    return results;
  }

  // Obter Playwright
  async getPlaywright() {
    try {
      return require('playwright');
    } catch (error) {
      console.error('❌ Playwright não disponível:', error.message);
      throw new Error('Playwright é necessário para execução dos testes');
    }
  }

  // Gerar relatórios
  async generateReports() {
    console.log('📄 Gerando relatórios...');
    
    // Relatório JSON
    const jsonReport = {
      timestamp: new Date().toISOString(),
      browser: this.browser,
      baseUrl: this.baseUrl,
      environment: {
        node: process.version,
        platform: process.platform,
        ci: process.env.CI === 'true'
      },
      results: this.results
    };
    
    const jsonPath = path.join(this.outputDir, `results-${this.browser}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`💾 Relatório JSON salvo: ${jsonPath}`);
    
    // Relatório HTML
    await this.generateHtmlReport(jsonReport);
    
    // Relatório JUnit (para CI)
    await this.generateJUnitReport(jsonReport);
  }

  // Gerar relatório HTML
  async generateHtmlReport(data) {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Relatório de Testes - ${data.browser}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; flex: 1; }
        .passed { border-left: 4px solid #4caf50; }
        .failed { border-left: 4px solid #f44336; }
        .warning { border-left: 4px solid #ff9800; }
        .test-list { margin-top: 20px; }
        .test-item { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .test-pass { background: #e8f5e8; }
        .test-fail { background: #ffeaea; }
        .test-warn { background: #fff3e0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Relatório de Testes Regressivos</h1>
        <p><strong>Browser:</strong> ${data.browser}</p>
        <p><strong>Data:</strong> ${data.timestamp}</p>
        <p><strong>Duração:</strong> ${(data.results.duration / 1000).toFixed(2)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric passed">
            <h3>✅ Passou</h3>
            <div style="font-size: 24px;">${data.results.passed}</div>
        </div>
        <div class="metric failed">
            <h3>❌ Falhou</h3>
            <div style="font-size: 24px;">${data.results.failed}</div>
        </div>
        <div class="metric warning">
            <h3>⚠️ Avisos</h3>
            <div style="font-size: 24px;">${data.results.warnings}</div>
        </div>
    </div>
    
    <div class="test-list">
        <h2>📋 Detalhes dos Testes</h2>
        ${data.results.details ? data.results.details.map(test => `
            <div class="test-item ${test.passed ? 'test-pass' : test.warning ? 'test-warn' : 'test-fail'}">
                <strong>${test.passed ? '✅' : test.warning ? '⚠️' : '❌'} ${test.test}</strong><br>
                <small>${test.message}</small>
            </div>
        `).join('') : '<p>Nenhum detalhe disponível</p>'}
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(this.outputDir, `report-${this.browser}.html`);
    fs.writeFileSync(htmlPath, htmlTemplate);
    console.log(`📄 Relatório HTML salvo: ${htmlPath}`);
  }

  // Gerar relatório JUnit
  async generateJUnitReport(data) {
    const testcases = data.results.details ? data.results.details.map(test => {
      if (test.passed) {
        return `<testcase name="${test.test}" classname="${test.suite || 'Unknown'}" time="0.1"/>`;
      } else {
        return `<testcase name="${test.test}" classname="${test.suite || 'Unknown'}" time="0.1">
          <failure message="${test.message}">
            ${test.message}
          </failure>
        </testcase>`;
      }
    }).join('\n') : '';
    
    const junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="AppVisita Regression Tests (${data.browser})" 
           tests="${data.results.total}" 
           failures="${data.results.failed}" 
           time="${(data.results.duration / 1000).toFixed(2)}">
${testcases}
</testsuite>`;
    
    const junitPath = path.join(this.outputDir, `junit-${this.browser}.xml`);
    fs.writeFileSync(junitPath, junitXml);
    console.log(`📊 Relatório JUnit salvo: ${junitPath}`);
  }

  // Função utilitária para sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar se chamado diretamente
async function main() {
  const runner = new CIRunner();
  
  try {
    await runner.initialize();
    const results = await runner.runTests();
    
    // Exit code baseado nos resultados
    const exitCode = results.failed > 0 ? 1 : 0;
    console.log(`🏁 Finalizando com código: ${exitCode}`);
    process.exit(exitCode);
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar apenas se for o arquivo principal
if (require.main === module) {
  main();
}

module.exports = CIRunner; 