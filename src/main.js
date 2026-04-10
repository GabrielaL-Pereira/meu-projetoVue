// Ponto de entrada do app (o "primeiro arquivo" que roda no navegador)
// Se tivesse um "botao ligar", seria aqui.
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import App from './App.vue'
import router from './router'
import { auth } from './firebase/config'
import { useAuthStore } from './stores/authStore'
import './style.css'

// Pinia = nossa "memoria global" do app

const pinia = createPinia()
let app

// Espera o Firebase "acordar" e dizer quem esta logado
// Isso evita o efeito "flash": rota protegida abre e fecha rapido
onAuthStateChanged(auth, (user) => {
  const authStore = useAuthStore(pinia)
  // Guarda o usuario (ou null) no Pinia
  authStore.setUser(user)
  // Marca que o Firebase ja respondeu
  authStore.setAuthReady()

  // Monta o app uma unica vez, depois do estado estar pronto
  if (!app) {
    app = createApp(App)
    app.use(pinia)
   app.use(router)
    app.mount('#app')
  }
})
