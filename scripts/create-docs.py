#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📝 Criador de Documentação - AppVisita
Script para automatizar criação de docs usando templates
"""

import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

class DocumentationCreator:
    def __init__(self):
        """Inicializar criador de documentação"""
        self.templates_dir = Path("templates")
        self.docs_dir = Path("docs")
        self.features_dir = Path("docs/features")
        self.bugfixes_dir = Path("docs/bugfixes")
        self.api_dir = Path("docs/api")
        
        self.templates = {
            'feature': 'FEATURE_TEMPLATE.md',
            'bugfix': 'BUGFIX_TEMPLATE.md',
            'api': 'API_ENDPOINT_TEMPLATE.md'
        }
        
        # Criar diretórios se não existirem
        for dir_path in [self.features_dir, self.bugfixes_dir, self.api_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    def show_menu(self):
        """Mostrar menu principal"""
        print("📝 Criador de Documentação AppVisita")
        print("=" * 50)
        print("1. 🆕 Nova Funcionalidade")
        print("2. 🐛 Correção de Bug")
        print("3. 🔌 Novo Endpoint de API")
        print("4. 📋 Listar documentos existentes")
        print("5. 🔍 Verificar templates")
        print("0. ❌ Sair")
        print()
    
    def get_user_input(self, prompt, required=True):
        """Obter input do usuário com validação"""
        while True:
            value = input(f"{prompt}: ").strip()
            if value or not required:
                return value
            print("❌ Este campo é obrigatório!")
    
    def get_current_date(self):
        """Obter data atual formatada"""
        now = datetime.now()
        return {
            'dd_mm_yyyy': now.strftime('%d/%m/%Y'),
            'dd_mes_yyyy': now.strftime(f'%d de {self.get_month_name(now.month)} de %Y'),
            'yyyy_mm_dd': now.strftime('%Y-%m-%d')
        }
    
    def get_month_name(self, month):
        """Obter nome do mês em português"""
        months = {
            1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
            5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
            9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
        }
        return months.get(month, 'Janeiro')
    
    def create_feature_doc(self):
        """Criar documentação de nova funcionalidade"""
        print("\n🆕 Criando documentação de nova funcionalidade")
        print("-" * 50)
        
        # Coletar informações
        nome_funcionalidade = self.get_user_input("Nome da funcionalidade")
        modulo = self.get_user_input("Módulo (ex: app-admin.js, app-pacientes.js)")
        desenvolvedor = self.get_user_input("Nome do desenvolvedor")
        versao = self.get_user_input("Versão", required=False) or "v1.0.0"
        objetivo = self.get_user_input("Objetivo/descrição da funcionalidade")
        
        # Criar nome do arquivo
        nome_arquivo = nome_funcionalidade.lower().replace(' ', '_').replace('-', '_')
        nome_arquivo = f"FEATURE_{nome_arquivo}.md"
        arquivo_destino = self.features_dir / nome_arquivo
        
        # Carregar template
        template_path = self.templates_dir / self.templates['feature']
        if not template_path.exists():
            print(f"❌ Template não encontrado: {template_path}")
            return False
        
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Substituir placeholders
        dates = self.get_current_date()
        
        replacements = {
            '[Nome da Funcionalidade]': nome_funcionalidade,
            '[Nome completo da funcionalidade]': nome_funcionalidade,
            '[app-admin.js | app-pacientes.js | app-equipes.js | etc.]': modulo,
            '[v1.x.x]': versao,
            '[Nome do desenvolvedor]': desenvolvedor,
            '[DD/MM/YYYY]': dates['dd_mm_yyyy'],
            '[DD de Mês de YYYY]': dates['dd_mes_yyyy'],
            '[Descrição clara do que a funcionalidade resolve ou melhora]': objetivo
        }
        
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)
        
        # Salvar arquivo
        with open(arquivo_destino, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Documentação criada: {arquivo_destino}")
        print(f"📝 Próximos passos:")
        print(f"   1. Edite o arquivo {arquivo_destino}")
        print(f"   2. Remova as instruções do template")
        print(f"   3. Preencha todas as seções [entre colchetes]")
        print(f"   4. Adicione screenshots se necessário")
        
        return True
    
    def create_bugfix_doc(self):
        """Criar documentação de correção de bug"""
        print("\n🐛 Criando documentação de correção de bug")
        print("-" * 50)
        
        # Coletar informações
        titulo_bug = self.get_user_input("Título/descrição do bug")
        bug_id = self.get_user_input("ID do bug (ex: #123)", required=False)
        severidade = self.get_user_input("Severidade (Crítica/Alta/Média/Baixa)", required=False) or "Média"
        modulo = self.get_user_input("Módulo afetado")
        desenvolvedor = self.get_user_input("Desenvolvedor responsável pela correção")
        sintomas = self.get_user_input("Sintomas observados")
        
        # Criar nome do arquivo
        nome_arquivo = titulo_bug.lower().replace(' ', '_').replace('-', '_')
        nome_arquivo = f"BUGFIX_{nome_arquivo}.md"
        arquivo_destino = self.bugfixes_dir / nome_arquivo
        
        # Carregar template
        template_path = self.templates_dir / self.templates['bugfix']
        if not template_path.exists():
            print(f"❌ Template não encontrado: {template_path}")
            return False
        
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Substituir placeholders
        dates = self.get_current_date()
        
        replacements = {
            '[Título do Bug Fix]': titulo_bug,
            '[#número ou referência]': bug_id or "TBD",
            '[Crítica | Alta | Média | Baixa]': severidade,
            '[app-admin.js | app-pacientes.js | etc.]': modulo,
            '[Nome do desenvolvedor]': desenvolvedor,
            '[DD/MM/YYYY]': dates['dd_mm_yyyy'],
            '[DD de Mês de YYYY]': dates['dd_mes_yyyy'],
            '[Descrição detalhada do comportamento incorreto]': sintomas
        }
        
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)
        
        # Salvar arquivo
        with open(arquivo_destino, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Documentação criada: {arquivo_destino}")
        print(f"📝 Próximos passos:")
        print(f"   1. Edite o arquivo {arquivo_destino}")
        print(f"   2. Preencha os passos de reprodução")
        print(f"   3. Documente a solução implementada")
        print(f"   4. Adicione testes de validação")
        
        return True
    
    def create_api_doc(self):
        """Criar documentação de endpoint de API"""
        print("\n🔌 Criando documentação de endpoint de API")
        print("-" * 50)
        
        # Coletar informações
        nome_endpoint = self.get_user_input("Nome do endpoint")
        url_path = self.get_user_input("URL path (ex: /api/v1/users)")
        metodo = self.get_user_input("Método HTTP (GET/POST/PUT/DELETE/PATCH)")
        modulo = self.get_user_input("Módulo/sistema")
        desenvolvedor = self.get_user_input("Desenvolvedor responsável")
        proposito = self.get_user_input("Propósito/descrição do endpoint")
        
        # Criar nome do arquivo
        nome_arquivo = nome_endpoint.lower().replace(' ', '_').replace('-', '_')
        nome_arquivo = f"API_{nome_arquivo}.md"
        arquivo_destino = self.api_dir / nome_arquivo
        
        # Carregar template
        template_path = self.templates_dir / self.templates['api']
        if not template_path.exists():
            print(f"❌ Template não encontrado: {template_path}")
            return False
        
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Substituir placeholders
        dates = self.get_current_date()
        
        replacements = {
            '[Nome do Endpoint]': nome_endpoint,
            '[/api/v1/endpoint]': url_path,
            '[GET | POST | PUT | DELETE | PATCH]': metodo,
            '[METHOD]': metodo,
            '[method]': metodo.lower(),
            '[Nome do módulo]': modulo,
            '[Nome do desenvolvedor]': desenvolvedor,
            '[DD/MM/YYYY]': dates['dd_mm_yyyy'],
            '[DD de Mês de YYYY]': dates['dd_mes_yyyy'],
            '[Descrição clara do que este endpoint faz]': proposito
        }
        
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)
        
        # Salvar arquivo
        with open(arquivo_destino, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Documentação criada: {arquivo_destino}")
        print(f"📝 Próximos passos:")
        print(f"   1. Edite o arquivo {arquivo_destino}")
        print(f"   2. Defina parâmetros e validações")
        print(f"   3. Documente exemplos de uso")
        print(f"   4. Adicione casos de teste")
        
        return True
    
    def list_existing_docs(self):
        """Listar documentos existentes"""
        print("\n📋 Documentos existentes")
        print("-" * 50)
        
        sections = [
            ("🆕 Funcionalidades", self.features_dir),
            ("🐛 Correções de Bug", self.bugfixes_dir),
            ("🔌 APIs", self.api_dir)
        ]
        
        for section_name, directory in sections:
            print(f"\n{section_name}:")
            if directory.exists():
                files = list(directory.glob("*.md"))
                if files:
                    for file in sorted(files):
                        print(f"   📄 {file.name}")
                else:
                    print("   (nenhum documento encontrado)")
            else:
                print("   (diretório não existe)")
    
    def check_templates(self):
        """Verificar se templates existem"""
        print("\n🔍 Verificando templates")
        print("-" * 50)
        
        for template_type, template_file in self.templates.items():
            template_path = self.templates_dir / template_file
            if template_path.exists():
                print(f"✅ {template_type}: {template_file}")
            else:
                print(f"❌ {template_type}: {template_file} (NÃO ENCONTRADO)")
        
        if not self.templates_dir.exists():
            print(f"\n⚠️ Diretório de templates não encontrado: {self.templates_dir}")
            print("   Execute este script na raiz do projeto AppVisita")
    
    def run(self):
        """Executar o criador de documentação"""
        while True:
            self.show_menu()
            choice = input("Escolha uma opção: ").strip()
            
            if choice == '1':
                self.create_feature_doc()
            elif choice == '2':
                self.create_bugfix_doc()
            elif choice == '3':
                self.create_api_doc()
            elif choice == '4':
                self.list_existing_docs()
            elif choice == '5':
                self.check_templates()
            elif choice == '0':
                print("👋 Saindo...")
                break
            else:
                print("❌ Opção inválida!")
            
            input("\nPressione Enter para continuar...")
            print("\n" * 2)

def main():
    """Função principal"""
    # Verificar se estamos no diretório correto
    if not os.path.exists('docs') and not os.path.exists('README.md'):
        print("❌ Execute o script na raiz do projeto AppVisita")
        sys.exit(1)
    
    creator = DocumentationCreator()
    creator.run()

if __name__ == "__main__":
    main() 