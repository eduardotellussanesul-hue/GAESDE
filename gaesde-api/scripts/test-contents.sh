#!/bin/bash

echo "========================================="
echo "TESTE DE CONTEÚDOS - CRUD COMPLETO"
echo "========================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. FAZER LOGIN
echo -e "\n${BLUE}1. FAZENDO LOGIN${NC}"
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gaesde.com","password":"Admin@123456"}' \
  | jq -r '.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Falha no login. Verifique suas credenciais.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
echo "Token: $TOKEN"

# 2. CRIAR CATEGORIA
echo -e "\n${BLUE}2. CRIANDO CATEGORIA${NC}"
CATEGORIA=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Programação",
    "slug": "programacao"
  }')

ID_CATEGORIA=$(echo "$CATEGORIA" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA${NC}"

# 3. CRIAR CURSO
echo -e "\n${BLUE}3. CRIANDO CURSO${NC}"
CURSO=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Curso Completo de Programação\",
    \"slug\": \"curso-programacao-completo\",
    \"description\": \"Aprenda programação do zero com exemplos práticos\",
    \"price\": 299.90,
    \"level\": \"beginner\",
    \"categoryId\": \"$ID_CATEGORIA\"
  }")

ID_CURSO=$(echo "$CURSO" | jq -r '.id')
echo -e "${GREEN}✅ Curso criado com ID: $ID_CURSO${NC}"

# 4. CRIAR MÓDULO
echo -e "\n${BLUE}4. CRIANDO MÓDULO${NC}"
MODULO=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Fundamentos da Programação\",
    \"orderIndex\": 0,
    \"description\": \"Conceitos básicos e fundamentos da programação\"
  }")

ID_MODULO=$(echo "$MODULO" | jq -r '.id')
echo -e "${GREEN}✅ Módulo criado com ID: $ID_MODULO${NC}"

# =============================================
# CRIAÇÃO DE CONTEÚDOS
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}CRIANDO CONTEÚDOS${NC}"
echo -e "${BLUE}========================================${NC}"

# 5. CRIAR CONTEÚDO DE VÍDEO
echo -e "\n${YELLOW}5.1 Criando Conteúdo: Vídeo (exemplo.mp4)${NC}"

# Primeiro, criar o conteúdo base
CONTENT_VIDEO=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Aula 1: Introdução à Programação\",
    \"type\": \"video\",
    \"orderIndex\": 0,
    \"isFreePreview\": true,
    \"durationSeconds\": 600
  }")

echo "$CONTENT_VIDEO" | jq '.'
ID_CONTENT_VIDEO=$(echo "$CONTENT_VIDEO" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo de vídeo criado com ID: $ID_CONTENT_VIDEO${NC}"

# Adicionar os dados específicos do vídeo
echo -e "${YELLOW}Adicionando URL do vídeo (exemplo.mp4)${NC}"
curl -X POST "http://localhost:3000/contents/$ID_CONTENT_VIDEO/video" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://res.cloudinary.com/dtqmk1k3b/video/upload/v123456/cursos/exemplo.mp4",
    "videoDurationSeconds": 600
  }' \
  | jq '.'

# 6. CRIAR CONTEÚDO DE TEXTO
echo -e "\n${YELLOW}5.2 Criando Conteúdo: Texto${NC}"

CONTENT_TEXT=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Aula 2: Variáveis e Tipos de Dados\",
    \"type\": \"text\",
    \"orderIndex\": 1,
    \"isFreePreview\": false
  }")

echo "$CONTENT_TEXT" | jq '.'
ID_CONTENT_TEXT=$(echo "$CONTENT_TEXT" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo de texto criado com ID: $ID_CONTENT_TEXT${NC}"

# Adicionar o corpo do texto
echo -e "${YELLOW}Adicionando conteúdo em Markdown${NC}"
curl -X POST "http://localhost:3000/contents/$ID_CONTENT_TEXT/text" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "# Variáveis e Tipos de Dados\n\n## O que são variáveis?\n\nVariáveis são espaços na memória do computador para armazenar dados.\n\n## Tipos de Dados\n\n### Tipos primitivos:\n- **String**: Texto\n- **Number**: Números\n- **Boolean**: Verdadeiro/Falso\n- **Null**: Vazio\n- **Undefined**: Indefinido\n\n## Exemplo em JavaScript\n\n```javascript\nlet nome = \"João\";\nlet idade = 25;\nlet isAdmin = true;\nlet endereco = null;\nlet telefone = undefined;\n```\n\n## Exercício\n\n1. Crie uma variável com seu nome\n2. Crie uma variável com sua idade\n3. Exiba ambas no console"
  }' \
  | jq '.'

# 7. CRIAR CONTEÚDO DE PDF
echo -e "\n${YELLOW}5.3 Criando Conteúdo: PDF (exemplo.pdf)${NC}"

CONTENT_PDF=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Aula 3: Material Complementar\",
    \"type\": \"pdf\",
    \"orderIndex\": 2,
    \"isFreePreview\": false
  }")

echo "$CONTENT_PDF" | jq '.'
ID_CONTENT_PDF=$(echo "$CONTENT_PDF" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo de PDF criado com ID: $ID_CONTENT_PDF${NC}"

# Adicionar URL do PDF
echo -e "${YELLOW}Adicionando URL do PDF (exemplo.pdf)${NC}"
curl -X POST "http://localhost:3000/contents/$ID_CONTENT_PDF/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://res.cloudinary.com/dtqmk1k3b/raw/upload/v123456/cursos/exemplo.pdf",
    "fileSizeBytes": 1024000
  }' \
  | jq '.'

# =============================================
# LISTAGEM E CONSULTAS
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}LISTAGEM E CONSULTAS${NC}"
echo -e "${BLUE}========================================${NC}"

# 8. LISTAR CONTEÚDOS DO MÓDULO
echo -e "\n${BLUE}8. LISTANDO CONTEÚDOS DO MÓDULO${NC}"
curl -s -X GET "http://localhost:3000/contents/module/$ID_MODULO" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 9. BUSCAR CONTEÚDO COMPLETO (com dados específicos)
echo -e "\n${BLUE}9. BUSCANDO CONTEÚDO COMPLETO DO VÍDEO${NC}"
curl -s -X GET "http://localhost:3000/contents/$ID_CONTENT_VIDEO/full" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

echo -e "\n${BLUE}10. BUSCANDO CONTEÚDO COMPLETO DO TEXTO${NC}"
curl -s -X GET "http://localhost:3000/contents/$ID_CONTENT_TEXT/full" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

echo -e "\n${BLUE}11. BUSCANDO CONTEÚDO COMPLETO DO PDF${NC}"
curl -s -X GET "http://localhost:3000/contents/$ID_CONTENT_PDF/full" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 12. BUSCAR APENAS O VÍDEO
echo -e "\n${BLUE}12. BUSCANDO DADOS DO VÍDEO${NC}"
curl -s -X GET "http://localhost:3000/contents/$ID_CONTENT_VIDEO/video" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 13. BUSCAR APENAS O TEXTO
echo -e "\n${BLUE}13. BUSCANDO DADOS DO TEXTO${NC}"
curl -s -X GET "http://localhost:3000/contents/$ID_CONTENT_TEXT/text" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 14. BUSCAR APENAS O PDF
echo -e "\n${BLUE}14. BUSCANDO DADOS DO PDF${NC}"
curl -s -X GET "http://localhost:3000/contents/$ID_CONTENT_PDF/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# =============================================
# ATUALIZAÇÕES
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}ATUALIZAÇÕES${NC}"
echo -e "${BLUE}========================================${NC}"

# 15. ATUALIZAR CONTEÚDO
echo -e "\n${BLUE}15. ATUALIZANDO CONTEÚDO${NC}"
echo -e "${YELLOW}Atualizando título e duração do vídeo${NC}"
curl -s -X PUT "http://localhost:3000/contents/$ID_CONTENT_VIDEO" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aula 1: Introdução à Programação (Atualizada)",
    "durationSeconds": 720
  }' \
  | jq '.'

# 16. ATUALIZAR VÍDEO
echo -e "\n${YELLOW}Atualizando URL do vídeo${NC}"
curl -s -X PUT "http://localhost:3000/contents/$ID_CONTENT_VIDEO/video" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://res.cloudinary.com/dtqmk1k3b/video/upload/v123456/cursos/exemplo_v2.mp4",
    "videoDurationSeconds": 720
  }' \
  | jq '.'

# 17. ATUALIZAR TEXTO
echo -e "\n${YELLOW}Atualizando conteúdo do texto${NC}"
curl -s -X PUT "http://localhost:3000/contents/$ID_CONTENT_TEXT/text" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "# Variáveis e Tipos de Dados (Atualizado)\n\n## O que são variáveis?\n\nVariáveis são espaços na memória do computador para armazenar dados.\n\n## Tipos de Dados\n\n### Tipos primitivos:\n- **String**: Texto\n- **Number**: Números\n- **Boolean**: Verdadeiro/Falso\n- **Null**: Vazio\n- **Undefined**: Indefinido\n\n### Tipos complexos:\n- **Array**: Lista de valores\n- **Object**: Estrutura de dados\n\n## Exemplo em JavaScript\n\n```javascript\nlet nome = \"João\";\nlet idade = 25;\nlet isAdmin = true;\nlet endereco = null;\nlet telefone = undefined;\nlet hobbies = [\"ler\", \"viajar\", \"programar\"];\nlet pessoa = {\n  nome: \"João\",\n  idade: 25\n};\n```\n\n## Exercício\n\n1. Crie uma variável com seu nome\n2. Crie uma variável com sua idade\n3. Crie um array com seus hobbies\n4. Exiba todos no console"
  }' \
  | jq '.'

# 18. REORDENAR CONTEÚDOS
echo -e "\n${BLUE}18. REORDENANDO CONTEÚDOS${NC}"
echo -e "${YELLOW}Alterando ordem: PDF, Vídeo, Texto${NC}"
curl -s -X POST http://localhost:3000/contents/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"contentIds\": [\"$ID_CONTENT_PDF\", \"$ID_CONTENT_VIDEO\", \"$ID_CONTENT_TEXT\"]
  }" \
  | jq '.'

# 19. VERIFICAR NOVA ORDEM
echo -e "\n${BLUE}19. VERIFICANDO NOVA ORDEM DOS CONTEÚDOS${NC}"
curl -s -X GET "http://localhost:3000/contents/module/$ID_MODULO" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# =============================================
# DELETAR CONTEÚDOS
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}DELETAR CONTEÚDOS${NC}"
echo -e "${BLUE}========================================${NC}"

# 20. CRIAR CONTEÚDO PARA TESTAR DELETE
echo -e "\n${YELLOW}20. Criando conteúdo para testar delete${NC}"
CONTENT_DELETE=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Conteúdo para Deletar\",
    \"type\": \"text\",
    \"orderIndex\": 99
  }")

ID_CONTENT_DELETE=$(echo "$CONTENT_DELETE" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo criado com ID: $ID_CONTENT_DELETE${NC}"

# 21. DELETAR CONTEÚDO
echo -e "\n${YELLOW}21. Deletando conteúdo${NC}"
curl -X DELETE "http://localhost:3000/contents/$ID_CONTENT_DELETE" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# =============================================
# ESTATÍSTICAS FINAL
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}ESTATÍSTICAS FINAL${NC}"
echo -e "${BLUE}========================================${NC}"

TOTAL_CONTENTS=$(curl -s -X GET "http://localhost:3000/contents/module/$ID_MODULO" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

echo -e "${GREEN}📊 Estatísticas do Módulo:${NC}"
echo -e "  Total de conteúdos: ${YELLOW}$TOTAL_CONTENTS${NC}"
echo -e "  Conteúdos criados:"
echo -e "    - Vídeo: ${YELLOW}$ID_CONTENT_VIDEO${NC}"
echo -e "    - Texto: ${YELLOW}$ID_CONTENT_TEXT${NC}"
echo -e "    - PDF: ${YELLOW}$ID_CONTENT_PDF${NC}"

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
