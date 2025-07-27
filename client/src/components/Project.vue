<script setup>
import UploadButton from "@/components/ui/UploadButton.vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";

import axios from "axios";
import Button from "@/components/basic/Button.vue";
import {useStore} from "@/store.js";
import Overlay from "@/components/basic/Overlay.vue";
import GetInput from "@/components/basic/GetInput.vue";

const store = useStore();
const route = useRoute();
const project = ref({})
const project_id = ref(route.params.id)
const curr_node = ref()

const get_project = async () => {
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/get`, {
    project_id: project_id.value,
  }).then((res) => {
    project.value = res.data.project
    project.value.node = res.data.node
    curr_node.value = res.data.node
    get_files();
  }).catch(() => {
  })
}

const nodes = ref([])
const get_files = async () => {
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/files`, {
    node: curr_node.value._id,
  }).then((res) => {
    nodes.value = res.data.nodes
    nodes.value = nodes.value.filter((node) => node.is_folder === true).concat(nodes.value.filter((node) => node.is_folder === false))
  }).catch(() => {
  })
}

const isCreateFolder = ref(false)
const warning = ref('')
const folder_name = ref('New Folder')
const show_create_folder = async () => {
  isCreateFolder.value = true
}

const cancel_create_folder = async () => {
  isCreateFolder.value = false
}

const new_folder = async () => {
  if (folder_name.value.length < 3 || folder_name.value.length > 20) {
    warning.value = 'Folder Name should be atleast 3 characters and atmost 20 characters'
    return;
  }
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/folder`, {
    user: store.UID,
    name: folder_name.value,
    node: curr_node.value._id,
  }).then((res) => {
    nodes.value.push(res.data.node)
    isCreateFolder.value = false
  })
}

const node_click = async (node) => {
  if (node.is_folder === true) {
    node.parent = curr_node.value
    curr_node.value = node
  }
  get_files();
}

const go_to_parent_node = async () => {
  curr_node.value = curr_node.value.parent
  get_files();
}

onMounted(() => {
  get_project();
})
</script>

<template>
  <header>
    <UploadButton v-if = 'curr_node' :project = 'project' :curr_node = 'curr_node._id' @uploaded_file = 'get_files' />
    <Button class = "new_folder" text = "NEW FOLDER" @click = "show_create_folder"></Button>
  </header>
  <Overlay v-if = 'isCreateFolder'>
    <Button class = 'cancel_create' text = "BACK" @click = "cancel_create_folder" />
    <h3>CREATE A NEW FOLDER</h3>
    <GetInput label = "NAME OF THE FOLDER: " :required = 'true' v-model = 'folder_name' />
    <p class = 'warn'>{{ warning }}</p>
    <Button class = "create_folder" text = "CREATE FOLDER" @click = "new_folder"/>
  </Overlay>
  <p v-if = 'curr_node'>CURRENT FOLDER : {{curr_node.name}}</p>
  <ul>
    <li class = "node" v-if = 'curr_node?.parent' @click = 'go_to_parent_node'>...{{curr_node.parent.name}}</li>
    <li class = 'node' v-for = 'node in nodes' :key = 'node' @click = 'node_click(node)'>{{node.name}}</li>
  </ul>
</template>

<style scoped>

header {
  display: flex;
  justify-content: space-between;
  height: 3rem;
  align-items: center;
}

.new_folder {
  margin: 1rem 0;
  height: 3rem;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.node {
  list-style-type: none;
  font-family: Poppins, sans-serif;
  cursor: pointer;
}

.warn {
  height: 2rem;
  color: red;
}

.cancel_create {
  position: absolute;
  top: 0;
  left: 0;
  margin: 1rem;
  height: 2.5rem;
  border-radius: 0.6rem;
}

.create_folder {
  width: 40%;
  height: 3rem;
}

</style>