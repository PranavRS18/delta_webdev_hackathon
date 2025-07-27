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
const commits = ref([])
const get_project = async () => {
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/get`, {
    project_id: project_id.value,
  }).then((res) => {
    project.value = res.data.project
    project.value.node = res.data.node
    curr_node.value = res.data.node
    commits.value = res.data.commits
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
    get_project();
  })
}

const content = ref('')
const node_click = async (node) => {
  if (node.is_folder === true) {
    node.parent = curr_node.value
    curr_node.value = node
    get_files();
  } else {
    axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/parse`, {
      node,
    }).then((res) => {
      content.value = res.data.content
    }).catch(() => {})
  }
}

const go_to_parent_node = async () => {
  curr_node.value = curr_node.value.parent
  get_files();
}

const format_date = (date) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

const commit_info = ref('')
const click_commit = async (commit) => {
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/commit`, {
    commit_id: commit._id,
  }).then((res) => {
    commit_info.value = res.data.commit
  }).catch(() => {})
}

const open_file = async (commit) => {
  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/parse`, {
    node: commit,
  }).then((res) => {
    content.value = res.data.content
  }).catch(() => {})
}

onMounted(() => {
  get_project();
})
</script>

<template>
  <header>
    <div>
      <Button text = "BACK" @click = "() => {this.$router.push('/')}" />
      <UploadButton v-if = 'curr_node' :project = 'project' :curr_node = 'curr_node._id' @uploaded_file = 'get_project' />
    </div>
    <Button class = "new_folder" text = "NEW FOLDER" @click = "show_create_folder"></Button>
  </header>
  <Overlay v-if = 'isCreateFolder'>
    <Button class = 'cancel_create' text = "BACK" @click = "cancel_create_folder" />
    <h3>CREATE A NEW FOLDER</h3>
    <GetInput label = "NAME OF THE FOLDER: " :required = 'true' v-model = 'folder_name' />
    <p class = 'warn'>{{ warning }}</p>
    <Button class = "create_folder" text = "CREATE FOLDER" @click = "new_folder"/>
  </Overlay>
  <div class = 'views'>
    <div class = 'view'>
      <p> {{project.name}} - {{project.description}}</p>
      <p v-if = 'curr_node && !curr_node?.parent'>{{project.name}} / {{curr_node.name}}</p>
      <p v-if = 'curr_node?.parent'>{{project.name}} / .. / {{curr_node.parent.name}} / {{curr_node.name}}</p>
      <div class = 'node-container'>
        <div class = "node" v-if = 'curr_node?.parent' @click = 'go_to_parent_node'>...{{curr_node.parent.name}}</div>
        <div class = 'node' v-for = 'node in nodes' :key = 'node' @click = 'node_click(node)'>
          <div>{{node.is_folder ? 'Folder' : 'File'}} - {{node.name}}</div>
          <div>{{node.commit_id}}</div>
        </div>
      </div>
    </div>
    <div class = 'view node-container'>
      <div v-if = '!content'>
        <p>{{commits.length}} Commits</p>
        <div class = 'commit node' v-for = 'commit in commits' :key = 'commit'>
          <h3 class = "commit-name" @click = 'click_commit(commit)'>{{commit.name}}</h3>
          <div v-if = 'commit_info && commit_info.name === commit.name'>
            <h3>Message : {{commit.message}} </h3>
            <h3>Created at : {{format_date(commit.created_at)}} by {{commit.user.username}}</h3>
            <hr>
            <h3>Files Changed : </h3>
            <li v-for = 'commit in commit_info.nodes' :key = 'commit' @click = 'open_file(commit)'>{{commit.name}}</li>
          </div>
        </div>
      </div>
      <Button v-if = 'content' text = 'BACK' style = 'width: 10%; border-radius: 0.5rem; height: 2.5rem;' @click = '() => {content = ""}'></Button>
      <hr>
      <textarea class = 'content-viewer' v-if = "content" v-model = 'content' readonly></textarea>
    </div>
  </div>
</template>

<style scoped>

header {
  display: flex;
  justify-content: space-between;
  height: 3rem;
  align-items: center;
}

header div {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.new_folder {
  margin: 1rem 0;
  height: 3rem;
}

.views {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.node-container {
  display: flex;
  flex-direction: column;
}

.view {
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  background-color: #456882;
  color: white;
  width: 98%;
  height: 50%;
  border-radius: 0.5rem;
  padding: 1rem;
}

.view p {
  font-size: 1.2rem;
}

.node {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-family: Poppins, sans-serif;
  cursor: pointer;
  font-size: 0.95rem;
  border: 0.1rem solid gray;
  border-radius: 0.5rem;
  padding: 0.2rem 1rem;
  margin: 0.5rem 0;
}

.warn {
  height: 2rem;
  color: red;
}

.node h3 {
  font-weight: normal;
  font-size: 1rem;
}

.cancel_create {
  position: absolute;
  top: 0;
  left: 0;
  margin: 1rem;
  height: 2.5rem;
  border-radius: 0.6rem;
}

.commit {
  flex-direction: column;
  cursor: default;
}

.commit h3 {
  margin: 0.2rem 0;
}

.create_folder {
  width: 40%;
  height: 3rem;
}

.content-viewer {
  height: 50vh;
  border-radius: 0.5rem;
  padding: 1rem;
}

.commit-name {
  cursor: pointer;
}

</style>