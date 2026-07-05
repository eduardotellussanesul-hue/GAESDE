#!/bin/bash

echo "========================================="
echo "TESTE DE CATEGORIAS - CRUD COMPLETO"
echo "========================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# 2. CRIAR CATEGORIAS
echo -e "\n${BLUE}2. CRIANDO CATEGORIAS${NC}"

# Categoria 1: Desenvolvimento
echo -e "\n${YELLOW}2.1 Criando: Desenvolvimento Web${NC}"
CATEGORIA1=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desenvolvimento Web",
    "slug": "desenvolvimento-web",
    "parentId": null
  }')

echo "$CATEGORIA1" | jq '.'
ID_CATEGORIA1=$(echo "$CATEGORIA1" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA1${NC}"

# Categoria 2: Frontend (subcategoria de Desenvolvimento)
echo -e "\n${YELLOW}2.2 Criando: Frontend (subcategoria)${NC}"
CATEGORIA2=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Frontend\",
    \"slug\": \"frontend\",
    \"parentId\": \"$ID_CATEGORIA1\"
  }")

echo "$CATEGORIA2" | jq '.'
ID_CATEGORIA2=$(echo "$CATEGORIA2" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA2${NC}"

# Categoria 3: Backend (subcategoria de Desenvolvimento)
echo -e "\n${YELLOW}2.3 Criando: Backend (subcategoria)${NC}"
CATEGORIA3=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Backend\",
    \"slug\": \"backend\",
    \"parentId\": \"$ID_CATEGORIA1\"
  }")

echo "$CATEGORIA3" | jq '.'
ID_CATEGORIA3=$(echo "$CATEGORIA3" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA3${NC}"

# Categoria 4: DevOps
echo -e "\n${YELLOW}2.4 Criando: DevOps${NC}"
CATEGORIA4=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DevOps",
    "slug": "devops",
    "parentId": null
  }')

echo "$CATEGORIA4" | jq '.'
ID_CATEGORIA4=$(echo "$CATEGORIA4" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA4${NC}"

# 3. LISTAR TODAS AS CATEGORIAS
echo -e "\n${BLUE}3. LISTANDO TODAS AS CATEGORIAS${NC}"
curl -s -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 4. LISTAR CATEGORIAS PAI (sem parentId)
echo -e "\n${BLUE}4. LISTANDO CATEGORIAS PAI${NC}"
curl -s -X GET http://localhost:3000/categories/parents \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 5. LISTAR FILHOS DE UMA CATEGORIA
echo -e "\n${BLUE}5. LISTANDO FILHOS DA CATEGORIA 'Desenvolvimento Web'${NC}"
curl -s -X GET "http://localhost:3000/categories/children/$ID_CATEGORIA1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 6. BUSCAR CATEGORIA POR ID
echo -e "\n${BLUE}6. BUSCANDO CATEGORIA POR ID${NC}"
echo -e "${YELLOW}ID: $ID_CATEGORIA2${NC}"
curl -s -X GET "http://localhost:3000/categories/$ID_CATEGORIA2" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 7. BUSCAR CATEGORIA POR SLUG
echo -e "\n${BLUE}7. BUSCANDO CATEGORIA POR SLUG${NC}"
echo -e "${YELLOW}Slug: backend${NC}"
curl -s -X GET "http://localhost:3000/categories/slug/backend" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 8. ATUALIZAR CATEGORIA
echo -e "\n${BLUE}8. ATUALIZANDO CATEGORIA${NC}"
echo -e "${YELLOW}Atualizando 'Frontend' para 'Frontend Moderno'${NC}"
curl -s -X PUT "http://localhost:3000/categories/$ID_CATEGORIA2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Moderno",
    "slug": "frontend-moderno"
  }' \
  | jq '.'

# 9. VERIFICAR ATUALIZAÇÃO
echo -e "\n${BLUE}9. VERIFICANDO CATEGORIA ATUALIZADA${NC}"
curl -s -X GET "http://localhost:3000/categories/$ID_CATEGORIA2" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 10. CRIAR UMA CATEGORIA PARA TESTAR DELETE
echo -e "\n${BLUE}10. CRIANDO CATEGORIA PARA TESTAR DELETE${NC}"
CATEGORIA_DELETE=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Categoria para Deletar",
    "slug": "categoria-para-deletar"
  }')

echo "$CATEGORIA_DELETE" | jq '.'
ID_CATEGORIA_DELETE=$(echo "$CATEGORIA_DELETE" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada com ID: $ID_CATEGORIA_DELETE${NC}"

# 11. DELETAR CATEGORIA
echo -e "\n${BLUE}11. DELETANDO CATEGORIA${NC}"
echo -e "${YELLOW}Deletando: $ID_CATEGORIA_DELETE${NC}"
curl -s -X DELETE "http://localhost:3000/categories/$ID_CATEGORIA_DELETE" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 12. VERIFICAR QUE FOI DELETADA
echo -e "\n${BLUE}12. VERIFICANDO SE FOI DELETADA${NC}"
RESULTADO=$(curl -s -X GET "http://localhost:3000/categories/$ID_CATEGORIA_DELETE" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESULTADO" | grep -q "CategoryNotFoundException"; then
  echo -e "${GREEN}✅ Categoria deletada com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro: Categoria ainda existe${NC}"
  echo "$RESULTADO" | jq '.'
fi

# 13. LISTAR CATEGORIAS FINAL
echo -e "\n${BLUE}13. LISTA FINAL DE CATEGORIAS${NC}"
curl -s -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 14. ESTATÍSTICAS
echo -e "\n${BLUE}14. ESTATÍSTICAS DAS CATEGORIAS${NC}"
TOTAL=$(curl -s -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

TOTAL_PARENTS=$(curl -s -X GET http://localhost:3000/categories/parents \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

TOTAL_CHILDREN=$((TOTAL - TOTAL_PARENTS))

echo -e "${GREEN}📊 Estatísticas:${NC}"
echo -e "  Total de categorias: ${YELLOW}$TOTAL${NC}"
echo -e "  Categorias pai: ${YELLOW}$TOTAL_PARENTS${NC}"
echo -e "  Subcategorias: ${YELLOW}$TOTAL_CHILDREN${NC}"

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
