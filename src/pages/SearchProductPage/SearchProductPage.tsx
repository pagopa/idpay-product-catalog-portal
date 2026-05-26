import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import ProductsList from "../../components/ProductList/ProductList";
import { theme } from "@pagopa/mui-italia";
import ProductsListSkeleton from "../../components/ProductsListSkeleton/ProductsListSkeleton";

const SearchProductPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const doFetch = async () => {
      await fetch(`${import.meta.env.BASE_URL}data/product_export.json`)
        .then((res) => {
          if (!res.ok) throw new Error("Errore nel caricamento del file JSON");
          return res.json();
        })
        .then((data) => setProducts(data))
        .catch((err) => console.log(err.message))
        .finally(() => setIsLoading(false));
    }
    doFetch();
  }, []);

  return (
    <>
      <Box textAlign="center" py={6} px={2} bgcolor={theme.palette.primary.contrastText}>
        <Typography variant="h1" fontWeight="700" gutterBottom>
          Cerca un prodotto
        </Typography>

        <Typography variant="h6" fontWeight="400">
          Consulta la lista per verificare se il prodotto che vuoi acquistare
        </Typography>
        <Typography variant="h6" fontWeight="400">
          usando il Bonus Elettrodomestici è presente nell'elenco.
        </Typography>
        <Typography variant="h6" fontWeight="400" gutterBottom>
          La lista è in aggiornamento.
        </Typography>
      </Box>

      <Box sx={{ pb: { xs: 4, md: 2 } }}>
        {isLoading ? <ProductsListSkeleton /> : <ProductsList data={products} />}
      </Box>
    </>
  );
};

export default SearchProductPage;