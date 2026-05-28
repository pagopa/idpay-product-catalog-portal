import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import ProductsList from "../../components/ProductList/ProductList";
import { theme } from "@pagopa/mui-italia";
import ProductsListSkeleton from "../../components/ProductsListSkeleton/ProductsListSkeleton";
import { getEligibleProducts } from "../../services/products/productsRepository";
import type { UiProduct } from "../../services/products/productsRepository";
import { logger } from "../../services/logging/logger";
import { getInitiativeConfig } from "../../config/initiativeResolver";

const SearchProductPage = () => {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initiativeConfig = getInitiativeConfig();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getEligibleProducts();
        setProducts(data);
      } catch (error) {
        logger.error(
          error instanceof Error
            ? error.message
            : "Unexpected error while loading products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      <Box textAlign="center" py={6} px={2} bgcolor={theme.palette.primary.contrastText}>
        <Typography variant="h1" fontWeight="700" gutterBottom>
          {initiativeConfig.copy.searchPage.title}
        </Typography>

        <Typography
          variant="h6"
          fontWeight="400"
          gutterBottom
          sx={{ whiteSpace: "pre-line" }}
        >
          {initiativeConfig.copy.searchPage.description}
        </Typography>
      </Box>

      <Box sx={{ pb: { xs: 4, md: 2 } }}>
        {isLoading ? <ProductsListSkeleton /> : <ProductsList data={products} />}
      </Box>
    </>
  );
};

export default SearchProductPage;
