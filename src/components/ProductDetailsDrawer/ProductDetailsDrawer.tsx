import React from 'react'
import {
  Box, Typography, IconButton, Drawer, SwipeableDrawer, Tooltip, Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { theme } from '@pagopa/mui-italia'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { Product } from '../ProductList/ProductList'
import { getInitiativeConfig } from '../../config/initiativeResolver'

type Props = {
  open: boolean
  onClose: () => void
  onOpen?: () => void
  product: Product | null
  width?: number | string
  mobileHeight?: number | string
  forceMode?: 'drawer' | 'swipeable'
}

const countryLabel: Record<string, string> = {
  AT: 'Austria',
  BE: 'Belgio',
  BG: 'Bulgaria',
  HR: 'Croazia',
  CY: 'Cipro',
  CZ: 'Repubblica Ceca',
  DK: 'Danimarca',
  EE: 'Estonia',
  FI: 'Finlandia',
  FR: 'Francia',
  DE: 'Germania',
  GR: 'Grecia',
  HU: 'Ungheria',
  IE: 'Irlanda',
  IT: 'Italia',
  LV: 'Lettonia',
  LT: 'Lituania',
  LU: 'Lussemburgo',
  MT: 'Malta',
  NL: 'Paesi Bassi',
  PL: 'Polonia',
  PT: 'Portogallo',
  RO: 'Romania',
  SK: 'Slovacchia',
  SI: 'Slovenia',
  ES: 'Spagna',
  SE: 'Svezia',
  NO: 'Norvegia',
  CH: 'Svizzera',
  IS: 'Islanda',
  LI: 'Liechtenstein',
  UK: 'Regno Unito',
}

const truncatedTextSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  minWidth: 0,
}

const multilineTruncatedTextSx = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  whiteSpace: 'normal',
  minWidth: 0,
}

const TruncatedTooltipText = ({
  text,
  variant,
  fontWeight,
  color,
  mt,
  fontStyle,
  multiline = false,
}: {
  text?: string
  variant: React.ComponentProps<typeof Typography>['variant']
  fontWeight?: React.ComponentProps<typeof Typography>['fontWeight']
  color?: React.ComponentProps<typeof Typography>['color']
  mt?: React.ComponentProps<typeof Typography>['mt']
  fontStyle?: React.ComponentProps<typeof Typography>['fontStyle']
  multiline?: boolean
}) => {
  const displayText = text?.trim() || '-'

  return (
    <Tooltip
      title={displayText === '-' ? '' : displayText}
      placement="bottom-start"
      disableHoverListener={displayText === '-'}
    >
      <Typography
        variant={variant}
        fontWeight={fontWeight}
        color={color}
        mt={mt}
        fontStyle={fontStyle}
        noWrap={!multiline}
        sx={multiline ? multilineTruncatedTextSx : truncatedTextSx}
      >
        {displayText}
      </Typography>
    </Tooltip>
  )
}

const FieldRow = ({ label, value }: { label: string; value?: string }) => (
  <Box mb={2}>
    <Typography variant="body2" fontWeight={400} sx={{ color: theme.palette.action.active, display: 'block' }}>
      {label}
    </Typography>
    <TruncatedTooltipText variant="body2" fontWeight={600} fontStyle="semibold" text={value} />
  </Box>
)

export const ProductDetailsDrawer: React.FC<Props> = ({
  open, onClose, onOpen, product, width = 380, mobileHeight = '75%', forceMode,
}) => {
  const isMobile = useIsMobile()
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  const headerTitle =
    product?.productName ||
    '-'

  const Header = (
    <Box position="relative" p={2} pb={1}>
      <IconButton
        aria-label="chiudi"
        onClick={onClose}
        sx={{ position: 'absolute', top: 10, right: 8, color: theme.palette.action.active }}
      >
        <CloseIcon />
      </IconButton>

      <TruncatedTooltipText variant="h6" fontWeight={600} mt={5} text={headerTitle} multiline />

      <Divider sx={{ mt: 2.5, mb: 1.5, borderColor: theme.palette.divider }} />

      <Typography variant="overline" mt={2} color={theme.palette.text.primary} display={'block'}>
        SCHEDA PRODOTTO
      </Typography>
    </Box>
  )

  const initiativeConfig = getInitiativeConfig()

  const formatValue = (
    value: string | undefined,
    formatter?: 'country'
  ): string | undefined => {
    if (!value) return value

    if (formatter === 'country') {
      return countryLabel[value] ?? value
    }

    return value
  }

  const Content = product ? (
    <Box p={2}>
      {initiativeConfig.detailFields.map((field) => {
        const rawValue = product[field.key as keyof Product] as
          | string
          | undefined

        return (
          <FieldRow
            key={field.key}
            label={field.label}
            value={formatValue(rawValue, field.formatter)}
          />
        )
      })}
    </Box>
  ) : null

  if (forceMode === 'drawer' || (!isMobile && forceMode !== 'swipeable')) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width, maxWidth: '100vw', overflowX: 'hidden', wordBreak: 'break-word' } } }}
      >
        {Header}
        {Content}
      </Drawer>
    )
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen ?? (() => { })}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      slotProps={{
        paper: {
          sx: {
            height: mobileHeight,
            width: '100%',
            maxHeight: '100%',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            wordBreak: 'break-word',
          },
        },
      }}
    >
      {Header}
      {Content}
    </SwipeableDrawer>
  )
}
