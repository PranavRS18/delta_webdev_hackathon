<script setup>
import { computed } from 'vue'

const props = defineProps({
  inline: {
    type: Boolean,
    default: false,
  },
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  modelValue : {
    type: [String, Number],
  },
  placeholder: String,
  required: {
    type: Boolean,
    default: false,
  },
  disabled: Boolean,
})

const emit = defineEmits(['update:modelValue'])
const inputId = computed(() =>
    props.label ? props.label : 'input'
)
</script>

<template>
  <div class = 'field' :class = '{inline : inline}'>
      <label
          v-if = "label"
          :for = "inputId"
      >
        {{ label }} <span v-if = "required">*</span>
      </label>

      <input
          :id = "inputId"
          :type = "type"
          :placeholder = "placeholder"
          :value = "modelValue"
          :disabled = "disabled"
          spellcheck = "false"
          @input = "$emit('update:modelValue', $event.target.value)"
      />
  </div>
</template>

<style>
.field {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.field label {
  font-size: 1.1rem;
  width: 35%;
}

input {
  width: 55%;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
  padding: 0 1rem;
  border: none;
  outline: none;
  font-family: 'Open Sans', serif;
  box-shadow: 0 0.05rem 0.05rem 0 rgba(0, 0, 0, 0.1), 0 0.2rem 0.8rem 0 rgba(0, 0, 0, 0.1);
}

span {
  color: red;
}

.field.inline {
  flex-direction: column;
  gap: 1rem;
}

.field.inline label{
  width: 95%;
}

.field.inline input{
  width: 91%;
}
</style>