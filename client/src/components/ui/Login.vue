<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useStore } from '../../store.js'
import GetInput from "@/components/basic/GetInput.vue"
import Button from "@/components/basic/Button.vue"

const store = useStore()

const props = defineProps({
  name: String,
  message: String,
})

const emit = defineEmits(['isAuthenticated'])

const isLogin = ref(true)
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const warning = ref('')

const shift_box = () => {
  isLogin.value = !isLogin.value
}

const authenticate = () => {
  if (!isLogin.value) {
    if (password.value !== confirmPassword.value) {
      warning.value = "Passwords do not match"
      return
    } else if (username.value.length < 3) {
      warning.value = 'Username should be atleast 3 characters'
      return
    } else if (username.value.length > 15) {
      warning.value = 'Username should be atmost 15 characters'
      return
    } else if (!/^[A-Za-z0-9_ \t]+$/.test(username.value)) {
      warning.value = "Username should not have special characters excluding underscores (_) and spaces ( )"
      return
    } else warning.value = '';
    axios.post(`${import.meta.env.VITE_API_SERVER}/api/auth/register`, {
      username: username.value,
      email: email.value,
      password: password.value,
    }).then(() => {
      warning.value = ''
      isLogin.value = true
    }).catch(err => {
      try {
        warning.value = err.response.data.message
      } catch {
        alert("Network Error")
      }
    })
  } else {
    axios.post(`${import.meta.env.VITE_API_SERVER}/api/auth/login`, {
      email: email.value,
      password: password.value,
    }).then((res) => {
      store.setUser({ token: res.data.token })
      emit('isAuthenticated')
    }).catch(err => {
      if (err.response?.data) warning.value = err.response.data.message
    })
  }
}
</script>

<template>
  <div class = "authentication">
    <transition name = "fade" mode = "out-in">
      <div class = "login box" :class = "{ isLogin: !isLogin }" :key = "isLogin">
        <h1>{{ isLogin ? 'LOGIN' : 'REGISTER' }}</h1>

        <GetInput v-if = "!isLogin" label = "USERNAME" :required = true v-model = "username" />
        <GetInput label = "EMAIL" :required = true v-model = "email" />
        <GetInput label = "PASSWORD" type = "password" :required = true v-model = "password" />
        <GetInput v-if = "!isLogin" label = "CONFIRM PASSWORD" type = "password" :required = true v-model = "confirmPassword" />

        <p class = "forgot">{{ isLogin ? 'Forgot Password?' : '' }}</p>
        <p class = "warning">{{ warning }}</p>
        <Button :text = "isLogin ? 'LOGIN' : 'REGISTER'" @click = "authenticate"></Button>
        <p class = "new" @click = "shift_box">
          {{ isLogin ? `New to ${name}? Register Now` : 'Already a User? Login Now' }}
        </p>
      </div>
    </transition>

    <div class = "details box" :class = "{ isLogin: !isLogin }">
      <h2 class = "message">WELCOME TO {{ name.toUpperCase() }}!</h2>
      <div class = "message">{{ message }}</div>
    </div>
  </div>
</template>

<style scoped>
.authentication {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

Button {
  height: 3rem;
}

h1 {
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  font-size: 2.5rem;
  color: teal;
}

.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  gap: 1rem;
  width: 35%;
  height: 70%;
  border: 0.2rem solid rgb(8, 143, 143);
  transition: transform 1s ease-in-out, opacity 0.6s ease;
}

.login {
  border-radius: 0.3rem 0 0 0.3rem;
  border-right: 0;
}

.details {
  background-color: rgb(8, 143, 143);
  border-radius: 0 0.3rem 0.3rem 0;
}

.login.isLogin {
  transform: translateX(100%);
  border-radius: 0 0.3rem 0.3rem 0;
  border-left: 0;
  border-right: 0.2rem solid rgb(8, 143, 143);
}

.details.isLogin {
  transform: translateX(-100%);
  border-radius: 0.3rem 0 0 0.3rem;
}

p {
  width: 90%;
  height: 2rem;
}

.new {
  text-align: center;
  font-size: 1.2rem;
}

.forgot {
  text-align: right;
}

p:hover {
  cursor: pointer;
}

.warning {
  text-align: center;
  color: red;
}

.message {
  color: white;
}

div.message {
  font-size: 1.5rem;
  font-family: 'Open Sans', sans-serif;
}

h2.message {
  font-weight: normal;
  font-size: 3rem;
  font-family: 'Afacad', sans-serif;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>