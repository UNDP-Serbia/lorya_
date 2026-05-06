import {
  LeftDrawer,
  ManageModelSettings,
  RunHistoryTable,
} from '../../components'
import React from 'react'
import { LEFT_WIDTH } from '../HomePage'
import { ModelTable } from '../../components/ModelSettingsTable'
import { useParams, useSearchParams } from 'react-router'
import { SettingsRightDrawer } from '../../components/SettingsRightDrawer'
import { useFileManagerEntries } from '../../query'

const RUN_HISTORY_LABEL = 'Run History'

export const Settings = () => {
  const [leftCollapsed, setLeftCollapsed] = React.useState(false)
  const [rightCollapsed, setRightCollapsed] = React.useState(true)
  const [searchParams] = useSearchParams()
  const { model } = useParams<{ model: string }>()
  const paramModelId = searchParams.get('model_id') || ''
  const decodedModel = model ? decodeURIComponent(model) : ''
  const isRunHistory = decodedModel === RUN_HISTORY_LABEL
  const { data: treeRoot } = useFileManagerEntries()

  const isLoading = false
  const isLoadingTable = false

  return (
    <div className='flex min-h-screen bg-[#EAEAEA]'>
      <LeftDrawer
        width={LEFT_WIDTH}
        collapsed={leftCollapsed}
        onToggle={setLeftCollapsed}
        isEditor={false}
        entries={treeRoot}
      />
      <main
        className='flex-1 p-3'
        style={{
          marginLeft: leftCollapsed ? 64 : LEFT_WIDTH,
          marginRight: 64,
          overflow: 'auto',
        }}
      >
        <div>
          {isRunHistory && <RunHistoryTable />}
          {!isLoading && paramModelId && !isRunHistory && (
            <ManageModelSettings modelId={paramModelId} />
          )}
          {!isLoadingTable && !paramModelId && !isRunHistory && <ModelTable />}
        </div>
      </main>
      <SettingsRightDrawer
        collapsed={rightCollapsed}
        onToggle={setRightCollapsed}
      />
    </div>
  )
}
