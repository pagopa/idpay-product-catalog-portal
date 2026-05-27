import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  TableSortLabel,
  Box,
} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { theme } from '@pagopa/mui-italia'
import CustomPaginator from '../Paginator/CustomPaginator'
import ProductsFilters from '../ProductsFilter/ProductsFilter'
import { useIsMobile } from '../../hooks/useIsMobile'
import MobileProductCard from './MobileProductCard'
import { ProductDetailsDrawer } from '../ProductDetailsDrawer/ProductDetailsDrawer'
import DownloadCsvLink from '../DownloadCsvLink/DownloadCsvLink'
import { getInitiativeConfig } from '../../config/initiativeConfig'

export const baseUrlEprel = "https://eprel.ec.europa.eu/screen/product";

export interface Product {
  [key: string]: string | undefined
}

interface Column {
  id: keyof Product | 'actions'
  label: string
  align: 'left' | 'center' | 'right' | 'inherit' | 'justify'
  width: string
}

const ProductsList = ({ data: rawData }: { data: Product[] }) => {
  const initiativeConfig = getInitiativeConfig()

  const columns: Column[] = [
    ...initiativeConfig.tableColumns.map((col) => ({
      id: col.key as keyof Product,
      label: col.label,
      align: 'left' as const,
      width: '20%',
    })),
    { id: 'actions', label: '', align: 'right', width: '7%' },
  ]

  const [orderBy, setOrderBy] = useState<keyof Product>('category')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const sanitizeProduct = (product: Product): Product => {
    const sanitized: Product = { ...product }
    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key]
      if (typeof value === 'string') {
        sanitized[key] = value.trim().replace(/\s+/g, ' ')
      }
    })
    return sanitized
  }

  const data = useMemo(() => rawData.map((d) => sanitizeProduct(d)), [rawData])

  const categories = useMemo(
    () => [...new Set(data.map((d) => d.category).filter(Boolean))] as string[],
    [data]
  )

  const brands = useMemo(
    () => [...new Set(data.map((d) => d.brand).filter(Boolean))] as string[],
    [data]
  )

  const classes = useMemo(
    () => [...new Set(data.map((d) => d.energyClass).filter(Boolean))] as string[],
    [data]
  )

  const modelsOrGtins = useMemo(
    () =>
      [...new Set(data.map((d) => d.model ?? d.gtin).filter(Boolean))] as string[],
    [data]
  )

  const isMobile = useIsMobile()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedProduct(null)
  }

  const handleOpenDrawer = (product: Product) => {
    setSelectedProduct(product)
    setDrawerOpen(true)
  }

  const handleSort = (property: keyof Product) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const normalizeString = (str?: string): string =>
    (str ?? '').toLowerCase().replace(/\s+/g, '')

  const filteredAndSortedData = useMemo(() => {
    setPage(1)

    return data
      .filter((item) => {
        const matchesSearch =
          !search ||
          normalizeString(item.model).includes(normalizeString(search)) ||
          normalizeString(item.gtin).includes(normalizeString(search))

        const matchesCategory =
          !selectedCategory || item.category === selectedCategory
        const matchesBrand = !selectedBrand || item.brand === selectedBrand
        const matchesClass =
          !selectedClass || item.energyClass === selectedClass

        return matchesSearch && matchesCategory && matchesBrand && matchesClass
      })
      .sort((a, b) => {
        const aValue = (a[orderBy] ?? '') as string
        const bValue = (b[orderBy] ?? '') as string
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      })
  }, [data, order, orderBy, search, selectedCategory, selectedBrand, selectedClass])

  const startIndex = (page - 1) * rowsPerPage
  const paginatedData = filteredAndSortedData.slice(
    startIndex,
    startIndex + rowsPerPage
  )

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <ProductsFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          categories={categories}
          brands={brands}
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          modelsOrGtins={modelsOrGtins}
        />

        <Box sx={{ px: { xs: 2, md: 8 } }}>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {paginatedData.map((row, index) => (
                <MobileProductCard
                  key={`${row.gtin ?? row.model ?? index}`}
                  product={row}
                  onClick={() => handleOpenDrawer(row)}
                />
              ))}
            </Box>
          ) : (
            <TableContainer
              component="div"
              sx={{
                width: '100%',
                overflowX: 'auto',
                backgroundColor: 'transparent',
              }}
            >
              <Table
                sx={{
                  width: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  backgroundColor: 'transparent',
                }}
              >
                <TableHead sx={{ backgroundColor: 'transparent' }}>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align}
                        sortDirection={orderBy === col.id ? order : false}
                        sx={{
                          width: col.width,
                          fontWeight: 600,
                          fontSize: 14,
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                          px: 3,
                          py: 1.5,
                          backgroundColor: 'transparent',
                          verticalAlign: 'bottom',
                        }}
                      >
                        {col.id !== 'actions' ? (
                          <TableSortLabel
                            active={orderBy === col.id}
                            direction={orderBy === col.id ? order : 'asc'}
                            onClick={() =>
                              handleSort(col.id as keyof Product)
                            }
                            sx={{
                              '& .MuiTableSortLabel-icon': {
                                color: '#6b7280 !important',
                              },
                              '&.Mui-active': {
                                color: '#1f2937',
                              },
                            }}
                          >
                            {col.label}
                          </TableSortLabel>
                        ) : (
                          col.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={`${row.gtin ?? row.model ?? index}`}
                      hover
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': { backgroundColor: '#f9fafb' },
                        borderBottom: '2px solid #E3E7EB',
                      }}
                    >
                      {initiativeConfig.tableColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          align="left"
                          sx={{ px: 3, py: 1.5 }}
                        >
                          <Tooltip
                            title={row[col.key] ?? ''}
                            arrow
                            placement="bottom-start"
                          >
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                color: '#1f2937',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                              }}
                            >
                              {row[col.key]}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      ))}

                      <TableCell align="right" sx={{ px: 3, py: 1.5 }}>
                        <IconButton
                          size="small"
                          sx={{ width: 28, height: 28 }}
                          onClick={() => handleOpenDrawer(row)}
                        >
                          <ArrowForwardIosIcon
                            sx={{ fontSize: 14, color: '#0B3EE3' }}
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <CustomPaginator
            sortedData={filteredAndSortedData}
            page={page}
            setPage={setPage}
            ROWS_PER_PAGE={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
          />

          <DownloadCsvLink />
        </Box>
      </Box>

      <ProductDetailsDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        product={selectedProduct}
      />
    </>
  )
}

export default ProductsList
