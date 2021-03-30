<template>
  <div v-if="!isPreloaderShow" @click.stop class="add-component-modal modal">
    <p class="add-component-modal__title h-text-upper">
      {{
        isSubcompanyUser
          ? $gettext('Create new my group')
          : $gettext('Create new group')
      }}
    </p>

    <div class="h-flexbox justify-between">
      <label class="add-component-modal__label-wrap mr-1 mb-0">
        <et-select
          v-model="typeField"
          :options-data="getTypes()"
          class="mb-1-25"
          label-text="Type"
          label-class="editable-select__label"
          select-label-class="editable-select__select-label mt-0"
          select-class="editable-select__select"
          select-width="220px"
          select-height="36px"
          value-key="choice"
          label-key="text"
          editable
        />
      </label>
      <label
        class="add-component-modal__label-wrap mb-0"
        :class="{ 'required-field': nameValidate }"
      >
        <input-text
          v-model="name"
          :label="$gettext('Group name')"
          :placeholder="$gettext('Group name')"
        />
      </label>
    </div>

    <label
      class="lc-details__input-field lc-details__input-field--textarea mt-2 h-max-width-100"
      :class="{ 'required-field': descriptionValidate }"
    >
      <span class="lc-details__input-field-label">{{
        $gettext('Description')
      }}</span>
      <el-input
        v-model="description"
        type="textarea"
        rows="3"
        resize="none"
        :placeholder="$gettext('Description')"
      ></el-input>
    </label>

    <span
      @click="closeModal"
      class="close-modal-btn close-modal-btn--pos-right"
    ></span>

    <div class="h-flexbox mt-2">
      <button @click="createHandler" class="modal__btn modal__btn--submit">
        {{ $gettext('Add') }}
      </button>
      <button class="modal__btn modal__btn--abort" @click="closeModal">
        {{ $gettext('Cancel') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'
import { LibraryGroupService } from '@/core/services/library-group.service'
import { UserPermissionsService } from '@/core/services/user-permissions.service.js'
import libraryGroupsService from '@/services/library-groups.service.js'

export default {
  data() {
    return {
      notValidate: false,
      nameValidate: false,
      descriptionValidate: false,
      typeField: null,
      name: '',
      description: '',
      types: []
    }
  },
  computed: {
    ...mapState({
      isPreloaderShow: state => state.modalsModule.isPreloaderShow,
      selectedAppLanguage: state => state.languagesModule.selectedAppLanguage,
      userInfo: state => state.authModule.userInfo
    }),
    ...mapGetters({
      getAddComponentDetails: 'getAddComponentDetails'
    }),
    userPermissionsService() {
      return UserPermissionsService
    },
    isSubcompanyGroup() {
      return (
        this.userPermissionsService.librarySubcompanyGroups &&
        this.userPermissionsService.libraryAddGroupsSubcompany
      )
    },
    isSubcompanyUser() {
      return this.userInfo.company.company_class === 'subcompany'
    }
  },
  methods: {
    ...mapMutations({
      setIsPreloaderShow: 'mutate_isPreloaderShow',
      setComponentType: 'mutate_updateAddComponentDetails'
    }),
    ...mapActions({
      showMessage: 'act_showMessage',
      changeIsModalOpen: 'act_changeIsModalOpen',
      addGroup: 'act_addGroup'
    }),
    getTypes() {
      let sortedTypes
      if (this.types.length) {
        sortedTypes = [...this.types].sort((a, b) => {
          const aChoice = this.$gettext(a['text'])
          const bChoice = this.$gettext(b['text'])
          return aChoice.localeCompare(bChoice)
        })
      } else {
        sortedTypes = this.types
      }
      return sortedTypes
    },
    changeGroupData(val, index) {
      const draft = JSON.parse(JSON.stringify(this.draggableData))
      draft[index].company_component_library_id = val.id
      draft[index].quantity_edit = val.quantityEdit
      draft[index].price_unit_short_name = val.price_unit_short_name
      draft[index].price_unit = val.price_unit
      this.draggableData = JSON.parse(JSON.stringify(draft))
    },
    createHandler() {
      if (this.name.trim() === '' && this.description.trim() === '') {
        this.showMessage({
          type: 'warning',
          text: this.$gettext('name_description_warning')
        })
        this.nameValidate = true
        this.descriptionValidate = true
        return
      }
      if (this.name.trim() === '') {
        this.showMessage({
          type: 'warning',
          text: this.$gettext('name_warning')
        })
        this.nameValidate = true
        this.descriptionValidate = false
        return
      }
      if (this.description.trim() === '') {
        this.showMessage({
          type: 'warning',
          text: this.$gettext('Description field may not be blank.')
        })
        this.nameValidate = false
        this.descriptionValidate = true
        return
      }
      let groupType = {
        lea_module_e_mobility: false,
        lea_module_energy_mgmt_system: false,
        lea_module_heating_system: false,
        lea_module_pv_system: false,
        lea_module_storage: false
      }
      this.types.forEach(type => {
        groupType[type.choice] = false
        if (type.choice === this.typeField) {
          groupType[type.choice] = true
        }
      })
      this.setComponentType({
        component: 'groups',
        type: 'type',
        value: this.typeField
      })
      this.addGroup({
        name: this.name,
        description: this.description,
        component_class: this.isSubcompanyGroup ? 'subcompany' : 'company',
        other_components: [],
        translations: {
          [this.selectedAppLanguage.headerLang]: {
            name: this.name,
            description: this.description
          }
        },
        ...groupType
      }).then(res => {
        this.$router.push({
          name: 'GroupDetail',
          params: {
            id: res.data.id,
            type: LibraryGroupService.getTrueComponentKey(res.data)
          }
        })
        this.changeIsModalOpen(false)
      })
    },
    closeModal() {
      this.changeIsModalOpen(false)
    },
    generateTechonologiesOptions(apiResponse) {
      return LibraryGroupService.getComponentsByIdentifier(apiResponse.choice)
    },
    fetchAvailableTechnologiesOptions() {
      this.setIsPreloaderShow(true)
      libraryGroupsService.getListOfAvailableTechnologies().then(res => {
        this.types = res.data.map(el => {
          return {
            ...el,
            [el.choice]: false
          }
        })
        if (this.types.length > 0) {
          const previouslySelectedType = this.getAddComponentDetails.groups.type
          let selectedType = previouslySelectedType.length
            ? previouslySelectedType
            : this.types[0].choice
          this.typeField = selectedType
        }
        this.setIsPreloaderShow(false)
      })
    }
  },
  created() {
    this.fetchAvailableTechnologiesOptions()
  }
}
</script>
