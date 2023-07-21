<script setup lang="ts">
import { ref } from 'vue'
import { use<%= name %> } from './hooks'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'

import Search from '@iconify-icons/ep/search'
import Refresh from '@iconify-icons/ep/refresh'
import InvalidIcon from '@/assets/svg/invalid_icon.svg?component'

const formRef = ref()
const { form, loading, status, columns, dataList, pagination, apiCompleteStatusSearchData, apiPrjSearchData, formatDate, imgPrefix, cellClassName, copyOrderBaic, onSearch, resetForm, onDeleteClick, handleSizeChange, handleCurrentChange, handleSelectionChange, orderBasicStatusChange, gotoDetail, gotoEdit, gotoAdd } = use<%= name %>()

defineOptions({
  name: '<%= name %> '
})
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="bg-bg_color w-[99/100] pl-8 pt-4">
      <el-form-item label="<%= name %>" prop="basic_number">
        <el-input v-model="form.basic_number" placeholder="请输入单号" clearable class="!w-[230px]" />
      </el-form-item>
      <el-form-item label="项目名称" prop="prj_id">
        <el-select v-model="form.prj_id" placeholder="请选择项目" clearable class="!w-[230px]" filterable>
          <el-option v-for="item in apiPrjSearchData" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="提料单状态" prop="complete_status">
        <el-select v-model="form.complete_status" placeholder="请选择状态" clearable class="!w-[230px]">
          <el-option v-for="item in apiCompleteStatusSearchData" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(Search)" :loading="loading" @click="onSearch"> 搜索 </el-button>
        <el-button :icon="useRenderIcon(Refresh)" :loading="loading" @click="resetForm(formRef)"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="提料申请" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button @click="gotoAdd" class="mr-[23px]" type="primary">+ 新建</el-button>
        <el-radio-group v-model="status" @change="orderBasicStatusChange">
          <el-radio-button :label="1">有效</el-radio-button>
          <el-radio-button :label="0">无效</el-radio-button>
        </el-radio-group>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <!-- border -->
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          :cell-class-name="cellClassName"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <!-- 序号 -->
          <template #linkId="{ row }">
            <div class="flex items-center justify-center">
              <div class="mr-[12px]"><InvalidIcon v-if="row.status == 0" color="text-[#999999]" /></div>
              <div :class="[row.status == 1 ? 'text-[#333333]' : 'text-[#999999]']">{{ row.basic_id }}</div>
            </div>
          </template>

          <!-- 提料单号 -->
          <template #basicNumber="{ row }">
            <div>{{ row.basic_number }}</div>

            <!-- <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden" :class="[row.status == 1 ? 'text-[#0868E0] cursor-pointer' : 'text-[#999999]']" @click="gotoDetail(row)">
              {{ row.basic_number }}
            </div> -->
          </template>

          <!-- 项目名称 -->
          <template #prjName="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              {{ row.tb_pm_prj.pm_p_name }}
            </div>
          </template>

          <!-- 客户名称 -->
          <template #accountName="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              {{ row.basic_customer_name }}
            </div>
          </template>

          <!-- 申请人 -->
          <template #createdByName="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              <img :title="row.tb_uc2e_employee?.uc_name" :src="row.tb_uc2e_employee?.fs_avatar_url ?? imgPrefix + '/img/xcxCommon/newIcon/PAteamMDef.png'" style="width: 30px; border-radius: 15px" />
            </div>
          </template>

          <!-- 期望到货日期 -->
          <template #basicExpectDate="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              {{ row.basic_expect_date }}
            </div>
          </template>

          <!-- 发货单数 -->
          <template #deliverPlanOrderCount="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              {{ row.deliver_plan_order_count }}
            </div>
          </template>

          <!-- 创建日期 -->
          <template #createdDate="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              {{ formatDate(row.created_at) }}
            </div>
          </template>

          <!-- 提料单状态 -->
          <template #completeStatus="{ row }">
            <div class="w-full text-ellipsis whitespace-nowrap overflow-hidden">
              <!--
                  提料单状态：
                    0-提料单整单驳回
                    10-草稿
                    20-飞书审批中
                    23-飞书审批驳回
                    25-已撤回
                    30-供应链审核中
                    40-待财务审核
                    50-待确认(同步OMS成功)
                    55-OMS变更驳回
                    60-待处理(OMS确认后)
                    70-进行中(OMS发布以后)
                    80-已取消
                    100-已完成
                -->

              <span v-if="row.complete_status == 0" class="text-[#FF4D4FFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 10" class="text-[#666666FF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 20" class="text-[#B37C0EFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 23" class="text-[#BFBFBFFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 25" class="text-[#BFBFBFFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 30" class="text-[#B37C0EFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 40" class="text-[#B37C0EFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 50" class="text-[#FAAD14FF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 55" class="text-[#FAAD14FF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 60" class="text-[#FAAD14FF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 70" class="text-[#FAAD14FF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 80" class="text-[#BFBFBFFF]">{{ row.status_name }}</span>
              <span v-if="row.complete_status == 100" class="text-[#0868E0FF]">{{ row.status_name }}</span>
            </div>
          </template>

          <!-- 操作 -->
          <template #action="{ row }">
            <template v-if="row.status == 1">
              <!--
                  提料单状态：
                    0-提料单整单驳回
                    10-草稿
                    20-飞书审批中
                    23-飞书审批驳回
                    25-已撤回
                    30-供应链审核中
                    40-待财务审核
                    50-待确认(同步OMS成功)
                    55-OMS变更驳回
                    60-待处理(OMS确认后)
                    70-进行中(OMS发布以后)
                    80-已取消
                    100-已完成
                -->

              <template v-if="row.complete_status == 10 || row.complete_status == 23 || row.complete_status == 25">
                <el-button link type="primary" @click="gotoEdit(row)">编辑</el-button>
                <span class="text-[#E9E9E9] mx-[8px]">|</span>
              </template>

              <el-button link type="primary" @click="gotoDetail(row)">详情</el-button>

              <template v-if="row.complete_status == 10 || row.complete_status == 25 || row.complete_status == 80">
                <span class="text-[#E9E9E9] mx-[8px]">|</span>
                <el-popconfirm :title="`是否确认删除这条数据`" @confirm="onDeleteClick(row)">
                  <template #reference>
                    <el-button class="reset-margin" link type="primary" :size="size">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </template>

            <template v-if="row.status == 0">
              <el-button link type="primary" @click="gotoDetail(row)">详情</el-button>
              <span v-if="row.status == 1" class="text-[#E9E9E9] mx-[8px]">|</span>
              <!-- <el-popconfirm :title="`是否确认删除这条数据`" @confirm="onDeleteClick(row)">
                <template #reference>
                  <el-button class="reset-margin" link type="primary" :size="size">删除</el-button>
                </template>
              </el-popconfirm> -->
            </template>
            <span class="text-[#E9E9E9] mx-[8px]">|</span>
            <el-button link type="primary" @click="copyOrderBaic(row)">复制</el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
.newTag {
  margin-top: 8px !important;
  margin-right: 4px !important;
  font-size: 10px !important;
  font-family: PingFang-SC-Medium, PingFang-SC !important;
  font-weight: 500 !important;
  color: #333333 !important;
  background: #f0f2f5 !important;
  border-radius: 2px !important;
  border: none;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #ffffff;
  color: var(--el-color-primary);
}
</style>
