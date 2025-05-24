/**
 * 🔍 Serviço de Validação - AppVisita
 * Sistema profissional de validação para aplicação médica
 * Inclui validações específicas para dados de saúde (CPF, CRM, etc.)
 */

class ValidationService {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.errorMessages = {
      required: 'Este campo é obrigatório',
      email: 'Email inválido',
      cpf: 'CPF inválido',
      cnpj: 'CNPJ inválido',
      crm: 'CRM inválido',
      phone: 'Telefone inválido',
      date: 'Data inválida',
      minLength: (min) => `Mínimo de ${min} caracteres`,
      maxLength: (max) => `Máximo de ${max} caracteres`,
      min: (min) => `Valor mínimo: ${min}`,
      max: (max) => `Valor máximo: ${max}`,
      pattern: 'Formato inválido',
      numeric: 'Apenas números são permitidos',
      alpha: 'Apenas letras são permitidas',
      alphanumeric: 'Apenas letras e números são permitidos',
      url: 'URL inválida',
      file: 'Arquivo inválido',
      image: 'Imagem inválida',
      custom: 'Valor inválido'
    };
    
    this.initializeDefaultRules();
  }

  /**
   * Inicializar regras padrão
   */
  initializeDefaultRules() {
    // Regras básicas
    this.addRule('required', (value) => {
      return value !== null && value !== undefined && String(value).trim() !== '';
    });

    this.addRule('email', (value) => {
      if (!value) return true; // Opcional se não for required
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(String(value).toLowerCase());
    });

    this.addRule('cpf', (value) => {
      if (!value) return true;
      return this.validateCPF(value);
    });

    this.addRule('cnpj', (value) => {
      if (!value) return true;
      return this.validateCNPJ(value);
    });

    this.addRule('crm', (value) => {
      if (!value) return true;
      return this.validateCRM(value);
    });

    this.addRule('phone', (value) => {
      if (!value) return true;
      const phoneRegex = /^(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})$/;
      return phoneRegex.test(String(value).replace(/\D/g, ''));
    });

    this.addRule('date', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    });

    this.addRule('numeric', (value) => {
      if (!value) return true;
      return !isNaN(value) && !isNaN(parseFloat(value));
    });

    this.addRule('alpha', (value) => {
      if (!value) return true;
      return /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
    });

    this.addRule('alphanumeric', (value) => {
      if (!value) return true;
      return /^[a-zA-Z0-9À-ÿ\s]+$/.test(value);
    });

    this.addRule('url', (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // Regras específicas médicas
    this.addRule('bloodPressure', (value) => {
      if (!value) return true;
      const bpRegex = /^\d{2,3}x\d{2,3}$/;
      return bpRegex.test(value);
    });

    this.addRule('heartRate', (value) => {
      if (!value) return true;
      const hr = parseInt(value);
      return hr >= 30 && hr <= 300;
    });

    this.addRule('temperature', (value) => {
      if (!value) return true;
      const temp = parseFloat(value);
      return temp >= 30 && temp <= 45;
    });

    this.addRule('weight', (value) => {
      if (!value) return true;
      const weight = parseFloat(value);
      return weight >= 0.5 && weight <= 500;
    });

    this.addRule('height', (value) => {
      if (!value) return true;
      const height = parseFloat(value);
      return height >= 30 && height <= 250;
    });
  }

  /**
   * Adicionar nova regra de validação
   */
  addRule(name, validator) {
    this.rules.set(name, validator);
  }

  /**
   * Adicionar validador customizado
   */
  addCustomValidator(name, validator, errorMessage) {
    this.customValidators.set(name, { validator, errorMessage });
  }

  /**
   * Validar um valor individual
   */
  validateValue(value, rules) {
    const errors = [];

    for (const rule of rules) {
      const result = this.applyRule(value, rule);
      if (!result.valid) {
        errors.push(result.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Aplicar uma regra específica
   */
  applyRule(value, rule) {
    if (typeof rule === 'string') {
      rule = { type: rule };
    }

    const { type, ...params } = rule;

    // Verificar regras padrão
    if (this.rules.has(type)) {
      const validator = this.rules.get(type);
      const isValid = validator(value, params);
      
      return {
        valid: isValid,
        message: isValid ? null : this.getErrorMessage(type, params)
      };
    }

    // Verificar validadores customizados
    if (this.customValidators.has(type)) {
      const { validator, errorMessage } = this.customValidators.get(type);
      const isValid = validator(value, params);
      
      return {
        valid: isValid,
        message: isValid ? null : errorMessage
      };
    }

    // Regras com parâmetros
    switch (type) {
      case 'minLength':
        return {
          valid: !value || String(value).length >= params.min,
          message: this.getErrorMessage('minLength', params)
        };

      case 'maxLength':
        return {
          valid: !value || String(value).length <= params.max,
          message: this.getErrorMessage('maxLength', params)
        };

      case 'min':
        return {
          valid: !value || parseFloat(value) >= params.min,
          message: this.getErrorMessage('min', params)
        };

      case 'max':
        return {
          valid: !value || parseFloat(value) <= params.max,
          message: this.getErrorMessage('max', params)
        };

      case 'pattern':
        const regex = new RegExp(params.pattern);
        return {
          valid: !value || regex.test(value),
          message: this.getErrorMessage('pattern', params)
        };

      case 'file':
        return this.validateFile(value, params);

      case 'image':
        return this.validateImage(value, params);

      default:
        console.warn(`Regra de validação '${type}' não encontrada`);
        return { valid: true, message: null };
    }
  }

  /**
   * Validar um formulário completo
   */
  validateForm(formData, schema) {
    const results = {};
    let isFormValid = true;

    for (const [field, rules] of Object.entries(schema)) {
      const value = formData[field];
      const result = this.validateValue(value, rules);
      
      results[field] = result;
      
      if (!result.valid) {
        isFormValid = false;
      }
    }

    return {
      valid: isFormValid,
      fields: results,
      errors: this.flattenErrors(results)
    };
  }

  /**
   * Validação específica para pacientes
   */
  validatePatient(patientData) {
    const schema = {
      nome: [
        { type: 'required' },
        { type: 'alpha' },
        { type: 'minLength', min: 2 },
        { type: 'maxLength', max: 100 }
      ],
      cpf: [
        { type: 'required' },
        { type: 'cpf' }
      ],
      dataNascimento: [
        { type: 'required' },
        { type: 'date' },
        { type: 'custom', validator: this.validateBirthDate }
      ],
      email: [
        { type: 'email' }
      ],
      telefone: [
        { type: 'phone' }
      ],
      convenio: [
        { type: 'maxLength', max: 50 }
      ]
    };

    return this.validateForm(patientData, schema);
  }

  /**
   * Validação específica para evoluções
   */
  validateEvolution(evolutionData) {
    const schema = {
      queixaPrincipal: [
        { type: 'required' },
        { type: 'minLength', min: 10 },
        { type: 'maxLength', max: 500 }
      ],
      historiaAtual: [
        { type: 'maxLength', max: 2000 }
      ],
      exameFisico: [
        { type: 'maxLength', max: 2000 }
      ],
      avaliacaoPlano: [
        { type: 'maxLength', max: 2000 }
      ],
      pressaoArterial: [
        { type: 'bloodPressure' }
      ],
      frequenciaCardiaca: [
        { type: 'heartRate' }
      ],
      temperatura: [
        { type: 'temperature' }
      ],
      peso: [
        { type: 'weight' }
      ],
      altura: [
        { type: 'height' }
      ]
    };

    return this.validateForm(evolutionData, schema);
  }

  /**
   * Validação específica para usuários médicos
   */
  validateDoctor(doctorData) {
    const schema = {
      nomeCompleto: [
        { type: 'required' },
        { type: 'alpha' },
        { type: 'minLength', min: 5 },
        { type: 'maxLength', max: 100 }
      ],
      email: [
        { type: 'required' },
        { type: 'email' }
      ],
      cpf: [
        { type: 'required' },
        { type: 'cpf' }
      ],
      crm: [
        { type: 'required' },
        { type: 'crm' }
      ],
      especialidade: [
        { type: 'required' },
        { type: 'alpha' },
        { type: 'maxLength', max: 50 }
      ],
      telefone: [
        { type: 'phone' }
      ]
    };

    return this.validateForm(doctorData, schema);
  }

  /**
   * Validar CPF
   */
  validateCPF(cpf) {
    if (!cpf) return false;
    
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  /**
   * Validar CNPJ
   */
  validateCNPJ(cnpj) {
    if (!cnpj) return false;
    
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    
    // Validação do segundo dígito
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(cnpj.charAt(13));
  }

  /**
   * Validar CRM
   */
  validateCRM(crm) {
    if (!crm) return false;
    
    // Formato: NÚMERO/UF ou NÚMERO-UF
    const crmRegex = /^\d{4,6}[-\/]?[A-Z]{2}$/i;
    return crmRegex.test(crm.replace(/\s/g, ''));
  }

  /**
   * Validar data de nascimento
   */
  validateBirthDate(date) {
    if (!date) return false;
    
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // Idade mínima 0 anos, máxima 150 anos
    return age >= 0 && age <= 150 && birthDate <= today;
  }

  /**
   * Validar arquivo
   */
  validateFile(file, params) {
    if (!file) return { valid: true, message: null };
    
    const errors = [];
    
    // Verificar tamanho
    if (params.maxSize && file.size > params.maxSize) {
      errors.push(`Arquivo muito grande. Máximo: ${this.formatFileSize(params.maxSize)}`);
    }
    
    // Verificar tipo
    if (params.allowedTypes && !params.allowedTypes.includes(file.type)) {
      errors.push(`Tipo de arquivo não permitido. Permitidos: ${params.allowedTypes.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      message: errors.join('. ')
    };
  }

  /**
   * Validar imagem
   */
  validateImage(file, params) {
    if (!file) return { valid: true, message: null };
    
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const fileParams = {
      ...params,
      allowedTypes: params.allowedTypes || imageTypes
    };
    
    return this.validateFile(file, fileParams);
  }

  /**
   * Obter mensagem de erro
   */
  getErrorMessage(type, params = {}) {
    const message = this.errorMessages[type];
    
    if (typeof message === 'function') {
      return message(params.min || params.max || params.pattern);
    }
    
    return message || 'Valor inválido';
  }

  /**
   * Achatar erros para exibição
   */
  flattenErrors(results) {
    const errors = [];
    
    for (const [field, result] of Object.entries(results)) {
      if (!result.valid) {
        errors.push(...result.errors.map(error => `${field}: ${error}`));
      }
    }
    
    return errors;
  }

  /**
   * Formatar tamanho de arquivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Sanitizar dados de entrada
   */
  sanitize(data, rules = {}) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      let sanitizedValue = value;
      
      if (typeof value === 'string') {
        // Trim básico
        sanitizedValue = value.trim();
        
        // Aplicar regras específicas
        if (rules[key]) {
          const fieldRules = rules[key];
          
          if (fieldRules.includes('uppercase')) {
            sanitizedValue = sanitizedValue.toUpperCase();
          }
          
          if (fieldRules.includes('lowercase')) {
            sanitizedValue = sanitizedValue.toLowerCase();
          }
          
          if (fieldRules.includes('removeHtml')) {
            sanitizedValue = sanitizedValue.replace(/<[^>]*>/g, '');
          }
          
          if (fieldRules.includes('removeExtraSpaces')) {
            sanitizedValue = sanitizedValue.replace(/\s+/g, ' ');
          }
        }
      }
      
      sanitized[key] = sanitizedValue;
    }
    
    return sanitized;
  }

  /**
   * Validar e sanitizar dados
   */
  validateAndSanitize(data, schema, sanitizeRules = {}) {
    // Primeiro sanitizar
    const sanitizedData = this.sanitize(data, sanitizeRules);
    
    // Depois validar
    const validation = this.validateForm(sanitizedData, schema);
    
    return {
      ...validation,
      data: sanitizedData
    };
  }
}

// Instância global
window.ValidationService = new ValidationService();

// Expor para outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationService;
} 