// Módulo para gestão de equipes
document.addEventListener('DOMContentLoaded', () => {
  // Módulo de Equipes
  const EquipesModulo = {
    // Adicionar seletor de equipes ao formulário de adicionar paciente
    adicionarSeletorEquipeAoFormulario(equipesDisponiveis = []) {
      console.log("🔥 adicionarSeletorEquipeAoFormulario - INICIANDO");
      console.log("🔥 Equipes recebidas:", equipesDisponiveis);
      console.log("🔥 Quantidade de equipes:", equipesDisponiveis.length);
      
      // Verificar se o usuário pertence a alguma equipe
      if (equipesDisponiveis.length === 0) {
        console.warn("🔥 ERRO: Usuário não pertence a nenhuma equipe");
        AppModulos.UI.mostrarNotificacao('Você precisa pertencer a uma equipe médica para adicionar pacientes.', 'aviso');
        return false;
      }
      
      // Verificar se o seletor já existe
      const seletorExistente = document.getElementById('equipe-paciente');
      if (seletorExistente) {
        console.log("🔥 Seletor de equipe JÁ EXISTE no formulário, removendo para recriar");
        const container = seletorExistente.closest('.form-group');
        if (container) container.remove();
      }
      
      console.log("🔥 Criando novo seletor de equipe...");
      
      // Criar elemento de seleção
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      formGroup.id = 'equipe-container';
      
      let optionsHtml = '<option value="">Selecione uma equipe</option>';
      equipesDisponiveis.forEach(equipe => {
        console.log(`🔥 Adicionando opção: ${equipe.nome} (ID: ${equipe.id})`);
        optionsHtml += `<option value="${equipe.id}">${equipe.nome}</option>`;
      });
      
      formGroup.innerHTML = `
        <label for="equipe-paciente" class="form-label form-label--required">Equipe Médica</label>
        <select id="equipe-paciente" name="equipe-paciente" class="form-control" required>
          ${optionsHtml}
        </select>
        <div class="form-help-text">Selecione a equipe médica responsável por este paciente</div>
      `;
      
      // Adicionar antes do botão de adicionar
      const formActions = document.querySelector('#form-adicionar-paciente .card__actions');
      const formAdicionarPaciente = document.getElementById('form-adicionar-paciente');
      
      if (formActions && formAdicionarPaciente) {
        formAdicionarPaciente.insertBefore(formGroup, formActions);
        console.log("🔥 Seletor de equipe ADICIONADO com sucesso ao formulário");
        
        // Se o médico pertencer a apenas uma equipe, pré-selecionar
        if (equipesDisponiveis.length === 1) {
          console.log(`🔥 Médico pertence a apenas UMA equipe: "${equipesDisponiveis[0].nome}"`);
          console.log("🔥 PRÉ-SELECIONANDO equipe automaticamente");
          
          const selectEquipe = document.getElementById('equipe-paciente');
          if (selectEquipe) {
            selectEquipe.value = equipesDisponiveis[0].id;
            console.log(`🔥 Equipe "${equipesDisponiveis[0].nome}" PRÉ-SELECIONADA com sucesso`);
            console.log(`🔥 Valor do select após pré-seleção:`, selectEquipe.value);
          } else {
            console.error("🔥 ERRO: Select de equipe não encontrado após criação");
          }
        } else {
          console.log(`🔥 Médico pertence a ${equipesDisponiveis.length} equipes, usuário deve selecionar manualmente`);
        }
        
        return true;
      } else {
        console.error("🔥 ERRO: Não foi possível encontrar os elementos necessários no formulário");
        console.log("🔥 formActions (.card__actions) encontrado:", !!formActions);
        console.log("🔥 formAdicionarPaciente encontrado:", !!formAdicionarPaciente);
        return false;
      }
    },
    
    // Adicionar seletor de equipes ao dashboard
    adicionarSeletorEquipesAoDashboard(equipesDisponiveis = []) {
      if (equipesDisponiveis.length === 0) return false;
      
      // Verificar se o seletor já existe
      if (document.querySelector('.seletor-equipes')) return true;
      
      // Criar elemento de seleção
      const seletorEquipes = document.createElement('div');
      seletorEquipes.className = 'seletor-equipes';
      
      let optionsHtml = '<option value="">Todas as equipes</option>';
      equipesDisponiveis.forEach(equipe => {
        optionsHtml += `<option value="${equipe.id}">${equipe.nome}</option>`;
      });
      
      seletorEquipes.innerHTML = `
        <div class="seletor-container">
          <label for="filtro-equipe">Filtrar por equipe:</label>
          <select id="filtro-equipe">
            ${optionsHtml}
          </select>
        </div>
      `;
      
      // Adicionar antes da lista de pacientes
      const dashboardSection = document.getElementById('dashboard-section');
      const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
      
      if (dashboardSection && listaPacientesPendentes) {
        dashboardSection.insertBefore(seletorEquipes, listaPacientesPendentes);
        
        // Adicionar evento de mudança no seletor
        const filtroEquipe = document.getElementById('filtro-equipe');
        this.configurarFiltroEquipe(filtroEquipe);
        
        return true;
      }
      
      return false;
    },
    
    // Configurar evento de mudança no seletor de equipes
    configurarFiltroEquipe(filtroEquipe) {
      if (!filtroEquipe) return;
      
      filtroEquipe.addEventListener('change', () => {
        const equipeId = filtroEquipe.value;
        
        console.log("Filtro de equipe alterado para:", equipeId);
        
        // Mostrar loading
        const esconderLoading = AppModulos.UI.mostrarLoading('Filtrando pacientes...');
        
        // Filtrar pacientes pela equipe selecionada
        if (equipeId) {
          console.log("Filtrando pacientes da equipe:", equipeId);
          const pacientesFiltrados = todosPacientes.filter(p => 
            p.equipeId === equipeId
          );
          
          console.log(`${pacientesFiltrados.length} pacientes encontrados para a equipe ${equipeId}`);
          AppModulos.Pacientes.renderizarPacientes(pacientesFiltrados);
        } else {
          // Mostrar todos os pacientes
          console.log("Mostrando todos os pacientes");
          AppModulos.Pacientes.renderizarPacientes();
        }
        
        // Esconder loading após renderização
        setTimeout(() => esconderLoading(), 200);
      });
    },
    
    // Obter detalhes da equipe pelo ID
    obterEquipe(equipeId) {
      return equipesUsuario.find(e => e.id === equipeId);
    },
    
    // Inicializar módulo
    inicializar() {
      // Adicionar seletor de equipes ao dashboard inicialmente se o usuário já estiver autenticado
      if (auth.currentUser && equipesUsuario.length > 0) {
        setTimeout(() => {
          this.adicionarSeletorEquipesAoDashboard(equipesUsuario);
        }, 500);
      }
    }
  };
  
  // Inicializar módulo
  EquipesModulo.inicializar();
  
  // Exportar o módulo para uso global
  if (typeof window.AppModulos === 'undefined') {
    window.AppModulos = {};
  }
  
  window.AppModulos.Equipes = EquipesModulo;
}); 