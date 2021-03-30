// import router from '@/router'
import projectListService from '@/services/projectList.service'

const state = {
  projects: JSON.parse(localStorage.getItem('et_projects'))
    ? JSON.parse(localStorage.getItem('et_projects'))
    : [],
  projectsToExport: [],
  isProjectsDownloaded: false,
  paginationParams: JSON.parse(localStorage.getItem('et_paginationParams'))
    ? JSON.parse(localStorage.getItem('et_paginationParams'))
    : {},
  currentPage: JSON.parse(localStorage.getItem('et_currentPage'))
    ? JSON.parse(localStorage.getItem('et_currentPage'))
    : 1,
  pageSize: localStorage.getItem('project_list_page_size')
    ? parseInt(localStorage.getItem('project_list_page_size'))
    : 10,
  filtersQuery: localStorage.getItem('project_list_filter_query')
    ? JSON.parse(localStorage.getItem('project_list_filter_query'))
    : '',
  sortingQuery: '',
  openedHamburgerIdx: null,
  employeesList: [],
  companiesList: [],
  statuses: [
    { text: 'Project created', value: 'created' },
    { text: 'Waiting for offer', value: 'quote_waiting' },
    { text: 'Offer sent', value: 'quote_sent' },
    { text: 'Project sold', value: 'sold' },
    { text: 'Offer rejected', value: 'quote_rejected' },
    { text: 'Project closed', value: 'closed' }
  ],
  downloadProjectListLink: '',
  reAssignType: '',
  reAssignProjectId: '',
  reAssignPmFrom: '',
  reAssignPmTo: '',
  reAssignCpFrom: '',
  reAssignCpTo: '',
  reAssignStatusFrom: '',
  reAssignStatusTo: '',
  statusResponse: '',
  announcements: [],
  changeProjectStatus: true,
  assignCompanyToShow: false,
  employeesToShow: true,
  projectsColumn: localStorage.getItem('et_projectsColumn')
    ? JSON.parse(localStorage.getItem('et_projectsColumn'))
    : null,
  employeesData: {},
  activeEmployee: [],
  isPageInited: false
}
const getters = {
  get_projectsLength: state => state.projects.length,
  get_reAssignPmNameTo: state =>
    state.reAssignPmTo
      ? state.employeesList.find(el => el.id === state.reAssignPmTo).full_name
      : null,
  get_reAssignCpNameTo: state =>
    state.reAssignCpTo
      ? state.companiesList.find(el => el.id === state.reAssignCpTo).name
      : null,
  get_reAssignStatusFrom: state =>
    state.reAssignStatusFrom
      ? state.statuses.find(el => el.value === state.reAssignStatusFrom).text
      : null,
  get_reAssignStatusTo: state =>
    state.reAssignStatusTo
      ? state.statuses.find(el => el.value === state.reAssignStatusTo).text
      : null
}

const mutations = {
  mutate_isProjectsDownloaded(state, value) {
    state.isProjectsDownloaded = value
  },
  mutate_projects(state, value) {
    state.projects = value
  },
  mutate_projectsToExport(state, value) {
    state.projectsToExport = value
  },
  mutate_paginationParams(state, value) {
    state.paginationParams = value
  },
  mutate_currentPage(state, value) {
    localStorage.setItem('et_currentPage', value)
    state.currentPage = value
  },
  mutate_openedHamburgerIdx(state, value) {
    state.openedHamburgerIdx = value
  },
  mutate_employeesList(state, value) {
    state.employeesList = value
  },
  mutate_employeesData(state, value) {
    state.employeesData[value.id] = value.data
  },
  mutate_activeEmployee(state, value) {
    state.activeEmployee = value
  },
  mutate_companiesList(state, value) {
    state.companiesList = value
  },
  mutate_filtersQuery(state, value) {
    state.filtersQuery = value
  },
  mutate_sortingQuery(state, value) {
    state.sortingQuery = value
  },
  mutate_filters(state, value) {
    state.filters = value
  },
  mutate_downloadProjectListLink(state, value) {
    state.downloadProjectListLink = value
  },
  mutate_reAssignPm(state, value) {
    state.reAssignPmFrom = value.from
    state.reAssignPmTo = value.to
  },
  mutate_reAssignCp(state, value) {
    state.reAssignCpFrom = value.from
    state.reAssignCpTo = value.to
  },
  mutate_reAssignStatus(state, value) {
    state.reAssignStatusFrom = value.from
    state.reAssignStatusTo = value.to
  },
  mutate_reAssignProjectId(state, value) {
    state.reAssignProjectId = value
  },
  mutate_reAssignType(state, value) {
    state.reAssignType = value
  },
  mutate_statusResponse(state, value) {
    state.statusResponse = value
  },
  mutate_announcements(state, value) {
    state.announcements = value
  },
  mutate_changeProjectStatus(state, value) {
    state.changeProjectStatus = value
  },
  mutate_assignToCompany(state, value) {
    state.assignCompanyToShow = value
  },
  mutate_setEmployeesToShow(state, value) {
    state.employeesToShow = value
  },
  mutate_setFilterOptionsToStorage({ commit }, response) {
    const { results, ...paginationParams } = response.data
    const { previous, next } = paginationParams
    localStorage.setItem('et_projects', JSON.stringify(results))
    localStorage.setItem(
      'et_paginationParams',
      JSON.stringify(paginationParams)
    )
    localStorage.setItem(
      'et_currentPage',
      JSON.stringify(previous ? previous + 1 : next ? next - 1 : 1)
    )
  },
  mutate_pageSize(state, value) {
    state.pageSize = value
  },
  mutate_projectsColumn(state, value) {
    if (!localStorage.getItem('et_projectsColumn')) {
      state.projectsColumn = value
      localStorage.setItem('et_projectsColumn', JSON.stringify(value))
    } else {
      state.projectsColumn = JSON.parse(
        localStorage.getItem('et_projectsColumn')
      )
    }
  },
  mutate_isPageInited(state, value) {
    state.isPageInited = value
  }
}
const actions = {
  act_getProjectList({ state, commit, dispatch }, params = {}) {
    if (!params.page) params.page = state.currentPage
    params.hasOwnProperty('filterSearch') && params.filterSearch
      ? commit('mutate_tablePreloader', true)
      : commit('mutate_isPreloaderShow', true)

    // TODO check from userInfo
    // if (!this.state.authModule.userInfo.company.product_configuration.eturnity_expert) {
    //   commit('mutate_isProjectsDownloaded', true)
    //   commit('mutate_isPreloaderShow', false)
    //   return false
    // }
    commit('mutate_isProjectsDownloaded', false)
    return projectListService
      .getProjectList(
        params.page,
        params.hasOwnProperty('exportProjects') && params.exportProjects
          ? state.paginationParams.count
          : state.pageSize,
        params.filtersQuery ||
          JSON.parse(localStorage.getItem('project_list_filter_query')),
        params.sortingQuery || state.sortingQuery,
        params.compact
      )
      .then(res => {
        if (params.hasOwnProperty('exportProjects') && params.exportProjects) {
          let arrayOfIds = []
          res.data.results.forEach(el => {
            arrayOfIds.push(el.project_id)
          })
          commit('mutate_projectsToExport', arrayOfIds)
          commit('mutate_isProjectsDownloaded', true)
          params.hasOwnProperty('filterSearch') && params.filterSearch
            ? commit('mutate_tablePreloader', false)
            : commit('mutate_isPreloaderShow', false)
          return arrayOfIds
        }
        // adding 'value' property into projects list for checkboxes in table
        res.data.results.forEach(item => {
          item.value = false
        })
        dispatch('act_setFilterOptionsToStorage', res)
        commit('mutate_isProjectsDownloaded', true)
        params.hasOwnProperty('filterSearch') && params.filterSearch
          ? commit('mutate_tablePreloader', false)
          : commit('mutate_isPreloaderShow', false)
        return res
      })
      .catch(err => {
        commit('mutate_isProjectsDownloaded', false)
        params.hasOwnProperty('filterSearch') && params.filterSearch
          ? commit('mutate_tablePreloader', false)
          : commit('mutate_isPreloaderShow', false)
        console.log(err)
      })
  },
  act_setFilterOptionsToStorage({ commit }, payload) {
    commit('mutate_setFilterOptionsToStorage', payload)
    commit('mutate_projects', JSON.parse(localStorage.getItem('et_projects')))
    commit(
      'mutate_paginationParams',
      JSON.parse(localStorage.getItem('et_paginationParams'))
    )
    commit(
      'mutate_currentPage',
      JSON.parse(localStorage.getItem('et_currentPage'))
    )
  },
  act_getAnnouncements({ commit }) {
    return projectListService.getAnnouncements().then(res => {
      commit('mutate_announcements', res.data)
      return res
    })
  },
  act_dismissAnnouncement({ commit }, url) {
    return projectListService.dismissAnnouncement(url)
  },
  act_changeOpenedHamburgerIdx({ commit }, payload) {
    commit('mutate_openedHamburgerIdx', payload)
  },
  act_getEmployees({ commit }, payload) {
    const link =
      'espib/' + (payload ? `projects/${payload}` : 'company') + '/employees/'
    return projectListService
      .getEmployees(link)
      .then(res => {
        commit(
          'mutate_employeesList',
          res.data.filter(el => el.id || el.full_name)
        )
        commit('mutate_setEmployeesToShow', true)
        return res
      })
      .catch(() => {
        commit('mutate_setEmployeesToShow', false)
      })
  },
  act_getCompanies({ commit }, payload) {
    projectListService
      .getCompanies()
      .then(res => {
        commit('mutate_companiesList', res.data)
        commit('mutate_assignToCompany', true)
        return res
      })
      .catch(err => {
        commit('mutate_assignToCompany', false)
        return err
      })
  },
  act_changeProjectFiltersQuery({ state, commit }, filtersQuery) {
    commit('mutate_filtersQuery', filtersQuery)
  },
  // export project request
  act_exportProjects({ state, commit, dispatch }, payload) {
    commit('mutate_isPreloaderShow', true)
    const link = state.filtersString
      ? state.filtersString.slice(1) + payload.string
      : `${payload.string.slice(1)}`
    projectListService
      .exportProjects(link, state.projectsToExport)
      .then(res => {
        if (res.data.status === 'generated') {
          commit('mutate_downloadProjectListLink', res.data.link)
          commit('mutate_isPreloaderShow', false)
        }
      })
      .catch(() => {
        dispatch('act_showMessage', {
          type: 'error',
          text: this.$gettext('error_warning')
        })
        commit('mutate_isPreloaderShow', false)
      })
  },
  // Change local state for reassign
  act_changeReAssign({ commit, dispatch }, payload) {
    let { type, id, from, to } = payload
    commit('mutate_reAssignType', type)
    commit('mutate_reAssignProjectId', id)
    if (type === 'pm') commit('mutate_reAssignPm', { from, to })
    if (type === 'cp') commit('mutate_reAssignCp', { from, to })
    if (type === 'status') commit('mutate_reAssignStatus', { from, to })
    dispatch('act_modalsManipulating', 'reassign-project')
  },
  // One function, for two reassign request (project manager & project status)
  act_reAssignProject({ commit, dispatch }, payload) {
    commit('mutate_tablePreloader', true)
    dispatch('act_changeIsModalOpen', false)
    let data, link, messageText
    if (payload === 'pm') {
      data = { project_manager_id: state.reAssignPmTo, company_id: null }
      link = `espib/projects/${state.reAssignProjectId}/transfer/`
      messageText = 'The project has been reassigned'
    }
    if (payload === 'cp') {
      data = { project_manager_id: null, company_id: state.reAssignCpTo }
      link = `espib/projects/${state.reAssignProjectId}/transfer/`
      messageText = 'The project has been reassigned'
    }
    if (payload === 'status') {
      data = { status: state.reAssignStatusTo }
      link = `espib/projects/${state.reAssignProjectId}/settings/`
      messageText = 'The project status has been sucessfully changed '
    }
    return projectListService
      .reAssignProject(link, data)
      .then(() => {
        dispatch('act_getProjectList', { filterSearch: true }).then(() => {
          dispatch('act_showMessage', { type: 'success', text: messageText })
        })
      })
      .catch(() => {
        commit('mutate_tablePreloader', false)
        dispatch('act_showMessage', {
          type: 'error',
          text: this.$gettext('error_warning')
        })
      })
  },
  act_clearDownloadLink({ commit }) {
    commit('mutate_downloadProjectListLink', '')
    commit('mutate_isModalOpen', false)
  },
  act_getProjectsColumn({ commit }) {
    commit('mutate_isPreloaderShow', true)
    return projectListService.getProjectsColumn().then(res => {
      const objResponse = {}
      if (res.data) {
        res.data.forEach(el => {
          el.value = true
          objResponse[el.choice] = el
        })
      }
      commit('mutate_isPreloaderShow', false)
      return objResponse
    })
  },
  act_pageSize({ commit }, value) {
    localStorage.setItem('project_list_page_size', value)
    commit('mutate_currentPage', 1)
    commit('mutate_pageSize', value)
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
