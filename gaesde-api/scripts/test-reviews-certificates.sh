#!/bin/bash

echo "========================================="
echo "TESTE DE REVIEWS E CERTIFICADOS"
echo "========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. LOGIN ADMIN
echo -e "\n${BLUE}1. FAZENDO LOGIN COMO ADMIN${NC}"
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gaesde.com","password":"Admin@123456"}' \
  | jq -r '.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Falha no login${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado${NC}"

# 2. CRIAR CURSO COM SLUG ÚNICO
TIMESTAMP=$(date +%s%N | md5sum | head -c 8)
SLUG="curso-reviews-$(date +%s)-${TIMESTAMP}"

echo -e "\n${BLUE}2. CRIANDO CURSO (slug: $SLUG)${NC}"
CURSO=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Curso com Reviews e Certificado $(date +%s)\",
    \"slug\": \"$SLUG\",
    \"description\": \"Curso completo para testar reviews e certificados\",
    \"level\": \"beginner\"
  }")

ID_CURSO=$(echo "$CURSO" | jq -r '.id')

if [ "$ID_CURSO" == "null" ] || [ -z "$ID_CURSO" ]; then
  echo -e "${RED}❌ Erro ao criar curso${NC}"
  echo "$CURSO"
  exit 1
fi
echo -e "${GREEN}✅ Curso criado: $ID_CURSO${NC}"

# 3. CRIAR MÓDULO
echo -e "\n${BLUE}3. CRIANDO MÓDULO${NC}"
MODULO=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Módulo Único\",
    \"orderIndex\": 0
  }")
ID_MODULO=$(echo "$MODULO" | jq -r '.id')
echo -e "${GREEN}✅ Módulo criado: $ID_MODULO${NC}"

# 4. CRIAR CONTEÚDO
echo -e "\n${BLUE}4. CRIANDO CONTEÚDO${NC}"
CONTENT=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Conteúdo para completar\",
    \"type\": \"text\",
    \"orderIndex\": 0
  }")
ID_CONTENT=$(echo "$CONTENT" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo criado: $ID_CONTENT${NC}"

# 5. CRIAR ALUNO
echo -e "\n${BLUE}5. CRIANDO ALUNO${NC}"
ALUNO=$(curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno.review@teste.com",
    "password": "Senha123",
    "name": "Aluno Review"
  }')
ID_ALUNO=$(echo "$ALUNO" | jq -r '.id')
echo -e "${GREEN}✅ Aluno criado: $ID_ALUNO${NC}"

# 6. LOGIN DO ALUNO
echo -e "\n${BLUE}6. LOGIN DO ALUNO${NC}"
TOKEN_ALUNO=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno.review@teste.com","password":"Senha123"}' \
  | jq -r '.access_token')
echo -e "${GREEN}✅ Login do aluno realizado${NC}"

# 7. MATRICULAR ALUNO
echo -e "\n${BLUE}7. MATRICULANDO ALUNO${NC}"
MATRICULA=$(curl -s -X POST http://localhost:3000/enrollments \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"$ID_CURSO\"}")
ID_MATRICULA=$(echo "$MATRICULA" | jq -r '.id')
echo -e "${GREEN}✅ Matrícula criada: $ID_MATRICULA${NC}"

# 8. COMPLETAR CONTEÚDO
echo -e "\n${BLUE}8. COMPLETANDO CONTEÚDO${NC}"
COMPLETION=$(curl -s -X POST http://localhost:3000/completions \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{\"contentId\":\"$ID_CONTENT\"}")
echo "$COMPLETION" | jq '.'

# 9. ATUALIZAR PROGRESSO
echo -e "\n${BLUE}9. ATUALIZANDO PROGRESSO${NC}"
PROGRESS=$(curl -s -X POST "http://localhost:3000/enrollments/$ID_MATRICULA/progress" \
  -H "Authorization: Bearer $TOKEN_ALUNO")
echo "$PROGRESS" | jq '.'

# 10. CRIAR REVIEW
echo -e "\n${BLUE}10. CRIANDO REVIEW${NC}"
REVIEW=$(curl -s -X POST http://localhost:3000/reviews \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"rating\": 5,
    \"comment\": \"Curso excelente! Material muito completo e didático.\"
  }")
echo "$REVIEW" | jq '.'
ID_REVIEW=$(echo "$REVIEW" | jq -r '.id')
echo -e "${GREEN}✅ Review criado: $ID_REVIEW${NC}"

# 11. ESTATÍSTICAS DO CURSO
echo -e "\n${BLUE}11. ESTATÍSTICAS DO CURSO${NC}"
curl -s -X GET "http://localhost:3000/reviews/course/$ID_CURSO/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 12. LISTAR REVIEWS DO CURSO
echo -e "\n${BLUE}12. LISTANDO REVIEWS DO CURSO${NC}"
curl -s -X GET "http://localhost:3000/reviews/course/$ID_CURSO" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 13. GERAR CERTIFICADO
echo -e "\n${BLUE}13. GERANDO CERTIFICADO${NC}"
CERT=$(curl -s -X POST "http://localhost:3000/certificates/generate/$ID_MATRICULA" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$CERT" | grep -q "Certificate already exists"; then
  echo -e "${YELLOW}ℹ️  Certificado já existe${NC}"
elif echo "$CERT" | grep -q "Course not completed"; then
  echo -e "${RED}❌ Curso não está concluído${NC}"
else
  echo "$CERT" | jq '.'
  echo -e "${GREEN}✅ Certificado gerado!${NC}"
fi

# 14. LISTAR CERTIFICADOS DO ALUNO
echo -e "\n${BLUE}14. LISTANDO CERTIFICADOS DO ALUNO${NC}"
curl -s -X GET "http://localhost:3000/certificates/user" \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  | jq '.'

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO!${NC}"
