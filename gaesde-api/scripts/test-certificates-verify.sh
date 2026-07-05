#!/bin/bash

echo "========================================="
echo "VERIFICANDO CERTIFICADO REAL"
echo "========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Login do aluno
echo -e "\n${BLUE}1. FAZENDO LOGIN DO ALUNO${NC}"
TOKEN_ALUNO=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno.review@teste.com","password":"Senha123"}' \
  | jq -r '.access_token')

if [ "$TOKEN_ALUNO" == "null" ] || [ -z "$TOKEN_ALUNO" ]; then
  echo -e "${RED}❌ Falha no login do aluno${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login do aluno realizado${NC}"

# 2. Buscar certificados do aluno
echo -e "\n${BLUE}2. BUSCANDO CERTIFICADOS DO ALUNO${NC}"
CERT_LIST=$(curl -s -X GET "http://localhost:3000/certificates/user" \
  -H "Authorization: Bearer $TOKEN_ALUNO")

TOTAL=$(echo "$CERT_LIST" | jq '. | length')
echo -e "${GREEN}✅ Total de certificados: $TOTAL${NC}"

if [ "$TOTAL" -gt 0 ]; then
  # Pegar o primeiro certificado
  CERT=$(echo "$CERT_LIST" | jq -r '.[0]')
  VERIFICATION_CODE=$(echo "$CERT" | jq -r '.verificationCode')
  CERTIFICATE_URL=$(echo "$CERT" | jq -r '.certificateUrl')
  
  echo -e "\n📧 Código: ${YELLOW}$VERIFICATION_CODE${NC}"
  echo -e "🔗 URL: ${YELLOW}$CERTIFICATE_URL${NC}"
  
  # 3. Verificar o certificado com o código real (rota pública)
  echo -e "\n${BLUE}3. VERIFICANDO CERTIFICADO (público)${NC}"
  RESULT=$(curl -s -X GET "http://localhost:3000/certificates/verify/$VERIFICATION_CODE")
  
  # Verificar se o certificado é válido
  IS_VALID=$(echo "$RESULT" | jq -r '.valid')
  
  if [ "$IS_VALID" == "true" ]; then
    echo -e "${GREEN}✅ Certificado VÁLIDO!${NC}"
    echo "$RESULT" | jq '.'
  else
    echo -e "${RED}❌ Certificado inválido${NC}"
    echo "$RESULT" | jq '.'
  fi
  
  # 4. Buscar certificado por código (rota autenticada)
  echo -e "\n${BLUE}4. BUSCANDO CERTIFICADO POR CÓDIGO${NC}"
  RESULT2=$(curl -s -X GET "http://localhost:3000/certificates/code/$VERIFICATION_CODE" \
    -H "Authorization: Bearer $TOKEN_ALUNO")
  
  if echo "$RESULT2" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Certificado encontrado por código${NC}"
    echo "$RESULT2" | jq '.'
  else
    echo -e "${RED}❌ Erro ao buscar certificado${NC}"
    echo "$RESULT2" | jq '.'
  fi
  
  # 5. Verificar a URL do certificado
  echo -e "\n${BLUE}5. VERIFICANDO URL DO CERTIFICADO${NC}"
  echo -e "URL: $CERTIFICATE_URL"
  
  # Fazer uma requisição HEAD para verificar se a URL existe
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CERTIFICATE_URL")
  if [ "$STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Certificado acessível (HTTP $STATUS)${NC}"
  else
    echo -e "${YELLOW}⚠️  Certificado não acessível (HTTP $STATUS)${NC}"
  fi
  
else
  echo -e "${YELLOW}ℹ️  Nenhum certificado encontrado para o aluno${NC}"
fi

# 6. Teste com código inválido
echo -e "\n${BLUE}6. TESTANDO COM CÓDIGO INVÁLIDO${NC}"
RESULT3=$(curl -s -X GET "http://localhost:3000/certificates/verify/codigo-invalido-123")
echo "$RESULT3" | jq '.'

echo -e "\n${GREEN}✅ TESTE CONCLUÍDO!${NC}"
