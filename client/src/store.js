import { defineStore } from 'pinia'

export const useStore = defineStore('app', {
    state: () => ({
        jwt: null,
        username: null,
        email: null,
        UID: null,
    }),
    actions: {
        init() {
            const token = localStorage.getItem('jwt')
            if (token) {
                this.jwt = token
            }
        },
        setUser(newUser) {
            this.jwt = newUser.token
            localStorage.setItem('jwt', newUser.token)
        },
        clearUser() {
            this.jwt = null
            this.username = null
            this.email = null
            this.UID = null
            localStorage.removeItem('jwt')
        }
    }
})
