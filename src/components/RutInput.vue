<script setup>
import { formatearRutOnInput, obtenerErrorRut } from '@/utils/rut'
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'RUT',
  },
  placeholder: {
    type: String,
    default: '12.345.678-9',
  },
  errorMessages: {
    type: [String, Array],
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: 'Formato: 12.345.678-9',
  },
  persistentHint: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  validateOnBlur: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const localValue = computed({
  get: () => props.modelValue,
  set: value => {
    // Formatear RUT mientras se escribe
    const formatted = formatearRutOnInput(value)
    emit('update:modelValue', formatted)
  },
})

const localError = computed(() => {
  if (props.errorMessages) {
    return props.errorMessages
  }
  return ''
})

const handleBlur = event => {
  if (props.validateOnBlur && props.modelValue) {
    const error = obtenerErrorRut(props.modelValue)
    if (error) {
      // Si hay error, emitir blur con el error
      emit('blur', { error, value: props.modelValue })
    } else {
      emit('blur', { error: '', value: props.modelValue })
    }
  } else {
    emit('blur', event)
  }
}

const handleFocus = event => {
  emit('focus', event)
}
</script>

<template>
  <VTextField
    v-model="localValue"
    :label="label"
    :placeholder="placeholder"
    :error-messages="localError"
    :disabled="disabled"
    :readonly="readonly"
    :hint="hint"
    :persistent-hint="persistentHint"
    :required="required"
    prepend-inner-icon="tabler-id"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <template #append-inner>
      <VIcon
        v-if="modelValue && !obtenerErrorRut(modelValue)"
        icon="tabler-circle-check"
        color="success"
        size="20"
      />
    </template>
  </VTextField>
</template>
