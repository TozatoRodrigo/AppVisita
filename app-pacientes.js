// Módulo para gerenciamento de pacientes e evoluções médicas
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado em app-pacientes.js");
  
  // Elementos DOM
  const formAdicionarPaciente = document.getElementById('form-adicionar-paciente');
  const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
  const ordenarPorSelect = document.getElementById('ordenar-por');
  const modalEvolucao = document.getElementById('modal-evolucao');
  const formEvolucao = document.getElementById('form-evolucao');
  const historicoEvolucoes = document.getElementById('historico-evolucoes-modal');
  
  // Verifica se os elementos foram encontrados
  if (!listaPacientesPendentes) {
    console.error("Elemento #lista-pacientes-pendentes não encontrado");
  }
  
  if (!formAdicionarPaciente) {
    console.error("Elemento #form-adicionar-paciente não encontrado");
  }
  
  // Verificar se o Firebase já está inicializado ou esperar pelo evento
  if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
    console.log("Firebase já estava disponível, inicializando módulo de pacientes imediatamente");
    inicializarModuloPacientes();
  } else {
    console.log("Aguardando evento firebase-ready para inicializar módulo de pacientes");
    document.addEventListener('firebase-ready', (event) => {
      console.log("Evento firebase-ready recebido em app-pacientes.js", event?.detail);
      // Adicionar um pequeno atraso para garantir que todas as referências estejam prontas
      setTimeout(() => {
        inicializarModuloPacientes();
      }, 300);
    });
  }

  // Inicializar módulo
  function inicializarModuloPacientes() {
    console.log("Inicializando módulo de pacientes...");
    
    if (!window.verificarFirebaseDisponivel()) {
      console.error("Firebase não inicializado em app-pacientes.js. Tentando novamente em 1 segundo...");
      setTimeout(inicializarModuloPacientes, 1000);
      return;
    }
    
    // Método de ordenação padrão
    let metodoOrdenacao = 'adicao'; // Padrão: ordenar por data de adição
    
    // Evento de mudança de ordenação
    if (ordenarPorSelect) {
      ordenarPorSelect.addEventListener('change', function() {
        metodoOrdenacao = this.value;
        
        // Reordenar pacientes
        ordenarEExibirPacientes(window.pacientesLocal, metodoOrdenacao);
      });
    }
    
    // Inicializar sistema de sugestão de pacientes
    inicializarSugestoesPacientes();
    
    // Configurar formulário de adicionar paciente
    if (formAdicionarPaciente) {
      formAdicionarPaciente.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
          // Verificar novamente se o Firebase está disponível
          if (!window.verificarFirebaseDisponivel()) {
            throw new Error("Firebase não está disponível");
          }
          
          const nomePaciente = document.getElementById('nome-paciente').value.trim();
          const dataNascimento = document.getElementById('data-nascimento-paciente').value;
          const idInternacao = document.getElementById('id-internacao-paciente').value.trim();
          const localLeito = document.getElementById('local-paciente').value.trim();
          const equipeId = document.getElementById('equipe-paciente').value;
          
          // Verificar se há um ID de paciente reinternado
          const pacienteReinternado = document.getElementById('paciente-reinternado-id');
          const isReinternacao = pacienteReinternado && pacienteReinternado.value;
          
          // Validar campos
          if (!nomePaciente || !dataNascimento || !idInternacao || !localLeito || !equipeId) {
            AppModulos.UI.mostrarNotificacao('Preencha todos os campos obrigatórios', 'aviso');
            return;
          }
          
          // Mostrar loading
          const esconderLoading = AppModulos.UI.mostrarLoading('Adicionando paciente...');
          
          // Preparar dados do paciente
          const dadosPaciente = {
            nome: nomePaciente,
            dataNascimento: dataNascimento, // Já é string ISO do input date
            idInternacao: idInternacao,
            localLeito: localLeito,
            equipeId: equipeId,
            medicoId: window.auth.currentUser.uid,
            dataRegistro: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'internado', // Status inicial
            // O array de evoluções será mantido em caso de reinternação
          };
          
          let resultado;
          
          // Se for uma reinternação, atualizar o paciente existente
          if (isReinternacao) {
            try {
              const pacienteRef = window.db.collection('pacientes').doc(pacienteReinternado.value);
              const pacienteDoc = await pacienteRef.get();
              
              if (pacienteDoc.exists) {
                const pacienteData = pacienteDoc.data();
                const evolucoes = pacienteData.evolucoes || [];
                
                // Adicionar uma evolução de reinternação
                evolucoes.push({
                  texto: `Paciente reinternado em ${new Date().toLocaleDateString('pt-BR')}. Local: ${localLeito}. ID anterior: ${pacienteData.idInternacao}, Novo ID: ${idInternacao}`,
                  status: 'internado',
                  medicoId: window.auth.currentUser.uid,
                  medicoEmail: window.auth.currentUser.email,
                  dataRegistro: new Date() // Usamos new Date() para evitar o erro com serverTimestamp em arrays
                });
                
                // Atualizar o paciente existente, mantendo histórico
                await pacienteRef.update({
                  ...dadosPaciente,
                  evolucoes: evolucoes, // Manter evoluções anteriores
                  ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp(),
                  dataReinternacao: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                resultado = { sucesso: true, id: pacienteReinternado.value, mensagem: 'Paciente reinternado com sucesso!' };
              } else {
                // Se não existe mais (foi excluído), criar um novo
                resultado = await AppVisita.Firebase.Pacientes.adicionarPaciente(dadosPaciente);
              }
            } catch (error) {
              console.error("Erro na reinternação:", error);
              resultado = await AppVisita.Firebase.Pacientes.adicionarPaciente(dadosPaciente);
            }
          } else {
            // Adicionar paciente ao Firestore como novo paciente
            resultado = await AppVisita.Firebase.Pacientes.adicionarPaciente(dadosPaciente);
          }
          
          if (resultado.sucesso) {
            // Limpar formulário
            formAdicionarPaciente.reset();
            
            // Limpar campo de ID de reinternação
            if (pacienteReinternado) {
              pacienteReinternado.value = '';
            }
            
            // Ocultar mensagem de paciente existente
            const msgElement = document.getElementById('msg-paciente-existente');
            if (msgElement) {
              msgElement.classList.add('hidden');
            }
            
            // Mostrar notificação
            if (isReinternacao) {
              AppModulos.UI.mostrarNotificacao('Paciente reinternado com sucesso!', 'sucesso');
            } else {
              AppModulos.UI.mostrarNotificacao('Paciente adicionado com sucesso!', 'sucesso');
            }
            
            // Carregar novamente os pacientes
            await carregarPacientes();
            
            // Voltar para o dashboard
            if (window.AppModulos && window.AppModulos.UI) {
              const btnDashboard = document.getElementById('btn-dashboard');
              AppModulos.UI.alternarSecaoAtiva('dashboard-section', btnDashboard);
            }
          } else {
            AppModulos.UI.mostrarNotificacao(resultado.mensagem || 'Erro ao adicionar paciente', 'erro');
          }
          
          // Esconder loading
          esconderLoading();
        } catch (error) {
          console.error("Erro ao adicionar paciente:", error);
          AppModulos.UI.mostrarNotificacao('Erro ao adicionar paciente. Tente novamente.', 'erro');
        }
      });
    }
    
    // Configurar modal de evolução
    if (modalEvolucao && formEvolucao) {
      // Fechar modal ao clicar no X
      const closeButton = modalEvolucao.querySelector('.close-button');
      if (closeButton) {
        closeButton.addEventListener('click', function() {
          modalEvolucao.style.display = 'none';
        });
      }
      
      // Fechar modal ao clicar fora
      window.addEventListener('click', function(e) {
        if (e.target === modalEvolucao) {
          modalEvolucao.style.display = 'none';
        }
      });
      
      // Submeter formulário de evolução
      formEvolucao.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
          // Verificar novamente se o Firebase está disponível
          if (!window.verificarFirebaseDisponivel()) {
            throw new Error("Firebase não está disponível");
          }
          
          const pacienteId = document.getElementById('paciente-id-evolucao').value;
          const textoEvolucao = document.getElementById('texto-evolucao').value.trim();
          const statusPaciente = document.querySelector('input[name="status-paciente"]:checked').value;
          
          if (!pacienteId || !textoEvolucao) {
            AppModulos.UI.mostrarNotificacao('Preencha a evolução do paciente', 'aviso');
            return;
          }
          
          // Mostrar loading
          const esconderLoading = AppModulos.UI.mostrarLoading('Processando evolução e imagens...');
          
          // Gerar ID único para esta evolução
          const evolucaoId = `evolucao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Fazer upload das imagens se houver
          let imagensData = { urls: [], metadados: [] };
          if (typeof window.uploadImagensParaStorage === 'function') {
            try {
              imagensData = await window.uploadImagensParaStorage(pacienteId, evolucaoId);
            } catch (error) {
              console.error('Erro no upload das imagens:', error);
              esconderLoading();
              AppModulos.UI.mostrarNotificacao('Erro ao fazer upload das imagens. Verifique sua conexão e tente novamente.', 'erro');
              return;
            }
          }
          
          // Preparar dados da evolução com imagens
          const evolucaoData = {
            id: evolucaoId,
            texto: textoEvolucao,
            status: statusPaciente,
            medicoId: window.auth.currentUser.uid,
            medicoEmail: window.auth.currentUser.email,
            dataRegistro: new Date() // Usar new Date() em vez de serverTimestamp() para arrays
          };
          
          // Adicionar dados das imagens se houver
          if (imagensData.urls.length > 0) {
            evolucaoData.imagens = imagensData.urls;
            evolucaoData.metadadosImagens = imagensData.metadados;
          }
          
          // Adicionar evolução ao paciente
          const resultado = await AppVisita.Firebase.Pacientes.adicionarEvolucao(pacienteId, evolucaoData);
          
          if (resultado.sucesso) {
            // Limpar formulário e imagens
            formEvolucao.reset();
            if (typeof window.limparImagensSelecionadas === 'function') {
              window.limparImagensSelecionadas();
            }
            
            // Fechar modal
            modalEvolucao.style.display = 'none';
            
            // Mostrar notificação de sucesso
            const mensagemSucesso = imagensData.urls.length > 0 
              ? `Evolução registrada com sucesso! ${imagensData.urls.length} imagem(ns) anexada(s).`
              : 'Evolução registrada com sucesso!';
            
            AppModulos.UI.mostrarNotificacao(mensagemSucesso, 'sucesso');
            
            // Recarregar pacientes
            await carregarPacientes();
          } else {
            AppModulos.UI.mostrarNotificacao(resultado.mensagem || 'Erro ao registrar evolução', 'erro');
          }
          
          // Esconder loading
          esconderLoading();
        } catch (error) {
          console.error("Erro ao registrar evolução:", error);
          AppModulos.UI.mostrarNotificacao('Erro ao registrar evolução. Tente novamente.', 'erro');
        }
      });
    }
    
    console.log("Módulo de pacientes inicializado com sucesso");
    
    // Tentativa inicial de carregamento de pacientes
    if (window.auth.currentUser) {
      console.log("Usuário autenticado, carregando pacientes iniciais");
      setTimeout(() => carregarPacientes(), 500);
    } else {
      console.log("Usuário ainda não autenticado, esperando evento de autenticação");
      // Configurar listener para carregar pacientes após autenticação
      window.auth.onAuthStateChanged((user) => {
        if (user) {
          console.log("Usuário autenticado via evento, carregando pacientes");
          setTimeout(() => carregarPacientes(), 500);
        }
      });
    }
  }
  
  // Função para carregar pacientes
  async function carregarPacientes() {
    console.log("Carregando pacientes...");
    
    try {
      // Verificar se o Firebase está disponível
      if (!window.verificarFirebaseDisponivel()) {
        console.error("Firebase não disponível para carregar pacientes");
        throw new Error("Firebase não está disponível");
      }
      
      // Verificar se o usuário está autenticado
      if (!window.auth.currentUser) {
        console.error("Usuário não autenticado para carregar pacientes");
        return;
      }
      
      // Mostrar loading
      const esconderLoading = AppModulos.UI.mostrarLoading('Carregando pacientes...');
      
      let pacientes = [];
      
      try {
        // Se for administrador, carrega todos os pacientes
        if (window.isAdmin) {
          console.log("Carregando pacientes como administrador...");
          pacientes = await AppVisita.Firebase.Pacientes.obterTodos();
        } 
        // Se tiver equipes, carrega pacientes das equipes
        else if (window.equipesUsuario && window.equipesUsuario.length > 0) {
          console.log("Carregando pacientes das equipes do usuário...");
          const equipesIds = window.equipesUsuario.map(equipe => equipe.id);
          console.log("IDs das equipes:", equipesIds);
          
          pacientes = await AppVisita.Firebase.Pacientes.obterPacientesPorEquipes(equipesIds);
        } 
        // Carrega pacientes diretamente associados ao médico
        else {
          console.log("Carregando pacientes diretamente associados ao médico...");
          pacientes = await AppVisita.Firebase.Pacientes.obterPacientesPorMedico(window.auth.currentUser.uid);
        }
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        // Esconder loading em caso de erro
        esconderLoading();
        AppModulos.UI.mostrarNotificacao('Erro ao carregar pacientes. Tente novamente.', 'erro');
        return;
      }
      
      console.log(`${pacientes.length} pacientes carregados.`);
      
      // Salvar em variável global
      window.pacientesLocal = pacientes;
      
      // Log para diagnóstico dos dados
      console.log("Tipos de dados nos pacientes:", pacientes.map(p => ({
        id: p.id,
        dataNascimentoType: typeof p.dataNascimento,
        dataNascimentoValue: p.dataNascimento,
        isTimestamp: p.dataNascimento && typeof p.dataNascimento === 'object' && 'seconds' in p.dataNascimento
      })));
      
      // Ordenar e exibir os pacientes
      ordenarEExibirPacientes(pacientes);
      
      // Esconder loading
      esconderLoading();
      
      // Retornar os pacientes
      return pacientes;
    } catch (error) {
      console.error("Erro no carregamento de pacientes:", error);
      AppModulos.UI.mostrarNotificacao('Erro ao carregar pacientes. Tente novamente.', 'erro');
      return [];
    }
  }
  
  // Função para ordenar e exibir pacientes
  function ordenarEExibirPacientes(pacientes, metodo = 'adicao') {
    console.log(`Ordenando ${pacientes.length} pacientes por ${metodo}`);
    
    // Filtrar apenas pacientes internados
    const pacientesInternados = pacientes.filter(p => p.status === 'internado');
    console.log(`Pacientes internados: ${pacientesInternados.length}`);
    
    // Ordenar pacientes conforme método
    let pacientesOrdenados = [];
    
    switch (metodo) {
      case 'nome':
        pacientesOrdenados = pacientesInternados.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'adicao':
      default:
        // Verificar se há dataRegistro e se é um objeto timestamp (para evitar erros)
        pacientesOrdenados = pacientesInternados.sort((a, b) => {
          const dataA = a.dataRegistro ? (a.dataRegistro.seconds || 0) : 0;
          const dataB = b.dataRegistro ? (b.dataRegistro.seconds || 0) : 0;
          return dataB - dataA; // Mais recentes primeiro
        });
        break;
    }
    
    // Renderizar pacientes
    renderizarPacientes(pacientesOrdenados);
  }
  
  // Função para renderizar pacientes na lista
  function renderizarPacientes(pacientes) {
    if (!listaPacientesPendentes) {
      console.error("Elemento lista-pacientes-pendentes não encontrado");
      return;
    }
    
    // Limpar lista atual
    listaPacientesPendentes.innerHTML = '';
    
    // Se não houver pacientes, mostrar mensagem
    if (!pacientes || pacientes.length === 0) {
      listaPacientesPendentes.innerHTML = `
        <li class="paciente-item paciente-vazio">
          <div class="paciente-vazio-mensagem">
            <i class="fas fa-user-plus"></i>
            <p>Nenhum paciente pendente de visita.</p>
            <small>Adicione um novo paciente para iniciar as visitas.</small>
          </div>
        </li>
      `;
      return;
    }
    
    // Renderizar cada paciente
    pacientes.forEach(paciente => {
      // Criar elemento de paciente
      const pacienteItem = document.createElement('li');
      pacienteItem.className = 'paciente-item';
      pacienteItem.dataset.id = paciente.id;
      
      // Formatar data de registro
      const dataRegistro = AppVisita.Utils.formatarData(paciente.dataRegistro);
      
      // Formatar data de nascimento
      let dataNascimento = 'Não informada';
      if (paciente.dataNascimento) {
        try {
          // Verificar se é um objeto Timestamp do Firestore
          if (paciente.dataNascimento && typeof paciente.dataNascimento === 'object' && 'seconds' in paciente.dataNascimento) {
            dataNascimento = AppVisita.Utils.formatarData(paciente.dataNascimento);
          }
          // Verificar se dataNascimento é uma string
          else if (typeof paciente.dataNascimento === 'string') {
            // Converter string de data para objeto Date para poder formatar
            const partes = paciente.dataNascimento.split('-');
            if (partes.length === 3) {
              const data = new Date(partes[0], partes[1] - 1, partes[2]); // mês é 0-indexado
              dataNascimento = data.toLocaleDateString('pt-BR');
            } else {
              dataNascimento = paciente.dataNascimento;
            }
          } 
          // Verificar se é um objeto Date
          else if (paciente.dataNascimento instanceof Date) {
            dataNascimento = paciente.dataNascimento.toLocaleDateString('pt-BR');
          }
          // Caso seja outro formato, tentar converter para string
          else {
            dataNascimento = String(paciente.dataNascimento);
          }
        } catch (error) {
          console.error("Erro ao formatar data de nascimento:", error);
          dataNascimento = 'Erro ao formatar data';
        }
      }
      
      // Definir equipe do paciente
      let equipeNome = 'Não definida';
      if (paciente.equipeId && window.equipesUsuario) {
        const equipe = window.equipesUsuario.find(e => e.id === paciente.equipeId);
        if (equipe) {
          equipeNome = equipe.nome;
        }
      }
      
      // HTML do paciente
      pacienteItem.innerHTML = `
        <div class="paciente-header">
          <h3 class="paciente-nome">${paciente.nome}</h3>
          <span class="paciente-id">ID: ${paciente.idInternacao}</span>
        </div>
        <div class="paciente-info">
          <div class="info-item"><i class="fas fa-hospital"></i> Local: ${paciente.localLeito}</div>
          <div class="info-item"><i class="fas fa-birthday-cake"></i> Nascimento: ${dataNascimento}</div>
          <div class="info-item"><i class="fas fa-users"></i> Equipe: ${equipeNome}</div>
          <div class="info-item"><i class="fas fa-calendar-plus"></i> Adicionado: ${dataRegistro}</div>
        </div>
        <div class="paciente-actions">
          <button class="btn-registrar-evolucao" data-id="${paciente.id}" data-nome="${paciente.nome}">
            <i class="fas fa-clipboard-list"></i> Registrar Evolução
          </button>
        </div>
      `;
      
      // Adicionar à lista
      listaPacientesPendentes.appendChild(pacienteItem);
      
      // Configurar botão de evolução
      const btnEvolucao = pacienteItem.querySelector('.btn-registrar-evolucao');
      if (btnEvolucao) {
        btnEvolucao.addEventListener('click', function() {
          abrirModalEvolucao(this.dataset.id, this.dataset.nome);
        });
      }
    });
  }
  
  // Função para abrir modal de evolução
  function abrirModalEvolucao(pacienteId, pacienteNome) {
    if (!modalEvolucao) {
      console.error("Modal de evolução não encontrado");
      return;
    }
    
    try {
      // Limpar imagens da sessão anterior
      if (typeof window.limparImagensSelecionadas === 'function') {
        window.limparImagensSelecionadas();
      }
      
      // Definir título do modal
      const tituloModal = document.getElementById('modal-titulo-paciente');
      if (tituloModal) {
        tituloModal.textContent = `Registrar Evolução para ${pacienteNome}`;
      }
      
      // Definir ID do paciente no formulário
      const idInput = document.getElementById('paciente-id-evolucao');
      if (idInput) {
        idInput.value = pacienteId;
      }
      
      // Carregar histórico de evoluções
      carregarHistoricoEvolucoes(pacienteId);
      
      // Exibir modal
      modalEvolucao.style.display = 'block';
      
      // 🔥 FORÇAR INICIALIZAÇÃO DO UPLOAD QUANDO MODAL ABRE
      console.log("🔥 MODAL DE EVOLUÇÃO ABERTO - Verificando upload de imagens");
      setTimeout(() => {
        console.log("🔥 Forçando verificação de inicialização do upload...");
        
        const uploadArea = document.getElementById('upload-area');
        const inputImagens = document.getElementById('input-imagens');
        const previewContainer = document.getElementById('preview-imagens');
        
        console.log("🔥 Elementos após abrir modal:");
        console.log("🔥 - uploadArea:", !!uploadArea);
        console.log("🔥 - inputImagens:", !!inputImagens);
        console.log("🔥 - previewContainer:", !!previewContainer);
        
        if (uploadArea && inputImagens && previewContainer) {
          console.log("🔥 Elementos encontrados, verificando se eventos estão configurados...");
          
          // Verificar se já tem event listeners
          const temEventos = uploadArea.onclick !== null || uploadArea.ondragover !== null;
          console.log("🔥 Upload area já tem eventos?", temEventos);
          
          if (!temEventos) {
            console.log("🔥 EVENTOS NÃO CONFIGURADOS! Inicializando agora...");
            inicializarUploadImagens();
          } else {
            console.log("🔥 Eventos já configurados, testando click...");
            // Testar se o click funciona
            uploadArea.addEventListener('click', () => {
              console.log("🔥 TESTE: Click detectado na área de upload!");
            }, { once: true });
          }
        } else {
          console.error("🔥 ERRO: Elementos ainda não encontrados após abrir modal");
          console.log("🔥 Tentando novamente em 1 segundo...");
          setTimeout(() => {
            console.log("🔥 Segunda tentativa após modal aberto...");
            inicializarUploadImagens();
          }, 1000);
        }
      }, 500);
      
    } catch (error) {
      console.error("Erro ao abrir modal de evolução:", error);
      AppModulos.UI.mostrarNotificacao('Erro ao abrir formulário de evolução. Tente novamente.', 'erro');
    }
  }
  
  // Função para carregar histórico de evoluções
  async function carregarHistoricoEvolucoes(pacienteId) {
    if (!historicoEvolucoes) {
      console.error("Elemento de histórico de evoluções não encontrado");
      return;
    }
    
    try {
      // Verificar se o Firebase está disponível
      if (!window.verificarFirebaseDisponivel()) {
        throw new Error("Firebase não está disponível");
      }
      
      // Mostrar indicador de carregamento
      historicoEvolucoes.innerHTML = '<p class="carregando-info">Carregando histórico...</p>';
      
      // Buscar paciente no Firestore
      const pacienteDoc = await window.db.collection('pacientes').doc(pacienteId).get();
      
      if (!pacienteDoc.exists) {
        historicoEvolucoes.innerHTML = '<p class="erro-info">Paciente não encontrado</p>';
        return;
      }
      
      const pacienteData = pacienteDoc.data();
      const evolucoes = pacienteData.evolucoes || [];
      
      // Se não houver evoluções, mostrar mensagem
      if (evolucoes.length === 0) {
        historicoEvolucoes.innerHTML = '<p class="info-msg">Nenhuma evolução registrada anteriormente.</p>';
        return;
      }
      
      // Ordenar evoluções da mais recente para a mais antiga
      evolucoes.sort((a, b) => {
        const dataA = a.dataRegistro ? (a.dataRegistro.seconds || 0) : 0;
        const dataB = b.dataRegistro ? (b.dataRegistro.seconds || 0) : 0;
        return dataB - dataA;
      });
      
      // Criar HTML para cada evolução
      let historicoHTML = '';
      
      evolucoes.forEach(evolucao => {
        const dataFormatada = AppVisita.Utils.formatarDataHora(evolucao.dataRegistro);
        const statusText = evolucao.status === 'internado' ? 'Continua Internado' : 
                          evolucao.status === 'alta' ? 'Alta Hospitalar' : 'Óbito';
        
        const statusClass = evolucao.status === 'internado' ? 'status-internado' : 
                           evolucao.status === 'alta' ? 'status-alta' : 'status-obito';
        
        // Renderizar galeria de imagens se houver
        const galeriaImagens = (typeof window.renderizarGaleriaImagens === 'function' && evolucao.imagens) 
          ? window.renderizarGaleriaImagens(evolucao.imagens) 
          : '';
        
        historicoHTML += `
          <div class="evolucao-item">
            <div class="evolucao-header">
              <span class="evolucao-data">${dataFormatada}</span>
              <span class="evolucao-medico">${evolucao.medicoEmail || 'Médico não identificado'}</span>
            </div>
            <div class="evolucao-texto">${evolucao.texto}</div>
            ${galeriaImagens}
            <div class="evolucao-status ${statusClass}">
              <i class="fas ${evolucao.status === 'internado' ? 'fa-procedures' : 
                            evolucao.status === 'alta' ? 'fa-walking' : 'fa-skull'}"></i>
              ${statusText}
            </div>
          </div>
        `;
      });
      
      // Atualizar HTML do histórico
      historicoEvolucoes.innerHTML = historicoHTML;
    } catch (error) {
      console.error("Erro ao carregar histórico de evoluções:", error);
      historicoEvolucoes.innerHTML = '<p class="erro-info">Erro ao carregar histórico. Tente novamente.</p>';
    }
  }
  
  // Expor função globalmente para que possa ser chamada de outros scripts
  window.carregarPacientes = carregarPacientes;

  // Função para buscar pacientes pelo termo de busca
  function buscarPacientes() {
    const termoBusca = document.getElementById('consulta-termo');
    const resultadoConsulta = document.getElementById('resultado-consulta');
    
    if (!termoBusca || !resultadoConsulta) {
      console.error("Elementos de busca não encontrados");
      return;
    }
    
    // Verificar se há um termo de busca
    const termo = termoBusca.value.trim().toLowerCase();
    
    if (!termo) {
      resultadoConsulta.innerHTML = `
        <div class="sem-resultados">
          <p>Digite um nome ou ID de internação para realizar a consulta.</p>
        </div>
      `;
      return;
    }
    
    // Verificar se existem pacientes carregados
    if (!window.pacientesLocal || window.pacientesLocal.length === 0) {
      resultadoConsulta.innerHTML = `
        <div class="sem-resultados">
          <p>Nenhum paciente disponível para consulta.</p>
        </div>
      `;
      return;
    }
    
    // Filtrar pacientes pelo termo de busca
    const pacientesFiltrados = window.pacientesLocal.filter(paciente => {
      const nome = (paciente.nome || '').toLowerCase();
      const id = (paciente.idInternacao || '').toLowerCase();
      return nome.includes(termo) || id.includes(termo);
    });
    
    if (pacientesFiltrados.length === 0) {
      resultadoConsulta.innerHTML = `
        <div class="sem-resultados">
          <p>Nenhum paciente encontrado com "${termo}".</p>
        </div>
      `;
      return;
    }
    
    // Renderizar resultados
    let resultadosHTML = '<div class="resultados-container">';
    
    pacientesFiltrados.forEach(paciente => {
      // Formatar datas
      const dataRegistro = AppVisita.Utils.formatarData(paciente.dataRegistro);
      
      // Formatar data de nascimento 
      let dataNascimento = 'Não informada';
      if (paciente.dataNascimento) {
        try {
          // Verificar se é um objeto Timestamp do Firestore
          if (paciente.dataNascimento && typeof paciente.dataNascimento === 'object' && 'seconds' in paciente.dataNascimento) {
            dataNascimento = AppVisita.Utils.formatarData(paciente.dataNascimento);
          }
          // Verificar se dataNascimento é uma string
          else if (typeof paciente.dataNascimento === 'string') {
            // Converter string de data para objeto Date para poder formatar
            const partes = paciente.dataNascimento.split('-');
            if (partes.length === 3) {
              const data = new Date(partes[0], partes[1] - 1, partes[2]); // mês é 0-indexado
              dataNascimento = data.toLocaleDateString('pt-BR');
            } else {
              dataNascimento = paciente.dataNascimento;
            }
          } 
          // Caso contrário, tenta converter para string
          else {
            dataNascimento = String(paciente.dataNascimento);
          }
        } catch (error) {
          console.error("Erro ao formatar data de nascimento:", error);
          dataNascimento = 'Erro ao formatar data';
        }
      }
      
      // Status do paciente
      const statusTexto = paciente.status === 'internado' ? 'Internado' : 
                         paciente.status === 'alta' ? 'Alta' : 
                         paciente.status === 'obito' ? 'Óbito' : 'Desconhecido';
                         
      const statusClasse = paciente.status === 'internado' ? 'status-internado' : 
                         paciente.status === 'alta' ? 'status-alta' : 
                         paciente.status === 'obito' ? 'status-obito' : '';
      
      // Adicionar ao HTML
      resultadosHTML += `
        <div class="resultado-paciente">
          <div class="resultado-header">
            <h3>${paciente.nome}</h3>
            <span class="resultado-id">ID: ${paciente.idInternacao || 'Não informado'}</span>
          </div>
          <div class="resultado-info">
            <div class="info-coluna">
              <p><strong>Data de Nascimento:</strong> ${dataNascimento}</p>
              <p><strong>Local/Leito:</strong> ${paciente.localLeito || 'Não informado'}</p>
            </div>
            <div class="info-coluna">
              <p><strong>Status:</strong> <span class="${statusClasse}">${statusTexto}</span></p>
              <p><strong>Data de Registro:</strong> ${dataRegistro}</p>
            </div>
          </div>
          <div class="resultado-acoes">
            <button class="btn-ver-evolucoes" data-id="${paciente.id}" data-nome="${paciente.nome}">
              Ver Evoluções
            </button>
            <button class="btn-registrar-evolucao" data-id="${paciente.id}" data-nome="${paciente.nome}">
              Registrar Evolução
            </button>
          </div>
        </div>
      `;
    });
    
    resultadosHTML += '</div>';
    resultadoConsulta.innerHTML = resultadosHTML;
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-registrar-evolucao').forEach(btn => {
      btn.addEventListener('click', function() {
        abrirModalEvolucao(this.dataset.id, this.dataset.nome);
      });
    });
    
    document.querySelectorAll('.btn-ver-evolucoes').forEach(btn => {
      btn.addEventListener('click', function() {
        abrirModalEvolucao(this.dataset.id, this.dataset.nome);
      });
    });
  }

  // Inicialização dos eventos de consulta
  function inicializarConsulta() {
    const btnBuscarPaciente = document.getElementById('btn-buscar-paciente');
    const consultaTermo = document.getElementById('consulta-termo');
    
    if (btnBuscarPaciente) {
      btnBuscarPaciente.addEventListener('click', buscarPacientes);
    }
    
    if (consultaTermo) {
      consultaTermo.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          buscarPacientes();
        }
      });
    }
  }

  // Inicializar o módulo de consulta
  inicializarConsulta();

  // Função para inicializar sistema de sugestão de pacientes para reinternação
  function inicializarSugestoesPacientes() {
    const nomePacienteInput = document.getElementById('nome-paciente');
    const pacientesSugeridosContainer = document.getElementById('pacientes-sugeridos');
    
    if (!nomePacienteInput || !pacientesSugeridosContainer) {
      console.error("Elementos para sugestão de pacientes não encontrados");
      return;
    }
    
    // Criar elemento para sugestões se não existir
    if (!document.querySelector('.sugestoes-container')) {
      const sugestoesContainer = document.createElement('div');
      sugestoesContainer.className = 'sugestoes-container';
      
      // Inserir após o input
      nomePacienteInput.parentNode.insertBefore(sugestoesContainer, nomePacienteInput.nextSibling);
    }
    
    const sugestoesContainer = document.querySelector('.sugestoes-container');
    
    // Adicionar evento para buscar sugestões ao digitar
    nomePacienteInput.addEventListener('input', async function() {
      const termo = this.value.trim().toLowerCase();
      
      // Só buscar com pelo menos 3 caracteres
      if (termo.length < 3) {
        sugestoesContainer.style.display = 'none';
        return;
      }
      
      try {
        // Verificar se o Firebase está disponível
        if (!window.verificarFirebaseDisponivel()) {
          throw new Error("Firebase não está disponível");
        }
        
        // Buscar TODOS os pacientes, incluindo aqueles com alta
        const pacientesSnapshot = await window.db.collection('pacientes')
          .where('nome', '>=', termo)
          .where('nome', '<=', termo + '\uf8ff')
          .limit(5)
          .get();
        
        // Se não encontrou resultados
        if (pacientesSnapshot.empty) {
          sugestoesContainer.style.display = 'none';
          return;
        }
        
        // Limpar sugestões anteriores
        sugestoesContainer.innerHTML = '';
        
        // Adicionar novos resultados
        pacientesSnapshot.forEach(doc => {
          const paciente = { id: doc.id, ...doc.data() };
          
          // Criar elemento de sugestão
          const sugestaoItem = document.createElement('div');
          sugestaoItem.className = 'sugestao-item';
          
          // Formatar data de nascimento
          let dataNascimento = 'Não informada';
          if (paciente.dataNascimento) {
            try {
              if (typeof paciente.dataNascimento === 'object' && 'seconds' in paciente.dataNascimento) {
                const data = new Date(paciente.dataNascimento.seconds * 1000);
                dataNascimento = data.toLocaleDateString('pt-BR');
              } else if (typeof paciente.dataNascimento === 'string') {
                const partes = paciente.dataNascimento.split('-');
                if (partes.length === 3) {
                  const data = new Date(partes[0], partes[1] - 1, partes[2]);
                  dataNascimento = data.toLocaleDateString('pt-BR');
                } else {
                  dataNascimento = paciente.dataNascimento;
                }
              }
            } catch (error) {
              console.error("Erro ao formatar data:", error);
              dataNascimento = 'Erro na data';
            }
          }
          
          // Status formatado
          const statusText = paciente.status === 'internado' ? 'Internado' : 
                           paciente.status === 'alta' ? 'Alta' : 
                           paciente.status === 'obito' ? 'Óbito' : 'Desconhecido';
                           
          const statusClass = paciente.status === 'internado' ? 'status-internado' : 
                           paciente.status === 'alta' ? 'status-alta' : 
                           paciente.status === 'obito' ? 'status-obito' : '';
          
          // Conteúdo da sugestão
          sugestaoItem.innerHTML = `
            <div class="sugestao-info">
              <span class="sugestao-nome">${paciente.nome}</span>
              <span class="sugestao-detalhes">
                <span class="sugestao-status ${statusClass}">${statusText}</span>
                ID: ${paciente.idInternacao || 'N/A'} | Nasc: ${dataNascimento}
              </span>
            </div>
          `;
          
          // Adicionar evento de clique para selecionar o paciente
          sugestaoItem.addEventListener('click', function() {
            // Preencher o nome do paciente
            nomePacienteInput.value = paciente.nome;
            
            // Preencher outros campos se possível
            const dataNascimentoInput = document.getElementById('data-nascimento-paciente');
            if (dataNascimentoInput && paciente.dataNascimento) {
              // Se for timestamp ou objeto date, converter para formato YYYY-MM-DD
              if (typeof paciente.dataNascimento === 'object') {
                if ('seconds' in paciente.dataNascimento) {
                  const data = new Date(paciente.dataNascimento.seconds * 1000);
                  dataNascimentoInput.value = data.toISOString().split('T')[0];
                } else if (paciente.dataNascimento instanceof Date) {
                  dataNascimentoInput.value = paciente.dataNascimento.toISOString().split('T')[0];
                }
              } else if (typeof paciente.dataNascimento === 'string' && paciente.dataNascimento.includes('-')) {
                dataNascimentoInput.value = paciente.dataNascimento;
              }
            }
            
            // Mostrar mensagem informando que este é um paciente reinternado
            const msgElement = document.getElementById('msg-paciente-existente');
            if (msgElement) {
              msgElement.classList.remove('hidden');
              msgElement.innerHTML = `
                <i class="fas fa-info-circle"></i> Paciente ${paciente.nome} será <strong>reinternado</strong>. 
                ${paciente.status === 'alta' ? 'Status anterior: Alta' : 
                  paciente.status === 'obito' ? 'Status anterior: Óbito (verifique se não é um homônimo)' : 
                  'Status anterior: ' + statusText}
              `;
              
              // Adicionar ID oculto para referência ao paciente original
              const pacienteIdInput = document.createElement('input');
              pacienteIdInput.type = 'hidden';
              pacienteIdInput.id = 'paciente-reinternado-id';
              pacienteIdInput.value = paciente.id;
              
              if (!document.getElementById('paciente-reinternado-id')) {
                formAdicionarPaciente.appendChild(pacienteIdInput);
              } else {
                document.getElementById('paciente-reinternado-id').value = paciente.id;
              }
            }
            
            // Ocultar sugestões
            sugestoesContainer.style.display = 'none';
          });
          
          // Adicionar ao container
          sugestoesContainer.appendChild(sugestaoItem);
        });
        
        // Mostrar sugestões
        if (sugestoesContainer.childElementCount > 0) {
          sugestoesContainer.style.display = 'block';
        } else {
          sugestoesContainer.style.display = 'none';
        }
        
      } catch (error) {
        console.error("Erro ao buscar sugestões de pacientes:", error);
        sugestoesContainer.style.display = 'none';
      }
    });
    
    // Ocultar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
      if (!sugestoesContainer.contains(e.target) && e.target !== nomePacienteInput) {
        sugestoesContainer.style.display = 'none';
      }
    });
  }

  // ========================================
  // Upload de Imagens na Evolução
  // ========================================

  // Array para armazenar as imagens selecionadas temporariamente
  let imagensSelecionadas = [];
  let imagensParaVisualizar = [];
  let indiceImagemAtual = 0;

  // Inicializar funcionalidade de upload de imagens
  function inicializarUploadImagens() {
    console.log("🔥 INICIANDO UPLOAD DE IMAGENS - DEBUG");
    
    const uploadArea = document.getElementById('upload-area');
    const inputImagens = document.getElementById('input-imagens');
    const previewContainer = document.getElementById('preview-imagens');
    
    console.log("🔥 Elementos de upload encontrados:");
    console.log("🔥 - uploadArea:", !!uploadArea);
    console.log("🔥 - inputImagens:", !!inputImagens);
    console.log("🔥 - previewContainer:", !!previewContainer);
    
    if (!uploadArea || !inputImagens || !previewContainer) {
      console.error('🔥 ERRO: Elementos de upload não encontrados');
      console.log('🔥 uploadArea existe:', !!uploadArea);
      console.log('🔥 inputImagens existe:', !!inputImagens);
      console.log('🔥 previewContainer existe:', !!previewContainer);
      return;
    }
    
    console.log("🔥 Todos os elementos encontrados, configurando eventos...");
    
    // Verificar se já foi inicializado para evitar duplicação
    if (uploadArea.dataset.uploadInicializado === 'true') {
      console.log("🔥 Upload já foi inicializado anteriormente");
      return;
    }
    
    // Marcar como inicializado
    uploadArea.dataset.uploadInicializado = 'true';
    
    // 🔥 EVENTOS DE CLICK - Implementação mais robusta
    const clickHandler = (e) => {
      console.log("🔥 CLICK na área de upload");
      // NÃO usar preventDefault aqui pois pode impedir o funcionamento
      e.stopPropagation();
      
      console.log("🔥 Tentando abrir seletor de arquivos...");
      console.log("🔥 inputImagens.disabled:", inputImagens.disabled);
      console.log("🔥 inputImagens.style.display:", inputImagens.style.display);
      
      // Garantir que o input está visível e habilitado
      inputImagens.disabled = false;
      inputImagens.style.display = 'block';
      inputImagens.style.opacity = '0';
      inputImagens.style.position = 'absolute';
      inputImagens.style.left = '-9999px';
      
      // Tentar clicar no input
      try {
        inputImagens.click();
        console.log("🔥 inputImagens.click() executado com sucesso");
      } catch (error) {
        console.error("🔥 ERRO ao executar inputImagens.click():", error);
        
        // Fallback: criar um novo input temporário
        console.log("🔥 Tentando fallback com input temporário...");
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = 'image/*';
        tempInput.multiple = true;
        tempInput.style.display = 'none';
        
        tempInput.addEventListener('change', (tempE) => {
          console.log("🔥 CHANGE no input temporário");
          const files = Array.from(tempE.target.files);
          console.log("🔥 Arquivos selecionados via fallback:", files.length);
          processarArquivosImagem(files);
          document.body.removeChild(tempInput);
        });
        
        document.body.appendChild(tempInput);
        tempInput.click();
      }
    };
    
    // Remover event listeners antigos se existirem
    uploadArea.removeEventListener('click', clickHandler);
    // Adicionar novo event listener
    uploadArea.addEventListener('click', clickHandler);
    
    // 🔥 EVENTOS DE DRAG & DROP
    const dragOverHandler = (e) => {
      console.log("🔥 DRAGOVER na área de upload");
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('drag-over');
    };
    
    const dragLeaveHandler = (e) => {
      console.log("🔥 DRAGLEAVE na área de upload");
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('drag-over');
    };
    
    const dropHandler = (e) => {
      console.log("🔥 DROP na área de upload");
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      console.log("🔥 Arquivos arrastados:", files.length);
      processarArquivosImagem(files);
    };
    
    // Remover event listeners antigos
    uploadArea.removeEventListener('dragover', dragOverHandler);
    uploadArea.removeEventListener('dragleave', dragLeaveHandler);
    uploadArea.removeEventListener('drop', dropHandler);
    
    // Adicionar novos event listeners
    uploadArea.addEventListener('dragover', dragOverHandler);
    uploadArea.addEventListener('dragleave', dragLeaveHandler);
    uploadArea.addEventListener('drop', dropHandler);
    
    // 🔥 EVENTO DE MUDANÇA NO INPUT
    const changeHandler = (e) => {
      console.log("🔥 CHANGE no input de imagens");
      console.log("🔥 Evento target:", e.target);
      console.log("🔥 e.target.files:", e.target.files);
      console.log("🔥 e.target.files.length:", e.target.files ? e.target.files.length : 'undefined');
      
      if (!e.target.files || e.target.files.length === 0) {
        console.log("🔥 AVISO: Nenhum arquivo foi selecionado");
        return;
      }
      
      const files = Array.from(e.target.files);
      console.log("🔥 Arquivos selecionados:", files.length);
      console.log("🔥 Lista de arquivos:", files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      processarArquivosImagem(files);
    };
    
    // Remover e adicionar event listener
    inputImagens.removeEventListener('change', changeHandler);
    inputImagens.addEventListener('change', changeHandler);
    
    // Inicializar modal de visualização de imagem
    inicializarModalImagem();
    
    console.log('🔥 Upload de imagens INICIALIZADO COM SUCESSO');
    
    // 🔥 TESTE IMEDIATO - verificar se o click funciona
    setTimeout(() => {
      console.log("🔥 TESTE: Simulando click para verificar funcionamento...");
      const testEvent = new Event('click', { bubbles: true });
      uploadArea.dispatchEvent(testEvent);
    }, 1000);
  }

  // Processar arquivos de imagem selecionados
  async function processarArquivosImagem(files) {
    console.log("🔥 PROCESSANDO ARQUIVOS DE IMAGEM:");
    console.log("🔥 Quantidade de arquivos recebidos:", files.length);
    console.log("🔥 Arquivos:", files);
    
    const arquivosValidos = files.filter(file => validarArquivoImagem(file));
    
    console.log("🔥 Arquivos válidos após validação:", arquivosValidos.length);
    
    if (arquivosValidos.length === 0) {
      console.error("🔥 ERRO: Nenhum arquivo de imagem válido selecionado");
      mostrarErroUpload('Nenhum arquivo de imagem válido selecionado');
      return;
    }
    
    // Verificar limite de imagens
    console.log("🔥 Imagens já selecionadas:", imagensSelecionadas.length);
    console.log("🔥 Total após adição:", imagensSelecionadas.length + arquivosValidos.length);
    
    if (imagensSelecionadas.length + arquivosValidos.length > 10) {
      console.error("🔥 ERRO: Limite de 10 imagens excedido");
      mostrarErroUpload('Máximo de 10 imagens permitidas por evolução');
      return;
    }
    
    console.log("🔥 Processando cada arquivo individualmente...");
    
    // Processar cada arquivo
    for (let i = 0; i < arquivosValidos.length; i++) {
      const file = arquivosValidos[i];
      console.log(`🔥 Processando arquivo ${i + 1}/${arquivosValidos.length}: ${file.name}`);
      
      try {
        console.log(`🔥 Redimensionando imagem: ${file.name}`);
        const imagemRedimensionada = await redimensionarImagem(file);
        console.log(`🔥 Imagem redimensionada com sucesso. Tamanho original: ${file.size}, novo: ${imagemRedimensionada.size}`);
        
        const imagemProcessada = {
          file: new File([imagemRedimensionada], file.name, { type: 'image/jpeg' }),
          nomeOriginal: file.name,
          tamanho: imagemRedimensionada.size,
          preview: URL.createObjectURL(imagemRedimensionada)
        };
        
        imagensSelecionadas.push(imagemProcessada);
        console.log(`🔥 Imagem adicionada ao array. Total de imagens: ${imagensSelecionadas.length}`);
        
        adicionarPreviewImagem(imagemProcessada, imagensSelecionadas.length - 1);
        console.log(`🔥 Preview da imagem ${file.name} adicionado`);
        
      } catch (error) {
        console.error(`🔥 ERRO ao processar imagem ${file.name}:`, error);
        mostrarErroUpload(`Erro ao processar ${file.name}`);
      }
    }
    
    console.log("🔥 Atualizando estado do upload...");
    atualizarEstadoUpload();
    console.log("🔥 PROCESSAMENTO CONCLUÍDO");
  }

  // Validar arquivo de imagem
  function validarArquivoImagem(file) {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB
    
    if (!tiposPermitidos.includes(file.type)) {
      mostrarErroUpload(`Tipo de arquivo não suportado: ${file.name}`);
      return false;
    }
    
    if (file.size > tamanhoMaximo) {
      mostrarErroUpload(`Arquivo muito grande: ${file.name} (máx. 5MB)`);
      return false;
    }
    
    return true;
  }

  // Redimensionar imagem
  function redimensionarImagem(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          const { width, height } = calcularDimensoes(img.width, img.height, maxWidth, maxHeight);
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Calcular novas dimensões mantendo proporção
  function calcularDimensoes(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  // Adicionar preview da imagem
  function adicionarPreviewImagem(imagem, indice) {
    const previewContainer = document.getElementById('preview-imagens');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
      <img src="${imagem.preview}" alt="${imagem.nomeOriginal}">
      <button class="remove-btn" onclick="removerImagem(${indice})">
        <i class="fas fa-times"></i>
      </button>
      <div class="file-info">
        ${(imagem.tamanho / 1024).toFixed(0)}KB
      </div>
    `;
    
    previewContainer.appendChild(previewItem);
  }

  // Remover imagem da seleção
  function removerImagem(indice) {
    // Revogar URL de preview para liberar memória
    URL.revokeObjectURL(imagensSelecionadas[indice].preview);
    
    // Remover do array
    imagensSelecionadas.splice(indice, 1);
    
    // Recriar previews
    const previewContainer = document.getElementById('preview-imagens');
    previewContainer.innerHTML = '';
    
    imagensSelecionadas.forEach((imagem, i) => {
      adicionarPreviewImagem(imagem, i);
    });
    
    atualizarEstadoUpload();
  }

  // Atualizar estado da interface de upload
  function atualizarEstadoUpload() {
    const uploadArea = document.getElementById('upload-area');
    const placeholder = uploadArea.querySelector('.upload-placeholder p');
    
    if (imagensSelecionadas.length > 0) {
      placeholder.textContent = `${imagensSelecionadas.length} imagem(ns) selecionada(s)`;
      uploadArea.classList.add('upload-success');
    } else {
      placeholder.textContent = 'Clique para selecionar imagens ou arraste aqui';
      uploadArea.classList.remove('upload-success');
    }
  }

  // Mostrar erro de upload
  function mostrarErroUpload(mensagem) {
    // Remover erro anterior se existir
    const erroAnterior = document.querySelector('.erro-upload');
    if (erroAnterior) {
      erroAnterior.remove();
    }
    
    const uploadSection = document.querySelector('.upload-imagens-section');
    const erroDiv = document.createElement('div');
    erroDiv.className = 'erro-upload';
    erroDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;
    
    uploadSection.appendChild(erroDiv);
    
    // Remover erro após 5 segundos
    setTimeout(() => {
      erroDiv.remove();
    }, 5000);
  }

  // Upload das imagens para Firebase Storage
  async function uploadImagensParaStorage(pacienteId, evolucaoId) {
    console.log("🔥 INICIANDO UPLOAD PARA FIREBASE STORAGE");
    console.log("🔥 PacienteId:", pacienteId);
    console.log("🔥 EvolucaoId:", evolucaoId);
    console.log("🔥 Imagens selecionadas:", imagensSelecionadas.length);
    
    const urlsImagens = [];
    const metadadosImagens = [];
    
    if (imagensSelecionadas.length === 0) {
      console.log("🔥 Nenhuma imagem selecionada, retornando arrays vazios");
      return { urls: urlsImagens, metadados: metadadosImagens };
    }
    
    // Verificar se o Firebase Storage está disponível
    if (!window.storage) {
      console.error("🔥 ERRO: Firebase Storage não está disponível");
      throw new Error("Firebase Storage não configurado");
    }
    
    if (!firebase.storage) {
      console.error("🔥 ERRO: firebase.storage não está disponível");
      throw new Error("Firebase Storage SDK não carregado");
    }
    
    console.log("🔥 Firebase Storage disponível, iniciando upload...");
    
    mostrarProgressoUpload();
    
    try {
      for (let i = 0; i < imagensSelecionadas.length; i++) {
        const imagem = imagensSelecionadas[i];
        console.log(`🔥 Fazendo upload da imagem ${i + 1}/${imagensSelecionadas.length}: ${imagem.nomeOriginal}`);
        
        // Atualizar progresso
        const progresso = ((i + 1) / imagensSelecionadas.length) * 100;
        console.log(`🔥 Progresso do upload: ${progresso.toFixed(1)}%`);
        atualizarProgressoUpload(progresso);
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const nomeArquivo = `${timestamp}_${i}_${imagem.nomeOriginal.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        console.log(`🔥 Nome do arquivo no Storage: ${nomeArquivo}`);
        
        // Fazer upload para Storage
        console.log(`🔥 Criando referência no Storage: evolucoes/${pacienteId}/${evolucaoId}/${nomeArquivo}`);
        const storageRef = firebase.storage().ref();
        const imagemRef = storageRef.child(`evolucoes/${pacienteId}/${evolucaoId}/${nomeArquivo}`);
        
        console.log(`🔥 Iniciando upload do arquivo (${imagem.tamanho} bytes)`);
        const snapshot = await imagemRef.put(imagem.file);
        console.log(`🔥 Upload concluído para ${imagem.nomeOriginal}`);
        
        console.log(`🔥 Obtendo URL de download...`);
        const url = await snapshot.ref.getDownloadURL();
        console.log(`🔥 URL obtida: ${url.substring(0, 50)}...`);
        
        urlsImagens.push(url);
        metadadosImagens.push({
          nomeOriginal: imagem.nomeOriginal,
          tamanho: imagem.tamanho,
          tipo: imagem.file.type,
          dataUpload: new Date() // Usar new Date() em vez de serverTimestamp() para arrays
        });
        
        console.log(`🔥 Imagem ${i + 1} processada com sucesso`);
      }
      
      esconderProgressoUpload();
      console.log(`🔥 UPLOAD CONCLUÍDO! ${urlsImagens.length} imagens enviadas`);
      console.log(`🔥 URLs geradas:`, urlsImagens);
      
      return { urls: urlsImagens, metadados: metadadosImagens };
      
    } catch (error) {
      console.error('🔥 ERRO CRÍTICO no upload das imagens:', error);
      console.error('🔥 Detalhes do erro:', error.message);
      console.error('🔥 Stack trace:', error.stack);
      esconderProgressoUpload();
      mostrarErroUpload('Erro ao fazer upload das imagens. Tente novamente.');
      throw error;
    }
  }

  // Mostrar barra de progresso
  function mostrarProgressoUpload() {
    const progressContainer = document.getElementById('progress-container');
    const uploadArea = document.getElementById('upload-area');
    
    progressContainer.style.display = 'flex';
    uploadArea.classList.add('upload-loading');
    
    atualizarProgressoUpload(0);
  }

  // Atualizar progresso do upload
  function atualizarProgressoUpload(porcentagem) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressFill.style.width = `${porcentagem}%`;
    progressText.textContent = `${Math.round(porcentagem)}%`;
  }

  // Esconder barra de progresso
  function esconderProgressoUpload() {
    const progressContainer = document.getElementById('progress-container');
    const uploadArea = document.getElementById('upload-area');
    
    progressContainer.style.display = 'none';
    uploadArea.classList.remove('upload-loading');
  }

  // Limpar seleção de imagens
  function limparImagensSelecionadas() {
    // Revogar URLs de preview
    imagensSelecionadas.forEach(imagem => {
      URL.revokeObjectURL(imagem.preview);
    });
    
    imagensSelecionadas = [];
    
    const previewContainer = document.getElementById('preview-imagens');
    previewContainer.innerHTML = '';
    
    const inputImagens = document.getElementById('input-imagens');
    inputImagens.value = '';
    
    atualizarEstadoUpload();
    esconderProgressoUpload();
    
    // Remover mensagens de erro
    const erroUpload = document.querySelector('.erro-upload');
    if (erroUpload) {
      erroUpload.remove();
    }
  }

  // Renderizar galeria de imagens na evolução
  function renderizarGaleriaImagens(imagens) {
    if (!imagens || imagens.length === 0) return '';
    
    return `
      <div class="evolucao-galeria">
        <h5>📸 Imagens Anexadas (${imagens.length})</h5>
        <div class="galeria-imagens">
          ${imagens.map((url, index) => `
            <div class="galeria-item" onclick="abrirImagemModal(${JSON.stringify(imagens).replace(/"/g, '&quot;')}, ${index})">
              <img src="${url}" alt="Imagem ${index + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Inicializar modal de visualização de imagem
  function inicializarModalImagem() {
    const modalImagem = document.getElementById('modal-imagem');
    const closeBtn = modalImagem.querySelector('.close-button');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    
    // Fechar modal
    closeBtn.addEventListener('click', () => {
      modalImagem.style.display = 'none';
    });
    
    // Fechar ao clicar fora da imagem
    modalImagem.addEventListener('click', (e) => {
      if (e.target === modalImagem) {
        modalImagem.style.display = 'none';
      }
    });
    
    // Navegação entre imagens
    btnAnterior.addEventListener('click', () => navegarImagem(-1));
    btnProximo.addEventListener('click', () => navegarImagem(1));
    
    // Navegação por teclado
    document.addEventListener('keydown', (e) => {
      if (modalImagem.style.display === 'block') {
        if (e.key === 'ArrowLeft') navegarImagem(-1);
        if (e.key === 'ArrowRight') navegarImagem(1);
        if (e.key === 'Escape') modalImagem.style.display = 'none';
      }
    });
  }

  // Abrir modal de visualização de imagem
  function abrirImagemModal(imagens, indiceInicial = 0) {
    imagensParaVisualizar = imagens;
    indiceImagemAtual = indiceInicial;
    
    const modalImagem = document.getElementById('modal-imagem');
    modalImagem.style.display = 'block';
    
    atualizarImagemModal();
  }

  // Atualizar imagem no modal
  function atualizarImagemModal() {
    const imagemAmpliada = document.getElementById('imagem-ampliada');
    const contadorImagens = document.getElementById('contador-imagens');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    
    // Atualizar imagem
    imagemAmpliada.src = imagensParaVisualizar[indiceImagemAtual];
    
    // Atualizar contador
    contadorImagens.textContent = `${indiceImagemAtual + 1} / ${imagensParaVisualizar.length}`;
    
    // Atualizar botões de navegação
    btnAnterior.disabled = indiceImagemAtual === 0;
    btnProximo.disabled = indiceImagemAtual === imagensParaVisualizar.length - 1;
    
    // Esconder navegação se só houver uma imagem
    const navegacao = document.querySelector('.navegacao-imagens');
    navegacao.style.display = imagensParaVisualizar.length > 1 ? 'flex' : 'none';
  }

  // Navegar entre imagens
  function navegarImagem(direcao) {
    const novoIndice = indiceImagemAtual + direcao;
    
    if (novoIndice >= 0 && novoIndice < imagensParaVisualizar.length) {
      indiceImagemAtual = novoIndice;
      atualizarImagemModal();
    }
  }

  // Expor função globalmente para usar nos templates
  window.abrirImagemModal = abrirImagemModal;
  window.removerImagem = removerImagem;

  // Inicializar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    console.log("🔥 DOM pronto para inicialização de upload");
    // Aguardar um pouco para garantir que outros elementos foram inicializados
    setTimeout(() => {
      console.log("🔥 Primeira tentativa de inicialização do upload de imagens");
      inicializarUploadImagens();
    }, 1000);
    
    // Segunda tentativa após um tempo maior para garantir que funcione
    setTimeout(() => {
      console.log("🔥 Segunda tentativa de inicialização do upload de imagens");
      const uploadArea = document.getElementById('upload-area');
      if (!uploadArea) {
        console.error("🔥 Ainda não encontrou upload-area, tentando novamente em 2s...");
        setTimeout(() => {
          console.log("🔥 Terceira tentativa de inicialização do upload de imagens");
          inicializarUploadImagens();
        }, 2000);
      } else {
        console.log("🔥 Upload-area encontrado na segunda tentativa");
      }
    }, 2000);
  });

  // Função utilitária para garantir que o upload está inicializado
  function garantirUploadInicializado() {
    console.log("🔥 GARANTIR UPLOAD INICIALIZADO - Verificando...");
    
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) {
      console.log("🔥 Upload area não encontrada, não é possível inicializar");
      return false;
    }
    
    if (uploadArea.dataset.uploadInicializado !== 'true') {
      console.log("🔥 Upload não foi inicializado, inicializando agora...");
      inicializarUploadImagens();
      return true;
    } else {
      console.log("🔥 Upload já está inicializado");
      return true;
    }
  }

  // 🔥 FUNÇÃO DE TESTE ESPECÍFICA PARA DEBUG
  function testarUploadImagens() {
    console.log("🔥 === TESTE COMPLETO DE UPLOAD ===");
    
    const uploadArea = document.getElementById('upload-area');
    const inputImagens = document.getElementById('input-imagens');
    const previewContainer = document.getElementById('preview-imagens');
    
    console.log("🔥 TESTE - Elementos:");
    console.log("🔥 - uploadArea exists:", !!uploadArea);
    console.log("🔥 - inputImagens exists:", !!inputImagens);
    console.log("🔥 - previewContainer exists:", !!previewContainer);
    
    if (!uploadArea || !inputImagens || !previewContainer) {
      console.error("🔥 TESTE FALHOU - Elementos não encontrados");
      return false;
    }
    
    console.log("🔥 TESTE - Propriedades do input:");
    console.log("🔥 - disabled:", inputImagens.disabled);
    console.log("🔥 - type:", inputImagens.type);
    console.log("🔥 - accept:", inputImagens.accept);
    console.log("🔥 - multiple:", inputImagens.multiple);
    console.log("🔥 - style.display:", inputImagens.style.display);
    
    console.log("🔥 TESTE - Upload inicializado?", uploadArea.dataset.uploadInicializado);
    
    console.log("🔥 TESTE - Testando click programático...");
    try {
      inputImagens.click();
      console.log("🔥 TESTE - Click executado sem erro");
      return true;
    } catch (error) {
      console.error("🔥 TESTE - Erro no click:", error);
      return false;
    }
  }

  // Expor funções necessárias globalmente
  window.uploadImagensParaStorage = uploadImagensParaStorage;
  window.renderizarGaleriaImagens = renderizarGaleriaImagens;
  window.limparImagensSelecionadas = limparImagensSelecionadas;
  window.garantirUploadInicializado = garantirUploadInicializado;
  window.inicializarUploadImagens = inicializarUploadImagens;
  window.testarUploadImagens = testarUploadImagens;
}); 