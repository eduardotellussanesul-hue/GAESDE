# 🎓 GAESDE API - Plataforma de Cursos Online

API completa para plataforma de cursos online com arquitetura Clean Architecture, desenvolvida com NestJS, MongoDB e TypeScript.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Scripts Úteis](#scripts-úteis)
- [Deploy](#deploy)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## 🚀 Sobre o Projeto

**GAESDE API** é uma API RESTful para gerenciamento de cursos online, desenvolvida com foco em escalabilidade, manutenibilidade e boas práticas de desenvolvimento.

### Arquitetura

O projeto segue os princípios da **Clean Architecture**:

### Características Principais

- ✅ **Autenticação JWT** com roles (admin, instructor, student)
- ✅ **Gestão de Usuários** com avatar via Cloudinary
- ✅ **Catálogo de Cursos** com categorias hierárquicas
- ✅ **Estrutura Curricular** (cursos, módulos, conteúdos)
- ✅ **Matrículas e Progresso** automático
- ✅ **Quizzes e Avaliações** com múltiplos tipos de questões
- ✅ **Certificados** em PDF com verificação
- ✅ **Reviews e Avaliações** (1-5 estrelas)
- ✅ **Upload de Arquivos** (Cloudinary)
- ✅ **Documentação Swagger** interativa

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| NestJS | 11.x | Framework Node.js progressivo |
| TypeScript | 5.7.x | Superset tipado do JavaScript |
| MongoDB | 7.x | Banco de dados NoSQL |
| Mongoose | 9.x | ODM para MongoDB |
| JWT | 11.x | Autenticação via tokens |
| Passport | 0.7.x | Middleware de autenticação |
| Bcrypt | 6.x | Criptografia de senhas |

### Armazenamento e Documentação
| Tecnologia | Descrição |
|------------|-----------|
| Cloudinary | Upload e gerenciamento de arquivos |
| Swagger/OpenAPI | Documentação interativa da API |
| PDFKit | Geração de certificados em PDF |

### Ferramentas de Desenvolvimento
| Tecnologia | Descrição |
|------------|-----------|
| ESLint | Linting de código |
| Prettier | Formatação de código |
| Jest | Testes unitários e de integração |

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v20.x ou superior)
- [npm](https://www.npmjs.com/) (v10.x ou superior)
- [MongoDB](https://www.mongodb.com/) (v7.x ou superior) ou [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Git](https://git-scm.com/) (opcional, para clonar o repositório)

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/eduardotellussanesul-hue/GAESDE.git
cd GAESDE/gaesde-api

# Instalar MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Iniciar MongoDB
sudo systemctl start mongodb

# Verificar se está rodando
sudo systemctl status mongodb

# Modo watch (recarregamento automático)
npm run start:dev

# Modo debug
npm run start:debug