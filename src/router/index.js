// ============================================================================
// ARQUIVO: router/index.js
//
// Este arquivo configura o sistema de rotas da aplicação.
// As rotas definem qual tela (componente) será exibida
// dependendo da URL acessada no navegador.
//
// Também podemos definir regras de acesso, por exemplo:
// permitir que apenas usuários logados acessem determinadas páginas.
// ============================================================================


// Importa funções do Vue Router.
// createRouter  -> cria o gerenciador de rotas da aplicação.
// createWebHashHistory -> define o tipo de navegação utilizando "#" na URL.
import { createRouter, createWebHashHistory } from 'vue-router'


// Importa a configuração de autenticação do Firebase.
// A variável "auth" permite verificar se existe um usuário logado.
import { auth } from '../firebase/config'


// Importa os componentes que representam as telas da aplicação.
// Cada componente corresponde a uma página do sistema.
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'


// ---------------------------------------------------------------------------
// DEFINIÇÃO DAS ROTAS
// ---------------------------------------------------------------------------
//
// Cada objeto dentro do array representa uma rota.
//
// Uma rota associa:
//   URL (path)  ->  Componente que será exibido
//
// Exemplo:
//
// /            -> HomeView
// /login       -> LoginView
// /dashboard   -> DashboardView
//
// A propriedade meta.requiresAuth é usada para indicar
// que uma rota exige que o usuário esteja logado.
//
const routes = [

  // Página inicial da aplicação
  {
    path: '/',          // endereço acessado no navegador
    component: HomeView // componente exibido
  },

  // Página de login
  {
    path: '/login',
    component: LoginView
  },

  // Página restrita (somente para usuários autenticados)
  {
    path: '/dashboard',
    component: DashboardView,

    // Metadado da rota usado para controle de acesso
    // Aqui informamos que esta página exige autenticação.
    meta: { requiresAuth: true }
  }
]


// ---------------------------------------------------------------------------
// CRIAÇÃO DO GERENCIADOR DE ROTAS
// ---------------------------------------------------------------------------

// Cria a instância do Vue Router utilizando as rotas definidas acima.
const router = createRouter({

  // Define o tipo de histórico de navegação.
  // createWebHashHistory utiliza URLs no formato:
  //
  // http://site.com/#/pagina
  //
  // Esse formato evita problemas de configuração no servidor,
  // pois tudo após o "#" é controlado pelo JavaScript.
  history: createWebHashHistory(),

  // Lista de rotas da aplicação
  routes
})
export default router


// ---------------------------------------------------------------------------
// CONTROLE DE ACESSO ÀS ROTAS (Navigation Guard)
// ---------------------------------------------------------------------------
//
// beforeEach é um "guard" global do Vue Router.
// Ele é executado sempre ANTES de mudar de página.
//
// Ou seja, toda vez que o usuário tenta navegar
// para outra rota, essa função é executada primeiro.
//
// Parâmetros:
//
// to   -> rota que o usuário deseja acessar
// from -> rota atual (de onde o usuário está vindo)
// next -> função que decide se a navegação pode continuar
//
// Exemplo:
//
// Usuário está em: /login
// tenta acessar:   /dashboard
//
// to.path   = "/dashboard"
// from.path = "/login"
//
router.beforeEach((to, from, next) => {

  // -----------------------------------------------------------------------
  // VERIFICAR SE A ROTA EXIGE AUTENTICAÇÃO
  // -----------------------------------------------------------------------
  //
  // to.matched contém um array com todas as rotas
  // que correspondem ao caminho atual.
  //
  // Isso é útil porque o Vue Router permite rotas aninhadas
  // (rotas pai e rotas filhas).
  //
  // O método some() percorre esse array e retorna TRUE
  // se encontrar pelo menos uma rota com:
  //
  // meta.requiresAuth = true
  //
  // Em outras palavras:
  // "Esta rota exige que o usuário esteja logado?"
  //
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)


  // -----------------------------------------------------------------------
  // VERIFICAR SE EXISTE USUÁRIO LOGADO
  // -----------------------------------------------------------------------
  //
  // auth.currentUser vem do Firebase Authentication.
  //
  // Retorno possível:
  //
  // objeto usuário -> existe usuário autenticado
  // null           -> ninguém está logado
  //
  const isAuthenticated = auth.currentUser


  // -----------------------------------------------------------------------
  // LÓGICA DE SEGURANÇA
  // -----------------------------------------------------------------------
  //
  // Se a rota exige autenticação
  // E não existe usuário logado
  //
  // então o acesso deve ser bloqueado.
  //
  if (requiresAuth && !isAuthenticated) {

    // next('/login') cancela a navegação atual
    // e redireciona o usuário para a página de login.
    next('/login')

  } else {

    // Caso contrário, a navegação é permitida.
    //
    // next() sem parâmetros significa:
    // "Pode continuar para a rota solicitada."
    next()
  }

})
