#!/bin/bash

echo "========================================="
echo "TESTE DE TENTATIVAS - SIMPLES"
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

# 2. CRIAR CURSO
echo -e "\n${BLUE}2. CRIANDO CURSO${NC}"
CURSO=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Teste Attempt",
    "slug": "curso-teste-attempt",
    "level": "beginner"
  }')
ID_CURSO=$(echo "$CURSO" | jq -r '.id')
echo -e "${GREEN}✅ Curso criado: $ID_CURSO${NC}"

# 3. CRIAR MÓDULO
echo -e "\n${BLUE}3. CRIANDO MÓDULO${NC}"
MODULO=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Módulo de Teste\",
    \"orderIndex\": 0
  }")
ID_MODULO=$(echo "$MODULO" | jq -r '.id')
echo -e "${GREEN}✅ Módulo criado: $ID_MODULO${NC}"

# 4. CRIAR CONTEÚDO QUIZ
echo -e "\n${BLUE}4. CRIANDO CONTEÚDO QUIZ${NC}"
CONTENT=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO\",
    \"title\": \"Quiz de Teste Simples\",
    \"type\": \"quiz\",
    \"orderIndex\": 0
  }")
ID_CONTENT=$(echo "$CONTENT" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo criado: $ID_CONTENT${NC}"

# 5. CRIAR QUIZ
echo -e "\n${BLUE}5. CRIANDO QUIZ${NC}"
QUIZ=$(curl -s -X POST http://localhost:3000/quizzes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contentId\": \"$ID_CONTENT\",
    \"passingScorePercentage\": 60,
    \"attemptsAllowed\": 3
  }")
echo "$QUIZ" | jq '.'
ID_QUIZ=$(echo "$QUIZ" | jq -r '.id')
echo -e "${GREEN}✅ Quiz criado: $ID_QUIZ${NC}"

# 6. CRIAR QUESTÃO
echo -e "\n${BLUE}6. CRIANDO QUESTÃO${NC}"
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
echo -e "${GREEN}✅ Questão criada: $ID_Q1${NC}"

# 7. CRIAR OPÇÕES
echo -e "\n${BLUE}7. CRIANDO OPÇÕES${NC}"
OP1=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q1\",
    \"optionText\": \"Brasília\",
    \"isCorrect\": true
  }")
ID_OP1=$(echo "$OP1" | jq -r '.id')
echo -e "${GREEN}✅ Opção correta: $ID_OP1${NC}"

OP2=$(curl -s -X POST http://localhost:3000/question-options \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"questionId\": \"$ID_Q1\",
    \"optionText\": \"São Paulo\",
    \"isCorrect\": false
  }")
echo -e "${GREEN}✅ Opção incorreta criada${NC}"

# 8. CRIAR ALUNO
echo -e "\n${BLUE}8. CRIANDO ALUNO${NC}"
ALUNO=$(curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno.attempt@teste.com",
    "password": "Senha123",
    "name": "Aluno Attempt"
  }')
ID_ALUNO=$(echo "$ALUNO" | jq -r '.id')
echo -e "${GREEN}✅ Aluno criado: $ID_ALUNO${NC}"

# 9. LOGIN DO ALUNO
echo -e "\n${BLUE}9. LOGIN DO ALUNO${NC}"
TOKEN_ALUNO=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno.attempt@teste.com","password":"Senha123"}' \
  | jq -r '.access_token')
echo -e "${GREEN}✅ Login do aluno realizado${NC}"

# 10. MATRICULAR ALUNO
echo -e "\n${BLUE}10. MATRICULANDO ALUNO${NC}"
MATRICULA=$(curl -s -X POST http://localhost:3000/enrollments \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\"
  }")
echo "$MATRICULA" | jq '.'
ID_MATRICULA=$(echo "$MATRICULA" | jq -r '.id')
echo -e "${GREEN}✅ Matrícula criada: $ID_MATRICULA${NC}"

# 11. INICIAR TENTATIVA
echo -e "\n${BLUE}11. INICIANDO TENTATIVA${NC}"
ATTEMPT=$(curl -s -X POST "http://localhost:3000/quiz-attempts/start/$ID_QUIZ" \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json")
echo "$ATTEMPT" | jq '.'
ID_ATTEMPT=$(echo "$ATTEMPT" | jq -r '.id')
echo -e "${GREEN}✅ Tentativa iniciada: $ID_ATTEMPT${NC}"

# 12. SUBMETER RESPOSTAS
if [ "$ID_ATTEMPT" != "null" ] && [ ! -z "$ID_ATTEMPT" ]; then
  echo -e "\n${BLUE}12. SUBMETENDO RESPOSTAS${NC}"
  RESULT=$(curl -s -X POST "http://localhost:3000/quiz-attempts/submit/$ID_ATTEMPT" \
    -H "Authorization: Bearer $TOKEN_ALUNO" \
    -H "Content-Type: application/json" \
    -d "{
      \"answers\": [
        {
          \"questionId\": \"$ID_Q1\",
          \"selectedOptionId\": \"$ID_OP1\"
        }
      ]
    }")
  echo "$RESULT" | jq '.'

  # 13. VERIFICAR RESULTADOS
  echo -e "\n${BLUE}13. VERIFICANDO RESULTADOS${NC}"
  curl -s -X GET "http://localhost:3000/quiz-attempts/$ID_ATTEMPT/results" \
    -H "Authorization: Bearer $TOKEN_ALUNO" \
    | jq '.'
else
  echo -e "${RED}❌ Tentativa não foi iniciada corretamente${NC}"
fi

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO!${NC}"
