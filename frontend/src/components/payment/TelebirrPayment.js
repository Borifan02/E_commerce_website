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
  InputAdornment,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  PhoneAndroid,
  ContentCopy,
  CheckCircle,
  Verified,
  InfoOutlined,
  Lock,
  Visibility,
  VisibilityOff,
  Security,
  ReceiptLong,
  Dialpad,
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const TelebirrPayment = ({ order, onSuccess, initialPhone = '' }) => {
  const [initData, setInitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Tab 0: Direct Telebirr SuperApp authorization, Tab 1: *127# USSD Shortcode
  const [telebirrTab, setTelebirrTab] = useState(0);

  const [customerPhone, setCustomerPhone] = useState(initialPhone || '');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
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

    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      toast.error('Please enter your Telebirr registered phone number (09... or 07...)');
      return;
    }

    if (!pin.trim()) {
      toast.error('Telebirr Account Security PIN (4-6 digits) is required for payment authorization');
      return;
    }

    if (!/^\d{4,6}$/.test(pin.trim())) {
      toast.error('Invalid PIN format. Telebirr PIN must be 4 to 6 numeric digits');
      return;
    }

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
        phoneNumber: cleanPhone,
        pin: pin.trim(),
        paymentChannel: telebirrTab === 0 ? 'telebirr_direct' : 'telebirr_ussd',
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Telebirr payment authorized & verified successfully!');
        if (onSuccess) {
          onSuccess(res.data.order);
        }
      } else {
        setErrorMsg(res.data?.message || 'Verification could not be confirmed.');
      }
    } catch (err) {
      console.error('Telebirr verify error:', err);
      const msg = err.response?.data?.message || 'Failed to verify transaction. Please check your PIN and Transaction ID.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateMockPayment = async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const mockTx = `TLB${Math.floor(10000000 + Math.random() * 90000000)}`;
      setTransactionId(mockTx);
      setPin('1234');
      const testPhone = customerPhone || '0911223344';
      setCustomerPhone(testPhone);

      const res = await api.post('/api/payment/telebirr/verify', {
        orderId: order._id,
        transactionId: mockTx,
        phoneNumber: testPhone,
        pin: '1234',
        paymentChannel: telebirrTab === 0 ? 'telebirr_direct' : 'telebirr_ussd',
      });

      if (res.data?.success) {
        toast.success('⚡ Mock Telebirr payment with PIN authorized successfully!');
        if (onSuccess) {
          onSuccess(res.data.order);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Mock payment simulation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <CircularProgress sx={{ color: '#0088cc' }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Connecting to Ethio Telecom Telebirr Gateway...
        </Typography>
      </Card>
    );
  }

  const amountETB = initData?.amountETB || Math.round((order.totalPrice || 0) * 120);
  const merchantPhone = initData?.merchantPhone || '0911223344';
  const merchantName = initData?.merchantName || 'EthioMart SuperApp Merchant';
  const reference = initData?.reference || `TLB-${order._id.slice(-6).toUpperCase()}`;
  const ussdCode = initData?.ussdCode || `*127*1*${merchantPhone}*${amountETB}#`;

  return (
    <Card sx={{ borderRadius: 3, border: '2px solid #0099ff', overflow: 'hidden' }}>
      {/* Telebirr Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0088cc 0%, #0099e6 50%, #00b4d8 100%)',
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
              p: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <PhoneAndroid sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                telebirr
              </Typography>
              <Chip
                icon={<Verified sx={{ fontSize: '15px !important', color: 'white !important' }} />}
                label="Ethio Telecom"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold' }}
              />
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              ቴሌብር • Ethio Telecom SuperApp & Mobile Money Gateway
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            Payable in Ethiopian Birr
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {amountETB.toLocaleString()} ETB
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            (${order.totalPrice?.toFixed(2)} USD • 1 USD = 120 ETB)
          </Typography>
        </Box>
      </Box>

      {/* Telebirr Channel Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f0f9ff' }}>
        <Tabs
          value={telebirrTab}
          onChange={(e, val) => setTelebirrTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab
            icon={<PhoneAndroid sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Telebirr App (Direct Wallet Debit)"
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          />
          <Tab
            icon={<Dialpad sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Telebirr USSD (*127# Code)"
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {/* Transfer Instructions & Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Step 1: Merchant Payment Information
          </Typography>
          <Chip label="Ethio Telecom Verified" size="small" color="primary" variant="outlined" />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 3, borderColor: '#bae6fd' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Merchant Telebirr Account:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0369a1' }}>
                    {merchantPhone} ({merchantName})
                  </Typography>
                </Box>
                <Tooltip title={copiedKey === 'phone' ? 'Copied!' : 'Copy Phone'}>
                  <IconButton size="small" onClick={() => handleCopy(merchantPhone, 'phone')}>
                    {copiedKey === 'phone' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Payment Reference (Reason):</Typography>
                  <Box sx={{ mt: 0.25 }}>
                    <Chip label={reference} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                  </Box>
                </Box>
                <Tooltip title={copiedKey === 'ref' ? 'Copied!' : 'Copy Reference'}>
                  <IconButton size="small" onClick={() => handleCopy(reference, 'ref')}>
                    {copiedKey === 'ref' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {telebirrTab === 1 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Direct USSD Code:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#0369a1' }}>
                      {ussdCode}
                    </Typography>
                  </Box>
                  <Tooltip title={copiedKey === 'ussd' ? 'Copied!' : 'Copy USSD'}>
                    <IconButton size="small" onClick={() => handleCopy(ussdCode, 'ussd')}>
                      {copiedKey === 'ussd' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Verification Form */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Step 2: Enter Your Telebirr Mobile Number & Authorize with PIN
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {telebirrTab === 0
            ? 'Enter your registered Ethio Telecom mobile number, your secret Telebirr PIN, and the transaction ID.'
            : 'After dialing *127#, enter your phone number, PIN, and the transaction reference from the SMS confirmation.'}
        </Typography>

        <Box component="form" onSubmit={handleVerify}>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Sender Telebirr Phone Number"
                placeholder="0912 345 678 or 0712 345 678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneAndroid sx={{ color: '#0088cc' }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Ethio Telecom mobile wallet number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Telebirr Transaction ID (SMS Reference)"
                placeholder="e.g. TLB109827361 or TXN8491823"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                helperText="Found in the SMS confirmation sent to you by Ethio Telecom"
              />
            </Grid>

            {/* Telebirr Security PIN Field */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock sx={{ color: '#0088cc', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0369a1' }}>
                      Telebirr Account Security PIN (4 - 6 Digits)
                    </Typography>
                  </Box>
                  <Chip
                    icon={<Security sx={{ fontSize: '14px !important' }} />}
                    label="End-to-End Encrypted"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '11px' }}
                  />
                </Box>

                <TextField
                  required
                  type={showPin ? 'text' : 'password'}
                  label="Enter Your Secret Telebirr PIN"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(val);
                  }}
                  inputProps={{
                    maxLength: 6,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: { letterSpacing: showPin ? 'normal' : '4px', fontWeight: 'bold' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#0088cc' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPin(!showPin)}
                          edge="end"
                          aria-label="toggle PIN visibility"
                        >
                          {showPin ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Required by Ethio Telecom Telebirr to authorize wallet fund transfer"
                  fullWidth
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Sandbox / Test mode:
                  </Typography>
                  <Chip
                    label="Autofill Test PIN (1234)"
                    size="small"
                    onClick={() => setPin('1234')}
                    sx={{
                      cursor: 'pointer',
                      fontSize: '11px',
                      height: 22,
                      bgcolor: '#e0f2fe',
                      color: '#0284c7',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#bae6fd' },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Live Receipt Slip Preview */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f0f9ff', borderRadius: 2, borderStyle: 'dashed' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ReceiptLong sx={{ color: '#0088cc', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Telebirr Payment Slip Preview / የቴሌብር ደረሰኝ
              </Typography>
            </Box>
            <Grid container spacing={1} sx={{ fontSize: '13px' }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">{amountETB.toLocaleString()} ETB</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Wallet Phone:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {customerPhone || 'Not entered yet'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Channel:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {telebirrTab === 0 ? 'Telebirr SuperApp' : 'USSD *127#'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">PIN State:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: pin.length >= 4 ? 'success.main' : 'warning.main' }}>
                  {pin.length >= 4 ? '✓ PIN Ready' : 'Pending PIN'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Action Buttons */}
          <Button
            type="button"
            variant="outlined"
            color="info"
            fullWidth
            size="medium"
            disabled={submitting}
            onClick={handleSimulateMockPayment}
            sx={{ mb: 2, fontWeight: 'bold', borderStyle: 'dashed', borderWidth: 2 }}
          >
            ⚡ 1-Click Test / Mock Pay (Simulate Telebirr with PIN)
          </Button>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting || !transactionId.trim() || !pin.trim()}
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
                <span>Authorizing Telebirr Payment...</span>
              </Box>
            ) : (
              `Authorize & Verify ${amountETB.toLocaleString()} ETB Payment with Telebirr PIN`
            )}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
            <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Orders are immediately marked as processing upon Telebirr reference & PIN validation.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TelebirrPayment;
