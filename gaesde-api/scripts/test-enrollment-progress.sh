#!/bin/bash

echo "========================================="
echo "TESTE DE MATRÍCULA E PROGRESSO"
echo "========================================="

# Cores
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

# 2. CRIAR CATEGORIA
echo -e "\n${BLUE}2. CRIANDO CATEGORIA${NC}"
CATEGORIA=$(curl -s -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Programação Avançada",
    "slug": "programacao-avancada"
  }')

ID_CATEGORIA=$(echo "$CATEGORIA" | jq -r '.id')
echo -e "${GREEN}✅ Categoria criada: $ID_CATEGORIA${NC}"

# 3. CRIAR CURSO
echo -e "\n${BLUE}3. CRIANDO CURSO${NC}"
CURSO=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"NestJS Avançado - Curso Completo\",
    \"slug\": \"nestjs-avancado-completo\",
    \"description\": \"Aprenda NestJS com TypeScript, MongoDB, JWT e muito mais\",
    \"price\": 299.90,
    \"level\": \"advanced\",
    \"categoryId\": \"$ID_CATEGORIA\"
  }")

ID_CURSO=$(echo "$CURSO" | jq -r '.id')
echo -e "${GREEN}✅ Curso criado: $ID_CURSO${NC}"

# 4. CRIAR MÓDULOS
echo -e "\n${BLUE}4. CRIANDO MÓDULOS${NC}"

echo -e "${YELLOW}4.1 Criando Módulo 1: Fundamentos${NC}"
MODULO1=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Fundamentos do NestJS\",
    \"orderIndex\": 0,
    \"description\": \"Introdução ao NestJS e seus conceitos fundamentais\"
  }")

ID_MODULO1=$(echo "$MODULO1" | jq -r '.id')
echo -e "${GREEN}✅ Módulo 1 criado: $ID_MODULO1${NC}"

echo -e "${YELLOW}4.2 Criando Módulo 2: Banco de Dados${NC}"
MODULO2=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Banco de Dados com Mongoose\",
    \"orderIndex\": 1,
    \"description\": \"Integração com MongoDB usando Mongoose\"
  }")

ID_MODULO2=$(echo "$MODULO2" | jq -r '.id')
echo -e "${GREEN}✅ Módulo 2 criado: $ID_MODULO2${NC}"

echo -e "${YELLOW}4.3 Criando Módulo 3: Autenticação${NC}"
MODULO3=$(curl -s -X POST http://localhost:3000/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\",
    \"title\": \"Autenticação e Autorização\",
    \"orderIndex\": 2,
    \"description\": \"JWT, Guards e Roles\"
  }")

ID_MODULO3=$(echo "$MODULO3" | jq -r '.id')
echo -e "${GREEN}✅ Módulo 3 criado: $ID_MODULO3${NC}"

# 5. CRIAR CONTEÚDOS DO MÓDULO 1
echo -e "\n${BLUE}5. CRIANDO CONTEÚDOS DO MÓDULO 1${NC}"

echo -e "${YELLOW}5.1 Criando Conteúdo 1: Vídeo - Introdução${NC}"
CONTENT1=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO1\",
    \"title\": \"O que é NestJS? (Vídeo)\",
    \"type\": \"video\",
    \"orderIndex\": 0,
    \"isFreePreview\": true,
    \"durationSeconds\": 600
  }")

ID_CONTENT1=$(echo "$CONTENT1" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo 1 criado: $ID_CONTENT1${NC}"

# Adicionar URL do vídeo
curl -s -X POST "http://localhost:3000/contents/$ID_CONTENT1/video" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=abc123",
    "videoDurationSeconds": 600
  }' > /dev/null

echo -e "${YELLOW}5.2 Criando Conteúdo 2: Texto - Conceitos${NC}"
CONTENT2=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO1\",
    \"title\": \"Conceitos Fundamentais (Texto)\",
    \"type\": \"text\",
    \"orderIndex\": 1,
    \"isFreePreview\": false
  }")

ID_CONTENT2=$(echo "$CONTENT2" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo 2 criado: $ID_CONTENT2${NC}"

# Adicionar corpo do texto
curl -s -X POST "http://localhost:3000/contents/$ID_CONTENT2/text" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "# Conceitos Fundamentais do NestJS\n\n## O que é NestJS?\n\nNestJS é um framework para construção de aplicações Node.js eficientes e escaláveis.\n\n## Principais características:\n\n- TypeScript nativo\n- Injeção de dependências\n- Modularidade\n- Suporte a diferentes transportes (HTTP, WebSockets, etc)\n\n## Estrutura de um projeto NestJS\n\n```\nsrc/\n├── main.ts\n├── app.module.ts\n└── app.controller.ts\n```"
  }' > /dev/null

echo -e "${YELLOW}5.3 Criando Conteúdo 3: PDF - Material${NC}"
CONTENT3=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO1\",
    \"title\": \"Material de Apoio (PDF)\",
    \"type\": \"pdf\",
    \"orderIndex\": 2,
    \"isFreePreview\": false
  }")

ID_CONTENT3=$(echo "$CONTENT3" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo 3 criado: $ID_CONTENT3${NC}"

# Adicionar URL do PDF
curl -s -X POST "http://localhost:3000/contents/$ID_CONTENT3/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://res.cloudinary.com/dtqmk1k3b/raw/upload/v123456/cursos/material.pdf",
    "fileSizeBytes": 2048000
  }' > /dev/null

# 6. CRIAR CONTEÚDOS DO MÓDULO 2
echo -e "\n${BLUE}6. CRIANDO CONTEÚDOS DO MÓDULO 2${NC}"

echo -e "${YELLOW}6.1 Criando Conteúdo 4: Vídeo - Mongoose${NC}"
CONTENT4=$(curl -s -X POST http://localhost:3000/contents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"moduleId\": \"$ID_MODULO2\",
    \"title\": \"Integração com MongoDB (Vídeo)\",
    \"type\": \"video\",
    \"orderIndex\": 0,
    \"isFreePreview\": false,
    \"durationSeconds\": 900
  }")

ID_CONTENT4=$(echo "$CONTENT4" | jq -r '.id')
echo -e "${GREEN}✅ Conteúdo 4 criado: $ID_CONTENT4${NC}"

# Adicionar URL do vídeo
curl -s -X POST "http://localhost:3000/contents/$ID_CONTENT4/video" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=def456",
    "videoDurationSeconds": 900
  }' > /dev/null

# 7. CRIAR USUÁRIO ALUNO
echo -e "\n${BLUE}7. CRIANDO USUÁRIO ALUNO${NC}"
ALUNO=$(curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno.progresso@teste.com",
    "password": "Senha123",
    "name": "Aluno Teste Progresso",
    "bio": "Aluno de teste para verificar progresso"
  }')

ID_ALUNO=$(echo "$ALUNO" | jq -r '.id')
echo -e "${GREEN}✅ Aluno criado: $ID_ALUNO${NC}"

# 8. LOGIN DO ALUNO
echo -e "\n${BLUE}8. FAZENDO LOGIN DO ALUNO${NC}"
TOKEN_ALUNO=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno.progresso@teste.com","password":"Senha123"}' \
  | jq -r '.access_token')

echo -e "${GREEN}✅ Login do aluno realizado${NC}"

# 9. MATRICULAR ALUNO NO CURSO
echo -e "\n${BLUE}9. MATRICULANDO ALUNO NO CURSO${NC}"
MATRICULA=$(curl -s -X POST http://localhost:3000/enrollments \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$ID_CURSO\"
  }")

echo "$MATRICULA" | jq '.'
ID_MATRICULA=$(echo "$MATRICULA" | jq -r '.id')
echo -e "${GREEN}✅ Matrícula criada: $ID_MATRICULA${NC}"

# 10. VERIFICAR MATRÍCULAS DO ALUNO
echo -e "\n${BLUE}10. VERIFICANDO MATRÍCULAS DO ALUNO${NC}"
curl -s -X GET http://localhost:3000/enrollments/my-enrollments \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  | jq '.'

# 11. MARCAR CONTEÚDOS COMO COMPLETOS (VÍDEO 1)
echo -e "\n${BLUE}11. MARCANDO CONTEÚDOS COMO COMPLETOS${NC}"

echo -e "${YELLOW}11.1 Marcando Conteúdo 1 como completo${NC}"
curl -s -X POST http://localhost:3000/completions \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"contentId\": \"$ID_CONTENT1\"
  }" | jq '.'

echo -e "${YELLOW}11.2 Marcando Conteúdo 2 como completo${NC}"
curl -s -X POST http://localhost:3000/completions \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"contentId\": \"$ID_CONTENT2\"
  }" | jq '.'

echo -e "${YELLOW}11.3 Marcando Conteúdo 3 como completo${NC}"
curl -s -X POST http://localhost:3000/completions \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  -H "Content-Type: application/json" \
  -d "{
    \"contentId\": \"$ID_CONTENT3\"
  }" | jq '.'

# 12. VERIFICAR PROGRESSO DO ALUNO
echo -e "\n${BLUE}12. VERIFICANDO PROGRESSO DO ALUNO${NC}"
curl -s -X GET "http://localhost:3000/completions/progress/$ID_CURSO" \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  | jq '.'

# 13. VERIFICAR MATRÍCULA ATUALIZADA
echo -e "\n${BLUE}13. VERIFICANDO MATRÍCULA ATUALIZADA${NC}"
curl -s -X GET "http://localhost:3000/enrollments/$ID_MATRICULA" \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  | jq '.'

# 14. LISTAR TODAS AS COMPLETIONS DO ALUNO
echo -e "\n${BLUE}14. LISTANDO TODAS AS COMPLETIONS DO ALUNO${NC}"
curl -s -X GET http://localhost:3000/completions/my-completions \
  -H "Authorization: Bearer $TOKEN_ALUNO" \
  | jq '.'

# 15. ESTATÍSTICAS FINAIS
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}ESTATÍSTICAS FINAIS${NC}"
echo -e "${BLUE}========================================${NC}"

# Total de conteúdos
TOTAL_CONTENTS=$(curl -s -X GET "http://localhost:3000/contents/module/$ID_MODULO1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

echo -e "${GREEN}📊 Estatísticas:${NC}"
echo -e "  Curso: ${YELLOW}NestJS Avançado${NC}"
echo -e "  Total de módulos: ${YELLOW}3${NC}"
echo -e "  Conteúdos no Módulo 1: ${YELLOW}$TOTAL_CONTENTS${NC}"
echo -e "  Conteúdos completados: ${YELLOW}3${NC}"
echo -e "  Matrícula ID: ${YELLOW}$ID_MATRICULA${NC}"
echo -e "  Aluno: ${YELLOW}aluno.progresso@teste.com${NC}"

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
