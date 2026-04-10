<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const converterHora = (hora) => {
  if (!hora) return 0
  const [h, m] = hora.split(':')
  return Number(h) + Number(m) / 60
}

const calcularHorasNumero = (item) => {
  if (!item.entrada || !item.saida) return 0

  const entradaNum = converterHora(item.entrada)
  const saidaNum = converterHora(item.saida)
  const almocoInicio = converterHora(item.almoco)
  const almocoFim = converterHora(item.voltaAlmoco)

  return (saidaNum - entradaNum) - (almocoFim - almocoInicio)
}

const calcularHoras = (item) => {
  const total = calcularHorasNumero(item)
  const horas = Math.floor(total)
  const minutos = Math.round((total - horas) * 60)
  return `${horas}h ${minutos}min`
}

const calcularDiferenca = (item) => {
  const horasTrabalhadas = calcularHorasNumero(item)
  const esperado = Number(item.tipo)

  const diferenca = horasTrabalhadas - esperado

  const horas = Math.floor(Math.abs(diferenca))
  const minutos = Math.round((Math.abs(diferenca) - horas) * 60)

  if (diferenca === 0) return 'Carga completa'
  if (diferenca < 0) return `Faltaram ${horas}h ${minutos}min`

  return `+${horas}h ${minutos}min extra`
}

const verificarStatus = (item) => {
  const horas = calcularHorasNumero(item)
  const esperado = Number(item.tipo)

  if (horas < esperado) return 'menos'
  if (horas > esperado) return 'mais'
  return 'ok'
}

const formatarHoras = (valor) => {
  const horas = Math.floor(valor)
  const minutos = Math.round((valor - horas) * 60)
  return `${horas}h ${minutos}min`
}

const funcionario = ref('')
const entrada = ref('')
const cafeManha = ref('')
const almoco = ref('')
const voltaAlmoco = ref('')
const cafeTarde = ref('')
const saida = ref('')
const turno = ref('')
const tipo = ref('')
const funcionarios = ref([])
const aviso = ref('')
const editandoId = ref(null)
const mensagem = ref('')

let unsubscribe = null

const resumoFuncionarios = () => {

  let totalExtra = 0
  let totalFalta = 0

  const mapa = {}

  funcionarios.value.forEach(item => {

    const horas = calcularHorasNumero(item)
    const esperado = Number(item.tipo)
    const diferenca = horas - esperado

    if (!mapa[item.funcionario]) {
      mapa[item.funcionario] = {
        nome: item.funcionario,
        extra: 0,
        falta: 0
      }
    }

    if (diferenca > 0) {
      mapa[item.funcionario].extra += diferenca
      totalExtra += diferenca
    } else if (diferenca < 0) {
      mapa[item.funcionario].falta += Math.abs(diferenca)
      totalFalta += Math.abs(diferenca)
    }

  })

  return {
    lista: Object.values(mapa),
    totalExtra,
    totalFalta
  }
}

const resumo = computed(() => resumoFuncionarios())

const resumoPorFuncionario = (nome) => {

  let totalExtra = 0
  let totalFalta = 0

  funcionarios.value.forEach(item => {

    if (item.funcionario !== nome) return

    const horas = calcularHorasNumero(item)
    const esperado = Number(item.tipo)
    const diferenca = horas - esperado

    if (diferenca > 0) {
      totalExtra += diferenca
    } else if (diferenca < 0) {
      totalFalta += Math.abs(diferenca)
    }

  })

  return {
    extra: totalExtra,
    falta: totalFalta
  }
}

const formatarHorario = (valor) => {

  valor = valor.replace(/\D/g, '')

  valor = valor.slice(0, 4)

  if (valor.length >= 3) {
    valor = valor.slice(0, 2) + ':' + valor.slice(2)
  }

  return valor
}

const excluirFuncionario = async (id) => {
  await deleteDoc(doc(db, 'financas', id))

  mensagem.value = 'Funcionário excluído com sucesso!'

  setTimeout(() => {
    mensagem.value = ''
  }, 3000)
}

const editarFuncionario = (item) => {
  funcionario.value = item.funcionario
  turno.value = item.turno
  entrada.value = item.entrada
  cafeManha.value = item.cafeManha
  almoco.value = item.almoco
  voltaAlmoco.value = item.voltaAlmoco
  cafeTarde.value = item.cafeTarde
  saida.value = item.saida
  tipo.value = item.tipo
  editandoId.value = item.id
}

const formatoHorario = /^([01]\d|2[0-3]):([0-5]\d)$/

const salvarFuncionario = async () => {

  aviso.value = ''

  if (
    !funcionario.value || !turno.value || !tipo.value ||
    !entrada.value || !cafeManha.value || !almoco.value ||
    !voltaAlmoco.value || !cafeTarde.value || !saida.value
  ) {
    aviso.value = 'Preencha todos os campos.'
    return
  }

  if (
    !formatoHorario.test(entrada.value) ||
    !formatoHorario.test(cafeManha.value) ||
    !formatoHorario.test(almoco.value) ||
    !formatoHorario.test(voltaAlmoco.value) ||
    !formatoHorario.test(cafeTarde.value) ||
    !formatoHorario.test(saida.value)
  ) {
    aviso.value = 'Use formato 08:00 em todos os horários.'
    return
  }

  const entradaNum = converterHora(entrada.value)
  const almocoNum = converterHora(almoco.value)
  const voltaNum = converterHora(voltaAlmoco.value)
  const saidaNum = converterHora(saida.value)

  if (
    entradaNum >= almocoNum ||
    almocoNum >= voltaNum ||
    voltaNum >= saidaNum
  ) {
    aviso.value = 'Horários fora de ordem!'
    return
  }

  const tempoAlmoco = voltaNum - almocoNum
  if (tempoAlmoco < 0.5 || tempoAlmoco > 2) {
    aviso.value = 'Tempo de almoço inválido!'
    return
  }

  if (editandoId.value) {

    await updateDoc(doc(db, 'financas', editandoId.value), {
      funcionario: funcionario.value,
      turno: turno.value,
      entrada: entrada.value,
      cafeManha: cafeManha.value,
      almoco: almoco.value,
      voltaAlmoco: voltaAlmoco.value,
      cafeTarde: cafeTarde.value,
      saida: saida.value,
      tipo: tipo.value
    })

    mensagem.value = 'Funcionário atualizado com sucesso!'

  } else {

    await addDoc(collection(db, 'financas'), {
      funcionario: funcionario.value,
      turno: turno.value,
      entrada: entrada.value,
      cafeManha: cafeManha.value,
      almoco: almoco.value,
      voltaAlmoco: voltaAlmoco.value,
      cafeTarde: cafeTarde.value,
      saida: saida.value,
      tipo: tipo.value,
      userId: auth.currentUser.uid
    })

    mensagem.value = 'Funcionário cadastrado com sucesso!'
  }

  // ✅ limpar campos
  funcionario.value = ''
  entrada.value = ''
  cafeManha.value = ''
  almoco.value = ''
  voltaAlmoco.value = ''
  cafeTarde.value = ''
  saida.value = ''
  turno.value = ''
  tipo.value = ''
  editandoId.value = null

  // ✅ limpar mensagem depois de 3s
  setTimeout(() => {
    mensagem.value = ''
  }, 3000)
}

const ouvirFuncionarios = () => {
  const q = query(
    collection(db, 'financas'),
    where('userId', '==', auth.currentUser.uid)
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    funcionarios.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

onMounted(() => {
  if (auth.currentUser) ouvirFuncionarios()
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <section class="dashboard-container">

    <div class="card dashboard-card">

      <h1>📊 Painel da Creche</h1>
      <p class="muted">Controle de horários dos funcionários</p>

      <!-- FORMULÁRIO -->
      <div class="form-grid">

        <input v-model="funcionario" placeholder="👩‍🏫 Nome do funcionário" />

        <input :value="entrada" @input="entrada = formatarHorario($event.target.value)" placeholder="⏰ Entrada" />
        <input :value="cafeManha" @input="cafeManha = formatarHorario($event.target.value)" placeholder="☕ Café manhã" />
        <input :value="almoco" @input="almoco = formatarHorario($event.target.value)" placeholder="🍽️ Almoço" />
        <input :value="voltaAlmoco" @input="voltaAlmoco = formatarHorario($event.target.value)" placeholder="🔙 Volta almoço" />
        <input :value="cafeTarde" @input="cafeTarde = formatarHorario($event.target.value)" placeholder="🧃 Café tarde" />
        <input :value="saida" @input="saida = formatarHorario($event.target.value)" placeholder="🚪 Saída" />

        <select v-model="turno">
          <option value="">Turno</option>
          <option value="manhã">🌞 Manhã</option>
          <option value="tarde">🌤️ Tarde</option>
          <option value="noite">🌙 Noite</option>
          <option value="integral">📚 Integral</option>
        </select>

        <select v-model="tipo">
          <option value="">Carga horária</option>
          <option value="6">6h</option>
          <option value="8">8h</option>
        </select>

        <button class="btn-salvar" @click="salvarFuncionario">
          💾 Salvar
        </button>

      </div>

      <p v-if="aviso" class="error">⚠️ {{ aviso }}</p>
      <p v-if="mensagem" class="sucesso">✅ {{ mensagem }}</p>

    </div>

    <div class="card lista-card" v-if="funcionarios.length">

      <h2>👨‍👩‍👧 Funcionários</h2>

      <ul>
        <li v-for="item in funcionarios" :key="item.id">

          <div class="info">
            <span class="status" :class="verificarStatus(item)"></span>

            <div>
              <strong>{{ item.funcionario }}</strong>
              <p>🕒 {{ calcularHoras(item) }}</p>
              <p>📌 {{ calcularDiferenca(item) }}</p>
            </div>
          </div>

          <div class="acoes">
            <button @click="editarFuncionario(item)">✏️</button>
            <button @click="excluirFuncionario(item.id)">🗑️</button>
          </div>

        </li>
      </ul>

    </div>

    <div class="card resumo-card">

      <h2>📈 Resumo</h2>

      <ul>
        <li v-for="item in resumo.lista" :key="item.nome">
          <strong>{{ item.nome }}</strong>
          <p>
            ➕ Extra: {{ formatarHoras(item.extra || 0) }} |
            ➖ Falta: {{ formatarHoras(item.falta || 0) }}
          </p>
        </li>
      </ul>

    </div>

  </section>
</template>