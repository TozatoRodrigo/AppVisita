/**
 * 🔒 Serviço de Auditoria - AppVisita
 * Sistema profissional de logs e auditoria para compliance médico
 */

class AuditService {
  constructor() {
    this.collection = 'auditoria';
    this.enabled = true;
    this.batchSize = 10;
    this.pendingLogs = [];
    this.sessionId = this.generateSessionId();
    
    // Auto-flush dos logs pendentes a cada 30 segundos
    setInterval(() => this.flushPendingLogs(), 30000);
  }

  /**
   * Registrar evento de auditoria
   * @param {string} action - Ação realizada (login, create_patient, update_evolution, etc.)
   * @param {object} resource - Recurso afetado
   * @param {object} details - Detalhes adicionais
   * @param {string} level - Nível: info, warning, error, critical
   */
  async log(action, resource = {}, details = {}, level = 'info') {
    if (!this.enabled) return;

    try {
      const logEntry = {
        // Identificação
        id: this.generateLogId(),
        sessionId: this.sessionId,
        
        // Timestamp
        timestamp: firebase.firestore.Timestamp.now(),
        timestampISO: new Date().toISOString(),
        
        // Ação
        action,
        level,
        
        // Usuário
        user: this.getCurrentUserInfo(),
        
        // Recurso afetado
        resource: {
          type: resource.type || 'unknown',
          id: resource.id || null,
          collection: resource.collection || null,
          ...resource
        },
        
        // Detalhes
        details: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          url: window.location.href,
          referrer: document.referrer,
          ...details
        },
        
        // Contexto técnico
        context: {
          firebaseProjectId: firebase.app().options.projectId,
          appVersion: window.APP_VERSION || '1.2.4',
          buildId: window.BUILD_ID || 'dev'
        },
        
        // Metadados de segurança
        security: {
          ipHash: await this.getIpHash(),
          fingerprintHash: await this.getBrowserFingerprint()
        }
      };

      // Adicionar à fila para processamento em batch
      this.pendingLogs.push(logEntry);
      
      // Se atingiu o tamanho do batch ou é crítico, processar imediatamente
      if (this.pendingLogs.length >= this.batchSize || level === 'critical') {
        await this.flushPendingLogs();
      }

      // Log local para desenvolvimento
      if (window.location.hostname === 'localhost') {
        console.log(`🔒 [AUDIT] ${action}:`, logEntry);
      }

    } catch (error) {
      console.error('🔒 [AUDIT ERROR] Falha ao registrar log de auditoria:', error);
      // Não falhar a operação principal por causa de erro de auditoria
    }
  }

  /**
   * Logs específicos para ações médicas
   */
  async logMedicalAction(action, patientId, evolutionId, details = {}) {
    await this.log(action, {
      type: 'medical',
      patientId,
      evolutionId
    }, {
      ...details,
      category: 'medical'
    });
  }

  /**
   * Logs de segurança
   */
  async logSecurityEvent(action, details = {}, level = 'warning') {
    await this.log(action, {
      type: 'security'
    }, {
      ...details,
      category: 'security'
    }, level);
  }

  /**
   * Logs de acesso e autenticação
   */
  async logAuthEvent(action, details = {}) {
    await this.log(action, {
      type: 'authentication'
    }, {
      ...details,
      category: 'auth'
    });
  }

  /**
   * Processar logs pendentes em batch
   */
  async flushPendingLogs() {
    if (this.pendingLogs.length === 0) return;

    try {
      const logsToProcess = [...this.pendingLogs];
      this.pendingLogs = [];

      // Usar batch para performance
      const batch = firebase.firestore().batch();
      
      logsToProcess.forEach(logEntry => {
        const docRef = firebase.firestore().collection(this.collection).doc();
        batch.set(docRef, logEntry);
      });

      await batch.commit();
      
      console.log(`🔒 [AUDIT] ${logsToProcess.length} logs processados com sucesso`);

    } catch (error) {
      console.error('🔒 [AUDIT ERROR] Falha ao processar batch de logs:', error);
      
      // Recolocar logs na fila em caso de erro (max 3 tentativas)
      this.pendingLogs.forEach(log => {
        log.retryCount = (log.retryCount || 0) + 1;
        if (log.retryCount <= 3) {
          this.pendingLogs.push(log);
        }
      });
    }
  }

  /**
   * Obter informações do usuário atual
   */
  getCurrentUserInfo() {
    const user = firebase.auth().currentUser;
    if (!user) {
      return {
        uid: null,
        email: null,
        authenticated: false
      };
    }

    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAdmin: window.isAdmin || false,
      authenticated: true,
      lastSignIn: user.metadata.lastSignInTime,
      creationTime: user.metadata.creationTime
    };
  }

  /**
   * Gerar ID único para o log
   */
  generateLogId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gerar ID único para a sessão
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash do IP (para privacy)
   */
  async getIpHash() {
    try {
      // Em produção, isso seria obtido do servidor
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      
      // Hash para não armazenar IP real (LGPD compliance)
      const encoder = new TextEncoder();
      const data = encoder.encode(ip + 'salt_appvisita');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Fingerprint do browser (para detecção de sessões)
   */
  async getBrowserFingerprint() {
    try {
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
        !!window.localStorage,
        !!window.sessionStorage
      ].join('|');

      const encoder = new TextEncoder();
      const data = encoder.encode(fingerprint);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substr(0, 16);
    } catch {
      return 'unknown';
    }
  }

  /**
   * Buscar logs de auditoria (apenas para admins)
   */
  async searchLogs(filters = {}, limit = 100) {
    if (!window.isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem consultar logs de auditoria');
    }

    try {
      let query = firebase.firestore()
        .collection(this.collection)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      // Aplicar filtros
      if (filters.userId) {
        query = query.where('user.uid', '==', filters.userId);
      }
      
      if (filters.action) {
        query = query.where('action', '==', filters.action);
      }
      
      if (filters.level) {
        query = query.where('level', '==', filters.level);
      }
      
      if (filters.startDate) {
        query = query.where('timestamp', '>=', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.where('timestamp', '<=', filters.endDate);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('🔒 [AUDIT ERROR] Erro ao buscar logs:', error);
      throw error;
    }
  }

  /**
   * Estatísticas de auditoria para dashboard admin
   */
  async getAuditStats(days = 30) {
    if (!window.isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem ver estatísticas');
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
        .get();

      const logs = snapshot.docs.map(doc => doc.data());
      
      return {
        total: logs.length,
        byLevel: this.groupBy(logs, 'level'),
        byAction: this.groupBy(logs, 'action'),
        byUser: this.groupBy(logs, log => log.user.email || 'anonymous'),
        criticalEvents: logs.filter(log => log.level === 'critical').length,
        securityEvents: logs.filter(log => log.details.category === 'security').length,
        medicalActions: logs.filter(log => log.details.category === 'medical').length
      };

    } catch (error) {
      console.error('🔒 [AUDIT ERROR] Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Utilitário para agrupar dados
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = typeof key === 'function' ? key(item) : item[key];
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Limpar logs antigos (manutenção)
   */
  async cleanupOldLogs(daysToKeep = 365) {
    if (!window.isAdmin) {
      throw new Error('Acesso negado: apenas administradores podem limpar logs');
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const oldLogs = await firebase.firestore()
        .collection(this.collection)
        .where('timestamp', '<', firebase.firestore.Timestamp.fromDate(cutoffDate))
        .limit(500) // Processar em lotes para evitar timeout
        .get();

      if (oldLogs.empty) {
        return { deleted: 0, message: 'Nenhum log antigo encontrado' };
      }

      const batch = firebase.firestore().batch();
      oldLogs.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
      
      return { 
        deleted: oldLogs.size, 
        message: `${oldLogs.size} logs antigos removidos com sucesso` 
      };

    } catch (error) {
      console.error('🔒 [AUDIT ERROR] Erro na limpeza de logs:', error);
      throw error;
    }
  }

  /**
   * Desabilitar auditoria (apenas para testes)
   */
  disable() {
    this.enabled = false;
    console.warn('🔒 [AUDIT] Sistema de auditoria DESABILITADO');
  }

  /**
   * Habilitar auditoria
   */
  enable() {
    this.enabled = true;
    console.log('🔒 [AUDIT] Sistema de auditoria HABILITADO');
  }
}

// Instância global
window.AuditService = new AuditService();

// Expor para outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditService;
} 