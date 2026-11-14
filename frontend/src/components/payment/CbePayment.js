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
  AccountBalance,
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
  SwapHoriz,
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CbePayment = ({ order, onSuccess }) => {
  const [initData, setInitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Tab 0: CBE Mobile Banking (Account Transfer), Tab 1: CBE Birr (*847#)
  const [cbeChannelTab, setCbeChannelTab] = useState(0);

  // Customer Form Fields
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
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

  // Format 13-digit CBE account into readable groups: 1000 XXXX XXXXX
  const formatCbeAccount = (value) => {
    const raw = value.replace(/\D/g, '').slice(0, 13);
    if (raw.length <= 4) return raw;
    if (raw.length <= 8) return `${raw.slice(0, 4)} ${raw.slice(4)}`;
    return `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8)}`;
  };

  const handleAccountChange = (e) => {
    const formatted = formatCbeAccount(e.target.value);
    setSenderAccountNumber(formatted);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (cbeChannelTab === 0) {
      const cleanAcc = senderAccountNumber.replace(/\s+/g, '');
      if (!cleanAcc) {
        toast.error('Please enter your 13-digit CBE Account Number');
        return;
      }
      if (cleanAcc.length < 10) {
        toast.error('CBE Account Number must be at least 10-13 digits');
        return;
      }
    } else {
      if (!senderPhone.trim()) {
        toast.error('Please enter your CBE Birr registered phone number');
        return;
      }
    }

    if (!pin.trim()) {
      toast.error('CBE Security PIN (4-6 digits) is required for payment authorization');
      return;
    }

    if (!/^\d{4,6}$/.test(pin.trim())) {
      toast.error('Invalid PIN format. CBE Security PIN must be 4 to 6 numeric digits');
      return;
    }

    if (!transactionId.trim()) {
      toast.error('Please enter the CBE Transaction Reference (e.g. FT number or receipt slip)');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const cleanAcc = senderAccountNumber.replace(/\s+/g, '');
      const res = await api.post('/api/payment/cbe/verify', {
        orderId: order._id,
        transactionId: transactionId.trim(),
        senderAccountNumber: cleanAcc,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        pin: pin.trim(),
        paymentChannel: cbeChannelTab === 0 ? 'cbe_mobile_banking' : 'cbe_birr',
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'CBE payment authorized & verified successfully!');
        if (onSuccess) {
          onSuccess(res.data.order);
        }
      } else {
        setErrorMsg(res.data?.message || 'Verification could not be confirmed.');
      }
    } catch (err) {
      console.error('CBE verify error:', err);
      const msg = err.response?.data?.message || 'Failed to verify CBE transaction. Please check your account details and PIN.';
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
      const mockTx = `FT240${Math.floor(100000 + Math.random() * 900000)}CBE`;
      const mockAcc = '1000 8899 22114';
      setSenderAccountNumber(mockAcc);
      setSenderName('Abebe Bikila');
      setSenderPhone('0911223344');
      setTransactionId(mockTx);
      setPin('1234');

      const res = await api.post('/api/payment/cbe/verify', {
        orderId: order._id,
        transactionId: mockTx,
        senderAccountNumber: '1000889922114',
        senderName: 'Abebe Bikila',
        senderPhone: '0911223344',
        pin: '1234',
        paymentChannel: cbeChannelTab === 0 ? 'cbe_mobile_banking' : 'cbe_birr',
      });

      if (res.data?.success) {
        toast.success('⚡ Mock CBE payment with PIN and Account verified successfully!');
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
        <CircularProgress sx={{ color: '#6b21a8' }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Generating Commercial Bank of Ethiopia (CBE) transfer voucher...
        </Typography>
      </Card>
    );
  }

  const amountETB = initData?.amountETB || Math.round((order.totalPrice || 0) * 120);
  const accountNumber = initData?.accountNumber || '1000123456789';
  const accountName = initData?.accountName || 'EthioMart Retail PLC (CBE Merchant)';
  const branch = initData?.branch || 'Addis Ababa Commercial Center Branch';
  const reference = initData?.reference || `CBE-${order._id.slice(-6).toUpperCase()}`;

  return (
    <Card sx={{ borderRadius: 3, border: '2px solid #6b21a8', overflow: 'hidden' }}>
      {/* CBE Header Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)',
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
              color: '#4a148c',
              borderRadius: '50%',
              p: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <AccountBalance sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Commercial Bank of Ethiopia
              </Typography>
              <Chip
                icon={<Verified sx={{ fontSize: '15px !important', color: '#4a148c !important' }} />}
                label="CBE Official"
                size="small"
                sx={{ bgcolor: '#fbbf24', color: '#4a148c', fontWeight: 'bold' }}
              />
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              የኢትዮጵያ ንግድ ባንክ • CBE Mobile Banking • CBE Birr (*847#)
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

      {/* Payment Channel Selection Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#faf5ff' }}>
        <Tabs
          value={cbeChannelTab}
          onChange={(e, val) => setCbeChannelTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
          variant="fullWidth"
        >
          <Tab
            icon={<SwapHoriz sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="CBE Mobile App / Account Transfer"
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          />
          <Tab
            icon={<PhoneAndroid sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="CBE Birr (*847# Wallet)"
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

        {/* STEP 1: Official Merchant Account Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Step 1: Transfer Funds to Official EthioMart CBE Merchant Account
          </Typography>
          <Chip label="Verified Merchant" size="small" color="success" variant="outlined" />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#faf5ff', borderRadius: 2, mb: 3, borderColor: '#e9d5ff' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Merchant CBE Account Number:</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#581c87', letterSpacing: 1 }}>
                    {accountNumber}
                  </Typography>
                </Box>
                <Tooltip title={copiedKey === 'acc' ? 'Copied!' : 'Copy Account Number'}>
                  <IconButton size="small" onClick={() => handleCopy(accountNumber, 'acc')}>
                    {copiedKey === 'acc' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Order Transfer Reference (Remark):</Typography>
                  <Box sx={{ mt: 0.25 }}>
                    <Chip label={reference} sx={{ bgcolor: '#6b21a8', color: 'white', fontWeight: 'bold', fontSize: '13px' }} />
                  </Box>
                </Box>
                <Tooltip title={copiedKey === 'ref' ? 'Copied!' : 'Copy Reference'}>
                  <IconButton size="small" onClick={() => handleCopy(reference, 'ref')}>
                    {copiedKey === 'ref' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, pt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Account Name:</strong> {accountName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Branch:</strong> {branch}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Swift Code:</strong> CBETETAA
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Transfer Instructions Box */}
        <Alert severity="info" sx={{ mb: 3, bgcolor: '#f3e8ff', color: '#4a148c', borderColor: '#d8b4fe' }}>
          {cbeChannelTab === 0 ? (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                📱 How to pay via CBE Mobile App / Internet Banking:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                1. Open CBE Mobile Banking app ➔ Select <strong>"Transfer to CBE Account"</strong><br />
                2. Enter Merchant Account: <strong>{accountNumber}</strong> ({accountName})<br />
                3. Amount: <strong>{amountETB} ETB</strong> ➔ In Reason/Remark field write: <strong>{reference}</strong><br />
                4. Enter your <strong>13-digit CBE Account Number</strong>, name, PIN, and the generated <strong>FT Number</strong> below.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                📶 How to pay via CBE Birr (*847#):
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                1. Dial <strong>*847#</strong> on your phone ➔ Select <strong>Pay Bill / Transfer</strong><br />
                2. Enter Merchant Account: <strong>{accountNumber}</strong> ➔ Amount: <strong>{amountETB} ETB</strong><br />
                3. Enter your 4-digit CBE Birr PIN to authorize the transaction<br />
                4. Fill your phone number, PIN, and the confirmation reference number from the CBE SMS below.
              </Typography>
            </Box>
          )}
        </Alert>

        {/* STEP 2: Customer Authorization & Form */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Step 2: Enter Your CBE Account Details & Authorize Payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {cbeChannelTab === 0
            ? 'Provide your 13-digit CBE account number, account name, security PIN, and FT confirmation reference.'
            : 'Provide your registered CBE Birr mobile number, security PIN, and confirmation transaction code.'}
        </Typography>

        <Box component="form" onSubmit={handleVerify}>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {cbeChannelTab === 0 ? (
              /* TAB 0: CBE Account Number */
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Your 13-Digit CBE Account Number"
                  placeholder="1000 •••• ••••"
                  value={senderAccountNumber}
                  onChange={handleAccountChange}
                  inputProps={{
                    maxLength: 16,
                    inputMode: 'numeric',
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance sx={{ color: '#6b21a8' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="The CBE account number you transferred funds from"
                />
              </Grid>
            ) : (
              /* TAB 1: CBE Birr Phone Number */
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Registered CBE Birr Phone Number"
                  placeholder="0911 234 567"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneAndroid sx={{ color: '#6b21a8' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Your Ethio Telecom mobile number registered with CBE Birr"
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Sender Account Holder Full Name"
                placeholder="e.g. Abebe Bikila"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                helperText="Name as registered in your Commercial Bank of Ethiopia profile"
              />
            </Grid>

            {/* CBE Security PIN Input Container */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#faf5ff', borderRadius: 2, border: '1px solid #e9d5ff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock sx={{ color: '#6b21a8', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#581c87' }}>
                      CBE Security PIN (4 - 6 Digits)
                    </Typography>
                  </Box>
                  <Chip
                    icon={<Security sx={{ fontSize: '14px !important' }} />}
                    label="Bank 2-Factor Authentication"
                    size="small"
                    sx={{ height: 22, fontSize: '11px', bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 'bold' }}
                  />
                </Box>

                <TextField
                  required
                  type={showPin ? 'text' : 'password'}
                  label="Enter Your Secret CBE PIN"
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
                        <Lock sx={{ color: '#6b21a8' }} />
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
                  helperText="Required by Commercial Bank of Ethiopia to authenticate this debit transaction"
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
                      bgcolor: '#f3e8ff',
                      color: '#6b21a8',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#e9d5ff' },
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* CBE Transaction FT Number */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="CBE Transaction Reference / FT Number"
                placeholder="e.g. FT24098192837 or 1000192837"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                helperText="Found in your CBE Mobile Banking receipt, SMS alert, or branch transfer slip"
              />
            </Grid>
          </Grid>

          {/* Live Receipt Slip Preview */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fcfaff', borderRadius: 2, borderStyle: 'dashed' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ReceiptLong sx={{ color: '#6b21a8', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Electronic Transfer Slip Preview / የክፍያ ደረሰኝ
              </Typography>
            </Box>
            <Grid container spacing={1} sx={{ fontSize: '13px' }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">{amountETB.toLocaleString()} ETB</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Sender Account:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {senderAccountNumber || senderPhone || 'Not entered yet'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Sender Name:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {senderName || 'Not entered yet'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Security State:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: pin.length >= 4 ? 'success.main' : 'warning.main' }}>
                  {pin.length >= 4 ? '✓ PIN Entered' : 'Pending PIN'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Action Buttons */}
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            fullWidth
            size="medium"
            disabled={submitting}
            onClick={handleSimulateMockPayment}
            sx={{ mb: 2, fontWeight: 'bold', borderStyle: 'dashed', borderWidth: 2 }}
          >
            ⚡ 1-Click Test / Mock Pay (Simulate CBE Account + PIN Success)
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
              bgcolor: '#6b21a8',
              '&:hover': { bgcolor: '#581c87' },
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={22} color="inherit" />
                <span>Authorizing CBE Transaction with PIN...</span>
              </Box>
            ) : (
              `Authorize & Verify ${amountETB.toLocaleString()} ETB Payment with CBE PIN`
            )}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
            <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Orders are immediately marked as processing upon successful CBE reference & PIN validation.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CbePayment;
