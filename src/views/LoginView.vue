<script setup>
// Tela de login simples com email e senha
// Aqui o aluno consegue criar conta e entrar sem complicacao.
// O objetivo e so testar o fluxo, nao fazer design perfeito.
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { auth } from '../firebase/config'

const router = useRouter()

// Campos do formulario (ligados nos inputs com v-model)
const email = ref('')
const senha = ref('')
const erro = ref('')

// Entrar com email e senha
// Se der erro, mostramos uma msg amigavel
const entrar = async () => {
  erro.value = ''
  try {
    // Firebase verifica email + senha
    await signInWithEmailAndPassword(auth, email.value, senha.value)
    // Deu certo? manda para o dashboard
    router.push('/dashboard')
  } catch (e) {
    erro.value = 'Nao foi possivel entrar. Verifique email e senha.'
  }
}

// Criar conta simples
// Depois de cadastrar, ja manda pro dashboard
const registrar = async () => {
  erro.value = ''
  try {
    // Firebase cria o usuario
    await createUserWithEmailAndPassword(auth, email.value, senha.value)
    // Depois de criar, ja vamos direto para o dashboard
    router.push('/dashboard')
  } catch (e) {
    erro.value = 'Nao foi possivel cadastrar. Verifique os dados.'
  }
}
</script>

<template>
  <section class="login-container">
    <div class="card login-card">

      <h1>🎒 Bem-vindo!</h1>
      <p class="muted">Acesse o sistema da creche</p>

      <label class="field">
        📧 Email
        <input v-model="email" type="email" placeholder="professor@email.com" />
      </label>

      <label class="field">
        🔒 Senha
        <input v-model="senha" type="password" placeholder="mínimo 6 caracteres" />
      </label>

      <div class="actions">
        <button @click="entrar">Entrar</button>
        <button class="secondary" @click="registrar">
          Criar conta
        </button>
      </div>

      <p v-if="erro" class="error">
        ⚠️ {{ erro }}
      </p>

    </div>
  </section>
</template>