<template>
  <div>
    <input-wrapper
      :class="labelClass"
      :style="
        inputWidth
          ? { width: inputWidth, minWidth: inputWidth, maxWidth: inputWidth }
          : ''
      "
    >
      <label-text v-if="label" :class="inputLabelClass">
        {{ label }}
        <optional v-if="optional" :class="optionalClass">
          {{ optional }}
        </optional>
        <et-popover
          v-if="labelIcon && popoverText !== ''"
          :trigger-type="popoverTriggerType"
          :text="popoverText"
          :image="popoverImage"
        ></et-popover>
      </label-text>
      <input-container>
        <input-element
          :class="inputClass"
          :value="value"
          :placeholder="placeholder"
          :disabled="disabled"
          :hasErrors="hasErrors"
          :readonly="isReadonly"
          :inputHeight="inputHeight"
          :inputWidth="inputWidth"
          @keypress.enter="keypressHandler"
          @blur="blurHandler($event)"
          @focus="focusHandler($event)"
          @input="inputHandler($event)"
        />

        <sub-text
          v-if="maxCharacters && value.length > maxCharacters - 10"
          :charCount="value.length > maxCharacters"
        >
          {{ $gettext('characters') }}: {{ value.length }} <br /><span
            v-if="value.length > maxCharacters"
            >{{ $gettext('max_characters') }}: {{ maxCharacters }}</span
          >
        </sub-text>
        <icon
          v-if="hasErrors || inputIcon"
          :class="inputIconImageClass"
          :src="hasErrors ? warningIcon : inputIconImage"
        />
        <et-errors v-if="hasErrors" :error="errorMessage"></et-errors>
      </input-container>
    </input-wrapper>
  </div>
</template>

<script>
import styled from 'vue-styled-components'
import WarningIcon from '@/assets/images/error_icon.png'
const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-right: 1rem;
  flex-direction: column;
`

const InputContainer = styled.div`
  display: block;
  min-width: 100%;
  position: relative;
`
const Optional = styled.div`
  margin-left: 3px;
`
const LabelText = styled.div`
  font-family: 'Lato-Bold', Arial;
  display: flex;
  align-items: center;
  color: #263238;
  font-size: 13px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  margin-bottom: 13px;
`
const validationAttrs = {
  hasErrors: Boolean,
  inputWidth: String,
  inputHeight: String
}
const InputElement = styled('input', validationAttrs)`
  border: ${props =>
    props.hasErrors ? '1px solid red !important' : '1px solid #b2b9c5'};
  border-radius: 4px;
  padding: 6px 12px;
  width: ${({ inputWidth }) => (inputWidth ? inputWidth : '100%')};
  position: relative;
  height: ${({ inputHeight }) => (inputHeight ? inputHeight : '36px')};
  font-size: 13px;
  &:disabled {
    background: #fff;
    color: #aaa !important;
  }
`

const WordAttrs = { charCount: Boolean }
const SubText = styled('div', WordAttrs)`
  font-size: 11px;
  margin-top: 2px;
  color: ${props => (props.charCount ? '#ff5656' : 'unset')};
`

const Icon = styled('img')`
  position: absolute;
  right: 10px;
  top: ${props => (props.inputIcon ? '39px' : '10px')};
`

export default {
  name: 'input-text',
  components: {
    InputWrapper,
    InputContainer,
    LabelText,
    Optional,
    InputElement,
    SubText,
    Icon
  },
  props: {
    value: {
      required: false,
      default: ''
    },
    readonly: {
      type: Boolean,
      require: false,
      default: false
    },
    editable: {
      type: Boolean,
      require: false,
      default: true
    },
    label: {
      required: false,
      default: ''
    },
    inputClass: {
      type: [String, Array],
      default: ''
    },
    optional: {
      required: false,
      default: ''
    },
    optionalClass: {
      type: [String, Array],
      default: ''
    },
    labelClass: {
      type: [String, Array],
      default: ''
    },
    inputLabelClass: {
      type: [String, Array],
      default: ''
    },
    id: {
      required: false,
      default: ''
    },
    placeholder: {
      required: false,
      default: ''
    },
    labelIcon: {
      require: false,
      type: Boolean,
      default: false
    },
    inputIcon: {
      require: false,
      type: Boolean,
      default: false
    },
    inputIconImage: {
      require: false,
      type: String,
      default: ''
    },
    inputIconImageClass: {
      require: false,
      type: Array,
      default: () => []
    },
    popoverText: {
      type: String,
      default: ''
    },
    popoverImage: {
      type: String,
      default: ''
    },
    popoverTriggerType: {
      type: String,
      default: 'click'
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    maxCharacters: {
      type: String,
      required: false
    },
    errorMessage: {
      required: false,
      default: ''
    },
    hasErrors: {
      type: Boolean,
      required: false,
      default: false
    },
    inputWidth: {
      type: String,
      default: ''
    },
    inputHeight: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      warningIcon: WarningIcon
    }
  },
  computed: {
    isReadonly() {
      return !this.editable && this.readonly
    }
  },
  methods: {
    inputHandler(value) {
      this.$emit('on-input-change', value)
      this.$emit('input', value)
    },
    blurHandler(e) {
      this.$emit('blur', e.target.value)
    },
    focusHandler(e) {
      if (this.isReadonly) return
      this.$emit('focus', e.target.value)
    },
    keypressHandler() {
      this.$emit('keypress')
    }
  }
}
</script>
