// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA8IvktQAQYs_25dS7pRSK1HthcAg0WS00",
  authDomain: "appvisita-1939a.firebaseapp.com",
  projectId: "appvisita-1939a",
  storageBucket: "appvisita-1939a.firebasestorage.app",
  messagingSenderId: "231699401102",
  appId: "1:231699401102:web:20947de9c4d6485362bcdf"
};

// Configuração de Administrador
const ADMIN_EMAIL = "rodrigo.tozato@strivium.com.br";
const ADMIN_ID = "uZ9qEQpVtHaLSc1lov2Tdju6M822";

// Variáveis globais do Firebase
let app, auth, db, storage;
let isAdmin = false;
let currentUser = null;
let pacientesLocal = []; // Array local para manipulação
let todosPacientes = []; // Array com todos os pacientes (ativos e inativos)
let equipesUsuario = []; // Lista de equipes que o usuário pertence

// Cache de elementos DOM para evitar seleções constantes
const domCache = {};

// Definir uma variável global para controlar o estado de inicialização
window.firebaseInicializado = false;

// Inicialização imediata do Firebase
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado, iniciando Firebase...");
  inicializarFirebase();
});

// Função para inicializar o Firebase
function inicializarFirebase() {
  console.log("Inicializando Firebase...");
  try {
    // Verificar se o Firebase já foi inicializado
    if (firebase.apps.length) {
      console.log("Firebase já inicializado, obtendo instância existente");
      app = firebase.app();
    } else {
      console.log("Criando nova instância do Firebase");
      app = firebase.initializeApp(firebaseConfig);
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    // Expor variáveis no escopo global da janela
    window.app = app;
    window.auth = auth;
    window.db = db;
    window.storage = storage;
    window.currentUser = currentUser;
    window.isAdmin = isAdmin;
    window.pacientesLocal = pacientesLocal;
    window.todosPacientes = todosPacientes;
    window.equipesUsuario = equipesUsuario;
    
    // Configurar persistência de autenticação para sessão
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        console.log("Persistência de autenticação configurada com sucesso");
        // Continuar com a inicialização após a persistência ser configurada
        finalizarInicializacao();
      })
      .catch(error => {
        console.error("Erro ao configurar persistência de autenticação:", error);
        // Continuar mesmo com erro de persistência, já que é não-crítico
        finalizarInicializacao();
      });
  } catch (error) {
    console.error("ERRO FATAL ao inicializar Firebase:", error);
    alert("Erro ao inicializar Firebase. Por favor, recarregue a página e tente novamente.");
  }
}

// Função para finalizar a inicialização e disparar eventos
function finalizarInicializacao() {
  try {
    // Configurar cache do Firestore
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
      merge: true
    });
    
    console.log("Firebase inicializado com sucesso!", {
      app: !!app,
      auth: !!auth,
      db: !!db,
      storage: !!storage
    });
    
    // Verificar estado de autenticação inicial
    const usuarioAtual = auth.currentUser;
    console.log("Estado inicial de autenticação:", usuarioAtual ? `Usuário logado: ${usuarioAtual.email}` : "Nenhum usuário autenticado");
    
    // Definir flag global de inicialização
    window.firebaseInicializado = true;
    
    // Exportar variáveis importantes para o escopo global
    window.ADMIN_EMAIL = ADMIN_EMAIL;
    window.ADMIN_ID = ADMIN_ID;
    
    // Acionar evento customizado para informar que o Firebase está pronto
    console.log("Disparando evento firebase-ready");
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('firebase-ready', { detail: { timestamp: Date.now() } }));
      console.log("Evento firebase-ready disparado com sucesso");
    }, 100);
  } catch (error) {
    console.error("Erro ao finalizar inicialização do Firebase:", error);
  }
}

// Classe de utilidades
const Utils = {
  formatarData(timestamp) {
    if (!timestamp) return 'Data desconhecida';
    
    const seconds = timestamp.seconds || timestamp / 1000;
    return new Date(seconds * 1000).toLocaleDateString('pt-BR');
  },
  
  formatarDataHora(timestamp) {
    if (!timestamp) return 'Data desconhecida';
    
    const seconds = timestamp.seconds || timestamp / 1000;
    return new Date(seconds * 1000).toLocaleString('pt-BR');
  },
  
  // Cria um elemento DOM com classes e atributos
  criarElemento(tipo, classes = [], atributos = {}, conteudo = '') {
    const elemento = document.createElement(tipo);
    
    if (classes.length) elemento.classList.add(...classes);
    
    Object.entries(atributos).forEach(([chave, valor]) => {
      elemento.setAttribute(chave, valor);
    });
    
    if (conteudo) elemento.innerHTML = conteudo;
    
    return elemento;
  },
  
  // Busca elementos DOM uma única vez e armazena em cache
  obterElemento(id) {
    if (!domCache[id]) {
      domCache[id] = document.getElementById(id);
    }
    return domCache[id];
  },
  
  // Limpa o conteúdo de um elemento DOM
  limparElemento(elemento) {
    if (typeof elemento === 'string') {
      elemento = this.obterElemento(elemento);
    }
    if (elemento) elemento.innerHTML = '';
  },
  
  // Exibe mensagem de erro/alerta
  exibirMensagem(mensagem, tipo = 'erro') {
    alert(mensagem);
  },
  
  // Adiciona eventos a múltiplos elementos
  adicionarEventos(seletorOuElementos, evento, callback) {
    const elementos = typeof seletorOuElementos === 'string' 
      ? document.querySelectorAll(seletorOuElementos)
      : seletorOuElementos;
      
    elementos.forEach(el => el.addEventListener(evento, callback));
  }
};

// Função para verificar se o Firebase está pronto para uso
window.verificarFirebaseDisponivel = function() {
  return (
    window.firebaseInicializado === true &&
    typeof firebase !== 'undefined' && 
    typeof window.auth !== 'undefined' && 
    typeof window.db !== 'undefined'
  );
};

// Debounce function para reduzir chamadas repetidas
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Cache para armazenar resultados de consultas
const cacheConsultas = {
  resultados: new Map(),
  adicionar(chave, resultado, tempoExpiracao = 5 * 60 * 1000) { // 5 minutos
    const item = {
      data: resultado,
      expira: Date.now() + tempoExpiracao
    };
    this.resultados.set(chave, item);
  },
  obter(chave) {
    const item = this.resultados.get(chave);
    if (!item) return null;
    
    if (Date.now() > item.expira) {
      this.resultados.delete(chave);
      return null;
    }
    
    return item.data;
  },
  limpar() {
    this.resultados.clear();
  }
};

// API de serviços do Firebase
const FirebaseService = {
  // Serviço de Autenticação
  Auth: {
    login(email, senha) {
      return auth.signInWithEmailAndPassword(email, senha);
    },
    
    criarConta(email, senha) {
      return auth.createUserWithEmailAndPassword(email, senha);
    },
    
    logout() {
      return auth.signOut();
    },
    
    verificarAutenticacao(callback) {
      return auth.onAuthStateChanged(callback);
    },
    
    obterUsuarioAtual() {
      return auth.currentUser;
    }
  },
  
  // Serviço de Usuários
  Usuarios: {
    async registrarNovoUsuario(user) {
      try {
        await db.collection('usuarios').doc(user.uid).set({
          email: user.email,
          dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'pendente',
          aprovado: user.email === ADMIN_EMAIL // Administrador é aprovado automaticamente
        });
        return true;
      } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return false;
      }
    },
    
    async verificarAprovacao(userId) {
      try {
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) return false;
        
        const userData = userDoc.data();
        
        // Verificar se é aprovado E se preencheu os dados complementares
        const aprovado = userData.aprovado === true || userData.status === 'aprovado';
        const dadosPreenchidos = userData.dadosComplementaresPreenchidos === true;
        
        // Se for admin, não precisa de dados complementares
        if (userData.email === ADMIN_EMAIL) {
          return aprovado;
        }
        
        // Para outros usuários, precisa ser aprovado E ter preenchido os dados
        return aprovado && dadosPreenchidos;
      } catch (error) {
        console.error("Erro ao verificar aprovação:", error);
        return false;
      }
    },
    
    async obterTodos() {
      try {
        const usersSnapshot = await db.collection('usuarios').get();
        return usersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return [];
      }
    },
    
    async aprovarUsuario(userId) {
      try {
        await db.collection('usuarios').doc(userId).update({
          aprovado: true,
          status: 'aprovado',
          dataAprovacao: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error("Erro ao aprovar usuário:", error);
        return false;
      }
    }
  },
  
  // Serviço de Equipes
  Equipes: {
    async obterEquipesDoUsuario(userId) {
      try {
        console.log("🔥 obterEquipesDoUsuario - INICIANDO busca");
        console.log("🔥 UserId recebido:", userId);
        
        const equipesSnapshot = await db.collection('equipes')
          .where('membros', 'array-contains', userId)
          .get();
          
        console.log("🔥 Snapshot da consulta:", equipesSnapshot);
        console.log("🔥 Quantidade de documentos encontrados:", equipesSnapshot.docs.length);
        
        const equipes = equipesSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`🔥 Documento encontrado - ID: ${doc.id}, Nome: ${data.nome}`);
          console.log(`🔥 Membros da equipe:`, data.membros);
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log("🔥 Array final de equipes:", equipes);
        console.log(`🔥 obterEquipesDoUsuario - RETORNANDO ${equipes.length} equipes`);
        
        return equipes;
      } catch (error) {
        console.error("🔥 ERRO em obterEquipesDoUsuario:", error);
        return [];
      }
    },
    
    async obterTodas() {
      try {
        console.log("Executando obterTodas() para equipes");
        
        // Usar consulta simples sem filtros complexos para evitar erro de índice
        console.log("Executando consulta simples de equipes");
        const equipesSnapshot = await db.collection('equipes').get();
        
        // Filtrar manualmente as equipes excluídas e ordenar
        const equipes = equipesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(equipe => {
            // Filtrar equipes não excluídas
            const naoExcluida = !(equipe.excluido === true || equipe.status === 'excluido');
            return naoExcluida;
          })
          .sort((a, b) => {
            // Ordenar por nome
            const nomeA = (a.nome || '').toLowerCase();
            const nomeB = (b.nome || '').toLowerCase();
            return nomeA.localeCompare(nomeB);
          });
        
        console.log(`${equipes.length} equipes ativas encontradas (consulta simples)`);
        return equipes;
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        return [];
      }
    },
    
    async salvarEquipe(equipeData, equipeId = null) {
      try {
        console.log(`🔥 SALVANDO EQUIPE NO FIREBASE:`);
        console.log(`🔥 Dados da equipe:`, equipeData);
        console.log(`🔥 Membros array:`, equipeData.membros);
        console.log(`🔥 Tamanho do array de membros:`, equipeData.membros ? equipeData.membros.length : 0);
        console.log(`🔥 Equipe ID:`, equipeId);
        
        if (equipeId) {
          console.log(`🔥 Atualizando equipe existente: ${equipeId}`);
          await db.collection('equipes').doc(equipeId).update(equipeData);
          console.log(`🔥 Equipe ${equipeId} atualizada com sucesso`);
        } else {
          console.log(`🔥 Criando nova equipe`);
          const docRef = await db.collection('equipes').add(equipeData);
          console.log(`🔥 Nova equipe criada com ID: ${docRef.id}`);
        }
        return true;
      } catch (error) {
        console.error("🔥 ERRO ao salvar equipe:", error);
        return false;
      }
    },
    
    async excluirEquipe(equipeId) {
      console.log(`Tentando excluir equipe com ID: ${equipeId}`);
      
      // Verificar se o ID é válido
      if (!equipeId) {
        console.error("ID da equipe não fornecido para exclusão");
        return false;
      }
      
      try {
        // Verificar se o usuário atual é um administrador
        const usuarioAtual = firebase.auth().currentUser;
        if (!usuarioAtual) {
          console.error("Erro ao excluir equipe: Nenhum usuário autenticado");
          return false;
        }
        
        console.log(`Usuário tentando excluir equipe: ${usuarioAtual.email}`);
        
        // Verificar se o usuário é administrador
        const userDoc = await db.collection('usuarios').doc(usuarioAtual.uid).get();
        const userData = userDoc.data();
        
        console.log(`Dados do usuário atual:`, userData);
        
        // Verificação de administrador mais flexível
        let isAdmin = false;
        if (userData) {
          isAdmin = userData.admin === true || 
                   userData.isAdmin === true || 
                   userData.perfil === 'admin' || 
                   usuarioAtual.email === window.ADMIN_EMAIL;
        }
        
        console.log(`É administrador? ${isAdmin}`);
        
        if (!isAdmin) {
          console.error("Usuário não tem permissão para excluir equipes");
          return false;
        }
        
        // Verificar se a equipe existe
        const equipeRef = db.collection('equipes').doc(equipeId);
        const doc = await equipeRef.get();
        
        if (!doc.exists) {
          console.error(`Equipe com ID ${equipeId} não encontrada para exclusão`);
          return false;
        }
        
        const equipeData = doc.data();
        console.log(`Tentando excluir equipe "${equipeData.nome}" (ID: ${equipeId}):`, equipeData);
        
        // Primeiro fazer backup da equipe
        try {
          console.log(`Criando backup da equipe ${equipeId} antes da exclusão`);
          
          await db.collection('equipesExcluidas').doc(equipeId).set({
            ...equipeData,
            dataExclusao: firebase.firestore.FieldValue.serverTimestamp(),
            excluidoPor: usuarioAtual.uid,
            motivoExclusao: 'Exclusão manual por administrador'
          });
          
          console.log(`Backup da equipe ${equipeId} criado com sucesso`);
        } catch (backupError) {
          console.error(`Erro ao criar backup da equipe ${equipeId}:`, backupError);
          // Continuar mesmo se o backup falhar
        }
        
        // Tentar exclusão real
        try {
          console.log(`Tentando excluir permanentemente a equipe ${equipeId}`);
          await equipeRef.delete();
          console.log(`Equipe ${equipeId} excluída permanentemente com sucesso`);
          return true;
        } catch (deleteError) {
          console.error(`Erro ao excluir permanentemente a equipe ${equipeId}:`, deleteError);
          
          // Se a exclusão real falhar, tentar soft delete
          try {
            console.log(`Tentando soft delete da equipe ${equipeId}`);
            await equipeRef.update({
              excluido: true,
              status: 'excluido',
              dataExclusao: firebase.firestore.FieldValue.serverTimestamp(),
              excluidoPor: usuarioAtual.uid,
              motivoExclusao: 'Exclusão manual por administrador'
            });
            
            console.log(`Equipe ${equipeId} marcada como excluída com sucesso (soft delete)`);
            return true;
          } catch (softDeleteError) {
            console.error(`Erro no soft delete da equipe ${equipeId}:`, softDeleteError);
            return false;
          }
        }
      } catch (error) {
        console.error(`Erro geral ao excluir equipe ${equipeId}:`, error);
        return false;
      }
    }
  },
  
  // Serviço de Pacientes
  Pacientes: {
    async obterPacientesPorMedico(medicoId) {
      try {
        const snapshot = await db.collection('pacientes')
          .where('medicoId', '==', medicoId)
          .get();
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Erro ao buscar pacientes do médico:", error);
        return [];
      }
    },
    
    async obterPacientesPorEquipes(equipesIds) {
      if (!equipesIds.length) return [];
      
      try {
        const snapshot = await db.collection('pacientes')
          .where('equipeId', 'in', equipesIds)
          .get();
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Erro ao buscar pacientes das equipes:", error);
        return [];
      }
    },
    
    async obterTodos() {
      try {
        const snapshot = await db.collection('pacientes').get();
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Erro ao buscar todos os pacientes:", error);
        return [];
      }
    },
    
    async adicionarPaciente(dadosPaciente) {
      try {
        // Verificar se já existe paciente com mesmo ID de internação
        const pacientesComMesmoId = await db.collection('pacientes')
          .where('idInternacao', '==', dadosPaciente.idInternacao)
          .get();
        
        if (!pacientesComMesmoId.empty) {
          return { sucesso: false, mensagem: 'Já existe um paciente com este ID de internação' };
        }
        
        const docRef = await db.collection('pacientes').add(dadosPaciente);
        return { sucesso: true, id: docRef.id };
      } catch (error) {
        console.error("Erro ao adicionar paciente:", error);
        return { sucesso: false, mensagem: 'Erro ao adicionar paciente' };
      }
    },
    
    async adicionarEvolucao(pacienteId, evolucaoData) {
      try {
        const pacienteRef = db.collection('pacientes').doc(pacienteId);
        const pacienteDoc = await pacienteRef.get();
        
        if (!pacienteDoc.exists) {
          return { sucesso: false, mensagem: 'Paciente não encontrado' };
        }
        
        // Criar timestamp manualmente para usar no array
        const agora = new Date();
        
        // Adicionar timestamp à evolução
        const evolucaoComTimestamp = {
          ...evolucaoData,
          dataRegistro: agora
        };
        
        const pacienteData = pacienteDoc.data();
        const evolucoesAtuais = pacienteData.evolucoes || [];
        evolucoesAtuais.push(evolucaoComTimestamp);
        
        await pacienteRef.update({
          evolucoes: evolucoesAtuais,
          status: evolucaoData.status,
          ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { sucesso: true };
      } catch (error) {
        console.error("Erro ao adicionar evolução:", error);
        return { sucesso: false, mensagem: 'Erro ao adicionar evolução' };
      }
    }
  }
};

// Exportar API para uso global
window.AppVisita = {
  Utils,
  Firebase: FirebaseService,
  cache: cacheConsultas
}; 