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

export const baseUrlEprel = "https://eprel.ec.europa.eu/screen/product";

export interface Product {
  gtin: string
  model: string
  category: string
  brand: string
  eprelCode?: string
  countryOfProduction: string
  energyClass?: string
  productName?: string
  productGroup?: string
  capacity?: string
  productCode?: string
}

interface Column {
  id: keyof Product | 'actions'
  label: string
  align: 'left' | 'center' | 'right' | 'inherit' | 'justify'
  width: string
}

const columns: Column[] = [
  { id: 'category', label: 'Categoria', align: 'left', width: '23%' },
  { id: 'brand', label: 'Marca', align: 'left', width: '15%' },
  { id: 'model', label: 'Modello', align: 'left', width: '22%' },
  { id: 'gtin', label: 'Codice GTIN / EAN', align: 'left', width: '18%' },
  { id: 'eprelCode', label: 'Codice EPREL', align: 'left', width: '15%' },
  { id: 'actions', label: '', align: 'right', width: '7%' },
]

interface ProductsListProps {
  data: Product[]
}

const ProductsList = (json: ProductsListProps) => {
  const [orderBy, setOrderBy] = useState<keyof Product>('category')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const categoryLabel: Record<string, string> = {
    WASHINGMACHINES: 'Lavatrice',
    WASHERDRIERS: 'Lavasciuga',
    OVENS: 'Forno',
    RANGEHOODS: 'Cappa da cucina',
    DISHWASHERS: 'Lavastoviglie',
    TUMBLEDRYERS: 'Asciugatrice',
    REFRIGERATINGAPPL: 'Apparecchio di refrigerazione',
    COOKINGHOBS: 'Piano cottura'
  };

  const sanitizeProduct = <T extends Product>(product: T): T => {
    const sanitized = { ...product }

    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key as keyof T]
      if (typeof value === 'string') {
        (sanitized as Record<string, unknown>)[key] = value.trim().replace(/\s+/g, ' ')
      }
    })

    return sanitized
  }

  const rawData = json.data;
  const data = useMemo(
    () =>
      rawData.map((d) => sanitizeProduct({
        ...d,
        category: categoryLabel[d.category] || d.category
      })),
    [rawData]
  );

  const categories = useMemo(
    () => [...new Set(data.map((d) => d.category))].sort((a, b) => a.localeCompare(b)),
    [data]
  )

  const brands = useMemo(
    () => [...new Set(data.map((d) => d.brand))].sort((a, b) => a.localeCompare(b)),
    [data]
  )

  const classes = useMemo(() => {
    const normalized = data
      .map((d) => d.energyClass?.trim().toUpperCase())
      .filter((value) => value && value !== "");

    const unique = [...new Set(normalized)];

    const ENERGY_CLASS_REGEX = /^([A-G])(\+*)$/;

    const rank = (cls: string) => {
      if (cls.length > 5) return 999;

      const match = ENERGY_CLASS_REGEX.exec(cls);
      if (!match) return 999;

      const letter = match[1];
      const pluses = match[2].length;

      return (letter.charCodeAt(0) - 65) * 10 - pluses;
    };

    const sorted = unique.sort((a, b) => rank(a!) - rank(b!));

    return sorted;
  }, [data]);

  const models = useMemo(
    () => [...new Set(data.map((d) => d.model || d.gtin))].sort((a, b) => a.localeCompare(b)),
    [data]
  )

  const gtins = useMemo(
    () => [...new Set(data.map((d) => d.gtin))].sort((a, b) => a.localeCompare(b)),
    [data]
  )

  const modelsOrGtins = useMemo(
    () => [...new Set([...models, ...gtins])].sort((a, b) => a.localeCompare(b)),
    [models, gtins]
  )

  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

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

  const normalizeString = (str: string): string => {
    return str.toLowerCase().replace(/\s+/g, '');
  };

  const filteredAndSortedData = useMemo(() => {
    setPage(1);

    const filtered = data
      .filter((item) => {
        const matchesSearch =
          !search ||
          normalizeString(item.model || "").includes(normalizeString(search)) ||
          normalizeString(item.gtin || "").includes(normalizeString(search));

        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesBrand = !selectedBrand || item.brand === selectedBrand;
        const matchesClass = !selectedClass || item?.energyClass === selectedClass;

        return matchesSearch && matchesCategory && matchesBrand && matchesClass;
      })
      .sort((a, b) => {
        const aValue = (a[orderBy] ?? "") as string;
        const bValue = (b[orderBy] ?? "") as string;
        return order === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });

    return filtered;
  }, [data, order, orderBy, search, selectedCategory, selectedBrand, selectedClass]);

  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);

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
              {paginatedData.map((row) => (
                <MobileProductCard key={row.gtin} product={row} onClick={() => handleOpenDrawer(row)} />
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
                          verticalAlign: 'bottom'
                        }}
                      >
                        {col.id !== 'actions' ? (
                          <TableSortLabel
                            active={orderBy === col.id}
                            direction={orderBy === col.id ? order : 'asc'}
                            onClick={() => handleSort(col.id as keyof Product)}
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
                  {paginatedData.map((row) => (
                    <TableRow
                      key={row.gtin}
                      hover
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': { backgroundColor: '#f9fafb' },
                        borderBottom: '2px solid #E3E7EB',
                      }}
                    >
                      <TableCell align="left" sx={{ px: 3, py: 1.5 }}>
                        <Tooltip title={row.category} arrow placement="bottom-start">
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
                            {row.category}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="left" sx={{ px: 3, py: 1.5 }}>
                        <Tooltip title={row.brand} arrow placement="bottom-start">
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
                            {row.brand}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="left" sx={{ px: 3, py: 1.5, maxWidth: 250 }}>
                        <Tooltip title={row.model} arrow placement="bottom-start">
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              color: '#1f2937',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'block',
                            }}
                          >
                            {row.model}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="left" sx={{ px: 3, py: 1.5 }}>
                        <Tooltip title={row.gtin} arrow placement="bottom-start">
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
                            {row.gtin}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="left" sx={{ px: 3, py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: (row.eprelCode && row.productGroup) ? '#0B3EE3' : '',
                            fontWeight: theme.typography.fontWeightBold,
                            cursor: (row.eprelCode && row.productGroup) ? 'pointer' : 'default',
                            textDecoration: (row.eprelCode && row.productGroup) ? 'underline' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            maxWidth: '100%',
                          }}
                          onClick={() => {
                            if (row.eprelCode && row.productGroup) {
                              window.open(`${baseUrlEprel}/${row.productGroup}/${row.eprelCode}`, '_blank');
                            }
                          }}
                        >
                          {row.eprelCode || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ px: 3, py: 1.5 }}>
                        <IconButton size="small" sx={{ width: 28, height: 28 }} onClick={() => handleOpenDrawer(row)}>
                          <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#0B3EE3' }} />
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
      <ProductDetailsDrawer open={drawerOpen} onClose={handleDrawerClose} product={selectedProduct} />
    </>
  )
}

export default ProductsList
