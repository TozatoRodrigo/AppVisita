// Script de diagnóstico para a aplicação AppVisita
console.log("Carregando script de diagnóstico...");

// Verificar autenticação inicial
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado em app-diagnostico.js");
  
  // Verificar estado das variáveis globais
  setTimeout(function() {
    verificarVariaveisGlobais();
    criarPainelDiagnostico();
    verificarFirebase();
    verificarModulos();
    verificarAutenticacao();
  }, 2000); // Atraso para permitir que tudo seja carregado
});

// Verificar variáveis globais
function verificarVariaveisGlobais() {
  console.log("Verificando variáveis globais:");
  console.log({
    firebase: !!window.firebase,
    app: !!window.app,
    auth: !!window.auth,
    db: !!window.db,
    storage: !!window.storage,
    AppVisita: !!window.AppVisita,
    AppModulos: !!window.AppModulos,
    currentUser: !!window.currentUser,
    isAdmin: window.isAdmin
  });
}

// Criar painel de diagnóstico
function criarPainelDiagnostico() {
  // Verificar se já existe
  if (document.getElementById('painel-diagnostico')) {
    return;
  }
  
  // Criar painel
  const painel = document.createElement('div');
  painel.id = 'painel-diagnostico';
  painel.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    overflow-y: auto;
    z-index: 9999;
    border-top-left-radius: 5px;
  `;
  
  // Adicionar cabeçalho
  const header = document.createElement('div');
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="font-weight: bold;">AppVisita Diagnóstico</span>
      <span id="fechar-diagnostico" style="cursor: pointer;">X</span>
    </div>
    <div id="status-firebase" style="margin-bottom: 5px;"></div>
    <div id="status-modulos" style="margin-bottom: 10px;"></div>
    <div id="auth-tools" style="margin: 10px 0;">
      <button id="fix-firebase" style="background: #4285f4; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Reiniciar Firebase</button>
      <button id="clear-auth" style="background: #ea4335; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">Limpar Auth</button>
    </div>
  `;
  painel.appendChild(header);
  
  // Container para logs
  const logContainer = document.createElement('div');
  logContainer.id = 'logs-diagnostico';
  painel.appendChild(logContainer);
  
  // Adicionar ao body
  document.body.appendChild(painel);
  
  // Evento para fechar
  document.getElementById('fechar-diagnostico').addEventListener('click', function() {
    painel.style.display = 'none';
    document.getElementById('toggle-diagnostico').style.display = 'flex';
  });
  
  // Evento para reiniciar Firebase
  document.getElementById('fix-firebase').addEventListener('click', function() {
    logDiagnostico("Tentando reiniciar Firebase...");
    
    try {
      if (typeof inicializarFirebase === 'function') {
        inicializarFirebase();
        logDiagnostico("Função inicializarFirebase chamada com sucesso");
      } else {
        logDiagnostico("Função inicializarFirebase não encontrada, tentando reiniciar manualmente...", "warn");
        
        // Reinicialização manual
        if (firebase) {
          // Verificar se o auth já foi inicializado
          if (!auth && firebase.auth) {
            window.auth = firebase.auth();
            logDiagnostico("Auth reinicializado manualmente", "info");
          }
          
          // Verificar se o db já foi inicializado
          if (!db && firebase.firestore) {
            window.db = firebase.firestore();
            logDiagnostico("Firestore reinicializado manualmente", "info");
          }
          
          // Disparar evento
          document.dispatchEvent(new CustomEvent('firebase-ready'));
          logDiagnostico("Evento firebase-ready disparado manualmente", "info");
        } else {
          logDiagnostico("Firebase não está disponível, recarregue a página", "error");
        }
      }
      
      // Atualizar status
      setTimeout(function() {
        verificarFirebase();
        verificarAutenticacao();
      }, 1000);
    } catch (e) {
      logDiagnostico(`Erro ao reiniciar Firebase: ${e.message}`, "error");
    }
  });
  
  // Evento para limpar auth
  document.getElementById('clear-auth').addEventListener('click', async function() {
    logDiagnostico("Tentando limpar autenticação...");
    
    try {
      if (auth) {
        // Tentar fazer logout
        if (auth.currentUser) {
          await auth.signOut();
          logDiagnostico("Logout realizado com sucesso", "info");
        }
        
        // Limpar cache/storage locais
        window.localStorage.clear();
        window.sessionStorage.clear();
        logDiagnostico("Cache local limpo", "info");
        
        // Recarregar a página
        logDiagnostico("Recarregando a página em 3 segundos...", "warn");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        logDiagnostico("Auth não está disponível", "error");
      }
    } catch (e) {
      logDiagnostico(`Erro ao limpar autenticação: ${e.message}`, "error");
    }
  });
  
  // Botão para mostrar/esconder
  const botaoToggle = document.createElement('div');
  botaoToggle.id = 'toggle-diagnostico';
  botaoToggle.textContent = 'D';
  botaoToggle.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background: #4285f4;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    z-index: 10000;
    display: ${painel.style.display === 'none' ? 'flex' : 'none'};
  `;
  
  document.body.appendChild(botaoToggle);
  
  botaoToggle.addEventListener('click', function() {
    painel.style.display = 'block';
    botaoToggle.style.display = 'none';
    
    // Atualizar informações
    verificarFirebase();
    verificarModulos();
    verificarAutenticacao();
  });
}

// Adicionar uma entrada ao log
function logDiagnostico(mensagem, tipo = 'info') {
  const logContainer = document.getElementById('logs-diagnostico');
  if (!logContainer) return;
  
  const logEntry = document.createElement('div');
  logEntry.style.cssText = `
    margin-bottom: 5px;
    border-left: 3px solid ${tipo === 'error' ? '#dc3545' : tipo === 'warn' ? '#ffc107' : '#4285f4'};
    padding-left: 5px;
  `;
  
  const agora = new Date();
  const timestamp = `${agora.getHours()}:${agora.getMinutes()}:${agora.getSeconds()}`;
  
  logEntry.textContent = `[${timestamp}] ${mensagem}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Também logar no console
  console.log(`[Diagnóstico] ${mensagem}`);
}

// Verificar estado do Firebase
function verificarFirebase() {
  const statusFirebase = document.getElementById('status-firebase');
  if (!statusFirebase) return;
  
  try {
    // Verificar variáveis globais
    const firebaseObj = window.firebase;
    const appObj = window.app;
    const authObj = window.auth;
    const dbObj = window.db;
    const storageObj = window.storage;
    
    if (firebaseObj && authObj && dbObj && storageObj) {
      statusFirebase.innerHTML = `
        <span style="color: #28a745;">✓</span> Firebase: 
        <span style="color: #28a745;">App</span> | 
        <span style="color: #28a745;">Auth</span> | 
        <span style="color: #28a745;">Firestore</span> | 
        <span style="color: #28a745;">Storage</span>
      `;
      logDiagnostico("Firebase inicializado com sucesso");
    } else {
      let status = `<span style="color: #dc3545;">✗</span> Firebase: `;
      status += firebaseObj ? `<span style="color: #28a745;">Firebase</span> | ` : `<span style="color: #dc3545;">Firebase</span> | `;
      status += appObj ? `<span style="color: #28a745;">App</span> | ` : `<span style="color: #dc3545;">App</span> | `;
      status += authObj ? `<span style="color: #28a745;">Auth</span> | ` : `<span style="color: #dc3545;">Auth</span> | `;
      status += dbObj ? `<span style="color: #28a745;">Firestore</span> | ` : `<span style="color: #dc3545;">Firestore</span> | `;
      status += storageObj ? `<span style="color: #28a745;">Storage</span>` : `<span style="color: #dc3545;">Storage</span>`;
      
      statusFirebase.innerHTML = status;
      logDiagnostico("Firebase não inicializado completamente", "error");
    }
  } catch (err) {
    statusFirebase.innerHTML = `<span style="color: #dc3545;">✗</span> Firebase: Erro ao verificar`;
    logDiagnostico(`Erro ao verificar Firebase: ${err.message}`, "error");
  }
}

// Verificar módulos da aplicação
function verificarModulos() {
  const statusModulos = document.getElementById('status-modulos');
  if (!statusModulos) return;
  
  try {
    let status = "<span>Módulos: </span>";
    
    // Verificar objeto global AppVisita
    if (window.AppVisita) {
      status += `<span style="color: #28a745;">AppVisita</span> | `;
      logDiagnostico("AppVisita global disponível");
    } else {
      status += `<span style="color: #dc3545;">AppVisita</span> | `;
      logDiagnostico("AppVisita global não encontrado", "error");
    }
    
    // Verificar objeto global AppModulos
    if (window.AppModulos) {
      status += `<span style="color: #28a745;">AppModulos</span>`;
      logDiagnostico("AppModulos global disponível");
      
      // Verificar submódulos
      const modulos = ['UI', 'Pacientes', 'Equipes', 'Admin'];
      let subStatus = "<div style='margin-top: 5px;'>Submódulos: ";
      
      modulos.forEach((modulo, index) => {
        if (window.AppModulos[modulo]) {
          subStatus += `<span style="color: #28a745;">${modulo}</span>`;
          logDiagnostico(`Módulo ${modulo} disponível`);
        } else {
          subStatus += `<span style="color: #dc3545;">${modulo}</span>`;
          logDiagnostico(`Módulo ${modulo} não encontrado`, "error");
        }
        
        if (index < modulos.length - 1) {
          subStatus += " | ";
        }
      });
      
      subStatus += "</div>";
      status += subStatus;
    } else {
      status += `<span style="color: #dc3545;">AppModulos</span>`;
      logDiagnostico("AppModulos global não encontrado", "error");
    }
    
    statusModulos.innerHTML = status;
  } catch (err) {
    statusModulos.innerHTML = `<span style="color: #dc3545;">✗</span> Módulos: Erro ao verificar`;
    logDiagnostico(`Erro ao verificar módulos: ${err.message}`, "error");
  }
}

// Verificar autenticação
function verificarAutenticacao() {
  try {
    const authObj = window.auth;
    
    if (authObj) {
      const usuario = authObj.currentUser;
      
      if (usuario) {
        logDiagnostico(`Usuário autenticado: ${usuario.email}`);
        
        // Verificar isAdmin
        const isAdminValue = window.isAdmin === true;
        logDiagnostico(`Status de admin: ${isAdminValue ? 'SIM' : 'NÃO'}`);
        
        // Verificar se equipesUsuario existe
        const equipesLength = window.equipesUsuario ? window.equipesUsuario.length : 0;
        logDiagnostico(`Equipes carregadas: ${equipesLength}`);
      } else {
        logDiagnostico("Nenhum usuário autenticado", "warn");
      }
    } else {
      logDiagnostico("Objeto auth não disponível, não é possível verificar autenticação", "error");
    }
  } catch (err) {
    logDiagnostico(`Erro ao verificar autenticação: ${err.message}`, "error");
  }
} 