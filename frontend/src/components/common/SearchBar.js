import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <TextField
        size="small"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" edge="end">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          minWidth: { xs: '200px', sm: '300px' }
        }}
      />
    </form>
  );
};

export default SearchBar;
