import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  PhoneAndroid,
  ContentCopy,
  CheckCircle,
  Verified,
  InfoOutlined,
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const TelebirrPayment = ({ order, onSuccess, initialPhone = '' }) => {
  const [initData, setInitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [customerPhone, setCustomerPhone] = useState(initialPhone || '');
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const initiatePayment = async () => {
      try {
        setLoading(true);
        const res = await api.post('/api/payment/telebirr/initiate', {
          orderId: order._id,
          phoneNumber: initialPhone,
        });
        if (isMounted && res.data?.success) {
          setInitData(res.data);
          if (res.data.customerPhone) {
            setCustomerPhone((prev) => prev || res.data.customerPhone);
          }
        }
      } catch (err) {
        console.error('Telebirr init error:', err);
        if (isMounted) {
          setErrorMsg(err.response?.data?.message || 'Failed to initiate Telebirr payment session.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (order?._id) {
      initiatePayment();
    }
    return () => {
      isMounted = false;
    };
  }, [order?._id, initialPhone]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error('Please enter the Telebirr Transaction ID from Ethio Telecom SMS');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/api/payment/telebirr/verify', {
        orderId: order._id,
        transactionId: transactionId.trim(),
        phoneNumber: customerPhone.trim(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Telebirr payment verified successfully!');
        if (onSuccess) {
          onSuccess(res.data.order);
        }
      } else {
        setErrorMsg(res.data?.message || 'Verification could not be confirmed.');
      }
    } catch (err) {
      console.error('Telebirr verify error:', err);
      const msg = err.response?.data?.message || 'Failed to verify transaction. Please check the ID.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Connecting to Ethio Telecom Telebirr Gateway...
        </Typography>
      </Card>
    );
  }

  const amountETB = initData?.amountETB || Math.round((order.totalPrice || 0) * 120);
  const merchantPhone = initData?.merchantPhone || '0911223344';
  const merchantName = initData?.merchantName || 'E-Store Official Ethiopia';
  const reference = initData?.reference || `TLB-${order._id.slice(-6).toUpperCase()}`;
  const ussdCode = initData?.ussdCode || `*127*1*${merchantPhone}*${amountETB}#`;

  return (
    <Card sx={{ borderRadius: 3, border: '2px solid #0099ff', overflow: 'hidden' }}>
      {/* Telebirr Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0088cc 0%, #00b4d8 100%)',
          color: 'white',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: 'white',
              color: '#0088cc',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PhoneAndroid sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                telebirr
              </Typography>
              <Chip
                icon={<Verified sx={{ fontSize: '16px !important', color: 'white !important' }} />}
                label="Official Gateway"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
              />
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Ethio Telecom Mobile Money Integration
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            Total in Birr
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {amountETB.toLocaleString()} ETB
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            (${order.totalPrice?.toFixed(2)} USD)
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {/* Transfer Instructions & Details */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Step 1: Send payment using Telebirr App or USSD
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Merchant Account:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {merchantPhone} ({merchantName})
              </Typography>
              <Tooltip title={copiedKey === 'phone' ? 'Copied!' : 'Copy phone'}>
                <IconButton size="small" onClick={() => handleCopy(merchantPhone, 'phone')}>
                  {copiedKey === 'phone' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Payment Reference (Reason):</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip label={reference} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
              <Tooltip title={copiedKey === 'ref' ? 'Copied!' : 'Copy reference'}>
                <IconButton size="small" onClick={() => handleCopy(reference, 'ref')}>
                  {copiedKey === 'ref' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Quick USSD Dial:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#e2e8f0', px: 1, py: 0.25, borderRadius: 1 }}>
                {ussdCode}
              </Typography>
              <Tooltip title={copiedKey === 'ussd' ? 'Copied!' : 'Copy USSD'}>
                <IconButton size="small" onClick={() => handleCopy(ussdCode, 'ussd')}>
                  {copiedKey === 'ussd' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Verification Form */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Step 2: Enter Transaction Details to Verify
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          After completing the transfer, enter your phone number and the SMS Transaction Reference received from Telebirr.
        </Typography>

        <Box component="form" onSubmit={handleVerify}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              label="Sender Telebirr Phone Number"
              placeholder="e.g. 0912345678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              fullWidth
              size="medium"
            />
            <TextField
              required
              label="Telebirr Transaction ID (Reference)"
              placeholder="e.g. TLB109827361 or TXN8491823"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
              helperText="Found in the SMS confirmation sent to you by Ethio Telecom (Telebirr)"
              fullWidth
              size="medium"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting || !transactionId.trim()}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              bgcolor: '#0088cc',
              '&:hover': { bgcolor: '#006699' },
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={22} color="inherit" />
                <span>Verifying Telebirr Payment...</span>
              </Box>
            ) : (
              `Confirm & Verify ${amountETB.toLocaleString()} ETB Payment`
            )}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
            <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Orders are instantly marked as processing upon reference validation.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TelebirrPayment;
