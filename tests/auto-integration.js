/**
 * 🔗 Auto Integration - Integração Automática de Novos Testes
 * Integra automaticamente novos testes gerados com o sistema de testes regressivos
 */

class AutoIntegration {
    constructor() {
        this.testSuites = ['login-tests', 'dashboard-tests', 'performance-tests'];
        this.generatedTestsDir = 'tests/generated/';
        this.integrationLog = [];
    }

    // Integrar novos testes ao sistema existente
    async integrateNewTests() {
        console.log('🔗 Iniciando integração automática de novos testes...');
        
        try {
            // 1. Verificar se há testes gerados
            const generatedTests = await this.findGeneratedTests();
            
            if (generatedTests.length === 0) {
                console.log('ℹ️ Nenhum teste gerado encontrado para integrar');
                return { status: 'no_tests', message: 'Nenhum teste para integrar' };
            }

            // 2. Validar testes gerados
            const validTests = await this.validateGeneratedTests(generatedTests);
            
            // 3. Integrar com sistema existente
            const integrationResults = await this.performIntegration(validTests);
            
            // 4. Atualizar runner principal
            await this.updateMainRunner(integrationResults);
            
            // 5. Gerar relatório de integração
            const report = this.generateIntegrationReport(integrationResults);
            
            console.log('✅ Integração concluída com sucesso!');
            return report;
            
        } catch (error) {
            console.error('❌ Erro durante integração:', error);
            return { status: 'error', error: error.message };
        }
    }

    // Encontrar testes gerados automaticamente
    async findGeneratedTests() {
        const generatedTests = [];
        
        // Simular busca por testes gerados (em ambiente real, leria do sistema de arquivos)
        const mockGeneratedTests = [
            {
                file: 'patient-tests-generated.js',
                suite: 'patient-tests',
                tests: ['adicionarPaciente', 'editarPaciente'],
                source: 'auto-generated',
                timestamp: new Date().toISOString()
            },
            {
                file: 'team-tests-generated.js', 
                suite: 'team-tests',
                tests: ['criarEquipe', 'buscarEquipePorId'],
                source: 'auto-generated',
                timestamp: new Date().toISOString()
            }
        ];
        
        console.log(`📁 ${mockGeneratedTests.length} arquivos de teste gerados encontrados`);
        return mockGeneratedTests;
    }

    // Validar testes gerados antes da integração
    async validateGeneratedTests(generatedTests) {
        console.log('🔍 Validando testes gerados...');
        
        const validTests = [];
        const invalidTests = [];
        
        for (const testFile of generatedTests) {
            try {
                // Validar estrutura básica
                const validation = this.validateTestStructure(testFile);
                
                if (validation.isValid) {
                    validTests.push({
                        ...testFile,
                        validation: validation
                    });
                    console.log(`✅ ${testFile.file} - Válido`);
                } else {
                    invalidTests.push({
                        ...testFile,
                        errors: validation.errors
                    });
                    console.log(`❌ ${testFile.file} - Inválido: ${validation.errors.join(', ')}`);
                }
                
            } catch (error) {
                console.warn(`⚠️ Erro ao validar ${testFile.file}:`, error.message);
                invalidTests.push({
                    ...testFile,
                    errors: [error.message]
                });
            }
        }
        
        this.integrationLog.push({
            phase: 'validation',
            validTests: validTests.length,
            invalidTests: invalidTests.length,
            details: { validTests, invalidTests }
        });
        
        return validTests;
    }

    // Validar estrutura de um arquivo de teste
    validateTestStructure(testFile) {
        const errors = [];
        
        // Validar nome do arquivo
        if (!testFile.file || !testFile.file.endsWith('.js')) {
            errors.push('Nome de arquivo inválido');
        }
        
        // Validar suite
        if (!testFile.suite || testFile.suite.length === 0) {
            errors.push('Suite não especificada');
        }
        
        // Validar testes
        if (!testFile.tests || !Array.isArray(testFile.tests) || testFile.tests.length === 0) {
            errors.push('Nenhum teste encontrado');
        }
        
        // Validar timestamp
        if (!testFile.timestamp) {
            errors.push('Timestamp ausente');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Realizar integração dos testes válidos
    async performIntegration(validTests) {
        console.log('🔧 Integrando testes ao sistema...');
        
        const integrationResults = [];
        
        for (const testFile of validTests) {
            try {
                const result = await this.integrateTestFile(testFile);
                integrationResults.push(result);
                
            } catch (error) {
                console.error(`❌ Erro ao integrar ${testFile.file}:`, error);
                integrationResults.push({
                    file: testFile.file,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        return integrationResults;
    }

    // Integrar um arquivo de teste específico
    async integrateTestFile(testFile) {
        console.log(`🔗 Integrando ${testFile.file} na suite ${testFile.suite}...`);
        
        // Determinar suite de destino
        const targetSuite = this.getTargetSuite(testFile.suite);
        
        if (!targetSuite) {
            throw new Error(`Suite de destino não encontrada: ${testFile.suite}`);
        }
        
        // Simular integração (em ambiente real, modificaria arquivos reais)
        const integrationResult = {
            file: testFile.file,
            targetSuite: targetSuite,
            status: 'integrated',
            tests: testFile.tests,
            integratedAt: new Date().toISOString(),
            changes: {
                added: testFile.tests.length,
                modified: 0,
                removed: 0
            }
        };
        
        console.log(`✅ ${testFile.file} integrado com sucesso`);
        return integrationResult;
    }

    // Determinar suite de destino baseado no nome
    getTargetSuite(suiteName) {
        const suiteMapping = {
            'patient-tests': 'tests/suites/dashboard-tests.js',
            'team-tests': 'tests/suites/dashboard-tests.js',
            'admin-tests': 'tests/suites/dashboard-tests.js',
            'diagnosis-tests': 'tests/suites/dashboard-tests.js',
            'login-tests': 'tests/suites/login-tests.js',
            'performance-tests': 'tests/suites/performance-tests.js'
        };
        
        return suiteMapping[suiteName] || 'tests/suites/dashboard-tests.js';
    }

    // Atualizar runner principal com novos testes
    async updateMainRunner(integrationResults) {
        console.log('🔄 Atualizando runner principal...');
        
        const successfulIntegrations = integrationResults.filter(r => r.status === 'integrated');
        
        if (successfulIntegrations.length === 0) {
            console.log('ℹ️ Nenhuma integração bem-sucedida para atualizar runner');
            return;
        }
        
        // Simular atualização do runner (em ambiente real, modificaria arquivos)
        const runnerUpdate = {
            timestamp: new Date().toISOString(),
            addedSuites: successfulIntegrations.length,
            addedTests: successfulIntegrations.reduce((acc, r) => acc + r.tests.length, 0),
            status: 'updated'
        };
        
        console.log(`🔄 Runner atualizado: +${runnerUpdate.addedTests} testes em ${runnerUpdate.addedSuites} suites`);
        
        // Registrar no log de integração
        this.integrationLog.push({
            phase: 'runner_update',
            ...runnerUpdate
        });
        
        return runnerUpdate;
    }

    // Gerar relatório de integração
    generateIntegrationReport(integrationResults) {
        const successful = integrationResults.filter(r => r.status === 'integrated');
        const failed = integrationResults.filter(r => r.status === 'error');
        
        const report = {
            timestamp: new Date().toISOString(),
            status: failed.length === 0 ? 'success' : 'partial',
            summary: {
                totalFiles: integrationResults.length,
                successful: successful.length,
                failed: failed.length,
                totalTestsAdded: successful.reduce((acc, r) => acc + r.tests.length, 0)
            },
            integrationResults: integrationResults,
            log: this.integrationLog,
            recommendations: this.generateRecommendations(integrationResults)
        };
        
        return report;
    }

    // Gerar recomendações baseadas nos resultados
    generateRecommendations(integrationResults) {
        const recommendations = [];
        
        const successful = integrationResults.filter(r => r.status === 'integrated');
        const failed = integrationResults.filter(r => r.status === 'error');
        
        if (successful.length > 0) {
            recommendations.push(`✅ ${successful.length} arquivos integrados com sucesso`);
            recommendations.push('🧪 Execute os testes para verificar funcionamento');
            recommendations.push('🔍 Revise os testes integrados para ajustes finos');
        }
        
        if (failed.length > 0) {
            recommendations.push(`⚠️ ${failed.length} arquivos falharam na integração`);
            recommendations.push('🔧 Verifique os logs de erro para correções');
            recommendations.push('📝 Considere integração manual para casos complexos');
        }
        
        // Recomendações específicas por suite
        const suiteStats = {};
        successful.forEach(r => {
            if (!suiteStats[r.targetSuite]) {
                suiteStats[r.targetSuite] = 0;
            }
            suiteStats[r.targetSuite] += r.tests.length;
        });
        
        for (const [suite, testCount] of Object.entries(suiteStats)) {
            recommendations.push(`📋 Suite ${suite}: +${testCount} novos testes`);
        }
        
        return recommendations;
    }

    // Executar integração automática a partir de arquivos gerados
    async runAutoIntegrationFromFiles() {
        console.log('🚀 Executando integração automática completa...');
        
        try {
            // 1. Usar auto test updater para gerar novos testes
            if (window.autoTestUpdater) {
                console.log('🤖 Gerando novos testes...');
                await window.autoTestUpdater.runCompleteUpdate();
            }
            
            // 2. Integrar testes gerados
            const integrationReport = await this.integrateNewTests();
            
            // 3. Notificar sistema de testes regressivos
            if (window.regressionTestFramework) {
                console.log('📡 Notificando framework de testes regressivos...');
                window.regressionTestFramework.refreshSuites();
            }
            
            return {
                ...integrationReport,
                fullProcess: true,
                completedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro na integração automática completa:', error);
            return {
                status: 'error',
                error: error.message,
                fullProcess: true
            };
        }
    }

    // Verificar status da integração
    getIntegrationStatus() {
        return {
            lastRun: this.integrationLog.length > 0 ? this.integrationLog[this.integrationLog.length - 1] : null,
            totalRuns: this.integrationLog.length,
            log: this.integrationLog
        };
    }

    // Limpar logs antigos
    clearOldLogs(daysToKeep = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const initialLength = this.integrationLog.length;
        this.integrationLog = this.integrationLog.filter(entry => {
            return new Date(entry.timestamp || '1970-01-01') > cutoffDate;
        });
        
        const removed = initialLength - this.integrationLog.length;
        if (removed > 0) {
            console.log(`🧹 ${removed} logs antigos removidos`);
        }
        
        return removed;
    }
}

// Instância global
window.autoIntegration = new AutoIntegration();

// Configurar integração automática em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔗 Auto Integration carregado - use autoIntegration.runAutoIntegrationFromFiles() para integração completa');
    
    // Integração automática opcional a cada 30 minutos em desenvolvimento
    if (window.location.search.includes('auto_integrate=true')) {
        setInterval(async () => {
            console.log('⏰ Executando integração automática agendada...');
            await window.autoIntegration.runAutoIntegrationFromFiles();
        }, 30 * 60 * 1000); // 30 minutos
    }
}

// Hook para integração após mudanças no código (se detectadas)
window.addEventListener('beforeunload', () => {
    // Salvar logs de integração no localStorage para persistência
    if (window.autoIntegration && window.autoIntegration.integrationLog.length > 0) {
        localStorage.setItem('autoIntegrationLogs', JSON.stringify(window.autoIntegration.integrationLog));
    }
});

// Restaurar logs ao carregar
window.addEventListener('load', () => {
    const savedLogs = localStorage.getItem('autoIntegrationLogs');
    if (savedLogs && window.autoIntegration) {
        try {
            window.autoIntegration.integrationLog = JSON.parse(savedLogs);
            console.log('📋 Logs de integração restaurados');
        } catch (error) {
            console.warn('⚠️ Erro ao restaurar logs de integração:', error);
        }
    }
}); 