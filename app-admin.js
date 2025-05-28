// Módulo para administração do sistema
document.addEventListener('DOMContentLoaded', () => {
  // Módulo de Administração
  const AdminModulo = {
    // Variáveis locais do módulo
    dados: {
      usuarios: [],
      todasEquipes: []
    },
    
    // Controle de estado para evitar múltiplas execuções
    estado: {
      inicializado: false,
      carregandoDados: false,
      carregandoEquipes: false,
      carregandoUsuarios: false,
      carregandoEstatisticas: false
    },
    
    // Carregar dados administrativos
    async carregarDadosAdmin() {
      if (this.estado.carregandoDados) {
        console.log("🔥 Carregamento de dados já em andamento, ignorando nova solicitação");
        return;
      }
      
      try {
        this.estado.carregandoDados = true;
        console.log("🔥 CARREGANDO DADOS ADMINISTRATIVOS - DADOS REAIS DO FIREBASE");
        
        // Verificar se o Firebase está disponível antes de prosseguir
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("🔥 Firebase não está disponível ainda, aguardando inicialização...");
          
          // Mostrar indicador de carregamento
          const esconderLoading = AppModulos.UI.mostrarLoading('Aguardando inicialização do Firebase...');
          
          // Aguardar o Firebase ficar disponível
          await this.aguardarFirebaseDisponivel();
          
          // Esconder loading
          esconderLoading();
        }
        
        // Mostrar indicador de carregamento
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando dados reais do Firebase...');
        
        // Inicializar interface básica
        this.inicializarInterfaceAdmin();
        
        // Carregar equipes do Firebase
        try {
          console.log("🔥 Carregando equipes REAIS do Firebase...");
          await this.carregarEquipes();
          console.log("🔥 Equipes REAIS carregadas com sucesso");
        } catch (erroEquipes) {
          console.error("🔥 Erro ao carregar equipes:", erroEquipes);
        }
        
        // Carregar usuários do Firebase
        try {
          console.log("🔥 Carregando usuários REAIS do Firebase...");
          await this.carregarUsuarios();
          console.log("🔥 Usuários REAIS carregados com sucesso");
        } catch (erroUsuarios) {
          console.error("🔥 Erro ao carregar usuários:", erroUsuarios);
        }
        
        // Carregar estatísticas reais do sistema
        try {
          console.log("🔥 Carregando estatísticas REAIS do sistema...");
          await this.carregarEstatisticasReais();
          console.log("🔥 Estatísticas REAIS carregadas com sucesso");
        } catch (erroEstatisticas) {
          console.error("🔥 Erro ao carregar estatísticas:", erroEstatisticas);
        }
        
        // Esconder loading
        esconderLoading();
        
        console.log("🔥 Dados administrativos REAIS carregados com sucesso");
        return { sucesso: true, mensagem: "Dados administrativos reais carregados com sucesso" };
      } catch (error) {
        console.error("🔥 Erro ao carregar dados administrativos:", error);
        AppVisita.Utils.exibirMensagem("Erro ao carregar dados administrativos");
        throw error;
      } finally {
        this.estado.carregandoDados = false;
      }
    },
    
    // Aguardar Firebase ficar disponível
    async aguardarFirebaseDisponivel() {
      return new Promise((resolve, reject) => {
        if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
          console.log("🔥 Firebase já está disponível");
          resolve();
          return;
        }
        
        console.log("🔥 Aguardando evento firebase-ready...");
        
        const firebaseReadyListener = (event) => {
          console.log("🔥 Evento firebase-ready recebido", event?.detail);
          document.removeEventListener('firebase-ready', firebaseReadyListener);
          
          setTimeout(() => {
            if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
              console.log("🔥 Firebase confirmado como disponível após evento");
              resolve();
            } else {
              console.error("🔥 Firebase ainda não está disponível mesmo após evento firebase-ready");
              reject(new Error("Firebase não inicializou corretamente"));
            }
          }, 500);
        };
        
        document.addEventListener('firebase-ready', firebaseReadyListener);
        
        setTimeout(() => {
          document.removeEventListener('firebase-ready', firebaseReadyListener);
          
          if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
            console.log("🔥 Firebase disponível por timeout");
            resolve();
          } else {
            console.error("🔥 Timeout aguardando Firebase ficar disponível");
            reject(new Error("Timeout aguardando Firebase"));
          }
        }, 15000);
      });
    },
    
    // Inicializar interface admin
    inicializarInterfaceAdmin() {
      console.log("🔥 INICIALIZANDO INTERFACE ADMIN - SEM DADOS FICTÍCIOS");
      
      // Configurar abas de navegação
      this.configurarAbasPainelAdmin();
      
      // Configurar eventos para os botões reais
      this.configurarBotoesAdmin();
      
      // NÃO chamar preencherDadosFicticios - APENAS DADOS REAIS
      console.log("🔥 Interface admin inicializada SEM dados fictícios");
      
      return true;
    },
    
    // Configurar botões administrativos reais
    configurarBotoesAdmin() {
      console.log("🔥 Configurando botões administrativos reais");
      
      // Aguardar um pouco para garantir que o DOM esteja pronto
      setTimeout(() => {
        // Configurar botão Nova Equipe
        const btnNovaEquipe = document.getElementById('btn-nova-equipe');
        console.log("🔥 Procurando botão Nova Equipe:", btnNovaEquipe);
        
        if (btnNovaEquipe) {
          console.log("🔥 Botão Nova Equipe encontrado, configurando evento");
          
          // Remover eventos antigos
          const btnClone = btnNovaEquipe.cloneNode(true);
          if (btnNovaEquipe.parentNode) {
            btnNovaEquipe.parentNode.replaceChild(btnClone, btnNovaEquipe);
            console.log("🔥 Botão Nova Equipe clonado e substituído");
          }
          
          // Adicionar novo evento
          btnClone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔥 Botão Nova Equipe clicado - iniciando abertura do modal");
            
            try {
              this.abrirModalNovaEquipe();
            } catch (error) {
              console.error("🔥 Erro ao abrir modal de nova equipe:", error);
              alert("Erro ao abrir formulário de nova equipe: " + error.message);
            }
          });
          
          console.log("🔥 Evento do botão Nova Equipe configurado com sucesso");
        } else {
          console.error("🔥 Botão Nova Equipe não encontrado no DOM");
          
          // Tentar encontrar o botão em outros locais
          const botoesNovaEquipe = document.querySelectorAll('[id*="nova-equipe"], [class*="nova-equipe"]');
          console.log("🔥 Botões similares encontrados:", botoesNovaEquipe);
          
          // Verificar se a aba de equipes está ativa
          const abaEquipes = document.getElementById('tab-equipes');
          const conteudoEquipes = document.getElementById('tab-content-equipes');
          console.log("🔥 Aba de equipes:", abaEquipes);
          console.log("🔥 Conteúdo de equipes:", conteudoEquipes);
          
          if (conteudoEquipes) {
            console.log("🔥 Conteúdo da aba equipes:", conteudoEquipes.innerHTML.substring(0, 200));
          }
        }
        
        // Adicionar botão para recarregar equipes
        const containerBotoesEquipe = document.querySelector('.admin-header-actions');
        console.log("🔥 Container de botões de equipe:", containerBotoesEquipe);
        
        if (containerBotoesEquipe) {
          let btnRecarregar = document.getElementById('btn-recarregar-equipes');
          
          if (!btnRecarregar) {
            btnRecarregar = document.createElement('button');
            btnRecarregar.id = 'btn-recarregar-equipes';
            btnRecarregar.className = 'btn btn-secondary';
            btnRecarregar.innerHTML = '<i class="fas fa-sync-alt"></i> Recarregar Equipes';
            containerBotoesEquipe.appendChild(btnRecarregar);
            console.log("🔥 Botão recarregar equipes criado");
          }
          
          btnRecarregar.addEventListener('click', async () => {
            console.log("🔥 Botão recarregar equipes clicado");
            try {
              const esconderLoading = AppModulos.UI.mostrarLoading('Recarregando equipes...');
              await this.carregarEquipes();
              esconderLoading();
              AppModulos.UI.mostrarNotificacao('Equipes recarregadas com sucesso!', 'sucesso');
            } catch (error) {
              console.error("🔥 Erro ao recarregar equipes:", error);
              AppModulos.UI.mostrarNotificacao('Erro ao recarregar equipes.', 'erro');
            }
          });
        } else {
          console.error("🔥 Container de botões de equipe não encontrado");
        }
        
      }, 500); // Aguardar 500ms para garantir que o DOM esteja pronto
    },
    
    // Configurar abas do painel administrativo
    configurarAbasPainelAdmin() {
      const tabs = document.querySelectorAll('.admin-tab');
      const tabContents = document.querySelectorAll('.admin-tab-content');
      
      if (tabs.length === 0 || tabContents.length === 0) {
        console.log("🔥 Elementos de abas não encontrados");
        return;
      }
      
      const self = this;
      let ultimaAbaClicada = null;
      let timeoutAba = null;
      
      tabs.forEach(tab => {
        // Remover eventos antigos
        tab.removeEventListener('click', tab._adminClickHandler);
        
        // Criar novo handler com debounce
        tab._adminClickHandler = async function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const abaId = this.id;
          
          // Evitar cliques múltiplos na mesma aba
          if (ultimaAbaClicada === abaId) {
            console.log(`🔥 Clique duplicado na aba ${abaId} ignorado`);
            return;
          }
          
          ultimaAbaClicada = abaId;
          
          // Limpar timeout anterior
          if (timeoutAba) {
            clearTimeout(timeoutAba);
          }
          
          // Debounce para evitar múltiplas execuções
          timeoutAba = setTimeout(async () => {
            try {
              // Remover classe active de todas as tabs
              tabs.forEach(t => t.classList.remove('active'));
              tabContents.forEach(c => c.classList.remove('active'));
              
              // Adicionar classe active à tab clicada
              this.classList.add('active');
              
              // Mostrar conteúdo correspondente
              const targetId = abaId.replace('tab-', 'tab-content-');
              const targetContent = document.getElementById(targetId);
              if (targetContent) {
                targetContent.classList.add('active');
              }
              
              // Carregar dados específicos da aba
              if (abaId === 'tab-equipes') {
                console.log("🔥 Aba de equipes selecionada, carregando equipes REAIS...");
                try {
                  await self.carregarEquipes();
                } catch (error) {
                  console.error("🔥 Erro ao carregar equipes na troca de aba:", error);
                }
              } else if (abaId === 'tab-estatisticas') {
                console.log("🔥 Aba de estatísticas selecionada, carregando dados REAIS...");
                try {
                  await self.carregarEstatisticasReais();
                } catch (error) {
                  console.error("🔥 Erro ao carregar estatísticas na troca de aba:", error);
                }
              } else if (abaId === 'tab-usuarios') {
                console.log("🔥 Aba de usuários selecionada, carregando usuários REAIS...");
                try {
                  await self.carregarUsuarios();
                } catch (error) {
                  console.error("🔥 Erro ao carregar usuários na troca de aba:", error);
                }
              }
            } catch (error) {
              console.error("🔥 Erro ao processar clique na aba:", error);
            } finally {
              // Resetar controle após um tempo
              setTimeout(() => {
                ultimaAbaClicada = null;
              }, 1000);
            }
          }, 300); // Debounce de 300ms
        };
        
        // Adicionar novo evento
        tab.addEventListener('click', tab._adminClickHandler);
      });
    },
    
    // Carregar usuários REAIS do Firebase
    async carregarUsuarios() {
      if (this.estado.carregandoUsuarios) {
        console.log("🔥 Carregamento de usuários já em andamento, ignorando nova solicitação");
        return this.dados.usuarios;
      }
      
      try {
        this.estado.carregandoUsuarios = true;
        console.log("🔥 CARREGANDO USUÁRIOS REAIS DO FIREBASE");
        
        // Verificar se o Firebase está inicializado
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("🔥 Firebase não está disponível, aguardando...");
          await this.aguardarFirebaseDisponivel();
        }
        
        // Verificar se o serviço de usuários existe
        if (!AppVisita?.Firebase?.Usuarios) {
          console.error("🔥 Serviço AppVisita.Firebase.Usuarios não está disponível");
          console.log("🔥 Estrutura AppVisita:", AppVisita);
          console.log("🔥 Estrutura AppVisita.Firebase:", AppVisita?.Firebase);
          throw new Error("Serviço de usuários não está disponível");
        }
        
        console.log("🔥 Chamando AppVisita.Firebase.Usuarios.obterTodos()");
        
        // BUSCAR DADOS REAIS DO FIREBASE
        this.dados.usuarios = await AppVisita.Firebase.Usuarios.obterTodos();
        
        console.log(`🔥 ${this.dados.usuarios.length} usuários REAIS encontrados do Firebase:`);
        console.log("🔥 Dados dos usuários:", this.dados.usuarios);
        
        // Configurar estrutura se necessário
        this.criarEstruturaCompletaUsuarios();
        
        // Configurar filtros de usuários
        this.configurarFiltrosUsuarios();
        
        // Mostrar lista REAL de usuários
        this.renderizarListaUsuarios(this.dados.usuarios);
        
        return this.dados.usuarios;
      } catch (error) {
        console.error("🔥 ERRO ao carregar usuários REAIS:", error);
        
        // Inicializar array vazio para evitar erros adicionais
        this.dados.usuarios = [];
        
        // Mostrar erro na interface
        const listaUsuarios = document.getElementById('lista-usuarios');
        if (listaUsuarios) {
          listaUsuarios.innerHTML = `
            <div class="erro-carregamento">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Erro ao carregar usuários</h3>
              <p>Erro: ${error.message}</p>
              <button onclick="window.AppModulos.Admin.carregarUsuarios()" class="btn btn-primary">
                Tentar novamente
              </button>
            </div>
          `;
        }
        
        throw error;
      } finally {
        this.estado.carregandoUsuarios = false;
      }
    },
    
    // Configurar filtros de usuários
    configurarFiltrosUsuarios() {
      console.log("🔥 CONFIGURANDO FILTROS DE USUÁRIOS");
      
      if (this._tentandoConfigurarFiltros) {
        console.warn("🔥 Já está tentando configurar filtros, evitando loop infinito");
        return;
      }
      
      const filtroTodos = document.getElementById('filtro-todos');
      const filtroPendentes = document.getElementById('filtro-pendentes');
      const filtroAprovados = document.getElementById('filtro-aprovados');
      
      if (!filtroTodos || !filtroPendentes || !filtroAprovados) {
        console.log("🔥 Elementos de filtro não encontrados, criando estrutura HTML");
        
        this._tentandoConfigurarFiltros = true;
        
        try {
          const sucesso = this.criarEstruturaCompletaUsuarios();
          
          if (sucesso) {
            console.log("🔥 Estrutura de usuários criada com sucesso");
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
      this._tentandoConfigurarFiltros = false;
      
      // Remover eventos antigos clonando elementos
      const novos = {
        todos: filtroTodos.cloneNode(true),
        pendentes: filtroPendentes.cloneNode(true),
        aprovados: filtroAprovados.cloneNode(true)
      };
      
      if (filtroTodos.parentNode) filtroTodos.parentNode.replaceChild(novos.todos, filtroTodos);
      if (filtroPendentes.parentNode) filtroPendentes.parentNode.replaceChild(novos.pendentes, filtroPendentes);
      if (filtroAprovados.parentNode) filtroAprovados.parentNode.replaceChild(novos.aprovados, filtroAprovados);
      
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
    
    // Renderizar lista de usuários REAIS
    renderizarListaUsuarios(usuarios) {
      console.log(`🔥 RENDERIZANDO ${usuarios.length} usuários REAIS`);
      console.log("🔥 Dados dos usuários a serem renderizados:", usuarios);
      
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
            <p>Não há usuários cadastrados no sistema ou houve um erro ao carregar.</p>
            <button onclick="window.AppModulos.Admin.carregarUsuarios()" class="btn btn-primary">
              <i class="fas fa-sync-alt"></i> Recarregar usuários
            </button>
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
        
        if (a.dataCriacao && b.dataCriacao) {
          return b.dataCriacao.seconds - a.dataCriacao.seconds;
        }
        return 0;
      });
      
      // Renderizar cada usuário REAL
      usuariosOrdenados.forEach((user, index) => {
        console.log(`🔥 Renderizando usuário ${index + 1}:`, user);
        
        const isPendente = user.status === 'pendente' || !user.aprovado;
        const userItem = document.createElement('div');
        userItem.classList.add('usuario-item');
        if (isPendente) userItem.classList.add('usuario-pendente');
        
        const dataFormatada = user.dataCriacao ? 
          AppVisita.Utils.formatarData(user.dataCriacao) : 
          'Data não disponível';
        
        const temDadosComplementares = user.dadosComplementaresPreenchidos === true;
        
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
      
      console.log(`🔥 ${usuarios.length} usuários REAIS renderizados com sucesso`);
    },
    
    // Atualizar estatísticas de usuários REAIS
    atualizarEstatisticasUsuarios() {
      if (!this.dados.usuarios) return;
      
      const total = this.dados.usuarios.length;
      const pendentes = this.dados.usuarios.filter(u => u.status === 'pendente' || !u.aprovado).length;
      const aprovados = total - pendentes;
      
      console.log(`🔥 Estatísticas REAIS: ${total} total, ${pendentes} pendentes, ${aprovados} aprovados`);
      
      // Atualizar contadores na nova estrutura
      const statTotal = document.getElementById('stat-total-usuarios');
      const statPendentes = document.getElementById('stat-usuarios-pendentes');
      const statAprovados = document.getElementById('stat-usuarios-aprovados');
      
      if (statTotal) statTotal.textContent = total;
      if (statPendentes) statPendentes.textContent = pendentes;
      if (statAprovados) statAprovados.textContent = aprovados;
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
            console.error("🔥 Erro ao aprovar usuário:", error);
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
    
    // Criar estrutura HTML completa para usuários
    criarEstruturaCompletaUsuarios() {
      console.log("🔥 CRIANDO ESTRUTURA COMPLETA DE USUÁRIOS");
      
      try {
        const adminSection = document.getElementById('admin-section');
        if (!adminSection) {
          console.error("🔥 Seção admin não encontrada");
          return false;
        }
        
        let containerUsuarios = document.getElementById('admin-usuarios-container');
        
        if (!containerUsuarios) {
          console.log("🔥 Criando container de usuários");
          
          containerUsuarios = document.createElement('div');
          containerUsuarios.id = 'admin-usuarios-container';
          containerUsuarios.className = 'admin-tab-content';
          
          const dashboardContainer = document.getElementById('admin-dashboard-container');
          if (dashboardContainer && dashboardContainer.nextSibling) {
            adminSection.insertBefore(containerUsuarios, dashboardContainer.nextSibling);
          } else {
            adminSection.appendChild(containerUsuarios);
          }
        }
        
        containerUsuarios.innerHTML = `
          <div class="admin-header">
            <h2><i class="fas fa-users"></i> Gerenciamento de Usuários (Dados Reais)</h2>
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
              <i class="fas fa-spinner fa-spin"></i> Carregando usuários reais do Firebase...
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
      
      const botoes = [
        {
          texto: 'Fechar',
          tipo: 'secondary'
        }
      ];
      
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
              console.error("🔥 Erro ao aprovar usuário:", error);
              AppModulos.UI.mostrarNotificacao('Erro ao aprovar usuário', 'erro');
            }
          }
        });
      }
      
      AppModulos.UI.exibirModal(
        `Detalhes do Usuário`, 
        conteudoModal,
        botoes
      );
    },
    
    // Carregar equipes
    async carregarEquipes() {
      if (this.estado.carregandoEquipes) {
        console.log("🔥 Carregamento de equipes já em andamento, ignorando nova solicitação");
        return this.dados.todasEquipes;
      }
      
      try {
        this.estado.carregandoEquipes = true;
        console.log("🔥 Iniciando carregamento de equipes REAIS");
        
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando equipes...');
        
        try {
          const todasEquipesNaoDB = await AppVisita.Firebase.Equipes.obterTodas();
          console.log(`🔥 ${todasEquipesNaoDB.length} equipes encontradas no banco de dados`);
          
          this.dados.todasEquipes = todasEquipesNaoDB.filter(equipe => {
            const naoExcluida = !(equipe.excluido === true || equipe.status === 'excluido');
            if (!naoExcluida) {
              console.log(`🔥 Equipe "${equipe.nome}" (ID: ${equipe.id}) está marcada como excluída e será filtrada`);
            }
            return naoExcluida;
          });
          
          const totalEquipesAtivas = this.dados.todasEquipes.length;
          console.log(`🔥 ${totalEquipesAtivas} equipes ativas após filtrar excluídas`);
          
          const contadorEquipes = document.querySelector('#total-equipes .stat-number, #total-equipes');
          if (contadorEquipes) {
            contadorEquipes.textContent = totalEquipesAtivas;
          }
          
          this.renderizarListaEquipes();
          
          return this.dados.todasEquipes;
        } catch (error) {
          console.error("🔥 Erro ao buscar equipes do Firebase:", error);
          throw error;
        } finally {
          esconderLoading();
        }
      } catch (error) {
        console.error("🔥 Erro ao carregar equipes:", error);
        AppModulos.UI.mostrarNotificacao('Erro ao carregar equipes. Tente novamente.', 'erro');
        return [];
      } finally {
        this.estado.carregandoEquipes = false;
      }
    },
    
    // Renderizar lista de equipes
    renderizarListaEquipes() {
      const listaEquipes = document.getElementById('lista-equipes');
      if (!listaEquipes) {
        console.log("🔥 Elemento lista-equipes não encontrado na DOM");
        return;
      }
      
      listaEquipes.innerHTML = '';
      
      if (!this.dados.todasEquipes) {
        this.dados.todasEquipes = [];
        console.log("🔥 Inicializando array de equipes vazio");
      }
      
      if (this.dados.todasEquipes.length === 0) {
        listaEquipes.innerHTML = '<p class="sem-equipes">Nenhuma equipe médica cadastrada ainda.</p>';
        return;
      }
      
      try {
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
        
        this.adicionarEventosBotoesEquipe();
      } catch (error) {
        console.error("🔥 Erro ao renderizar lista de equipes:", error);
        listaEquipes.innerHTML = '<p class="erro-lista">Erro ao exibir lista de equipes. Tente recarregar a página.</p>';
      }
    },
    
    // Adicionar eventos aos botões de equipe
    adicionarEventosBotoesEquipe() {
      console.log("🔥 CONFIGURANDO EVENTOS para botões de equipes");
      
      const self = this;
      
      try {
        const botoesEditar = document.querySelectorAll('.btn-editar');
        console.log(`🔥 Encontrados ${botoesEditar.length} botões de edição`);
        
        botoesEditar.forEach((btn, index) => {
          console.log(`🔥 Configurando botão editar ${index + 1}`);
          
          btn.removeEventListener('click', self._handleEditClick);
          
          const handleClick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const equipeId = this.dataset.id;
            console.log(`🔥 Botão editar clicado para equipe ID: ${equipeId}`);
            self.abrirModalEditarEquipe(equipeId);
          };
          
          btn.addEventListener('click', handleClick);
        });
        
        const botoesExcluir = document.querySelectorAll('.btn-excluir');
        console.log(`🔥 Encontrados ${botoesExcluir.length} botões de exclusão`);
        
        botoesExcluir.forEach((btn, index) => {
          console.log(`🔥 Configurando botão excluir ${index + 1}`);
          
          btn.removeEventListener('click', self._handleDeleteClick);
          
          const handleClick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            try {
              const equipeId = this.dataset.id;
              console.log(`🔥 BOTÃO EXCLUIR CLICADO para equipe ID: ${equipeId}`);
              
              if (!equipeId) {
                console.error("🔥 ID da equipe não encontrado no botão de exclusão");
                alert("Erro: ID da equipe não encontrado");
                return;
              }
              
              const equipe = self.dados.todasEquipes.find(eq => eq.id === equipeId);
              
              if (!equipe) {
                console.error(`🔥 Equipe com ID ${equipeId} não encontrada`);
                alert('Equipe não encontrada');
                return;
              }
              
              console.log(`🔥 EQUIPE ENCONTRADA:`, equipe);
              
              self.confirmarExclusaoEquipe(equipe);
            } catch (error) {
              console.error("🔥 ERRO ao processar clique no botão excluir:", error);
              alert("Erro ao processar exclusão: " + error.message);
            }
          };
          
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
      
      const confirmacao = confirm(`Tem certeza que deseja excluir a equipe "${equipe.nome}"? Esta ação não pode ser desfeita.`);
      
      if (confirmacao) {
        console.log(`🔥 Confirmação recebida, iniciando exclusão da equipe: ${equipe.nome}`);
        
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
      
      try {
        console.log("🔥 Mostrando loading...");
        const esconderLoading = AppModulos.UI.mostrarLoading('Excluindo equipe...');
        
        if (!window.AppVisita?.Firebase?.Equipes) {
          console.error("🔥 Serviços necessários não disponíveis");
          esconderLoading();
          AppModulos.UI.mostrarNotificacao('Erro: Serviços necessários não disponíveis', 'erro');
          return;
        }
        
        if (typeof AppVisita.Firebase.Equipes.excluirEquipe !== 'function') {
          console.error("🔥 Método excluirEquipe não encontrado");
          esconderLoading();
          AppModulos.UI.mostrarNotificacao('Erro: Método de exclusão não encontrado', 'erro');
          return;
        }
        
        console.log(`🔥 Chamando método excluirEquipe para ID: ${equipe.id}`);
        const sucesso = await AppVisita.Firebase.Equipes.excluirEquipe(equipe.id);
        console.log(`🔥 Resultado da exclusão: ${sucesso ? 'SUCESSO' : 'FALHA'}`);
        
        esconderLoading();
        
        if (sucesso) {
          console.log(`🔥 Equipe "${equipe.nome}" excluída com sucesso`);
          
          this.dados.todasEquipes = this.dados.todasEquipes.filter(e => e.id !== equipe.id);
          console.log(`🔥 Equipe removida do array local. Restam: ${this.dados.todasEquipes.length} equipes`);
          
          this.renderizarListaEquipes();
          console.log("🔥 Interface atualizada");
          
          AppModulos.UI.mostrarNotificacao('Equipe excluída com sucesso!', 'sucesso');
          
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
        
        if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
          AppModulos.UI.mostrarNotificacao('Erro de permissão: Você não tem autorização para excluir equipes.', 'erro');
        } else if (error.code === 'not-found' || (error.message && error.message.includes('não encontrada'))) {
          AppModulos.UI.mostrarNotificacao('Equipe não encontrada. Ela pode ter sido excluída por outro usuário.', 'erro');
        } else {
          AppModulos.UI.mostrarNotificacao('Erro ao excluir equipe: ' + (error.message || 'Erro desconhecido'), 'erro');
        }
        
        try {
          await this.carregarEquipes();
        } catch (reloadError) {
          console.error("🔥 Erro ao recarregar equipes após erro de exclusão:", reloadError);
        }
      }
    },
    
    // Abrir modal para criar nova equipe
    async abrirModalNovaEquipe() {
      console.log("🔥 INICIANDO abertura do modal para criar nova equipe");
      
      try {
        // Verificar se AppModulos.UI está disponível
        if (!window.AppModulos || !window.AppModulos.UI) {
          console.error("🔥 AppModulos.UI não está disponível");
          alert("Erro: Sistema de interface não está disponível. Recarregue a página.");
          return;
        }
        
        console.log("🔥 AppModulos.UI disponível, procurando elementos do modal");
        
        const modalEquipe = document.getElementById('modal-equipe');
        const formEquipe = document.getElementById('form-equipe');
        const nomeEquipeInput = document.getElementById('nome-equipe');
        const descricaoEquipeInput = document.getElementById('descricao-equipe');
        const equipeIdInput = document.getElementById('equipe-id');
        
        console.log("🔥 Elementos encontrados:", {
          modalEquipe: !!modalEquipe,
          formEquipe: !!formEquipe,
          nomeEquipeInput: !!nomeEquipeInput,
          descricaoEquipeInput: !!descricaoEquipeInput,
          equipeIdInput: !!equipeIdInput
        });
        
        if (!modalEquipe || !formEquipe) {
          console.error("🔥 Elementos essenciais do modal de equipe não encontrados");
          console.log("🔥 Modal equipe:", modalEquipe);
          console.log("🔥 Form equipe:", formEquipe);
          
          // Tentar encontrar elementos similares
          const modaisEncontrados = document.querySelectorAll('[id*="modal"], [class*="modal"]');
          console.log("🔥 Modais encontrados no DOM:", modaisEncontrados);
          
          AppModulos.UI.mostrarNotificacao('Erro: Formulário de equipe não encontrado. Recarregue a página.', 'erro');
          return;
        }
        
        console.log("🔥 Resetando formulário");
        formEquipe.reset();
        
        if (equipeIdInput) equipeIdInput.value = '';
        if (nomeEquipeInput) nomeEquipeInput.value = '';
        if (descricaoEquipeInput) descricaoEquipeInput.value = '';
        
        const modalTituloEquipe = document.getElementById('modal-titulo-equipe');
        if (modalTituloEquipe) {
          modalTituloEquipe.textContent = 'Nova Equipe';
          console.log("🔥 Título do modal definido");
        }
        
        console.log("🔥 Iniciando carregamento de médicos disponíveis");
        
        try {
          const esconderLoading = AppModulos.UI.mostrarLoading('Carregando médicos disponíveis...');
          
          await this.carregarMedicosNoModal();
          
          esconderLoading();
          console.log("🔥 Médicos carregados com sucesso");
          
        } catch (errorMedicos) {
          console.error("🔥 Erro ao carregar médicos:", errorMedicos);
          AppModulos.UI.mostrarNotificacao('Erro ao carregar médicos disponíveis: ' + errorMedicos.message, 'erro');
          return;
        }
        
        console.log("🔥 Aplicando estilos específicos ao modal");
        
        // Remover qualquer CSS conflitante
        modalEquipe.classList.remove('hidden', 'invisible', 'd-none');
        modalEquipe.removeAttribute('hidden');
        
        // Forçar remoção de qualquer estilo inline que possa estar escondendo o modal
        modalEquipe.style.removeProperty('visibility');
        modalEquipe.style.removeProperty('opacity');
        
        // Aplicar estilos específicos para garantir que o modal funcione
        modalEquipe.style.cssText = `
          display: block !important;
          position: fixed !important;
          z-index: 99999 !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background-color: rgba(0,0,0,0.8) !important;
          overflow: auto !important;
          backdrop-filter: blur(2px) !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
        
        const modalContent = modalEquipe.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.cssText = `
            background-color: #fefefe !important;
            margin: 2% auto !important;
            padding: 30px !important;
            border: 1px solid #888 !important;
            border-radius: 12px !important;
            width: 95% !important;
            max-width: 700px !important;
            position: relative !important;
            z-index: 100000 !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            animation: modalFadeIn 0.3s ease-out !important;
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
          `;
        }
        
        // Adicionar animação CSS se não existir
        if (!document.getElementById('modal-animations')) {
          const styleSheet = document.createElement('style');
          styleSheet.id = 'modal-animations';
          styleSheet.textContent = `
            @keyframes modalFadeIn {
              from {
                opacity: 0;
                transform: translateY(-50px) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            /* Forçar estilos do modal */
            #modal-equipe {
              display: block !important;
              position: fixed !important;
              z-index: 99999 !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            #modal-equipe .modal-content {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
          `;
          document.head.appendChild(styleSheet);
        }
        
        // Garantir que o modal esteja no final do body para evitar problemas de z-index
        if (modalEquipe.parentNode !== document.body) {
          console.log("🔥 Movendo modal para o final do body");
          document.body.appendChild(modalEquipe);
        }
        
        // Forçar reflow para garantir que os estilos sejam aplicados
        modalEquipe.offsetHeight;
        
        console.log("🔥 Configurando eventos de fechamento do modal");
        
        // Configurar eventos de fechamento
        const closeButtons = modalEquipe.querySelectorAll('.close-button');
        closeButtons.forEach(btn => {
          btn.onclick = () => {
            console.log("🔥 Botão fechar clicado");
            modalEquipe.style.display = 'none';
          };
        });
        
        // Fechar ao clicar fora do modal
        modalEquipe.onclick = (event) => {
          if (event.target === modalEquipe) {
            console.log("🔥 Clique fora do modal - fechando");
            modalEquipe.style.display = 'none';
          }
        };
        
        // Verificar se o modal está visível
        setTimeout(() => {
          const estiloComputado = window.getComputedStyle(modalEquipe);
          console.log("🔥 Modal visível?", estiloComputado.display !== 'none');
          console.log("🔥 Z-index do modal:", estiloComputado.zIndex);
          console.log("🔥 Posição do modal:", estiloComputado.position);
          console.log("🔥 Opacidade do modal:", estiloComputado.opacity);
          console.log("🔥 Background do modal:", estiloComputado.backgroundColor);
          
          // Verificar se o modal está realmente na frente
          const elementoNoTopo = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
          console.log("🔥 Elemento no centro da tela:", elementoNoTopo);
          
          // Se o modal não estiver visível, forçar
          if (estiloComputado.display === 'none' || estiloComputado.opacity === '0') {
            console.log("🔥 FORÇANDO VISIBILIDADE DO MODAL");
            modalEquipe.style.display = 'block';
            modalEquipe.style.opacity = '1';
            modalEquipe.style.visibility = 'visible';
          }
          
          // Focar no primeiro input
          if (nomeEquipeInput) {
            nomeEquipeInput.focus();
            console.log("🔥 Foco definido no campo nome");
          }
          
          // Verificação adicional após 1 segundo
          setTimeout(() => {
            const estiloFinal = window.getComputedStyle(modalEquipe);
            console.log("🔥 VERIFICAÇÃO FINAL - Modal visível?", estiloFinal.display !== 'none');
            console.log("🔥 VERIFICAÇÃO FINAL - Z-index:", estiloFinal.zIndex);
            console.log("🔥 VERIFICAÇÃO FINAL - Opacidade:", estiloFinal.opacity);
            
            if (estiloFinal.display === 'none') {
              console.error("🔥 ERRO: Modal ainda não está visível após todas as correções!");
              alert("ATENÇÃO: O modal não está aparecendo. Verifique o console para mais detalhes.");
            } else {
              console.log("🔥 ✅ SUCESSO: Modal está visível e funcionando!");
            }
          }, 1000);
        }, 100);
        
        console.log("🔥 Modal de nova equipe aberto com sucesso");
        
        // Função de teste para verificar se o modal está funcionando
        window.testarModal = function() {
          console.log("🔥 TESTE: Verificando modal");
          console.log("🔥 TESTE: Modal existe?", !!modalEquipe);
          console.log("🔥 TESTE: Modal display:", modalEquipe.style.display);
          console.log("🔥 TESTE: Modal z-index:", modalEquipe.style.zIndex);
          
          // Tentar mostrar um alert simples para verificar se há algum bloqueio
          alert("Modal deveria estar visível agora. Você consegue vê-lo?");
        };
        
        console.log("🔥 Função de teste criada: window.testarModal()");
        
      } catch (error) {
        console.error("🔥 ERRO GERAL ao abrir modal de nova equipe:", error);
        console.error("🔥 Stack trace:", error.stack);
        
        if (window.AppModulos && window.AppModulos.UI) {
          AppModulos.UI.mostrarNotificacao('Erro ao abrir formulário de equipe: ' + error.message, 'erro');
        } else {
          alert('Erro ao abrir formulário de equipe: ' + error.message);
        }
      }
    },
    
    // Abrir modal para editar equipe existente
    async abrirModalEditarEquipe(equipeId) {
      try {
        const esconderLoading = AppModulos.UI.mostrarLoading('Carregando dados da equipe...');
        
        const equipe = this.dados.todasEquipes.find(e => e.id === equipeId);
        
        if (!equipe) {
          esconderLoading();
          AppModulos.UI.mostrarNotificacao('Equipe não encontrada!', 'erro');
          return;
        }
        
        const modalEquipe = document.getElementById('modal-equipe');
        const nomeEquipeInput = document.getElementById('nome-equipe');
        const descricaoEquipeInput = document.getElementById('descricao-equipe');
        const equipeIdInput = document.getElementById('equipe-id');
        
        if (!modalEquipe) {
          esconderLoading();
          console.error("🔥 Modal de equipe não encontrado");
          return;
        }
        
        nomeEquipeInput.value = equipe.nome || '';
        descricaoEquipeInput.value = equipe.descricao || '';
        equipeIdInput.value = equipeId;
        
        const modalTituloEquipe = document.getElementById('modal-titulo-equipe');
        if (modalTituloEquipe) {
          modalTituloEquipe.textContent = 'Editar Equipe';
        }
        
        await this.carregarMedicosNoModal(equipe.membros || []);
        
        esconderLoading();
        
        modalEquipe.style.display = 'block';
      } catch (error) {
        console.error("🔥 Erro ao abrir modal de edição:", error);
        AppModulos.UI.mostrarNotificacao('Erro ao carregar dados da equipe', 'erro');
      }
    },
    
    // Carregar médicos aprovados no modal
    async carregarMedicosNoModal(membrosSelecionados = []) {
      try {
        const selecaoMedicos = document.getElementById('selecao-medicos');
        if (!selecaoMedicos) {
          console.error("🔥 Elemento selecao-medicos não encontrado");
          return;
        }
        
        console.log("🔥 Carregando médicos no modal...");
        selecaoMedicos.innerHTML = '<p class="carregando-info">Carregando médicos...</p>';
        
        const medicos = await this.carregarMedicosAprovados();
        console.log(`🔥 ${medicos.length} médicos aprovados encontrados`);
        
        if (medicos.length === 0) {
          selecaoMedicos.innerHTML = '<p class="sem-medicos">Nenhum médico aprovado encontrado.</p>';
          return;
        }
        
        selecaoMedicos.innerHTML = '';
        
        // Aplicar estilos ao container de seleção
        selecaoMedicos.style.cssText = `
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          background: #f9f9f9;
        `;
        
        medicos.forEach((medico, index) => {
          console.log(`🔥 Adicionando médico ao modal: ${medico.email} (ID: ${medico.id})`);
          
          const medicoItem = document.createElement('div');
          medicoItem.className = 'medico-item';
          medicoItem.dataset.id = medico.id;
          
          const estaSelecionado = membrosSelecionados.includes(medico.id);
          if (estaSelecionado) {
            medicoItem.classList.add('selecionado');
            console.log(`🔥 Médico ${medico.email} pré-selecionado`);
          }
          
          // Aplicar estilos específicos ao item
          medicoItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            border: 2px solid ${estaSelecionado ? '#28a745' : '#ddd'};
            border-radius: 6px;
            background: ${estaSelecionado ? '#e8f5e8' : '#fff'};
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
          `;
          
          medicoItem.innerHTML = `
            <span class="medico-email" style="font-weight: 500; color: #333;">${medico.email}</span>
            <button type="button" class="btn-toggle-medico" style="
              padding: 6px 12px;
              border: none;
              border-radius: 4px;
              background: ${estaSelecionado ? '#dc3545' : '#28a745'};
              color: white;
              cursor: pointer;
              font-size: 12px;
              transition: background 0.3s ease;
            ">
              <i class="fas ${estaSelecionado ? 'fa-user-minus' : 'fa-user-plus'}"></i>
              ${estaSelecionado ? 'Remover' : 'Adicionar'}
            </button>
          `;
          
          // Evento de clique no item
          const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🔥 Clique no médico: ${medico.email} (ID: ${medico.id})`);
            
            const jaEstaSelecionado = medicoItem.classList.contains('selecionado');
            
            if (jaEstaSelecionado) {
              medicoItem.classList.remove('selecionado');
              medicoItem.style.border = '2px solid #ddd';
              medicoItem.style.background = '#fff';
            } else {
              medicoItem.classList.add('selecionado');
              medicoItem.style.border = '2px solid #28a745';
              medicoItem.style.background = '#e8f5e8';
            }
            
            const novoEstado = medicoItem.classList.contains('selecionado');
            console.log(`🔥 Médico ${medico.email} ${novoEstado ? 'SELECIONADO' : 'DESMARCADO'}`);
            
            const btn = medicoItem.querySelector('.btn-toggle-medico');
            btn.style.background = novoEstado ? '#dc3545' : '#28a745';
            btn.innerHTML = `
              <i class="fas ${novoEstado ? 'fa-user-minus' : 'fa-user-plus'}"></i>
              ${novoEstado ? 'Remover' : 'Adicionar'}
            `;
          };
          
          // Adicionar eventos
          medicoItem.addEventListener('click', clickHandler);
          
          // Evento hover
          medicoItem.addEventListener('mouseenter', () => {
            if (!medicoItem.classList.contains('selecionado')) {
              medicoItem.style.background = '#f0f0f0';
            }
          });
          
          medicoItem.addEventListener('mouseleave', () => {
            if (!medicoItem.classList.contains('selecionado')) {
              medicoItem.style.background = '#fff';
            }
          });
          
          selecaoMedicos.appendChild(medicoItem);
        });
        
        console.log(`🔥 ${medicos.length} médicos adicionados ao modal com sucesso`);
        
      } catch (error) {
        console.error("🔥 Erro ao carregar médicos:", error);
        const selecaoMedicos = document.getElementById('selecao-medicos');
        if (selecaoMedicos) {
          selecaoMedicos.innerHTML = '<p class="erro-carregamento" style="color: red; padding: 10px;">Erro ao carregar médicos. Tente novamente.</p>';
        }
      }
    },
    
    // Carregar médicos aprovados
    async carregarMedicosAprovados() {
      try {
        if (!this.dados.usuarios || this.dados.usuarios.length === 0) {
          console.log("🔥 Buscando usuários do Firestore para o modal de equipe");
          
          try {
            const usersSnapshot = await db.collection('usuarios')
              .where('aprovado', '==', true)
              .get();
              
            this.dados.usuarios = usersSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
            
            console.log(`🔥 ${this.dados.usuarios.length} usuários carregados do Firestore`);
          } catch (error) {
            console.error("🔥 Erro ao buscar usuários do Firestore:", error);
            this.dados.usuarios = [];
          }
        }
        
        const medicosAprovados = this.dados.usuarios
          .filter(user => 
            (user.aprovado === true || user.status === 'aprovado') && 
            user.email !== window.ADMIN_EMAIL
          );
        
        console.log(`🔥 ${medicosAprovados.length} médicos aprovados encontrados`);
        return medicosAprovados;
      } catch (error) {
        console.error("🔥 Erro ao carregar médicos aprovados:", error);
        return [];
      }
    },
    
    // Inicializar módulo
    inicializar() {
      console.log("🔥 INICIALIZANDO MÓDULO ADMIN - DADOS REAIS APENAS");
      
      if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
        console.log("🔥 Firebase já está disponível, carregando dados REAIS imediatamente");
        this.carregarDadosAdmin().catch(error => {
          console.error("🔥 Erro ao carregar dados administrativos na inicialização:", error);
        });
      } else {
        console.log("🔥 Firebase não está disponível ainda, aguardando evento firebase-ready");
        
        this.inicializarInterfaceAdmin();
        
        document.addEventListener('firebase-ready', async () => {
          console.log("🔥 Evento firebase-ready recebido em AdminModulo.inicializar");
          
          try {
            await this.carregarDadosAdmin();
            console.log("🔥 Dados administrativos REAIS carregados com sucesso após firebase-ready");
          } catch (error) {
            console.error("🔥 Erro ao carregar dados administrativos após firebase-ready:", error);
          }
        });
      }
      
      // Configurar formulários e modais
      this.configurarFormularios();
    },
    
    // Configurar formulários e modais
    configurarFormularios() {
      const formEquipe = document.getElementById('form-equipe');
      const modalEquipe = document.getElementById('modal-equipe');
      
      if (formEquipe) {
        formEquipe.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          try {
            const esconderLoading = AppModulos.UI.mostrarLoading('Salvando equipe...');
            
            const nome = document.getElementById('nome-equipe').value.trim();
            const descricao = document.getElementById('descricao-equipe').value.trim();
            const equipeId = document.getElementById('equipe-id').value.trim();
            
            if (!nome) {
              AppModulos.UI.mostrarNotificacao('O nome da equipe é obrigatório', 'erro');
              esconderLoading();
              return;
            }
            
            const medicosSelecionados = [];
            document.querySelectorAll('#selecao-medicos .medico-item.selecionado').forEach(item => {
              console.log(`🔥 Médico selecionado encontrado: ID=${item.dataset.id}`);
              medicosSelecionados.push(item.dataset.id);
            });
            
            console.log(`🔥 TOTAL de médicos selecionados: ${medicosSelecionados.length}`);
            console.log(`🔥 IDs dos médicos selecionados:`, medicosSelecionados);
            
            // Verificar se há médicos selecionados antes de prosseguir
            if (medicosSelecionados.length === 0) {
              console.warn(`🔥 AVISO: Nenhum médico foi selecionado para a equipe "${nome}"`);
              AppModulos.UI.mostrarNotificacao('⚠️ Selecione pelo menos um médico para a equipe', 'aviso');
              esconderLoading();
              return;
            }
            
            console.log(`🔥 Salvando equipe "${nome}" com ${medicosSelecionados.length} médicos selecionados`);
            
            const equipeData = {
              nome,
              descricao,
              membros: medicosSelecionados,
              dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
              ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const sucesso = await AppVisita.Firebase.Equipes.salvarEquipe(equipeData, equipeId || null);
            
            esconderLoading();
            
            if (sucesso) {
              if (modalEquipe) modalEquipe.style.display = 'none';
              
              try {
                await this.carregarEquipes();
              } catch (err) {
                console.error("🔥 Erro ao recarregar equipes, mas a equipe foi salva com sucesso:", err);
              }
              
              AppModulos.UI.mostrarNotificacao(
                equipeId ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!', 
                'sucesso'
              );
            } else {
              throw new Error('Falha ao salvar equipe');
            }
          } catch (error) {
            console.error("🔥 Erro ao salvar equipe:", error);
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
    },
    
    // Carregar estatísticas reais do sistema
    async carregarEstatisticasReais() {
      if (this.estado.carregandoEstatisticas) {
        console.log("🔥 Carregamento de estatísticas já em andamento, ignorando nova solicitação");
        return;
      }
      
      try {
        this.estado.carregandoEstatisticas = true;
        console.log("🔥 CARREGANDO ESTATÍSTICAS REAIS DO FIREBASE");
        
        // Verificar se o Firebase está disponível
        if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
          console.log("🔥 Firebase não está disponível para estatísticas, aguardando...");
          await this.aguardarFirebaseDisponivel();
        }
        
        const estatisticas = {
          totalPacientes: 0,
          totalMedicos: 0,
          totalEquipes: 0,
          totalEvolucoes: 0
        };
        
        try {
          // Carregar total de pacientes
          if (AppVisita?.Firebase?.Pacientes) {
            console.log("🔥 Carregando pacientes para estatísticas...");
            const pacientes = await AppVisita.Firebase.Pacientes.obterTodos();
            estatisticas.totalPacientes = pacientes.length;
            
            // Calcular total de evoluções
            estatisticas.totalEvolucoes = 0;
            pacientes.forEach(paciente => {
              if (paciente.evolucoes && Array.isArray(paciente.evolucoes)) {
                estatisticas.totalEvolucoes += paciente.evolucoes.length;
              }
            });
            
            console.log(`🔥 Encontrados ${estatisticas.totalPacientes} pacientes com ${estatisticas.totalEvolucoes} evoluções`);
          } else {
            console.warn("🔥 Serviço de Pacientes não disponível");
          }
        } catch (error) {
          console.error("🔥 Erro ao carregar pacientes para estatísticas:", error);
        }
        
        try {
          // Carregar total de usuários (médicos)
          if (AppVisita?.Firebase?.Usuarios) {
            console.log("🔥 Carregando usuários para estatísticas...");
            if (!this.dados.usuarios || this.dados.usuarios.length === 0) {
              this.dados.usuarios = await AppVisita.Firebase.Usuarios.obterTodos();
            }
            // Contar apenas usuários aprovados (excluindo admin)
            const medicosAprovados = this.dados.usuarios.filter(user => 
              (user.aprovado === true || user.status === 'aprovado') && 
              user.email !== window.ADMIN_EMAIL
            );
            estatisticas.totalMedicos = medicosAprovados.length;
            console.log(`🔥 Encontrados ${estatisticas.totalMedicos} médicos aprovados`);
          } else {
            console.warn("🔥 Serviço de Usuários não disponível");
          }
        } catch (error) {
          console.error("🔥 Erro ao carregar usuários para estatísticas:", error);
        }
        
        try {
          // Carregar total de equipes
          if (AppVisita?.Firebase?.Equipes) {
            console.log("🔥 Carregando equipes para estatísticas...");
            if (!this.dados.todasEquipes || this.dados.todasEquipes.length === 0) {
              const todasEquipes = await AppVisita.Firebase.Equipes.obterTodas();
              // Filtrar equipes não excluídas
              this.dados.todasEquipes = todasEquipes.filter(equipe => 
                !(equipe.excluido === true || equipe.status === 'excluido')
              );
            }
            estatisticas.totalEquipes = this.dados.todasEquipes.length;
            console.log(`🔥 Encontradas ${estatisticas.totalEquipes} equipes ativas`);
          } else {
            console.warn("🔥 Serviço de Equipes não disponível");
          }
        } catch (error) {
          console.error("🔥 Erro ao carregar equipes para estatísticas:", error);
        }
        
        // Atualizar interface com dados reais
        this.atualizarInterfaceEstatisticas(estatisticas);
        
        console.log("🔥 Estatísticas REAIS carregadas:", estatisticas);
        return estatisticas;
        
      } catch (error) {
        console.error("🔥 Erro ao carregar estatísticas reais:", error);
        
        // Mostrar dados zerados em caso de erro
        this.atualizarInterfaceEstatisticas({
          totalPacientes: 0,
          totalMedicos: 0,
          totalEquipes: 0,
          totalEvolucoes: 0
        });
        
        throw error;
      } finally {
        this.estado.carregandoEstatisticas = false;
      }
    },
    
    // Atualizar interface com estatísticas reais
    atualizarInterfaceEstatisticas(estatisticas) {
      console.log("🔥 ATUALIZANDO INTERFACE COM ESTATÍSTICAS REAIS:", estatisticas);
      
      // Atualizar elementos de estatísticas com diferentes possíveis IDs
      const elementos = [
        { ids: ['total-pacientes', '#total-pacientes .stat-number'], valor: estatisticas.totalPacientes },
        { ids: ['total-medicos', '#total-medicos .stat-number'], valor: estatisticas.totalMedicos },
        { ids: ['total-equipes', '#total-equipes .stat-number'], valor: estatisticas.totalEquipes },
        { ids: ['total-evolucoes', '#total-evolucoes .stat-number'], valor: estatisticas.totalEvolucoes }
      ];
      
      elementos.forEach(({ ids, valor }) => {
        let elementoEncontrado = false;
        
        ids.forEach(id => {
          let elemento;
          
          if (id.startsWith('#')) {
            elemento = document.querySelector(id);
          } else {
            elemento = document.getElementById(id);
          }
          
          if (elemento) {
            elemento.textContent = valor;
            console.log(`🔥 Atualizado ${id}: ${valor}`);
            elementoEncontrado = true;
          }
        });
        
        if (!elementoEncontrado) {
          console.warn(`🔥 Nenhum elemento encontrado para os IDs: ${ids.join(', ')}`);
        }
      });
      
      // Carregar usuários pendentes para o dashboard
      this.carregarUsuariosPendentesParaDashboard();
    },
    
    // Carregar usuários pendentes para exibir no dashboard
    async carregarUsuariosPendentesParaDashboard() {
      try {
        console.log("🔥 CARREGANDO USUÁRIOS PENDENTES PARA DASHBOARD");
        
        // Buscar usuários pendentes dos dados já carregados
        let usuariosPendentes = [];
        
        if (this.dados.usuarios && this.dados.usuarios.length > 0) {
          usuariosPendentes = this.dados.usuarios.filter(user => 
            user.status === 'pendente' || !user.aprovado
          );
        } else {
          // Se não temos dados, tentar carregar
          try {
            if (AppVisita?.Firebase?.Usuarios) {
              const todosUsuarios = await AppVisita.Firebase.Usuarios.obterTodos();
              usuariosPendentes = todosUsuarios.filter(user => 
                user.status === 'pendente' || !user.aprovado
              );
            }
          } catch (error) {
            console.error("🔥 Erro ao carregar usuários para dashboard:", error);
          }
        }
        
        console.log(`🔥 Encontrados ${usuariosPendentes.length} usuários pendentes para dashboard`);
        
        // Atualizar lista de usuários pendentes no dashboard
        const listaPendentes = document.getElementById('lista-usuarios-pendentes');
        if (listaPendentes) {
          this.renderizarUsuariosPendentesDashboard(usuariosPendentes, listaPendentes);
        } else {
          console.warn("🔥 Elemento lista-usuarios-pendentes não encontrado no dashboard");
        }
        
      } catch (error) {
        console.error("🔥 Erro ao carregar usuários pendentes para dashboard:", error);
      }
    },
    
    // Renderizar usuários pendentes no dashboard
    renderizarUsuariosPendentesDashboard(usuariosPendentes, container) {
      console.log(`🔥 RENDERIZANDO ${usuariosPendentes.length} usuários pendentes no dashboard`);
      
      if (usuariosPendentes.length === 0) {
        container.innerHTML = `
          <div class="sem-registros">
            <i class="fas fa-check-circle"></i>
            <p>Não há usuários pendentes de aprovação.</p>
          </div>
        `;
        return;
      }
      
      // Limitar a 5 usuários pendentes no dashboard
      const usuariosParaMostrar = usuariosPendentes.slice(0, 5);
      
      container.innerHTML = '';
      
      usuariosParaMostrar.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'admin-list-item';
        
        const dataFormatada = user.dataCriacao ? 
          AppVisita.Utils.formatarData(user.dataCriacao) : 
          'Data não disponível';
        
        userItem.innerHTML = `
          <div class="admin-item-info">
            <h4><i class="fas fa-user-md"></i> ${user.email}</h4>
            <p><strong>Data de cadastro:</strong> ${dataFormatada}</p>
            <p><strong>Status:</strong> <span class="status-pendente">Pendente de aprovação</span></p>
            ${user.nomeCompleto ? `<p><strong>Nome:</strong> ${user.nomeCompleto}</p>` : ''}
          </div>
          <div class="admin-item-actions">
            <button class="btn-aprovar-dashboard" data-id="${user.id}" title="Aprovar usuário">
              <i class="fas fa-check"></i> Aprovar
            </button>
            <button class="btn-detalhes-dashboard" data-id="${user.id}" title="Ver detalhes">
              <i class="fas fa-eye"></i> Detalhes
            </button>
          </div>
        `;
        
        container.appendChild(userItem);
      });
      
      // Se há mais usuários, mostrar link para ver todos
      if (usuariosPendentes.length > 5) {
        const verTodos = document.createElement('div');
        verTodos.className = 'ver-todos-link';
        verTodos.innerHTML = `
          <button class="btn-link" onclick="window.AppModulos.Admin.irParaAbaUsuarios()">
            <i class="fas fa-arrow-right"></i> Ver todos os ${usuariosPendentes.length} usuários pendentes
          </button>
        `;
        container.appendChild(verTodos);
      }
      
      // Adicionar eventos aos botões do dashboard
      this.adicionarEventosBotoesDashboard();
    },
    
    // Adicionar eventos aos botões do dashboard
    adicionarEventosBotoesDashboard() {
      // Botões de aprovação no dashboard
      document.querySelectorAll('.btn-aprovar-dashboard').forEach(btn => {
        btn.addEventListener('click', async function() {
          const userId = this.dataset.id;
          const usuario = window.AppModulos.Admin.dados.usuarios.find(u => u.id === userId);
          
          if (!usuario) return;
          
          try {
            const esconderLoading = AppModulos.UI.mostrarLoading('Aprovando usuário...');
            const sucesso = await AppVisita.Firebase.Usuarios.aprovarUsuario(userId);
            esconderLoading();
            
            if (sucesso) {
              // Recarregar dados
              await window.AppModulos.Admin.carregarUsuarios();
              await window.AppModulos.Admin.carregarEstatisticasReais();
              AppModulos.UI.mostrarNotificacao('Usuário aprovado com sucesso!', 'sucesso');
            } else {
              throw new Error('Falha na aprovação');
            }
          } catch (error) {
            console.error("🔥 Erro ao aprovar usuário no dashboard:", error);
            AppModulos.UI.mostrarNotificacao('Erro ao aprovar usuário', 'erro');
          }
        });
      });
      
      // Botões de detalhes no dashboard
      document.querySelectorAll('.btn-detalhes-dashboard').forEach(btn => {
        btn.addEventListener('click', function() {
          const userId = this.dataset.id;
          const usuario = window.AppModulos.Admin.dados.usuarios.find(u => u.id === userId);
          if (usuario) {
            window.AppModulos.Admin.mostrarDetalhesUsuario(usuario);
          }
        });
      });
    },
    
    // Função para ir para a aba de usuários
    irParaAbaUsuarios() {
      const tabUsuarios = document.getElementById('tab-usuarios');
      if (tabUsuarios) {
        tabUsuarios.click();
      }
    },
  };
  
  // Inicializar módulo
  AdminModulo.inicializar();
  
  // Adicionar estilos CSS para as funcionalidades
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
        margin: 0 0 20px;
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
      
      /* Erro de carregamento */
      .erro-carregamento {
        text-align: center;
        padding: 40px;
        color: #666;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 20px 0;
      }
      
      .erro-carregamento i {
        font-size: 48px;
        color: #dc3545;
        margin-bottom: 16px;
      }
      
      .erro-carregamento h3 {
        color: #dc3545;
        margin-bottom: 8px;
      }
      
      .erro-carregamento p {
        margin-bottom: 20px;
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
      
      /* Estilos para dashboard e usuários pendentes */
      .admin-dashboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      
      .admin-dashboard-stats .stat-card {
        background: linear-gradient(135deg, #4285f4 0%, #6ab7ff 100%);
        color: white;
        border-left: none;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
        transition: transform 0.3s, box-shadow 0.3s;
      }
      
      .admin-dashboard-stats .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(66, 133, 244, 0.4);
      }
      
      .admin-dashboard-stats .stat-card h3 {
        margin: 0 0 12px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .admin-dashboard-stats .stat-number {
        font-size: 36px;
        font-weight: 700;
        color: white;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .admin-list-item {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: transform 0.2s, box-shadow 0.2s;
        border-left: 4px solid #ffc107;
      }
      
      .admin-list-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      .admin-item-info {
        flex: 1;
      }
      
      .admin-item-info h4 {
        margin: 0 0 8px;
        color: #333;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .admin-item-info h4 i {
        color: #4285f4;
      }
      
      .admin-item-info p {
        margin: 4px 0;
        font-size: 14px;
        color: #666;
      }
      
      .admin-item-info .status-pendente {
        background: #fff3cd;
        color: #856404;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .admin-item-actions {
        display: flex;
        gap: 8px;
      }
      
      .btn-aprovar-dashboard, .btn-detalhes-dashboard {
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
      
      .btn-aprovar-dashboard {
        background: #28a745;
        color: white;
      }
      
      .btn-aprovar-dashboard:hover {
        background: #218838;
        transform: translateY(-1px);
      }
      
      .btn-detalhes-dashboard {
        background: #6c757d;
        color: white;
      }
      
      .btn-detalhes-dashboard:hover {
        background: #5a6268;
        transform: translateY(-1px);
      }
      
      .sem-registros {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .sem-registros i {
        font-size: 48px;
        color: #28a745;
        margin-bottom: 16px;
      }
      
      .sem-registros p {
        margin: 0;
        font-size: 16px;
      }
      
      .ver-todos-link {
        text-align: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #eee;
      }
      
      .btn-link {
        background: none;
        border: none;
        color: #4285f4;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: color 0.2s;
      }
      
      .btn-link:hover {
        color: #2c5aa0;
        text-decoration: underline;
      }
      
      .admin-section-title {
        margin: 30px 0 20px;
      }
      
      .admin-section-title h3 {
        color: #333;
        font-size: 20px;
        margin: 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #4285f4;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
  })();
  
  // Exportar o módulo para uso global
  if (typeof window.AppModulos === 'undefined') {
    window.AppModulos = {};
  }
  
  window.AppModulos.Admin = AdminModulo;
  
  // Inicialização automática para administradores
  document.addEventListener('firebase-ready', function() {
    console.log("🔥 Firebase ready - verificando se deve inicializar Admin");
    
    // Aguardar um pouco para garantir que o login foi processado
    setTimeout(() => {
      if (window.isAdmin && window.currentUser) {
        console.log("🔥 Usuário é admin - inicializando módulo Admin automaticamente");
        try {
          AdminModulo.carregarDadosAdmin();
        } catch (error) {
          console.error("🔥 Erro ao inicializar módulo Admin:", error);
        }
      }
    }, 1000);
  });
  
  // Fallback: verificar periodicamente se deve inicializar
  let verificacaoAdmin = setInterval(() => {
    if (window.isAdmin && window.currentUser && window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
      console.log("🔥 Condições atendidas - inicializando Admin via fallback");
      clearInterval(verificacaoAdmin);
      
      try {
        AdminModulo.carregarDadosAdmin();
      } catch (error) {
        console.error("🔥 Erro ao inicializar Admin via fallback:", error);
      }
    }
  }, 2000);
  
  // Limpar verificação após 30 segundos
  setTimeout(() => {
    clearInterval(verificacaoAdmin);
  }, 30000);
});