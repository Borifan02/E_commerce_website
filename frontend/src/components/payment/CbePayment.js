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
  AccountBalance,
  ContentCopy,
  CheckCircle,
  Verified,
  InfoOutlined,
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CbePayment = ({ order, onSuccess }) => {
  const [initData, setInitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const initiatePayment = async () => {
      try {
        setLoading(true);
        const res = await api.post('/api/payment/cbe/initiate', {
          orderId: order._id,
        });
        if (isMounted && res.data?.success) {
          setInitData(res.data);
        }
      } catch (err) {
        console.error('CBE init error:', err);
        if (isMounted) {
          setErrorMsg(err.response?.data?.message || 'Failed to initiate CBE payment session.');
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
  }, [order?._id]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error('Please enter the CBE Transaction reference / slip number');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/api/payment/cbe/verify', {
        orderId: order._id,
        transactionId: transactionId.trim(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'CBE payment verified successfully!');
        if (onSuccess) {
          onSuccess(res.data.order);
        }
      } else {
        setErrorMsg(res.data?.message || 'Verification could not be confirmed.');
      }
    } catch (err) {
      console.error('CBE verify error:', err);
      const msg = err.response?.data?.message || 'Failed to verify CBE transaction. Please check the reference.';
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
          Generating Commercial Bank of Ethiopia (CBE) transfer voucher...
        </Typography>
      </Card>
    );
  }

  const amountETB = initData?.amountETB || Math.round((order.totalPrice || 0) * 120);
  const accountNumber = initData?.accountNumber || '1000123456789';
  const accountName = initData?.accountName || 'E-Store Retail PLC';
  const branch = initData?.branch || 'Addis Ababa Main Branch';
  const reference = initData?.reference || `CBE-${order._id.slice(-6).toUpperCase()}`;

  return (
    <Card sx={{ borderRadius: 3, border: '2px solid #6b21a8', overflow: 'hidden' }}>
      {/* CBE Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #581c87 0%, #7e22ce 100%)',
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
              bgcolor: '#fbbf24',
              color: '#581c87',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalance sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Commercial Bank of Ethiopia
              </Typography>
              <Chip
                icon={<Verified sx={{ fontSize: '16px !important', color: '#581c87 !important' }} />}
                label="CBE Direct"
                size="small"
                sx={{ bgcolor: '#fbbf24', color: '#581c87', fontWeight: 'bold' }}
              />
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              CBE Mobile Banking • CBE Birr (*847#) • Branch Deposit
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

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Step 1: Transfer Funds to Official CBE Merchant Account
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#faf5ff', borderRadius: 2, mb: 3, borderColor: '#e9d5ff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Account Number:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#581c87', fontFamily: 'monospace' }}>
                {accountNumber}
              </Typography>
              <Tooltip title={copiedKey === 'acc' ? 'Copied!' : 'Copy Account Number'}>
                <IconButton size="small" onClick={() => handleCopy(accountNumber, 'acc')}>
                  {copiedKey === 'acc' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Account Name:</Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              {accountName}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Branch:</Typography>
            <Typography variant="body2" color="text.secondary">
              {branch}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Deposit / Transfer Remark:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip label={reference} sx={{ bgcolor: '#7e22ce', color: 'white', fontWeight: 'bold' }} size="small" />
              <Tooltip title={copiedKey === 'ref' ? 'Copied!' : 'Copy Reference'}>
                <IconButton size="small" onClick={() => handleCopy(reference, 'ref')}>
                  {copiedKey === 'ref' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Step 2: Enter CBE Transfer Confirmation Reference
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste the transaction reference number (e.g. <code>FT...</code> from CBE Mobile / internet banking or slip number).
        </Typography>

        <Box component="form" onSubmit={handleVerify}>
          <Box sx={{ mb: 3 }}>
            <TextField
              required
              label="CBE Transaction Reference / Voucher Code"
              placeholder="e.g. FT24098192837 or 1000192837"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
              helperText="Available in CBE SMS confirmation or Mobile Banking receipt"
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
              bgcolor: '#6b21a8',
              '&:hover': { bgcolor: '#581c87' },
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={22} color="inherit" />
                <span>Verifying CBE Deposit...</span>
              </Box>
            ) : (
              `Verify & Confirm ${amountETB.toLocaleString()} ETB Payment`
            )}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
            <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Need assistance? Call CBE Merchant helpline or chat with 24/7 support.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CbePayment;

