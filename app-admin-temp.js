// Módulo para administração do sistema
document.addEventListener('DOMContentLoaded', () => {
  // Módulo de Administração
  const AdminModulo = {
    // Variáveis locais do módulo
    dados: {
      usuarios: [],
      todasEquipes: []
    },
    
    // Carregar dados administrativos
    async carregarDadosAdmin() {
      try {
        console.log("Carregando dados administrativos...");
        
        // Verificar se o Firebase está disponível antes de prosseguir
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("Firebase não está disponível ainda, aguardando inicialização...");
          
          // Mostrar indicador de carregamento
          const esconderLoading = AppModulos.UI.mostrarLoading('Aguardando inicialização do Firebase...');
          
          // Aguardar o Firebase ficar disponível
          await this.aguardarFirebaseDisponivel();
          
          // Esconder loading
          esconderLoading();
        }
        
        // Mostrar indicador de carregamento
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando dados administrativos...');
        
        // Inicializar interface simplificada que funciona sem Firebase
        this.inicializarInterfaceAdmin();
        
        // Carregar equipes do Firebase
        try {
          console.log("Carregando equipes do Firebase...");
          await this.carregarEquipes();
          console.log("Equipes carregadas com sucesso");
        } catch (erroEquipes) {
          console.error("Erro ao carregar equipes:", erroEquipes);
        }
        
        // Carregar usuários do Firebase
        try {
          console.log("Carregando usuários do Firebase...");
          await this.carregarUsuarios();
          console.log("Usuários carregados com sucesso");
        } catch (erroUsuarios) {
          console.error("Erro ao carregar usuários:", erroUsuarios);
        }
        
        // Esconder loading
        esconderLoading();
        
        console.log("Dados administrativos carregados com sucesso");
        return { sucesso: true, mensagem: "Dados administrativos carregados com sucesso" };
      } catch (error) {
        console.error("Erro ao carregar dados administrativos:", error);
        AppVisita.Utils.exibirMensagem("Erro ao carregar dados administrativos");
        throw error;
      }
    },
    
    // Aguardar Firebase ficar disponível
    async aguardarFirebaseDisponivel() {
      return new Promise((resolve, reject) => {
        // Se já está disponível, resolver imediatamente
        if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
          console.log("Firebase já está disponível");
          resolve();
          return;
        }
        
        console.log("Aguardando evento firebase-ready...");
        
        // Listener para o evento firebase-ready
        const firebaseReadyListener = (event) => {
          console.log("Evento firebase-ready recebido em aguardarFirebaseDisponivel", event?.detail);
          document.removeEventListener('firebase-ready', firebaseReadyListener);
          
          // Aguardar um pouco para garantir que tudo foi inicializado
          setTimeout(() => {
            if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
              console.log("Firebase confirmado como disponível após evento");
              resolve();
            } else {
              console.error("Firebase ainda não está disponível mesmo após evento firebase-ready");
              reject(new Error("Firebase não inicializou corretamente"));
            }
          }, 500);
        };
        
        document.addEventListener('firebase-ready', firebaseReadyListener);
        
        // Timeout de segurança
        setTimeout(() => {
          document.removeEventListener('firebase-ready', firebaseReadyListener);
          
          if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
            console.log("Firebase disponível por timeout");
            resolve();
          } else {
            console.error("Timeout aguardando Firebase ficar disponível");
            reject(new Error("Timeout aguardando Firebase"));
          }
        }, 15000); // 15 segundos de timeout
      });
    },
    
    // Inicializar interface admin simplificada
    inicializarInterfaceAdmin() {
      // Configurar abas de navegação
      this.configurarAbasPainelAdmin();
      
      // Preencher dados fictícios nas listas
      // this.preencherDadosFicticios();
      
      // Configurar eventos para os botões reais
      this.configurarBotoesAdmin();
      
      // Se existirem os elementos de estatísticas, preencher com dados fictícios
      this.atualizarEstatisticasFicticias();
      
      return true;
    },
    
    // Configurar botões administrativos reais
    configurarBotoesAdmin() {
      console.log("Configurando botões administrativos reais");
      
      // Configurar botão Nova Equipe
      const btnNovaEquipe = document.getElementById('btn-nova-equipe');
      if (btnNovaEquipe) {
        console.log("Configurando botão Nova Equipe");
        
        // Remover eventos antigos
        const btnClone = btnNovaEquipe.cloneNode(true);
        if (btnNovaEquipe.parentNode) {
          btnNovaEquipe.parentNode.replaceChild(btnClone, btnNovaEquipe);
        }
        
        // Adicionar novo evento
        btnClone.addEventListener('click', () => {
          console.log("Botão Nova Equipe clicado");
          this.abrirModalNovaEquipe();
        });
      } else {
        console.warn("Botão Nova Equipe não encontrado");
      }
      
      // Adicionar botão para recarregar equipes
      const containerBotoesEquipe = document.querySelector('.admin-header-actions');
      if (containerBotoesEquipe) {
        // Verificar se o botão já existe
        let btnRecarregar = document.getElementById('btn-recarregar-equipes');
        
        // Se não existe, criar o botão
        if (!btnRecarregar) {
          btnRecarregar = document.createElement('button');
          btnRecarregar.id = 'btn-recarregar-equipes';
          btnRecarregar.className = 'btn btn-secondary';
          btnRecarregar.innerHTML = '<i class="fas fa-sync-alt"></i> Recarregar Equipes';
          containerBotoesEquipe.appendChild(btnRecarregar);
        } else {
          // Se já existe, clonar para remover eventos antigos
          const btnRecarregarClone = btnRecarregar.cloneNode(true);
          if (btnRecarregar.parentNode) {
            btnRecarregar.parentNode.replaceChild(btnRecarregarClone, btnRecarregar);
          }
          btnRecarregar = btnRecarregarClone;
        }
        
        // Adicionar evento ao botão de recarregar
        btnRecarregar.addEventListener('click', async () => {
          console.log("Botão recarregar equipes clicado");
          try {
            const esconderLoading = AppModulos.UI.mostrarLoading('Recarregando equipes...');
            await this.carregarEquipes();
            esconderLoading();
            AppModulos.UI.mostrarNotificacao('Equipes recarregadas com sucesso!', 'sucesso');
          } catch (error) {
            console.error("Erro ao recarregar equipes:", error);
            AppModulos.UI.mostrarNotificacao('Erro ao recarregar equipes.', 'erro');
          }
        });
      }
      
      // Adicionar botão para recarregar usuários
      const containerBotoesUsuario = document.querySelector('#admin-usuarios-container .admin-header-actions');
      if (containerBotoesUsuario) {
        // Verificar se o botão já existe
        let btnRecarregarUsuarios = document.getElementById('btn-recarregar-usuarios');
        
        // Se não existe, criar o botão
        if (!btnRecarregarUsuarios) {
          btnRecarregarUsuarios = document.createElement('button');
          btnRecarregarUsuarios.id = 'btn-recarregar-usuarios';
          btnRecarregarUsuarios.className = 'btn btn-secondary';
          btnRecarregarUsuarios.innerHTML = '<i class="fas fa-sync-alt"></i> Recarregar Usuários';
          containerBotoesUsuario.appendChild(btnRecarregarUsuarios);
        } else {
          // Se já existe, clonar para remover eventos antigos
          const btnRecarregarClone = btnRecarregarUsuarios.cloneNode(true);
          if (btnRecarregarUsuarios.parentNode) {
            btnRecarregarUsuarios.parentNode.replaceChild(btnRecarregarClone, btnRecarregarUsuarios);
          }
          btnRecarregarUsuarios = btnRecarregarClone;
        }
        
        // Adicionar evento ao botão de recarregar
        btnRecarregarUsuarios.addEventListener('click', async () => {
          console.log("Botão recarregar usuários clicado");
          try {
            const esconderLoading = AppModulos.UI.mostrarLoading('Recarregando usuários...');
            await this.carregarUsuarios();
            esconderLoading();
            AppModulos.UI.mostrarNotificacao('Usuários recarregados com sucesso!', 'sucesso');
          } catch (error) {
            console.error("Erro ao recarregar usuários:", error);
            AppModulos.UI.mostrarNotificacao('Erro ao recarregar usuários.', 'erro');
          }
        });
      }
    },
    
    // Atualizar estatísticas com dados fictícios
    atualizarEstatisticasFicticias() {
      const elementos = {
        'total-pacientes': '47',
        'total-medicos': '12',
        'total-equipes': '5',
        'total-evolucoes': '124'
      };
      
      // Atualizar cada elemento, se existir
      Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
      });
    },
    
    // Preencher dados fictícios de usuários e equipes
    preencherDadosFicticios() {
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
      
      // Adicionar eventos aos botões
      this.adicionarEventosBotoesFicticios();
    },
    
    // Adicionar eventos aos botões fictícios
    adicionarEventosBotoesFicticios() {
      // Evento para botões de aprovar usuário
      document.querySelectorAll('.btn-aprovar').forEach(btn => {
        btn.addEventListener('click', () => {
          alert("Usuário aprovado com sucesso!");
          btn.disabled = true;
          btn.textContent = "Aprovado";
        });
      });
      
      // Evento para botões de editar equipe
      document.querySelectorAll('.btn-editar-equipe').forEach(btn => {
        btn.addEventListener('click', () => {
          alert("Funcionalidade de edição de equipe em desenvolvimento");
        });
      });
      
      // Evento para botão de nova equipe
      const btnNovaEquipe = document.getElementById('btn-nova-equipe');
      if (btnNovaEquipe) {
        btnNovaEquipe.addEventListener('click', () => {
          alert("Funcionalidade de criação de equipe em desenvolvimento");
        });
      }
    },
    
    // Configurar abas do painel administrativo
    configurarAbasPainelAdmin() {
      const tabs = document.querySelectorAll('.admin-tab');
      const tabContents = document.querySelectorAll('.admin-tab-content');
      
      if (tabs.length === 0 || tabContents.length === 0) {
        console.log("Elementos de abas não encontrados");
        return;
      }
      
      const self = this; // Para usar o this dentro do callback
      
      tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
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
          
          // Se a aba clicada for a de equipes, carregar equipes
          if (tab.id === 'tab-equipes') {
            console.log("Aba de equipes selecionada, carregando equipes...");
            try {
              // Mostrar loading
              const esconderLoading = AppModulos.UI.mostrarLoading('Carregando equipes...');
              
              // Recarregar equipes
              await self.carregarEquipes();
              
              // Esconder loading
              esconderLoading();
            } catch (error) {
              console.error("Erro ao carregar equipes na troca de aba:", error);
            }
          }
          
          // Se a aba clicada for a de usuários, carregar usuários
          if (tab.id === 'tab-usuarios') {
            console.log("Aba de usuários selecionada, carregando usuários...");
            try {
              // Mostrar loading
              const esconderLoading = AppModulos.UI.mostrarLoading('Carregando usuários...');
              
              // Recarregar usuários
              await self.carregarUsuarios();
              
              // Esconder loading
              esconderLoading();
            } catch (error) {
              console.error("Erro ao carregar usuários na troca de aba:", error);
            }
          }
        });
      });
    },
    
    // Carregar usuários
    async carregarUsuarios() {
      try {
        console.log("🔥 INICIANDO carregamento de usuários");
        
        // Verificar se o Firebase está inicializado - verificação mais robusta
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("🔥 Firebase não está disponível, aguardando...");
          
          try {
            await this.aguardarFirebaseDisponivel();
            console.log("🔥 Firebase agora está disponível para carregar usuários");
          } catch (error) {
// Módulo para administração do sistema
document.addEventListener('DOMContentLoaded', () => {
  // Módulo de Administração
  const AdminModulo = {
    // Variáveis locais do módulo
    dados: {
      usuarios: [],
      todasEquipes: []
    },
    
    // Carregar dados administrativos
    async carregarDadosAdmin() {
      try {
        console.log("Carregando dados administrativos...");
        
        // Verificar se o Firebase está disponível antes de prosseguir
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("Firebase não está disponível ainda, aguardando inicialização...");
          
          // Mostrar indicador de carregamento
          const esconderLoading = AppModulos.UI.mostrarLoading('Aguardando inicialização do Firebase...');
          
          // Aguardar o Firebase ficar disponível
          await this.aguardarFirebaseDisponivel();
          
          // Esconder loading
          esconderLoading();
        }
        
        // Mostrar indicador de carregamento
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando dados administrativos...');
        
        // Inicializar interface simplificada que funciona sem Firebase
        this.inicializarInterfaceAdmin();
        
        // Carregar equipes do Firebase
        try {
          console.log("Carregando equipes do Firebase...");
          await this.carregarEquipes();
          console.log("Equipes carregadas com sucesso");
        } catch (erroEquipes) {
          console.error("Erro ao carregar equipes:", erroEquipes);
        }
        
        // Carregar usuários do Firebase
        try {
          console.log("Carregando usuários do Firebase...");
          await this.carregarUsuarios();
          console.log("Usuários carregados com sucesso");
        } catch (erroUsuarios) {
          console.error("Erro ao carregar usuários:", erroUsuarios);
        }
        
        // Esconder loading
        esconderLoading();
        
        console.log("Dados administrativos carregados com sucesso");
        return { sucesso: true, mensagem: "Dados administrativos carregados com sucesso" };
      } catch (error) {
        console.error("Erro ao carregar dados administrativos:", error);
        AppVisita.Utils.exibirMensagem("Erro ao carregar dados administrativos");
        throw error;
      }
    },
    
    // Aguardar Firebase ficar disponível
    async aguardarFirebaseDisponivel() {
      return new Promise((resolve, reject) => {
        // Se já está disponível, resolver imediatamente
        if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
          console.log("Firebase já está disponível");
          resolve();
          return;
        }
