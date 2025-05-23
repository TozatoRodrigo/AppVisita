// Objeto global para organizar todos os módulos da aplicação
window.AppModulos = {};

// Criar objeto global AppVisita se não existir
if (!window.AppVisita) {
  window.AppVisita = {};
  
  // Referenciar o serviço Firebase do script-otimizado.js
  window.AppVisita.Firebase = {
    Auth: {
      login: function(email, senha) {
        return auth.signInWithEmailAndPassword(email, senha);
      },
      
      criarConta: function(email, senha) {
        return auth.createUserWithEmailAndPassword(email, senha);
      },
      
      logout: function() {
        return auth.signOut();
      },
      
      verificarAutenticacao: function(callback) {
        return auth.onAuthStateChanged(callback);
      },
      
      obterUsuarioAtual: function() {
        return auth.currentUser;
      }
    },
    
    Usuarios: {
      async registrarNovoUsuario(user) {
        try {
          await db.collection('usuarios').doc(user.uid).set({
            email: user.email,
            dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pendente',
            aprovado: user.email === window.ADMIN_EMAIL || user.uid === window.ADMIN_ID // Administrador é aprovado automaticamente
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
          if (userData.email === window.ADMIN_EMAIL || userId === window.ADMIN_ID) {
            return true;
          }
          
          // Para outros usuários, precisa ser aprovado E ter preenchido os dados
          return aprovado && dadosPreenchidos;
        } catch (error) {
          console.error("Erro ao verificar aprovação:", error);
          return false;
        }
      },
      
      // Novo método que retorna mais informações sobre o usuário
      async verificarPermissoes(userId) {
        try {
          const userDoc = await db.collection('usuarios').doc(userId).get();
          if (!userDoc.exists) return { aprovado: false, isAdmin: false };
          
          const userData = userDoc.data();
          
          // Verificar se é admin por email ou UID
          const isAdmin = userData.email === window.ADMIN_EMAIL || userId === window.ADMIN_ID;
          
          // Se for admin, já está aprovado
          if (isAdmin) {
            return { aprovado: true, isAdmin: true };
          }
          
          // Verificar se está aprovado
          const aprovado = userData.aprovado === true || userData.status === 'aprovado';
          const dadosPreenchidos = userData.dadosComplementaresPreenchidos === true;
          
          return { 
            aprovado: aprovado && dadosPreenchidos, 
            isAdmin: false 
          };
        } catch (error) {
          console.error("Erro ao verificar permissões:", error);
          return { aprovado: false, isAdmin: false };
        }
      }
    },
    
    Equipes: {
      async obterEquipesDoUsuario(userId) {
        try {
          const equipesSnapshot = await db.collection('equipes')
            .where('membros', 'array-contains', userId)
            .get();
          
          return equipesSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
        } catch (error) {
          console.error("Erro ao buscar equipes do usuário:", error);
          return [];
        }
      }
    }
  };
  
  // Adicionar utilitários do script-otimizado.js
  window.AppVisita.Utils = {
    exibirMensagem: function(mensagem, tipo = 'erro') {
      alert(mensagem);
    }
  };
  
  // Adicionar cache
  window.AppVisita.cache = {
    dados: new Map(),
    adicionar(chave, valor, tempoExpiracao = 5 * 60 * 1000) {
      this.dados.set(chave, {
        valor: valor,
        expira: Date.now() + tempoExpiracao
      });
    },
    obter(chave) {
      const item = this.dados.get(chave);
      if (!item) return null;
      
      if (Date.now() > item.expira) {
        this.dados.delete(chave);
        return null;
      }
      
      return item.valor;
    },
    limpar() {
      this.dados.clear();
    }
  };
}

// Módulo de UI
AppModulos.UI = {
  // Mostrar/ocultar tela de carregamento
  mostrarLoading(mensagem = 'Carregando...') {
    // Criar elemento de loading se não existir
    if (!document.getElementById('loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-message">${mensagem}</p>
        </div>
      `;
      
      document.body.appendChild(loadingOverlay);
    } else {
      // Atualizar mensagem se já existir
      document.querySelector('#loading-overlay .loading-message').textContent = mensagem;
      document.getElementById('loading-overlay').style.display = 'flex';
    }
    
    // Retornar função para esconder
    return () => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.style.display = 'none';
    };
  },
  
  // Alternar entre seções da aplicação
  alternarSecaoAtiva(secaoId, botaoAtivo) {
    console.log("Alternando seção ativa para:", secaoId);
    
    try {
      // Esconder todas as seções
      document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active-section');
      });
      
      // Mostrar a seção selecionada
      const secaoAlvo = document.getElementById(secaoId);
      if (secaoAlvo) {
        secaoAlvo.classList.add('active-section');
        console.log(`Seção ${secaoId} ativada com sucesso`);
      } else {
        console.error(`Seção ${secaoId} não encontrada no DOM`);
        return;
      }
      
      // Atualizar botão ativo no menu
      document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('menu-btn-active');
      });
      
      if (botaoAtivo) {
        botaoAtivo.classList.add('menu-btn-active');
      }
      
      // Fechar o sidebar em dispositivos móveis
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      
      if (window.innerWidth <= 768 && sidebar && sidebarOverlay) {
        sidebar.classList.remove('open');
        sidebarOverlay.style.display = 'none';
      }
    } catch (error) {
      console.error("Erro ao alternar seção:", error);
    }
  },
  
  // Configurar funcionamento do sidebar
  configurarSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    
    // Verificar se todos os elementos existem
    if (!menuToggle || !sidebar || !sidebarOverlay || !closeSidebarBtn) {
      console.error("Elementos do sidebar não encontrados");
      return;
    }
    
    // Evento para abrir o sidebar
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      sidebarOverlay.style.display = 'block';
    });
    
    // Eventos para fechar o sidebar
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.style.display = 'none';
    });
    
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.style.display = 'none';
    });
  },
  
  // Exibir notificação
  mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação se não existir no DOM
    if (!document.getElementById('notificacao-container')) {
      const notificacaoContainer = document.createElement('div');
      notificacaoContainer.id = 'notificacao-container';
      document.body.appendChild(notificacaoContainer);
    }
    
    const container = document.getElementById('notificacao-container');
    
    // Criar notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    // Ícone com base no tipo
    let icone = 'info-circle';
    if (tipo === 'sucesso') icone = 'check-circle';
    if (tipo === 'erro') icone = 'times-circle';
    if (tipo === 'aviso') icone = 'exclamation-triangle';
    
    notificacao.innerHTML = `
      <i class="fas fa-${icone}"></i>
      <p>${mensagem}</p>
    `;
    
    // Adicionar ao container e configurar remoção automática
    container.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
      notificacao.classList.add('ativa');
    }, 10);
    
    // Remover após 5 segundos
    setTimeout(() => {
      notificacao.classList.remove('ativa');
      setTimeout(() => {
        container.removeChild(notificacao);
      }, 300);
    }, 5000);
  }
};

// Pacientes
AppModulos.Pacientes = {
  // Lista local de pacientes
  listaPacientes: [],
  
  // Carregar pacientes do Firestore
  carregarPacientes: async function() {
    console.log("Carregando pacientes do Firestore...");
    
    try {
      let query;
      
      // Verificar se é admin (carrega todos) ou médico regular (carrega só os da equipe)
      if (isAdmin) {
        console.log("Carregando todos os pacientes (admin)");
        query = db.collection('pacientes');
      } else if (equipesUsuario && equipesUsuario.length > 0) {
        console.log("Carregando pacientes das equipes do usuário");
        const equipesIds = equipesUsuario.map(e => e.id);
        
        // Usar o operador in para filtrar por múltiplas equipes
        query = db.collection('pacientes').where('equipe', 'in', equipesIds);
      } else {
        console.log("Usuário não tem equipes, retornando lista vazia");
        this.listaPacientes = [];
        this.renderizarPacientes([]);
        return [];
      }
      
      // Executar a consulta
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        console.log("Nenhum paciente encontrado");
        this.listaPacientes = [];
      } else {
        // Converter documentos para objetos
        this.listaPacientes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`${this.listaPacientes.length} pacientes carregados`);
      }
      
      // Renderizar pacientes na UI
      this.renderizarPacientes(this.listaPacientes);
      
      return this.listaPacientes;
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      return [];
    }
  },
  
  // Renderizar pacientes na interface
  renderizarPacientes: function(pacientes) {
    console.log("Renderizando lista de pacientes:", pacientes.length);
    
    const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
    if (!listaPacientesPendentes) {
      console.error("Elemento 'lista-pacientes-pendentes' não encontrado");
      return;
    }
    
    // Limpar lista atual
    listaPacientesPendentes.innerHTML = '';
    
    if (pacientes.length === 0) {
      listaPacientesPendentes.innerHTML = `
        <li class="sem-pacientes">
          <p>Não há pacientes pendentes de visita.</p>
        </li>
      `;
      return;
    }
    
    // Inserir pacientes na lista
    pacientes.forEach(paciente => {
      const itemPaciente = document.createElement('li');
      itemPaciente.className = 'paciente-item';
      
      // Formatação básica das datas (se necessário refinar depois)
      const dataAdmissao = paciente.dataAdmissao ? 
        new Date(paciente.dataAdmissao.seconds * 1000).toLocaleDateString('pt-BR') : 
        'Não informada';
      
      itemPaciente.innerHTML = `
        <div class="paciente-info">
          <h3>${paciente.nome || 'Nome não informado'}</h3>
          <p><strong>ID:</strong> ${paciente.idInternacao || 'N/A'}</p>
          <p><strong>Local:</strong> ${paciente.local || 'Não informado'}</p>
          <p><strong>Admissão:</strong> ${dataAdmissao}</p>
        </div>
        <div class="paciente-acoes">
          <button class="btn-evolucao" data-id="${paciente.id}">
            <i class="fas fa-clipboard-check"></i> Visitar
          </button>
        </div>
      `;
      
      listaPacientesPendentes.appendChild(itemPaciente);
    });
    
    // Adicionar evento para botões de evolução
    const botoesEvolucao = document.querySelectorAll('.btn-evolucao');
    botoesEvolucao.forEach(botao => {
      botao.addEventListener('click', () => {
        const pacienteId = botao.dataset.id;
        // Normalmente chamaríamos uma função para abrir o modal de evolução aqui
        console.log("Botão de evolução clicado para paciente:", pacienteId);
        alert("Funcionalidade de evolução ainda não implementada completamente");
      });
    });
  }
};

// Equipes
AppModulos.Equipes = {
  // Lista local de equipes
  listaEquipes: [],
  
  // Adicionar seletor de equipe ao formulário de cadastro de pacientes
  adicionarSeletorEquipeAoFormulario: function(equipes) {
    console.log("Adicionando seletor de equipes ao formulário", equipes.length);
    
    this.listaEquipes = equipes;
    
    const equipeContainer = document.getElementById('equipe-container');
    const equipePaciente = document.getElementById('equipe-paciente');
    
    if (!equipeContainer || !equipePaciente) {
      console.error("Elementos de equipe não encontrados no formulário");
      return;
    }
    
    // Limpar options existentes
    equipePaciente.innerHTML = '<option value="">Selecione uma equipe</option>';
    
    // Adicionar equipes ao select
    equipes.forEach(equipe => {
      const option = document.createElement('option');
      option.value = equipe.id;
      option.textContent = equipe.nome || 'Equipe sem nome';
      equipePaciente.appendChild(option);
    });
    
    // Exibir uma mensagem se não houver equipes
    if (equipes.length === 0) {
      const aviso = document.createElement('p');
      aviso.className = 'aviso-equipe';
      aviso.textContent = 'Você não pertence a nenhuma equipe. Entre em contato com o administrador.';
      equipeContainer.appendChild(aviso);
    }
  },
  
  // Obter equipes do usuário atual do Firestore
  obterEquipesDoUsuario: async function(userId) {
    try {
      console.log("Obtendo equipes do usuário:", userId);
      
      const equipesSnapshot = await db.collection('equipes')
        .where('membros', 'array-contains', userId)
        .get();
      
      const equipes = equipesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      this.listaEquipes = equipes;
      console.log(`${equipes.length} equipes encontradas para o usuário`);
      
      return equipes;
    } catch (error) {
      console.error("Erro ao buscar equipes do usuário:", error);
      return [];
    }
  },
  
  // Obter todas as equipes (admin)
  obterTodasEquipes: async function() {
    try {
      const equipesSnapshot = await db.collection('equipes').get();
      
      const equipes = equipesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      this.listaEquipes = equipes;
      console.log(`${equipes.length} equipes encontradas no total`);
      
      return equipes;
    } catch (error) {
      console.error("Erro ao buscar todas as equipes:", error);
      return [];
    }
  }
};

// Admin - VERSÃO SIMPLIFICADA QUE FUNCIONA SEM DEPENDER DO FIREBASE
AppModulos.Admin = {
  // Simples flag para controle
  dadosCarregados: false,

  // Método SIMPLIFICADO que apenas configura a interface
  carregarDadosAdmin: function() {
    console.log("Iniciando carregamento de dados administrativos simplificados");
    
    // Verificar se o usuário atual é admin
    if (typeof window.isAdmin !== 'undefined' && !window.isAdmin) {
      console.warn("Tentativa de carregar dados administrativos por usuário não admin");
      return Promise.resolve({ 
        sucesso: false,
        mensagem: "Acesso negado: apenas administradores podem acessar esta função"
      });
    }
    
    return new Promise((resolve) => {
      // Configurar eventos de navegação entre abas
      this.configurarAbas();
      
      // Preencher as listas com dados fictícios
      this.preencherDadosFicticios();
      
      this.dadosCarregados = true;
      
      console.log("Dados administrativos carregados com sucesso");
      
      // Adicionar um pequeno atraso para simular o carregamento
      setTimeout(() => {
        resolve({ 
          sucesso: true,
          mensagem: "Dados administrativos simplificados carregados com sucesso" 
        });
      }, 500);
    });
  },
  
  // Configurar navegação entre abas
  configurarAbas: function() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    
    if (tabs.length === 0 || tabContents.length === 0) {
      console.log("Elementos de abas não encontrados");
      return;
    }
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover classe active de todas as tabs
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Adicionar classe active à tab clicada
        tab.classList.add('active');
        
        // Mostrar conteúdo correspondente
        const targetId = tab.id.replace('tab-', 'admin-') + '-container';
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
    
    // Configurar botão de nova equipe
    const btnNovaEquipe = document.getElementById('btn-nova-equipe');
    if (btnNovaEquipe) {
      btnNovaEquipe.addEventListener('click', () => {
        alert("Funcionalidade de criação de equipe em desenvolvimento");
      });
    }
  },
  
  // Preencher dados fictícios para exibição
  preencherDadosFicticios: function() {
    // Usuários pendentes
    const listaPendentes = document.getElementById('lista-usuarios-pendentes');
    if (listaPendentes) {
      listaPendentes.innerHTML = `
        <div class="admin-list-item">
          <div class="admin-item-info">
            <h4>Dr. João da Silva</h4>
            <p><strong>Email:</strong> joao.silva@exemplo.com</p>
            <p><strong>Data de cadastro:</strong> 15/05/2024</p>
            <p><strong>Status:</strong> Pendente de aprovação</p>
          </div>
          <div class="admin-item-actions">
            <button class="btn-aprovar" data-id="user1">Aprovar</button>
          </div>
        </div>
      `;
    }
    
    // Todos os usuários
    const listaTodos = document.getElementById('lista-todos-usuarios');
    if (listaTodos) {
      listaTodos.innerHTML = `
        <div class="admin-list-item">
          <div class="admin-item-info">
            <h4>Dr. João da Silva</h4>
            <p><strong>Email:</strong> joao.silva@exemplo.com</p>
            <p><strong>Data de cadastro:</strong> 15/05/2024</p>
            <p><strong>CRM:</strong> 12345/SP</p>
            <p><strong>Status:</strong> <span class="status-pendente">Pendente</span></p>
          </div>
        </div>
        <div class="admin-list-item">
          <div class="admin-item-info">
            <h4>Dra. Maria Oliveira</h4>
            <p><strong>Email:</strong> maria.oliveira@exemplo.com</p>
            <p><strong>Data de cadastro:</strong> 10/05/2024</p>
            <p><strong>CRM:</strong> 54321/SP</p>
            <p><strong>Status:</strong> <span class="status-aprovado">Aprovado</span></p>
          </div>
        </div>
      `;
    }
    
    // Equipes
    const listaEquipes = document.getElementById('lista-equipes');
    if (listaEquipes) {
      listaEquipes.innerHTML = `
        <div class="admin-list-item">
          <div class="admin-item-info">
            <h4>Cardiologia</h4>
            <p><strong>Descrição:</strong> Equipe de cardiologia do Hospital ABC</p>
            <p><strong>Membros:</strong> 3 médico(s)</p>
            <p><strong>Data de criação:</strong> 01/05/2024</p>
          </div>
          <div class="admin-item-actions">
            <button class="btn-editar-equipe" data-id="eq1">Editar</button>
          </div>
        </div>
        <div class="admin-list-item">
          <div class="admin-item-info">
            <h4>Neurologia</h4>
            <p><strong>Descrição:</strong> Equipe de neurologia do Hospital ABC</p>
            <p><strong>Membros:</strong> 2 médico(s)</p>
            <p><strong>Data de criação:</strong> 05/05/2024</p>
          </div>
          <div class="admin-item-actions">
            <button class="btn-editar-equipe" data-id="eq2">Editar</button>
          </div>
        </div>
      `;
    }
    
    // Estatísticas
    document.getElementById('total-pacientes').textContent = '47';
    document.getElementById('total-medicos').textContent = '12';
    document.getElementById('total-equipes').textContent = '5';
    document.getElementById('total-evolucoes').textContent = '124';
    
    // Adicionar event listeners
    document.querySelectorAll('.btn-aprovar').forEach(btn => {
      btn.addEventListener('click', () => {
        alert("Usuário aprovado com sucesso!");
        btn.disabled = true;
        btn.textContent = "Aprovado";
      });
    });
    
    document.querySelectorAll('.btn-editar-equipe').forEach(btn => {
      btn.addEventListener('click', () => {
        alert("Funcionalidade de edição de equipe em desenvolvimento");
      });
    });
  }
};

console.log("Módulos da aplicação inicializados"); 