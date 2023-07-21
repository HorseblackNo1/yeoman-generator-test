import dayjs from 'dayjs'

import { message } from '@/utils/message'
import { TableV2FixedDir } from 'element-plus'
import { useRouter } from 'vue-router'
import { formTsType, tableDataType, selectDataType } from './types'
import { type PaginationProps } from '@pureadmin/table'
import { reactive, ref, onMounted, toRaw, computed, nextTick } from 'vue'
import { getOrderBasicList, searchData, deleteData, basicCopy } from '@/api/orderBasic'
import * as _ from 'lodash'
const { VITE_IMGURL, VITE_BASE_URL } = import.meta.env
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'

export function use<%= name %> () {
  // const { openLPEDialogFormVisible } = useLeadPrjEdit()

  const form = reactive<formTsType>({
    basic_number: '', //提料单编号
    prj_id: '', //项目ID
    complete_status: '', //提料单进度
    status: 1 //状态
  })

  const router = useRouter()
  const apiCompleteStatusSearchData = ref<selectDataType[] | []>([])
  const apiPrjSearchData = ref<selectDataType[] | []>([])

  const status = ref(1)
  const limit = ref(10)
  const page = ref(1)
  const dataList = ref([])
  const loading = ref(false)
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  })
  const imgPrefix = ref<string>(VITE_IMGURL)

  /*
    cellRenderer (tsx) 和 slot  都可以实现自定义表单 cell
    cellRenderer (tsx) 和 slot 同时存在 cellRenderer (tsx) 优先
  */
  const columns: TableColumnList = [
    {
      label: '序号',
      prop: 'basic_id',
      width: 100,
      slot: 'linkId'
    },
    {
      label: '提料单号',
      width: 300,
      slot: 'basicNumber'
    },
    {
      label: '项目名称',
      slot: 'prjName',
      width: 300
    },
    {
      label: '客户名称',
      slot: 'accountName',
      align: 'left',
      width: 200
    },
    {
      label: '申请人',
      slot: 'createdByName'
    },
    {
      label: '期望到货日期',
      slot: 'basicExpectDate',
      width: 150
    },
    {
      label: '发货单数',
      slot: 'deliverPlanOrderCount',
      width: 150
    },
    {
      label: '创建日期',
      slot: 'createdDate',
      width: 150,
      formatter: ({ created_at }) => dayjs(created_at).format('YYYY-MM-DD')
    },
    {
      label: '提料单状态',
      slot: 'completeStatus',
      width: 150
    },
    {
      label: '操作',
      width: 240,
      fixed: TableV2FixedDir.RIGHT,
      slot: 'action'
    }
  ]

  const apiTableData = ref<tableDataType[] | []>([])

  /**
   * import LeadPrjEdit from '../components/leadPrjEdit/index2.vue'
     const editRef = ref<InstanceType<typeof LeadPrjEdit>>()

     获取 自定义组件DOM 实例
     自定义组件 通过 defineExpose({}) 暴露属性和方法
   */
  const apiBasicId = ref<number>(0)

  function handleSizeChange(val: number) {
    page.value = 1
    limit.value = val
    nextTick(() => {
      onSearch()
    })
  }

  function handleCurrentChange(val: number) {
    page.value = val
    nextTick(() => {
      getOrderBasicListAPI()
    })
  }

  function handleSelectionChange() {
    nextTick(() => {
      onSearch()
    })
  }

  function orderBasicStatusChange() {
    form.status = status.value
    nextTick(() => {
      onSearch()
    })
  }

  async function onDeleteClick(row) {
    loading.value = true
    const param = {
      basic_id: row.basic_id
    }
    try {
      const { code, msg } = await deleteData(toRaw(param))
      if (code == 200) {
        onSearch()
      } else {
        message(`${msg}`, { type: 'error' })
      }
    } catch (e) {
      loading.value = false
      message(`${e}`, { type: 'error' })
    }
  }

  function gotoDetail(row) {
    useMultiTagsStoreHook().handleTags('push', {
      path: `/orderBasic/detail/index`,
      name: 'orderBasicDetail',
      query: { basic_id: String(row.basic_id) },
      meta: {
        title: '提料单详情',
        dynamicLevel: 1
      }
    })
    router.push({ path: '/orderBasic/detail/index', query: { id: row.basic_id } })
  }

  function gotoEdit(row) {
    useMultiTagsStoreHook().handleTags('push', {
      path: `/orderBasic/edit/index`,
      name: 'orderBasicEdit',
      query: { basic_id: String(row.basic_id) },
      meta: {
        title: '提料单编辑',
        dynamicLevel: 1
      }
    })
    router.push({ path: '/orderBasic/edit/index', query: { basic_id: row.basic_id } })
  }

  function gotoAdd() {
    useMultiTagsStoreHook().handleTags('push', {
      path: `/orderBasic/add/index`,
      name: 'orderBasicAdd',
      meta: {
        title: '提料单新增',
        dynamicLevel: 1
      }
    })
    router.push({ path: '/orderBasic/add/index' })
  }

  const copyOrderBaic = (row: any) => {
    basicCopyAPI(row.basic_id)
  }

  const cellClassName = ({ row }) => {
    if (row.status == 1) {
      return 'text-[#333333]'
    }
    if (row.status == 0) {
      return 'text-[#999999]'
    }
  }

  //API

  async function basicCopyAPI(id: number) {
    loading.value = true
    try {
      const param = {
        basic_id: id
      }
      const { data, code, msg } = await basicCopy(param)
      if (code == 200) {
        // console.log("data=>", data)
        message(`${'复制成功'}`, { type: 'success' })
        pagination.currentPage = 1
        page.value = 1
        nextTick(() => {
          onSearch()
        })
      } else {
        message(`${msg}`, { type: 'error' })
      }
    } catch (e) {
      message(`${e}`, { type: 'error' })
    }

    loading.value = false
  }

  async function onSearch() {
    page.value = 1
    getOrderBasicListAPI()
  }
  async function getOrderBasicListAPI() {
    loading.value = true
    try {
      const param = {
        ...form,
        page: page.value,
        limit: limit.value
      }
      const { data, code, msg } = await getOrderBasicList(toRaw(param))
      if (code == 200) {
        apiTableData.value = data.list
        pagination.total = data.total
        pagination.pageSize = data.pageSize
        pagination.currentPage = data.current_page

        dataList.value = apiTableData.value
      } else {
        message(`${msg}`, { type: 'error' })
      }
    } catch (e) {
      message(`${e}`, { type: 'error' })
    }

    loading.value = false
  }

  async function searchDataAPI() {
    loading.value = true
    try {
      const { data, code, msg } = await searchData()
      if (code == 200) {
        apiCompleteStatusSearchData.value = data.complete_status
        apiPrjSearchData.value = data.prj_data
      } else {
        message(`${msg}`, { type: 'error' })
      }
    } catch (e) {
      loading.value = false
      message(`${e}`, { type: 'error' })
    }
  }

  const resetForm = formEl => {
    if (!formEl) return
    formEl.resetFields()
    onSearch()
  }

  //生命周期函数
  onMounted(() => {
    onSearch()
    searchDataAPI()
  })

  //计算属性
  const formatDate = computed(() => {
    return timer => {
      if (!timer) return
      return dayjs(timer).format('YYYY-MM-DD')
    }
  })

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    status,
    apiCompleteStatusSearchData,
    apiPrjSearchData,
    apiBasicId,
    formatDate,
    imgPrefix,
    cellClassName,
    gotoAdd,
    copyOrderBaic,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    orderBasicStatusChange,
    gotoDetail,
    gotoEdit,
    onDeleteClick
  }
}
