<script setup>
import {useTemplateRef} from "vue";
import axios from 'axios'
import sha1 from "sha1";

const props = defineProps({
  project: Object,
  curr_node: String,
})

const emits = defineEmits(['uploaded_file']);

import { useStore } from "@/store.js";

const store = useStore();

const fileInput = useTemplateRef('file')
const upload_file = () => {
  const files_form = new FormData();
  files_form.append('user', store.UID)
  files_form.append('project', props.project._id)
  files_form.append('node', props.curr_node)
  files_form.append('commit_msg', 'I need to Commit Asap')

  const commit = sha1(store.UID + props.project + Date.now());
  files_form.append('commit_name', commit)
  Object.values(fileInput.value.files).forEach(file => {
    files_form.append("files", file);
  });

  axios.post(`${import.meta.env.VITE_API_SERVER}/api/project/upload`, files_form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(() => {
    emits('uploaded_file');
  }).catch(err => {
    console.log(err)
  })
}
</script>

<template>
  <label>UPLOAD
    <input type = "file" ref = "file" @input = 'upload_file' multiple hidden/>
  </label>
</template>

<style scoped>
label {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  width: 10rem;
  height: 3rem;
  border: none;
  background-color: #088F8F;
  color: white;
  box-shadow: 0 0.05rem 0.05rem 0 rgba(0, 0, 0, 0.1), 0 0.2rem 0.8rem 0 rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;
  transition: 0.4s;
}

label:hover {
  cursor: pointer;
  background-color: rgba(8, 143, 143, 0.7);
}
</style>