// Firebase Config - SUBSTITUA COM SUAS CONFIGURAÇÕES!
const firebaseConfig = {
  apiKey: "AIzaSyA8IvktQAQYs_25dS7pRSK1HthcAg0WS00",
  authDomain: "appvisita-1939a.firebaseapp.com",
  projectId: "appvisita-1939a",
  storageBucket: "appvisita-1939a.firebasestorage.app",
  messagingSenderId: "231699401102",
  appId: "1:231699401102:web:20947de9c4d6485362bcdf"
};
// Configuração de Administrador
const ADMIN_EMAIL = "rodrigo.tozato@strivium.com.br"; // Email do administrador - SUBSTITUA PELO SEU EMAIL

// Variáveis globais do Firebase
let app, auth, db, storage;
let isAdmin = false;
let currentUser = null;
let pacientesLocal = []; // Array local para manipulação, será sincronizado com Firestore
let todosPacientes = []; // Array com todos os pacientes (ativos e inativos)
let equipesUsuario = []; // Lista de equipes que o usuário pertence

console.log("Iniciando script.js");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM totalmente carregado");
    
    // Inicialização do Firebase - MOVIDO PARA DENTRO DO EVENTO DOMContentLoaded
if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
            console.log("Configuração do Firebase válida. Tentando inicializar...");
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
            console.log("Firebase inicializado com sucesso:", { auth: !!auth, db: !!db, storage: !!storage });
    } catch (e) {
        console.error("Erro ao inicializar Firebase:", e);
        alert("Erro ao inicializar Firebase. Verifique a configuração e o console. Detalhes: " + e.message);
    }
} else {
    console.error("Configuração do Firebase não encontrada ou incompleta. Cole seu firebaseConfig no script.js e descomente as linhas.");
    alert("Erro de configuração do Firebase! Verifique o console e se o firebaseConfig está correto e descomentado no script.js.");
}

    // Elementos da UI de Login
    const areaLogin = document.getElementById('area-login');
    const appContainer = document.getElementById('app-container');
    const formLogin = document.getElementById('form-login');
    const loginEmailInput = document.getElementById('login-email');
    const loginSenhaInput = document.getElementById('login-senha');
    const btnLogout = document.getElementById('btn-logout');
    const btnCriarConta = document.getElementById('btn-criar-conta');
    const loginErrorMessage = document.getElementById('login-error-message');
    const authMessage = document.getElementById('auth-message');

    console.log("Elementos de UI capturados:", {
        areaLogin: !!areaLogin,
        appContainer: !!appContainer,
        formLogin: !!formLogin,
        loginEmailInput: !!loginEmailInput,
        loginSenhaInput: !!loginSenhaInput
    });

    // Elementos da App (alguns já existentes, outros podem precisar de ajuste)
    const formAdicionarPaciente = document.getElementById('form-adicionar-paciente');
    const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
    const ordenarPor = document.getElementById('ordenar-por');

    // Elementos do menu e seções
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const btnDashboard = document.getElementById('btn-dashboard');
    const btnAdicionarNovo = document.getElementById('btn-adicionar-novo');
    const btnConsultar = document.getElementById('btn-consultar');
    const dashboardSection = document.getElementById('dashboard-section');
    const adicionarPacienteSection = document.getElementById('adicionar-paciente-section');
    const consultarPacienteSection = document.getElementById('consultar-paciente-section');

    const modalEvolucao = document.getElementById('modal-evolucao');
    const modalTituloPaciente = document.getElementById('modal-titulo-paciente');
    const formEvolucao = document.getElementById('form-evolucao');
    const textoEvolucaoInput = document.getElementById('texto-evolucao');
    const pacienteIdEvolucaoInput = document.getElementById('paciente-id-evolucao'); // Usaremos para o ID do Documento Firestore
    const historicoEvolucoesModalDiv = document.getElementById('historico-evolucoes-modal');
    const closeButtonEvolucao = modalEvolucao.querySelector('.close-button');

    // Elemento para administração (será adicionado dinamicamente se for admin)
    const adminMenuItem = document.createElement('li');
    adminMenuItem.innerHTML = `<button id="btn-admin" class="menu-btn"><i class="fas fa-tools"></i> Administração</button>`;
    const btnAdmin = adminMenuItem.querySelector('#btn-admin');
    
    // Criar seção de administração (oculta inicialmente)
    const adminSection = document.createElement('section');
    adminSection.id = 'admin-section';
    adminSection.className = 'app-section';
    adminSection.innerHTML = `
        <h2><i class="fas fa-tools"></i> Painel de Administração</h2>
        <div class="admin-container">
            <div class="admin-tabs">
                <button id="tab-usuarios" class="admin-tab active">Usuários</button>
                <button id="tab-equipes" class="admin-tab">Equipes Médicas</button>
                <button id="tab-estatisticas" class="admin-tab">Estatísticas</button>
            </div>
            
            <div id="tab-content-usuarios" class="admin-tab-content active">
                <div class="admin-card">
                    <h3><i class="fas fa-users"></i> Gerenciamento de Usuários</h3>
                    <div class="admin-filters">
                        <button id="filtro-todos" class="btn-filter active">Todos</button>
                        <button id="filtro-pendentes" class="btn-filter">Pendentes</button>
                        <button id="filtro-aprovados" class="btn-filter">Aprovados</button>
                    </div>
                    <div class="admin-stats">
                        <div id="total-usuarios" class="stat-box">
                            <span class="stat-value">--</span>
                            <span class="stat-label">Usuários registrados</span>
                        </div>
                        <div id="usuarios-pendentes" class="stat-box">
                            <span class="stat-value">--</span>
                            <span class="stat-label">Pendentes de aprovação</span>
                        </div>
                    </div>
                    <div id="lista-usuarios" class="admin-lista">
                        <p class="carregando-info">Carregando usuários...</p>
                    </div>
                </div>
            </div>
            
            <div id="tab-content-equipes" class="admin-tab-content">
                <div class="admin-card">
                    <h3><i class="fas fa-user-md"></i> Gerenciamento de Equipes Médicas</h3>
                    <div class="equipes-actions">
                        <button id="btn-nova-equipe" class="btn-primary">
                            <i class="fas fa-plus-circle"></i> Nova Equipe
                        </button>
                    </div>
                    <div id="lista-equipes" class="admin-lista">
                        <p class="carregando-info">Carregando equipes...</p>
                    </div>
                </div>
            </div>
            
            <div id="tab-content-estatisticas" class="admin-tab-content">
                <div class="admin-card">
                    <h3><i class="fas fa-database"></i> Estatísticas do Sistema</h3>
                    <div class="admin-stats">
                        <div id="total-pacientes" class="stat-box">
                            <span class="stat-value">--</span>
                            <span class="stat-label">Total de pacientes</span>
                        </div>
                        <div id="total-evolucoes" class="stat-box">
                            <span class="stat-value">--</span>
                            <span class="stat-label">Total de evoluções</span>
                        </div>
                        <div id="total-equipes" class="stat-box">
                            <span class="stat-value">--</span>
                            <span class="stat-label">Equipes médicas</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal para criar/editar equipe -->
        <div id="modal-equipe" class="modal">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2 id="modal-titulo-equipe">Nova Equipe</h2>
                <form id="form-equipe">
                    <div class="form-group">
                        <label for="nome-equipe">Nome da Equipe:</label>
                        <input type="text" id="nome-equipe" required placeholder="Ex: Cardiologia Hospital A">
                    </div>
                    <div class="form-group">
                        <label for="descricao-equipe">Descrição:</label>
                        <textarea id="descricao-equipe" placeholder="Breve descrição da equipe"></textarea>
                    </div>
                    <input type="hidden" id="equipe-id" value="">
                    <div class="form-group">
                        <label>Médicos da Equipe:</label>
                        <div id="selecao-medicos" class="selecao-medicos">
                            <p class="carregando-info">Carregando médicos disponíveis...</p>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Salvar Equipe</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.querySelector('main').appendChild(adminSection);

    // Elementos do formulário de adição de pacientes
    const nomePacienteInput = document.getElementById('nome-paciente');
    const dataNascimentoInput = document.getElementById('data-nascimento-paciente');
    const idInternacaoInput = document.getElementById('id-internacao-paciente');
    const localPacienteInput = document.getElementById('local-paciente');
    const pacientesSugeridosContainer = document.getElementById('pacientes-sugeridos');
    const msgPacienteExistente = document.getElementById('msg-paciente-existente');
    const btnAdicionarPaciente = document.getElementById('btn-adicionar-paciente');

    // Variáveis para controlar busca e seleção de pacientes
    let pacienteSelecionado = null; // Guarda o paciente selecionado da lista de sugestões

    // Elementos da seção de consulta
    const consultaTermoInput = document.getElementById('consulta-termo');
    const btnBuscarPaciente = document.getElementById('btn-buscar-paciente');
    const resultadoConsulta = document.getElementById('resultado-consulta');

    // --- LÓGICA DE AUTENTICAÇÃO --- 
    console.log("Configurando eventos de autenticação");
    
    // *** IMPORTANTE: Configurando o listener de envio do formulário de login ***
    if (formLogin) {
        console.log("Adicionando evento submit ao formulário de login");
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
            console.log("Formulário de login enviado");
        loginErrorMessage.textContent = '';
        authMessage.textContent = '';
        const email = loginEmailInput.value;
        const password = loginSenhaInput.value;
            
            console.log("Tentando login com:", email, password ? "******" : "senha vazia");
            
            if (!auth) {
                console.error("Firebase Auth não está inicializado!");
                loginErrorMessage.textContent = 'Erro de inicialização do Firebase. Tente recarregar a página.';
                return;
            }
            
        auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    console.log("Login bem-sucedido:", userCredential.user.email);
                })
            .catch(error => {
                    console.error("Erro no login:", error.code, error.message);
                loginErrorMessage.textContent = 'Email ou senha inválidos.';
            });
    });
        
        console.log("Evento de formulário de login configurado com sucesso");
    } else {
        console.error("Formulário de login não encontrado no DOM!");
    }

    // Configurar listener de autenticação
    if (auth) {
        console.log("Configurando listener de autenticação");
        
        auth.onAuthStateChanged(async (user) => {
            console.log("Estado de autenticação alterado:", user ? "Usuário logado" : "Usuário deslogado");
            
            if (user) {
                currentUser = user;
                
                // Verificar se é administrador
                isAdmin = user.email === ADMIN_EMAIL;
                
                // Log para diagnóstico
                console.log("Email do usuário:", user.email);
                console.log("Email do administrador configurado:", ADMIN_EMAIL);
                console.log("É administrador?", isAdmin);
                
                try {
                    // Verificar se o usuário já existe no Firestore
                    const userDoc = await db.collection('usuarios').doc(user.uid).get();
                    
                    if (!userDoc.exists) {
                        // Primeiro login - registrar usuário
                        await registrarNovoUsuario(user);
                    }
                    
                    // Verificar se o usuário está aprovado (administradores são aprovados automaticamente)
                    if (isAdmin) {
                        // Administrador tem acesso completo
                        mostrarInterface(true);
                        await carregarDadosAdmin();
                    } else {
                        // Verificar aprovação para usuários normais
                        const aprovado = await verificarAprovacaoUsuario(user.uid);
                        
                        if (aprovado) {
                            // Buscar equipes do médico
                            await carregarEquipesUsuario(user.uid);
                            mostrarInterface(false);
                            // Carregar pacientes após mostrar a interface
                            await carregarPacientes();
                        } else {
                            // Usuário não aprovado - mostrar mensagem
                            areaLogin.style.display = 'none';
                            appContainer.style.display = 'block';
                            
                            // Substituir o conteúdo principal por uma mensagem de espera
                            const main = document.querySelector('main');
                            main.innerHTML = `
                                <section class="aguardando-aprovacao">
                                    <div class="mensagem-aprovacao">
                                        <i class="fas fa-user-clock"></i>
                                        <h2>Conta em Análise</h2>
                                        <p>Seu cadastro está pendente de aprovação pelo administrador do sistema.</p>
                                        <p>Por favor, entre em contato com o administrador para solicitar a aprovação da sua conta.</p>
                                        <button id="btn-logout-aprovacao" class="btn-primary">Sair</button>
                                    </div>
                                </section>
                            `;
                            
                            // Adicionar evento para o botão de logout na tela de aprovação
                            document.getElementById('btn-logout-aprovacao').addEventListener('click', () => {
                                auth.signOut();
                            });
                            
                            return; // Não continuar com o carregamento normal
                        }
                    }
                } catch (error) {
                    console.error("Erro ao verificar usuário:", error);
                    alert("Erro ao verificar usuário. Por favor, tente novamente.");
                    auth.signOut();
                }
            } else {
                currentUser = null;
                isAdmin = false;
                areaLogin.style.display = 'block';
                appContainer.style.display = 'none';
                pacientesLocal = []; // Limpa dados locais ao deslogar
                todosPacientes = []; // Limpa todos os dados ao deslogar
                equipesUsuario = []; // Limpa equipes do usuário ao deslogar
                
                // Limpar a lista de pacientes apenas se ela já tiver sido inicializada
                if (typeof renderizarPacientes === 'function') {
                    renderizarPacientes();
                }
                
                // Remover botão de admin do menu se existir
                const adminBtn = document.getElementById('btn-admin');
                if (adminBtn) {
                    adminBtn.parentElement.remove();
                }
                
                // Remover badge de admin se existir
                const adminBadge = document.querySelector('.admin-badge');
                if (adminBadge) {
                    adminBadge.remove();
                }
                
                // Remover seletor de equipes se existir
                const seletorEquipes = document.querySelector('.seletor-equipes');
                if (seletorEquipes) {
                    seletorEquipes.remove();
                }
            }
        });
    } else {
        console.error("Firebase Auth não está inicializado, não é possível configurar onAuthStateChanged!");
    }

    btnCriarConta.addEventListener('click', () => {
        loginErrorMessage.textContent = '';
        authMessage.textContent = '';
        const email = loginEmailInput.value;
        const password = loginSenhaInput.value;

        if (!email || !password) {
            authMessage.textContent = 'Por favor, preencha email e senha para criar uma conta.';
            return;
        }
        if (password.length < 6) {
            authMessage.textContent = 'A senha deve ter pelo menos 6 caracteres.';
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                authMessage.textContent = `Conta criada para ${userCredential.user.email}! Você já está logado.`;
                // O onAuthStateChanged cuidará de mostrar a app e limpar os campos se necessário.
            })
            .catch(error => {
                console.error("Erro ao criar conta:", error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    authMessage.textContent = 'Este email já está em uso.';
                } else if (error.code === 'auth/invalid-email') {
                    authMessage.textContent = 'O formato do email é inválido.';
                } else if (error.code === 'auth/weak-password') {
                    authMessage.textContent = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                } else if (error.code === 'auth/operation-not-allowed') {
                    authMessage.textContent = 'Criação de conta por email/senha não está habilitada no Firebase.';
                } else {
                    authMessage.textContent = 'Erro ao criar conta. Verifique o console para detalhes.';
                }
            });
    });

    btnLogout.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                console.log("Logout realizado com sucesso");
            })
            .catch(error => {
                console.error("Erro ao fazer logout:", error);
            });
    });
    
    // Função para registrar novo usuário no Firestore
    const registrarNovoUsuario = async (user) => {
        try {
            console.log("Registrando novo usuário no Firestore:", user.email);
            await db.collection('usuarios').doc(user.uid).set({
                email: user.email,
                dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pendente',
                aprovado: user.email === ADMIN_EMAIL ? true : false // Administrador é aprovado automaticamente
            });
            console.log("Usuário registrado com sucesso");
            return true;
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            return false;
        }
    };
    
    // Função para verificar se o usuário está aprovado
    const verificarAprovacaoUsuario = async (userId) => {
        try {
            const userDoc = await db.collection('usuarios').doc(userId).get();
            if (!userDoc.exists) return false;
            
            const userData = userDoc.data();
            
            // Verificar se o usuário tem campo aprovado === true OU status === 'aprovado'
            return userData.aprovado === true || userData.status === 'aprovado';
        } catch (error) {
            console.error("Erro ao verificar aprovação do usuário:", error);
            return false;
        }
    };
    
    // Função para mostrar a interface do app
    const mostrarInterface = (isAdminUser) => {
        areaLogin.style.display = 'none';
        appContainer.style.display = 'block';
        
        // Se for administrador, adicionar botão de administração
        if (isAdminUser) {
            const menuList = document.querySelector('#menu-principal ul');
            
            // Adicionar botão apenas se ainda não existir
            if (!document.getElementById('btn-admin')) {
                menuList.insertBefore(adminMenuItem, btnLogout.parentElement);
                
                // Adicionar badge de admin ao nome do app
                const appTitle = document.querySelector('header h1');
                if (appTitle && !document.querySelector('.admin-badge')) {
                    appTitle.innerHTML = `AppVisita <span class="admin-badge">ADMIN</span>`;
                }
                
                // Adicionar evento ao botão de admin
                btnAdmin.addEventListener('click', () => {
                    // Esconder todas as seções
                    [dashboardSection, adicionarPacienteSection, consultarPacienteSection, adminSection].forEach(section => {
                        section.classList.remove('active-section');
                    });
                    
                    // Remover classe ativa de todos os botões do menu
                    document.querySelectorAll('.menu-btn').forEach(btn => {
                        btn.classList.remove('menu-btn-active');
                    });
                    
                    // Mostrar seção de admin e ativar botão
                    adminSection.classList.add('active-section');
                    btnAdmin.classList.add('menu-btn-active');
                    
                    // Fechar o menu lateral em dispositivos móveis
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                });
            }
        } else {
            // Se for médico e pertencer a equipes, adicionar seletor ao formulário
            if (equipesUsuario.length > 0) {
                setTimeout(() => {
                    adicionarSeletorEquipeAoFormulario();
                }, 500);
            }
        }
        
        // Carregar dados iniciais
        carregarPacientes();
    };
    
    // Função para carregar equipes do usuário
    const carregarEquipesUsuario = async (userId) => {
        try {
            console.log("Carregando equipes do usuário:", userId);
            
            // Buscar equipes onde o usuário é membro
            const equipesSnapshot = await db.collection('equipes')
                .where('membros', 'array-contains', userId)
                .get();
                
            equipesUsuario = equipesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`${equipesUsuario.length} equipes encontradas para o usuário`);
            
            // Preencher o seletor de equipes no formulário de adicionar paciente
            preencherSeletorEquipe();
            
            // Se o usuário pertencer a alguma equipe, adicionar seletor no dashboard
            if (equipesUsuario.length > 0) {
                adicionarSeletorEquipesAoDashboard();
            }
            
            return equipesUsuario;
        } catch (error) {
            console.error("Erro ao carregar equipes do usuário:", error);
            return [];
        }
    };

    // Função para preencher o seletor de equipes no formulário
    const preencherSeletorEquipe = () => {
        const seletorEquipe = document.getElementById('equipe-paciente');
        if (!seletorEquipe) {
            console.error("Seletor de equipe não encontrado no formulário");
            return;
        }
        
        console.log("Preenchendo seletor de equipe com", equipesUsuario.length, "equipes");
        
        // Limpar opções existentes, mantendo apenas a opção padrão
        seletorEquipe.innerHTML = '<option value="">Selecione uma equipe</option>';
        
        // Adicionar opções para cada equipe
        equipesUsuario.forEach(equipe => {
            const option = document.createElement('option');
            option.value = equipe.id;
            option.textContent = equipe.nome;
            seletorEquipe.appendChild(option);
        });
        
        // Se o médico pertencer a apenas uma equipe, pré-selecionar essa equipe
        if (equipesUsuario.length === 1) {
            console.log("Médico pertence a apenas uma equipe. Pré-selecionando:", equipesUsuario[0].nome);
            seletorEquipe.value = equipesUsuario[0].id;
        }
        
        // Mostrar ou ocultar o container do seletor
        const equipeContainer = document.getElementById('equipe-container');
        if (equipeContainer) {
            equipeContainer.style.display = equipesUsuario.length > 0 ? 'block' : 'none';
        }
    };
    
    // Função para adicionar seletor de equipes ao dashboard
    const adicionarSeletorEquipesAoDashboard = () => {
        // Verificar se o seletor já existe
        if (document.querySelector('.seletor-equipes')) return;
        
        // Criar elemento de seleção
        const seletorEquipes = document.createElement('div');
        seletorEquipes.className = 'seletor-equipes';
        
        let optionsHtml = '<option value="">Todas as equipes</option>';
        equipesUsuario.forEach(equipe => {
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
        dashboardSection.insertBefore(seletorEquipes, listaPacientesPendentes);
        
        // Adicionar evento de mudança no seletor
        const filtroEquipe = document.getElementById('filtro-equipe');
        filtroEquipe.addEventListener('change', () => {
            const equipeId = filtroEquipe.value;
            
            console.log("Filtro de equipe alterado para:", equipeId);
            console.log("Pacientes disponíveis:", todosPacientes.length);
            
            // Filtrar pacientes pela equipe selecionada
            if (equipeId) {
                console.log("Filtrando pacientes da equipe:", equipeId);
                const pacientesFiltrados = todosPacientes.filter(p => {
                    // Incluir todos os status, mas a filtragem será feita na renderização
                    const resultado = p.equipeId === equipeId;
                    
                    // Debug para entender se os pacientes têm o equipeId correto
                    console.log(`Paciente ${p.nome} (${p.id}): status=${p.status}, equipeId=${p.equipeId}, match=${resultado}`);
                    
                    return resultado;
                });
                
                console.log(`${pacientesFiltrados.length} pacientes encontrados para a equipe ${equipeId}`);
                renderizarPacientes(pacientesFiltrados);
            } else {
                // Mostrar todos os pacientes (filtragem será feita na renderização)
                console.log("Mostrando todos os pacientes");
                renderizarPacientes();
            }
        });
    };
    
    // Função para carregar pacientes do Firestore
    const carregarPacientes = async () => {
        try {
            console.log("Iniciando carregamento de pacientes");
            console.log("Estado atual:", {
                isAdmin,
                equipesUsuario: equipesUsuario.length,
                currentUser: currentUser?.email
            });
            
            let pacientesQuery;
            
            if (isAdmin) {
                console.log("Carregando todos os pacientes (admin)");
                pacientesQuery = db.collection('pacientes');
            } else if (equipesUsuario.length > 0) {
                // Médico com equipe - ver pacientes da equipe
                console.log("Carregando pacientes das equipes:", equipesUsuario.map(e => e.id));
                
                // Buscar pacientes que pertencem às equipes do médico
                const equipesIds = equipesUsuario.map(e => e.id);
                
                // Buscar pacientes das equipes do médico
                const pacientesEquipe = await db.collection('pacientes')
                    .where('equipeId', 'in', equipesIds)
                                     .get();
                
                // Buscar pacientes adicionados pelo próprio médico
                const pacientesMedico = await db.collection('pacientes')
                    .where('medicoId', '==', auth.currentUser.uid)
                    .get();
                
                // Combinar os resultados
                const pacientesMap = new Map();
                
                // Adicionar pacientes da equipe
                pacientesEquipe.docs.forEach(doc => {
                    pacientesMap.set(doc.id, { id: doc.id, ...doc.data() });
                });
                
                // Adicionar pacientes do médico
                pacientesMedico.docs.forEach(doc => {
                    pacientesMap.set(doc.id, { id: doc.id, ...doc.data() });
                });
                
                // Converter para array
                todosPacientes = Array.from(pacientesMap.values());
                
                console.log(`${todosPacientes.length} pacientes carregados (equipe + médico)`);
                
                // Agora carregamos todos os pacientes, a filtragem será feita na renderização
                pacientesLocal = todosPacientes; // Remover filtro de apenas internados
                console.log(`${pacientesLocal.length} pacientes totais`);
                
                // Ordenar por data de adição (mais recentes primeiro)
                pacientesLocal.sort((a, b) => {
                    if (a.dataAdicao && b.dataAdicao) {
                        return b.dataAdicao.seconds - a.dataAdicao.seconds;
                    }
                    return 0;
                });
                
                // Renderizar na interface
            renderizarPacientes();
                return;
            } else {
                // Médico sem equipe - ver apenas seus próprios pacientes
                console.log("Médico sem equipe - carregando pacientes adicionados pelo médico");
                pacientesQuery = db.collection('pacientes')
                    .where('medicoId', '==', auth.currentUser.uid);
            }
            
            const snapshot = await pacientesQuery.get();
            
            todosPacientes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`${todosPacientes.length} pacientes carregados`);
            
            // Agora carregamos todos os pacientes, a filtragem será feita na renderização
            pacientesLocal = todosPacientes; // Remover filtro de apenas internados
            console.log(`${pacientesLocal.length} pacientes totais`);
            
            // Ordenar por data de adição (mais recentes primeiro)
            pacientesLocal.sort((a, b) => {
                if (a.dataAdicao && b.dataAdicao) {
                    return b.dataAdicao.seconds - a.dataAdicao.seconds;
                }
                return 0;
            });
            
            // Renderizar na interface
            renderizarPacientes();
            
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
            alert("Erro ao carregar pacientes. Por favor, tente novamente.");
        }
    };
    
    // Função para renderizar pacientes na interface
    const renderizarPacientes = (pacientes = null) => {
        // Se não receber lista de pacientes, usar a lista local filtrada
        const pacientesParaRenderizar = pacientes || pacientesLocal;
        
        // Verificar se a nova implementação de seções está disponível
        const listaPacientesPendentes = document.getElementById('lista-pacientes-pendentes');
        const listaPacientesVisitados = document.getElementById('lista-pacientes-visitados');
        const contadorPendentes = document.getElementById('contador-pendentes');
        const contadorVisitados = document.getElementById('contador-visitados');
        
        // Se os novos elementos existem, usar a nova implementação
        if (listaPacientesVisitados && contadorPendentes && contadorVisitados) {
            console.log("Usando nova implementação de seções para renderizar pacientes");
            
            // Usar a função global do app-pacientes.js se estiver disponível
            if (typeof window.AppModulos?.Pacientes?.renderizarPacientesSecionados === 'function') {
                console.log("Usando função do módulo app-pacientes.js");
                
                // Separar pacientes entre pendentes e visitados
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                
                const pacientesPendentes = [];
                const pacientesVisitados = [];
                
                pacientesParaRenderizar.forEach(paciente => {
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
                
                // Ordenar conforme critério selecionado
                const criterioOrdenacao = ordenarPor.value;
                const pacientesPendentesOrdenados = ordenarListaPacientes(pacientesPendentes, criterioOrdenacao);
                const pacientesVisitadosOrdenados = ordenarListaPacientes(pacientesVisitados, criterioOrdenacao);
                
                // Renderizar usando a nova implementação
                renderizarPacientesSecionados(pacientesPendentesOrdenados, pacientesVisitadosOrdenados);
                return;
            }
        }
        
        // Fallback para implementação antiga se os novos elementos não existirem
        console.log("Usando implementação antiga (fallback)");
        const lista = listaPacientesPendentes;
        
        if (!lista) {
            console.error("Lista de pacientes não encontrada");
            return;
        }
        
        // Limpar lista
        lista.innerHTML = '';
        
        if (pacientesParaRenderizar.length === 0) {
            lista.innerHTML = '<li class="sem-pacientes">Nenhum paciente internado no momento.</li>';
            return;
        }
        
        // Aplicar ordenação conforme selecionado
        const criterioOrdenacao = ordenarPor.value;
        
        if (criterioOrdenacao === 'nome') {
            pacientesParaRenderizar.sort((a, b) => a.nome.localeCompare(b.nome));
        } else {
            // Ordenar por data de adição (padrão)
            pacientesParaRenderizar.sort((a, b) => {
                if (a.dataAdicao && b.dataAdicao) {
                    return b.dataAdicao.seconds - a.dataAdicao.seconds;
                }
                return 0;
            });
        }
        
        // Criar item para cada paciente (implementação antiga)
        pacientesParaRenderizar.forEach(paciente => {
            const dataAdicionado = paciente.dataAdicao 
                ? new Date(paciente.dataAdicao.seconds * 1000).toLocaleDateString('pt-BR')
                : 'Data desconhecida';
                
            const li = document.createElement('li');
            li.className = `paciente-item ${paciente.status}`;
            
            // Verificar se tem evolução recente (última 24h)
            let temEvolucaoRecente = false;
            if (paciente.evolucoes && paciente.evolucoes.length > 0) {
                const ultimaEvolucao = paciente.evolucoes[paciente.evolucoes.length - 1];
                if (ultimaEvolucao.data) {
                    const dataEvolucao = ultimaEvolucao.data.seconds 
                        ? new Date(ultimaEvolucao.data.seconds * 1000) 
                        : new Date(ultimaEvolucao.data);
                    const agora = new Date();
                    const diff = agora - dataEvolucao;
                    const diffHoras = diff / (1000 * 60 * 60);
                    
                    temEvolucaoRecente = diffHoras < 24;
                }
            }
            
            // Obter informações da equipe, se disponível
            let equipeNome = '';
            if (paciente.equipeId) {
                const equipe = equipesUsuario.find(e => e.id === paciente.equipeId);
                equipeNome = equipe ? equipe.nome : '';
            }

            // Status do paciente para tags
            const statusTags = {
                'internado': 'Internado',
                'alta': 'Alta',
                'obito': 'Óbito'
            };
            
            li.innerHTML = `
                <div class="paciente-borda-lateral"></div>
                <div class="paciente-icone">
                    <i class="fas fa-user-alt"></i>
                </div>
                <div class="paciente-info">
                    <div class="paciente-header">
                        <span class="paciente-nome">${paciente.nome}</span>
                        <span class="paciente-id">ID: ${paciente.idInternacao}</span>
                    </div>
                    <div class="paciente-detalhes">
                        <div class="paciente-detalhe">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${paciente.local || 'Local não informado'}</span>
                        </div>
                        <div class="paciente-detalhe">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Adicionado em: ${dataAdicionado}</span>
                        </div>
                    </div>
                    <div class="paciente-tags">
                        <span class="paciente-tag tag-${paciente.status}">${statusTags[paciente.status] || 'Status desconhecido'}</span>
                        ${equipeNome ? `<span class="paciente-tag tag-equipe">${equipeNome}</span>` : ''}
                    </div>
                </div>
                <div class="paciente-acoes">
                    <button class="btn-evolucao ${temEvolucaoRecente ? 'evolucao-recente' : ''}" data-id="${paciente.id}">
                        ${temEvolucaoRecente ? '<i class="fas fa-check-circle"></i> Evoluído' : '<i class="fas fa-stethoscope"></i> Evoluir'}
                    </button>
                </div>
            `;
            
            lista.appendChild(li);
        });
        
        // Adicionar eventos para os botões de evolução
        document.querySelectorAll('.btn-evolucao').forEach(btn => {
            btn.addEventListener('click', () => {
                const pacienteId = btn.dataset.id;
                const paciente = todosPacientes.find(p => p.id === pacienteId);
                
                if (paciente) {
                    console.log("Clique no botão de evolução para paciente:", paciente);
                    abrirModalEvolucao(paciente);
                }
            });
        });
    };

    // Função auxiliar para verificar se paciente foi visitado hoje
    function verificarSeVisitadoHoje(paciente, hoje) {
        if (!paciente.evolucoes || paciente.evolucoes.length === 0) {
            return false;
        }
        
        // Verificar se há alguma evolução de hoje
        return paciente.evolucoes.some(evolucao => {
            if (!evolucao.dataRegistro && !evolucao.data) return false;
            
            let dataEvolucao;
            
            // Compatibilidade: verificar tanto dataRegistro quanto data
            const dataRef = evolucao.dataRegistro || evolucao.data;
            
            // Lidar com diferentes formatos de data
            if (dataRef && dataRef.seconds) {
                // Timestamp do Firestore
                dataEvolucao = new Date(dataRef.seconds * 1000);
            } else if (dataRef instanceof Date) {
                // Objeto Date
                dataEvolucao = dataRef;
            } else if (typeof dataRef === 'string') {
                // String de data
                dataEvolucao = new Date(dataRef);
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
                    // Compatibilidade: verificar tanto dataRegistro quanto dataAdicao
                    const dataA = (a.dataRegistro || a.dataAdicao) ? ((a.dataRegistro || a.dataAdicao).seconds || 0) : 0;
                    const dataB = (b.dataRegistro || b.dataAdicao) ? ((b.dataRegistro || b.dataAdicao).seconds || 0) : 0;
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
        
        // Formatar data de registro - compatibilidade com dataAdicao e dataRegistro
        const dataRegistro = AppVisita?.Utils?.formatarData ? 
            AppVisita.Utils.formatarData(paciente.dataRegistro || paciente.dataAdicao) :
            (paciente.dataRegistro || paciente.dataAdicao) ? 
                new Date((paciente.dataRegistro || paciente.dataAdicao).seconds * 1000).toLocaleDateString('pt-BR') :
                'Data desconhecida';
        
        // Formatar data de nascimento
        let dataNascimento = 'Não informada';
        if (paciente.dataNascimento) {
            try {
                // Verificar se é um objeto Timestamp do Firestore
                if (paciente.dataNascimento && typeof paciente.dataNascimento === 'object' && 'seconds' in paciente.dataNascimento) {
                    dataNascimento = new Date(paciente.dataNascimento.seconds * 1000).toLocaleDateString('pt-BR');
                }
                // Verificar se dataNascimento é uma string
                else if (typeof paciente.dataNascimento === 'string') {
                    const partes = paciente.dataNascimento.split('-');
                    if (partes.length === 3) {
                        const data = new Date(partes[0], partes[1] - 1, partes[2]);
                        dataNascimento = data.toLocaleDateString('pt-BR');
                    } else {
                        dataNascimento = paciente.dataNascimento;
                    }
                } 
                else if (paciente.dataNascimento instanceof Date) {
                    dataNascimento = paciente.dataNascimento.toLocaleDateString('pt-BR');
                }
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
                const horaVisita = ultimaEvolucao.dataRegistro || ultimaEvolucao.data ? 
                    new Date((ultimaEvolucao.dataRegistro || ultimaEvolucao.data).seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) :
                    'Hora desconhecida';
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
                <h3 class="paciente-nome">${paciente.nome}</h3>
                <span class="paciente-id">ID: ${paciente.idInternacao}</span>
            </div>
            <div class="paciente-info">
                <div class="info-item"><i class="fas fa-hospital"></i> Local: ${paciente.localLeito || paciente.local || 'Não informado'}</div>
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
                // Tentar usar a função do app-pacientes.js primeiro
                if (typeof window.abrirModalEvolucao === 'function') {
                    window.abrirModalEvolucao(this.dataset.id, this.dataset.nome);
                } else {
                    // Fallback para função local
                    const paciente = todosPacientes.find(p => p.id === this.dataset.id);
                    if (paciente) {
                        abrirModalEvolucao(paciente);
                    }
                }
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
            if (!evolucao.dataRegistro && !evolucao.data) return false;
            
            let dataEvolucao;
            const dataRef = evolucao.dataRegistro || evolucao.data;
            
            if (dataRef && dataRef.seconds) {
                dataEvolucao = new Date(dataRef.seconds * 1000);
            } else if (dataRef instanceof Date) {
                dataEvolucao = dataRef;
            } else if (typeof dataRef === 'string') {
                dataEvolucao = new Date(dataRef);
            } else {
                return false;
            }
            
            dataEvolucao.setHours(0, 0, 0, 0);
            return dataEvolucao.getTime() === hoje.getTime();
        });
        
        if (evolucoesHoje.length === 0) return null;
        
        // Retornar a evolução mais recente do dia
        return evolucoesHoje.sort((a, b) => {
            const dataA = (a.dataRegistro || a.data).seconds || (a.dataRegistro || a.data).getTime?.() || 0;
            const dataB = (b.dataRegistro || b.data).seconds || (b.dataRegistro || b.data).getTime?.() || 0;
            return dataB - dataA;
        })[0];
    }

    // Função para abrir o modal de evolução de paciente
    const abrirModalEvolucao = (paciente) => {
        console.log("Abrindo modal de evolução para paciente:", paciente);
        
        // Preencher informações do paciente no modal
        modalTituloPaciente.textContent = `Evolução para ${paciente.nome}`;
        pacienteIdEvolucaoInput.value = paciente.id;
        
        // Limpar campos
        textoEvolucaoInput.value = '';
        document.getElementById('status-internado').checked = true;
        
        // Carregar histórico de evoluções
        carregarHistoricoEvolucoes(paciente);
        
        // Mostrar o modal
        modalEvolucao.style.display = 'block';
        textoEvolucaoInput.focus();
    };
    
    // Função para carregar histórico de evoluções
    const carregarHistoricoEvolucoes = (paciente) => {
        historicoEvolucoesModalDiv.innerHTML = '';
        
        if (!paciente.evolucoes || paciente.evolucoes.length === 0) {
            historicoEvolucoesModalDiv.innerHTML = '<p class="sem-evolucoes">Nenhuma evolução registrada ainda.</p>';
            return;
        }
        
        // Ordenar evoluções da mais recente para a mais antiga
        const evolucoes = [...paciente.evolucoes].sort((a, b) => {
            if (a.data && b.data) {
                return b.data.seconds - a.data.seconds;
            }
            return 0;
        });
        
        evolucoes.forEach(evolucao => {
            const dataFormatada = evolucao.data 
                ? new Date(evolucao.data.seconds * 1000).toLocaleString('pt-BR')
                : 'Data desconhecida';
                
            const statusTexto = {
                'internado': 'Continua Internado',
                'alta': 'Alta Hospitalar',
                'obito': 'Óbito'
            };
            
            const evolucaoItem = document.createElement('div');
            evolucaoItem.className = 'evolucao-item';
            
            evolucaoItem.innerHTML = `
                <div class="evolucao-header">
                    <span class="evolucao-data">${dataFormatada}</span>
                    <span class="evolucao-status status-${evolucao.status}">${statusTexto[evolucao.status] || evolucao.status}</span>
                </div>
                <div class="evolucao-texto">${evolucao.texto}</div>
                <div class="evolucao-autor">Por: ${evolucao.medicoEmail || 'Médico não identificado'}</div>
            `;
            
            historicoEvolucoesModalDiv.appendChild(evolucaoItem);
        });
    };
    
    // Evento para fechar o modal de evolução
    closeButtonEvolucao.addEventListener('click', () => {
        console.log("Fechando modal de evolução");
        modalEvolucao.style.display = 'none';
    });
    
    // Evento para salvar evolução
    formEvolucao.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Formulário de evolução submetido");
        
        const pacienteId = pacienteIdEvolucaoInput.value;
        const textoEvolucao = textoEvolucaoInput.value.trim();
        const statusPaciente = document.querySelector('input[name="status-paciente"]:checked').value;
        
        console.log("Dados da evolução:", {
            pacienteId,
            textoEvolucao,
            statusPaciente,
            medicoId: auth.currentUser?.uid,
            medicoEmail: auth.currentUser?.email
        });
        
        if (!textoEvolucao) {
            alert('Por favor, preencha o texto da evolução.');
            return;
        }

        if (!auth.currentUser) {
            console.error("Usuário não está autenticado");
            alert('Erro: Usuário não está autenticado. Por favor, faça login novamente.');
            return;
        }
        
        try {
            // Buscar documento do paciente
            const pacienteRef = db.collection('pacientes').doc(pacienteId);
            const pacienteDoc = await pacienteRef.get();
            
            if (!pacienteDoc.exists) {
                console.error("Paciente não encontrado:", pacienteId);
                alert('Paciente não encontrado!');
                modalEvolucao.style.display = 'none';
                return;
            }

            // Verificar se o usuário tem permissão para evoluir este paciente
            const pacienteData = pacienteDoc.data();
            if (!isAdmin && pacienteData.medicoId !== auth.currentUser.uid) {
                console.error("Usuário não tem permissão para evoluir este paciente");
                alert('Você não tem permissão para evoluir este paciente.');
                return;
            }

            // Obter timestamp atual
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            const dataAtual = new Date();

            // Preparar dados da evolução
            const evolucaoData = {
                texto: textoEvolucao,
                status: statusPaciente,
                data: dataAtual,
                medicoId: auth.currentUser.uid,
                medicoEmail: auth.currentUser.email
            };
            
            console.log("Tentando salvar nova evolução:", evolucaoData);

            // Primeiro, obter o array atual de evoluções
            const evolucoesAtuais = pacienteData.evolucoes || [];
            
            // Adicionar a nova evolução ao array
            evolucoesAtuais.push(evolucaoData);
            
            // Atualizar o documento com o novo array de evoluções
            await pacienteRef.update({
                evolucoes: evolucoesAtuais,
                status: statusPaciente,
                ultimaAtualizacao: timestamp
            });
            
            console.log("Evolução salva com sucesso");
            
            // Fechar modal e recarregar dados
            modalEvolucao.style.display = 'none';
            await carregarPacientes();
            
            alert('Evolução registrada com sucesso!');
        } catch (error) {
            // Log detalhado do erro
            console.error("Erro ao salvar evolução:", {
                nome: error.name,
                mensagem: error.message,
                codigo: error.code,
                stack: error.stack,
                detalhes: error.details || 'Sem detalhes adicionais'
            });
            
            let mensagemErro = 'Erro ao salvar evolução. ';
            
            if (error.code === 'permission-denied') {
                mensagemErro += 'Você não tem permissão para salvar evoluções.';
            } else if (error.code === 'not-found') {
                mensagemErro += 'Paciente não encontrado.';
            } else if (error.code === 'unauthenticated') {
                mensagemErro += 'Sua sessão expirou. Por favor, faça login novamente.';
            } else if (error.code === 'invalid-argument') {
                mensagemErro += 'Dados inválidos. Por favor, tente novamente.';
        } else {
                mensagemErro += `Erro: ${error.message || 'Erro desconhecido'}`;
            }
            
            alert(mensagemErro);
        }
    });
    
    // Funções exclusivas de administrador
    const carregarDadosAdmin = async () => {
        if (!isAdmin) return;
        
        try {
            // Carregar usuários
            const usersSnapshot = await db.collection('usuarios').get();
            const usuarios = usersSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            const totalUsuarios = usuarios.length;
            const usuariosPendentes = usuarios.filter(u => u.status === 'pendente' || !u.aprovado).length;
            
            document.querySelector('#total-usuarios .stat-value').textContent = totalUsuarios;
            document.querySelector('#usuarios-pendentes .stat-value').textContent = usuariosPendentes;
            
            // Configurar filtros
            const filtroTodos = document.getElementById('filtro-todos');
            const filtroPendentes = document.getElementById('filtro-pendentes');
            const filtroAprovados = document.getElementById('filtro-aprovados');
            
            const ativarFiltro = (filtro) => {
                [filtroTodos, filtroPendentes, filtroAprovados].forEach(f => 
                    f.classList.remove('active'));
                filtro.classList.add('active');
            };
            
            filtroTodos.addEventListener('click', () => {
                ativarFiltro(filtroTodos);
                renderizarListaUsuarios(usuarios);
            });
            
            filtroPendentes.addEventListener('click', () => {
                ativarFiltro(filtroPendentes);
                renderizarListaUsuarios(usuarios.filter(u => u.status === 'pendente' || !u.aprovado));
            });
            
            filtroAprovados.addEventListener('click', () => {
                ativarFiltro(filtroAprovados);
                renderizarListaUsuarios(usuarios.filter(u => u.status === 'aprovado' || u.aprovado === true));
            });
            
            // Mostrar lista inicial de usuários
            renderizarListaUsuarios(usuarios);
            
            // Carregar estatísticas do sistema
            const pacientesSnapshot = await db.collection('pacientes').get();
            const totalPacientes = pacientesSnapshot.size;
            document.querySelector('#total-pacientes .stat-value').textContent = totalPacientes;
            
            // Calcular total de evoluções
            let totalEvolucoes = 0;
            pacientesSnapshot.forEach(doc => {
                const pacienteData = doc.data();
                if (pacienteData.evolucoes && Array.isArray(pacienteData.evolucoes)) {
                    totalEvolucoes += pacienteData.evolucoes.length;
                }
            });
            document.querySelector('#total-evolucoes .stat-value').textContent = totalEvolucoes;
            
            // Carregar equipes
            await carregarEquipes();
            
        } catch (error) {
            console.error("Erro ao carregar dados administrativos:", error);
            alert("Erro ao carregar dados administrativos. Consulte o console para detalhes.");
        }
    };
    
    // Renderizar lista de usuários no painel admin
    const renderizarListaUsuarios = (usuarios) => {
        const listaUsuarios = document.getElementById('lista-usuarios');
        listaUsuarios.innerHTML = '';
        
        if (usuarios.length === 0) {
            listaUsuarios.innerHTML = '<p class="sem-usuarios">Nenhum usuário encontrado com este filtro.</p>';
            return;
        }

        // Ordenar: primeiro os pendentes, depois por data de criação (mais novos primeiro)
        usuarios.sort((a, b) => {
            // Pendentes primeiro
            if ((a.status === 'pendente' || !a.aprovado) && (b.status === 'aprovado' || b.aprovado === true)) return -1;
            if ((a.status === 'aprovado' || a.aprovado === true) && (b.status === 'pendente' || !b.aprovado)) return 1;
            
            // Depois por data (mais recentes primeiro)
            if (a.dataCriacao && b.dataCriacao) {
                return b.dataCriacao.seconds - a.dataCriacao.seconds;
            }
            return 0;
        });
        
        usuarios.forEach(user => {
            const isPendente = user.status === 'pendente' || !user.aprovado;
            const userItem = document.createElement('div');
            userItem.classList.add('usuario-item');
            if (isPendente) userItem.classList.add('usuario-pendente');
            
            const dataFormatada = user.dataCriacao ? 
                new Date(user.dataCriacao.seconds * 1000).toLocaleDateString('pt-BR') : 
                'Data desconhecida';
            
            userItem.innerHTML = `
                <div class="usuario-info">
                    <div class="usuario-header">
                        <span class="usuario-email">${user.email || 'Email não disponível'}</span>
                        <span class="usuario-status ${isPendente ? 'status-pendente' : 'status-aprovado'}">
                            ${isPendente ? 'Pendente' : 'Aprovado'}
                        </span>
                    </div>
                    <span class="usuario-criado">Criado em: ${dataFormatada}</span>
                </div>
                ${isPendente ? `
                <div class="usuario-acoes">
                    <button class="btn-aprovar" data-id="${user.id}">
                        <i class="fas fa-check-circle"></i> Aprovar
                    </button>
                </div>` : ''}
            `;
            
            listaUsuarios.appendChild(userItem);
        });
        
        // Adicionar evento para aprovar usuários
        const botoesAprovar = listaUsuarios.querySelectorAll('.btn-aprovar');
        botoesAprovar.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = btn.dataset.id;
                try {
                    await db.collection('usuarios').doc(userId).update({
                        aprovado: true,
                        status: 'aprovado',
                        dataAprovacao: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Atualizar a interface
                    carregarDadosAdmin();
                    alert("Usuário aprovado com sucesso!");
                } catch (error) {
                    console.error("Erro ao aprovar usuário:", error);
                    alert("Erro ao aprovar usuário. Consulte o console para detalhes.");
                }
            });
        });
    };

    // ---- GERENCIAMENTO DE EQUIPES MÉDICAS ----
    
    // Variáveis para o gerenciamento de equipes
    let equipesUsuario = []; // Lista de equipes que o usuário pertence
    let todasEquipes = []; // Lista completa de equipes (admin)
    let medicosAprovados = []; // Lista de médicos aprovados no sistema
    let equipeSelecionada = null; // Equipe selecionada no modal
    
    // Modal e controles para gerenciamento de equipes
    const modalEquipe = document.getElementById('modal-equipe');
    const closeButtonEquipe = modalEquipe.querySelector('.close-button');
    const formEquipe = document.getElementById('form-equipe');
    const btnNovaEquipe = document.getElementById('btn-nova-equipe');
    const nomeEquipeInput = document.getElementById('nome-equipe');
    const descricaoEquipeInput = document.getElementById('descricao-equipe');
    const equipeIdInput = document.getElementById('equipe-id');
    const selecaoMedicos = document.getElementById('selecao-medicos');
    
    // Elementos para navegação entre abas do painel admin
    const tabUsuarios = document.getElementById('tab-usuarios');
    const tabEquipes = document.getElementById('tab-equipes');
    const tabEstatisticas = document.getElementById('tab-estatisticas');
    const tabContentUsuarios = document.getElementById('tab-content-usuarios');
    const tabContentEquipes = document.getElementById('tab-content-equipes');
    const tabContentEstatisticas = document.getElementById('tab-content-estatisticas');
    
    // Evento de clique nas abas do painel admin
    [tabUsuarios, tabEquipes, tabEstatisticas].forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as abas
            [tabUsuarios, tabEquipes, tabEstatisticas].forEach(t => t.classList.remove('active'));
            
            // Remover classe active de todos os conteúdos
            [tabContentUsuarios, tabContentEquipes, tabContentEstatisticas].forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active na aba clicada
            tab.classList.add('active');
            
            // Mostrar conteúdo correspondente
            if (tab === tabUsuarios) {
                tabContentUsuarios.classList.add('active');
            } else if (tab === tabEquipes) {
                tabContentEquipes.classList.add('active');
                carregarEquipes();
            } else if (tab === tabEstatisticas) {
                tabContentEstatisticas.classList.add('active');
            }
        });
    });
    
    // Função para carregar todas as equipes
    const carregarEquipes = async () => {
        if (!isAdmin) return;
        
        try {
            // Carregar todas as equipes
            const equipesSnapshot = await db.collection('equipes').orderBy('nome').get();
            todasEquipes = equipesSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            // Atualizar estatísticas
            document.querySelector('#total-equipes .stat-value').textContent = todasEquipes.length;
            
            // Renderizar lista de equipes
            renderizarListaEquipes();
            
        } catch (error) {
            console.error("Erro ao carregar equipes:", error);
            alert("Erro ao carregar equipes. Consulte o console para detalhes.");
        }
    };
    
    // Função para renderizar lista de equipes
    const renderizarListaEquipes = () => {
        const listaEquipes = document.getElementById('lista-equipes');
        listaEquipes.innerHTML = '';
        
        if (todasEquipes.length === 0) {
            listaEquipes.innerHTML = '<p class="sem-equipes">Nenhuma equipe médica cadastrada ainda.</p>';
            return;
        }
        
        todasEquipes.forEach(equipe => {
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
        
        // Adicionar eventos para os botões de editar e excluir
        const botoesEditar = listaEquipes.querySelectorAll('.btn-editar');
        botoesEditar.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const equipeId = btn.dataset.id;
                await abrirModalEditarEquipe(equipeId);
            });
        });
        
        const botoesExcluir = listaEquipes.querySelectorAll('.btn-excluir');
        botoesExcluir.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const equipeId = btn.dataset.id;
                const equipe = todasEquipes.find(eq => eq.id === equipeId);
                
                if (confirm(`Tem certeza que deseja excluir a equipe "${equipe.nome}"? Esta ação não pode ser desfeita.`)) {
                    try {
                        await db.collection('equipes').doc(equipeId).delete();
                        alert("Equipe excluída com sucesso!");
                        
                        // Recarregar lista de equipes
                        await carregarEquipes();
                    } catch (error) {
                        console.error("Erro ao excluir equipe:", error);
                        alert("Erro ao excluir equipe. Consulte o console para detalhes.");
                    }
                }
            });
        });
    };
    
    // Função para carregar médicos aprovados
    const carregarMedicosAprovados = async () => {
        try {
            console.log("Carregando médicos aprovados...");
            
            // Buscar todos os usuários
            const usuariosSnapshot = await db.collection('usuarios').get();
            
            // Filtrar apenas usuários aprovados
            const medicosAprovados = usuariosSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => 
                    (user.aprovado === true || user.status === 'aprovado') && 
                    user.email !== ADMIN_EMAIL // Excluir o administrador
                );
            
            console.log(`${medicosAprovados.length} médicos aprovados encontrados:`, medicosAprovados);
            
            return medicosAprovados;
        } catch (error) {
            console.error("Erro ao carregar médicos aprovados:", error);
            return [];
        }
    };

    // Função para abrir modal de edição de equipe
    const abrirModalEditarEquipe = async (equipeId) => {
        try {
            console.log("Abrindo modal para editar equipe:", equipeId);
            
            // Buscar dados da equipe
            const equipeDoc = await db.collection('equipes').doc(equipeId).get();
            
            if (!equipeDoc.exists) {
                alert('Equipe não encontrada!');
                return;
            }
            
            const equipeData = equipeDoc.data();
            
            // Preencher formulário
            nomeEquipeInput.value = equipeData.nome || '';
            descricaoEquipeInput.value = equipeData.descricao || '';
            equipeIdInput.value = equipeId;
            
            // Atualizar título do modal
            const modalTituloEquipe = document.getElementById('modal-titulo-equipe');
            if (modalTituloEquipe) {
                modalTituloEquipe.textContent = 'Editar Equipe';
            }
            
            // Carregar médicos e marcar os selecionados
            await carregarMedicosAprovadosNoModal(equipeData.membros || []);
            
            // Mostrar modal
            modalEquipe.style.display = 'block';
            
        } catch (error) {
            console.error("Erro ao abrir modal de edição:", error);
            alert('Erro ao carregar dados da equipe. Por favor, tente novamente.');
        }
    };

    // Função para carregar médicos aprovados no modal
    const carregarMedicosAprovadosNoModal = async (membrosSelecionados = []) => {
        try {
            selecaoMedicos.innerHTML = '<p class="carregando-info">Carregando médicos...</p>';
            
            // Buscar médicos aprovados
            const medicos = await carregarMedicosAprovados();
            
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
            selecaoMedicos.innerHTML = '<p class="erro-carregamento">Erro ao carregar médicos. Tente novamente.</p>';
        }
    };

    // Função para adicionar seletor de equipes ao formulário de adicionar paciente
    const adicionarSeletorEquipeAoFormulario = () => {
        console.log("Adicionando seletor de equipe ao formulário...");
        console.log("Equipes do usuário:", equipesUsuario);
        
        // Verificar se o usuário pertence a alguma equipe
        if (equipesUsuario.length === 0) {
            console.warn("Usuário não pertence a nenhuma equipe");
            alert('Você precisa pertencer a uma equipe médica para adicionar pacientes.');
            return false;
        }
        
        // Verificar se o seletor já existe
        if (document.getElementById('equipe-paciente')) {
            console.log("Seletor de equipe já existe no formulário");
            return true;
        }
        
        // Criar elemento de seleção
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        let optionsHtml = '<option value="">Selecione uma equipe</option>';
        equipesUsuario.forEach(equipe => {
            optionsHtml += `<option value="${equipe.id}">${equipe.nome}</option>`;
        });
        
        formGroup.innerHTML = `
            <label for="equipe-paciente">Equipe Médica: <span class="campo-obrigatorio">*</span></label>
            <select id="equipe-paciente" name="equipe-paciente" required>
                ${optionsHtml}
            </select>
            <small>Selecione a equipe médica responsável por este paciente.</small>
        `;
        
        // Adicionar antes do botão de adicionar
        const formActions = document.querySelector('#form-adicionar-paciente .form-actions');
        if (formActions) {
            formAdicionarPaciente.insertBefore(formGroup, formActions);
            console.log("Seletor de equipe adicionado com sucesso ao formulário");
            return true;
        } else {
            console.error("Elemento .form-actions não encontrado no formulário");
            return false;
        }
    };

    // Evento de submit do formulário de adicionar paciente
    formAdicionarPaciente.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Formulário de adicionar paciente submetido");

        const nomePaciente = nomePacienteInput.value.trim();
        const dataNascimento = dataNascimentoInput.value;
        const idInternacao = idInternacaoInput.value.trim();
        const localPaciente = localPacienteInput.value.trim();
        
        // Verificar se o elemento de seleção de equipe existe
        const equipePacienteElement = document.getElementById('equipe-paciente');
        const equipeId = equipePacienteElement ? equipePacienteElement.value : '';
        
        console.log("Elemento de seleção de equipe:", {
            existe: !!equipePacienteElement,
            valor: equipeId
        });

        console.log("Dados do paciente:", {
            nome: nomePaciente,
            dataNascimento,
            idInternacao,
            local: localPaciente,
            equipeId
        });

        if (!nomePaciente || !dataNascimento || !idInternacao || !localPaciente) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Se o elemento de seleção de equipe existir e estiver vazio, mostrar alerta
        if (equipePacienteElement && !equipeId) {
            alert('Por favor, selecione uma equipe médica.');
            return;
        }

        try {
            // Verificar se já existe um paciente com o mesmo ID de internação
            const pacientesComMesmoId = await db.collection('pacientes')
                .where('idInternacao', '==', idInternacao)
                .get();

            if (!pacientesComMesmoId.empty) {
                alert('Já existe um paciente com este ID de internação.');
                return;
            }

            // Criar novo paciente
            const novoPaciente = {
                nome: nomePaciente,
                dataNascimento: new Date(dataNascimento),
                idInternacao: idInternacao,
                local: localPaciente,
                status: 'internado',
                dataAdicao: firebase.firestore.FieldValue.serverTimestamp(),
                medicoId: auth.currentUser.uid,
                medicoEmail: auth.currentUser.email,
                evolucoes: []
            };
            
            // Adicionar equipe se o campo existir e tiver valor
            if (equipeId) {
                novoPaciente.equipeId = equipeId;
            }

            console.log("Tentando adicionar paciente:", novoPaciente);

            // Adicionar ao Firestore
            const docRef = await db.collection('pacientes').add(novoPaciente);
            console.log("Paciente adicionado com sucesso. ID:", docRef.id);

            // Limpar formulário
            formAdicionarPaciente.reset();
            pacientesSugeridosContainer.innerHTML = '';
            msgPacienteExistente.classList.add('hidden');

            // Recarregar lista de pacientes
            await carregarPacientes(); 

            // Mostrar mensagem de sucesso
            alert('Paciente adicionado com sucesso!');

        } catch (error) {
            console.error("Erro ao adicionar paciente:", error);
            alert('Erro ao adicionar paciente. Por favor, tente novamente.');
        }
    });

    // Configurar eventos do menu
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    // Configurar eventos dos botões do menu
    btnDashboard.addEventListener('click', () => {
        // Esconder todas as seções
        [dashboardSection, adicionarPacienteSection, consultarPacienteSection, adminSection].forEach(section => {
            section.classList.remove('active-section');
        });
        
        // Remover classe ativa de todos os botões do menu
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('menu-btn-active');
        });
        
        // Mostrar dashboard e ativar botão
        dashboardSection.classList.add('active-section');
        btnDashboard.classList.add('menu-btn-active');
        
        // Fechar o menu lateral em dispositivos móveis
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    btnAdicionarNovo.addEventListener('click', () => {
        // Esconder todas as seções
        [dashboardSection, adicionarPacienteSection, consultarPacienteSection, adminSection].forEach(section => {
            section.classList.remove('active-section');
        });
        
        // Remover classe ativa de todos os botões do menu
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('menu-btn-active');
        });
        
        // Mostrar seção de adicionar e ativar botão
        adicionarPacienteSection.classList.add('active-section');
        btnAdicionarNovo.classList.add('menu-btn-active');
        
        // Adicionar seletor de equipe se o médico pertencer a uma ou mais equipes
        if (!isAdmin && equipesUsuario.length > 0) {
            adicionarSeletorEquipeAoFormulario();
        }
        
        // Fechar o menu lateral em dispositivos móveis
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    btnConsultar.addEventListener('click', () => {
        // Esconder todas as seções
        [dashboardSection, adicionarPacienteSection, consultarPacienteSection, adminSection].forEach(section => {
            section.classList.remove('active-section');
        });
        
        // Remover classe ativa de todos os botões do menu
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('menu-btn-active');
        });
        
        // Mostrar seção de consulta e ativar botão
        consultarPacienteSection.classList.add('active-section');
        btnConsultar.classList.add('menu-btn-active');
        
        // Fechar o menu lateral em dispositivos móveis
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    // Eventos da seção de consulta
    btnBuscarPaciente.addEventListener('click', () => {
        realizarConsultaPaciente();
    });
    
    consultaTermoInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            realizarConsultaPaciente();
        }
    });
    
    // Função para realizar consulta de pacientes
    const realizarConsultaPaciente = async () => {
        const termo = consultaTermoInput.value.trim();
        
        if (!termo) {
            resultadoConsulta.innerHTML = `
                <div class="sem-resultados">
                    <p>Digite um nome ou ID de internação para realizar a consulta.</p>
                </div>`;
            return;
        }

        resultadoConsulta.innerHTML = `
            <div class="carregando-info">
                <p><i class="fas fa-spinner fa-spin"></i> Buscando pacientes...</p>
            </div>`;
            
        try {
            console.log(`Realizando consulta por termo: "${termo}"`);
            
            // Se ainda não carregamos os pacientes, precisamos carregar
            if (todosPacientes.length === 0) {
                await carregarPacientes();
            }
            
            // Converter termo para minúsculo para busca case-insensitive
            const termoBusca = termo.toLowerCase();
            
            // Se for administrador, buscar em todos os pacientes
            // Se for médico, buscar apenas nos pacientes das suas equipes
            let pacientesFiltrados;
            
            if (isAdmin) {
                // Admin pode buscar qualquer paciente
                console.log("Buscando em todos os pacientes (admin)");
                pacientesFiltrados = todosPacientes.filter(p =>
                    p.nome.toLowerCase().includes(termoBusca) ||
                    p.idInternacao.toLowerCase().includes(termoBusca)
                );
        } else {
                // Médico só pode buscar pacientes das suas equipes ou que ele adicionou
                console.log("Buscando apenas em pacientes das equipes do médico ou adicionados por ele");
                pacientesFiltrados = todosPacientes.filter(p => {
                    const matchNome = p.nome.toLowerCase().includes(termoBusca);
                    const matchId = p.idInternacao.toLowerCase().includes(termoBusca);
                    return (matchNome || matchId);
                });
            }
            
            console.log(`${pacientesFiltrados.length} pacientes encontrados`);
            
            if (pacientesFiltrados.length === 0) {
                resultadoConsulta.innerHTML = `
                    <div class="sem-resultados">
                        <i class="fas fa-search"></i>
                        <p>Nenhum paciente encontrado com o termo "${termo}".</p>
                    </div>`;
                return;
            }
            
            // Ordenar por nome
            pacientesFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
            
            // Renderizar resultados
            resultadoConsulta.innerHTML = `
                <div class="resultados-header">
                    <h3>Resultados da Busca</h3>
                    <span class="contador-resultados">${pacientesFiltrados.length} paciente(s) encontrado(s)</span>
                </div>
                <ul class="lista-resultados"></ul>`;
                
            const listaResultados = resultadoConsulta.querySelector('.lista-resultados');
            
            pacientesFiltrados.forEach(paciente => {
                const li = document.createElement('li');
                li.className = 'resultado-item';
                
                // Formatação de datas
                const dataAdicionado = paciente.dataAdicao ? 
                    new Date(paciente.dataAdicao.seconds * 1000).toLocaleDateString('pt-BR') : 
                    'Data desconhecida';
                    
                const dataNascimento = paciente.dataNascimento ?
                    (paciente.dataNascimento.seconds ? 
                        new Date(paciente.dataNascimento.seconds * 1000).toLocaleDateString('pt-BR') :
                        new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')
                    ) : 'Não informada';
                
                // Status do paciente
                const statusText = {
                    'internado': '<span class="status status-internado">Internado</span>',
                    'alta': '<span class="status status-alta">Alta</span>',
                    'obito': '<span class="status status-obito">Óbito</span>'
                };
                
                // Determinar nome da equipe
                let equipeNome = 'Não associado a uma equipe';
                if (paciente.equipeId) {
                    const equipe = equipesUsuario.find(e => e.id === paciente.equipeId);
                    if (equipe) {
                        equipeNome = equipe.nome;
                    } else {
                        equipeNome = 'Equipe não disponível';
                    }
                }
                
                // Contagem de evoluções
                const numEvolucoes = paciente.evolucoes ? paciente.evolucoes.length : 0;
                
                li.innerHTML = `
                    <div class="resultado-header">
                        <div class="resultado-titulo">
                            <h4>${paciente.nome}</h4>
                            ${statusText[paciente.status] || `<span class="status">Status desconhecido</span>`}
                        </div>
                        <div class="resultado-id">
                            ID: ${paciente.idInternacao}
                        </div>
                    </div>
                    <div class="resultado-detalhes">
                        <div class="detalhe-item">
                            <span class="detalhe-label">Nascimento:</span>
                            <span class="detalhe-valor">${dataNascimento}</span>
                        </div>
                        <div class="detalhe-item">
                            <span class="detalhe-label">Local:</span>
                            <span class="detalhe-valor">${paciente.local || 'Não informado'}</span>
                        </div>
                        <div class="detalhe-item">
                            <span class="detalhe-label">Equipe:</span>
                            <span class="detalhe-valor">${equipeNome}</span>
                        </div>
                        <div class="detalhe-item">
                            <span class="detalhe-label">Adicionado em:</span>
                            <span class="detalhe-valor">${dataAdicionado}</span>
                        </div>
                        <div class="detalhe-item">
                            <span class="detalhe-label">Evoluções:</span>
                            <span class="detalhe-valor">${numEvolucoes} evolução(ões)</span>
                        </div>
                    </div>
                    <div class="resultado-acoes">
                        <button class="btn-ver-evolucoes" data-id="${paciente.id}">
                            <i class="fas fa-clipboard-list"></i> Ver Histórico
                        </button>
                        ${paciente.status === 'internado' ? `
                        <button class="btn-evolucao" data-id="${paciente.id}">
                            <i class="fas fa-stethoscope"></i> Evoluir
                        </button>
                        ` : ''}
                    </div>
                `;
                
                listaResultados.appendChild(li);
            });
            
            // Adicionar eventos aos botões
            document.querySelectorAll('.btn-evolucao').forEach(btn => {
                btn.addEventListener('click', () => {
                    const pacienteId = btn.dataset.id;
                    const paciente = todosPacientes.find(p => p.id === pacienteId);
                    
                    if (paciente) {
                        abrirModalEvolucao(paciente);
                    }
                });
            });
            
            document.querySelectorAll('.btn-ver-evolucoes').forEach(btn => {
                btn.addEventListener('click', () => {
                    const pacienteId = btn.dataset.id;
                    const paciente = todosPacientes.find(p => p.id === pacienteId);
                    
                    if (paciente) {
                        // Exibir histórico de evoluções
                        abrirModalEvolucao(paciente);
                    }
                });
            });
            
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            resultadoConsulta.innerHTML = `
                <div class="sem-resultados">
                    <p>Erro ao realizar a consulta. Por favor, tente novamente.</p>
                </div>`;
        }
    };
});

// Função para configurar o listener de autenticação
function configurarAuthListener() {
    console.log("Configurando listener de autenticação");
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // Verificar se é administrador
            isAdmin = user.email === ADMIN_EMAIL;
            
            // Log para diagnóstico
            console.log("Email do usuário:", user.email);
            console.log("Email do administrador configurado:", ADMIN_EMAIL);
            console.log("É administrador?", isAdmin);
            
            try {
                // Verificar se o usuário já existe no Firestore
                const userDoc = await db.collection('usuarios').doc(user.uid).get();
                
                if (!userDoc.exists) {
                    // Primeiro login - registrar usuário
                    await registrarNovoUsuario(user);
                }
                
                // Verificar se o usuário está aprovado (administradores são aprovados automaticamente)
                if (isAdmin) {
                    // Administrador tem acesso completo
                    mostrarInterface(true);
                    await carregarDadosAdmin();
                } else {
                    // Verificar aprovação para usuários normais
                    const aprovado = await verificarAprovacaoUsuario(user.uid);
                    
                    if (aprovado) {
                        // Buscar equipes do médico
                        await carregarEquipesUsuario(user.uid);
                        mostrarInterface(false);
                        // Carregar pacientes após mostrar a interface
                        await carregarPacientes();
                    } else {
                        // Usuário não aprovado - mostrar mensagem
                        areaLogin.style.display = 'none';
                        appContainer.style.display = 'block';
                        
                        // Substituir o conteúdo principal por uma mensagem de espera
                        const main = document.querySelector('main');
                        main.innerHTML = `
                            <section class="aguardando-aprovacao">
                                <div class="mensagem-aprovacao">
                                    <i class="fas fa-user-clock"></i>
                                    <h2>Conta em Análise</h2>
                                    <p>Seu cadastro está pendente de aprovação pelo administrador do sistema.</p>
                                    <p>Por favor, entre em contato com o administrador para solicitar a aprovação da sua conta.</p>
                                    <button id="btn-logout-aprovacao" class="btn-primary">Sair</button>
                                </div>
                            </section>
                        `;
                        
                        // Adicionar evento para o botão de logout na tela de aprovação
                        document.getElementById('btn-logout-aprovacao').addEventListener('click', () => {
                            auth.signOut();
                        });
                        
                        return; // Não continuar com o carregamento normal
                    }
                }
            } catch (error) {
                console.error("Erro ao verificar usuário:", error);
                alert("Erro ao verificar usuário. Por favor, tente novamente.");
                auth.signOut();
            }
        } else {
            currentUser = null;
            isAdmin = false;
            areaLogin.style.display = 'block';
            appContainer.style.display = 'none';
            pacientesLocal = []; // Limpa dados locais ao deslogar
            todosPacientes = []; // Limpa todos os dados ao deslogar
            equipesUsuario = []; // Limpa equipes do usuário ao deslogar
            
            // Limpar a lista de pacientes apenas se ela já tiver sido inicializada
            if (typeof renderizarPacientes === 'function') {
                renderizarPacientes();
            }
            
            // Remover botão de admin do menu se existir
            const adminBtn = document.getElementById('btn-admin');
            if (adminBtn) {
                adminBtn.parentElement.remove();
            }
            
            // Remover badge de admin se existir
            const adminBadge = document.querySelector('.admin-badge');
            if (adminBadge) {
                adminBadge.remove();
            }
            
            // Remover seletor de equipes se existir
            const seletorEquipes = document.querySelector('.seletor-equipes');
            if (seletorEquipes) {
                seletorEquipes.remove();
            }
        }
    });
} 