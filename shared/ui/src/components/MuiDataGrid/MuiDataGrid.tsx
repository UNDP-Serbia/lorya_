import * as React from 'react'
import {
  DataGrid,
  type DataGridProps,
  gridClasses,
  type GridRenderCellParams,
  type GridRowParams,
  type GridRowHeightParams,
} from '@mui/x-data-grid'

export type MuiDataGridProps = DataGridProps<any>

export { gridClasses }
export type { GridRenderCellParams, GridRowParams, GridRowHeightParams }

export const MuiDataGrid: React.FC<MuiDataGridProps> = props => {
  return <DataGrid {...props} />
}
