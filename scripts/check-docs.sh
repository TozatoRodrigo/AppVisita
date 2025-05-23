#!/bin/bash

# 🔍 Script de Verificação de Documentação - AppVisita CI/CD
# Garante que toda mudança de código seja acompanhada de atualização na documentação

set -e  # Parar em caso de erro

echo "🔍 Verificando atualização da documentação..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ ERRO: Não é um repositório Git${NC}"
    exit 1
fi

# Obter arquivos modificados (comparar com HEAD~1)
MODIFIED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")
ADDED_FILES=$(git diff --name-only --diff-filter=A HEAD~1 HEAD 2>/dev/null || echo "")
ALL_CHANGED_FILES="$MODIFIED_FILES $ADDED_FILES"

echo -e "${BLUE}📁 Arquivos modificados/adicionados:${NC}"
echo "$ALL_CHANGED_FILES" | tr ' ' '\n' | grep -v '^$' | sed 's/^/  - /'

# Verificar se há mudanças de código
CODE_CHANGED=false
DOCS_UPDATED=false
JS_FILES_CHANGED=""
CONFIG_FILES_CHANGED=""

# Padrões de arquivos de código
CODE_PATTERNS=("*.js" "*.html" "*.css" "*.py" "*.json" "*.sql")
DOC_PATTERNS=("docs/*" "README.md" "*.md")
CONFIG_PATTERNS=("*.json" "*.yml" "*.yaml" "*.env*" "script-otimizado.js")

# Verificar arquivos de código modificados
for file in $ALL_CHANGED_FILES; do
    # Verificar se é arquivo de código
    for pattern in "${CODE_PATTERNS[@]}"; do
        if [[ $file == $pattern ]]; then
            CODE_CHANGED=true
            if [[ $file == *.js ]]; then
                JS_FILES_CHANGED="$JS_FILES_CHANGED $file"
            fi
        fi
    done
    
    # Verificar se é arquivo de configuração
    for pattern in "${CONFIG_PATTERNS[@]}"; do
        if [[ $file == $pattern ]]; then
            CONFIG_FILES_CHANGED="$CONFIG_FILES_CHANGED $file"
        fi
    done
    
    # Verificar se documentação foi atualizada
    for pattern in "${DOC_PATTERNS[@]}"; do
        if [[ $file == $pattern ]]; then
            DOCS_UPDATED=true
        fi
    done
done

# Função para verificar se tipo específico de mudança requer doc
check_specific_requirements() {
    local requirements_met=true
    
    # Se mudou app-admin.js, deve atualizar USER_MANUAL.md
    if [[ $JS_FILES_CHANGED == *"app-admin.js"* ]]; then
        if ! echo "$ALL_CHANGED_FILES" | grep -q "docs/USER_MANUAL.md"; then
            echo -e "${YELLOW}⚠️  app-admin.js modificado - atualize docs/USER_MANUAL.md${NC}"
            requirements_met=false
        fi
    fi
    
    # Se mudou estrutura de dados, deve atualizar DATABASE.md
    if echo "$ALL_CHANGED_FILES" | grep -q "app-pacientes.js\|script-otimizado.js"; then
        if ! echo "$ALL_CHANGED_FILES" | grep -q "docs/DATABASE.md"; then
            echo -e "${YELLOW}⚠️  Possível mudança no banco - considere atualizar docs/DATABASE.md${NC}"
            requirements_met=false
        fi
    fi
    
    # Se mudou configurações, deve atualizar INSTALLATION.md
    if [[ -n "$CONFIG_FILES_CHANGED" ]]; then
        if ! echo "$ALL_CHANGED_FILES" | grep -q "docs/INSTALLATION.md"; then
            echo -e "${YELLOW}⚠️  Configurações modificadas - considere atualizar docs/INSTALLATION.md${NC}"
            requirements_met=false
        fi
    fi
    
    return $requirements_met
}

# Verificar se commit inclui apenas documentação
ONLY_DOCS=true
for file in $ALL_CHANGED_FILES; do
    # Se não é documentação, não é commit apenas de docs
    is_doc=false
    for pattern in "${DOC_PATTERNS[@]}"; do
        if [[ $file == $pattern ]]; then
            is_doc=true
            break
        fi
    done
    
    if [ "$is_doc" = false ]; then
        ONLY_DOCS=false
        break
    fi
done

# Se é commit apenas de documentação, aprovar
if [ "$ONLY_DOCS" = true ] && [ -n "$ALL_CHANGED_FILES" ]; then
    echo -e "${GREEN}✅ Commit de documentação aprovado${NC}"
    exit 0
fi

# Se não houve mudanças de código, aprovar
if [ "$CODE_CHANGED" = false ]; then
    echo -e "${GREEN}✅ Nenhuma mudança de código detectada${NC}"
    exit 0
fi

echo -e "\n${BLUE}🔍 Análise de mudanças de código:${NC}"

# Verificar se documentação foi atualizada quando código mudou
if [ "$CODE_CHANGED" = true ] && [ "$DOCS_UPDATED" = false ]; then
    echo -e "${RED}❌ ERRO: Código modificado mas documentação não atualizada${NC}"
    echo -e "${YELLOW}📝 Ação requerida:${NC}"
    echo "   1. Identifique qual documentação é afetada pela sua mudança"
    echo "   2. Atualize os arquivos relevantes em docs/"
    echo "   3. Atualize README.md se necessário"
    echo "   4. Commit as mudanças de documentação junto com o código"
    echo ""
    echo -e "${BLUE}💡 Guia rápido:${NC}"
    echo "   - Nova funcionalidade → USER_MANUAL.md + ARCHITECTURE.md"
    echo "   - Mudança de interface → USER_MANUAL.md"
    echo "   - Mudança no banco → DATABASE.md"
    echo "   - Configuração → INSTALLATION.md"
    echo "   - Bug fix → TROUBLESHOOTING.md"
    echo ""
    echo -e "${BLUE}📋 Consulte: docs/DOCUMENTATION_UPDATE.md${NC}"
    exit 1
fi

# Verificar requisitos específicos
echo -e "\n${BLUE}🎯 Verificando requisitos específicos...${NC}"
if ! check_specific_requirements; then
    echo -e "${YELLOW}⚠️  Considere atualizar a documentação adicional mencionada${NC}"
    echo -e "${BLUE}💡 Esta é apenas uma sugestão, não bloqueia o CI/CD${NC}"
fi

# Verificar se datas foram atualizadas nos docs
echo -e "\n${BLUE}📅 Verificando datas na documentação...${NC}"
TODAY=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)

for doc_file in docs/*.md README.md; do
    if [ -f "$doc_file" ] && echo "$ALL_CHANGED_FILES" | grep -q "$doc_file"; then
        # Verificar se data foi atualizada
        if ! grep -q "$CURRENT_YEAR" "$doc_file"; then
            echo -e "${YELLOW}⚠️  $doc_file pode ter data desatualizada${NC}"
        fi
    fi
done

# Verificar se README.md tem status atualizado
if echo "$ALL_CHANGED_FILES" | grep -q "README.md"; then
    if ! grep -q "$(date +%Y-%m-%d)" README.md; then
        echo -e "${YELLOW}⚠️  README.md: considere atualizar data da última atualização${NC}"
    fi
fi

# Gerar relatório de conformidade
echo -e "\n${GREEN}✅ Verificação de documentação aprovada${NC}"
echo -e "${BLUE}📊 Relatório:${NC}"
echo "   - Código modificado: $([ "$CODE_CHANGED" = true ] && echo "✅ Sim" || echo "❌ Não")"
echo "   - Docs atualizados: $([ "$DOCS_UPDATED" = true ] && echo "✅ Sim" || echo "❌ Não")"
echo "   - Arquivos JS: $(echo $JS_FILES_CHANGED | wc -w | tr -d ' ') modificados"
echo "   - Arquivos de doc: $(echo "$ALL_CHANGED_FILES" | tr ' ' '\n' | grep -E '\.(md)$' | wc -l | tr -d ' ') atualizados"

# Log para CI/CD
echo "DOCS_CHECK_PASSED=true" >> $GITHUB_ENV 2>/dev/null || true
echo "CODE_CHANGED=$CODE_CHANGED" >> $GITHUB_ENV 2>/dev/null || true
echo "DOCS_UPDATED=$DOCS_UPDATED" >> $GITHUB_ENV 2>/dev/null || true

echo -e "\n${GREEN}🎉 Verificação concluída com sucesso!${NC}"
exit 0 