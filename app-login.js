document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM carregado em app-login.js");
  
  // Elementos da UI de Login
  const areaLogin = document.getElementById('area-login');
  const appContainer = document.getElementById('app-container');
  const formLogin = document.getElementById('form-login');
  const loginEmailInput = document.getElementById('login-email');
  const loginSenhaInput = document.getElementById('login-senha');
  const btnCriarConta = document.getElementById('btn-criar-conta');
  const loginErrorMessage = document.getElementById('login-error-message');
  const authMessage = document.getElementById('auth-message');
  const btnLogout = document.getElementById('btn-logout');

  // Garantir que a tela de login seja visível por padrão
  if (areaLogin && appContainer) {
    areaLogin.style.display = 'block';
    appContainer.style.display = 'none';
    console.log("Tela de login definida como visível por padrão");
  } else {
    console.error("Elementos da UI não encontrados:", {
      areaLogin: !!areaLogin,
      appContainer: !!appContainer
    });
  }

  // Verificar se o Firebase já está inicializado ou esperar pelo evento
  if (window.verificarFirebaseDisponivel && window.verificarFirebaseDisponivel()) {
    console.log("Firebase já estava disponível, inicializando login imediatamente");
    inicializarLogin();
  } else {
    console.log("Aguardando evento firebase-ready para inicializar login");
    document.addEventListener('firebase-ready', (event) => {
      console.log("Evento firebase-ready recebido em app-login.js", event?.detail);
      // Adicionar um pequeno atraso para garantir que todas as referências estejam prontas
      setTimeout(() => {
        inicializarLogin();
      }, 200);
    });
  }

  // Função principal de inicialização
  function inicializarLogin() {
    console.log("Inicializando módulo de login...");
    
    // Verificar se o Firebase está disponível usando a função global
    if (!window.verificarFirebaseDisponivel()) {
      console.error("Firebase não inicializado corretamente! Tentando novamente em 1 segundo...");
      if (loginErrorMessage) {
        loginErrorMessage.textContent = 'Erro de inicialização do Firebase. Verifique a configuração e o console.';
      }
      
      // Tentar novamente após 1 segundo
      setTimeout(inicializarLogin, 1000);
      return;
    } else {
      console.log("Firebase disponível em app-login.js");
      // Limpar mensagem de erro
      if (loginErrorMessage) {
        loginErrorMessage.textContent = '';
      }
    }

    // *** Configuração dos eventos de login ***
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Limpar mensagens anteriores
        loginErrorMessage.textContent = '';
        authMessage.textContent = '';
        
        const email = loginEmailInput.value.trim();
        const password = loginSenhaInput.value;
        
        if (!email || !password) {
          loginErrorMessage.textContent = 'Por favor, preencha email e senha.';
          return;
        }
        
        // Verificar novamente se o Firebase está disponível
        if (!window.verificarFirebaseDisponivel()) {
          loginErrorMessage.textContent = 'Erro de inicialização do Firebase. Tente recarregar a página.';
          return;
        }
        
        // Mostrar indicador de loading
        const esconderLoading = AppModulos.UI.mostrarLoading('Autenticando...');
        
        try {
          console.log("Tentando fazer login com:", email);
          await window.auth.signInWithEmailAndPassword(email, password);
          console.log("Login bem-sucedido para:", email);
          // A função onAuthStateChanged vai cuidar do resto
        } catch (error) {
          console.error("Erro no login:", error.code, error.message);
          loginErrorMessage.textContent = 'Email ou senha inválidos.';
          // Esconder o loading manualmente em caso de erro
          const loadingEl = document.getElementById('loading-overlay');
          if (loadingEl) loadingEl.style.display = 'none';
        }
      });
    } else {
      console.error("Formulário de login não encontrado!");
    }

    // *** Evento para criar conta ***
    if (btnCriarConta) {
      btnCriarConta.addEventListener('click', async () => {
        loginErrorMessage.textContent = '';
        authMessage.textContent = '';
        
        const email = loginEmailInput.value.trim();
        const password = loginSenhaInput.value;

        if (!email || !password) {
          authMessage.textContent = 'Por favor, preencha email e senha para criar uma conta.';
          return;
        }
        
        if (password.length < 6) {
          authMessage.textContent = 'A senha deve ter pelo menos 6 caracteres.';
          return;
        }

        // Mostrar indicador de loading
        const esconderLoading = AppModulos.UI.mostrarLoading('Criando conta...');

        try {
          console.log("Tentando criar conta para:", email);
          const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
          console.log("Conta criada com sucesso para:", email);
          
          // Esconder loading manualmente
          const loadingEl = document.getElementById('loading-overlay');
          if (loadingEl) loadingEl.style.display = 'none';
          
          authMessage.textContent = `Conta criada para ${userCredential.user.email}! Complete seu cadastro.`;
          
          // Em vez de esperar o onAuthStateChanged, vamos exibir o formulário de cadastro complementar
          exibirFormularioCadastroComplementar(userCredential.user);
          
        } catch (error) {
          console.error("Erro ao criar conta:", error.code, error.message);
          
          // Esconder loading manualmente
          const loadingEl = document.getElementById('loading-overlay');
          if (loadingEl) loadingEl.style.display = 'none';
          
          switch (error.code) {
            case 'auth/email-already-in-use':
              authMessage.textContent = 'Este email já está em uso.';
              break;
            case 'auth/invalid-email':
              authMessage.textContent = 'O formato do email é inválido.';
              break;
            case 'auth/weak-password':
              authMessage.textContent = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
              break;
            case 'auth/operation-not-allowed':
              authMessage.textContent = 'Criação de conta por email/senha não está habilitada no Firebase.';
              break;
            default:
              authMessage.textContent = 'Erro ao criar conta. Verifique o console para detalhes.';
          }
        }
      });
    } else {
      console.error("Botão 'Criar Conta' não encontrado!");
    }

    // *** Evento de logout ***
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        try {
          await window.auth.signOut();
          console.log("Logout realizado com sucesso");
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
        }
      });
    } else {
      console.error("Botão 'Logout' não encontrado!");
    }

    // *** Configurar listener de mudança de autenticação ***
    console.log("Configurando listener de autenticação...");
    window.auth.onAuthStateChanged(async (user) => {
      console.log("Estado de autenticação alterado:", user ? "Usuário logado" : "Usuário deslogado");
      
      // Resetar estado global
      window.currentUser = user;
      window.isAdmin = user ? (user.email === window.ADMIN_EMAIL || user.uid === window.ADMIN_ID) : false;
      
      // Definir um timeout para garantir que a interface não fique travada
      const timeoutId = setTimeout(() => {
        // Se depois de 10 segundos ainda estiver carregando, forçar a ocultar o loading
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl && loadingEl.style.display !== 'none') {
          console.warn("Timeout de carregamento atingido. Forçando esconder loading.");
          loadingEl.style.display = 'none';
          if (window.AppModulos && window.AppModulos.UI) {
            AppModulos.UI.mostrarNotificacao('O carregamento está demorando mais que o esperado. Tente recarregar a página.', 'aviso');
          } else {
            alert('O carregamento está demorando mais que o esperado. Tente recarregar a página.');
          }
        }
      }, 10000); // 10 segundos de timeout
      
      try {
        // Esconder loading caso esteja visível de um erro anterior
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (user) {
          // Usuário está logado
          window.currentUser = user;
          window.isAdmin = user.email === window.ADMIN_EMAIL || user.uid === window.ADMIN_ID;
          
          console.log("Usuário autenticado:", user.email, "ID:", user.uid);
          console.log("É administrador?", window.isAdmin);
          console.log("Email do administrador:", window.ADMIN_EMAIL);
          console.log("ID do administrador:", window.ADMIN_ID);
          
          // Esconder loading manualmente (sem usar a função esconderLoading que não existe)
          const loadingEl = document.getElementById('loading-overlay');
          if (loadingEl) loadingEl.style.display = 'none';
          
          // Esconder área de login
          areaLogin.style.display = 'none';
          
          // Obter dados adicionais do usuário
          console.log("Obtendo documento do usuário do Firestore...");
          try {
            const userDoc = await window.db.collection('usuarios').doc(user.uid).get();
            
            if (userDoc.exists) {
              const userData = userDoc.data();
              console.log("Usuário encontrado no Firestore:", userData);
              
              // Verificar se o usuário já preencheu os dados complementares
              if (!userData.dadosComplementaresPreenchidos && !window.isAdmin) {
                // Dados complementares ainda não preenchidos e não é admin
                console.log("Dados complementares não preenchidos, mostrando formulário...");
                exibirFormularioCadastroComplementar(user);
              } else if (!userData.aprovado && !window.isAdmin) {
                // Usuário ainda não aprovado e não é admin
                console.log("Usuário não aprovado, mostrando tela de espera...");
                exibirTelaAguardandoAprovacao();
              } else {
                // Usuário já preencheu dados e está aprovado (ou é admin)
                console.log("Usuário aprovado ou é admin, carregando dashboard...");
                appContainer.style.display = 'block';
                
                // Atualizar nome do usuário no header
                atualizarNomeUsuarioHeader(userData, user);
                
                // Configurar interface para admin ou médico regular
                await mostrarInterface(window.isAdmin);
                
                // Verificar e atualizar último acesso
                if (!userData.ultimoAcesso || new Date() - userData.ultimoAcesso.toDate() > 24 * 60 * 60 * 1000) {
                  // Atualizar documento do usuário com a data do último acesso
                  await window.db.collection('usuarios').doc(user.uid).update({
                    ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
                  });
                }
              }
            } else {
              // Documento do usuário não existe (primeira vez que faz login)
              console.log("Criando novo documento de usuário no Firestore...");
              
              // Registrar o usuário no Firestore
              await window.db.collection('usuarios').doc(user.uid).set({
                email: user.email,
                dataRegistro: firebase.firestore.FieldValue.serverTimestamp(),
                ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp(),
                aprovado: window.isAdmin, // Se for admin, já está aprovado por padrão
                dadosComplementaresPreenchidos: window.isAdmin, // Se for admin, não precisa preencher dados complementares
                status: 'ativo',
                isAdmin: window.isAdmin // Marcar explicitamente como admin no documento
              });
              
              // Exibir formulário de cadastro complementar ou interface completa para admin
              if (window.isAdmin) {
                console.log("Novo usuário admin criado, carregando dashboard...");
                appContainer.style.display = 'block';
                
                // Atualizar nome do usuário no header (usar email para admin novo)
                atualizarNomeUsuarioHeader(null, user);
                
                await mostrarInterface(true);
              } else {
                console.log("Novo usuário criado, mostrando formulário de cadastro complementar...");
                exibirFormularioCadastroComplementar(user);
              }
            }
          } catch (error) {
            console.error("Erro ao obter/criar documento do usuário:", error);
            AppModulos.UI.mostrarNotificacao("Erro ao acessar seus dados. Por favor, tente novamente.", "erro");
            
            // Em caso de erro, forçar mostrar o container
            areaLogin.style.display = 'none';
            appContainer.style.display = 'block';
          }
        } else {
          console.log("Usuário deslogado, redirecionando para tela de login");
          
          // Se não houver usuário autenticado, mostrar a tela de login
          if (areaLogin && appContainer) {
            console.log("Redirecionando para tela de login");
            areaLogin.style.display = 'block';
            appContainer.style.display = 'none';
          }
          
          // Limpar qualquer timeout
          clearTimeout(timeoutId);
          
          // Limpar dados da sessão
          limparDadosSessao();
        }
      } catch (error) {
        console.error("Erro no processamento de autenticação:", error);
        clearTimeout(timeoutId);
        
        // Esconder loading caso esteja visível
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) loadingEl.style.display = 'none';
        
        // Mostrar mensagem de erro
        loginErrorMessage.textContent = 'Ocorreu um erro durante a autenticação. Tente novamente.';
      }
    });

    console.log("Módulo de login inicializado com sucesso");
  }

  // Função para exibir formulário de cadastro complementar
  function exibirFormularioCadastroComplementar(user) {
    console.log("Exibindo formulário de cadastro complementar para o usuário:", user.email);
    
    if (!areaLogin || !appContainer) {
      console.error("Elementos principais da UI não encontrados para exibir formulário complementar");
      return;
    }
    
    // Esconder tela de login e container principal
    areaLogin.style.display = 'none';
    appContainer.style.display = 'block';
    
    // Encontrar o elemento main
    const main = document.querySelector('main');
    if (!main) {
      console.error("Elemento main não encontrado para adicionar formulário complementar");
      // Mostrar mensagem de erro para o usuário
      alert("Erro ao exibir formulário de cadastro. Por favor, recarregue a página.");
      return;
    }
    
    console.log("Elemento main encontrado, adicionando formulário complementar");
    
    // Adicionar estilos específicos para o formulário de cadastro
    const style = document.createElement('style');
    style.textContent = `
      .cadastro-complementar-section {
        max-width: 700px;
        margin: 30px auto;
        padding: 20px;
      }
      
      .cadastro-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
      }
      
      .cadastro-container h2 {
        color: #4285f4;
        margin-bottom: 5px;
        text-align: center;
      }
      
      .cadastro-intro {
        color: #666;
        text-align: center;
        margin-bottom: 25px;
      }
      
      .form-crm {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
        border-left: 4px solid #4285f4;
      }
      
      .form-crm h3 {
        margin-top: 0;
        font-size: 16px;
        color: #4285f4;
      }
      
      .campo-obrigatorio {
        color: #dc3545;
      }
    `;
    document.head.appendChild(style);
    
    // Criar elemento para o formulário
    const formContainer = document.createElement('section');
    formContainer.className = 'cadastro-complementar-section';
    formContainer.id = 'cadastro-complementar-section';
    
    // Lista de estados brasileiros
    const estados = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    
    // Gerar options para o select de estados
    let estadosOptions = '';
    estados.forEach(estado => {
      estadosOptions += `<option value="${estado}">${estado}</option>`;
    });
    
    // HTML do formulário
    formContainer.innerHTML = `
      <div class="cadastro-container">
        <h2>Complete seu Cadastro Médico</h2>
        <p class="cadastro-intro">Para finalizar seu registro, precisamos de algumas informações adicionais.</p>
        
        <form id="form-cadastro-complementar">
          <div class="form-group">
            <label for="nome-completo">Nome Completo: <span class="campo-obrigatorio">*</span></label>
            <input type="text" id="nome-completo" required>
          </div>
          
          <div class="form-group">
            <label for="cpf">CPF: <span class="campo-obrigatorio">*</span></label>
            <input type="text" id="cpf" required placeholder="000.000.000-00" maxlength="14">
          </div>
          
          <div class="form-group">
            <label for="telefone">Telefone: <span class="campo-obrigatorio">*</span></label>
            <input type="tel" id="telefone" required placeholder="(00) 00000-0000" maxlength="15">
          </div>
          
          <div class="form-group">
            <label for="especialidade">Especialidade:</label>
            <input type="text" id="especialidade">
          </div>
          
          <div class="form-crm">
            <h3>Informações de CRM</h3>
            
            <div class="form-group">
              <label for="crm-numero">Número CRM: <span class="campo-obrigatorio">*</span></label>
              <input type="text" id="crm-numero" required placeholder="Digite apenas números">
            </div>
            
            <div class="form-group">
              <label for="crm-estado">Estado do CRM: <span class="campo-obrigatorio">*</span></label>
              <select id="crm-estado" required>
                <option value="">Selecione</option>
                ${estadosOptions}
              </select>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="btn-cadastrar-medico" class="btn-primary">Finalizar Cadastro</button>
          </div>
        </form>
      </div>
    `;
    
    // Verificar se já existe uma seção de cadastro complementar
    const secaoExistente = document.getElementById('cadastro-complementar-section');
    if (secaoExistente) {
      console.log("Seção de cadastro complementar já existe, substituindo...");
      main.replaceChild(formContainer, secaoExistente);
    } else {
      console.log("Adicionando nova seção de cadastro complementar");
      main.appendChild(formContainer);
    }
    
    console.log("Formulário de cadastro complementar adicionado com sucesso");
    
    // Aplicar máscaras
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
      cpfInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 9) {
          this.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
          this.value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 3) {
          this.value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
        } else {
          this.value = value;
        }
      });
    } else {
      console.error("Elemento CPF não encontrado após adicionar formulário");
    }
    
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
      telefoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 10) {
          this.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
          this.value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
          this.value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
          this.value = value;
        }
      });
    } else {
      console.error("Elemento telefone não encontrado após adicionar formulário");
    }
    
    // Adicionar evento para o formulário
    const formCadastroComplementar = document.getElementById('form-cadastro-complementar');
    if (formCadastroComplementar) {
      formCadastroComplementar.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nomeCompleto = document.getElementById('nome-completo').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const especialidade = document.getElementById('especialidade').value.trim();
        const crmNumero = document.getElementById('crm-numero').value.trim();
        const crmEstado = document.getElementById('crm-estado').value;
        
        // Validações básicas
        if (!nomeCompleto || !cpf || !telefone || !crmNumero || !crmEstado) {
          AppModulos.UI.mostrarNotificacao('Preencha todos os campos obrigatórios', 'aviso');
          return;
        }
        
        if (cpf.replace(/\D/g, '').length !== 11) {
          AppModulos.UI.mostrarNotificacao('CPF inválido', 'erro');
          return;
        }
        
        // Salvar as informações complementares no Firestore
        try {
          const esconderLoading = AppModulos.UI.mostrarLoading('Finalizando seu cadastro...');
          
          // Atualizar o documento do usuário no Firestore
          await window.db.collection('usuarios').doc(user.uid).update({
            nomeCompleto: nomeCompleto,
            cpf: cpf,
            telefone: telefone,
            especialidade: especialidade || null,
            crm: {
              numero: crmNumero,
              estado: crmEstado
            },
            dadosComplementaresPreenchidos: true,
            dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          // Esconder loading manualmente
          const loadingEl = document.getElementById('loading-overlay');
          if (loadingEl) loadingEl.style.display = 'none';
          
          AppModulos.UI.mostrarNotificacao('Cadastro finalizado com sucesso! Aguarde a aprovação do administrador.', 'sucesso');
          
          // Mostrar tela de espera por aprovação
          setTimeout(() => {
            exibirTelaAguardandoAprovacao();
          }, 1500);
          
        } catch (error) {
          console.error("Erro ao salvar dados complementares:", error);
          AppModulos.UI.mostrarNotificacao('Erro ao salvar seus dados. Tente novamente.', 'erro');
        }
      });
    } else {
      console.error("Formulário de cadastro complementar não encontrado após ser adicionado ao DOM");
    }
  }

  // Função para mostrar a interface principal do app
  async function mostrarInterface(isAdminUser) {
    console.log("Mostrando interface principal", isAdminUser ? "Admin" : "Usuário regular");
    
    // Verificar se os elementos existem
    if (!areaLogin || !appContainer) {
      console.error("Elementos principais da UI não encontrados:", {
        areaLogin: !!areaLogin,
        appContainer: !!appContainer
      });
      alert("Erro ao exibir interface: elementos não encontrados. Tente recarregar a página.");
      return;
    }
    
    // Verificar se os módulos necessários estão disponíveis
    if (!window.AppModulos) {
      console.error("Objeto global AppModulos não está disponível!");
      alert("Erro ao carregar a aplicação: módulos não foram inicializados corretamente. Tente recarregar a página.");
      return;
    }
    
    // Verificar módulos específicos
    const modulosNecessarios = ['UI'];
    let modulosFaltantes = [];
    
    modulosNecessarios.forEach(modulo => {
      if (!window.AppModulos[modulo]) {
        modulosFaltantes.push(modulo);
      }
    });
    
    if (modulosFaltantes.length > 0) {
      console.error(`Módulos necessários não encontrados: ${modulosFaltantes.join(', ')}`);
      alert(`Erro ao carregar a aplicação: módulos essenciais não estão disponíveis. Tente recarregar a página.`);
      return;
    }
    
    try {
      // Esconder login e mostrar app
      areaLogin.style.display = 'none';
      appContainer.style.display = 'block';
      
      // Remover formulário de cadastro complementar se existir
      const cadastroComplementar = document.getElementById('cadastro-complementar-section');
      if (cadastroComplementar) {
        cadastroComplementar.remove();
      }
      
      // Verificar módulos específicos para o tipo de usuário
      if (isAdminUser && !window.AppModulos.Admin) {
        console.error("Módulo Admin não encontrado para usuário administrador");
        alert("Erro ao carregar interface de administrador. Tente recarregar a página.");
        return;
      } else if (!isAdminUser && !window.AppModulos.Equipes) {
        console.error("Módulo Equipes não encontrado para usuário regular");
        alert("Erro ao carregar interface de usuário. Tente recarregar a página.");
        return;
      }
      
      // Configurar interface para admin ou médico regular
      if (isAdminUser) {
        console.log("Adicionando interface de administrador");
        adicionarInterfaceAdmin();
        
        // Garantir que a seção de administração exista no DOM
        if (!document.getElementById('admin-section')) {
          console.log("Seção de administração não encontrada, garantindo que seja criada");
          const script = document.createElement('script');
          script.textContent = `
            document.addEventListener('DOMContentLoaded', function() {
              document.dispatchEvent(new Event('app-admin-ready'));
            });
          `;
          document.head.appendChild(script);
          document.dispatchEvent(new Event('app-admin-ready'));
        }
        
        // Carregar interface administrativa e inicializar módulo Admin
        if (window.AppModulos.Admin) {
          console.log("Inicializando módulo de administração");
          setTimeout(() => {
            try {
              // Carregar dados administrativos
              window.AppModulos.Admin.carregarDadosAdmin();
            } catch (error) {
              console.error("Erro ao carregar dados administrativos:", error);
            }
          }, 500);
        }
      } else {
        // Para usuários não-admin, carregar suas equipes
        console.log("Carregando equipes do usuário não-admin...");
        try {
          console.log(`🔥 CARREGANDO EQUIPES para usuário: ${window.currentUser.email} (ID: ${window.currentUser.uid})`);
          
          const equipesDoUsuario = await AppVisita.Firebase.Equipes.obterEquipesDoUsuario(window.currentUser.uid);
          window.equipesUsuario = equipesDoUsuario;
          
          console.log(`🔥 RESULTADO do carregamento de equipes:`);
          console.log(`🔥 Quantidade de equipes encontradas: ${equipesDoUsuario.length}`);
          console.log(`🔥 Dados das equipes:`, equipesDoUsuario);
          console.log(`🔥 window.equipesUsuario agora contém:`, window.equipesUsuario);
          
          if (equipesDoUsuario.length > 0) {
            equipesDoUsuario.forEach((equipe, index) => {
              console.log(`🔥 Equipe ${index + 1}: "${equipe.nome}" (ID: ${equipe.id})`);
              console.log(`🔥 Membros da equipe:`, equipe.membros);
              console.log(`🔥 Usuário ${window.currentUser.uid} está nos membros?`, equipe.membros?.includes(window.currentUser.uid));
            });
            
            // Adicionar seletor de equipe se o médico pertencer a alguma equipe
            console.log("🔥 Adicionando seletor de equipe ao formulário");
            AppModulos.Equipes.adicionarSeletorEquipeAoFormulario(equipesDoUsuario);
            
            // Carregar pacientes após carregar as equipes
            console.log("🔥 Carregando pacientes após carregar equipes...");
            if (typeof window.carregarPacientes === 'function') {
              setTimeout(() => window.carregarPacientes(), 500);
            }
          } else {
            console.warn("🔥 AVISO: Usuário não pertence a nenhuma equipe");
            console.log(`🔥 Verificar se o usuário ${window.currentUser.uid} foi adicionado corretamente às equipes no Firebase`);
            AppModulos.UI.mostrarNotificacao('Você não está associado a nenhuma equipe médica. Entre em contato com o administrador.', 'aviso');
          }
        } catch (error) {
          console.error("Erro ao carregar equipes do usuário:", error);
          AppModulos.UI.mostrarNotificacao('Erro ao carregar suas equipes médicas.', 'erro');
        }
      }
      
      // Configurar navegação
      console.log("Configurando navegação");
      configurarNavegacao();
      
      console.log("Interface principal exibida com sucesso");
    } catch (error) {
      console.error("ERRO AO MOSTRAR INTERFACE:", error);
      
      // Mostrar erro para o usuário
      if (window.AppModulos && window.AppModulos.UI) {
        window.AppModulos.UI.mostrarNotificacao(`Erro ao carregar interface: ${error.message}`, 'erro');
      } else {
        alert(`Erro ao carregar interface: ${error.message}`);
      }
      
      // Voltar para a tela de login como fallback
      areaLogin.style.display = 'block';
      appContainer.style.display = 'none';
    }
  }

  // Função para mostrar tela de aprovação pendente
  function exibirTelaAguardandoAprovacao() {
    console.log("Exibindo tela de aguardando aprovação...");
    
    if (!areaLogin || !appContainer) {
      console.error("Elementos principais da UI não encontrados para exibir tela de aprovação");
      return;
    }
    
    // Esconder tela de login, mostrar container principal
    areaLogin.style.display = 'none';
    appContainer.style.display = 'block';
    
    // Remover formulário de cadastro complementar se existir
    const cadastroComplementar = document.getElementById('cadastro-complementar-section');
    if (cadastroComplementar) {
      console.log("Removendo formulário de cadastro complementar existente");
      cadastroComplementar.remove();
    }
    
    // Obter o elemento main
    const main = document.querySelector('main');
    if (!main) {
      console.error("Elemento main não encontrado para adicionar tela de aprovação");
      alert("Erro ao exibir tela de aprovação. Por favor, recarregue a página.");
      return;
    }
    
    // Limpar conteúdo atual de main
    main.innerHTML = '';
    
    // Criar a seção de aprovação pendente
    const aguardandoAprovacao = document.createElement('section');
    aguardandoAprovacao.className = 'aguardando-aprovacao';
    aguardandoAprovacao.innerHTML = `
      <div class="mensagem-aprovacao">
        <i class="fas fa-user-clock"></i>
        <h2>Conta em Análise</h2>
        <p>Seu cadastro está pendente de aprovação pelo administrador do sistema.</p>
        <p>Por favor, entre em contato com o administrador para solicitar a aprovação da sua conta.</p>
        <button id="btn-logout-aprovacao" class="btn-primary">Sair</button>
      </div>
    `;
    
    // Adicionar ao main
    main.appendChild(aguardandoAprovacao);
    console.log("Tela de aguardando aprovação adicionada com sucesso");
    
    // Adicionar evento para o botão de logout na tela de aprovação
    const btnLogoutAprovacao = document.getElementById('btn-logout-aprovacao');
    if (btnLogoutAprovacao) {
      btnLogoutAprovacao.addEventListener('click', () => {
        AppVisita.Firebase.Auth.logout();
      });
    } else {
      console.error("Botão de logout na tela de aprovação não encontrado");
    }
    
    // Adicionar estilos para a tela de aprovação
    const style = document.createElement('style');
    style.textContent = `
      .aguardando-aprovacao {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
        padding: 20px;
      }
      
      .mensagem-aprovacao {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
        text-align: center;
        max-width: 600px;
      }
      
      .mensagem-aprovacao i {
        font-size: 48px;
        color: #ffc107;
        margin-bottom: 15px;
      }
      
      .mensagem-aprovacao h2 {
        color: #333;
        margin-bottom: 15px;
      }
      
      .mensagem-aprovacao p {
        color: #666;
        margin-bottom: 10px;
      }
      
      #btn-logout-aprovacao {
        margin-top: 20px;
      }
    `;
    document.head.appendChild(style);
  }

  // Função para adicionar interface de administrador
  function adicionarInterfaceAdmin() {
    console.log("Adicionando interface de administrador ao menu");
    const menuList = document.querySelector('#menu-principal ul');
    
    if (!menuList) {
      console.error("Menu principal não encontrado para adicionar botão de administração");
      return;
    }
    
    // Adicionar botão de admin apenas se ainda não existir
    if (!document.getElementById('btn-admin')) {
      const adminMenuItem = document.createElement('li');
      adminMenuItem.innerHTML = `<button id="btn-admin" class="menu-btn"><i class="fas fa-tools"></i> Administração</button>`;
      
      // Verificar se o botão de logout existe para inserir antes dele
      const logoutItem = btnLogout ? btnLogout.parentElement : null;
      
      if (logoutItem) {
        menuList.insertBefore(adminMenuItem, logoutItem);
      } else {
        // Se não encontrar o item de logout, adiciona ao final
        menuList.appendChild(adminMenuItem);
      }
      
      // Adicionar badge de admin ao nome do app na header
      const appTitle = document.querySelector('header h1');
      if (appTitle && !document.querySelector('.admin-badge')) {
        appTitle.innerHTML = `AppVisita <span class="admin-badge">ADMIN</span>`;
      }
      
      // Adicionar evento ao botão de admin
      const btnAdmin = document.getElementById('btn-admin');
      if (btnAdmin) {
        btnAdmin.addEventListener('click', () => {
          console.log("Botão de administração clicado");
          if (window.AppModulos && window.AppModulos.UI) {
            window.AppModulos.UI.alternarSecaoAtiva('admin-section', btnAdmin);
          } else {
            console.error("Módulo UI não disponível para navegação");
          }
        });
      } else {
        console.error("Botão de administração não encontrado após ser adicionado");
      }
      
      console.log("Interface de administrador configurada com sucesso");
    } else {
      console.log("Botão de administração já existe no menu");
    }
  }

  // Função para configurar navegação entre seções
  function configurarNavegacao() {
    const btnDashboard = document.getElementById('btn-dashboard');
    const btnAdicionarNovo = document.getElementById('btn-adicionar-novo');
    const btnConsultar = document.getElementById('btn-consultar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Verificar se os elementos foram encontrados
    const elementosNavegacao = {
      btnDashboard, btnAdicionarNovo, btnConsultar, sidebar, sidebarOverlay
    };
    
    const elementosFaltantes = [];
    
    for (const [nome, elemento] of Object.entries(elementosNavegacao)) {
      if (!elemento) {
        elementosFaltantes.push(nome);
      }
    }
    
    if (elementosFaltantes.length > 0) {
      console.error(`Elementos de navegação faltantes: ${elementosFaltantes.join(', ')}`);
      alert(`Erro ao configurar navegação: elementos não encontrados. Tente recarregar a página.`);
      return;
    }
    
    console.log("Adicionando eventos aos botões de navegação");
    
    // Adicionar eventos apenas se os elementos existirem
    if (btnDashboard) {
      btnDashboard.addEventListener('click', () => {
        if (!window.AppModulos || !window.AppModulos.UI) {
          console.error("Módulo UI não disponível para alternar seção");
          return;
        }
        AppModulos.UI.alternarSecaoAtiva('dashboard-section', btnDashboard);
      });
    }
    
    if (btnAdicionarNovo) {
      btnAdicionarNovo.addEventListener('click', () => {
        console.log("🔥 BOTÃO ADICIONAR PACIENTE clicado");
        console.log("🔥 window.equipesUsuario disponível:", window.equipesUsuario);
        console.log("🔥 Quantidade de equipes do usuário:", window.equipesUsuario?.length || 0);
        
        if (!window.AppModulos || !window.AppModulos.UI) {
          console.error("Módulo UI não disponível para alternar seção");
          return;
        }
        AppModulos.UI.alternarSecaoAtiva('adicionar-paciente-section', btnAdicionarNovo);
        
        // Adicionar seletor de equipe se o médico pertencer a uma ou mais equipes
        if (!window.isAdmin && window.equipesUsuario && window.equipesUsuario.length > 0 && window.AppModulos.Equipes) {
          console.log("🔥 Tentando adicionar seletor de equipe...");
          try {
            AppModulos.Equipes.adicionarSeletorEquipeAoFormulario(window.equipesUsuario);
          } catch (error) {
            console.error("🔥 ERRO ao adicionar seletor de equipe:", error);
          }
        } else {
          console.warn("🔥 Seletor de equipe NÃO será adicionado:");
          console.log("🔥 - É admin?", window.isAdmin);
          console.log("🔥 - Tem equipes?", window.equipesUsuario?.length > 0);
          console.log("🔥 - Módulo Equipes disponível?", !!window.AppModulos?.Equipes);
        }
      });
    }
    
    if (btnConsultar) {
      btnConsultar.addEventListener('click', () => {
        if (!window.AppModulos || !window.AppModulos.UI) {
          console.error("Módulo UI não disponível para alternar seção");
          return;
        }
        AppModulos.UI.alternarSecaoAtiva('consultar-paciente-section', btnConsultar);
      });
    }
    
    // Configurar ações do sidebar se o módulo UI estiver disponível
    if (window.AppModulos && window.AppModulos.UI) {
      try {
        AppModulos.UI.configurarSidebar();
        console.log("Sidebar configurado com sucesso");
      } catch (error) {
        console.error("Erro ao configurar sidebar:", error);
      }
    } else {
      console.error("Módulo UI não disponível para configurar sidebar");
    }
  }

  // Função para limpar dados da sessão quando o usuário deslogar
  function limparDadosSessao() {
    // Limpar listas
    if (typeof AppModulos !== 'undefined' && typeof AppModulos.Pacientes !== 'undefined' && typeof AppModulos.Pacientes.renderizarPacientes === 'function') {
      AppModulos.Pacientes.renderizarPacientes([]);
    }
    
    // Remover elementos específicos da UI
    const adminBtn = document.getElementById('btn-admin');
    if (adminBtn) adminBtn.parentElement.remove();
    
    const adminBadge = document.querySelector('.admin-badge');
    if (adminBadge) adminBadge.remove();
    
    const seletorEquipes = document.querySelector('.seletor-equipes');
    if (seletorEquipes) seletorEquipes.remove();
    
    // Limpar cache
    if (window.AppVisita && window.AppVisita.cache) {
      window.AppVisita.cache.limpar();
    }
  }

  // Função para restaurar a tela de login (uso em casos de erro)
  function resetarTelaLogin() {
    console.log("Resetando tela de login...");
    
    // Resetar todas as mensagens de erro
    if (loginErrorMessage) {
      loginErrorMessage.textContent = '';
    }
    
    // Esconder possíveis loadings manualmente
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) loadingEl.style.display = 'none';
    
    // Limpar campos de login
    if (loginEmailInput) {
      loginEmailInput.value = '';
    }
    if (loginSenhaInput) {
      loginSenhaInput.value = '';
    }
    
    // Esconder container principal, mostrar tela de login
    if (appContainer) {
      appContainer.style.display = 'none';
    }
    if (areaLogin) {
      areaLogin.style.display = 'flex';
    }
    
    console.log("Tela de login resetada");
  }

  // Função para atualizar nome do usuário no header
  function atualizarNomeUsuarioHeader(userData, user) {
    console.log("Atualizando nome do usuário no header");
    
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      // Priorizar nomeCompleto, depois email
      const nomeExibicao = userData?.nomeCompleto || user.email.split('@')[0];
      
      // Limitar o tamanho do nome para não quebrar o layout
      const nomeFormatado = nomeExibicao.length > 20 
        ? nomeExibicao.substring(0, 20) + '...' 
        : nomeExibicao;
      
      userNameElement.textContent = nomeFormatado;
      userNameElement.title = userData?.nomeCompleto || user.email; // Tooltip com nome completo
      
      console.log(`Nome do usuário atualizado para: ${nomeFormatado}`);
    } else {
      console.warn("Elemento user-name não encontrado no DOM");
    }
  }
}); 