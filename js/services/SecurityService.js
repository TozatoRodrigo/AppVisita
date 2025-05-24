/**
 * 🔒 Serviço de Segurança - AppVisita
 * Sistema avançado de segurança e detecção de ataques
 */

class SecurityService {
  constructor() {
    this.enabled = true;
    this.rateLimit = new Map();
    this.suspiciousActivity = [];
    this.blockedIPs = new Set();
    this.sessionSecurity = new Map();
    this.securityEvents = [];
    
    // Rate limiting configuration
    this.rateLimits = {
      login: { max: 5, window: 15 * 60 * 1000 }, // 5 tentativas em 15 min
      api: { max: 100, window: 60 * 1000 }, // 100 requests por minuto
      search: { max: 30, window: 60 * 1000 }, // 30 buscas por minuto
      upload: { max: 10, window: 60 * 1000 } // 10 uploads por minuto
    };
    
    this.initializeSecurity();
  }

  /**
   * Inicializar sistema de segurança
   */
  initializeSecurity() {
    this.setupCSPViolationReporting();
    this.setupXSSDetection();
    this.setupSessionMonitoring();
    this.startSecurityScanner();
    
    // Cleanup periódico
    setInterval(() => this.cleanupSecurityData(), 5 * 60 * 1000); // 5 min
  }

  /**
   * Rate Limiting
   */
  checkRateLimit(action, identifier = null) {
    if (!this.enabled) return { allowed: true };

    const key = identifier || this.getClientFingerprint();
    const config = this.rateLimits[action];
    
    if (!config) {
      console.warn(`🔒 Rate limit não configurado para: ${action}`);
      return { allowed: true };
    }

    const now = Date.now();
    const windowStart = now - config.window;
    
    // Obter ou criar entrada do rate limit
    if (!this.rateLimit.has(key)) {
      this.rateLimit.set(key, new Map());
    }
    
    const userLimits = this.rateLimit.get(key);
    
    if (!userLimits.has(action)) {
      userLimits.set(action, []);
    }
    
    const attempts = userLimits.get(action);
    
    // Remover tentativas fora da janela de tempo
    const validAttempts = attempts.filter(time => time > windowStart);
    userLimits.set(action, validAttempts);
    
    // Verificar se excedeu o limite
    if (validAttempts.length >= config.max) {
      this.logSecurityEvent('rate_limit_exceeded', {
        action,
        identifier: key,
        attempts: validAttempts.length,
        limit: config.max,
        window: config.window
      }, 'warning');
      
      return {
        allowed: false,
        retryAfter: Math.ceil((validAttempts[0] + config.window - now) / 1000),
        message: `Muitas tentativas. Tente novamente em ${Math.ceil((validAttempts[0] + config.window - now) / 60000)} minutos.`
      };
    }
    
    // Adicionar nova tentativa
    validAttempts.push(now);
    
    return {
      allowed: true,
      remaining: config.max - validAttempts.length
    };
  }

  /**
   * Detectar atividade suspeita
   */
  detectSuspiciousActivity(activity) {
    const patterns = {
      rapid_requests: {
        check: (acts) => acts.filter(a => Date.now() - a.timestamp < 10000).length > 20,
        severity: 'high'
      },
      multiple_failed_logins: {
        check: (acts) => acts.filter(a => 
          a.type === 'login_failed' && 
          Date.now() - a.timestamp < 300000
        ).length > 3,
        severity: 'critical'
      },
      unusual_hours: {
        check: (acts) => {
          const hour = new Date().getHours();
          return (hour < 6 || hour > 22) && acts.length > 10;
        },
        severity: 'medium'
      },
      sql_injection_attempt: {
        check: (acts) => acts.some(a => 
          a.data && typeof a.data === 'string' && 
          /(\bselect\b|\bunion\b|\bdrop\b|\bdelete\b)/i.test(a.data)
        ),
        severity: 'critical'
      },
      xss_attempt: {
        check: (acts) => acts.some(a => 
          a.data && typeof a.data === 'string' && 
          /<script|javascript:|onerror=/i.test(a.data)
        ),
        severity: 'critical'
      }
    };

    this.suspiciousActivity.push({
      ...activity,
      timestamp: Date.now(),
      fingerprint: this.getClientFingerprint()
    });

    // Manter apenas últimas 100 atividades
    if (this.suspiciousActivity.length > 100) {
      this.suspiciousActivity = this.suspiciousActivity.slice(-50);
    }

    // Verificar padrões suspeitos
    Object.entries(patterns).forEach(([pattern, config]) => {
      if (config.check(this.suspiciousActivity)) {
        this.handleSuspiciousPattern(pattern, config.severity);
      }
    });
  }

  /**
   * Lidar com padrão suspeito detectado
   */
  handleSuspiciousPattern(pattern, severity) {
    const fingerprint = this.getClientFingerprint();
    
    this.logSecurityEvent('suspicious_pattern_detected', {
      pattern,
      severity,
      fingerprint,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }, severity);

    // Ações baseadas na severidade
    switch (severity) {
      case 'critical':
        this.blockClient(fingerprint, '24h');
        this.notifyAdmins(`Atividade crítica detectada: ${pattern}`);
        break;
      case 'high':
        this.increaseSecurityLevel(fingerprint);
        break;
      case 'medium':
        this.logWarning(`Atividade suspeita: ${pattern}`);
        break;
    }
  }

  /**
   * Detectar ataques XSS
   */
  setupXSSDetection() {
    // Interceptar mudanças no DOM que podem indicar XSS
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                
                // Verificar scripts suspeitos
                if (element.tagName === 'SCRIPT' && !element.src) {
                  this.detectSuspiciousActivity({
                    type: 'xss_attempt',
                    data: element.textContent?.substring(0, 100),
                    location: window.location.href
                  });
                }
                
                // Verificar atributos perigosos
                const dangerousAttributes = ['onload', 'onerror', 'onclick', 'onmouseover'];
                dangerousAttributes.forEach(attr => {
                  if (element.getAttribute(attr)) {
                    this.detectSuspiciousActivity({
                      type: 'xss_attempt',
                      data: `${attr}="${element.getAttribute(attr)}"`,
                      location: window.location.href
                    });
                  }
                });
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Configurar relatórios de violação CSP
   */
  setupCSPViolationReporting() {
    document.addEventListener('securitypolicyviolation', (event) => {
      this.logSecurityEvent('csp_violation', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        lineNumber: event.lineNumber,
        sourceFile: event.sourceFile
      }, 'warning');
    });
  }

  /**
   * Monitoramento de sessão
   */
  setupSessionMonitoring() {
    const sessionData = {
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      actions: 0,
      fingerprint: this.getClientFingerprint()
    };

    this.sessionSecurity.set('current', sessionData);

    // Monitorar atividade
    ['click', 'keypress', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        sessionData.lastActivity = Date.now();
        sessionData.actions++;
      });
    });

    // Detectar sessões anômalas
    setInterval(() => {
      this.analyzeSessionSecurity();
    }, 60000); // A cada minuto
  }

  /**
   * Analisar segurança da sessão
   */
  analyzeSessionSecurity() {
    const session = this.sessionSecurity.get('current');
    if (!session) return;

    const now = Date.now();
    const sessionDuration = now - session.startTime;
    const timeSinceLastActivity = now - session.lastActivity;

    // Sessão muito longa (mais de 8 horas)
    if (sessionDuration > 8 * 60 * 60 * 1000) {
      this.logSecurityEvent('long_session', {
        duration: sessionDuration,
        actions: session.actions
      }, 'info');
    }

    // Atividade muito intensa
    const actionsPerHour = (session.actions / sessionDuration) * 3600000;
    if (actionsPerHour > 1000) {
      this.detectSuspiciousActivity({
        type: 'high_activity',
        data: { actionsPerHour, sessionDuration }
      });
    }

    // Sessão inativa por muito tempo
    if (timeSinceLastActivity > 30 * 60 * 1000) { // 30 min
      this.logSecurityEvent('inactive_session', {
        inactiveTime: timeSinceLastActivity
      }, 'info');
    }
  }

  /**
   * Validação de entrada avançada
   */
  sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') return input;

    const sanitizers = {
      text: (str) => str.replace(/[<>\"']/g, '').trim(),
      email: (str) => str.replace(/[^\w@.-]/g, '').toLowerCase(),
      cpf: (str) => str.replace(/[^\d]/g, ''),
      phone: (str) => str.replace(/[^\d\s\-\(\)]/g, ''),
      medical: (str) => str.replace(/<script.*?>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
    };

    const sanitizer = sanitizers[type] || sanitizers.text;
    const sanitized = sanitizer(input);

    // Detectar tentativas de injeção
    if (input !== sanitized) {
      this.detectSuspiciousActivity({
        type: 'input_sanitization',
        data: { original: input.substring(0, 50), sanitized: sanitized.substring(0, 50) }
      });
    }

    return sanitized;
  }

  /**
   * Verificar integridade de dados
   */
  verifyDataIntegrity(data, expectedHash = null) {
    try {
      const dataString = JSON.stringify(data);
      const hash = this.simpleHash(dataString);
      
      if (expectedHash && hash !== expectedHash) {
        this.logSecurityEvent('data_integrity_violation', {
          expectedHash,
          actualHash: hash,
          dataSize: dataString.length
        }, 'critical');
        return false;
      }
      
      return { valid: true, hash };
    } catch (error) {
      this.logSecurityEvent('data_integrity_error', {
        error: error.message
      }, 'error');
      return false;
    }
  }

  /**
   * Gerar fingerprint do cliente
   */
  getClientFingerprint() {
    if (this.fingerprint) return this.fingerprint;

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      !!window.localStorage,
      !!window.sessionStorage,
      navigator.cookieEnabled
    ];

    this.fingerprint = this.simpleHash(components.join('|'));
    return this.fingerprint;
  }

  /**
   * Hash simples para fingerprinting
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Bloquear cliente
   */
  blockClient(fingerprint, duration = '1h') {
    const blockInfo = {
      fingerprint,
      blockedAt: Date.now(),
      duration,
      reason: 'Atividade suspeita detectada'
    };

    this.blockedIPs.add(fingerprint);
    
    this.logSecurityEvent('client_blocked', blockInfo, 'critical');

    // Programar desbloqueio
    const durationMs = this.parseDuration(duration);
    setTimeout(() => {
      this.unblockClient(fingerprint);
    }, durationMs);
  }

  /**
   * Desbloquear cliente
   */
  unblockClient(fingerprint) {
    this.blockedIPs.delete(fingerprint);
    this.logSecurityEvent('client_unblocked', { fingerprint }, 'info');
  }

  /**
   * Verificar se cliente está bloqueado
   */
  isClientBlocked(fingerprint = null) {
    const fp = fingerprint || this.getClientFingerprint();
    return this.blockedIPs.has(fp);
  }

  /**
   * Validar permissões de acesso
   */
  validateAccess(resource, action, user = null) {
    if (this.isClientBlocked()) {
      return {
        allowed: false,
        reason: 'Cliente bloqueado por atividade suspeita'
      };
    }

    const currentUser = user || window.firebase?.auth()?.currentUser;
    if (!currentUser) {
      return {
        allowed: false,
        reason: 'Usuário não autenticado'
      };
    }

    // Rate limiting específico para ação
    const rateLimitCheck = this.checkRateLimit(action);
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        reason: rateLimitCheck.message,
        retryAfter: rateLimitCheck.retryAfter
      };
    }

    // Log da tentativa de acesso
    this.logSecurityEvent('access_attempt', {
      resource,
      action,
      userId: currentUser.uid,
      fingerprint: this.getClientFingerprint()
    }, 'info');

    return { allowed: true };
  }

  /**
   * Scanner de segurança
   */
  startSecurityScanner() {
    setInterval(() => {
      this.performSecurityScan();
    }, 60000); // A cada minuto
  }

  performSecurityScan() {
    const results = {
      timestamp: Date.now(),
      checks: []
    };

    // Verificar modificações suspeitas no DOM
    const scripts = document.querySelectorAll('script');
    scripts.forEach((script, index) => {
      if (!script.src && script.textContent.includes('eval')) {
        results.checks.push({
          type: 'suspicious_script',
          severity: 'high',
          details: `Script ${index} contém eval()`
        });
      }
    });

    // Verificar localStorage suspeito
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        if (value && (value.includes('<script') || value.includes('javascript:'))) {
          results.checks.push({
            type: 'suspicious_localstorage',
            severity: 'medium',
            details: `Conteúdo suspeito em localStorage: ${key}`
          });
        }
      }
    } catch (error) {
      // Ignorar erros de acesso ao localStorage
    }

    // Verificar console modifications
    if (window.console.log.toString().includes('function')) {
      results.checks.push({
        type: 'console_modified',
        severity: 'medium',
        details: 'Console pode ter sido modificado'
      });
    }

    // Se encontrou problemas, logar
    if (results.checks.length > 0) {
      this.logSecurityEvent('security_scan_results', results, 'warning');
    }
  }

  /**
   * Utilitários
   */
  parseDuration(duration) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 60 * 60 * 1000; // 1 hora por padrão

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  logSecurityEvent(event, data, level = 'info') {
    const securityEvent = {
      event,
      level,
      data,
      timestamp: Date.now(),
      fingerprint: this.getClientFingerprint(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.securityEvents.push(securityEvent);

    // Log para auditoria se disponível
    if (window.AuditService) {
      window.AuditService.logSecurityEvent(event, data, level);
    }

    // Log local para desenvolvimento
    if (window.ENVIRONMENT === 'development') {
      console.log(`🔒 [SECURITY] ${event}:`, data);
    }
  }

  notifyAdmins(message) {
    // Em um sistema real, isso enviaria notificações para administradores
    console.warn(`🚨 [SECURITY ALERT] ${message}`);
    
    if (window.AuditService) {
      window.AuditService.logSecurityEvent('admin_notification', {
        message,
        timestamp: Date.now()
      }, 'critical');
    }
  }

  increaseSecurityLevel(fingerprint) {
    // Aumentar medidas de segurança para este cliente
    this.sessionSecurity.set(fingerprint, {
      ...this.sessionSecurity.get(fingerprint),
      securityLevel: 'high',
      enhancedMonitoring: true
    });
  }

  logWarning(message) {
    console.warn(`🔒 [SECURITY WARNING] ${message}`);
  }

  cleanupSecurityData() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Limpar rate limits antigos
    this.rateLimit.forEach((userLimits, key) => {
      userLimits.forEach((attempts, action) => {
        const validAttempts = attempts.filter(time => time > oneHourAgo);
        if (validAttempts.length === 0) {
          userLimits.delete(action);
        } else {
          userLimits.set(action, validAttempts);
        }
      });
      
      if (userLimits.size === 0) {
        this.rateLimit.delete(key);
      }
    });

    // Limpar atividades suspeitas antigas
    this.suspiciousActivity = this.suspiciousActivity.filter(
      activity => activity.timestamp > oneHourAgo
    );

    // Limpar eventos de segurança antigos (manter apenas últimas 24h)
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    this.securityEvents = this.securityEvents.filter(
      event => event.timestamp > oneDayAgo
    );
  }

  /**
   * API pública
   */
  isSecure() {
    return !this.isClientBlocked() && this.securityEvents.filter(
      e => e.level === 'critical' && Date.now() - e.timestamp < 3600000
    ).length === 0;
  }

  getSecurityStatus() {
    return {
      blocked: this.isClientBlocked(),
      fingerprint: this.getClientFingerprint(),
      recentEvents: this.securityEvents.filter(
        e => Date.now() - e.timestamp < 3600000
      ).length,
      rateLimitStatus: Array.from(this.rateLimit.entries()),
      suspiciousActivityCount: this.suspiciousActivity.length
    };
  }

  disable() {
    this.enabled = false;
    console.warn('🔒 [SECURITY] Sistema de segurança DESABILITADO');
  }

  enable() {
    this.enabled = true;
    console.log('🔒 [SECURITY] Sistema de segurança HABILITADO');
  }
}

// Instância global
window.SecurityService = new SecurityService();

// Expor para outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityService;
} 