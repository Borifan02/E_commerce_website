import React from 'react';
import { Box, Skeleton, Card, CardContent, CardActions } from '@mui/material';

export const ProductCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={280} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="80%" height={24} />
      <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width="30%" height={20} />
      </Box>
      <Skeleton variant="text" width="50%" height={32} />
    </CardContent>
    <CardActions sx={{ p: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={40} />
    </CardActions>
  </Card>
);

export const ProductListSkeleton = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </>
);

export const ProductDetailSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="80%" height={40} />
    <Skeleton variant="text" width="60%" height={24} />
    <Skeleton variant="text" width="100%" height={200} sx={{ mt: 2 }} />
  </Box>
);

export default ProductCardSkeleton;

