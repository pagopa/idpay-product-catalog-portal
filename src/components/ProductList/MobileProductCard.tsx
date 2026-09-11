import { Card, CardContent, Typography, Box } from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { BASE_URL_EPREL } from '../../utils/constants'
import { ButtonNaked, theme } from '@pagopa/mui-italia'
import { getInitiativeConfig } from '../../config/initiativeResolver'
import type { Product } from "./ProductList.tsx";

interface MobileProductCardProps {
  product: Product
  onClick?: () => void
}

const MobileProductCard = ({ product, onClick }: MobileProductCardProps) => {
  const initiativeConfig = getInitiativeConfig()

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: '12px',
        boxShadow: `
          0px 6px 30px 5px rgba(0, 43, 85, 0.10),
          0px 16px 24px 2px rgba(0, 43, 85, 0.05),
          0px 8px 10px -5px rgba(0, 43, 85, 0.10)
        `,
        backgroundColor: '#FFFFFF',
      }}
    >
      <CardContent sx={{ px: 3 }}>
        {initiativeConfig.tableColumns.map((col) => {
          const value = product[col.key]
          const isEprelLink = col.link?.type === 'eprel'
          const canOpen =
            isEprelLink &&
            product.eprelCode &&
            product.productGroup

          return (
            <Box key={col.key} mb={2}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: theme.typography.fontWeightBold,
                }}
              >
                {col.label}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: canOpen ? '#0B3EE3' : theme.palette.text.primary,
                  fontWeight: canOpen
                    ? theme.typography.fontWeightBold
                    : theme.typography.fontWeightMedium,
                  textDecoration: canOpen ? 'underline' : 'none',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }}
                onClick={() => {
                  if (canOpen) {
                    window.open(
                      `${BASE_URL_EPREL}/${product.productGroup}/${product.eprelCode}`,
                      '_blank'
                    )
                  }
                }}
              >
                {value || '-'}
              </Typography>
            </Box>
          )
        })}

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
          <ButtonNaked
            variant="text"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
            onClick={onClick}
            sx={{
              textTransform: 'none',
              color: '#0B3EE3',
              fontWeight: 700,
              fontSize: 14,
              px: 0,
            }}
          >
            Vedi dettaglio
          </ButtonNaked>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MobileProductCard
