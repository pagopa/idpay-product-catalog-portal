# idpay-product-catalog-portal

Product catalogs, frontend apps, and supporting services.

---

#  Local Development

This project supports **multiple initiatives** (e.g. bonus_decoder, bonus_elettrodomestici, etc.).

The initiative is selected via the `VITE_BASE_PATH` environment variable.

##  Install dependencies

```bash
yarn install
```

---

## Run in development mode (per initiative)

### Bonus Decoder

```powershell
$env:VITE_BASE_PATH="/elenco-informatico-decoder/";
yarn dev
```

App will be available at:
```
http://localhost:5173/elenco-informatico-decoder/
```

---

### Bonus Elettrodomestici

```powershell
$env:VITE_BASE_PATH="/elenco-informatico-elettrodomestici/";
yarn dev
```

App will be available at:
```
http://localhost:5173/elenco-informatico-elettrodomestici/
```

---

## Adding a new initiative

If you introduce a new initiative:

Example:
```
/elenco-informatico-nuova-misura/
```

You can run it with:

```powershell
$env:VITE_BASE_PATH="/elenco-informatico-nuova-misura/";
yarn dev
```

No changes to `vite.config.ts` are required.

---

# Production Build

During build:

- Only the dataset JSON matching the initiative will be included in `dist/data`
- Other exports will be automatically removed

---

## Build Bonus Decoder

```powershell
$env:VITE_BASE_PATH="/elenco-informatico-decoder/";
yarn build
```

Output:
```
dist/
 └── data/
     └── bonus_decoder_product_export.json
```

---

## Build Bonus Elettrodomestici

```powershell
$env:VITE_BASE_PATH="/elenco-informatico-elettrodomestici/";
yarn build
```

Output:
```
dist/
 └── data/
     └── bonus_elettrodomestici_product_export.json
```

---
