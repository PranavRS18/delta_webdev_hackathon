<script setup>

</script>

<template>
<div class = "overlay">
  <div class = 'modal'>
    <slot></slot>
  </div>
</div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  width: 35%;
  height: auto;
  border-radius: 1rem;
  padding: 2rem
}
</style>