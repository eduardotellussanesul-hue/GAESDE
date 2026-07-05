#!/bin/bash

echo "========================================="
echo "TESTE DE COURSES E MODULES - CRUD COMPLETO"
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

# 2. CRIAR CATEGORIAS PARA OS CURSOS
echo -e "\n${BLUE}2. CRIANDO CATEGORIAS PARA OS CURSOS${NC}"

# Criar categoria Desenvolvimento Web
CATEGORIA=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desenvolvimento Web",
    "slug": "desenvolvimento-web"
  }')

ID_CATEGORIA=$(echo "$CATEGORIA" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA${NC}"

# 3. PEGAR ID DO USUÁRIO ADMIN (instrutor)
echo -e "\n${BLUE}3. PEGANDO ID DO INSTRUTOR${NC}"
USER_ID=$(curl -s -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.id')

echo -e "${GREEN}✅ Instrutor ID: $USER_ID${NC}"

# =============================================
# TESTES DE COURSES
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}TESTES DE COURSES${NC}"
echo -e "${BLUE}========================================${NC}"

# 4. CRIAR CURSO 1 - Programação Web
echo -e "\n${YELLOW}4.1 Criando Curso: Programação Web Completa${NC}"
CURSO1=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Programação Web Completa\",
    \"slug\": \"programacao-web-completa\",
    \"description\": \"Aprenda HTML, CSS, JavaScript, Node.js e React do zero ao avançado\",
    \"price\": 299.90,
    \"level\": \"beginner\",
    \"categoryId\": \"$ID_CATEGORIA\",
    \"status\": \"draft\"
  }")

echo "$CURSO1" | jq '.'
ID_CURSO1=$(echo "$CURSO1" | jq -r '.id')
echo -e "${GREEN}✅ Curso criado com ID: $ID_CURSO1${NC}"

# 5. CRIAR CURSO 2 - TypeScript Avançado
echo -e "\n${YELLOW}4.2 Criando Curso: TypeScript Avançado${NC}"
CURSO2=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"TypeScript Avançado\",
    \"slug\": \"typescript-avancado\",
    \"description\": \"Domine TypeScript com padrões de design e arquitetura\",
    \"price\": 199.90,
    \"level\": \"intermediate\",
    \"categoryId\": \"$ID_CATEGORIA\"
  }")

echo "$CURSO2" | jq '.'
ID_CURSO2=$(echo "$CURSO2" | jq -r '.id')
echo -e "${GREEN}✅ Curso criado com ID: $ID_CURSO2${NC}"

# 6. CRIAR CURSO 3 - DevOps Fundamentos
echo -e "\n${YELLOW}4.3 Criando Curso: DevOps Fundamentos${NC}"
CURSO3=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"DevOps Fundamentos\",
    \"slug\": \"devops-fundamentos\",
    \"description\": \"Fundamentos de CI/CD, Docker, Kubernetes e Cloud\",
    \"price\": 0.00,
    \"level\": \"intermediate\",
    \"categoryId\": \"$ID_CATEGORIA\"
  }")

echo "$CURSO3" | jq '.'
ID_CURSO3=$(echo "$CURSO3" | jq -r '.id')
echo -e "${GREEN}✅ Curso criado com ID: $ID_CURSO3${NC}"

# 7. LISTAR TODOS OS CURSOS
echo -e "\n${BLUE}5. LISTANDO TODOS OS CURSOS${NC}"
curl -s -X GET http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 8. LISTAR CURSOS PUBLICADOS
echo -e "\n${BLUE}6. LISTANDO CURSOS PUBLICADOS${NC}"
curl -s -X GET http://localhost:3000/courses/published \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 9. BUSCAR CURSO POR ID
echo -e "\n${BLUE}7. BUSCANDO CURSO POR ID${NC}"
echo -e "${YELLOW}ID: $ID_CURSO1${NC}"
curl -s -X GET "http://localhost:3000/courses/$ID_CURSO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 10. BUSCAR CURSO POR SLUG
echo -e "\n${BLUE}8. BUSCANDO CURSO POR SLUG${NC}"
echo -e "${YELLOW}Slug: typescript-avancado${NC}"
curl -s -X GET "http://localhost:3000/courses/slug/typescript-avancado" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 11. ATUALIZAR CURSO
echo -e "\n${BLUE}9. ATUALIZANDO CURSO${NC}"
echo -e "${YELLOW}Atualizando preço e descrição do curso 1${NC}"
curl -s -X PUT "http://localhost:3000/courses/$ID_CURSO1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 249.90,
    "description": "Aprenda HTML, CSS, JavaScript, Node.js e React do zero ao avançado (versão atualizada)"
  }' \
  | jq '.'

# 12. PUBLICAR CURSO
echo -e "\n${BLUE}10. PUBLICANDO CURSO${NC}"
echo -e "${YELLOW}Publicando curso: $ID_CURSO1${NC}"
curl -s -X POST "http://localhost:3000/courses/$ID_CURSO1/publish" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 13. VERIFICAR CURSOS PUBLICADOS
echo -e "\n${BLUE}11. VERIFICANDO CURSOS PUBLICADOS${NC}"
curl -s -X GET http://localhost:3000/courses/published \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# =============================================
# TESTES DE MODULES
# =============================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}TESTES DE MODULES${NC}"
echo -e "${BLUE}========================================${NC}"

# 14. CRIAR MÓDULOS PARA O CURSO 1
echo -e "\n${YELLOW}12.1 Criando Módulo: Introdução${NC}"
MODULO1=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO1\",
    \"title\": \"Introdução à Programação Web\",
    \"orderIndex\": 0,
    \"description\": \"Fundamentos da web e ferramentas necessárias\"
  }")

echo "$MODULO1" | jq '.'
ID_MODULO1=$(echo "$MODULO1" | jq -r '.id')
echo -e "${GREEN}✅ Módulo criado com ID: $ID_MODULO1${NC}"

# 15. CRIAR MÓDULO 2
echo -e "\n${YELLOW}12.2 Criando Módulo: Frontend${NC}"
MODULO2=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO1\",
    \"title\": \"Desenvolvimento Frontend\",
    \"orderIndex\": 1,
    \"description\": \"HTML, CSS, JavaScript e React\"
  }")

echo "$MODULO2" | jq '.'
ID_MODULO2=$(echo "$MODULO2" | jq -r '.id')
echo -e "${GREEN}✅ Módulo criado com ID: $ID_MODULO2${NC}"

# 16. CRIAR MÓDULO 3
echo -e "\n${YELLOW}12.3 Criando Módulo: Backend${NC}"
MODULO3=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO1\",
    \"title\": \"Desenvolvimento Backend\",
    \"orderIndex\": 2,
    \"description\": \"Node.js, Express e Bancos de Dados\"
  }")

echo "$MODULO3" | jq '.'
ID_MODULO3=$(echo "$MODULO3" | jq -r '.id')
echo -e "${GREEN}✅ Módulo criado com ID: $ID_MODULO3${NC}"

# 17. LISTAR MÓDULOS DE UM CURSO
echo -e "\n${BLUE}13. LISTANDO MÓDULOS DO CURSO$NC"
curl -s -X GET "http://localhost:3000/modules/course/$ID_CURSO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 18. BUSCAR MÓDULO POR ID
echo -e "\n${BLUE}14. BUSCANDO MÓDULO POR ID${NC}"
echo -e "${YELLOW}ID: $ID_MODULO1${NC}"
curl -s -X GET "http://localhost:3000/modules/$ID_MODULO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 19. ATUALIZAR MÓDULO
echo -e "\n${BLUE}15. ATUALIZANDO MÓDULO${NC}"
echo -e "${YELLOW}Atualizando título do módulo 1${NC}"
curl -s -X PUT "http://localhost:3000/modules/$ID_MODULO1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução à Programação Web - Fundamentos",
    "description": "Fundamentos da web, ferramentas e boas práticas"
  }' \
  | jq '.'

# 20. REORDENAR MÓDULOS
echo -e "\n${BLUE}16. REORDENANDO MÓDULOS${NC}"
echo -e "${YELLOW}Alterando ordem: 3, 1, 2${NC}"
curl -s -X POST http://localhost:3000/modules/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO1\",
    \"moduleIds\": [\"$ID_MODULO3\", \"$ID_MODULO1\", \"$ID_MODULO2\"]
  }" \
  | jq '.'

# 21. VERIFICAR NOVA ORDEM
echo -e "\n${BLUE}17. VERIFICANDO NOVA ORDEM DOS MÓDULOS${NC}"
curl -s -X GET "http://localhost:3000/modules/course/$ID_CURSO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 22. LISTAR TODOS OS MÓDULOS (admin only)
echo -e "\n${BLUE}18. LISTANDO TODOS OS MÓDULOS${NC}"
curl -s -X GET http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 23. DELETAR MÓDULO
echo -e "\n${BLUE}19. DELETANDO MÓDULO${NC}"
echo -e "${YELLOW}Deletando módulo: $ID_MODULO3${NC}"
curl -s -X DELETE "http://localhost:3000/modules/$ID_MODULO3" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 24. VERIFICAR LISTA FINAL DE MÓDULOS
echo -e "\n${BLUE}20. LISTA FINAL DE MÓDULOS${NC}"
curl -s -X GET "http://localhost:3000/modules/course/$ID_CURSO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 25. ESTATÍSTICAS
echo -e "\n${BLUE}21. ESTATÍSTICAS${NC}"
TOTAL_CURSOS=$(curl -s -X GET http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

TOTAL_PUBLISHED=$(curl -s -X GET http://localhost:3000/courses/published \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

TOTAL_MODULOS=$(curl -s -X GET http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

MODULOS_CURSO1=$(curl -s -X GET "http://localhost:3000/modules/course/$ID_CURSO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

echo -e "${GREEN}📊 Estatísticas:${NC}"
echo -e "  Total de cursos: ${YELLOW}$TOTAL_CURSOS${NC}"
echo -e "  Cursos publicados: ${YELLOW}$TOTAL_PUBLISHED${NC}"
echo -e "  Total de módulos: ${YELLOW}$TOTAL_MODULOS${NC}"
echo -e "  Módulos no curso 1: ${YELLOW}$MODULOS_CURSO1${NC}"

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
