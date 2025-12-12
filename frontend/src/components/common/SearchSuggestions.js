import React, { useEffect, useRef } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  History,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SearchSuggestions = ({
  open,
  onClose,
  searchQuery,
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
}) => {
  const navigate = useNavigate();
  const paperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paperRef.current && !paperRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  const handleSuggestionClick = (query) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
    onClose();
  };

  if (!open) return null;

  return (
    <Paper
      ref={paperRef}
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        maxHeight: 500,
        overflow: 'auto',
        zIndex: 1300,
        borderRadius: 2,
      }}
    >
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              SUGGESTIONS
            </Typography>
          </Box>
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <Search fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={suggestion}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ? 600 : 400,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              RECENT SEARCHES
            </Typography>
          </Box>
          <List dense>
            {recentSearches.map((search, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(search)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <History fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={search} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}

      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
        <>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              TRENDING
            </Typography>
          </Box>
          <Box sx={{ p: 2, pt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {trendingSearches.map((trend, index) => (
              <Chip
                key={index}
                label={trend}
                icon={<TrendingUp fontSize="small" />}
                onClick={() => handleSuggestionClick(trend)}
                color="primary"
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}

      {/* No Results */}
      {suggestions.length === 0 && recentSearches.length === 0 && trendingSearches.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No suggestions available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SearchSuggestions;

