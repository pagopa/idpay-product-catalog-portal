import React, { useState } from 'react'
import {
    Autocomplete,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    MenuItem,
    Button,
    Drawer,
    Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterAlt from '@mui/icons-material/FilterAlt'
import CloseIcon from '@mui/icons-material/Close'
import { useIsMobile } from '../../hooks/useIsMobile'

interface ProductsFiltersProps {
    search: string
    setSearch: (value: string) => void
    selectedCategory: string | null
    setSelectedCategory: (value: string | null) => void
    selectedBrand: string | null
    setSelectedBrand: (value: string | null) => void
    categories: string[]
    brands: string[]
    classes: (string | undefined)[]
    selectedClass: string | null
    setSelectedClass: (value: string | null) => void
    modelsOrGtins: string[]
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    categories,
    brands,
    classes,
    selectedClass,
    setSelectedClass,
    modelsOrGtins,
}) => {
    const [searchFocused, setSearchFocused] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const isMobile = useIsMobile()

    const baseInputSx = {
        '& .MuiOutlinedInput-root': {
            fontWeight: 500,
            '& fieldset': { borderColor: '#E0E0E0' },
            '&:hover fieldset': { borderColor: '#B0B0B0' },
            '&.Mui-focused fieldset': {
                borderColor: '#0B3EE3',
                borderWidth: '2px',
            },
        },
        '& .MuiInputLabel-root': {
            color: '#6B7280',
            fontWeight: 600,
        },
        '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink': {
            color: '#0B3EE3',
        },
    }

    const searchInputSx = {
        ...baseInputSx,
        '& .MuiInputLabel-root': {
            color: '#6B7280',
            fontWeight: 600,
            transform: 'translate(28px, 8px) scale(1)',
        },
        '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink': {
            color: '#0B3EE3',
            transform: 'translate(17px, -8px) scale(0.7)',
        },
    }

    const dropdownInputSx = {
        ...baseInputSx,
        '& .MuiSelect-icon': { color: 'unset !important' },
        '& .MuiOutlinedInput-input': {
            color: '#000',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            minWidth: 0,
            paddingRight: '8px !important',
        },
    };

    const getFilterCount = () => {
        let count = 0;
        if (selectedBrand) count++
        if (selectedCategory) count++
        if (selectedClass) count++
        if (count !== 0) return " (" + count + ")";
        return ""
    }

    const ClearCircleIcon = ({ onClick }: { onClick: () => void }) => (
        <IconButton
            size="medium"
            onClick={onClick}
            sx={{
                width: 22,
                height: 22,
                backgroundColor: '#5F6B7A',
                '&:hover': { backgroundColor: '#4A5568' },
                color: '#fff',
                p: 0,
            }}
        >
            <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
    )

    const ClearCircleBox = () => (
        <Box
            sx={{
                width: 22,
                height: 22,
                backgroundColor: '#5F6B7A',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#4A5568' },
            }}
        >
            <CloseIcon sx={{ fontSize: 16, color: '#fff' }} />
        </Box>
    )

    const normalizeString = (str: string): string => str.toLowerCase().replace(/\s+/g, '');

    if (!isMobile) {
        return (
            <Box
                sx={{
                    backgroundColor: '#fff',
                    p: 2,
                    mb: 2,
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    px: { xs: 4, md: 8 },
                }}
            >
                <Box sx={{ flex: 1, minWidth: "15%", width: { xs: '100%', sm: '100%', md: 'auto' }, }}>
                    <Autocomplete
                        freeSolo
                        options={modelsOrGtins}
                        inputValue={search}
                        filterOptions={(options, { inputValue }) => {
                            if (inputValue.length < 3) {
                                return [];
                            }

                            const normalizedInput = normalizeString(inputValue);
                            return options.filter(option =>
                                normalizeString(option).includes(normalizedInput)
                            );
                        }}
                        onInputChange={(_, value) => setSearch(value)}
                        clearIcon={<ClearCircleBox />}
                        sx={{
                            '& .MuiInputBase-input': {
                                paddingLeft: '24px !important',
                            },
                        }}
                        renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                                <Box key={key} component="li" {...otherProps} sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%',
                                }}>
                                    {option}
                                </Box>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Cerca modello o codice EAN"
                                variant="outlined"
                                size="small"
                                fullWidth
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                sx={searchInputSx}
                                InputLabelProps={{
                                    shrink: searchFocused || !!search,
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ ml: 1, position: 'absolute', left: 0 }}>
                                            <SearchIcon
                                                sx={{
                                                    color: searchFocused ? '#0B3EE3' : '#6B7280',
                                                    fontSize: 18,
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        pl: 2
                                    },
                                }}
                            />
                        )}
                    />
                </Box>

                <Box sx={{ flex: 1, minWidth: "15%", width: { xs: '100%', sm: '100%', md: 'auto' }, }}>
                    <TextField
                        select
                        label="Categoria"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={dropdownInputSx}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        maxWidth: 300,
                                    },
                                },
                            },
                        }}
                        InputProps={{
                            endAdornment: selectedCategory ? (
                                <InputAdornment position="end" sx={{ mr: 1 }}>
                                    <ClearCircleIcon onClick={() => setSelectedCategory(null)} />
                                </InputAdornment>
                            ) : null,
                        }}
                    >
                        {categories.map((option) => (
                            <MenuItem
                                key={option}
                                value={option}
                                sx={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {option}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Box sx={{ flex: 1, minWidth: "15%", width: { xs: '100%', sm: '100%', md: 'auto' }, }}>
                    <TextField
                        select
                        label="Marca"
                        value={selectedBrand || ''}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={dropdownInputSx}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        maxWidth: 300,
                                    },
                                },
                            },
                        }}
                        InputProps={{
                            endAdornment: selectedBrand ? (
                                <InputAdornment position="end" sx={{ mr: 1 }}>
                                    <ClearCircleIcon onClick={() => setSelectedBrand(null)} />
                                </InputAdornment>
                            ) : null,
                        }}
                    >
                        {brands.map((option) => (
                            <MenuItem
                                key={option}
                                value={option}
                                sx={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {option}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {classes.length > 0 && (
                    <Box sx={{ flex: 1, minWidth: "15%", width: { xs: '100%', sm: '100%', md: 'auto' }, }}>
                        <TextField
                            select
                            label="Classe Energetica"
                            value={selectedClass || ''}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={dropdownInputSx}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            maxWidth: 300,
                                        },
                                    },
                                },
                            }}
                            InputProps={{
                                endAdornment: selectedClass ? (
                                    <InputAdornment position="end" sx={{ mr: 1 }}>
                                        <ClearCircleIcon onClick={() => setSelectedClass(null)} />
                                    </InputAdornment>
                                ) : null,
                            }}
                        >
                            {classes.map((option) => (
                                <MenuItem
                                    key={option}
                                    value={option}
                                    sx={{
                                        display: 'block',
                                        maxWidth: '100%',
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {option}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                )}
            </Box>
        )
    }

    return (
        <Box
            sx={{
                backgroundColor: '#fff',
                p: 3,
                mb: 2,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Autocomplete
                freeSolo
                options={modelsOrGtins}
                inputValue={search}
                filterOptions={(options, { inputValue }) => {
                    if (inputValue.length < 3) {
                        return [];
                    }

                    const normalizedInput = normalizeString(inputValue);
                    return options.filter(option =>
                        normalizeString(option).includes(normalizedInput)
                    );
                }}
                onInputChange={(_, value) => setSearch(value)}
                clearIcon={<ClearCircleBox />}
                sx={{
                    '& .MuiInputBase-input': {
                        paddingLeft: '24px !important',
                    },
                }}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box key={key} component="li" {...otherProps} sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                        }}>
                            {option}
                        </Box>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Cerca modello o codice EAN"
                        variant="outlined"
                        size="small"
                        fullWidth
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        sx={searchInputSx}
                        InputLabelProps={{
                            shrink: searchFocused || !!search,
                        }}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: 1, position: 'absolute', left: 0 }}>
                                    <SearchIcon
                                        sx={{
                                            color: searchFocused ? '#0B3EE3' : '#6B7280',
                                            fontSize: 18,
                                        }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />

            <Button
                variant="text"
                onClick={() => setDrawerOpen(true)}
                sx={{
                    color: '#0B3EE3',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    alignSelf: 'flex-end',
                    '& svg': { fontSize: 18 },
                }}
            >
                <FilterAlt sx={{ color: '#0B3EE3' }} />
                {"Filtra" + getFilterCount()}
            </Button>

            <Drawer
                anchor="bottom"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        p: 3,
                        pb: 6,
                        backgroundColor: '#fff',
                    },
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#374151',
                            letterSpacing: 0.5,
                            fontSize: 14,
                        }}
                    >
                        Filtra
                    </Typography>
                    <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#374151' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        select
                        label="Categoria"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={dropdownInputSx}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: { maxWidth: '80%' },
                                },
                            },
                        }}
                    >
                        {categories.map((option) => (
                            <MenuItem
                                key={option}
                                value={option}
                                sx={{
                                    display: 'flex',
                                    alignItems: "center",
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {option}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Marca"
                        value={selectedBrand || ''}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={dropdownInputSx}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: { maxWidth: '80%', justifyContent: "center", alignItems: "center" },
                                },
                            },
                        }}
                    >
                        {brands.map((option) => (
                            <MenuItem
                                key={option}
                                value={option}
                                sx={{
                                    display: 'flex',
                                    alignItems: "center",
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {option}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    {classes.length > 0 && (
                        <TextField
                            select
                            label="Classe Energetica"
                            value={selectedClass || ''}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={dropdownInputSx}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: { maxWidth: '80%', justifyContent: "center", alignItems: "center" },
                                    },
                                },
                            }}
                        >
                            {classes.map((option) => (
                                <MenuItem
                                    key={option}
                                    value={option}
                                    sx={{
                                        display: 'flex',
                                        alignItems: "center",
                                        maxWidth: '100%',
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {option}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: '#0B3EE3',
                            textTransform: 'none',
                            fontWeight: 700,
                            mt: 1,
                            py: 1.2,
                            borderRadius: '8px',
                            '&:hover': { backgroundColor: '#0036cc' },
                        }}
                        onClick={() => setDrawerOpen(false)}
                    >
                        Filtra
                    </Button>

                    <Button
                        variant="text"
                        fullWidth
                        sx={{
                            color: selectedBrand || selectedCategory ? "" : '#6B7280',
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                        onClick={() => {
                            setSelectedCategory(null)
                            setSelectedBrand(null)
                            setSelectedClass(null);
                        }}
                    >
                        Annulla filtri
                    </Button>
                </Box>
            </Drawer >
        </Box >
    )
}

export default ProductsFilters
