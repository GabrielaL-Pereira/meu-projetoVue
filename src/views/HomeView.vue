<script setup>
/**
 * HomeView.vue — Tela Inicial
 *
 * Propósito: exibir uma tela de boas-vindas simples que mostra
 * o estado de autenticação do usuário em tempo real.
 *
 * Conceitos demonstrados neste componente:
 * 
 *  - Pinia: lendo estado de uma store (authStore)
 *  - computed(): derivar dados reativos a partir do estado
 */

// "computed" cria uma propriedade reativa derivada.
// Ela recalcula automaticamente quando a dependência muda.
import { computed } from 'vue'

// Importa a store de autenticação (Pinia).
// A store centraliza o estado de login para toda a aplicação.
import { useAuthStore } from '../stores/authStore'

// Obtém a instância da store. A partir daqui temos acesso
// a authStore.user, authStore.login(), authStore.logout() etc.
const authStore = useAuthStore()

// Propriedade computada: retorna o e-mail do usuário logado.
// O operador ?. (optional chaining) evita erro se user for null.
// O operador || define um valor padrão caso o e-mail não exista.
const userEmail = computed(() => authStore.user?.email || 'Nenhum usuario logado')
</script>

<template>
  <section class="home-container">

    <div class="card home-card">

      <h1>🏫 Escola</h1>

      <p class="boas-vindas">
        👋 Seja bem-vindo ao sistema da creche!
      </p>

      <div class="status-box">

        <p>
          <strong>Status:</strong>
          <span :class="authStore.user ? 'logado' : 'deslogado'">
            {{ authStore.user ? '🟢 Logado' : '🔴 Deslogado' }}
          </span>
        </p>

        <p class="email">
          📧 {{ userEmail }}
        </p>

      </div>

      <div class="acoes-home">
        <router-link to="/login" class="btn">🔐 Ir para Login</router-link>
        <router-link to="/dashboard" class="btn secondary">📊 Dashboard</router-link>
      </div>

    </div>

  </section>
</template>