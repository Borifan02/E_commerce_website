import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  LocalShipping,
  CardGiftcard,
  Storefront,
  VerifiedUser,
  AssignmentReturn,
  Lock,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const InfoPage = ({ title }) => {

  // Seller application form state
  const [sellerForm, setSellerForm] = useState({
    businessName: '',
    category: 'Electronics',
    phone: '',
    tinNumber: '',
    city: 'Addis Ababa',
  });
  const [sellerSubmitted, setSellerSubmitted] = useState(false);

  // Gift card checker state
  const [giftCode, setGiftCode] = useState('');
  const [giftResult, setGiftResult] = useState(null);

  // Return request form state
  const [returnOrderRef, setReturnOrderRef] = useState('');
  const [returnReason, setReturnReason] = useState('defective');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  const handleSellerSubmit = (e) => {
    e.preventDefault();
    if (!sellerForm.businessName.trim() || !sellerForm.phone.trim()) {
      toast.error('Please fill in your Business Name and Contact Phone');
      return;
    }
    setSellerSubmitted(true);
    toast.success('Seller application received! Our merchant onboarding team will contact you within 24 hours.');
  };

  const handleCheckGiftCard = (e) => {
    e.preventDefault();
    if (!giftCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }
    const clean = giftCode.trim().toUpperCase();
    if (clean === 'WELCOME10' || clean === 'ETHIO2026' || clean.startsWith('GIFT')) {
      setGiftResult({ valid: true, balance: '500 ETB ($4.17 USD)', status: 'Active & Redeemable' });
    } else {
      setGiftResult({ valid: false, balance: '0 ETB', status: 'Code expired or invalid' });
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnOrderRef.trim()) {
      toast.error('Please enter your Order Reference or ID');
      return;
    }
    setReturnSubmitted(true);
    toast.success('Return inspection ticket initiated! Our Addis Ababa courier will arrange pickup.');
  };

  // --- Content Renderers ---

  const renderShippingInfo = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LocalShipping sx={{ fontSize: 44, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Ethiopia Nationwide Delivery & Fulfillment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fast, insured, and tracked shipping across Addis Ababa and all regional cities.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label="Addis Ababa Express" color="primary" sx={{ fontWeight: 'bold' }} />
                <Typography variant="caption" color="text.secondary">Doorstep Dispatch</Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
                Same-Day & 24–48h Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Covers all sub-cities: Bole, Kirkos, Yeka, Nifas Silk, Arada, Gullele, Lideta, Akaki Kality, Kolfe Keranio, and Addis Ketema.
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Free Delivery on orders over $100 (≈ 12,000 ETB)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Flat standard shipping: $5 (≈ 600 ETB) for orders below $100" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="SMS & phone call notifications prior to arrival" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label="Regional Ethiopia" color="secondary" sx={{ fontWeight: 'bold' }} />
                <Typography variant="caption" color="text.secondary">Regional Courier Hubs</Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
                2–4 Business Days
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Direct parcel delivery to major hubs including Hawassa, Adama (Nazret), Bahir Dar, Dire Dawa, Gondar, Mekelle, Jimma, and Bishoftu.
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Insured transit with Ethio Postal Service (EMS) & regional partner buses" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Tracking code provided upon dispatch" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Local collection points available in each regional capital" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Frequently Asked Shipping Questions
      </Typography>
      <Accordion sx={{ mb: 1, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight="bold">How will I know when my parcel is on the way?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            You will receive a confirmation SMS and email when your order status updates to "Shipped". You can also view live tracking updates on your Order Tracking page.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 1, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight="bold">Can someone else receive my package if I am not home?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Yes. A family member or designated representative can accept the delivery by presenting your order reference code and the delivery recipient's phone number.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderReturns = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssignmentReturn sx={{ fontSize: 44, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Hassle-Free Returns & Replacements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customer satisfaction guaranteed with our 7–14 day Ethiopian return policy.
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" icon={<VerifiedUser />} sx={{ mb: 4, borderRadius: 2 }}>
        <strong>100% Refund Guarantee:</strong> If an item is damaged, defective, or does not match the product description, you are entitled to a full refund credited directly to your <strong>Telebirr wallet</strong> or <strong>CBE bank account</strong> within 24–48 hours of inspection.
      </Alert>

      {/* 4 Step Return Process */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        How Returns Work
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { step: '1', title: 'Submit Request', desc: 'Enter your order reference below or contact customer support.' },
          { step: '2', title: 'Pickup or Drop-off', desc: 'Free courier pickup in Addis Ababa or drop-off at a regional hub.' },
          { step: '3', title: 'Inspection', desc: 'Our technical team verifies item condition within 24 hours.' },
          { step: '4', title: 'Instant Refund', desc: 'Funds refunded via Telebirr, CBE, or replacement dispatched.' },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.step}>
            <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', mb: 1.5 }}>
                {item.step}
              </Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Interactive Return Request Box */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Submit an Online Return Request
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Have an order you would like to return or exchange? Enter your order details below.
        </Typography>

        {returnSubmitted ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <strong>Return Request Received:</strong> Your return inquiry for order #{returnOrderRef} has been logged. Our Addis Ababa customer service rep will call you at your registered phone number today.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleReturnSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Order Reference / ID"
                  placeholder="e.g. 64a1b2c3d4e5... or last 8 digits"
                  value={returnOrderRef}
                  onChange={(e) => setReturnOrderRef(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Return Reason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  <MenuItem value="defective">Defective or Damaged</MenuItem>
                  <MenuItem value="wrong_item">Received Wrong Item</MenuItem>
                  <MenuItem value="size_fit">Size or Fit Issue</MenuItem>
                  <MenuItem value="changed_mind">No Longer Needed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth variant="contained" type="submit" sx={{ fontWeight: 'bold' }}>
                  Request
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderPrivacy = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Lock sx={{ fontSize: 44, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Customer Privacy & Data Protection Policy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: 2026 &bull; Compliant with Ethiopian Digital Commerce & Data Confidentiality Standards
          </Typography>
        </Box>
      </Box>

      <Typography paragraph sx={{ lineHeight: 1.8 }}>
        At <strong>EthioMart</strong>, your privacy and trust are of paramount importance. This document details how we collect, safeguard, and use your personal and payment details when you browse our website or make purchases.
      </Typography>

      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
        1. Information We Collect
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
        We collect only the essential details necessary to fulfill your orders and deliver exceptional customer service:
        <br />&bull; <strong>Identity & Contact:</strong> Full name, delivery street address, city, and phone number for courier coordination.
        <br />&bull; <strong>Authentication:</strong> Securely salted and hashed password using modern bcrypt encryption algorithms. We never store plain-text passwords.
        <br />&bull; <strong>Order Records:</strong> Items purchased, shipping timestamps, and transaction references.
      </Typography>

      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
        2. Payment Security (Telebirr, CBE & Cards)
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
        Your financial security is guaranteed through isolated, certified payment gateways:
        <br />&bull; <strong>Telebirr & CBE:</strong> We verify transactions strictly through official SMS reference numbers and merchant codes. We do not require or ask for your personal Telebirr PIN or CBE mobile banking login password.
        <br />&bull; <strong>Credit/Debit Cards:</strong> Card details are tokenized and processed end-to-end via Stripe's PCI-DSS Level 1 compliant infrastructure with 256-bit SSL encryption. EthioMart servers never store full 16-digit card numbers or CVV codes.
      </Typography>

      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
        3. Sharing of Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
        We never sell, rent, or monetize customer data. Information is shared only with verified logistics drivers in Ethiopia strictly for delivering your parcel to your address.
      </Typography>

      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
        4. Data Privacy Officer Contact
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
        If you have questions about your personal data or wish to delete your account, please reach our privacy team at <strong>dabasaborifan@gmail.com</strong> or call <strong>+251 965 844 287</strong> (Bole Road, Addis Ababa, Ethiopia).
      </Typography>
    </Box>
  );

  const renderSell = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Storefront sx={{ fontSize: 44, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Sell on EthioMart & Grow Your Business
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join Ethiopia's fastest-growing digital marketplace. Reach millions of customers in Addis Ababa and nationwide.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Zero Listing Fees', desc: 'List your catalog for free. Only pay a competitive commission when you make a sale.' },
          { title: 'Local Payment Integration', desc: 'Get paid directly into your Telebirr merchant account or CBE bank account automatically.' },
          { title: 'Nationwide Logistics', desc: 'Use our centralized Addis Ababa warehouse or let our drivers pickup directly from your shop.' },
        ].map((item, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Seller Application Form */}
      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Register as an EthioMart Merchant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Submit your business details to receive your seller portal access and start listing products today.
        </Typography>

        {sellerSubmitted ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <strong>Application Submitted!</strong> Thank you for applying to sell on EthioMart. Our merchant verification team in Addis Ababa will review your details and contact you at {sellerForm.phone} today.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSellerSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Store / Business Name"
                  placeholder="e.g. Addis Tech Hub"
                  value={sellerForm.businessName}
                  onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Primary Category"
                  value={sellerForm.category}
                  onChange={(e) => setSellerForm({ ...sellerForm, category: e.target.value })}
                >
                  <MenuItem value="Electronics">Electronics & Computers</MenuItem>
                  <MenuItem value="Clothing">Fashion & Traditional Clothing</MenuItem>
                  <MenuItem value="Home">Home & Kitchen Goods</MenuItem>
                  <MenuItem value="Beauty">Beauty & Personal Care</MenuItem>
                  <MenuItem value="Books">Books & Stationery</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Contact Phone"
                  placeholder="e.g. 0911223344"
                  value={sellerForm.phone}
                  onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="TIN Number (Tax ID)"
                  placeholder="e.g. 0012345678"
                  value={sellerForm.tinNumber}
                  onChange={(e) => setSellerForm({ ...sellerForm, tinNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Operating City"
                  placeholder="Addis Ababa"
                  value={sellerForm.city}
                  onChange={(e) => setSellerForm({ ...sellerForm, city: e.target.value })}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
            >
              Submit Merchant Application
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderGiftCards = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CardGiftcard sx={{ fontSize: 44, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            EthioMart Digital Gift Cards & Vouchers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The ideal present for birthdays, holidays, graduations, and weddings across Ethiopia.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { amount: '500 ETB', usd: '≈ $4.17 USD', code: 'ETHIO500', note: 'Perfect for books & accessories' },
          { amount: '1,000 ETB', usd: '≈ $8.33 USD', code: 'ETHIO1000', note: 'Great for fashion & footwear' },
          { amount: '2,500 ETB', usd: '≈ $20.83 USD', code: 'ETHIO2500', note: 'Best for electronics & gadgets' },
        ].map((item, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                boxShadow: 2,
              }}
            >
              <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.8 }}>
                ETHIOMART E-GIFT
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                {item.amount}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 2, opacity: 0.9 }}>
                {item.usd} &bull; {item.note}
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{ bgcolor: 'white', color: '#1e3a8a', fontWeight: 'bold', '&:hover': { bgcolor: '#f1f5f9' } }}
                onClick={() => {
                  navigator.clipboard.writeText(item.code);
                  toast.success(`Coupon ${item.code} copied!`);
                }}
              >
                Copy Sample Code ({item.code})
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Gift Card Balance Checker */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Check Gift Card or Voucher Balance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter a voucher code to verify its balance and redeemability.
        </Typography>
        <Box component="form" onSubmit={handleCheckGiftCard}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Gift Card or Voucher Code"
                placeholder="e.g. WELCOME10, ETHIO2026, or GIFT-..."
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" type="submit" sx={{ fontWeight: 'bold' }}>
                Check Balance
              </Button>
            </Grid>
          </Grid>
        </Box>

        {giftResult && (
          <Alert severity={giftResult.valid ? 'success' : 'warning'} sx={{ mt: 2, borderRadius: 2 }}>
            <strong>Balance:</strong> {giftResult.balance} &bull; <strong>Status:</strong> {giftResult.status}
          </Alert>
        )}
      </Paper>
    </Box>
  );

  const renderAbout = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        About EthioMart
      </Typography>
      <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
        Empowering Commerce across Ethiopia with Local Trust & Global Standards
      </Typography>
      <Typography paragraph sx={{ lineHeight: 1.8 }}>
        Founded with the mission to accelerate Ethiopia's digital transformation, <strong>EthioMart</strong> bridges local merchants, verified artisans, and international brands directly with consumers across Addis Ababa and nationwide.
      </Typography>
      <Typography paragraph sx={{ lineHeight: 1.8 }}>
        By pioneering frictionless local payment integrations—including <strong>Telebirr (*127#)</strong> and <strong>Commercial Bank of Ethiopia (CBE / *847#)</strong>—we eliminate payment barriers and deliver seamless online shopping directly to every smartphone and computer in Ethiopia.
      </Typography>

      <Grid container spacing={3} sx={{ my: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Our Mission</Typography>
            <Typography variant="body2" color="text.secondary">
              To make modern, secure, and affordable digital shopping accessible to every individual and business throughout Ethiopia.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Payment Inclusion</Typography>
            <Typography variant="body2" color="text.secondary">
              Instant checkout with Telebirr mobile money, CBE bank transfers, cash on delivery, and international credit cards.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Fast Logistics</Typography>
            <Typography variant="body2" color="text.secondary">
              Doorstep delivery in Addis Ababa in 24–48 hours, and 2–4 day regional dispatch to all Ethiopian cities.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #bfdbfe', mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
          Headquarters & Customer Operations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bole Sub-City, Addis Ababa, Ethiopia &bull; Hotline: +251 965 844 287 &bull; Email: dabasaborifan@gmail.com
        </Typography>
      </Box>
    </Box>
  );

  const getContent = () => {
    switch (title) {
      case 'Shipping Information':
        return renderShippingInfo();
      case 'Returns & Replacements':
      case 'Returns':
        return renderReturns();
      case 'Privacy Policy':
        return renderPrivacy();
      case 'Sell on EthioMart':
      case 'Become a Seller':
        return renderSell();
      case 'Gift Cards':
      case 'Registry':
        return renderGiftCards();
      default:
        return renderAbout();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, mb: 4, border: '1px solid #e0e0e0', borderRadius: 3, minHeight: '60vh' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 3, borderBottom: '3px solid #0284c7', display: 'inline-block' }}
        >
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>{getContent()}</Box>
      </Paper>
    </Container>
  );
};

export default InfoPage;