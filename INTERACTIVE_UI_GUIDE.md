# 🎨 Interactive UI Guide - Quick Reference

## Overview
This guide provides quick reference for using the new interactive UI components and features.

---

## 🚀 Quick Start

### Using InteractiveProductCard

**Before:**
```jsx
import ProductCard from '../components/common/ProductCard';

<Grid item xs={12} sm={6} md={4}>
  <ProductCard product={product} />
</Grid>
```

**After:**
```jsx
import InteractiveProductCard from '../components/common/InteractiveProductCard';

<Grid item xs={12} sm={6} md={4}>
  <InteractiveProductCard product={product} index={index} />
</Grid>
```

**Features:**
- Hover effects
- Quick actions overlay
- Quantity selector
- Wishlist toggle
- Buy Now button

---

### Using ImageLightbox

```jsx
import ImageLightbox from '../components/common/ImageLightbox';

const [lightboxOpen, setLightboxOpen] = useState(false);
const [selectedImage, setSelectedImage] = useState(0);

<ImageLightbox
  images={product.images}
  open={lightboxOpen}
  onClose={() => setLightboxOpen(false)}
  initialIndex={selectedImage}
/>
```

**Features:**
- Full-screen viewing
- Zoom controls
- Navigation arrows
- Thumbnail strip

---

### Using SearchSuggestions

```jsx
import SearchSuggestions from '../components/common/SearchSuggestions';

const [searchFocused, setSearchFocused] = useState(false);
const [recentSearches, setRecentSearches] = useState([]);

<SearchSuggestions
  open={searchFocused}
  onClose={() => setSearchFocused(false)}
  searchQuery={searchQuery}
  suggestions={getSuggestions()}
  recentSearches={recentSearches}
  trendingSearches={['Laptop', 'Phone', 'Headphones']}
/>
```

---

### Using SkeletonLoaders

```jsx
import { ProductListSkeleton, ProductDetailSkeleton } from '../components/common/SkeletonLoader';

// For product list
{loading ? (
  <Grid container spacing={3}>
    {Array.from({ length: 8 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <ProductListSkeleton />
      </Grid>
    ))}
  </Grid>
) : (
  // Products
)}

// For product detail
{loading ? <ProductDetailSkeleton /> : <ProductDetail />}
```

---

## 🎯 Key Interactive Features

### 1. Product Cards
- **Hover**: Image zooms, overlay appears
- **Quick View**: Opens product detail
- **Wishlist**: Toggle favorite
- **Quantity**: Select before adding to cart
- **Buy Now**: Quick checkout

### 2. Product Detail
- **Image Gallery**: Click thumbnails to change main image
- **Lightbox**: Click image for full-screen view
- **Zoom**: Hover over image to zoom
- **Tabs**: Switch between Description/Specs/Reviews
- **Share**: Native share API
- **Sticky Buy Box**: Follows scroll

### 3. Shopping Cart
- **Delete Confirmation**: Prevents accidental deletion
- **Quantity Controls**: +/- buttons
- **Free Shipping Alert**: Dynamic threshold alert
- **Security Badges**: Trust indicators
- **Smooth Animations**: Fade-in effects

### 4. Search
- **Suggestions**: Real-time suggestions dropdown
- **Recent Searches**: Remembered searches
- **Trending**: Popular searches
- **Quick Clear**: X button to clear

---

## 🎨 Animation Classes

### CSS Animations Available

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usage */
animation: fadeInUp 0.5s ease-out;
```

---

## 📱 Responsive Breakpoints

### Material-UI Breakpoints
- `xs`: 0px (mobile)
- `sm`: 600px (tablet)
- `md`: 900px (desktop)
- `lg`: 1200px (large desktop)
- `xl`: 1536px (extra large)

### Usage Example
```jsx
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

{isMobile ? <MobileView /> : <DesktopView />}
```

---

## 🎯 Best Practices

### 1. Always Use Skeleton Loaders
```jsx
{loading ? <SkeletonLoader /> : <Content />}
```

### 2. Add Hover States
```jsx
sx={{
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 4,
  },
}}
```

### 3. Use Transitions
```jsx
<Fade in={isVisible} timeout={300}>
  <Component />
</Fade>
```

### 4. Add Loading States
```jsx
<Button
  loading={isLoading}
  disabled={isLoading}
>
  Submit
</Button>
```

### 5. Provide Feedback
```jsx
toast.success('Action completed!', { icon: '✅' });
```

---

## 🔧 Component Props

### InteractiveProductCard
```jsx
<InteractiveProductCard
  product={product}      // Product object
  index={index}          // For staggered animations (optional)
/>
```

### ImageLightbox
```jsx
<ImageLightbox
  images={images}        // Array of image URLs
  open={open}            // Boolean
  onClose={onClose}      // Function
  initialIndex={0}       // Number (optional)
/>
```

### SearchSuggestions
```jsx
<SearchSuggestions
  open={open}            // Boolean
  onClose={onClose}     // Function
  searchQuery={query}    // String
  suggestions={[]}      // Array of strings
  recentSearches={[]}   // Array of strings
  trendingSearches={[]} // Array of strings
/>
```

---

## 🎨 Color Palette

### Primary Colors
- Primary: `#1976d2` (Blue)
- Secondary: `#dc004e` (Pink/Red)
- Success: `#2e7d32` (Green)
- Error: `#d32f2f` (Red)
- Warning: `#ed6c02` (Orange)

### Custom Colors Used
- Amazon Orange: `#ffa41c`
- Amazon Dark: `#232f3e`
- Text Primary: `#0F1111`
- Text Secondary: `#565959`

---

## 📝 Notes

- All animations use CSS transitions for performance
- Hover effects are disabled on touch devices
- Loading states improve perceived performance
- Empty states guide users to take action
- Confirmations prevent accidental actions

---

**Last Updated**: 2024
