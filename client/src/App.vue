<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useStore } from './store.js'
import Login from '@/components/ui/Login.vue'
import Home from "@/components/Home.vue"

const isAuthenticated = ref(false)
const store = useStore()

const authenticate = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_SERVER}/api/auth/jwt`, {
      token: store.jwt,
    })
    store.UID = res.data.UID
    store.username = res.data.username
    store.email = res.data.email
    isAuthenticated.value = true
  } catch (err) {
    store.clearUser()
  }
}

onMounted(() => {
  store.init()
  if (store.jwt) authenticate()
})

const setAuthTrue = () => {
  isAuthenticated.value = true
}
</script>

<template>
  <Login
      name = "D-Collab"
      message = "Welcome to the Ultimate Storage for your Files"
      @isAuthenticated = "setAuthTrue"
      v-if = "!isAuthenticated"
  />
  <router-view v-if = "isAuthenticated"  />
</template>