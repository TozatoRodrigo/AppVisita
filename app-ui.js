// Módulo para gerenciamento de interface do usuário
document.addEventListener('DOMContentLoaded', () => {
  // Elementos do menu e seções
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const secoes = {
    dashboard: document.getElementById('dashboard-section'),
    adicionarPaciente: document.getElementById('adicionar-paciente-section'),
    consultarPaciente: document.getElementById('consultar-paciente-section'),
    admin: document.getElementById('admin-section')
  };

  // Módulo UI
  const UIModulo = {
    // Configurar ações do sidebar (menu lateral)
    configurarSidebar() {
      console.log("Configurando sidebar...");
      console.log("menuToggle:", menuToggle);
      console.log("sidebar:", sidebar);
      console.log("sidebarOverlay:", sidebarOverlay);
      
      // Abrir menu
      if (menuToggle) {
        menuToggle.addEventListener('click', () => {
          console.log("Menu toggle clicado!");
          sidebar.classList.add('open');
          sidebarOverlay.style.display = 'block';
          console.log("Sidebar classes após clique:", sidebar.className);
        });
      } else {
        console.error("Menu toggle não encontrado!");
      }
      
      // Fechar menu (botão X)
      if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
          this.fecharSidebar();
        });
      } else {
        console.error("Botão fechar sidebar não encontrado!");
      }
      
      // Fechar menu (clique no overlay)
      if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
          this.fecharSidebar();
        });
      } else {
        console.error("Sidebar overlay não encontrado!");
      }
    },
    
    // Fechar o sidebar
    fecharSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
    },
    
    // Alternar entre seções do app
    alternarSecaoAtiva(secaoId, botaoMenu) {
      // Obter todas as seções
      const todasSecoes = Object.values(secoes).filter(s => s !== null);
      
      // Remover classe ativa de todas as seções
      todasSecoes.forEach(section => {
        section.classList.remove('active-section');
      });
      
      // Remover classe ativa de todos os botões do menu
      document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('menu-btn-active');
      });
      
      // Ativar a seção selecionada
      const secaoParaAtivar = document.getElementById(secaoId);
      if (secaoParaAtivar) {
        secaoParaAtivar.classList.add('active-section');
      }
      
      // Ativar o botão do menu
      if (botaoMenu) {
        botaoMenu.classList.add('menu-btn-active');
      }
      
      // Fechar o menu lateral em dispositivos móveis
      this.fecharSidebar();
    },
    
    // Criar e exibir modal personalizado
    exibirModal(titulo, conteudo, botoes = []) {
      // Se já existe um modal, remove
      const modalExistente = document.querySelector('.modal-dinamico');
      if (modalExistente) {
        document.body.removeChild(modalExistente);
      }
      
      // Criar o modal
      const modal = document.createElement('div');
      modal.className = 'modal modal-dinamico';
      
      // Conteúdo do modal
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-button">&times;</span>
          <h3>${titulo}</h3>
          <div class="modal-body">${typeof conteudo === 'string' ? conteudo : ''}</div>
          <div class="modal-footer"></div>
        </div>
      `;
      
      // Se conteúdo for um elemento DOM, adicioná-lo
      if (typeof conteudo !== 'string' && conteudo instanceof HTMLElement) {
        modal.querySelector('.modal-body').appendChild(conteudo);
      }
      
      // Adicionar botões
      const footer = modal.querySelector('.modal-footer');
      botoes.forEach(botao => {
        const btn = document.createElement('button');
        btn.className = `btn-${botao.tipo || 'secondary'}`;
        btn.textContent = botao.texto;
        
        if (botao.onClick) {
          btn.addEventListener('click', (e) => botao.onClick(e, modal));
        }
        
        footer.appendChild(btn);
      });
      
      // Eventos do modal
      const closeButton = modal.querySelector('.close-button');
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Fechar ao clicar fora
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
      
      // Adicionar modal ao documento
      document.body.appendChild(modal);
      
      // Função para fechar o modal
      const fecharModal = () => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      };
      
      return { modal, fecharModal };
    },
    
    // Criar e mostrar toast/notificação
    mostrarNotificacao(mensagem, tipo = 'info', duracaoMs = 3000) {
      // Remover notificações existentes
      const notificacaoExistente = document.querySelector('.notificacao');
      if (notificacaoExistente) {
        document.body.removeChild(notificacaoExistente);
      }
      
      // Criar elemento de notificação
      const notificacao = document.createElement('div');
      notificacao.className = `notificacao notificacao-${tipo}`;
      
      // Ícone baseado no tipo
      const icones = {
        sucesso: 'fa-check-circle',
        erro: 'fa-exclamation-triangle',
        aviso: 'fa-exclamation-circle',
        info: 'fa-info-circle'
      };
      
      // Conteúdo da notificação
      notificacao.innerHTML = `
        <i class="fas ${icones[tipo] || icones.info}"></i>
        <span>${mensagem}</span>
        <button class="fechar-notificacao"><i class="fas fa-times"></i></button>
      `;
      
      // Evento para fechar a notificação
      notificacao.querySelector('.fechar-notificacao').addEventListener('click', () => {
        if (document.body.contains(notificacao)) {
          document.body.removeChild(notificacao);
        }
      });
      
      // Adicionar ao documento
      document.body.appendChild(notificacao);
      
      // Remover após o tempo definido
      setTimeout(() => {
        if (document.body.contains(notificacao)) {
          // Adicionar classe para animar a saída
          notificacao.classList.add('fechando');
          
          // Remover após a animação
          setTimeout(() => {
            if (document.body.contains(notificacao)) {
              document.body.removeChild(notificacao);
            }
          }, 300);
        }
      }, duracaoMs);
      
      return notificacao;
    },
    
    // Criar um elemento de loading
    mostrarLoading(texto = 'Carregando...') {
      const loadingExistente = document.querySelector('.loading-overlay');
      if (loadingExistente) {
        document.body.removeChild(loadingExistente);
      }
      
      const loading = document.createElement('div');
      loading.className = 'loading-overlay';
      
      loading.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <p>${texto}</p>
        </div>
      `;
      
      document.body.appendChild(loading);
      
      // Função para esconder
      const esconderLoading = () => {
        if (document.body.contains(loading)) {
          document.body.removeChild(loading);
        }
      };
      
      return esconderLoading;
    },
    
    // Exibir confirmação antes de ação
    confirmarAcao(mensagem, acaoConfirmar, acaoCancelar = null) {
      console.log("Abrindo diálogo de confirmação");
      
      if (!acaoConfirmar || typeof acaoConfirmar !== 'function') {
        console.error("confirmarAcao: Callback de confirmação ausente ou inválido");
        return;
      }
      
      // Criar uma cópia da função para evitar problemas de escopo e garantir execução
      const callbackSeguro = function() {
        console.log("Executando callback seguro para confirmação");
        try {
          acaoConfirmar();
        } catch (error) {
          console.error("Erro ao executar callback de confirmação:", error);
          
          // Exibir notificação em caso de erro
          if (this.mostrarNotificacao) {
            this.mostrarNotificacao("Erro ao executar ação confirmada", "erro");
          } else {
            alert("Erro ao executar ação confirmada");
          }
        }
      };
      
      // Salvar referência para 'this'
      const self = this;
      
      // Criar conteúdo com destaque visual
      const conteudoFormatado = `
        <div class="confirmacao-container">
          <div class="confirmacao-icone">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="confirmacao-mensagem">
            ${mensagem}
          </div>
        </div>
      `;
      
      // Adicionar estilos específicos para confirmação
      const estiloConfirmacao = document.createElement('style');
      estiloConfirmacao.textContent = `
        .confirmacao-container {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .confirmacao-icone {
          margin-right: 15px;
          color: #ffc107;
          font-size: 24px;
        }
        .confirmacao-mensagem {
          flex: 1;
        }
        .btn-confirmar-danger {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-confirmar-danger:hover {
          background-color: #c82333;
        }
      `;
      document.head.appendChild(estiloConfirmacao);
      
      // Mostrar modal com conteúdo formatado
      const { fecharModal } = this.exibirModal('Confirmação', conteudoFormatado, [
        {
          texto: 'Cancelar',
          tipo: 'secondary',
          onClick: (_, modal) => {
            console.log("Ação cancelada pelo usuário");
            fecharModal();
            if (acaoCancelar && typeof acaoCancelar === 'function') {
              try {
                acaoCancelar();
              } catch (error) {
                console.error("Erro ao executar callback de cancelamento:", error);
              }
            }
            // Remover o estilo após fechar
            if (document.head.contains(estiloConfirmacao)) {
              document.head.removeChild(estiloConfirmacao);
            }
          }
        },
        {
          texto: 'Confirmar',
          tipo: 'primary danger',
          onClick: (_, modal) => {
            console.log("Ação confirmada pelo usuário");
            // Fechar o modal antes de executar o callback
            fecharModal();
            
            // Executar a ação confirmada com timeout para garantir que o modal foi fechado
            console.log("Preparando para executar callback de confirmação");
            setTimeout(() => {
              try {
                console.log("Executando callback de confirmação");
                callbackSeguro.call(self);
                console.log("Callback de confirmação executado com sucesso");
              } catch (error) {
                console.error("Erro ao executar ação confirmada:", error);
                self.mostrarNotificacao("Erro ao executar a ação", "erro");
              }
            }, 200); // Aumentando o timeout para garantir que o modal seja fechado
            
            // Remover o estilo após fechar
            if (document.head.contains(estiloConfirmacao)) {
              document.head.removeChild(estiloConfirmacao);
            }
          }
        }
      ]);
    }
  };
  
  // Adicionar CSS para notificações e loading
  const adicionarCSS = () => {
    // Criar elemento de estilo
    const style = document.createElement('style');
    
    style.textContent = `
      /* Notificação Toast */
      .notificacao {
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 250px;
        max-width: 350px;
        padding: 15px;
        background-color: #f8f9fa;
        border-left: 4px solid #4285f4;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-radius: 4px;
        z-index: 9999;
        display: flex;
        align-items: center;
        animation: slideInRight 0.3s ease forwards;
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .notificacao.fechando {
        animation: slideOutRight 0.3s ease forwards;
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .notificacao i {
        margin-right: 10px;
        font-size: 18px;
      }
      
      .notificacao span {
        flex: 1;
        font-size: 14px;
      }
      
      .notificacao .fechar-notificacao {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
      }
      
      .notificacao-sucesso { border-left-color: #28a745; }
      .notificacao-sucesso i { color: #28a745; }
      
      .notificacao-erro { border-left-color: #dc3545; }
      .notificacao-erro i { color: #dc3545; }
      
      .notificacao-aviso { border-left-color: #ffc107; }
      .notificacao-aviso i { color: #ffc107; }
      
      .notificacao-info { border-left-color: #4285f4; }
      .notificacao-info i { color: #4285f4; }
      
      /* Loading Overlay */
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      
      .loading-container {
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 15px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4285f4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Modal dinâmico */
      .modal-dinamico .modal-content {
        max-width: 500px;
        width: 90%;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
  };
  
  // Adicionar estilos CSS
  adicionarCSS();
  
  // Exportar o módulo para uso global
  if (typeof window.AppModulos === 'undefined') {
    window.AppModulos = {};
  }
  
  window.AppModulos.UI = UIModulo;
}); 