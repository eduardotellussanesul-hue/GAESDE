#!/bin/bash

echo "========================================="
echo "TESTE DE TENTATIVAS E SUBMISSÕES"
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

# 2. CRIAR CURSO E CONTEÚDO
echo -e "\n${BLUE}2. CRIANDO CURSO E CONTEÚDO${NC}"

CATEGORIA=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Tentativas","slug":"teste-tentativas"}')
ID_CATEGORIA=$(echo "$CATEGORIA" | jq -r '.id')

CURSO=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Curso com Quiz e Assignment\",
    \"slug\": \"curso-quiz-assignment\",
    \"level\": \"beginner\",
    \"categoryId\": \"$ID_CATEGORIA\"
  }")
ID_CURSO=$(echo "$CURSO" | jq -r '.id')

MODULO=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Módulo de Teste\",
    \"orderIndex\": 0
  }")
ID_MODULO=$(echo "$MODULO" | jq -r '.id')

# Criar conteúdo Quiz
CONTENT_QUIZ=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Quiz de Teste\",
    \"type\": \"quiz\",
    \"orderIndex\": 0
  }")
ID_CONTENT_QUIZ=$(echo "$CONTENT_QUIZ" | jq -r '.id')

# Criar conteúdo Assignment
CONTENT_ASSIGN=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Assignment de Teste\",
    \"type\": \"assignment\",
    \"orderIndex\": 1
  }")
ID_CONTENT_ASSIGN=$(echo "$CONTENT_ASSIGN" | jq -r '.id')

# 3. CRIAR QUIZ
echo -e "\n${BLUE}3. CRIANDO QUIZ${NC}"
QUIZ=$(curl -s -X POST http://localhost:3000/quizzes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contentId\": \"$ID_CONTENT_QUIZ\",
    \"passingScorePercentage\": 60,
    \"attemptsAllowed\": 3
  }")
ID_QUIZ=$(echo "$QUIZ" | jq -r '.id')
echo -e "${GREEN}✅ Quiz criado: $ID_QUIZ${NC}"

# 4. CRIAR QUESTÃO
echo -e "\n${BLUE}4. CRIANDO QUESTÃO${NC}"
Q1=$(curl -s -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"quizId\": \"$ID_QUIZ\",
    \"type\": \"multiple_choice\",
    \"questionText\": \"Qual é a capital do Brasil?\",
    \"points\": 2,
    \"orderIndex\": 0
  }")
ID_Q1=$(echo "$Q1" | jq -r '.id')

# Criar opções
curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"questionId\":\"$ID_Q1\",\"optionText\":\"Brasília\",\"isCorrect\":true}" > /dev/null
curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"questionId\":\"$ID_Q1\",\"optionText\":\"São Paulo\",\"isCorrect\":false}" > /dev/null

# 5. CRIAR ALUNO E MATRICULAR
echo -e "\n${BLUE}5. CRIANDO ALUNO E MATRICULANDO${NC}"
ALUNO=$(curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno.tentativas@teste.com",
    "password": "Senha123",
    "name": "Aluno Tentativas"
  }')
ID_ALUNO=$(echo "$ALUNO" | jq -r '.id')

TOKEN_ALUNO=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno.tentativas@teste.com","password":"Senha123"}' \
  | jq -r '.access_token')

MATRICULA=$(curl -s -X POST http://localhost:3000/enrollments \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"$ID_CURSO\"}")
ID_MATRICULA=$(echo "$MATRICULA" | jq -r '.id')

echo -e "${GREEN}✅ Aluno matriculado: $ID_MATRICULA${NC}"

# 6. INICIAR TENTATIVA
echo -e "\n${BLUE}6. INICIANDO TENTATIVA DO QUIZ${NC}"
ATTEMPT=$(curl -s -X POST "http://localhost:3000/quiz-attempts/start/$ID_QUIZ" \
  -H "Authorization: Bearer $TOKEN_ALUNO")
echo "$ATTEMPT" | jq '.'
ID_ATTEMPT=$(echo "$ATTEMPT" | jq -r '.id')
echo -e "${GREEN}✅ Tentativa iniciada: $ID_ATTEMPT${NC}"

# 7. SUBMETER RESPOSTAS
echo -e "\n${BLUE}7. SUBMETENDO RESPOSTAS${NC}"
RESULT=$(curl -s -X POST "http://localhost:3000/quiz-attempts/submit/$ID_ATTEMPT" \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"answers\": [
      {
        \"questionId\": \"$ID_Q1\",
        \"selectedOptionId\": \"ID_DA_OPCAO_CORRETA\"
      }
    ]
  }")
echo "$RESULT" | jq '.'

# 8. VERIFICAR RESULTADOS
echo -e "\n${BLUE}8. VERIFICANDO RESULTADOS${NC}"
curl -s -X GET "http://localhost:3000/quiz-attempts/$ID_ATTEMPT/results" \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  | jq '.'

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO!${NC}"
