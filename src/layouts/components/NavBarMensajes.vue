<script setup>
import { useMensajesStore } from '@/stores/mensajes'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const mensajesStore = useMensajesStore()
const router = useRouter()

const mensajesNoLeidos = computed(() => mensajesStore.mensajesNoLeidos)

const irAMensajes = () => {
  router.push({ name: 'mensajes' })
}

// Cargar mensajes al iniciar para actualizar el contador
onMounted(async () => {
  // Solo cargar si no se han cargado antes o si el contador es 0
  if (mensajesStore.mensajes.length === 0) {
    await mensajesStore.fetchMensajes()
  }
})
</script>

<template>
  <IconBtn @click="irAMensajes">
    <VBadge
      :content="mensajesNoLeidos"
      :model-value="mensajesNoLeidos > 0"
      color="error"
      offset-x="2"
      offset-y="2"
    >
      <VIcon icon="tabler-messages" />
    </VBadge>
  </IconBtn>
</template>
