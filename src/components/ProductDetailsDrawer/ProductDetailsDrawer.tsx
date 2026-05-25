import React from 'react'
import {
  Box, Typography, IconButton, Drawer, SwipeableDrawer,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { theme } from '@pagopa/mui-italia'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { Product } from '../ProductList/ProductList'

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

const FieldRow = ({ label, value }: { label: string; value?: string }) => (
  <Box mb={2}>
    <Typography variant="body2" fontWeight={400} sx={{ color: theme.palette.action.active, display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} fontStyle={'semibold'}>
      {value || '-'}
    </Typography>
  </Box>
)

export const ProductDetailsDrawer: React.FC<Props> = ({
  open, onClose, onOpen, product, width = 420, mobileHeight = '75%', forceMode,
}) => {
  const isMobile = useIsMobile()
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  const headerTitle = product?.productName ?? '-'

  const Header = (
    <Box position="relative" p={2} pb={1}>
      <IconButton
        aria-label="chiudi"
        onClick={onClose}
        sx={{ position: 'absolute', top: 10, right: 8, color: theme.palette.action.active }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" fontWeight={700} mt={5}>
        {headerTitle}
      </Typography>

      <Typography variant="overline" mt={4} color={theme.palette.text.primary} display={'block'}>
        SCHEDA PRODOTTO
      </Typography>
    </Box>
  )

  const Content = product ? (
    <Box p={2}>
      <FieldRow label="Codice GTIN/EAN" value={product.gtin ?? '-'} />
      <FieldRow label="Codice Prodotto" value={product.productCode ?? '-'} />
      <FieldRow label="Categoria" value={product.category ?? '-'} />
      <FieldRow label="Marca" value={product.brand ?? '-'} />
      <FieldRow label="Modello" value={product.model ?? '-'} />
      <FieldRow label="Capacità" value={product.capacity ?? '-'} />
      <FieldRow label="Classe energetica" value={product.energyClass} />
      <FieldRow
        label="Paese di produzione"
        value={countryLabel[product.countryOfProduction] ?? product.countryOfProduction}
      />
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