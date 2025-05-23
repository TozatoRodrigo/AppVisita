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
        console.log("Iniciando carregamento de usuários...");
        
        // Verificar se o Firebase está inicializado - verificação mais robusta
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("Firebase não está disponível para carregar usuários, aguardando...");
          
          try {
            await this.aguardarFirebaseDisponivel();
            console.log("Firebase agora está disponível para carregar usuários");
          } catch (error) {
            console.error("Erro ao aguardar Firebase:", error);
            throw new Error("Firebase não está disponível");
          }
        }
        
        // Verificar se o serviço de usuários existe
        if (!AppVisita?.Firebase?.Usuarios) {
          console.error("Serviço de usuários não está disponível");
          throw new Error("Serviço de usuários não está disponível");
        }
        
        console.log("Buscando todos os usuários do Firebase...");
        
        this.dados.usuarios = await AppVisita.Firebase.Usuarios.obterTodos();
        console.log(`${this.dados.usuarios.length} usuários encontrados`);
        
        // Atualizar estatísticas de usuários
        const totalUsuarios = this.dados.usuarios.length;
        const usuariosPendentes = this.dados.usuarios.filter(u => 
          u.status === 'pendente' || !u.aprovado
        ).length;
        
        // Atualizar contadores na interface - com verificação de elementos
        const totalUsuariosEl = document.querySelector('#total-usuarios .stat-value');
        const usuariosPendentesEl = document.querySelector('#usuarios-pendentes .stat-value');
        
        if (totalUsuariosEl) totalUsuariosEl.textContent = totalUsuarios;
        if (usuariosPendentesEl) usuariosPendentesEl.textContent = usuariosPendentes;
        
        // Configurar filtros de usuários
        this.configurarFiltrosUsuarios();
        
        // Mostrar lista inicial de usuários
        this.renderizarListaUsuarios(this.dados.usuarios);
        
        return this.dados.usuarios;
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        
        // Inicializar array vazio para evitar erros adicionais
        this.dados.usuarios = this.dados.usuarios || [];
        
        // Tentar renderizar lista mesmo assim, apenas com dados em memória
        try {
          this.renderizarListaUsuarios(this.dados.usuarios);
        } catch (e) {
          console.error("Erro ao renderizar lista de usuários:", e);
        }
        
        throw error;
      }
    },
    
    // Configurar filtros de usuários
    configurarFiltrosUsuarios() {
      console.log("🔥 CONFIGURANDO FILTROS DE USUÁRIOS");
      
      // Verificar se já tentamos criar a estrutura para evitar loop infinito
      if (this._tentandoConfigurarFiltros) {
        console.warn("🔥 Já está tentando configurar filtros, evitando loop infinito");
        return;
      }
      
      const filtroTodos = document.getElementById('filtro-todos');
      const filtroPendentes = document.getElementById('filtro-pendentes');
      const filtroAprovados = document.getElementById('filtro-aprovados');
      
      // Verificar se os elementos existem
      if (!filtroTodos || !filtroPendentes || !filtroAprovados) {
        console.log("🔥 Elementos de filtro não encontrados, criando estrutura HTML");
        
        // Marcar que estamos tentando configurar para evitar loop
        this._tentandoConfigurarFiltros = true;
        
        try {
          // Criar estrutura HTML completa para usuários
          const sucesso = this.criarEstruturaCompletaUsuarios();
          
          if (sucesso) {
            console.log("🔥 Estrutura de usuários criada com sucesso");
            // Tentar configurar filtros novamente após um breve delay
            setTimeout(() => {
              this._tentandoConfigurarFiltros = false;
              this.configurarFiltrosUsuarios();
            }, 200);
          } else {
            console.error("🔥 Falha ao criar estrutura de usuários");
            this._tentandoConfigurarFiltros = false;
          }
        } catch (error) {
          console.error("🔥 Erro ao criar estrutura de usuários:", error);
          this._tentandoConfigurarFiltros = false;
        }
        
        return;
      }
      
      console.log("🔥 Elementos de filtro encontrados, configurando eventos");
      
      // Limpar flag
      this._tentandoConfigurarFiltros = false;
      
      // Remover eventos antigos
      const novos = {
        todos: filtroTodos.cloneNode(true),
        pendentes: filtroPendentes.cloneNode(true),
        aprovados: filtroAprovados.cloneNode(true)
      };
      
      // Substituir elementos antigos
      if (filtroTodos.parentNode) filtroTodos.parentNode.replaceChild(novos.todos, filtroTodos);
      if (filtroPendentes.parentNode) filtroPendentes.parentNode.replaceChild(novos.pendentes, filtroPendentes);
      if (filtroAprovados.parentNode) filtroAprovados.parentNode.replaceChild(novos.aprovados, filtroAprovados);
      
      // Função para ativar um filtro
      const ativarFiltro = (filtro) => {
        [novos.todos, novos.pendentes, novos.aprovados].forEach(f => f.classList.remove('active'));
        filtro.classList.add('active');
      };
      
      // Configurar eventos
      novos.todos.addEventListener('click', () => {
        console.log("🔥 Filtro TODOS clicado");
        ativarFiltro(novos.todos);
        this.renderizarListaUsuarios(this.dados.usuarios);
      });
      
      novos.pendentes.addEventListener('click', () => {
        console.log("🔥 Filtro PENDENTES clicado");
        ativarFiltro(novos.pendentes);
        const pendentes = this.dados.usuarios.filter(u => u.status === 'pendente' || !u.aprovado);
        this.renderizarListaUsuarios(pendentes);
      });
      
      novos.aprovados.addEventListener('click', () => {
        console.log("🔥 Filtro APROVADOS clicado");
        ativarFiltro(novos.aprovados);
        const aprovados = this.dados.usuarios.filter(u => u.status === 'aprovado' || u.aprovado === true);
        this.renderizarListaUsuarios(aprovados);
      });
      
      console.log("🔥 Filtros de usuários configurados com sucesso");
    },
    
    // Renderizar lista de usuários
    renderizarListaUsuarios(usuarios) {
      console.log(`🔥 RENDERIZANDO ${usuarios.length} usuários`);
      
      // Verificar se o container existe
      let listaUsuarios = document.getElementById('lista-usuarios');
      if (!listaUsuarios) {
        console.log("🔥 Container lista-usuarios não encontrado, criando estrutura");
        const sucesso = this.criarEstruturaCompletaUsuarios();
        if (!sucesso) {
          console.error("🔥 Falha ao criar estrutura de usuários");
          return;
        }
        listaUsuarios = document.getElementById('lista-usuarios');
      }
      
      if (!listaUsuarios) {
        console.error("🔥 Impossível renderizar usuários: elemento lista-usuarios não encontrado");
        return;
      }
      
      // Atualizar estatísticas
      this.atualizarEstatisticasUsuarios();
      
      // Limpar lista
      listaUsuarios.innerHTML = '';
      
      if (usuarios.length === 0) {
        listaUsuarios.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <h3>Nenhum usuário encontrado</h3>
            <p>Nenhum usuário encontrado com os filtros aplicados.</p>
          </div>
        `;
        return;
      }
      
      // Ordenar usuários: pendentes primeiro, depois por data de criação
      const usuariosOrdenados = [...usuarios].sort((a, b) => {
        const aPendente = a.status === 'pendente' || !a.aprovado;
        const bPendente = b.status === 'pendente' || !b.aprovado;
        
        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;
        
        // Por data (mais recentes primeiro)
        if (a.dataCriacao && b.dataCriacao) {
          return b.dataCriacao.seconds - a.dataCriacao.seconds;
        }
        return 0;
      });
      
      // Renderizar cada usuário
      usuariosOrdenados.forEach(user => {
        const isPendente = user.status === 'pendente' || !user.aprovado;
        const userItem = document.createElement('div');
        userItem.classList.add('usuario-item');
        if (isPendente) userItem.classList.add('usuario-pendente');
        
        const dataFormatada = AppVisita.Utils.formatarData(user.dataCriacao);
        const temDadosComplementares = user.dadosComplementaresPreenchidos === true;
        
        // Criar HTML do item
        userItem.innerHTML = `
          <div class="usuario-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="usuario-info">
            <div class="usuario-header">
              <span class="usuario-email">${user.email || 'Email não disponível'}</span>
              <span class="usuario-status ${isPendente ? 'status-pendente' : 'status-aprovado'}">
                <i class="fas ${isPendente ? 'fa-clock' : 'fa-check-circle'}"></i>
                ${isPendente ? 'Pendente' : 'Aprovado'}
              </span>
            </div>
            <div class="usuario-detalhes">
              <span class="usuario-criado">
                <i class="fas fa-calendar-alt"></i> ${dataFormatada}
              </span>
              ${temDadosComplementares ? 
                `<span class="dados-status dados-preenchidos">
                  <i class="fas fa-check-circle"></i> Dados preenchidos
                </span>` : 
                `<span class="dados-status dados-pendentes">
                  <i class="fas fa-exclamation-circle"></i> Dados pendentes
                </span>`
              }
            </div>
            ${temDadosComplementares && user.nomeCompleto ? 
              `<div class="usuario-nome">
                <i class="fas fa-id-card"></i> ${user.nomeCompleto}
              </div>` : ''
            }
            ${temDadosComplementares && user.especialidade ? 
              `<div class="usuario-especialidade">
                <i class="fas fa-stethoscope"></i> ${user.especialidade}
              </div>` : ''
            }
          </div>
          <div class="usuario-acoes">
            ${isPendente ? `
              <button class="btn-aprovar" data-id="${user.id}" title="Aprovar usuário">
                <i class="fas fa-check"></i> Aprovar
              </button>
            ` : ''}
            <button class="btn-detalhes" data-id="${user.id}" title="Ver detalhes">
              <i class="fas fa-eye"></i> Detalhes
            </button>
          </div>
        `;
        
        listaUsuarios.appendChild(userItem);
      });
      
      // Adicionar eventos
      this.adicionarEventosUsuarios();
      
      console.log(`🔥 ${usuarios.length} usuários renderizados com sucesso`);
    },
    
    // Atualizar estatísticas de usuários
    atualizarEstatisticasUsuarios() {
      if (!this.dados.usuarios) return;
      
      const total = this.dados.usuarios.length;
      const pendentes = this.dados.usuarios.filter(u => u.status === 'pendente' || !u.aprovado).length;
      const aprovados = total - pendentes;
      
      // Atualizar contadores na nova estrutura
      const statTotal = document.getElementById('stat-total-usuarios');
      const statPendentes = document.getElementById('stat-usuarios-pendentes');
      const statAprovados = document.getElementById('stat-usuarios-aprovados');
      
      if (statTotal) statTotal.textContent = total;
      if (statPendentes) statPendentes.textContent = pendentes;
      if (statAprovados) statAprovados.textContent = aprovados;
      
      // Atualizar contadores antigos (se existirem)
      const totalUsuariosEl = document.querySelector('#total-usuarios .stat-value');
      const usuariosPendentesEl = document.querySelector('#usuarios-pendentes .stat-value');
      
      if (totalUsuariosEl) totalUsuariosEl.textContent = total;
      if (usuariosPendentesEl) usuariosPendentesEl.textContent = pendentes;
      
      console.log(`🔥 Estatísticas atualizadas: ${total} total, ${pendentes} pendentes, ${aprovados} aprovados`);
    },
    
    // Adicionar eventos aos elementos de usuários
    adicionarEventosUsuarios() {
      // Botões de aprovação
      document.querySelectorAll('.btn-aprovar').forEach(btn => {
        btn.addEventListener('click', async function() {
          const userId = this.dataset.id;
          const usuario = window.AppModulos.Admin.dados.usuarios.find(u => u.id === userId);
          
          if (!usuario) return;
          
          try {
            const esconderLoading = AppModulos.UI.mostrarLoading('Aprovando usuário...');
            const sucesso = await AppVisita.Firebase.Usuarios.aprovarUsuario(userId);
            esconderLoading();
            
            if (sucesso) {
              await window.AppModulos.Admin.carregarUsuarios();
              AppModulos.UI.mostrarNotificacao('Usuário aprovado com sucesso!', 'sucesso');
            } else {
              throw new Error('Falha na aprovação');
            }
          } catch (error) {
            console.error("Erro ao aprovar usuário:", error);
            AppModulos.UI.mostrarNotificacao('Erro ao aprovar usuário', 'erro');
          }
        });
      });
      
      // Botões de detalhes
      document.querySelectorAll('.btn-detalhes').forEach(btn => {
        btn.addEventListener('click', function() {
          const userId = this.dataset.id;
          const usuario = window.AppModulos.Admin.dados.usuarios.find(u => u.id === userId);
          if (usuario) {
            window.AppModulos.Admin.mostrarDetalhesUsuario(usuario);
          }
        });
      });
    },
    
    // Criar a estrutura HTML para a seção de usuários
    criarEstruturaHTMLUsuarios() {
      console.log("Criando estrutura HTML para a seção de usuários");
      
      // Verificar se o container de admin-usuarios existe
      let containerUsuarios = document.getElementById('admin-usuarios-container');
      if (!containerUsuarios) {
        console.log("Container de usuários não encontrado, tentando criar");
        const adminContent = document.getElementById('admin-section');
        if (!adminContent) {
          console.error("Container admin-section não encontrado, impossível criar estrutura");
          return false;
        }
        
        // Criar container de usuários
        containerUsuarios = document.createElement('div');
        containerUsuarios.id = 'admin-usuarios-container';
        containerUsuarios.className = 'admin-tab-content';
        
        // Estrutura básica do container de usuários
        containerUsuarios.innerHTML = `
          <div class="admin-header">
            <h2>Gerenciamento de Usuários</h2>
            <div class="admin-header-actions">
              <!-- Botões de ação serão adicionados aqui -->
            </div>
          </div>
          
          <div class="admin-filters">
            <button id="filtro-todos" class="admin-filter-btn active">Todos</button>
            <button id="filtro-pendentes" class="admin-filter-btn">Pendentes</button>
            <button id="filtro-aprovados" class="admin-filter-btn">Aprovados</button>
          </div>
          
          <div id="lista-usuarios" class="admin-list">
            <!-- Lista de usuários será renderizada aqui -->
          </div>
        `;
        
        // Adicionar container ao admin-section
        adminContent.appendChild(containerUsuarios);
      }
      
      // Verificar se os elementos de filtro existem
      const filtroTodos = document.getElementById('filtro-todos');
      const filtroPendentes = document.getElementById('filtro-pendentes');
      const filtroAprovados = document.getElementById('filtro-aprovados');
      
      if (!filtroTodos || !filtroPendentes || !filtroAprovados) {
        console.log("Elementos de filtro não encontrados, tentando criar");
        
        const filtersContainer = containerUsuarios.querySelector('.admin-filters');
        if (filtersContainer) {
          filtersContainer.innerHTML = `
            <button id="filtro-todos" class="admin-filter-btn active">Todos</button>
            <button id="filtro-pendentes" class="admin-filter-btn">Pendentes</button>
            <button id="filtro-aprovados" class="admin-filter-btn">Aprovados</button>
          `;
        }
      }
      
      // Verificar se o lista-usuarios existe
      const listaUsuarios = document.getElementById('lista-usuarios');
      if (!listaUsuarios) {
        console.log("Elemento lista-usuarios não encontrado, tentando criar");
        
        const listaContainer = document.createElement('div');
        listaContainer.id = 'lista-usuarios';
        listaContainer.className = 'admin-list';
        
        containerUsuarios.appendChild(listaContainer);
      }
      
      return true;
    },
    
    // Adicionar eventos aos botões de aprovação
    adicionarEventosAprovacao() {
      const self = this;
      const botoesAprovar = document.querySelectorAll('.btn-aprovar');
      
      botoesAprovar.forEach(btn => {
        btn.addEventListener('click', async function() {
          const userId = this.dataset.id;
          const usuario = self.dados.usuarios.find(u => u.id === userId);
          
          if (!usuario) return;
          
          // Confirmar ação
          AppModulos.UI.confirmarAcao(
            `Tem certeza que deseja aprovar o usuário <strong>${usuario.email}</strong>?`,
            async () => {
              try {
                // Mostrar loading
                const esconderLoading = AppModulos.UI.mostrarLoading('Aprovando usuário...');
                
                // Aprovar usuário
                const sucesso = await AppVisita.Firebase.Usuarios.aprovarUsuario(userId);
                
                // Esconder loading
                esconderLoading();
                
                if (sucesso) {
                  // Atualizar dados
                  await self.carregarUsuarios();
                  
                  // Mostrar mensagem de sucesso
                  AppModulos.UI.mostrarNotificacao('Usuário aprovado com sucesso!', 'sucesso');
                } else {
                  throw new Error('Falha na aprovação');
                }
              } catch (error) {
                console.error("Erro ao aprovar usuário:", error);
                AppModulos.UI.mostrarNotificacao('Erro ao aprovar usuário', 'erro');
              }
            }
          );
        });
      });
    },
    
    // Carregar estatísticas do sistema
    async carregarEstatisticas() {
      try {
        // Carregar pacientes
        const pacientes = await AppVisita.Firebase.Pacientes.obterTodos();
        
        // Total de pacientes
        const totalPacientes = pacientes.length;
        document.querySelector('#total-pacientes .stat-value').textContent = totalPacientes;
        
        // Calcular total de evoluções
        let totalEvolucoes = 0;
        pacientes.forEach(paciente => {
          if (paciente.evolucoes && Array.isArray(paciente.evolucoes)) {
            totalEvolucoes += paciente.evolucoes.length;
          }
        });
        document.querySelector('#total-evolucoes .stat-value').textContent = totalEvolucoes;
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
        throw error;
      }
    },
    
    // Carregar equipes
    async carregarEquipes() {
      try {
        console.log("Iniciando carregamento de equipes");
        
        // Mostrar loading
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando equipes...');
        
        try {
          // Buscar todas as equipes
          const todasEquipesNaoDB = await AppVisita.Firebase.Equipes.obterTodas();
          console.log(`${todasEquipesNaoDB.length} equipes encontradas no banco de dados`);
          
          // Filtrar equipes marcadas como excluídas (implementação do soft delete)
          this.dados.todasEquipes = todasEquipesNaoDB.filter(equipe => {
            const naoExcluida = !(equipe.excluido === true || equipe.status === 'excluido');
            if (!naoExcluida) {
              console.log(`Equipe "${equipe.nome}" (ID: ${equipe.id}) está marcada como excluída e será filtrada`);
            }
            return naoExcluida;
          });
          
          const totalEquipesAtivas = this.dados.todasEquipes.length;
          console.log(`${totalEquipesAtivas} equipes ativas após filtrar excluídas`);
          
          // Atualizar contador de equipes
          const contadorEquipes = document.querySelector('#total-equipes .stat-value');
          if (contadorEquipes) {
            contadorEquipes.textContent = totalEquipesAtivas;
          } else {
            console.log("Elemento contador de equipes não encontrado (#total-equipes .stat-value)");
          }
          
          // Renderizar lista de equipes
          this.renderizarListaEquipes();
          
          // Configurar abas do painel admin
          this.configurarAbasPainelAdmin();
          
          return this.dados.todasEquipes;
        } catch (error) {
          console.error("Erro ao buscar equipes do Firebase:", error);
          throw error;
        } finally {
          // Esconder loading
          esconderLoading();
        }
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        AppModulos.UI.mostrarNotificacao('Erro ao carregar equipes. Tente novamente.', 'erro');
        return [];
      }
    },
    
    // Renderizar lista de equipes
    renderizarListaEquipes() {
      const listaEquipes = document.getElementById('lista-equipes');
      if (!listaEquipes) {
        console.log("Elemento lista-equipes não encontrado na DOM");
        return;
      }
      
      // Limpar lista
      listaEquipes.innerHTML = '';
      
      // Verificar se temos dados de equipes
      if (!this.dados.todasEquipes) {
        this.dados.todasEquipes = [];
        console.log("Inicializando array de equipes vazio");
      }
      
      if (this.dados.todasEquipes.length === 0) {
        listaEquipes.innerHTML = '<p class="sem-equipes">Nenhuma equipe médica cadastrada ainda.</p>';
        return;
      }
      
      try {
        // Criar item para cada equipe
        this.dados.todasEquipes.forEach(equipe => {
          const numMedicos = equipe.membros ? equipe.membros.length : 0;
          
          const equipeItem = document.createElement('div');
          equipeItem.classList.add('equipe-item');
          
          equipeItem.innerHTML = `
            <div class="equipe-info">
              <div class="equipe-header">
                <span class="equipe-nome">${equipe.nome || 'Equipe sem nome'}</span>
                <span class="equipe-membros">
                  <i class="fas fa-user-md"></i> ${numMedicos} médico${numMedicos !== 1 ? 's' : ''}
                </span>
              </div>
              <div class="equipe-descricao">${equipe.descricao || 'Sem descrição'}</div>
            </div>
            <div class="equipe-acoes">
              <button class="btn-editar" data-id="${equipe.id}">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn-excluir" data-id="${equipe.id}">
                <i class="fas fa-trash-alt"></i> Excluir
              </button>
            </div>
          `;
          
          listaEquipes.appendChild(equipeItem);
        });
        
        // Adicionar eventos para os botões
        this.adicionarEventosBotoesEquipe();
      } catch (error) {
        console.error("Erro ao renderizar lista de equipes:", error);
        listaEquipes.innerHTML = '<p class="erro-lista">Erro ao exibir lista de equipes. Tente recarregar a página.</p>';
      }
    },
    
    // Adicionar eventos aos botões de equipe
    adicionarEventosBotoesEquipe() {
      console.log("🔥 CONFIGURANDO EVENTOS para botões de equipes");
      
      // Armazenar referência a "this" para uso nos callbacks
      const self = this;
      
      try {
        // Botões de editar equipe - SEM CLONAGEM
        const botoesEditar = document.querySelectorAll('.btn-editar');
        console.log(`🔥 Encontrados ${botoesEditar.length} botões de edição`);
        
        botoesEditar.forEach((btn, index) => {
          console.log(`🔥 Configurando botão editar ${index + 1}`);
          
          // Remover eventos antigos apenas removendo os listeners
          btn.removeEventListener('click', self._handleEditClick);
          
          // Criar função específica para este botão
          const handleClick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const equipeId = this.dataset.id;
            console.log(`🔥 Botão editar clicado para equipe ID: ${equipeId}`);
            self.abrirModalEditarEquipe(equipeId);
          };
          
          // Adicionar evento
          btn.addEventListener('click', handleClick);
        });
        
        // Botões de excluir equipe - SEM CLONAGEM
        const botoesExcluir = document.querySelectorAll('.btn-excluir');
        console.log(`🔥 Encontrados ${botoesExcluir.length} botões de exclusão`);
        
        botoesExcluir.forEach((btn, index) => {
          console.log(`🔥 Configurando botão excluir ${index + 1}`);
          
          // Remover eventos antigos apenas removendo os listeners
          btn.removeEventListener('click', self._handleDeleteClick);
          
          // Criar função específica para este botão
          const handleClick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            try {
              const equipeId = this.dataset.id;
              console.log(`🔥 BOTÃO EXCLUIR CLICADO para equipe ID: ${equipeId}`);
              
              // Verificar se o ID existe
              if (!equipeId) {
                console.error("🔥 ID da equipe não encontrado no botão de exclusão");
                alert("Erro: ID da equipe não encontrado");
                return;
              }
              
              // Buscar dados da equipe
              const equipe = self.dados.todasEquipes.find(eq => eq.id === equipeId);
              
              if (!equipe) {
                console.error(`🔥 Equipe com ID ${equipeId} não encontrada`);
                alert('Equipe não encontrada');
                return;
              }
              
              console.log(`🔥 EQUIPE ENCONTRADA:`, equipe);
              
              // Confirmar exclusão
              self.confirmarExclusaoEquipe(equipe);
            } catch (error) {
              console.error("🔥 ERRO ao processar clique no botão excluir:", error);
              alert("Erro ao processar exclusão: " + error.message);
            }
          };
          
          // Adicionar evento
          btn.addEventListener('click', handleClick);
        });
        
        console.log("🔥 Eventos dos botões de equipe configurados com sucesso");
      } catch (error) {
        console.error("🔥 ERRO ao configurar eventos de botões de equipe:", error);
        alert("Erro ao configurar botões de equipe: " + error.message);
      }
    },
    
    // Função auxiliar para confirmar e processar exclusão
    confirmarExclusaoEquipe(equipe) {
      console.log(`🔥 INICIANDO CONFIRMAÇÃO para equipe: ${equipe.nome} (ID: ${equipe.id})`);
      console.log("🔥 Objeto equipe que será excluído:", equipe);
      
      // TEMPORARIAMENTE: USAR SEMPRE CONFIRM PADRÃO PARA DEBUG
      console.log("🔥 FORÇANDO USO DO CONFIRM PADRÃO PARA DEBUG");
      const confirmacao = confirm(`Tem certeza que deseja excluir a equipe "${equipe.nome}"? Esta ação não pode ser desfeita.`);
      
      if (confirmacao) {
        console.log(`🔥 Confirmação recebida, iniciando exclusão da equipe: ${equipe.nome}`);
        
        // Chamar diretamente a função de exclusão
        if (this && typeof this.processarExclusaoEquipe === 'function') {
          console.log("🔥 Chamando processarExclusaoEquipe via this");
          this.processarExclusaoEquipe(equipe);
        } else if (window.AppModulos && window.AppModulos.Admin && typeof window.AppModulos.Admin.processarExclusaoEquipe === 'function') {
          console.log("🔥 Chamando processarExclusaoEquipe via módulo global");
          window.AppModulos.Admin.processarExclusaoEquipe(equipe);
        } else {
          console.error("🔥 Não foi possível encontrar a função processarExclusaoEquipe");
          alert("Erro: Função de exclusão não encontrada. Tente recarregar a página.");
        }
      } else {
        console.log("🔥 Exclusão cancelada pelo usuário");
      }
    },
    
    // Função para processar a exclusão após confirmação
    async processarExclusaoEquipe(equipe) {
      console.log(`🔥 INICIANDO EXCLUSÃO DA EQUIPE: ${equipe.nome} (ID: ${equipe.id})`);
      console.log("🔥 Objeto equipe recebido:", equipe);
      console.log("🔥 Contexto this:", this);
      
      try {
        // Mostrar loading
        console.log("🔥 Mostrando loading...");
        const esconderLoading = AppModulos.UI.mostrarLoading('Excluindo equipe...');
        
        // Verificar se o Firebase e o serviço de Equipes estão disponíveis
        if (!window.AppVisita?.Firebase?.Equipes) {
          console.error("🔥 Serviços necessários não disponíveis");
          esconderLoading();
          AppModulos.UI.mostrarNotificacao('Erro: Serviços necessários não disponíveis', 'erro');
          return;
        }
        
        // Verificar se o método excluirEquipe existe
        if (typeof AppVisita.Firebase.Equipes.excluirEquipe !== 'function') {
          console.error("🔥 Método excluirEquipe não encontrado");
          esconderLoading();
          AppModulos.UI.mostrarNotificacao('Erro: Método de exclusão não encontrado', 'erro');
          return;
        }
        
        console.log(`🔥 Chamando método excluirEquipe para ID: ${equipe.id}`);
        const sucesso = await AppVisita.Firebase.Equipes.excluirEquipe(equipe.id);
        console.log(`🔥 Resultado da exclusão: ${sucesso ? 'SUCESSO' : 'FALHA'}`);
        
        // Esconder loading
        esconderLoading();
        
        if (sucesso) {
          console.log(`🔥 Equipe "${equipe.nome}" excluída com sucesso`);
          
          // Remover a equipe do array local
          this.dados.todasEquipes = this.dados.todasEquipes.filter(e => e.id !== equipe.id);
          console.log(`🔥 Equipe removida do array local. Restam: ${this.dados.todasEquipes.length} equipes`);
          
          // Atualizar a interface
          this.renderizarListaEquipes();
          console.log("🔥 Interface atualizada");
          
          // Mostrar mensagem de sucesso
          AppModulos.UI.mostrarNotificacao('Equipe excluída com sucesso!', 'sucesso');
          
          // Forçar recarga da lista após um breve atraso
          setTimeout(() => {
            console.log("🔥 Recarregando equipes do Firebase após operação de exclusão");
            this.carregarEquipes().catch(err => {
              console.error("🔥 Erro ao recarregar equipes após exclusão:", err);
              AppModulos.UI.mostrarNotificacao('Erro ao atualizar lista de equipes', 'erro');
            });
          }, 1500);
        } else {
          throw new Error('Falha na exclusão da equipe');
        }
      } catch (error) {
        console.error(`🔥 ERRO ao excluir equipe ${equipe.nome}:`, error);
        
        // Mensagens de erro específicas
        if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
          AppModulos.UI.mostrarNotificacao('Erro de permissão: Você não tem autorização para excluir equipes.', 'erro');
        } else if (error.code === 'not-found' || (error.message && error.message.includes('não encontrada'))) {
          AppModulos.UI.mostrarNotificacao('Equipe não encontrada. Ela pode ter sido excluída por outro usuário.', 'erro');
        } else {
          AppModulos.UI.mostrarNotificacao('Erro ao excluir equipe: ' + (error.message || 'Erro desconhecido'), 'erro');
        }
        
        // Tentar recarregar a lista em caso de erro
        try {
          await this.carregarEquipes();
        } catch (reloadError) {
          console.error("🔥 Erro ao recarregar equipes após erro de exclusão:", reloadError);
        }
      }
    },
    
    // Abrir modal para criar nova equipe
    async abrirModalNovaEquipe() {
      console.log("Abrindo modal para criar nova equipe");
      
      // Buscar elementos do modal
      const modalEquipe = document.getElementById('modal-equipe');
      const formEquipe = document.getElementById('form-equipe');
      const nomeEquipeInput = document.getElementById('nome-equipe');
      const descricaoEquipeInput = document.getElementById('descricao-equipe');
      const equipeIdInput = document.getElementById('equipe-id');
      
      if (!modalEquipe || !formEquipe) {
        console.error("Elementos do modal de equipe não encontrados");
        AppModulos.UI.mostrarNotificacao('Erro ao abrir formulário de equipe', 'erro');
        return;
      }
      
      // Limpar formulário
      formEquipe.reset();
      
      // Garantir que o campo de ID esteja vazio
      if (equipeIdInput) equipeIdInput.value = '';
      
      // Garantir que os campos estejam vazios (fallback)
      if (nomeEquipeInput) nomeEquipeInput.value = '';
      if (descricaoEquipeInput) descricaoEquipeInput.value = '';
      
      // Atualizar título do modal
      const modalTituloEquipe = document.getElementById('modal-titulo-equipe');
      if (modalTituloEquipe) {
        modalTituloEquipe.textContent = 'Nova Equipe';
      }
      
      try {
        // Mostrar loading enquanto carrega médicos
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando médicos disponíveis...');
        
        // Carregar médicos disponíveis
        await this.carregarMedicosNoModal();
        
        // Esconder loading
        esconderLoading();
        
        // Mostrar modal
        modalEquipe.style.display = 'block';
        
        console.log("Modal de nova equipe aberto com sucesso");
      } catch (error) {
        console.error("Erro ao carregar médicos para o modal:", error);
        AppModulos.UI.mostrarNotificacao('Erro ao carregar médicos disponíveis', 'erro');
      }
    },
    
    // Abrir modal para editar equipe existente
    async abrirModalEditarEquipe(equipeId) {
      try {
        // Mostrar loading
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando dados da equipe...');
        
        // Buscar dados da equipe
        const equipe = this.dados.todasEquipes.find(e => e.id === equipeId);
        
        if (!equipe) {
          esconderLoading();
          AppModulos.UI.mostrarNotificacao('Equipe não encontrada!', 'erro');
          return;
        }
        
        // Buscar elementos do modal
        const modalEquipe = document.getElementById('modal-equipe');
        const nomeEquipeInput = document.getElementById('nome-equipe');
        const descricaoEquipeInput = document.getElementById('descricao-equipe');
        const equipeIdInput = document.getElementById('equipe-id');
        
        if (!modalEquipe) {
          esconderLoading();
          console.error("Modal de equipe não encontrado");
          return;
        }
        
        // Preencher formulário
        nomeEquipeInput.value = equipe.nome || '';
        descricaoEquipeInput.value = equipe.descricao || '';
        equipeIdInput.value = equipeId;
        
        // Atualizar título do modal
        const modalTituloEquipe = document.getElementById('modal-titulo-equipe');
        if (modalTituloEquipe) {
          modalTituloEquipe.textContent = 'Editar Equipe';
        }
        
        // Carregar médicos e marcar os selecionados
        await this.carregarMedicosNoModal(equipe.membros || []);
        
        // Esconder loading
        esconderLoading();
        
        // Mostrar modal
        modalEquipe.style.display = 'block';
      } catch (error) {
        console.error("Erro ao abrir modal de edição:", error);
        AppModulos.UI.mostrarNotificacao('Erro ao carregar dados da equipe', 'erro');
      }
    },
    
    // Carregar médicos aprovados no modal
    async carregarMedicosNoModal(membrosSelecionados = []) {
      try {
        const selecaoMedicos = document.getElementById('selecao-medicos');
        if (!selecaoMedicos) return;
        
        selecaoMedicos.innerHTML = '<p class="carregando-info">Carregando médicos...</p>';
        
        // Buscar médicos aprovados
        const medicos = await this.carregarMedicosAprovados();
        
        if (medicos.length === 0) {
          selecaoMedicos.innerHTML = '<p class="sem-medicos">Nenhum médico aprovado encontrado.</p>';
          return;
        }
        
        // Renderizar lista de médicos
        selecaoMedicos.innerHTML = '';
        
        medicos.forEach(medico => {
          const medicoItem = document.createElement('div');
          medicoItem.className = 'medico-item';
          medicoItem.dataset.id = medico.id;
          
          // Verificar se o médico está na lista de membros selecionados
          if (membrosSelecionados.includes(medico.id)) {
            medicoItem.classList.add('selecionado');
          }
          
          medicoItem.innerHTML = `
            <span class="medico-email">${medico.email}</span>
            <button class="btn-toggle-medico">
              <i class="fas ${medicoItem.classList.contains('selecionado') ? 'fa-user-minus' : 'fa-user-plus'}"></i>
              ${medicoItem.classList.contains('selecionado') ? 'Remover' : 'Adicionar'}
            </button>
          `;
          
          // Adicionar evento de clique
          medicoItem.addEventListener('click', () => {
            medicoItem.classList.toggle('selecionado');
            const btn = medicoItem.querySelector('.btn-toggle-medico');
            btn.innerHTML = `
              <i class="fas ${medicoItem.classList.contains('selecionado') ? 'fa-user-minus' : 'fa-user-plus'}"></i>
              ${medicoItem.classList.contains('selecionado') ? 'Remover' : 'Adicionar'}
            `;
          });
          
          selecaoMedicos.appendChild(medicoItem);
        });
      } catch (error) {
        console.error("Erro ao carregar médicos:", error);
        const selecaoMedicos = document.getElementById('selecao-medicos');
        if (selecaoMedicos) {
          selecaoMedicos.innerHTML = '<p class="erro-carregamento">Erro ao carregar médicos. Tente novamente.</p>';
        }
      }
    },
    
    // Carregar médicos aprovados
    async carregarMedicosAprovados() {
      try {
        // Se não temos usuários carregados, buscar do Firestore
        if (!this.dados.usuarios || this.dados.usuarios.length === 0) {
          console.log("Buscando usuários do Firestore para o modal de equipe");
          
          try {
            // Buscar usuários do Firestore
            const usersSnapshot = await db.collection('usuarios')
              .where('aprovado', '==', true)
              .get();
              
            this.dados.usuarios = usersSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
            
            console.log(`${this.dados.usuarios.length} usuários carregados do Firestore`);
          } catch (error) {
            console.error("Erro ao buscar usuários do Firestore:", error);
            // Se falhar, criar array fictício para fins de demonstração
            this.dados.usuarios = [
              { id: 'user1', email: 'medico1@exemplo.com', aprovado: true, status: 'aprovado' },
              { id: 'user2', email: 'medico2@exemplo.com', aprovado: true, status: 'aprovado' }
            ];
            console.log("Usando dados fictícios de usuários");
          }
        }
        
        // Filtrar apenas usuários aprovados (exceto o admin)
        const medicosAprovados = this.dados.usuarios
          .filter(user => 
            (user.aprovado === true || user.status === 'aprovado') && 
            user.email !== window.ADMIN_EMAIL
          );
        
        console.log(`${medicosAprovados.length} médicos aprovados encontrados`);
        return medicosAprovados;
      } catch (error) {
        console.error("Erro ao carregar médicos aprovados:", error);
        // Retornar array vazio em caso de erro
        return [];
      }
    },
    
    // Mostrar detalhes do usuário em um modal
    mostrarDetalhesUsuario(usuario) {
      const temDadosComplementares = usuario.dadosComplementaresPreenchidos === true;
      
      let conteudoModal = `
        <div class="detalhes-usuario">
          <div class="detalhe-item">
            <span class="detalhe-label">Email:</span>
            <span class="detalhe-valor">${usuario.email}</span>
          </div>
          <div class="detalhe-item">
            <span class="detalhe-label">Status:</span>
            <span class="detalhe-valor ${usuario.aprovado ? 'aprovado' : 'pendente'}">
              ${usuario.aprovado ? 'Aprovado' : 'Pendente de aprovação'}
            </span>
          </div>
          <div class="detalhe-item">
            <span class="detalhe-label">Data de Criação:</span>
            <span class="detalhe-valor">${AppVisita.Utils.formatarData(usuario.dataCriacao)}</span>
          </div>
      `;
      
      if (temDadosComplementares) {
        conteudoModal += `
          <hr>
          <h4>Dados Complementares</h4>
          <div class="detalhe-item">
            <span class="detalhe-label">Nome Completo:</span>
            <span class="detalhe-valor">${usuario.nomeCompleto}</span>
          </div>
          <div class="detalhe-item">
            <span class="detalhe-label">CPF:</span>
            <span class="detalhe-valor">${usuario.cpf}</span>
          </div>
          <div class="detalhe-item">
            <span class="detalhe-label">Telefone:</span>
            <span class="detalhe-valor">${usuario.telefone}</span>
          </div>
          ${usuario.especialidade ? `
          <div class="detalhe-item">
            <span class="detalhe-label">Especialidade:</span>
            <span class="detalhe-valor">${usuario.especialidade}</span>
          </div>` : ''}
          ${usuario.crm ? `
          <div class="detalhe-item">
            <span class="detalhe-label">CRM:</span>
            <span class="detalhe-valor">${usuario.crm.numero}/${usuario.crm.estado}</span>
          </div>` : ''}
        `;
      } else {
        conteudoModal += `
          <hr>
          <div class="alerta-info">
            <i class="fas fa-info-circle"></i>
            Este usuário ainda não preencheu seus dados complementares.
          </div>
        `;
      }
      
      conteudoModal += '</div>';
      
      // Botões do modal
      const botoes = [
        {
          texto: 'Fechar',
          tipo: 'secondary'
        }
      ];
      
      // Se o usuário estiver pendente, adicionar botão de aprovação
      if (!usuario.aprovado) {
        botoes.unshift({
          texto: 'Aprovar Usuário',
          tipo: 'primary',
          onClick: async (_, modal) => {
            try {
              const esconderLoading = AppModulos.UI.mostrarLoading('Aprovando usuário...');
              
              const sucesso = await AppVisita.Firebase.Usuarios.aprovarUsuario(usuario.id);
              
              esconderLoading();
              
              if (sucesso) {
                await this.carregarUsuarios();
                AppModulos.UI.mostrarNotificacao('Usuário aprovado com sucesso!', 'sucesso');
                modal.fecharModal();
              } else {
                throw new Error('Falha na aprovação');
              }
            } catch (error) {
              console.error("Erro ao aprovar usuário:", error);
              AppModulos.UI.mostrarNotificacao('Erro ao aprovar usuário', 'erro');
            }
          }
        });
      }
      
      // Exibir modal com os detalhes
      AppModulos.UI.exibirModal(
        `Detalhes do Usuário`, 
        conteudoModal,
        botoes
      );
    },
    
    // Inicializar módulo
    inicializar() {
      console.log("Inicializando módulo Admin");
      
      // Verificar se o Firebase já está disponível
      if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
        console.log("Firebase já está disponível, carregando dados administrativos imediatamente");
        this.carregarDadosAdmin().catch(error => {
          console.error("Erro ao carregar dados administrativos na inicialização:", error);
        });
      } else {
        console.log("Firebase não está disponível ainda, aguardando evento firebase-ready");
        
        // Inicializar interface básica primeiro
        this.inicializarInterfaceAdmin();
        
        // Aguardar o evento firebase-ready para carregar dados
        document.addEventListener('firebase-ready', async () => {
          console.log("Evento firebase-ready recebido em AdminModulo.inicializar");
          
          try {
            await this.carregarDadosAdmin();
            console.log("Dados administrativos carregados com sucesso após firebase-ready");
          } catch (error) {
            console.error("Erro ao carregar dados administrativos após firebase-ready:", error);
          }
        });
      }
      
      // Configurar o evento de submit do formulário de equipe
      const formEquipe = document.getElementById('form-equipe');
      const modalEquipe = document.getElementById('modal-equipe');
      
      if (formEquipe) {
        formEquipe.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          try {
            // Mostrar loading
            const esconderLoading = AppModulos.UI.mostrarLoading('Salvando equipe...');
            
            // Obter dados do formulário
            const nome = document.getElementById('nome-equipe').value.trim();
            const descricao = document.getElementById('descricao-equipe').value.trim();
            const equipeId = document.getElementById('equipe-id').value.trim();
            
            // Verificar nome (obrigatório)
            if (!nome) {
              AppModulos.UI.mostrarNotificacao('O nome da equipe é obrigatório', 'erro');
              esconderLoading();
              return;
            }
            
            // Obter médicos selecionados
            const medicosSelecionados = [];
            document.querySelectorAll('#selecao-medicos .medico-item.selecionado').forEach(item => {
              medicosSelecionados.push(item.dataset.id);
            });
            
            console.log(`Salvando equipe "${nome}" com ${medicosSelecionados.length} médicos selecionados`);
            
            // Montar objeto da equipe
            const equipeData = {
              nome,
              descricao,
              membros: medicosSelecionados,
              dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
              ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Salvar equipe
            const sucesso = await AppVisita.Firebase.Equipes.salvarEquipe(equipeData, equipeId || null);
            
            // Esconder loading
            esconderLoading();
            
            if (sucesso) {
              // Fechar modal
              if (modalEquipe) modalEquipe.style.display = 'none';
              
              // Recarregar lista de equipes
              try {
                await this.carregarEquipes();
              } catch (err) {
                console.error("Erro ao recarregar equipes, mas a equipe foi salva com sucesso:", err);
              }
              
              // Mostrar mensagem de sucesso
              AppModulos.UI.mostrarNotificacao(
                equipeId ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!', 
                'sucesso'
              );
            } else {
              throw new Error('Falha ao salvar equipe');
            }
          } catch (error) {
            console.error("Erro ao salvar equipe:", error);
            AppModulos.UI.mostrarNotificacao('Erro ao salvar equipe. Verifique o console para mais detalhes.', 'erro');
          }
        });
      }
      
      // Configurar botão de fechar modal
      const closeButtons = document.querySelectorAll('.modal .close-button');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.modal');
          if (modal) modal.style.display = 'none';
        });
      });
      
      // Fechar modal ao clicar fora
      window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
          e.target.style.display = 'none';
        }
      });
      
      // Configuração específica para o modal de equipe
      this.configurarModalEquipe();
    },
    
    // Configurar o modal de equipe
    configurarModalEquipe() {
      console.log("Configurando modal de equipe");
      
      const modalEquipe = document.getElementById('modal-equipe');
      const closeButton = modalEquipe ? modalEquipe.querySelector('.close-button') : null;
      
      if (modalEquipe && closeButton) {
        // Remover eventos antigos
        const closeButtonClone = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(closeButtonClone, closeButton);
        
        // Adicionar novo evento de fechar
        closeButtonClone.addEventListener('click', () => {
          console.log("Botão de fechar modal clicado");
          modalEquipe.style.display = 'none';
        });
        
        console.log("Modal de equipe configurado com sucesso");
      } else {
        console.warn("Modal de equipe ou botão de fechar não encontrado");
      }
    },
    
    // Criar estrutura HTML completa para usuários
    criarEstruturaCompletaUsuarios() {
      console.log("🔥 CRIANDO ESTRUTURA COMPLETA DE USUÁRIOS");
      
      try {
        // Verificar se o container principal existe
        const adminSection = document.getElementById('admin-section');
        if (!adminSection) {
          console.error("🔥 Seção admin não encontrada");
          return false;
        }
        
        // Verificar se o container de usuários já existe
        let containerUsuarios = document.getElementById('admin-usuarios-container');
        
        if (!containerUsuarios) {
          console.log("🔥 Criando container de usuários");
          
          // Criar container de usuários
          containerUsuarios = document.createElement('div');
          containerUsuarios.id = 'admin-usuarios-container';
          containerUsuarios.className = 'admin-tab-content';
          
          // Inserir após o container de dashboard
          const dashboardContainer = document.getElementById('admin-dashboard-container');
          if (dashboardContainer && dashboardContainer.nextSibling) {
            adminSection.insertBefore(containerUsuarios, dashboardContainer.nextSibling);
          } else {
            adminSection.appendChild(containerUsuarios);
          }
        }
        
        // Criar estrutura HTML completa
        containerUsuarios.innerHTML = `
          <div class="admin-header">
            <h2><i class="fas fa-users"></i> Gerenciamento de Usuários</h2>
            <div class="admin-header-actions">
              <button id="btn-recarregar-usuarios" class="btn btn-secondary">
                <i class="fas fa-sync-alt"></i> Recarregar
              </button>
            </div>
          </div>
          
          <div class="admin-stats">
            <div class="stat-card">
              <h3>Total de Usuários</h3>
              <div class="stat-number" id="stat-total-usuarios">0</div>
            </div>
            <div class="stat-card">
              <h3>Pendentes</h3>
              <div class="stat-number" id="stat-usuarios-pendentes">0</div>
            </div>
            <div class="stat-card">
              <h3>Aprovados</h3>
              <div class="stat-number" id="stat-usuarios-aprovados">0</div>
            </div>
          </div>
          
          <div class="admin-filters">
            <button id="filtro-todos" class="admin-filter-btn active">
              <i class="fas fa-users"></i> Todos
            </button>
            <button id="filtro-pendentes" class="admin-filter-btn">
              <i class="fas fa-clock"></i> Pendentes
            </button>
            <button id="filtro-aprovados" class="admin-filter-btn">
              <i class="fas fa-check-circle"></i> Aprovados
            </button>
          </div>
          
          <div id="lista-usuarios" class="admin-list">
            <div class="loading-message">
              <i class="fas fa-spinner fa-spin"></i> Carregando usuários...
            </div>
          </div>
        `;
        
        console.log("🔥 Estrutura HTML de usuários criada com sucesso");
        
        // Configurar evento do botão recarregar
        const btnRecarregar = document.getElementById('btn-recarregar-usuarios');
        if (btnRecarregar) {
          btnRecarregar.addEventListener('click', async () => {
            console.log("🔥 Botão recarregar usuários clicado");
            try {
              const esconderLoading = AppModulos.UI.mostrarLoading('Recarregando usuários...');
              await this.carregarUsuarios();
              esconderLoading();
              AppModulos.UI.mostrarNotificacao('Usuários recarregados com sucesso!', 'sucesso');
            } catch (error) {
              console.error("🔥 Erro ao recarregar usuários:", error);
              AppModulos.UI.mostrarNotificacao('Erro ao recarregar usuários.', 'erro');
            }
          });
        }
        
        return true;
      } catch (error) {
        console.error("🔥 Erro ao criar estrutura de usuários:", error);
        return false;
      }
    }
  };
  
  // Inicializar módulo
  AdminModulo.inicializar();
  
  // Adicionar estilos CSS para as novas funcionalidades
  (function adicionarEstilosAdmin() {
    const style = document.createElement('style');
    style.textContent = `
      /* Estilos para estatísticas de usuários */
      .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      
      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid #4285f4;
      }
      
      .stat-card h3 {
        margin: 0 0 10px;
        color: #666;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
      }
      
      .stat-number {
        font-size: 32px;
        font-weight: bold;
        color: #4285f4;
        margin: 0;
      }
      
      /* Estilos para itens de usuário modernos */
      .usuario-item {
        display: flex;
        align-items: center;
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        border-left: 4px solid #e0e0e0;
      }
      
      .usuario-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      .usuario-item.usuario-pendente {
        border-left-color: #ffc107;
        background: linear-gradient(135deg, #fff8e1 0%, #ffffff 50%);
      }
      
      .usuario-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4285f4, #6ab7ff);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
      }
      
      .usuario-avatar i {
        color: white;
        font-size: 20px;
      }
      
      .usuario-info {
        flex: 1;
        min-width: 0;
      }
      
      .usuario-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        flex-wrap: wrap;
        gap: 12px;
      }
      
      .usuario-email {
        font-weight: 600;
        color: #333;
        font-size: 16px;
      }
      
      .usuario-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .status-pendente {
        background: #fff3cd;
        color: #856404;
      }
      
      .status-aprovado {
        background: #d4edda;
        color: #155724;
      }
      
      .usuario-detalhes {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      
      .usuario-criado {
        font-size: 13px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .dados-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .dados-preenchidos {
        background: #d4edda;
        color: #155724;
      }
      
      .dados-pendentes {
        background: #f8d7da;
        color: #721c24;
      }
      
      .usuario-nome, .usuario-especialidade {
        font-size: 14px;
        color: #555;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
      }
      
      .usuario-acoes {
        display: flex;
        gap: 8px;
        margin-left: 16px;
        flex-shrink: 0;
      }
      
      .btn-aprovar, .btn-detalhes {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }
      
      .btn-aprovar {
        background: #28a745;
        color: white;
      }
      
      .btn-aprovar:hover {
        background: #218838;
        transform: translateY(-1px);
      }
      
      .btn-detalhes {
        background: #6c757d;
        color: white;
      }
      
      .btn-detalhes:hover {
        background: #5a6268;
        transform: translateY(-1px);
      }
      
      /* Estado vazio */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #666;
      }
      
      .empty-state i {
        font-size: 64px;
        color: #ddd;
        margin-bottom: 20px;
      }
      
      .empty-state h3 {
        margin: 0 0 10px;
        color: #555;
      }
      
      .empty-state p {
        margin: 0;
        color: #888;
      }
      
      /* Loading message */
      .loading-message {
        text-align: center;
        padding: 40px;
        color: #666;
      }
      
      .loading-message i {
        font-size: 24px;
        margin-right: 8px;
        color: #4285f4;
      }
      
      /* Filtros melhorados */
      .admin-filters {
        display: flex;
        gap: 8px;
        margin: 20px 0;
        flex-wrap: wrap;
      }
      
      .admin-filter-btn {
        padding: 10px 16px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        color: #666;
      }
      
      .admin-filter-btn:hover {
        border-color: #4285f4;
        color: #4285f4;
      }
      
      .admin-filter-btn.active {
        background: #4285f4;
        border-color: #4285f4;
        color: white;
      }
      
      /* Responsividade */
      @media (max-width: 768px) {
        .usuario-item {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .usuario-avatar {
          margin-right: 0;
          margin-bottom: 12px;
        }
        
        .usuario-acoes {
          margin-left: 0;
          margin-top: 12px;
          width: 100%;
          justify-content: flex-end;
        }
        
        .usuario-header {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .admin-stats {
          grid-template-columns: 1fr;
        }
      }
      
      /* Estilos legacy mantidos para compatibilidade */
      .usuario-info-complementar {
        margin-top: 10px;
        background: #f8f9fa;
        border-radius: 4px;
        padding: 10px;
        font-size: 13px;
      }
      
      .info-complementar-item {
        display: flex;
        margin-bottom: 5px;
      }
      
      .info-complementar-item:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-weight: 500;
        width: 140px;
        color: #666;
      }
      
      .info-label i {
        width: 16px;
        text-align: center;
        margin-right: 5px;
        color: #4285f4;
      }
      
      .info-valor {
        flex: 1;
      }
      
      /* Estilos para o modal de detalhes */
      .detalhes-usuario {
        padding: 10px 0;
      }
      
      .detalhes-usuario .detalhe-item {
        display: flex;
        margin-bottom: 10px;
      }
      
      .detalhes-usuario .detalhe-label {
        width: 140px;
        font-weight: 500;
        color: #666;
      }
      
      .detalhes-usuario .detalhe-valor {
        flex: 1;
      }
      
      .detalhes-usuario .detalhe-valor.aprovado {
        color: #28a745;
      }
      
      .detalhes-usuario .detalhe-valor.pendente {
        color: #ffc107;
      }
      
      .detalhes-usuario h4 {
        margin: 15px 0 10px;
        color: #4285f4;
      }
      
      .detalhes-usuario hr {
        border: 0;
        border-top: 1px solid #eee;
        margin: 15px 0;
      }
      
      .alerta-info {
        background-color: #e8f4fd;
        border-left: 4px solid #4285f4;
        padding: 10px 15px;
        margin: 10px 0;
        color: #555;
      }
      
      .alerta-info i {
        color: #4285f4;
        margin-right: 5px;
      }
    `;
    document.head.appendChild(style);
  })();
  
  // Exportar o módulo para uso global
  if (typeof window.AppModulos === 'undefined') {
    window.AppModulos = {};
  }
  
  window.AppModulos.Admin = AdminModulo;
}); 