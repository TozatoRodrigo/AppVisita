#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🚨 Monitor de Documentação - AppVisita
Monitora docs desatualizadas e envia alertas
"""

import os
import sys
import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import re

class DocumentationMonitor:
    def __init__(self, config_file="scripts/monitor-config.json"):
        """Inicializar monitor de documentação"""
        self.config = self.load_config(config_file)
        self.warnings = []
        self.errors = []
        self.docs_status = {}
        
    def load_config(self, config_file):
        """Carregar configurações do monitor"""
        default_config = {
            "email": {
                "smtp_server": "smtp.gmail.com",
                "smtp_port": 587,
                "from_email": "",
                "from_password": "",
                "alert_emails": ["admin@appvisita.com"]
            },
            "thresholds": {
                "warning_days": 7,
                "error_days": 14,
                "critical_days": 30
            },
            "docs_to_monitor": [
                "docs/ARCHITECTURE.md",
                "docs/DATABASE.md", 
                "docs/USER_MANUAL.md",
                "docs/INSTALLATION.md",
                "docs/MAINTENANCE.md",
                "README.md"
            ],
            "code_files_to_track": [
                "app-admin.js",
                "app-pacientes.js",
                "app-equipes.js",
                "script-otimizado.js"
            ]
        }
        
        if os.path.exists(config_file):
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults
                    for key in default_config:
                        if key not in loaded_config:
                            loaded_config[key] = default_config[key]
                    return loaded_config
            except Exception as e:
                print(f"⚠️ Erro ao carregar config: {e}")
                
        return default_config
    
    def get_file_last_modified(self, file_path):
        """Obter data da última modificação do arquivo"""
        try:
            if os.path.exists(file_path):
                timestamp = os.path.getmtime(file_path)
                return datetime.fromtimestamp(timestamp)
            return None
        except Exception as e:
            print(f"⚠️ Erro ao obter data de {file_path}: {e}")
            return None
    
    def get_git_last_modified(self, file_path):
        """Obter data da última modificação via Git"""
        try:
            cmd = f"git log -1 --format=%cd --date=iso {file_path}"
            result = subprocess.run(cmd.split(), capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                date_str = result.stdout.strip()
                # Parse formato: 2025-01-23 14:30:45 -0300
                date_part = date_str.split(' ')[0] + ' ' + date_str.split(' ')[1]
                return datetime.strptime(date_part, "%Y-%m-%d %H:%M:%S")
            return None
        except Exception as e:
            print(f"⚠️ Erro ao obter data Git de {file_path}: {e}")
            return None
    
    def extract_doc_last_update(self, file_path):
        """Extrair data de 'última atualização' do próprio documento"""
        try:
            if not os.path.exists(file_path):
                return None
                
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Padrões de data comum na documentação
            patterns = [
                r'última atualização[:\s]+(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})',
                r'Last updated[:\s]+(\d{4})-(\d{1,2})-(\d{1,2})',
                r'atualizada em[:\s]+(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})',
                r'(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})'  # 23 de Janeiro de 2025
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    match = matches[-1]  # Pegar a última ocorrência
                    try:
                        if len(match) == 3:
                            if pattern.endswith(r'(\d{4})'):  # Formato brasileiro
                                day, month, year = match
                                return datetime(int(year), int(month), int(day))
                            else:  # Formato ISO
                                year, month, day = match
                                return datetime(int(year), int(month), int(day))
                    except:
                        continue
                        
            return None
        except Exception as e:
            print(f"⚠️ Erro ao extrair data de {file_path}: {e}")
            return None
    
    def analyze_doc_status(self, doc_path):
        """Analisar status de um documento específico"""
        if not os.path.exists(doc_path):
            return {
                'status': 'missing',
                'message': f'Arquivo {doc_path} não encontrado',
                'severity': 'error'
            }
        
        # Obter diferentes datas
        file_modified = self.get_file_last_modified(doc_path)
        git_modified = self.get_git_last_modified(doc_path)
        doc_date = self.extract_doc_last_update(doc_path)
        
        # Usar a data mais recente disponível
        last_update = None
        update_source = ""
        
        if doc_date:
            last_update = doc_date
            update_source = "documento"
        elif git_modified:
            last_update = git_modified
            update_source = "git"
        elif file_modified:
            last_update = file_modified
            update_source = "sistema"
        
        if not last_update:
            return {
                'status': 'unknown',
                'message': f'Não foi possível determinar data de atualização de {doc_path}',
                'severity': 'warning'
            }
        
        # Calcular dias desde a última atualização
        days_since_update = (datetime.now() - last_update).days
        
        # Determinar status baseado nos thresholds
        thresholds = self.config['thresholds']
        
        if days_since_update <= thresholds['warning_days']:
            status = 'current'
            severity = 'info'
            message = f'{doc_path} atualizado há {days_since_update} dias ({update_source})'
        elif days_since_update <= thresholds['error_days']:
            status = 'warning'
            severity = 'warning'
            message = f'{doc_path} não atualizado há {days_since_update} dias ({update_source})'
        elif days_since_update <= thresholds['critical_days']:
            status = 'outdated'
            severity = 'error'
            message = f'{doc_path} DESATUALIZADO há {days_since_update} dias ({update_source})'
        else:
            status = 'critical'
            severity = 'critical'
            message = f'{doc_path} CRÍTICO - {days_since_update} dias sem atualização ({update_source})'
        
        return {
            'status': status,
            'message': message,
            'severity': severity,
            'last_update': last_update,
            'days_since_update': days_since_update,
            'update_source': update_source
        }
    
    def check_code_vs_docs_sync(self):
        """Verificar sincronização entre código e documentação"""
        sync_issues = []
        
        # Verificar se arquivos de código são mais recentes que docs
        for code_file in self.config['code_files_to_track']:
            if not os.path.exists(code_file):
                continue
                
            code_date = self.get_git_last_modified(code_file)
            if not code_date:
                continue
            
            # Verificar docs relacionados
            related_docs = {
                'app-admin.js': ['docs/USER_MANUAL.md', 'docs/ARCHITECTURE.md'],
                'app-pacientes.js': ['docs/DATABASE.md', 'docs/USER_MANUAL.md'],
                'script-otimizado.js': ['docs/INSTALLATION.md', 'docs/ARCHITECTURE.md']
            }
            
            if code_file in related_docs:
                for doc_file in related_docs[code_file]:
                    if os.path.exists(doc_file):
                        doc_date = self.get_git_last_modified(doc_file) or self.get_file_last_modified(doc_file)
                        if doc_date and code_date > doc_date:
                            days_diff = (code_date - doc_date).days
                            if days_diff > 1:  # Tolerância de 1 dia
                                sync_issues.append({
                                    'code_file': code_file,
                                    'doc_file': doc_file,
                                    'days_diff': days_diff,
                                    'message': f'{code_file} modificado {days_diff} dias após {doc_file}'
                                })
        
        return sync_issues
    
    def generate_report(self):
        """Gerar relatório completo"""
        print("🔍 Iniciando monitoramento de documentação...")
        
        # Verificar cada documento
        for doc_path in self.config['docs_to_monitor']:
            status = self.analyze_doc_status(doc_path)
            self.docs_status[doc_path] = status
            
            if status['severity'] == 'warning':
                self.warnings.append(status['message'])
            elif status['severity'] in ['error', 'critical']:
                self.errors.append(status['message'])
            
            # Imprimir status
            severity_emoji = {
                'info': '✅',
                'warning': '⚠️',
                'error': '❌',
                'critical': '🚨'
            }
            emoji = severity_emoji.get(status['severity'], '❓')
            print(f"{emoji} {status['message']}")
        
        # Verificar sincronização código-docs
        sync_issues = self.check_code_vs_docs_sync()
        for issue in sync_issues:
            self.warnings.append(issue['message'])
            print(f"⚠️ {issue['message']}")
        
        # Gerar resumo
        total_docs = len(self.config['docs_to_monitor'])
        current_docs = len([s for s in self.docs_status.values() if s['status'] == 'current'])
        warning_docs = len([s for s in self.docs_status.values() if s['status'] == 'warning'])
        outdated_docs = len([s for s in self.docs_status.values() if s['status'] in ['outdated', 'critical']])
        
        print(f"\n📊 Resumo:")
        print(f"   Total de documentos: {total_docs}")
        print(f"   ✅ Atualizados: {current_docs}")
        print(f"   ⚠️ Warnings: {warning_docs}")
        print(f"   ❌ Desatualizados: {outdated_docs}")
        print(f"   🔄 Problemas de sync: {len(sync_issues)}")
        
        return {
            'total_docs': total_docs,
            'current_docs': current_docs,
            'warning_docs': warning_docs,
            'outdated_docs': outdated_docs,
            'sync_issues': len(sync_issues),
            'warnings': self.warnings,
            'errors': self.errors
        }
    
    def send_email_alert(self, report):
        """Enviar alerta por email - versão simplificada"""
        print("📧 Funcionalidade de email temporariamente desabilitada")
        print("   Para ativar, instale dependências: pip install secure-smtplib")
        
        # Só mostrar que seria enviado se houvesse problemas
        if self.warnings or self.errors:
            print(f"📧 Seria enviado alerta: {len(self.errors)} erros, {len(self.warnings)} warnings")
            return True
        else:
            print("✅ Nenhum problema encontrado - não enviaria alerta")
            return True
    
    def save_report_json(self, report):
        """Salvar relatório em JSON"""
        try:
            report_data = {
                'timestamp': datetime.now().isoformat(),
                'summary': report,
                'docs_status': {path: {
                    'status': status['status'],
                    'severity': status['severity'],
                    'days_since_update': status.get('days_since_update', 0),
                    'last_update': status.get('last_update').isoformat() if status.get('last_update') else None
                } for path, status in self.docs_status.items()},
                'warnings': self.warnings,
                'errors': self.errors
            }
            
            # Criar diretório se não existir
            os.makedirs('logs', exist_ok=True)
            
            # Salvar relatório
            report_file = f"logs/docs-monitor-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Relatório salvo em: {report_file}")
            return report_file
            
        except Exception as e:
            print(f"❌ Erro ao salvar relatório: {e}")
            return None

def main():
    """Função principal"""
    print("🚨 Monitor de Documentação AppVisita")
    print("=" * 50)
    
    # Verificar se estamos no diretório correto
    if not os.path.exists('docs') and not os.path.exists('README.md'):
        print("❌ Execute o script na raiz do projeto AppVisita")
        sys.exit(1)
    
    # Inicializar monitor
    monitor = DocumentationMonitor()
    
    # Gerar relatório
    report = monitor.generate_report()
    
    # Salvar relatório
    monitor.save_report_json(report)
    
    # Enviar alertas se necessário
    if '--send-alerts' in sys.argv:
        monitor.send_email_alert(report)
    
    # Exit code baseado em problemas encontrados
    if monitor.errors:
        print(f"\n🚨 CRÍTICO: {len(monitor.errors)} erros encontrados!")
        sys.exit(1)
    elif monitor.warnings:
        print(f"\n⚠️ WARNING: {len(monitor.warnings)} warnings encontrados")
        sys.exit(0)
    else:
        print("\n✅ Documentação em dia!")
        sys.exit(0)

if __name__ == "__main__":
    main() 