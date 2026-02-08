<script setup>
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Configurar KaTeX globalmente para Quill
window.katex = katex

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Escribe algo...'
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let quillInstance = null

onMounted(() => {
  if (editorRef.value) {
    // Configuración completa de la toolbar
    const fullToolbar = [
      [
        { font: [] },
        { size: [] }
      ],
      ['bold', 'italic', 'underline', 'strike'],
      [
        { color: [] },
        { background: [] }
      ],
      [
        { script: 'super' },
        { script: 'sub' }
      ],
      [
        { header: '1' },
        { header: '2' },
        'blockquote',
        'code-block'
      ],
      [
        { list: 'ordered' },
        { list: 'bullet' }
      ],
      [{ align: [] }],
      ['link', 'formula']
    ]

    // Inicializar Quill
    quillInstance = new Quill(editorRef.value, {
      modules: {
        toolbar: fullToolbar
      },
      placeholder: props.placeholder,
      theme: 'snow'
    })

    // Personalizar botón de fórmula
    const formulaButton = editorRef.value.parentElement.querySelector('.ql-formula')
    if (formulaButton) {
      formulaButton.innerHTML = 'Insertar Fórmula'
      formulaButton.classList.add('formula-button-custom')
    }

    // Agregar texto informativo al tooltip de fórmula
    const tooltip = editorRef.value.parentElement.querySelector('.ql-tooltip')
    if (tooltip) {
      const observer = new MutationObserver(() => {
        const formulaInput = tooltip.querySelector('input[data-formula]')
        if (formulaInput && !formulaInput.dataset.modified) {
          formulaInput.placeholder = 'Escribe una fórmula en LaTeX (ej: E=mc^2, \\frac{a}{b}, \\sqrt{x})'
          formulaInput.dataset.modified = 'true'
        }
      })
      observer.observe(tooltip, { attributes: true, childList: true, subtree: true })
    }

    // Establecer el contenido inicial
    if (props.modelValue) {
      quillInstance.root.innerHTML = props.modelValue
    }

    // Escuchar cambios en el contenido
    quillInstance.on('text-change', () => {
      const html = quillInstance.root.innerHTML
      emit('update:modelValue', html)
    })
  }
})

// Watch para cambios externos en modelValue
watch(() => props.modelValue, (newValue) => {
  if (quillInstance && quillInstance.root.innerHTML !== newValue) {
    quillInstance.root.innerHTML = newValue || ''
  }
})

onBeforeUnmount(() => {
  if (quillInstance) {
    quillInstance = null
  }
})
</script>

<template>
  <div>
    <div ref="editorRef" class="quill-editor"></div>
  </div>
</template>

<style scoped>
.quill-editor {
  background: white;
}

:deep(.ql-editor) {
  min-height: 250px;
}

:deep(.ql-container) {
  font-size: 14px;
}

:deep(.ql-toolbar) {
  border-radius: 4px 4px 0 0;
}

:deep(.ql-container) {
  border-radius: 0 0 4px 4px;
}

/* Botón de fórmula personalizado */
:deep(.ql-formula.formula-button-custom) {
  background-color: #7C3AED !important;
  color: white !important;
  padding: 4px 12px !important;
  border-radius: 4px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border: none !important;
  width: auto !important;
  height: auto !important;
}

:deep(.ql-formula.formula-button-custom:hover) {
  background-color: #F0A04B !important;
}

/* Estilos para el tooltip de fórmula */
:deep(.ql-tooltip input[data-formula]) {
  width: 400px !important;
  padding: 8px !important;
  font-size: 13px !important;
}

:deep(.ql-tooltip[data-mode="formula"]::before) {
  content: "Ingrese fórmula LaTeX:";
  font-weight: 600;
  color: #7C3AED;
}
</style>
