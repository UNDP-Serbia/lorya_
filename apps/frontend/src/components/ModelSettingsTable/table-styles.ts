import { gridClasses } from '@shared/ui'

export const TableStyles = {
  border: 'none',
  borderRadius: 0,
  fontFamily: 'Space Grotesk',

  //cell select outline removal
  '& .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  '& .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus': {
    outline: 'none',
  },

  '& .MuiDataGrid-columnHeader': {
    borderRadius: 0,
  },
  [`& .${gridClasses.cell}`]: {
    borderTop: 'none',
    wordBreak: 'break-word',
    py: 1,
    lineHeight: 'normal',
    whiteSpace: 'pre-wrap',
    color: '#292929',
    position: 'relative',
    borderRight: 'none',
  },

  //border between cells
  [`& .${gridClasses.cell}::after`]: {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 12,
    bottom: 12,
    width: '1px',
    backgroundColor: '#e0e0e0',
  },
  //last cell no border
  '& .no-separator::after': {
    display: 'none',
  },

  [`& .${gridClasses.row}`]: {
    borderBottom: '1px solid white',
    fontSize: '11px',
    cursor: 'pointer',
    '&:first-child': {
      borderTop: '1px solid white',
    },
  },
  [`& .${gridClasses.columnHeader}`]: {
    backgroundColor: '#eaeaea !important',
    fontWeight: 'bold',
    borderBottom: '3px solid white',
    borderTop: '1px solid white',
    borderRadius: 0,
    fontSize: '9px',
    textTransform: 'uppercase',

    '&:first-child': {
      borderRadius: 0,
      borderBottom: 'unset',
    },
  },
}
