#!/bin/bash

echo "========================================="
echo "TESTE DE QUIZZES E QUESTÕES"
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

# 2. CRIAR CURSO E MÓDULO
echo -e "\n${BLUE}2. CRIANDO CURSO E MÓDULO${NC}"

CATEGORIA=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Quiz","slug":"teste-quiz"}')
ID_CATEGORIA=$(echo "$CATEGORIA" | jq -r '.id')

CURSO=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Curso com Quiz\",
    \"slug\": \"curso-quiz\",
    \"level\": \"beginner\",
    \"categoryId\": \"$ID_CATEGORIA\"
  }")
ID_CURSO=$(echo "$CURSO" | jq -r '.id')

MODULO=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Módulo de Quiz\",
    \"orderIndex\": 0
  }")
ID_MODULO=$(echo "$MODULO" | jq -r '.id')

echo -e "${GREEN}✅ Curso e módulo criados${NC}"

# 3. CRIAR CONTEÚDO DO TIPO QUIZ
echo -e "\n${BLUE}3. CRIANDO CONTEÚDO DO TIPO QUIZ${NC}"
CONTENT=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Quiz de Programação\",
    \"type\": \"quiz\",
    \"orderIndex\": 0,
    \"isFreePreview\": false
  }")
ID_CONTENT=$(echo "$CONTENT" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo criado: $ID_CONTENT${NC}"

# 4. CRIAR QUIZ
echo -e "\n${BLUE}4. CRIANDO QUIZ${NC}"
QUIZ=$(curl -s -X POST http://localhost:3000/quizzes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contentId\": \"$ID_CONTENT\",
    \"passingScorePercentage\": 70,
    \"attemptsAllowed\": 3,
    \"shuffleQuestions\": true,
    \"timeLimitMinutes\": 30
  }")
echo "$QUIZ" | jq '.'
ID_QUIZ=$(echo "$QUIZ" | jq -r '.id')
echo -e "${GREEN}✅ Quiz criado: $ID_QUIZ${NC}"

# 5. CRIAR QUESTÕES
echo -e "\n${BLUE}5. CRIANDO QUESTÕES${NC}"

echo -e "${YELLOW}5.1 Questão 1: Múltipla Escolha${NC}"
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
echo "$Q1" | jq '.'
ID_Q1=$(echo "$Q1" | jq -r '.id')

echo -e "${YELLOW}5.2 Questão 2: Verdadeiro/Falso${NC}"
Q2=$(curl -s -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"quizId\": \"$ID_QUIZ\",
    \"type\": \"true_false\",
    \"questionText\": \"A Terra é plana?\",
    \"points\": 1,
    \"orderIndex\": 1
  }")
echo "$Q2" | jq '.'
ID_Q2=$(echo "$Q2" | jq -r '.id')

echo -e "${YELLOW}5.3 Questão 3: Múltipla Escolha${NC}"
Q3=$(curl -s -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"quizId\": \"$ID_QUIZ\",
    \"type\": \"multiple_choice\",
    \"questionText\": \"Quais são linguagens de programação?\",
    \"points\": 3,
    \"orderIndex\": 2
  }")
echo "$Q3" | jq '.'
ID_Q3=$(echo "$Q3" | jq -r '.id')

# 6. ADICIONAR OPÇÕES
echo -e "\n${BLUE}6. ADICIONANDO OPÇÕES${NC}"

echo -e "${YELLOW}6.1 Opções da Questão 1${NC}"
OP1=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q1\",
    \"optionText\": \"Brasília\",
    \"isCorrect\": true
  }")
echo "$OP1" | jq '.'

OP2=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q1\",
    \"optionText\": \"São Paulo\",
    \"isCorrect\": false
  }")
echo "$OP2" | jq '.'

echo -e "${YELLOW}6.2 Opções da Questão 2${NC}"
OP3=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q2\",
    \"optionText\": \"Verdadeiro\",
    \"isCorrect\": false
  }")
echo "$OP3" | jq '.'

OP4=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q2\",
    \"optionText\": \"Falso\",
    \"isCorrect\": true
  }")
echo "$OP4" | jq '.'

echo -e "${YELLOW}6.3 Opções da Questão 3${NC}"
OP5=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q3\",
    \"optionText\": \"JavaScript\",
    \"isCorrect\": true
  }")
echo "$OP5" | jq '.'

OP6=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q3\",
    \"optionText\": \"Python\",
    \"isCorrect\": true
  }")
echo "$OP6" | jq '.'

OP7=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q3\",
    \"optionText\": \"HTML\",
    \"isCorrect\": false
  }")
echo "$OP7" | jq '.'

# 7. BUSCAR QUIZ COMPLETO
echo -e "\n${BLUE}7. BUSCANDO QUIZ COMPLETO${NC}"
curl -s -X GET "http://localhost:3000/quizzes/content/$ID_CONTENT/full" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 8. LISTAR QUESTÕES DO QUIZ
echo -e "\n${BLUE}8. LISTANDO QUESTÕES DO QUIZ${NC}"
curl -s -X GET "http://localhost:3000/questions/quiz/$ID_QUIZ" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

echo -e "\n${GREEN}✅ TESTE DE QUIZZES CONCLUÍDO!${NC}"
echo "========================================="
