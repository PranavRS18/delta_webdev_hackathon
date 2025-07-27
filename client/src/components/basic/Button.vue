<script setup>
const props = defineProps({
  text : {
    type: String,
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button :type = "type" :disabled = "disabled">
    {{ text }}
  </button>
</template>

<style scoped>
button {
  border-radius: 1rem;
  border: none;
  padding: 0 2rem;
  background-color: #088F8F;
  color: white;
  box-shadow: 0 0.05rem 0.05rem 0 rgba(0, 0, 0, 0.1), 0 0.2rem 0.8rem 0 rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;
  font-family: Poppins, sans-serif;
  transition: 0.4s;
}

button:hover {
  cursor: pointer;
  background-color: rgba(8, 143, 143, 0.7);
}

button:focus {
  outline: none;
}
</style>