import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Zoom,
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';

const ImageLightbox = ({ images, open, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0,0,0,0.9)',
          color: 'white',
          m: 0,
          height: '100vh',
          maxHeight: '100vh',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: '100%',
        }}
        onWheel={handleWheel}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <Close />
        </IconButton>

        {/* Zoom Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ZoomIn />
          </IconButton>
          <IconButton
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ZoomOut />
          </IconButton>
        </Box>

        {/* Previous Button */}
        {images.length > 1 && (
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
        )}

        {/* Main Image */}
        <Zoom in={true} timeout={300}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <img
              src={images[currentIndex]}
              alt={`Product image ${currentIndex + 1}`}
              style={{
                maxWidth: `${100 * zoom}%`,
                maxHeight: `${100 * zoom}%`,
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
                cursor: zoom > 1 ? 'grab' : 'default',
              }}
              draggable={zoom > 1}
            />
            {images.length > 1 && (
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {currentIndex + 1} / {images.length}
              </Typography>
            )}
          </Box>
        </Zoom>

        {/* Next Button */}
        {images.length > 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ChevronRight fontSize="large" />
          </IconButton>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              p: 1,
              borderRadius: 2,
            }}
          >
            {images.map((img, index) => (
              <Box
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                sx={{
                  width: 60,
                  height: 60,
                  border: currentIndex === index ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: currentIndex === index ? 1 : 0.7,
                  transition: 'all 0.2s',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;

