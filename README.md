
# 🐾 PetCare - Sistema de Gestão para Pet Shop

## 📋 Sobre o Projeto

O PetCare é um sistema web desenvolvido para auxiliar na administração de pet shops, permitindo o gerenciamento de clientes, pets, serviços e atendimentos de forma prática e organizada.

O projeto foi desenvolvido como atividade da disciplina de Desenvolvimento de Sistemas, com o objetivo de aplicar conceitos de programação, banco de dados, autenticação de usuários e desenvolvimento de interfaces web.

---

## 🎯 Objetivos

* Facilitar o cadastro e gerenciamento de clientes.
* Controlar informações dos pets cadastrados.
* Registrar serviços e atendimentos realizados.
* Gerar relatórios para acompanhamento das atividades do pet shop.
* Fornecer uma interface moderna, intuitiva e responsiva.

---

## 🚀 Funcionalidades

### 🔐 Autenticação

* Login com e-mail e senha.
* Login com Google.
* Logout seguro.

### 📊 Dashboard

* Total de clientes cadastrados.
* Total de pets cadastrados.
* Total de atendimentos realizados.
* Faturamento total.
* Gráficos e indicadores de desempenho.

### 👥 Gestão de Clientes

* Cadastro de clientes.
* Edição de informações.
* Exclusão de registros.
* Pesquisa de clientes.

### 🐶 Gestão de Pets

* Cadastro de pets.
* Associação do pet ao seu responsável.
* Edição e exclusão de registros.
* Sistema de busca.

### ✂️ Gestão de Serviços

* Cadastro de serviços.
* Atualização de valores.
* Exclusão de serviços.
* Pesquisa de serviços.

### 📅 Gestão de Atendimentos

* Registro de atendimentos.
* Histórico de serviços realizados.
* Consulta de atendimentos por período.

### 📈 Relatórios

* Quantidade de clientes cadastrados.
* Quantidade de pets cadastrados.
* Quantidade de atendimentos realizados.
* Relatório financeiro.
* Relatórios por período.

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Firebase Authentication
* Firebase Firestore
* Chart.js
* GitHub

---

## 🗄️ Estrutura do Banco de Dados

### Clientes

* Nome
* CPF
* Telefone
* E-mail
* Endereço

### Pets

* Nome
* Espécie
* Raça
* Idade
* Sexo
* Peso
* Responsável

### Serviços

* Nome
* Descrição
* Valor

### Atendimentos

* Cliente
* Pet
* Serviço
* Data
* Observações
* Valor

---

## 📂 Estrutura do Projeto

```text
src/
├── components/
├── pages/
├── services/
├── firebase/
├── assets/
├── css/
└── js/
```

---

## 💡 Diferenciais do Sistema

* Interface moderna e responsiva.
* Dashboard com indicadores em tempo real.
* Integração com Google Login.
* Sistema de busca dinâmica.
* Relatórios para apoio à gestão do pet shop.

---

## 👨‍💻 Equipe

Projeto desenvolvido pelos alunos da turma de Informática para a disciplina de Desenvolvimento de Sistemas.

Participantes:

* Kyara

---

## 📄 Licença

esse projeto está licenciado sob a licença MIT.

MIT License

Copyright (c) 2026 KyaraSouza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
