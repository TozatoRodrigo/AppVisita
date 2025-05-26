// Módulo para gerenciamento de pacientes e evoluções médicas
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado em app-pacientes.js");
  
  // Elementos DOM
  const formAdicionarPaciente = document.getElementById('form-adicionar-paciente');
  const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
  const ordenarPorSelect = document.getElementById('ordenar-por');
  const modalEvolucao = document.getElementById('modal-evolucao');
  const formEvolucao = document.getElementById('form-evolucao');
  const historicoEvolucoes = document.getElementById('historico-evolucoes');
  
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
    inicializarSugestoesPacientes(); // VERSÃO ULTRA MINIMALISTA ATIVADA
    
    
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
          const statusPaciente = document.getElementById('status-paciente').value;
          
          if (!pacienteId || !textoEvolucao || !statusPaciente) {
            AppModulos.UI.mostrarNotificacao('Preencha todos os campos obrigatórios', 'aviso');
            return;
          }
          
          // Mostrar loading
          const esconderLoading = AppModulos.UI.mostrarLoading('Processando evolução e imagens...');
          
          // Gerar ID único para esta evolução
          const evolucaoId = `evolucao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Fazer upload das imagens se houver
          let imagensData = { urls: [], metadados: [] };
          console.log("🖼️ Verificando se há imagens para upload...");
          console.log("🖼️ imagensSelecionadas.length:", imagensSelecionadas.length);
          console.log("🔥 typeof window.uploadImagensParaStorage:", typeof window.uploadImagensParaStorage);
          
          if (typeof window.uploadImagensParaStorage === 'function') {
            console.log("🖼️ Função uploadImagensParaStorage encontrada, iniciando upload...");
            try {
              imagensData = await window.uploadImagensParaStorage(pacienteId, evolucaoId);
              console.log("🖼️ Upload concluído. URLs:", imagensData.urls);
            } catch (error) {
              console.error('🖼️ Erro no upload das imagens:', error);
              esconderLoading();
              AppModulos.UI.mostrarNotificacao('Erro ao fazer upload das imagens. Verifique sua conexão e tente novamente.', 'erro');
              return;
            }
          } else {
            console.warn("🖼️ Função uploadImagensParaStorage NÃO encontrada!");
            console.log("🖼️ window.uploadImagensParaStorage:", window.uploadImagensParaStorage);
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
            console.log("🖼️ SALVANDO EVOLUÇÃO COM IMAGENS:");
            console.log("🖼️ URLs das imagens:", imagensData.urls);
            console.log("🖼️ Metadados:", imagensData.metadados);
          } else {
            console.log("🖼️ Salvando evolução SEM imagens");
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
    
    // Separar pacientes entre pendentes e visitados hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Início do dia de hoje
    
    const pacientesPendentes = [];
    const pacientesVisitados = [];
    
    pacientes.forEach(paciente => {
      // Verificar se foi visitado hoje
      const foiVisitadoHoje = verificarSeVisitadoHoje(paciente, hoje);
      
      // Nova lógica para alta e óbito
      if (paciente.status === 'alta' || paciente.status === 'obito') {
        // Se tem alta/óbito e foi visitado hoje, aparece como visitado
        if (foiVisitadoHoje) {
          console.log(`Paciente ${paciente.nome} com ${paciente.status} visitado hoje - aparece como visitado`);
          pacientesVisitados.push(paciente);
        }
        // Se tem alta/óbito mas não foi visitado hoje, não aparece em lugar nenhum 
        // (a partir de amanhã não aparecerá mais)
        else {
          console.log(`Paciente ${paciente.nome} com ${paciente.status} não visitado hoje - não aparece`);
        }
      }
      // Pacientes internados seguem a lógica original
      else if (paciente.status === 'internado') {
        if (foiVisitadoHoje) {
          pacientesVisitados.push(paciente);
        } else {
          pacientesPendentes.push(paciente);
        }
      }
      // Outros status (se houver) não aparecem
    });
    
    console.log(`Pacientes pendentes: ${pacientesPendentes.length}, Visitados hoje: ${pacientesVisitados.length}`);
    
    // Ordenar cada lista conforme método
    let pacientesPendentesOrdenados = ordenarListaPacientes(pacientesPendentes, metodo);
    let pacientesVisitadosOrdenados = ordenarListaPacientes(pacientesVisitados, metodo);
    
    // Renderizar ambas as listas
    renderizarPacientesSecionados(pacientesPendentesOrdenados, pacientesVisitadosOrdenados);
  }

  // Função auxiliar para verificar se paciente foi visitado hoje
  function verificarSeVisitadoHoje(paciente, hoje) {
    if (!paciente.evolucoes || paciente.evolucoes.length === 0) {
      return false;
    }
    
    // Verificar se há alguma evolução de hoje
    return paciente.evolucoes.some(evolucao => {
      if (!evolucao.dataRegistro) return false;
      
      let dataEvolucao;
      
      // Lidar com diferentes formatos de data
      if (evolucao.dataRegistro.seconds) {
        // Timestamp do Firestore
        dataEvolucao = new Date(evolucao.dataRegistro.seconds * 1000);
      } else if (evolucao.dataRegistro instanceof Date) {
        // Objeto Date
        dataEvolucao = evolucao.dataRegistro;
      } else if (typeof evolucao.dataRegistro === 'string') {
        // String de data
        dataEvolucao = new Date(evolucao.dataRegistro);
      } else {
        return false;
      }
      
      dataEvolucao.setHours(0, 0, 0, 0);
      return dataEvolucao.getTime() === hoje.getTime();
    });
  }

  // Função auxiliar para ordenar lista de pacientes
  function ordenarListaPacientes(pacientes, metodo) {
    switch (metodo) {
      case 'nome':
        return pacientes.sort((a, b) => a.nome.localeCompare(b.nome));
      case 'adicao':
      default:
        return pacientes.sort((a, b) => {
          const dataA = a.dataRegistro ? (a.dataRegistro.seconds || 0) : 0;
          const dataB = b.dataRegistro ? (b.dataRegistro.seconds || 0) : 0;
          return dataB - dataA; // Mais recentes primeiro
        });
    }
  }

  // Função para renderizar pacientes em seções separadas
  function renderizarPacientesSecionados(pacientesPendentes, pacientesVisitados) {
    const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
    const listaPacientesVisitados = document.getElementById('lista-pacientes-visitados');
    const contadorPendentes = document.getElementById('contador-pendentes');
    const contadorVisitados = document.getElementById('contador-visitados');
    
    if (!listaPacientesPendentes || !listaPacientesVisitados) {
      console.error("Elementos das listas de pacientes não encontrados");
      return;
    }
    
    // Atualizar contadores
    if (contadorPendentes) contadorPendentes.textContent = pacientesPendentes.length;
    if (contadorVisitados) contadorVisitados.textContent = pacientesVisitados.length;
    
    // Renderizar lista de pendentes
    renderizarListaPacientes(listaPacientesPendentes, pacientesPendentes, 'pendente');
    
    // Renderizar lista de visitados
    renderizarListaPacientes(listaPacientesVisitados, pacientesVisitados, 'visitado');
  }

  // Função unificada para renderizar uma lista de pacientes
  function renderizarListaPacientes(elemento, pacientes, tipo) {
    // Limpar lista atual
    elemento.innerHTML = '';
    
    // Se não houver pacientes, mostrar mensagem
    if (!pacientes || pacientes.length === 0) {
      const mensagem = tipo === 'pendente' 
        ? 'Nenhum paciente pendente de visita.' 
        : 'Nenhum paciente visitado hoje.';
      
      const submensagem = tipo === 'pendente'
        ? 'Adicione um novo paciente para iniciar as visitas.'
        : 'Registre evoluções para que os pacientes apareçam aqui.';
      
      elemento.innerHTML = `
        <li class="paciente-item paciente-vazio">
          <div class="paciente-vazio-mensagem">
            <i class="fas ${tipo === 'pendente' ? 'fa-user-plus' : 'fa-clipboard-check'}"></i>
            <p>${mensagem}</p>
            <small>${submensagem}</small>
          </div>
        </li>
      `;
      return;
    }
    
    // Renderizar cada paciente
    pacientes.forEach(paciente => {
      const pacienteItem = criarElementoPaciente(paciente, tipo);
      elemento.appendChild(pacienteItem);
    });
  }

  // Função para criar elemento de um paciente
  function criarElementoPaciente(paciente, tipo) {
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
    
    // Obter informações da última visita se for paciente visitado
    let infoUltimaVisita = '';
    if (tipo === 'visitado') {
      const ultimaEvolucao = obterUltimaEvolucaoHoje(paciente);
      if (ultimaEvolucao) {
        const horaVisita = AppVisita.Utils.formatarDataHora(ultimaEvolucao.dataRegistro).split(' ')[1];
        infoUltimaVisita = `
          <div class="info-item info-visita">
            <i class="fas fa-clock"></i> 
            Visitado às ${horaVisita} por ${ultimaEvolucao.medicoEmail || 'Médico'}
          </div>
        `;
      }
    }
    
    // Texto do botão baseado no tipo
    const textoBotao = tipo === 'visitado' ? 'Nova Evolução' : 'Registrar Evolução';
    const iconeBotao = tipo === 'visitado' ? 'fa-plus' : 'fa-clipboard-list';
    
    // HTML do paciente
    pacienteItem.innerHTML = `
      <div class="paciente-header">
        <h3 class="paciente-nome" data-id="${paciente.id}" title="Clique para ver dados completos">${paciente.nome}</h3>
        <span class="paciente-id">ID: ${paciente.idInternacao}</span>
      </div>
      <div class="paciente-info">
        <div class="info-item"><i class="fas fa-hospital"></i> Local: ${paciente.localLeito}</div>
        <div class="info-item"><i class="fas fa-birthday-cake"></i> Nascimento: ${dataNascimento}</div>
        <div class="info-item"><i class="fas fa-users"></i> Equipe: ${equipeNome}</div>
        <div class="info-item"><i class="fas fa-calendar-plus"></i> Adicionado: ${dataRegistro}</div>
        ${infoUltimaVisita}
      </div>
      <div class="paciente-actions">
        <button class="btn-registrar-evolucao" data-id="${paciente.id}" data-nome="${paciente.nome}">
          <i class="fas ${iconeBotao}"></i> ${textoBotao}
        </button>
      </div>
    `;
    
    // Configurar botão de evolução
    const btnEvolucao = pacienteItem.querySelector('.btn-registrar-evolucao');
    if (btnEvolucao) {
      btnEvolucao.addEventListener('click', function() {
        abrirModalEvolucao(this.dataset.id, this.dataset.nome);
      });
    }
    
    // Configurar clique no nome do paciente para abrir perfil completo
    const nomePaciente = pacienteItem.querySelector('.paciente-nome');
    if (nomePaciente) {
      nomePaciente.addEventListener('click', function() {
        abrirModalPerfilPaciente(this.dataset.id);
      });
    }
    
    return pacienteItem;
  }

  // Função auxiliar para obter a última evolução de hoje
  function obterUltimaEvolucaoHoje(paciente) {
    if (!paciente.evolucoes || paciente.evolucoes.length === 0) {
      return null;
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const evolucoesHoje = paciente.evolucoes.filter(evolucao => {
      if (!evolucao.dataRegistro) return false;
      
      let dataEvolucao;
      
      if (evolucao.dataRegistro.seconds) {
        dataEvolucao = new Date(evolucao.dataRegistro.seconds * 1000);
      } else if (evolucao.dataRegistro instanceof Date) {
        dataEvolucao = evolucao.dataRegistro;
      } else if (typeof evolucao.dataRegistro === 'string') {
        dataEvolucao = new Date(evolucao.dataRegistro);
      } else {
        return false;
      }
      
      dataEvolucao.setHours(0, 0, 0, 0);
      return dataEvolucao.getTime() === hoje.getTime();
    });
    
    if (evolucoesHoje.length === 0) return null;
    
    // Retornar a evolução mais recente do dia
    return evolucoesHoje.sort((a, b) => {
      const dataA = a.dataRegistro.seconds || a.dataRegistro.getTime?.() || 0;
      const dataB = b.dataRegistro.seconds || b.dataRegistro.getTime?.() || 0;
      return dataB - dataA;
    })[0];
  }
  
  // Função para abrir modal de evolução
  function abrirModalEvolucao(pacienteId, pacienteNome) {
    if (!modalEvolucao) {
      console.error("Modal de evolução não encontrado");
      return;
    }
    
    try {
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
      
      // Limpar formulário de evolução
      const formEvolucao = document.getElementById('form-evolucao');
      if (formEvolucao) {
        formEvolucao.reset();
        // Restaurar o ID do paciente após o reset
        if (idInput) {
          idInput.value = pacienteId;
        }
      }
      
      // Carregar histórico de evoluções
      carregarHistoricoEvolucoes(pacienteId);
      
      // Exibir modal
      modalEvolucao.style.display = 'block';
      modalEvolucao.style.zIndex = '1000';
      
      // Garantir que o modal esteja visível (forçar estilo)
      modalEvolucao.classList.remove('hidden');
      modalEvolucao.style.visibility = 'visible';
      modalEvolucao.style.opacity = '1';
      
      // Scroll para o topo da página
      window.scrollTo(0, 0);
      
      // Debug: verificar se o modal está realmente visível
      console.log("🔥 Modal exibido. Display:", modalEvolucao.style.display);
      console.log("🔥 Modal computedStyle.display:", window.getComputedStyle(modalEvolucao).display);
      console.log("🔥 Modal offsetHeight:", modalEvolucao.offsetHeight);
      console.log("🔥 Modal offsetWidth:", modalEvolucao.offsetWidth);
      
      // Aguardar um momento para o modal estar completamente visível
      setTimeout(() => {
        console.log("🔥 MODAL DE EVOLUÇÃO ABERTO - Inicializando funcionalidades");
        
        // Garantir que o modal de imagem está inicializado
        inicializarModalImagem();
        
        // Limpar imagens da sessão anterior
        if (typeof limparImagensSelecionadas === 'function') {
          try {
            limparImagensSelecionadas();
          } catch (error) {
            console.warn("Erro ao limpar imagens:", error);
          }
        }
        
        // Inicializar upload de imagens
        try {
          inicializarUploadImagens();
        } catch (error) {
          console.error("Erro ao inicializar upload:", error);
        }
      }, 300);
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
        console.log("🖼️ DEBUG - Evolução:", {
          id: evolucao.id,
          temImagens: !!evolucao.imagens,
          quantidadeImagens: evolucao.imagens ? evolucao.imagens.length : 0,
          imagens: evolucao.imagens
        });
        
        const dataFormatada = AppVisita.Utils.formatarDataHora(evolucao.dataRegistro);
        const statusText = evolucao.status === 'internado' ? 'Continua Internado' : 
                          evolucao.status === 'alta' ? 'Alta Hospitalar' : 'Óbito';
        
        const statusClass = evolucao.status === 'internado' ? 'status-internado' : 
                           evolucao.status === 'alta' ? 'status-alta' : 'status-obito';
        
        // Renderizar galeria de imagens se houver
        let galeriaImagens = '';
        if (evolucao.imagens && evolucao.imagens.length > 0) {
          console.log("🖼️ Renderizando galeria para evolução com", evolucao.imagens.length, "imagens");
          
          // Tentar usar a função global primeiro
          if (typeof window.renderizarGaleriaImagens === 'function') {
            galeriaImagens = window.renderizarGaleriaImagens(evolucao.imagens);
            console.log("🖼️ HTML da galeria gerado:", galeriaImagens.substring(0, 100));
          } 
          // Fallback: usar a função local
          else if (typeof renderizarGaleriaImagens === 'function') {
            galeriaImagens = renderizarGaleriaImagens(evolucao.imagens);
            console.log("🖼️ HTML da galeria gerado (local):", galeriaImagens.substring(0, 100));
          } 
          // Fallback final: criar HTML manualmente
          else {
            console.warn("🖼️ Função renderizarGaleriaImagens não encontrada, criando HTML manualmente");
            galeriaImagens = `
              <div class="evolucao-galeria">
                <h5>📸 Imagens Anexadas (${evolucao.imagens.length})</h5>
                <div class="galeria-imagens">
                  ${evolucao.imagens.map((url, index) => `
                    <div class="galeria-item" onclick="window.abrirImagemModal(${JSON.stringify(evolucao.imagens).replace(/"/g, '&quot;')}, ${index})">
                      <img src="${url}" alt="Imagem ${index + 1}" loading="lazy" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer;">
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            console.log("🖼️ HTML manual criado:", galeriaImagens.substring(0, 100));
          }
        } else {
          console.log("🖼️ Nenhuma imagem encontrada para esta evolução");
        }
        
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

  // Função para inicializar sistema de sugestão de pacientes para reinternação (VERSÃO ULTRA MINIMALISTA)
  function inicializarSugestoesPacientes() {
    console.log("🔧 Inicializando sistema de sugestões - versão ULTRA MINIMALISTA...");
    
    const nomePacienteInput = document.getElementById('nome-paciente');
    if (!nomePacienteInput) {
      console.warn("Campo nome-paciente não encontrado");
      return;
    }
    
    // Verificar se já foi inicializado
    if (nomePacienteInput.hasAttribute('data-sugestoes-inicializadas')) {
      console.log("Sugestões já inicializadas");
      return;
    }
    
    nomePacienteInput.setAttribute('data-sugestoes-inicializadas', 'true');
    
    // Criar container de sugestões com estilo ULTRA AGRESSIVO
    let sugestoesContainer = document.querySelector('.sugestoes-container');
    if (!sugestoesContainer) {
      sugestoesContainer = document.createElement('div');
      sugestoesContainer.className = 'sugestoes-container';
      
      // ESTILOS ULTRA AGRESSIVOS - FORÇA VISIBILIDADE
      sugestoesContainer.style.setProperty('position', 'absolute', 'important');
      sugestoesContainer.style.setProperty('top', '100%', 'important');
      sugestoesContainer.style.setProperty('left', '0', 'important');
      sugestoesContainer.style.setProperty('right', '0', 'important');
      sugestoesContainer.style.setProperty('width', '100%', 'important');
      sugestoesContainer.style.setProperty('backgroundColor', '#ffffff', 'important');
      sugestoesContainer.style.setProperty('border', '2px solid #007bff', 'important');
      sugestoesContainer.style.setProperty('borderTop', 'none', 'important');
      sugestoesContainer.style.setProperty('borderRadius', '0 0 8px 8px', 'important');
      sugestoesContainer.style.setProperty('boxShadow', '0 4px 12px rgba(0, 0, 0, 0.3)', 'important');
      sugestoesContainer.style.setProperty('zIndex', '999999', 'important');
      sugestoesContainer.style.setProperty('maxHeight', '250px', 'important');
      sugestoesContainer.style.setProperty('overflowY', 'auto', 'important');
      sugestoesContainer.style.setProperty('display', 'none', 'important');
      sugestoesContainer.style.setProperty('fontSize', '14px', 'important');
      sugestoesContainer.style.setProperty('fontFamily', 'Arial, sans-serif', 'important');
      sugestoesContainer.style.setProperty('visibility', 'visible', 'important');
      sugestoesContainer.style.setProperty('opacity', '1', 'important');
      
      // POSICIONAMENTO DO FORM GROUP
      const formGroup = nomePacienteInput.closest('.form-group');
      if (formGroup) {
        formGroup.style.position = 'relative';
        formGroup.style.zIndex = '10000';
        formGroup.appendChild(sugestoesContainer);
        console.log("✅ Container criado com estilos ULTRA AGRESSIVOS");
      } else {
        // Fallback: adicionar após o input
        nomePacienteInput.parentNode.style.position = 'relative';
        nomePacienteInput.parentNode.style.zIndex = '10000';
        nomePacienteInput.parentNode.appendChild(sugestoesContainer);
        console.log("✅ Container criado via FALLBACK");
      }
    }
    
    let timeoutBusca = null;
    
    // APENAS input event - ZERO interferência na digitação
    nomePacienteInput.addEventListener('input', function(e) {
      const termo = this.value.trim();
      
      if (timeoutBusca) clearTimeout(timeoutBusca);
      
      if (termo.length < 3) {
        sugestoesContainer.style.display = 'none';
        return;
      }
      
      if (!window.verificarFirebaseDisponivel || !window.verificarFirebaseDisponivel()) {
        return;
      }
      
      timeoutBusca = setTimeout(async () => {
        try {
          await buscarPacientesParaSugestao(termo, sugestoesContainer);
        } catch (error) {
          console.error("Erro na busca:", error);
          sugestoesContainer.style.display = 'none';
        }
      }, 300);
    });
    
    // Fechar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
      if (sugestoesContainer && 
          !sugestoesContainer.contains(e.target) && 
          e.target !== nomePacienteInput) {
        sugestoesContainer.style.display = 'none';
      }
    });
    
    console.log("✅ Sistema de sugestões ULTRA MINIMALISTA inicializado");
  }
  
  // Função para buscar pacientes para sugestão
  async function buscarPacientesParaSugestao(termo, container) {
    console.log("🔍 BUSCA INICIADA - Termo:", termo);
    
    try {
      // Verificar se o Firebase está disponível
      if (!window.verificarFirebaseDisponivel()) {
        console.error("🔍 ERRO: Firebase não disponível");
        throw new Error("Firebase não está disponível");
      }
      
      console.log("🔍 Firebase OK, iniciando busca...");
      
      // Mostrar indicador de carregamento
      container.innerHTML = `
        <div class="sugestao-loading">
          <i class="fas fa-spinner fa-spin"></i> Buscando pacientes...
        </div>
      `;
      container.style.display = 'block';
      console.log("🔍 Container de carregamento exibido");
      
      // Buscar por nome (case insensitive)
      const termoLower = termo.toLowerCase();
      
      // Busca mais inteligente: buscar todos os pacientes e filtrar no cliente
      // para permitir busca case-insensitive
      console.log("🔍 Executando query no Firestore...");
      const pacientesSnapshot = await window.db.collection('pacientes')
        .orderBy('nome')
        .limit(50) // Limitar para performance
        .get();
      
      console.log("🔍 Query executada. Documentos encontrados:", pacientesSnapshot.size);
      
      // Filtrar no cliente para busca mais flexível
      const pacientesFiltrados = [];
      pacientesSnapshot.forEach(doc => {
        const paciente = { id: doc.id, ...doc.data() };
        const nomeNormalizado = paciente.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const termoNormalizado = termoLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        console.log("🔍 Comparando:", paciente.nome, "com termo:", termo);
        
        if (nomeNormalizado.includes(termoNormalizado)) {
          console.log("🔍 ✅ MATCH encontrado:", paciente.nome);
          pacientesFiltrados.push(paciente);
        }
      });
      
      console.log("🔍 Pacientes filtrados:", pacientesFiltrados.length);
      
      // Ordenar por relevância (começa com o termo primeiro)
      pacientesFiltrados.sort((a, b) => {
        const nomeA = a.nome.toLowerCase();
        const nomeB = b.nome.toLowerCase();
        const startA = nomeA.startsWith(termoLower);
        const startB = nomeB.startsWith(termoLower);
        
        if (startA && !startB) return -1;
        if (!startA && startB) return 1;
        return nomeA.localeCompare(nomeB);
      });
      
      // Limitar a 8 resultados
      const resultados = pacientesFiltrados.slice(0, 8);
      console.log("🔍 Resultados finais:", resultados.length);
      
      // Se não encontrou resultados
      if (resultados.length === 0) {
        console.log("🔍 Nenhum resultado encontrado");
        container.innerHTML = `
          <div class="sugestao-sem-resultados">
            <i class="fas fa-search"></i>
            <p>Nenhum paciente encontrado com "${termo}"</p>
            <small>Verifique a grafia ou digite mais caracteres</small>
          </div>
        `;
        return;
      }
      
      console.log("🔍 Renderizando resultados...");
      // Renderizar resultados
      await renderizarSugestoesPacientes(resultados, container, termo);
      console.log("🔍 Resultados renderizados com sucesso");
      
    } catch (error) {
      console.error("🔍 ERRO na busca:", error);
      container.innerHTML = `
        <div class="sugestao-erro">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erro ao buscar pacientes</p>
          <small>Tente novamente em alguns instantes</small>
        </div>
      `;
    }
  }
  
  // Função para renderizar sugestões de pacientes
  async function renderizarSugestoesPacientes(pacientes, container, termo) {
    
    container.innerHTML = '';
    
    // Adicionar cabeçalho se houver resultados
    if (pacientes.length > 0) {
      const header = document.createElement('div');
      header.className = 'sugestoes-header';
      header.innerHTML = `
        <div class="sugestoes-titulo">
          <i class="fas fa-users"></i>
          <span>Pacientes encontrados</span>
        </div>
        <div class="sugestoes-hint">
          <i class="fas fa-info-circle"></i>
          <span>Clique para selecionar</span>
        </div>
      `;
      container.appendChild(header);
      
      // Renderizar cada paciente
      for (const paciente of pacientes) {
        const itemSugestao = await criarItemSugestao(paciente, termo);
        container.appendChild(itemSugestao);
      }
    }
    
    // FORÇAR EXIBIÇÃO COM LOGS DETALHADOS
    container.style.setProperty('display', 'block', 'important');
  }
  
  // Função para criar item de sugestão
  async function criarItemSugestao(paciente, termo) {
    const sugestaoItem = document.createElement('div');
    sugestaoItem.className = 'sugestao-item';
    
    // Formatar data de nascimento
    let dataNascimento = 'Não informada';
    let dataNascimentoFormatada = '';
    
    if (paciente.dataNascimento) {
      try {
        let dataObj;
        if (typeof paciente.dataNascimento === 'object' && 'seconds' in paciente.dataNascimento) {
          dataObj = new Date(paciente.dataNascimento.seconds * 1000);
        } else if (typeof paciente.dataNascimento === 'string') {
          const partes = paciente.dataNascimento.split('-');
          if (partes.length === 3) {
            dataObj = new Date(partes[0], partes[1] - 1, partes[2]);
          } else {
            dataObj = new Date(paciente.dataNascimento);
          }
        } else if (paciente.dataNascimento instanceof Date) {
          dataObj = paciente.dataNascimento;
        }
        
        if (dataObj && !isNaN(dataObj)) {
          dataNascimento = dataObj.toLocaleDateString('pt-BR');
          dataNascimentoFormatada = dataObj.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error("Erro ao formatar data:", error);
        dataNascimento = 'Erro na data';
      }
    }
    
    // Status formatado com mais detalhes
    let statusInfo = '';
    let statusClass = '';
    let statusIcon = '';
    
    switch(paciente.status) {
      case 'internado':
        statusInfo = 'Atualmente Internado';
        statusClass = 'status-internado';
        statusIcon = 'fa-procedures';
        break;
      case 'alta':
        statusInfo = 'Recebeu Alta';
        statusClass = 'status-alta';
        statusIcon = 'fa-walking';
        break;
      case 'obito':
        statusInfo = 'Óbito Registrado';
        statusClass = 'status-obito';
        statusIcon = 'fa-cross';
        break;
      default:
        statusInfo = 'Status Desconhecido';
        statusClass = 'status-unknown';
        statusIcon = 'fa-question';
    }
    
    // Obter informações da última internação
    let ultimaInternacao = '';
    if (paciente.evolucoes && paciente.evolucoes.length > 0) {
      const ultimaEvolucao = paciente.evolucoes[paciente.evolucoes.length - 1];
      if (ultimaEvolucao.dataRegistro) {
        try {
          let dataUltima;
          if (ultimaEvolucao.dataRegistro.seconds) {
            dataUltima = new Date(ultimaEvolucao.dataRegistro.seconds * 1000);
          } else {
            dataUltima = new Date(ultimaEvolucao.dataRegistro);
          }
          ultimaInternacao = `Última evolução: ${dataUltima.toLocaleDateString('pt-BR')}`;
        } catch (error) {
          ultimaInternacao = 'Data da última evolução: indisponível';
        }
      }
    } else {
      ultimaInternacao = 'Nenhuma evolução registrada';
    }
    
    // Destacar termo da busca no nome
    const nomeDestacado = paciente.nome.replace(
      new RegExp(`(${termo})`, 'gi'),
      '<mark>$1</mark>'
    );
    
    // Verificar se pode ser reinternado
    const podeReinternacao = paciente.status === 'alta';
    const avisoObito = paciente.status === 'obito';
    
    // Conteúdo da sugestão
    sugestaoItem.innerHTML = `
      <div class="sugestao-paciente">
        <div class="sugestao-principal">
          <div class="sugestao-nome-container">
            <span class="sugestao-nome">${nomeDestacado}</span>
            <div class="sugestao-status ${statusClass}">
              <i class="fas ${statusIcon}"></i>
              ${statusInfo}
            </div>
          </div>
          <div class="sugestao-detalhes">
            <div class="detalhe-item">
              <i class="fas fa-birthday-cake"></i>
              <span>Nascimento: ${dataNascimento}</span>
            </div>
            <div class="detalhe-item">
              <i class="fas fa-id-card"></i>
              <span>ID: ${paciente.idInternacao || 'N/A'}</span>
            </div>
            <div class="detalhe-item">
              <i class="fas fa-clock"></i>
              <span>${ultimaInternacao}</span>
            </div>
          </div>
        </div>
        
        <div class="sugestao-acoes">
          ${podeReinternacao ? `
            <div class="acao-reinternacao">
              <i class="fas fa-redo"></i>
              <span>Reinternação</span>
            </div>
          ` : avisoObito ? `
            <div class="acao-aviso">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Verificar identidade</span>
            </div>
          ` : `
            <div class="acao-atencao">
              <i class="fas fa-info-circle"></i>
              <span>Já internado</span>
            </div>
          `}
        </div>
      </div>
    `;
    
    // Adicionar dados como atributos para facilitar acesso
    sugestaoItem.dataset.pacienteId = paciente.id;
    sugestaoItem.dataset.pacienteNome = paciente.nome;
    sugestaoItem.dataset.pacienteStatus = paciente.status;
    sugestaoItem.dataset.dataNascimento = dataNascimentoFormatada;
    
    // Adicionar evento de clique
    sugestaoItem.addEventListener('click', function() {
      selecionarPacienteParaReinternacao(paciente, dataNascimentoFormatada);
    });
    
    // Adicionar hover para seleção com teclado
    sugestaoItem.addEventListener('mouseenter', function() {
      // Remover seleção de outros itens
      const container = this.parentNode;
      container.querySelectorAll('.sugestao-item').forEach(item => {
        item.classList.remove('selected');
      });
      this.classList.add('selected');
    });
    
    return sugestaoItem;
  }
  
  // Função para selecionar paciente para reinternação
  function selecionarPacienteParaReinternacao(paciente, dataNascimentoFormatada) {
    const nomePacienteInput = document.getElementById('nome-paciente');
    const dataNascimentoInput = document.getElementById('data-nascimento-paciente');
    const sugestoesContainer = document.querySelector('.sugestoes-container');
    
    // ✅ VALIDAÇÃO RIGOROSA: Permitir apenas pacientes com alta
    if (paciente.status !== 'alta') {
      
      // Ocultar sugestões
      sugestoesContainer.style.display = 'none';
      
      // Mostrar alerta específico baseado no status
      let titulo, mensagem, icone, cor;
      
      if (paciente.status === 'internado') {
        titulo = '🚫 Reinternação Não Permitida';
        mensagem = `O paciente <strong>${paciente.nome}</strong> já está <strong>internado</strong> no sistema. Não é possível fazer uma nova internação.`;
        icone = 'fa-ban';
        cor = 'danger';
      } else if (paciente.status === 'obito') {
        titulo = '⚠️ Atenção: Óbito Registrado';
        mensagem = `Foi registrado <strong>óbito</strong> para ${paciente.nome}. Verifique se não é um <strong>homônimo</strong> antes de prosseguir. Se for uma nova pessoa, cadastre com dados completos.`;
        icone = 'fa-exclamation-triangle';
        cor = 'warning';
      } else {
        titulo = '❌ Status Inválido';
        mensagem = `Status do paciente <strong>${paciente.nome}</strong> é "<strong>${paciente.status}</strong>". Apenas pacientes com <strong>alta hospitalar</strong> podem ser reinternados.`;
        icone = 'fa-times-circle';
        cor = 'danger';
      }
      
      // Mostrar alerta customizado
      mostrarAlertaPersonalizado(titulo, mensagem, icone, cor);
      
      // Limpar campos
      nomePacienteInput.value = '';
      if (dataNascimentoInput) dataNascimentoInput.value = '';
      
      return; // IMPEDIR prosseguimento
    }
    
    // ✅ PACIENTE COM ALTA - PERMITIR REINTERNAÇÃO
    
    // Preencher campos
    nomePacienteInput.value = paciente.nome;
    
    if (dataNascimentoInput && dataNascimentoFormatada) {
      dataNascimentoInput.value = dataNascimentoFormatada;
    }
    
    // Mostrar mensagem de reinternação (apenas para casos válidos)
    mostrarMensagemReinternacao(paciente);
    
    // Adicionar ID oculto para referência
    adicionarReferenciaPacienteOriginal(paciente.id);
    
    // Ocultar sugestões
    sugestoesContainer.style.display = 'none';
    
    // Focar no próximo campo
    const proximoCampo = document.getElementById('id-internacao-paciente');
    if (proximoCampo) {
      setTimeout(() => proximoCampo.focus(), 100);
    }
  }
  
  // Função para mostrar alerta personalizado
  function mostrarAlertaPersonalizado(titulo, mensagem, icone, cor) {
    // Criar ou reutilizar container de alerta
    let alertContainer = document.getElementById('alert-reinternacao');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alert-reinternacao';
      alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        z-index: 999999;
        animation: slideInRight 0.3s ease;
      `;
      document.body.appendChild(alertContainer);
    }
    
    alertContainer.innerHTML = `
      <div class="alert alert--${cor}" style="margin: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <div class="alert-content">
          <div class="alert-header">
            <i class="fas ${icone}"></i>
            <strong>${titulo}</strong>
          </div>
          <div class="alert-body">
            <p>${mensagem}</p>
          </div>
          <div class="alert-actions">
            <button type="button" class="btn btn--ghost btn--sm" onclick="fecharAlertaReinternacao()">
              <i class="fas fa-times"></i> OK
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Auto-remover após 8 segundos
    setTimeout(() => {
      fecharAlertaReinternacao();
    }, 8000);
  }
  
  // Função para fechar alerta de reinternação
  function fecharAlertaReinternacao() {
    const alertContainer = document.getElementById('alert-reinternacao');
    if (alertContainer) {
      alertContainer.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        alertContainer.remove();
      }, 300);
    }
  }
  
  // Expor função globalmente
  window.fecharAlertaReinternacao = fecharAlertaReinternacao;
  
  // Função para mostrar mensagem de reinternação
  function mostrarMensagemReinternacao(paciente) {
    const msgElement = document.getElementById('msg-paciente-existente');
    if (!msgElement) return;
    
    let mensagemTipo = '';
    let iconeTipo = '';
    let corTipo = '';
    
    switch(paciente.status) {
      case 'alta':
        mensagemTipo = 'Nova Internação';
        iconeTipo = 'fa-redo';
        corTipo = 'success';
        break;
      case 'obito':
        mensagemTipo = 'Atenção: Óbito Registrado';
        iconeTipo = 'fa-exclamation-triangle';
        corTipo = 'danger';
        break;
      case 'internado':
        mensagemTipo = 'Paciente Já Internado';
        iconeTipo = 'fa-info-circle';
        corTipo = 'warning';
        break;
      default:
        mensagemTipo = 'Paciente Selecionado';
        iconeTipo = 'fa-user';
        corTipo = 'info';
    }
    
    msgElement.className = `alert alert--${corTipo}`;
    msgElement.style.display = 'block';
    msgElement.innerHTML = `
      <div class="alert-content">
        <div class="alert-header">
          <i class="fas ${iconeTipo}"></i>
          <strong>${mensagemTipo}</strong>
        </div>
        <div class="alert-body">
          <p><strong>Paciente:</strong> ${paciente.nome}</p>
          <p><strong>Status anterior:</strong> ${
            paciente.status === 'alta' ? 'Alta Hospitalar' :
            paciente.status === 'obito' ? 'Óbito' :
            paciente.status === 'internado' ? 'Internado' : 'Desconhecido'
          }</p>
          ${paciente.status === 'obito' ? 
            '<p class="alert-warning"><i class="fas fa-exclamation-triangle"></i> <strong>Verifique se não é um homônimo antes de prosseguir!</strong></p>' : 
            ''
          }
          ${paciente.status === 'internado' ? 
            '<p class="alert-info"><i class="fas fa-info-circle"></i> Este paciente já está internado no sistema.</p>' : 
            ''
          }
        </div>
        <div class="alert-actions">
          <button type="button" class="btn btn--ghost btn--sm" onclick="limparMensagemReinternacao()">
            <i class="fas fa-times"></i> Cancelar Seleção
          </button>
        </div>
      </div>
    `;
  }
  
  // Função para limpar mensagem de reinternação
  function limparMensagemReinternacao() {
    const msgElement = document.getElementById('msg-paciente-existente');
    if (msgElement) {
      msgElement.style.display = 'none';
      msgElement.innerHTML = '';
    }
    
    // Remover referência do paciente original
    const pacienteIdInput = document.getElementById('paciente-reinternado-id');
    if (pacienteIdInput) {
      pacienteIdInput.remove();
    }
    
    // Limpar campos
    const nomePacienteInput = document.getElementById('nome-paciente');
    const dataNascimentoInput = document.getElementById('data-nascimento-paciente');
    
    if (nomePacienteInput) nomePacienteInput.value = '';
    if (dataNascimentoInput) dataNascimentoInput.value = '';
    
    // Focar no campo nome
    if (nomePacienteInput) nomePacienteInput.focus();
  }
  
  // Função para adicionar referência ao paciente original
  function adicionarReferenciaPacienteOriginal(pacienteId) {
    const formAdicionarPaciente = document.getElementById('form-adicionar-paciente');
    if (!formAdicionarPaciente) return;
    
    // Remover input anterior se existir
    const inputAnterior = document.getElementById('paciente-reinternado-id');
    if (inputAnterior) {
      inputAnterior.remove();
    }
    
    // Criar novo input oculto
    const pacienteIdInput = document.createElement('input');
    pacienteIdInput.type = 'hidden';
    pacienteIdInput.id = 'paciente-reinternado-id';
    pacienteIdInput.value = pacienteId;
    
    formAdicionarPaciente.appendChild(pacienteIdInput);
  }
  
  // Expor função globalmente
  window.limparMensagemReinternacao = limparMensagemReinternacao;

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
    console.log("🔥 DEBUG: atualizarEstadoUpload chamada");
    
    try {
      const uploadArea = document.getElementById('upload-area');
      
      // Verificar se o upload area existe
      if (!uploadArea) {
        console.warn('🔥 Upload area não encontrada (ID: upload-area)');
        return;
      }
      
      console.log("🔥 Upload area encontrada, procurando por .upload-text");
      const placeholder = uploadArea.querySelector('.upload-text');
      
      // Verificar se o placeholder existe
      if (!placeholder) {
        console.warn('🔥 Upload text placeholder não encontrado (.upload-text)');
        console.log('🔥 Conteúdo da uploadArea:', uploadArea.innerHTML.substring(0, 200));
        // Tentar buscar qualquer elemento com texto
        const todosOsPs = uploadArea.querySelectorAll('p');
        console.log('🔥 Elementos p encontrados:', todosOsPs.length);
        todosOsPs.forEach((p, i) => {
          console.log(`🔥 P[${i}]: ${p.className} - ${p.textContent.substring(0, 50)}`);
        });
        return;
      }
      
      console.log("🔥 Upload text encontrado, atualizando estado");
      
      if (imagensSelecionadas && imagensSelecionadas.length > 0) {
        placeholder.textContent = `${imagensSelecionadas.length} imagem(ns) selecionada(s)`;
        uploadArea.classList.add('upload-success');
      } else {
        placeholder.textContent = 'Clique aqui ou arraste imagens para anexar';
        uploadArea.classList.remove('upload-success');
      }
      
      console.log("🔥 Estado de upload atualizado com sucesso");
    } catch (error) {
      console.error("🔥 ERRO em atualizarEstadoUpload:", error);
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
    const progressContainer = document.getElementById('progress-upload');
    const uploadArea = document.getElementById('upload-area');
    
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    
    if (uploadArea) {
      uploadArea.classList.add('upload-loading');
    }
    
    atualizarProgressoUpload(0);
  }

  // Atualizar progresso do upload
  function atualizarProgressoUpload(porcentagem) {
    const progressFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${porcentagem}%`;
    }
    
    if (progressText) {
      progressText.textContent = `Fazendo upload... ${Math.round(porcentagem)}%`;
    }
  }

  // Esconder barra de progresso
  function esconderProgressoUpload() {
    const progressContainer = document.getElementById('progress-upload');
    const uploadArea = document.getElementById('upload-area');
    
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
    
    if (uploadArea) {
      uploadArea.classList.remove('upload-loading');
    }
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
    console.log("🖼️ renderizarGaleriaImagens chamada com", imagens.length, "imagens");
    
    if (!imagens || imagens.length === 0) return '';
    
    const html = `
      <div class="evolucao-galeria">
        <h5>📸 Imagens Anexadas (${imagens.length})</h5>
        <div class="galeria-imagens">
          ${imagens.map((url, index) => `
            <div class="galeria-item" onclick="window.abrirImagemModal(${JSON.stringify(imagens).replace(/"/g, '&quot;')}, ${index})">
              <img src="${url}" alt="Imagem ${index + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    console.log("🖼️ HTML da galeria gerado:", html.substring(0, 200));
    return html;
  }

  // Inicializar modal de visualização de imagem
  function inicializarModalImagem() {
    console.log("🖼️ Inicializando modal de imagem...");
    
    const modalImagem = document.getElementById('modal-imagem');
    
    if (!modalImagem) {
      console.warn('🖼️ Modal de imagem não encontrado no DOM');
      return;
    }
    
    console.log("🖼️ Modal de imagem encontrado no DOM");
    
    const closeBtn = modalImagem.querySelector('.modal-imagem-close');
    const btnAnterior = modalImagem.querySelector('.modal-imagem-prev');
    const btnProximo = modalImagem.querySelector('.modal-imagem-next');
    
    console.log("🖼️ Elementos do modal:", {
      closeBtn: !!closeBtn,
      btnAnterior: !!btnAnterior,
      btnProximo: !!btnProximo
    });
    
    // Verificar se os elementos existem antes de adicionar eventos
    if (closeBtn) {
      console.log("🖼️ Adicionando evento de fechar ao botão X");
      // Fechar modal
      closeBtn.addEventListener('click', () => {
        console.log("🖼️ Botão X clicado, fechando modal");
        modalImagem.style.display = 'none';
      });
    }
    
    // Fechar ao clicar fora da imagem
    modalImagem.addEventListener('click', (e) => {
      if (e.target === modalImagem) {
        console.log("🖼️ Clique fora da imagem, fechando modal");
        modalImagem.style.display = 'none';
      }
    });
    
    // Navegação entre imagens (se os botões existirem)
    if (btnAnterior) {
      btnAnterior.addEventListener('click', () => {
        console.log("🖼️ Botão anterior clicado");
        navegarImagem(-1);
      });
    }
    
    if (btnProximo) {
      btnProximo.addEventListener('click', () => {
        console.log("🖼️ Botão próximo clicado");
        navegarImagem(1);
      });
    }
    
//     // Navegação por teclado
//     document.addEventListener('keydown', function modalKeyHandler(e) {
//       // IMPORTANTE: Só interceptar se o modal dinâmico estiver REALMENTE visível
//       const modalDinamico = document.getElementById('modal-imagem-dinamico');
//       if (!modalDinamico || modalDinamico.style.display === 'none') {
//         return; // NÃO interceptar se modal não está visível
//       }
//       
//       if (e.key === 'Escape') {
//         console.log("🖼️ Fechando modal via ESC");
//         modal.remove();
//         document.removeEventListener('keydown', modalKeyHandler);
//       } else if (e.key === 'ArrowLeft' && indiceAtual > 0) {
//         indiceAtual--;
//         atualizarImagem();
//         console.log("🖼️ Navegando via seta esquerda para:", indiceAtual);
//       } else if (e.key === 'ArrowRight' && indiceAtual < imagens.length - 1) {
//         indiceAtual++;
//         atualizarImagem();
//         console.log("🖼️ Navegando via seta direita para:", indiceAtual);
//       }
//     });
    
    console.log("🖼️ Modal de imagem inicializado com sucesso!");
  }

  // Abrir modal de visualização de imagem
  function abrirImagemModal(imagens, indiceInicial = 0) {
    console.log("🖼️ abrirImagemModal chamada - CRIANDO MODAL DO ZERO!");
    console.log("🖼️ Imagens recebidas:", imagens);
    console.log("🖼️ Índice inicial:", indiceInicial);
    
    // Remover modal existente se houver
    const modalExistente = document.getElementById('modal-imagem-dinamico');
    if (modalExistente) {
      modalExistente.remove();
    }
    
    // Criar modal completamente novo
    const modal = document.createElement('div');
    modal.id = 'modal-imagem-dinamico';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    `;
    
    // Criar container da imagem
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    
    // Criar imagem
    const img = document.createElement('img');
    img.src = imagens[indiceInicial];
    img.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    
    // Criar botão de fechar
    const btnFechar = document.createElement('button');
    btnFechar.innerHTML = '&times;';
    btnFechar.style.cssText = `
      position: absolute;
      top: -40px;
      right: -40px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #333;
      z-index: 1000000;
    `;
    
    // Criar contador
    const contador = document.createElement('div');
    contador.textContent = `${indiceInicial + 1} / ${imagens.length}`;
    contador.style.cssText = `
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 8px 16px;
      border-radius: 20px;
      color: #333;
      font-weight: bold;
      z-index: 1000000;
    `;
    
    // Criar botões de navegação (se houver mais de uma imagem)
    let btnAnterior, btnProximo;
    if (imagens.length > 1) {
      btnAnterior = document.createElement('button');
      btnAnterior.innerHTML = '&#8249;';
      btnAnterior.style.cssText = `
        position: absolute;
        left: -60px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #333;
        z-index: 1000000;
      `;
      
      btnProximo = document.createElement('button');
      btnProximo.innerHTML = '&#8250;';
      btnProximo.style.cssText = `
        position: absolute;
        right: -60px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 30px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #333;
        z-index: 1000000;
      `;
    }
    
    // Montar o modal
    container.appendChild(img);
    container.appendChild(btnFechar);
    container.appendChild(contador);
    if (btnAnterior) container.appendChild(btnAnterior);
    if (btnProximo) container.appendChild(btnProximo);
    modal.appendChild(container);
    
    // Adicionar ao body
    document.body.appendChild(modal);
    
    // Variáveis para navegação
    let indiceAtual = indiceInicial;
    
    // Função para atualizar imagem
    function atualizarImagem() {
      img.src = imagens[indiceAtual];
      contador.textContent = `${indiceAtual + 1} / ${imagens.length}`;
      
      if (btnAnterior) {
        btnAnterior.style.display = indiceAtual === 0 ? 'none' : 'flex';
      }
      if (btnProximo) {
        btnProximo.style.display = indiceAtual === imagens.length - 1 ? 'none' : 'flex';
      }
    }
    
    // Eventos
    btnFechar.addEventListener('click', () => {
      console.log("🖼️ Fechando modal via botão X");
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        console.log("🖼️ Fechando modal via clique fora");
        modal.remove();
      }
    });
    
    if (btnAnterior) {
      btnAnterior.addEventListener('click', () => {
        if (indiceAtual > 0) {
          indiceAtual--;
          atualizarImagem();
          console.log("🖼️ Navegando para imagem anterior:", indiceAtual);
        }
      });
    }
    
    if (btnProximo) {
      btnProximo.addEventListener('click', () => {
        if (indiceAtual < imagens.length - 1) {
          indiceAtual++;
          atualizarImagem();
          console.log("🖼️ Navegando para próxima imagem:", indiceAtual);
        }
      });
    }
    
//     // Navegação por teclado
//     document.addEventListener('keydown', function modalKeyHandler(e) {
//       // IMPORTANTE: Só interceptar se o modal dinâmico estiver REALMENTE visível
//       const modalDinamico = document.getElementById('modal-imagem-dinamico');
//       if (!modalDinamico || modalDinamico.style.display === 'none') {
//         return; // NÃO interceptar se modal não está visível
//       }
//       
//       if (e.key === 'Escape') {
//         console.log("🖼️ Fechando modal via ESC");
//         modal.remove();
//         document.removeEventListener('keydown', modalKeyHandler);
//       } else if (e.key === 'ArrowLeft' && indiceAtual > 0) {
//         indiceAtual--;
//         atualizarImagem();
//         console.log("🖼️ Navegando via seta esquerda para:", indiceAtual);
//       } else if (e.key === 'ArrowRight' && indiceAtual < imagens.length - 1) {
//         indiceAtual++;
//         atualizarImagem();
//         console.log("🖼️ Navegando via seta direita para:", indiceAtual);
//       }
//     });
    
    // Atualizar estado inicial
    atualizarImagem();
    
    console.log("🖼️ Modal dinâmico criado e exibido com sucesso!");
    console.log("🖼️ URL da imagem:", imagens[indiceAtual]);
  }

  // Navegar entre imagens
  function navegarImagem(direcao) {
    const novoIndice = indiceImagemAtual + direcao;
    
    if (novoIndice >= 0 && novoIndice < imagensParaVisualizar.length) {
      indiceImagemAtual = novoIndice;
      atualizarImagemModal();
    }
  }

  // Expor função globalmente para compatibilidade
  window.carregarPacientes = carregarPacientes;
  window.limparImagensSelecionadas = limparImagensSelecionadas;
  window.renderizarGaleriaImagens = renderizarGaleriaImagens;
  window.abrirImagemModal = abrirImagemModal;
  window.removerImagem = removerImagem;
  window.uploadImagensParaStorage = uploadImagensParaStorage;
  window.abrirModalEvolucao = abrirModalEvolucao;
  
  // Garantir que as funções necessárias estejam disponíveis globalmente
  if (typeof window.AppModulos === 'undefined') {
    window.AppModulos = {};
  }
  if (typeof window.AppModulos.Pacientes === 'undefined') {
    window.AppModulos.Pacientes = {};
  }
  
  // Expor funções principais do módulo
  window.AppModulos.Pacientes = {
    carregarPacientes,
    inicializarModuloPacientes,
    buscarPacientes,
    abrirModalEvolucao,
    limparImagensSelecionadas,
    inicializarUploadImagens
  };

  // =====================================================
  // FUNÇÕES DO MODAL DE PERFIL DO PACIENTE
  // =====================================================
  
  // Função para abrir modal de perfil completo do paciente
  async function abrirModalPerfilPaciente(pacienteId) {
    const modalPerfil = document.getElementById('modal-perfil-paciente');
    if (!modalPerfil) {
      console.error("Modal de perfil do paciente não encontrado");
      return;
    }
    
    try {
      // Verificar se o Firebase está disponível
      if (!window.verificarFirebaseDisponivel()) {
        throw new Error("Firebase não está disponível");
      }
      
      // Mostrar loading
      const esconderLoading = AppModulos.UI.mostrarLoading('Carregando dados do paciente...');
      
      // Buscar dados completos do paciente
      const pacienteDoc = await window.db.collection('pacientes').doc(pacienteId).get();
      
      if (!pacienteDoc.exists) {
        throw new Error("Paciente não encontrado");
      }
      
      const paciente = { id: pacienteDoc.id, ...pacienteDoc.data() };
      
      // Preencher dados do modal
      await preencherDadosPerfilPaciente(paciente);
      
      // Armazenar dados do paciente no modal para uso posterior
      modalPerfil.dataset.pacienteId = paciente.id;
      modalPerfil.dataset.pacienteNome = paciente.nome;
      
      // Exibir modal
      modalPerfil.style.display = 'block';
      modalPerfil.style.zIndex = '999999';
      
      // Scroll para o topo
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // Esconder loading
      esconderLoading();
      
      console.log("✅ Modal de perfil aberto para paciente:", paciente.nome);
      
    } catch (error) {
      console.error("Erro ao abrir perfil do paciente:", error);
      AppModulos.UI.mostrarNotificacao('Erro ao carregar dados do paciente. Tente novamente.', 'erro');
      
      // Fechar modal em caso de erro
      modalPerfil.style.display = 'none';
    }
  }
  
  // Função para preencher dados do perfil do paciente
  async function preencherDadosPerfilPaciente(paciente) {
    // Título do modal
    const tituloModal = document.getElementById('modal-perfil-titulo');
    if (tituloModal) {
      tituloModal.textContent = `Perfil Completo - ${paciente.nome}`;
    }
    
    // Preencher dados cadastrais
    await preencherDadosCadastrais(paciente);
    
    // Preencher histórico de evoluções
    await preencherHistoricoEvolucoes(paciente);
    
    // Preencher estatísticas
    await preencherEstatisticasPaciente(paciente);
  }
  
  // Função para preencher dados cadastrais
  async function preencherDadosCadastrais(paciente) {
    const containerDados = document.getElementById('perfil-dados-cadastrais');
    if (!containerDados) return;
    
    // Formatar data de nascimento
    let dataNascimento = 'Não informada';
    if (paciente.dataNascimento) {
      try {
        if (paciente.dataNascimento && typeof paciente.dataNascimento === 'object' && 'seconds' in paciente.dataNascimento) {
          dataNascimento = AppVisita.Utils.formatarData(paciente.dataNascimento);
        } else if (typeof paciente.dataNascimento === 'string') {
          const partes = paciente.dataNascimento.split('-');
          if (partes.length === 3) {
            const data = new Date(partes[0], partes[1] - 1, partes[2]);
            dataNascimento = data.toLocaleDateString('pt-BR');
          }
        }
      } catch (error) {
        console.error("Erro ao formatar data de nascimento:", error);
      }
    }
    
    // Calcular idade
    let idade = 'Não calculada';
    if (paciente.dataNascimento) {
      try {
        let dataNasc;
        if (typeof paciente.dataNascimento === 'string') {
          const partes = paciente.dataNascimento.split('-');
          if (partes.length === 3) {
            dataNasc = new Date(partes[0], partes[1] - 1, partes[2]);
          }
        } else if (paciente.dataNascimento.seconds) {
          dataNasc = new Date(paciente.dataNascimento.seconds * 1000);
        }
        
        if (dataNasc) {
          const hoje = new Date();
          let idadeCalculada = hoje.getFullYear() - dataNasc.getFullYear();
          const mes = hoje.getMonth() - dataNasc.getMonth();
          if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
            idadeCalculada--;
          }
          idade = `${idadeCalculada} anos`;
        }
      } catch (error) {
        console.error("Erro ao calcular idade:", error);
      }
    }
    
    // Obter nome da equipe
    let equipeNome = 'Não definida';
    if (paciente.equipeId && window.equipesUsuario) {
      const equipe = window.equipesUsuario.find(e => e.id === paciente.equipeId);
      if (equipe) {
        equipeNome = equipe.nome;
      }
    }
    
    // Formatar datas
    const dataRegistro = AppVisita.Utils.formatarDataHora(paciente.dataRegistro);
    const ultimaAtualizacao = paciente.ultimaAtualizacao ? 
      AppVisita.Utils.formatarDataHora(paciente.ultimaAtualizacao) : 'Não disponível';
    
    // Dados de internação atual
    const tempoInternacao = calcularTempoInternacao(paciente.dataRegistro);
    
    containerDados.innerHTML = `
      <div class="perfil-item">
        <i class="fas fa-user"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Nome Completo</div>
          <div class="perfil-item-valor">${paciente.nome}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-id-card"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">CPF</div>
          <div class="perfil-item-valor">${paciente.cpf || 'Não informado'}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-birthday-cake"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Data de Nascimento</div>
          <div class="perfil-item-valor">${dataNascimento}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-calculator"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Idade</div>
          <div class="perfil-item-valor">${idade}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-hospital"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Local de Internação</div>
          <div class="perfil-item-valor">${paciente.localLeito}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-bed"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">ID/Leito</div>
          <div class="perfil-item-valor">${paciente.idInternacao}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-users"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Equipe Responsável</div>
          <div class="perfil-item-valor">${equipeNome}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-heartbeat"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Status Atual</div>
          <div class="perfil-item-valor">
            <span class="perfil-evolucao-status status-${paciente.status}">
              <i class="fas ${paciente.status === 'internado' ? 'fa-procedures' : 
                            paciente.status === 'alta' ? 'fa-walking' : 'fa-skull'}"></i>
              ${paciente.status === 'internado' ? 'Internado' : 
                paciente.status === 'alta' ? 'Alta Hospitalar' : 'Óbito'}
            </span>
          </div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-calendar-plus"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Data de Internação</div>
          <div class="perfil-item-valor">${dataRegistro}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-clock"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Tempo de Internação</div>
          <div class="perfil-item-valor">${tempoInternacao}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-edit"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Última Atualização</div>
          <div class="perfil-item-valor">${ultimaAtualizacao}</div>
        </div>
      </div>
      
      <div class="perfil-item">
        <i class="fas fa-user-md"></i>
        <div class="perfil-item-content">
          <div class="perfil-item-label">Médico Responsável</div>
          <div class="perfil-item-valor">${paciente.medicoEmail || 'Não informado'}</div>
        </div>
      </div>
    `;
  }
  
  // Função para preencher histórico de evoluções no perfil
  async function preencherHistoricoEvolucoes(paciente) {
    const containerHistorico = document.getElementById('perfil-historico-evolucoes');
    const contadorEvolucoes = document.getElementById('perfil-contador-evolucoes');
    
    if (!containerHistorico) return;
    
    const evolucoes = paciente.evolucoes || [];
    
    // Atualizar contador
    if (contadorEvolucoes) {
      contadorEvolucoes.textContent = evolucoes.length;
    }
    
    if (evolucoes.length === 0) {
      containerHistorico.innerHTML = `
        <div class="perfil-sem-evolucoes">
          <i class="fas fa-info-circle"></i>
          <p>Nenhuma evolução registrada ainda.</p>
        </div>
      `;
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
      let galeriaImagens = '';
      if (evolucao.imagens && evolucao.imagens.length > 0) {
        galeriaImagens = `
          <div class="perfil-galeria-imagens">
            <div class="perfil-galeria-titulo">
              📸 Imagens Anexadas (${evolucao.imagens.length})
            </div>
            <div class="perfil-galeria-grid">
              ${evolucao.imagens.map((url, index) => `
                <div class="perfil-galeria-item" onclick="window.abrirImagemModal(${JSON.stringify(evolucao.imagens).replace(/"/g, '&quot;')}, ${index})">
                  <img src="${url}" alt="Imagem ${index + 1}" loading="lazy">
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      
      historicoHTML += `
        <div class="perfil-evolucao-item">
          <div class="perfil-evolucao-header">
            <span class="perfil-evolucao-data">${dataFormatada}</span>
            <span class="perfil-evolucao-medico">${evolucao.medicoEmail || 'Médico não identificado'}</span>
          </div>
          <div class="perfil-evolucao-texto">${evolucao.texto}</div>
          ${galeriaImagens}
          <div class="perfil-evolucao-status ${statusClass}">
            <i class="fas ${evolucao.status === 'internado' ? 'fa-procedures' : 
                          evolucao.status === 'alta' ? 'fa-walking' : 'fa-skull'}"></i>
            ${statusText}
          </div>
        </div>
      `;
    });
    
    containerHistorico.innerHTML = historicoHTML;
  }
  
  // Função para preencher estatísticas do paciente
  async function preencherEstatisticasPaciente(paciente) {
    const containerEstatisticas = document.getElementById('perfil-estatisticas');
    if (!containerEstatisticas) return;
    
    const evolucoes = paciente.evolucoes || [];
    const totalEvolucoes = evolucoes.length;
    
    // Calcular dias internado
    const diasInternado = calcularDiasInternacao(paciente.dataRegistro);
    
    // Calcular evoluções com imagens
    const evolucoesComImagens = evolucoes.filter(e => e.imagens && e.imagens.length > 0).length;
    const totalImagens = evolucoes.reduce((total, e) => total + (e.imagens ? e.imagens.length : 0), 0);
    
    // Última evolução
    let ultimaEvolucaoData = 'Nenhuma';
    if (evolucoes.length > 0) {
      const ultimaEvolucao = evolucoes.sort((a, b) => {
        const dataA = a.dataRegistro ? (a.dataRegistro.seconds || 0) : 0;
        const dataB = b.dataRegistro ? (b.dataRegistro.seconds || 0) : 0;
        return dataB - dataA;
      })[0];
      
      ultimaEvolucaoData = AppVisita.Utils.formatarDataHora(ultimaEvolucao.dataRegistro);
    }
    
    // Médicos diferentes que registraram evoluções
    const medicosUnicos = new Set(evolucoes.map(e => e.medicoEmail).filter(Boolean)).size;
    
    containerEstatisticas.innerHTML = `
      <div class="perfil-estatistica">
        <div class="perfil-estatistica-valor">${totalEvolucoes}</div>
        <div class="perfil-estatistica-label">Total de Evoluções</div>
      </div>
      
      <div class="perfil-estatistica">
        <div class="perfil-estatistica-valor">${diasInternado}</div>
        <div class="perfil-estatistica-label">Dias Internado</div>
      </div>
      
      <div class="perfil-estatistica">
        <div class="perfil-estatistica-valor">${totalImagens}</div>
        <div class="perfil-estatistica-label">Imagens Anexadas</div>
      </div>
      
      <div class="perfil-estatistica">
        <div class="perfil-estatistica-valor">${medicosUnicos}</div>
        <div class="perfil-estatistica-label">Médicos Envolvidos</div>
      </div>
    `;
  }
  
  // Função auxiliar para calcular tempo de internação
  function calcularTempoInternacao(dataRegistro) {
    try {
      let dataInternacao;
      
      if (dataRegistro && dataRegistro.seconds) {
        dataInternacao = new Date(dataRegistro.seconds * 1000);
      } else if (dataRegistro instanceof Date) {
        dataInternacao = dataRegistro;
      } else {
        return 'Não calculado';
      }
      
      const agora = new Date();
      const diferenca = agora - dataInternacao;
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (dias === 0) {
        return `${horas} hora(s)`;
      } else if (dias === 1) {
        return `1 dia e ${horas} hora(s)`;
      } else {
        return `${dias} dias e ${horas} hora(s)`;
      }
    } catch (error) {
      console.error("Erro ao calcular tempo de internação:", error);
      return 'Erro no cálculo';
    }
  }
  
  // Função auxiliar para calcular dias de internação
  function calcularDiasInternacao(dataRegistro) {
    try {
      let dataInternacao;
      
      if (dataRegistro && dataRegistro.seconds) {
        dataInternacao = new Date(dataRegistro.seconds * 1000);
      } else if (dataRegistro instanceof Date) {
        dataInternacao = dataRegistro;
      } else {
        return 0;
      }
      
      const agora = new Date();
      const diferenca = agora - dataInternacao;
      return Math.floor(diferenca / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error("Erro ao calcular dias de internação:", error);
      return 0;
    }
  }
  
  // =====================================================
  // EVENT LISTENERS DO MODAL DE PERFIL
  // =====================================================
  
  // Configurar event listeners do modal de perfil
  document.addEventListener('DOMContentLoaded', function() {
    const modalPerfil = document.getElementById('modal-perfil-paciente');
    const btnFecharPerfil = document.getElementById('btn-fechar-perfil');
    const btnCloseHeaderPerfil = document.getElementById('close-perfil-paciente');
    const btnNovaEvolucaoPerfil = document.getElementById('btn-nova-evolucao-perfil');
    
    // Fechar modal
    if (btnFecharPerfil) {
      btnFecharPerfil.addEventListener('click', function() {
        modalPerfil.style.display = 'none';
      });
    }
    
    if (btnCloseHeaderPerfil) {
      btnCloseHeaderPerfil.addEventListener('click', function() {
        modalPerfil.style.display = 'none';
      });
    }
    
    // Fechar modal clicando fora dele
    if (modalPerfil) {
      modalPerfil.addEventListener('click', function(e) {
        if (e.target === modalPerfil) {
          modalPerfil.style.display = 'none';
        }
      });
    }
    
    // Botão para nova evolução
    if (btnNovaEvolucaoPerfil) {
      btnNovaEvolucaoPerfil.addEventListener('click', function() {
        // Obter ID do paciente atual no perfil (vamos implementar)
        const pacienteId = modalPerfil.dataset.pacienteId;
        const pacienteNome = modalPerfil.dataset.pacienteNome;
        
        if (pacienteId && pacienteNome) {
          // Fechar modal de perfil
          modalPerfil.style.display = 'none';
          
          // Abrir modal de evolução
          setTimeout(() => {
            abrirModalEvolucao(pacienteId, pacienteNome);
          }, 300);
        }
      });
    }
  });
  
  // Expor função globalmente
  window.abrirModalPerfilPaciente = abrirModalPerfilPaciente;
}); 