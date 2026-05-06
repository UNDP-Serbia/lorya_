import React from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  type SxProps,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export type DrawerAccordionItemProps = {
  title: string
  defaultExpanded?: boolean
  children?: React.ReactNode
  sx?: SxProps
}

export const DrawerAccordionItem: React.FC<DrawerAccordionItemProps> = ({
  title,
  defaultExpanded = false,
  children,
  sx = {},
}) => {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      square
      sx={{ boxShadow: 'none', '&:before': { display: 'none' }, ...sx }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title}-content`}
        id={`${title}-header`}
        sx={{ '&:focus': { outline: 'none' } }}
      >
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  )
}
