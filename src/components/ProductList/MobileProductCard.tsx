import { Card, CardContent, Typography, Box } from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { baseUrlEprel, type Product } from '../ProductList/ProductList'
import { ButtonNaked, theme } from '@pagopa/mui-italia'

interface MobileProductCardProps {
  product: Product
  onClick?: () => void
}

const MobileProductCard = ({ product, onClick }: MobileProductCardProps) => {
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
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightBold }}>
          Categoria
        </Typography>
        <Typography variant="body2" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', mb: 2, color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightMedium }}>
          {product.category}
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightBold }}>
          Marca
        </Typography>
        <Typography variant="body2" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', mb: 2, color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightMedium }}>
          {product.brand}
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightBold }}>
          Modello
        </Typography>
        <Typography variant="body2" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', mb: 2, color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightMedium }}>
          {product.model}
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightBold }}>
          Codice GTIN/EAN
        </Typography>
        <Typography variant="body2" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', mb: 2, color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightMedium }}>
          {product.gtin}
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightBold }}>
          Codice EPREL
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: (product.eprelCode && product.productGroup) ? '#0B3EE3' : '',
            fontWeight: theme.typography.fontWeightBold,
            textDecoration: (product.eprelCode && product.productGroup) ? 'underline' : 'none',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block',
          }}
          onClick={() => {
            if (product.eprelCode && product.productGroup) {
              window.open(`${baseUrlEprel}/${product.productGroup}/${product.eprelCode}`, '_blank');
            }
          }}
        >
          {product.eprelCode || '-'}
        </Typography>

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