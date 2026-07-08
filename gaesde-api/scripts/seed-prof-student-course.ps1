$ErrorActionPreference = 'Stop'

function Invoke-Api {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [object]$Body,
    [string]$Token
  )

  $headers = @{}
  if ($Token) { $headers['Authorization'] = "Bearer $Token" }

  if ($Body -ne $null) {
    $jsonBody = $Body | ConvertTo-Json -Depth 20 -Compress
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -ContentType 'application/json' -Body $jsonBody
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

$base = 'http://localhost:3000'

# 1) Login admin
$adminLogin = Invoke-Api -Method 'POST' -Url "$base/users/login" -Body @{ email = 'admin@gaesde.com'; password = 'Admin@123456' }
$adminToken = $adminLogin.access_token
if (-not $adminToken) { throw 'Falha ao obter token do admin.' }

# 2) Buscar roles
$roles = Invoke-Api -Method 'GET' -Url "$base/roles" -Token $adminToken
$instructorRole = $roles | Where-Object { $_.slug -eq 'instructor' } | Select-Object -First 1
$studentRole = $roles | Where-Object { $_.slug -eq 'student' } | Select-Object -First 1
if (-not $instructorRole -or -not $studentRole) { throw 'Roles instructor/student não encontradas.' }

# 3) Criar professor
$profEmail = 'professor.ia.lms@gaesde.com'
$profPassword = 'Professor@123'
try {
  $professor = Invoke-Api -Method 'POST' -Url "$base/users/register" -Token $adminToken -Body @{
    name = 'Professor Programacao'
    email = $profEmail
    password = $profPassword
    bio = 'Instrutor de programacao'
  }
} catch {
  $allUsers = Invoke-Api -Method 'GET' -Url "$base/users" -Token $adminToken
  $professor = $allUsers | Where-Object { $_.email -eq $profEmail } | Select-Object -First 1
  if (-not $professor) { throw }
}

# 4) Criar aluno
$studentEmail = 'aluno.ia.lms@gaesde.com'
$studentPassword = 'Aluno@123'
try {
  $student = Invoke-Api -Method 'POST' -Url "$base/users/register" -Token $adminToken -Body @{
    name = 'Aluno Programacao'
    email = $studentEmail
    password = $studentPassword
    bio = 'Aluno da trilha de programacao'
  }
} catch {
  $allUsers = Invoke-Api -Method 'GET' -Url "$base/users" -Token $adminToken
  $student = $allUsers | Where-Object { $_.email -eq $studentEmail } | Select-Object -First 1
  if (-not $student) { throw }
}

# 5) Atribuir roles
try { Invoke-Api -Method 'POST' -Url "$base/user-roles/assign" -Token $adminToken -Body @{ userId = $professor.id; roleId = $instructorRole.id } | Out-Null } catch {}
try { Invoke-Api -Method 'POST' -Url "$base/user-roles/assign" -Token $adminToken -Body @{ userId = $student.id; roleId = $studentRole.id } | Out-Null } catch {}

# 6) Login professor
$profLogin = Invoke-Api -Method 'POST' -Url "$base/users/login" -Body @{ email = $profEmail; password = $profPassword }
$profToken = $profLogin.access_token
if (-not $profToken) { throw 'Falha ao logar com professor.' }

# 7) Criar categoria (admin)
$slugSuffix = (Get-Date).ToString('yyyyMMddHHmmss')
$category = Invoke-Api -Method 'POST' -Url "$base/categories" -Token $adminToken -Body @{
  name = "Programacao Turma $slugSuffix"
  slug = "programacao-turma-$slugSuffix"
}

# 8) Criar curso
$course = Invoke-Api -Method 'POST' -Url "$base/courses" -Token $profToken -Body @{
  title = 'Curso de Programacao Completo'
  slug = "curso-programacao-completo-$slugSuffix"
  description = 'Curso focado em fundamentos de programacao e boas praticas.'
  level = 'beginner'
  price = 0
  categoryId = $category.id
}

# 9) Criar modulo
$module = Invoke-Api -Method 'POST' -Url "$base/modules" -Token $profToken -Body @{
  courseId = $course.id
  title = 'Modulo 1 - Fundamentos de Programacao'
  description = 'Conceitos essenciais para iniciar na programacao.'
  orderIndex = 0
}

# 10) Criar conteudo texto
$textContent = Invoke-Api -Method 'POST' -Url "$base/contents" -Token $profToken -Body @{
  moduleId = $module.id
  title = 'Introducao a Programacao'
  type = 'text'
  orderIndex = 0
  isFreePreview = $true
}
Invoke-Api -Method 'POST' -Url "$base/contents/$($textContent.id)/text" -Token $profToken -Body @{
  body = 'Programacao e o processo de criar instrucoes para resolver problemas com logica, algoritmos e estruturas de dados.'
} | Out-Null

# 11) Criar conteudo video
$videoContent = Invoke-Api -Method 'POST' -Url "$base/contents" -Token $profToken -Body @{
  moduleId = $module.id
  title = 'Video Aula - Variaveis e Tipos'
  type = 'video'
  orderIndex = 1
  isFreePreview = $false
  durationSeconds = 900
}
Invoke-Api -Method 'POST' -Url "$base/contents/$($videoContent.id)/video" -Token $profToken -Body @{
  videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  videoDurationSeconds = 900
} | Out-Null

# 12) Criar conteudo quiz e quiz
$quizContent = Invoke-Api -Method 'POST' -Url "$base/contents" -Token $profToken -Body @{
  moduleId = $module.id
  title = 'Quiz - Programacao Basica'
  type = 'quiz'
  orderIndex = 2
  isFreePreview = $false
}
$quiz = Invoke-Api -Method 'POST' -Url "$base/quizzes" -Token $profToken -Body @{
  contentId = $quizContent.id
  passingScorePercentage = 70
  attemptsAllowed = 3
  shuffleQuestions = $false
  timeLimitMinutes = 30
}

# 13) Criar 10 perguntas com 4 opcoes cada
$questionBank = @(
  @{ q='O que e uma variavel em programacao?'; correct='Um espaco nomeado para armazenar dados'; wrong=@('Um tipo de loop', 'Um erro de compilacao', 'Um comando de entrada') },
  @{ q='Qual estrutura e usada para repeticao?'; correct='for'; wrong=@('if', 'switch', 'try') },
  @{ q='Qual e a funcao do operador == ?'; correct='Comparar igualdade de valores'; wrong=@('Atribuir valor', 'Concatenar strings', 'Criar funcao') },
  @{ q='O que e um algoritmo?'; correct='Sequencia finita de passos para resolver um problema'; wrong=@('Apenas um codigo em Java', 'Um banco de dados', 'Uma linguagem de programacao') },
  @{ q='Qual estrutura decide caminhos no codigo?'; correct='if/else'; wrong=@('for/while', 'import/export', 'class/interface') },
  @{ q='Para que serve uma funcao?'; correct='Reutilizar um bloco de codigo'; wrong=@('Armazenar arquivos', 'Criar tabelas SQL', 'Definir permissao de usuario') },
  @{ q='Qual tipo representa verdadeiro ou falso?'; correct='boolean'; wrong=@('number', 'string', 'array') },
  @{ q='O que significa debugar?'; correct='Investigar e corrigir erros no codigo'; wrong=@('Publicar em producao', 'Apagar comentarios', 'Compactar arquivos') },
  @{ q='Qual estrutura guarda varios valores ordenados?'; correct='array'; wrong=@('if', 'return', 'throw') },
  @{ q='O que e compilacao?'; correct='Transformar codigo-fonte em codigo executavel/intermediario'; wrong=@('Executar testes automaticamente', 'Versionar com git', 'Desenhar telas') }
)

for ($i = 0; $i -lt $questionBank.Count; $i++) {
  $entry = $questionBank[$i]
  $question = Invoke-Api -Method 'POST' -Url "$base/questions" -Token $profToken -Body @{
    quizId = $quiz.id
    type = 'multiple_choice'
    questionText = $entry.q
    points = 1
    orderIndex = $i
  }

  $options = @($entry.correct) + $entry.wrong
  foreach ($opt in $options) {
    Invoke-Api -Method 'POST' -Url "$base/question-options" -Token $profToken -Body @{
      questionId = $question.id
      optionText = $opt
      isCorrect = ($opt -eq $entry.correct)
    } | Out-Null
  }
}

# 14) Publicar curso
Invoke-Api -Method 'POST' -Url "$base/courses/$($course.id)/publish" -Token $profToken | Out-Null

# 15) Vincular aluno ao curso (admin)
$enrollment = Invoke-Api -Method 'POST' -Url "$base/enrollments/assign" -Token $adminToken -Body @{
  userId = $student.id
  courseId = $course.id
}

# 16) Resumo final
[pscustomobject]@{
  professor = [pscustomobject]@{ id = $professor.id; email = $profEmail; password = $profPassword }
  aluno = [pscustomobject]@{ id = $student.id; email = $studentEmail; password = $studentPassword }
  curso = [pscustomobject]@{ id = $course.id; title = $course.title; slug = $course.slug }
  modulo = [pscustomobject]@{ id = $module.id; title = $module.title }
  conteudo_texto = [pscustomobject]@{ id = $textContent.id; title = $textContent.title }
  conteudo_video = [pscustomobject]@{ id = $videoContent.id; title = $videoContent.title }
  conteudo_quiz = [pscustomobject]@{ id = $quizContent.id; title = $quizContent.title }
  quiz = [pscustomobject]@{ id = $quiz.id; perguntas = 10; opcoesPorPergunta = 4 }
  matricula = [pscustomobject]@{ id = $enrollment.id; status = $enrollment.status }
} | ConvertTo-Json -Depth 8
