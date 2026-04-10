// ============================================================================
// ARQUIVO: useAuthStore.js
// Este arquivo cria uma store global de autenticação.
// Tudo que estiver aqui poderá ser acessado por qualquer tela do sistema.
// ============================================================================


// Importa a função defineStore da biblioteca Pinia.
// defineStore é utilizada para criar uma store (armazenamento global de estado).
import { defineStore } from 'pinia'


// Importa a função signOut do Firebase Authentication.
// Essa função é responsável por encerrar a sessão do usuário (logout).
import { signOut } from 'firebase/auth'


// Importa a configuração de autenticação do Firebase.
// A variável "auth" foi criada no arquivo de configuração do Firebase.
// O caminho '../firebase/config' significa:
// - '..' volta um nível na estrutura de pastas
// - 'firebase/config' acessa o arquivo config.js dentro da pasta firebase
import { auth } from '../firebase/config'


// ----------------------------------------------------------------------------
// CRIAÇÃO DA STORE
// ----------------------------------------------------------------------------

// export permite que outros arquivos do projeto utilizem esta store.
// const cria uma constante chamada useAuthStore.
// defineStore('auth', {...}) cria uma store chamada "auth".
export const useAuthStore = defineStore('auth', {

  // --------------------------------------------------------------------------
  // STATE (ESTADO)
  // --------------------------------------------------------------------------
  // O state é responsável por armazenar os dados da store.
  // Ele é definido como uma função que retorna um objeto com as variáveis
  // que serão compartilhadas entre os componentes da aplicação.

  state: () => ({

    // user armazena as informações do usuário autenticado.
    // Quando ninguém está logado, o valor permanece null.
    // Após o login, esse campo recebe os dados do usuário.
    user: null,

    // authIsReady indica se o Firebase já verificou o estado da autenticação.
    // false significa que a verificação ainda está em andamento.
    // true significa que a verificação terminou e o sistema pode continuar.
    authIsReady: false

  }),


  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  // Actions são funções que modificam os dados do state.
  // Elas funcionam como operações que alteram o estado da store.

  actions: {

    // ----------------------------------------------------------------------
    // setUser(user)
    // ----------------------------------------------------------------------
    // Esta função recebe um parâmetro chamado "user".
    // Esse parâmetro pode conter os dados do usuário autenticado
    // ou null caso o usuário não esteja logado.
    setUser(user) {

      // this representa a própria store.
      // this.user refere-se à variável user definida no state.
      // Aqui estamos atualizando o usuário armazenado na store.
      this.user = user

      // Como o Vue utiliza reatividade, qualquer componente que
      // utilize authStore.user será atualizado automaticamente.
    },


    // ----------------------------------------------------------------------
    // setAuthReady()
    // ----------------------------------------------------------------------
    // Esta função informa que a verificação de autenticação foi concluída.
    // Ela não recebe parâmetros.
    setAuthReady() {

      // Altera o valor de authIsReady para true.
      // Isso indica que o sistema já pode liberar o acesso às telas.
      this.authIsReady = true
    },


    // ----------------------------------------------------------------------
    // logout()
    // ----------------------------------------------------------------------
    // Esta função realiza o logout do usuário.
    // async indica que a função executa operações assíncronas
    // (por exemplo, comunicação com um servidor).
    async logout() {

      // await faz o JavaScript esperar a conclusão do logout
      // antes de continuar executando o restante do código.
      await signOut(auth)

      // Após o logout no Firebase, removemos o usuário da store.
      // Isso indica para a aplicação que ninguém está autenticado.
      this.user = null

      // Quando user volta a ser null, os componentes que dependem
      // dessa informação serão atualizados automaticamente.
      // Por exemplo:
      // - menus de usuário podem desaparecer
      // - botões de login podem voltar a aparecer
      // - rotas protegidas podem bloquear o acesso
    }

  }

  // Caso fosse necessário criar valores derivados do state,
  // poderíamos adicionar a seção "getters" aqui.
  // Neste exemplo ela não foi utilizada.

})


// ============================================================================
// RESUMO DOS CONCEITOS UTILIZADOS
// ============================================================================

// import
// Utilizado para trazer funções ou objetos de outros arquivos.

// export
// Permite que outros arquivos utilizem o que foi definido neste arquivo.

// const
// Declara uma constante que não pode ser redeclarada.

// Arrow Function (() => {})
// Forma moderna e mais curta de declarar funções em JavaScript.

// Objetos ({ chave: valor })
// Estrutura utilizada para armazenar dados organizados em pares de chave e valor.

// this
// Refere-se à instância atual da store.

// async / await
// Utilizados para trabalhar com operações assíncronas,
// como chamadas de API ou comunicação com servidores.

// null
// Representa ausência de valor ou objeto inexistente.




// Conceito geral da store:
// A store funciona como um armazenamento global de dados.
// Todos os componentes da aplicação podem acessar ou reagir
// às mudanças feitas nesses dados.