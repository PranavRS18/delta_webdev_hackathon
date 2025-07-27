<script setup>
import Button from "@/components/basic/Button.vue";
import Overlay from "@/components/basic/Overlay.vue";
import GetInput from "@/components/basic/GetInput.vue";

import {onMounted, ref} from "vue";
import axios from "axios";
import {useStore} from "../store.js";

const store = useStore();
const isCreateProject = ref(false);

const show_create_modal = async () => {
  isCreateProject.value = true;
}

const cancel_create_modal = async () => {
  isCreateProject.value = false;
}

const project_name = ref('')
const project_description = ref('')
const warning = ref('')
const create_project = async () => {
  if (project_name.value.length < 3 || project_name.value.length > 20) {
    warning.value = 'Project Name must be atleast 3 characters and atmost 20 characters.';
    return;
  }
  else warning.value = '';

  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/create`, {
    uid: store.UID,
    name: project_name.value,
    description: project_description.value,
  }).then((res) => {
    isCreateProject.value = false;
    projects.value.push(res.data.project)
  }).catch((err) => {
    warning.value = err.data.message;
  })
}

const projects = ref([])
const get_projects = async () => {
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/user`, {
    uid: store.UID,
  }).then((res) => {
    projects.value = res.data.projects;
  }).catch(() => {
  })
}

onMounted(() => {
  get_projects()
})

</script>

<template>
  <header>
    <Overlay v-if = "isCreateProject">
      <Button class = 'cancel_create' text = "BACK" @click = "cancel_create_modal" />
      <h3>CREATE A NEW PROJECT</h3>
      <GetInput label = "NAME OF THE PROJECT: " :required = 'true' v-model = 'project_name' />
      <p>{{ warning }}</p>
      <GetInput :inline = 'true' label = "DESCRIPTION: " v-model = "project_description" />
      <Button class = "create_project" text = "CREATE PROJECT" @click = "create_project"/>
    </Overlay>
    <Button class = "new_project" text = "NEW PROJECT" @click = 'show_create_modal'/>
  </header>
  <div style = "display: flex; flex-direction: column">
    <router-link :to = '`/project/${project._id}`' class = 'project' v-for = 'project in projects' :key = 'project'>{{ project.name }}</router-link>
  </div>
</template>

<style scoped>

header {
  margin-bottom: 1rem;
}

.new_project {
  height: 3rem;
}

.create_project {
  width: 40%;
  height: 3rem;
}

.cancel_create {
  position: absolute;
  top: 0;
  left: 0;
  margin: 1rem;
  height: 2.5rem;
  border-radius: 0.6rem;
}

p {
  height: 2rem;
  color: red;
}

.project {
  font-family: Afacad, cursive;
  font-size: 1.5rem;
  width: 10%;
  padding: 1rem;
  border-radius: 0.6rem;
}
</style>