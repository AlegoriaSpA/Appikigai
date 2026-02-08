<script setup>
import { Node, mergeAttributes } from '@tiptap/core'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, NodeViewWrapper, VueNodeViewRenderer, nodeViewProps, useEditor } from '@tiptap/vue-3'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { computed, defineComponent, h } from 'vue'

// Componente Vue para renderizar matemáticas en línea
const MathInlineComponent = defineComponent({
  name: 'MathInlineView',
  props: nodeViewProps,
  setup(props) {
    const renderedMath = computed(() => {
      try {
        return katex.renderToString(props.node.attrs.latex, {
          throwOnError: false,
          displayMode: false,
        })
      }
      catch (e) {
        return props.node.attrs.latex
      }
    })

    return () => h(NodeViewWrapper, {
      as: 'span',
      class: 'math-inline',
      innerHTML: renderedMath.value,
    })
  },
})

// Componente Vue para renderizar matemáticas en bloque
const MathBlockComponent = defineComponent({
  name: 'MathBlockView',
  props: nodeViewProps,
  setup(props) {
    const renderedMath = computed(() => {
      try {
        return katex.renderToString(props.node.attrs.latex, {
          throwOnError: false,
          displayMode: true,
        })
      }
      catch (e) {
        return props.node.attrs.latex
      }
    })

    return () => h(NodeViewWrapper, {
      as: 'div',
      class: 'math-block',
      innerHTML: renderedMath.value,
    })
  },
})

// Extensión personalizada para matemáticas en línea
const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
        getAttrs: dom => ({
          latex: dom.getAttribute('data-latex') || '',
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 
      'data-type': 'math-inline',
      'data-latex': node.attrs.latex,
    }), node.attrs.latex]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathInlineComponent)
  },

  addCommands() {
    return {
      insertMathInline: (latex) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { latex },
        })
      },
    }
  },
})

// Extensión personalizada para matemáticas en bloque
const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
        getAttrs: dom => ({
          latex: dom.getAttribute('data-latex') || '',
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'math-block',
      'data-latex': node.attrs.latex,
    }), node.attrs.latex]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathBlockComponent)
  },

  addCommands() {
    return {
      insertMathBlock: (latex) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { latex },
        })
      },
    }
  },
})

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref()
const showMathDialog = ref(false)
const mathInput = ref('')
const mathType = ref('inline') // 'inline' o 'block'
const mathPreview = ref('')

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: [
        'heading',
        'paragraph',
      ],
    }),
    Placeholder.configure({ placeholder: props.placeholder ?? 'Escribe algo aquí...' }),
    Underline,
    MathInline,
    MathBlock,
  ],
  onUpdate() {
    if (!editor.value)
      return
    emit('update:modelValue', editor.value.getHTML())
  },
})

watch(() => props.modelValue, () => {
  const isSame = editor.value?.getHTML() === props.modelValue
  if (isSame)
    return
  editor.value?.commands.setContent(props.modelValue)
})

watch(mathInput, (newValue) => {
  if (!newValue.trim()) {
    mathPreview.value = ''
    return
  }
  try {
    mathPreview.value = katex.renderToString(newValue, {
      throwOnError: false,
      displayMode: mathType.value === 'block',
    })
  } catch (e) {
    mathPreview.value = '<span class="text-error">Error en la fórmula</span>'
  }
})

const openMathDialog = () => {
  showMathDialog.value = true
  mathInput.value = ''
  mathPreview.value = ''
}

const insertMath = () => {
  if (!mathInput.value.trim()) return
  
  if (mathType.value === 'inline') {
    editor.value?.chain().focus().insertMathInline(mathInput.value).run()
  } else {
    editor.value?.chain().focus().insertMathBlock(mathInput.value).run()
  }
  
  showMathDialog.value = false
  mathInput.value = ''
  mathPreview.value = ''
}

const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleUnderline = () => editor.value?.chain().focus().toggleUnderline().run()
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const setTextAlign = alignment => editor.value?.chain().focus().setTextAlign(alignment).run()

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="tiptap-editor-wrapper">
    <div 
      v-if="editor" 
      class="editor-toolbar"
    >
      <VBtnGroup
        density="compact"
        variant="outlined"
      >
        <VBtn
          icon
          size="small"
          :color="editor.isActive('bold') ? 'primary' : undefined"
          @click="toggleBold"
        >
          <VIcon icon="tabler-bold" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Negrita
          </VTooltip>
        </VBtn>

        <VBtn
          icon
          size="small"
          :color="editor.isActive('italic') ? 'primary' : undefined"
          @click="toggleItalic"
        >
          <VIcon icon="tabler-italic" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Cursiva
          </VTooltip>
        </VBtn>

        <VBtn
          icon
          size="small"
          :color="editor.isActive('underline') ? 'primary' : undefined"
          @click="toggleUnderline"
        >
          <VIcon icon="tabler-underline" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Subrayado
          </VTooltip>
        </VBtn>
      </VBtnGroup>

      <VBtnGroup
        density="compact"
        variant="outlined"
        class="ms-2"
      >
        <VBtn
          icon
          size="small"
          :color="editor.isActive('bulletList') ? 'primary' : undefined"
          @click="toggleBulletList"
        >
          <VIcon icon="tabler-list" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Lista
          </VTooltip>
        </VBtn>

        <VBtn
          icon
          size="small"
          :color="editor.isActive('orderedList') ? 'primary' : undefined"
          @click="toggleOrderedList"
        >
          <VIcon icon="tabler-list-numbers" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Lista numerada
          </VTooltip>
        </VBtn>
      </VBtnGroup>

      <VBtnGroup
        density="compact"
        variant="outlined"
        class="ms-2"
      >
        <VBtn
          icon
          size="small"
          :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : undefined"
          @click="setTextAlign('left')"
        >
          <VIcon icon="tabler-align-left" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Alinear izquierda
          </VTooltip>
        </VBtn>

        <VBtn
          icon
          size="small"
          :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : undefined"
          @click="setTextAlign('center')"
        >
          <VIcon icon="tabler-align-center" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Centrar
          </VTooltip>
        </VBtn>

        <VBtn
          icon
          size="small"
          :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : undefined"
          @click="setTextAlign('right')"
        >
          <VIcon icon="tabler-align-right" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Alinear derecha
          </VTooltip>
        </VBtn>
      </VBtnGroup>

      <VBtn
        class="ms-2"
        size="small"
        color="primary"
        variant="outlined"
        @click="openMathDialog"
      >
        <VIcon
          start
          icon="tabler-math-function"
        />
        Fórmula matemática
      </VBtn>
    </div>

    <EditorContent
      ref="editorRef"
      :editor="editor"
      class="tiptap-editor-content"
    />

    <!-- Diálogo para insertar matemáticas -->
    <VDialog
      v-model="showMathDialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle>Insertar fórmula matemática (LaTeX)</VCardTitle>
        <VCardText>
          <VRadioGroup
            v-model="mathType"
            inline
            class="mb-4"
          >
            <VRadio
              label="En línea ($...$)"
              value="inline"
            />
            <VRadio
              label="Bloque ($$...$$)"
              value="block"
            />
          </VRadioGroup>

          <VTextarea
            v-model="mathInput"
            label="Escribe la fórmula LaTeX"
            placeholder="Ejemplo: x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
            rows="4"
            hint="Usa sintaxis LaTeX. Ejemplos: \frac{a}{b}, \sqrt{x}, x^2, \sum_{i=1}^{n}"
            persistent-hint
          />

          <div 
            v-if="mathPreview"
            class="mt-4 pa-4"
            style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px;"
          >
            <div class="text-subtitle-2 mb-2">
              Vista previa:
            </div>
            <div v-html="mathPreview" />
          </div>

          <div class="text-caption text-medium-emphasis mt-4">
            <strong>Ejemplos comunes:</strong><br>
            • Fracción: \frac{numerador}{denominador}<br>
            • Raíz: \sqrt{x} o \sqrt[n]{x}<br>
            • Potencia: x^2 o x^{n+1}<br>
            • Subíndice: x_i o x_{n-1}<br>
            • Suma: \sum_{i=1}^{n}<br>
            • Integral: \int_{a}^{b}
          </div>
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn
            variant="outlined"
            @click="showMathDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            @click="insertMath"
          >
            Insertar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
.tiptap-editor-wrapper {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  
  .editor-toolbar {
    display: flex;
    align-items: center;
    padding: 8px;
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background-color: rgb(var(--v-theme-surface));
    flex-wrap: wrap;
    gap: 4px;
  }

  .tiptap-editor-content {
    .tiptap {
      min-block-size: 200px;
      outline: none;
      padding: 16px;

      p {
        margin-block-end: 1em;
      }

      ul,
      ol {
        padding-inline-start: 1.5rem;
        margin-block-end: 1em;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-block-end: 0.5em;
      }

      &.ProseMirror-focused {
        outline: none;
      }

      p.is-editor-empty:first-child::before {
        block-size: 0;
        color: rgb(var(--v-theme-on-surface));
        content: attr(data-placeholder);
        float: inline-start;
        opacity: 0.3;
        pointer-events: none;
      }

      .math-inline {
        display: inline-block;
        padding: 2px 4px;
        margin: 0 2px;
        background-color: rgba(var(--v-theme-primary), 0.1);
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: rgba(var(--v-theme-primary), 0.2);
        }
      }

      .math-block {
        display: block;
        padding: 16px;
        margin: 16px 0;
        background-color: rgba(var(--v-theme-primary), 0.05);
        border-inline-start: 3px solid rgb(var(--v-theme-primary));
        border-radius: 4px;
        cursor: pointer;
        text-align: center;
        
        &:hover {
          background-color: rgba(var(--v-theme-primary), 0.1);
        }
      }

      .math-error {
        background-color: rgba(var(--v-theme-error), 0.1);
        border-color: rgb(var(--v-theme-error));
        color: rgb(var(--v-theme-error));
      }
    }
  }
}
</style>
