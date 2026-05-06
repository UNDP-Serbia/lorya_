import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  type SxProps,
} from '@mui/material'
import { useState, useEffect, type ReactNode } from 'react'
import addIcon from '../../assets/add-icon.svg'
import removeIcon from '../../assets/minus-icon.svg'
import arrowForwardIcon from '../../assets/arrow-forward.svg'

interface CustomAccordionProps {
  text: string
  children: ReactNode
  iconPosition?: 'start' | 'end'
  leadingIcon?: ReactNode
  disabled?: boolean
  defaultExpanded?: boolean
  expanded?: boolean
  absoluteMarker?: ReactNode
  sx?: SxProps
}

export const CustomAccordion = ({
  text,
  children,
  iconPosition = 'end',
  leadingIcon,
  disabled = false,
  defaultExpanded = false,
  expanded: controlledExpanded,
  absoluteMarker = <></>,
  sx = {},
}: CustomAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [defaultExpanded])

  useEffect(() => {
    if (controlledExpanded !== undefined) {
      setIsExpanded(controlledExpanded)
    }
  }, [controlledExpanded])

  const handleToggle = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <Accordion
      disabled={disabled}
      expanded={isExpanded}
      onChange={handleToggle}
      sx={{
        borderBottom: '0.5px solid #BCDDFF',
        boxShadow: 'none',
        '&.Mui-disabled': {
          backgroundColor: '#F1F1F1',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
        '&:last-of-type': {
          borderRadius: 0,
        },
        '&:before': { display: 'none' },
        '& .MuiAccordionSummary-root': {
          outline: 'none',
          backgroundColor: 'transparent',
          margin: 0,
          '&:focus': {
            outline: 'none',
            backgroundColor: 'transparent',
          },
          '&.Mui-expanded': {
            minHeight: '48px',
          },
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
        },
        ...sx,
      }}
    >
      <AccordionSummary
        expandIcon={
          iconPosition === 'start' ? (
            <img
              src={arrowForwardIcon}
              alt={'remove'}
              style={{
                fontSize: 16,
                transition: 'transform 0.2s ease',
                transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)',
                paddingLeft: '8px',
                paddingRight: '3px',
              }}
            />
          ) : (
            <Box>
              {isExpanded ? (
                <img src={removeIcon} alt={'remove'} />
              ) : (
                <img src={addIcon} alt={'add'} />
              )}
            </Box>
          )
        }
        sx={{
          flexDirection: iconPosition === 'start' ? 'row-reverse' : 'row',
          gap: 1,
          paddingLeft: iconPosition === 'start' ? '60px' : '',
        }}
      >
        {leadingIcon && (
          <Box
            sx={{
              width: 56,
              height: 30,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRight: '0.5px solid #BCDDFF',
              flexShrink: 0,
              position: 'absolute',
              left: 0,
              mt: '-3px',
            }}
          >
            {leadingIcon}
          </Box>
        )}
        {absoluteMarker && absoluteMarker}
        <Typography sx={{ fontSize: 13, color: '#292929', fontWeight: 500 }}>
          {text}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ textAlign: 'left', pt: 0, mt: -0.5 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}
