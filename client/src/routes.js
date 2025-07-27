import {createRouter, createWebHistory} from "vue-router";
import Home from "./components/Home.vue";
import Project from "@/components/Project.vue";
import Login from "@/components/ui/Login.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/project/:id',
        name: 'Project',
        component: Project
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;