<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()
const userEmail = computed(() => authStore.user?.email || 'Deslogado')
</script>

<template>
  <div class="layout">

    <!-- TOPO -->
    <header class="topbar">

      <h2>🏫 Centro de Educação Infantil</h2>

      <span class="user-info">
        👤 {{ userEmail }}
      </span>

    </header>

    <!-- MENU -->
    <nav class="menu">

      <router-link to="/" class="menu-item">
        🏠 Início
      </router-link>

      <router-link to="/login" class="menu-item">
        🔐 Login
      </router-link>

      <router-link to="/dashboard" class="menu-item">
        📊 Dashboard
      </router-link>

      <button 
        v-if="authStore.user" 
        class="menu-item logout"
        @click="authStore.logout()"
      >
        🚪 Sair
      </button>

    </nav>

    <main class="conteudo">
      <router-view></router-view>
    </main>

  </div>
</template>