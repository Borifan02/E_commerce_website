import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  HeadsetMic,
  Phone,
  Email,
  LocationOn,
  ExpandMore,
  CheckCircle,
  HelpOutline,
  LocalShipping,
  AccountBalanceWallet,
  Security,
  Search,
  Schedule,
  ConfirmationNumber,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const CustomerSupportPage = () => {
  const navigate = useNavigate();

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'order',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // FAQ Search Filter
  const [faqSearch, setFaqSearch] = useState('');

  const faqs = [
    {
      q: 'How do I track my order delivery?',
      a: 'Navigate to "Your Orders" in your profile menu or click the "Track Order" button below. You will see real-time status updates: Pending, Processing, Shipped, or Delivered.',
      tag: 'Orders',
    },
    {
      q: 'How do I pay using Telebirr (*127#)?',
      a: 'During checkout, choose Telebirr. Dial *127# on your Ethio Telecom phone or open the Telebirr app. Send money to Merchant account 0965844287, enter your order reference, and copy the SMS Transaction ID into the checkout verification box. In demo mode, you can also click "Instant Test Pay".',
      tag: 'Payments',
    },
    {
      q: 'How do I transfer via CBE (Commercial Bank of Ethiopia)?',
      a: 'Select CBE at checkout. Open CBE Mobile Banking or dial *847# (CBE Birr). Transfer the Birr total to CBE account 1000123456789 (E-Store Retail PLC) and input the transaction voucher code.',
      tag: 'Payments',
    },
    {
      q: 'What is the return and refund policy?',
      a: 'We offer a hassle-free 7-to-14 day return policy for unused items in their original packaging. Submit an inquiry through this form or call +251 965 844 287 to initiate a return inspection.',
      tag: 'Returns',
    },
    {
      q: 'Which regions in Ethiopia do you deliver to?',
      a: 'We provide expedited 24-48 hour doorstep delivery in Addis Ababa, and 2-4 day delivery to all regional capitals including Hawassa, Adama (Nazret), Bahir Dar, Dire Dawa, Gondar, and Mekelle.',
      tag: 'Shipping',
    },
    {
      q: 'Is my credit card and personal data secure?',
      a: 'Yes. All transactions are encrypted with 256-bit SSL protocols. Credit card payments are tokenized through Stripe and passwords are salted with bcrypt. We never store raw card numbers.',
      tag: 'Security',
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all required fields (Name, Email, Message)');
      return;
    }

    setSubmitting(true);
    // Simulate inquiry submission with tracking generation
    setTimeout(() => {
      const ticketRef = `ET-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket({
        ref: ticketRef,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        category: formData.category,
      });
      toast.success(`Inquiry ticket #${ticketRef} submitted! Our support team will reply to ${formData.email} shortly.`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'order',
        message: '',
      });
      setSubmitting(false);
    }, 1000);
  };

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.tag.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Banner */}
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)',
          color: 'white',
          boxShadow: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <HeadsetMic sx={{ fontSize: 32, color: '#38bdf8' }} />
              <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 'bold', color: '#38bdf8' }}>
                ETHIOMART CUSTOMER CARE
              </Typography>
            </Box>
            <Typography variant="h3" component="h1" fontWeight="800" sx={{ mb: 1.5 }}>
              How Can We Help You Today?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 650, mb: 3 }}>
              Fast customer support for your orders, Ethiopian local payments (Telebirr & CBE), product inquiries, and delivery tracking.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LocalShipping />}
                onClick={() => navigate('/orders')}
                sx={{ fontWeight: 'bold', borderRadius: 2 }}
              >
                Track My Orders
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', borderRadius: 2, fontWeight: 'bold' }}
                onClick={() => {
                  const el = document.getElementById('contact-form-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Open Support Ticket
              </Button>
            </Box>
          </Grid>

          {/* Quick Info Box */}
          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', p: 3, borderRadius: 3, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" /> Operating Hours
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Monday – Saturday: 8:00 AM – 8:00 PM EAT<br />
                Sunday: 10:00 AM – 4:00 PM EAT
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                Average response time: <strong>under 30 minutes</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-3px)', transition: '0.2s' },
            }}
            onClick={() => navigate('/orders')}
          >
            <LocalShipping color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Orders & Delivery</Typography>
            <Typography variant="body2" color="text.secondary">View tracking status, delivery timeline, and receipts</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-3px)', transition: '0.2s' },
            }}
          >
            <AccountBalanceWallet color="success" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Telebirr & CBE Payments</Typography>
            <Typography variant="body2" color="text.secondary">Assistance with USSD transfers, SMS IDs, and receipts</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-3px)', transition: '0.2s' },
            }}
          >
            <HelpOutline color="warning" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Returns & Refunds</Typography>
            <Typography variant="body2" color="text.secondary">7-day item replacement and return policy guidance</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-3px)', transition: '0.2s' },
            }}
            onClick={() => navigate('/profile')}
          >
            <Security color="info" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Account & Security</Typography>
            <Typography variant="body2" color="text.secondary">Update profile, change password, and address settings</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content: Contact Form & Contact Details */}
      <Grid container spacing={4} sx={{ mb: 6 }} id="contact-form-section">
        {/* Support Ticket Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Submit a Customer Inquiry
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Have a question about an order, payment, or product? Fill out the details below and our team will get back to you immediately.
            </Typography>

            {submittedTicket && (
              <Alert
                severity="success"
                icon={<CheckCircle fontSize="inherit" />}
                sx={{ mb: 3, borderRadius: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={() => setSubmittedTicket(null)}>
                    New Inquiry
                  </Button>
                }
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Support Ticket Submitted Successfully!
                </Typography>
                <Typography variant="body2">
                  Reference Ticket: <strong>{submittedTicket.ref}</strong> ({submittedTicket.date})
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  A confirmation has been logged. You may quote this reference when calling our hotline.
                </Typography>
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmitInquiry}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Daba Saborifan"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. customer@gmail.com"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0965844287"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Inquiry Topic"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="order">Order Tracking & Status</MenuItem>
                    <MenuItem value="telebirr">Telebirr Payment Verification</MenuItem>
                    <MenuItem value="cbe">CBE Bank Transfer Verification</MenuItem>
                    <MenuItem value="return">Return / Refund Request</MenuItem>
                    <MenuItem value="other">General Feedback / Inquiries</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="How can we help? (Detailed message)"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please include your Order ID or Transaction Reference if applicable..."
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
                sx={{ mt: 3, px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Submitting Ticket...</span>
                  </Box>
                ) : (
                  'Send Support Message'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Information & Channels */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, height: '100%', bgcolor: '#f8fafc' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Official Contact Channels
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect directly with our customer support representatives in Addis Ababa.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Phone */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2, height: 'fit-content' }}>
                  <Phone />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Direct Helpline / Hotline</Typography>
                  <Typography variant="body2" sx={{ my: 0.5 }}>
                    <a href="tel:+251965844287" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 'bold' }}>
                      +251 965 844 287
                    </a>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Call for instant order or payment verification
                  </Typography>
                </Box>
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#f3e8ff', color: '#9333ea', borderRadius: 2, height: 'fit-content' }}>
                  <Email />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Customer Care Email</Typography>
                  <Typography variant="body2" sx={{ my: 0.5 }}>
                    <a href="mailto:dabasaborifan@gmail.com" style={{ color: '#9333ea', textDecoration: 'none', fontWeight: 'bold' }}>
                      dabasaborifan@gmail.com
                    </a>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Official store correspondence and ticket resolution
                  </Typography>
                </Box>
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 2, height: 'fit-content' }}>
                  <LocationOn />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Corporate Headquarters & Warehouse</Typography>
                  <Typography variant="body2" sx={{ my: 0.5, fontWeight: '500' }}>
                    Bole Sub-City, Addis Ababa, Ethiopia
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Central fulfillment and distribution center
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Quick Helpline Call-to-Action */}
            <Box sx={{ mt: 4, p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Need Urgent Assistance with an Order?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Our team can manually confirm your Telebirr or CBE deposit in minutes.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                href="tel:+251965844287"
                startIcon={<Phone />}
                sx={{ fontWeight: 'bold' }}
              >
                Call Support: +251 965 844 287
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Frequently Asked Questions Section */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Frequently Asked Questions (FAQ)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find quick answers to common questions about orders, payments, and delivery.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search FAQs..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260 }}
          />
        </Box>

        {filteredFaqs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No questions matching your search. Please reach out via our contact form above.
          </Typography>
        ) : (
          filteredFaqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={faq.tag} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                  <Typography variant="subtitle1" fontWeight="600">
                    {faq.q}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default CustomerSupportPage;