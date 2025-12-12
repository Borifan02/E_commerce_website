import React from 'react';
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
    ListItemText
} from '@mui/material';
import {
    ExpandMore,
    CheckCircle,
    LocalShipping,
    Security,
    CardGiftcard,
    Storefront,
    Email,
    Phone
} from '@mui/icons-material';

const InfoPage = ({ title }) => {
    // --- Content Generators ---

    const renderDeals = () => (
        <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 6, transform: 'scale(1.02)', transition: '0.2s' } }}>
                        <Box sx={{ height: 140, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" color="text.secondary">Usually Image</Typography>
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h5" component="div" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                {50 - item * 5}% OFF
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Amazing Deal on Product #{item}. Limited time offer!
                            </Typography>
                            <Button variant="contained" size="small" sx={{ mt: 2 }} fullWidth color="warning">
                                Shop Now
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderFAQ = () => (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Frequently Asked Questions
        </Typography>

        {[
            {
                question: "How do I track my order?",
                answer:
                    "Once your order is shipped, you will receive a confirmation email with a tracking link. You can click the link to view real-time updates on your delivery status."
            },
            {
                question: "What is the return policy?",
                answer:
                    "You can return items within 7–14 days of delivery as long as the product is unused and in its original packaging. Contact our support team to start a return request."
            },
            {
                question: "Do you ship internationally?",
                answer:
                    "Yes, we offer international shipping to most countries. Shipping fees and delivery times may vary based on your location."
            },
            {
                question: "How can I change my payment method?",
                answer:
                    "You can update your payment method during checkout. If your order is already placed, please contact our support team to make changes before your order is processed."
            }
        ].map((item, i) => (
            <Accordion key={i}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography fontWeight="medium">{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="text.secondary">
                        {item.answer}
                    </Typography>
                </AccordionDetails>
            </Accordion>
        ))}
    </Box>
);


    const renderContactForm = () => (
        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Get in Touch</Typography>
                <Typography paragraph>
                    We'd love to hear from you. Please fill out this form and we will get in touch with you shortly.
                </Typography>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                    <TextField fullWidth label="Name" margin="normal" variant="outlined" />
                    <TextField fullWidth label="Email" margin="normal" variant="outlined" />
                    <TextField fullWidth label="Subject" margin="normal" variant="outlined" />
                    <TextField fullWidth label="Message" margin="normal" multiline rows={4} variant="outlined" />
                    <Button variant="contained" size="large" sx={{ mt: 3 }}>
                        Send Message
                    </Button>
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Contact Information</Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon><LocationOn /></ListItemIcon>
                            <ListItemText primary="Address" secondary="123 Commerce St, Seattle, WA 98109" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><Phone /></ListItemIcon>
                            <ListItemText primary="Phone" secondary="+1 (206) 555-0123" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><Email /></ListItemIcon>
                            <ListItemText primary="Email" secondary="support@amazonclone.com" />
                        </ListItem>
                    </List>
                </Box>
            </Grid>
        </Grid>
    );

    const renderRegistry = () => (
        <Box textAlign="center" py={5}>
            <CardGiftcard sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>Celebrate with Amazon Clone Registry</Typography>
            <Typography paragraph color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                Whether you're planning a wedding, a baby shower, or a housewarming party, our registry makes it easy for your friends and family to find the perfect gift.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" size="large">Create a Registry</Button>
                <Button variant="outlined" size="large">Find a Registry</Button>
            </Box>
        </Box>
    );

    const LocationOn = () => <Box component="span" pr={1}>📍</Box>; // Simple icon fallback if import fails

    // --- Content Switcher ---

    const getContent = () => {
        switch (title) {
            case "Today's Deals":
                return renderDeals();
            case "Customer Service":
            case "Help Center":
                return (
                    <Box>
                        <Typography paragraph>
                            Hello, how can we help you today? Browse our help topics below or contact us directly.
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {['Your Orders', 'Returns & Refunds', 'Digital Services', 'Manage Prime', 'Payment Settings', 'Account Security'].map((item) => (
                                <Grid item xs={12} sm={4} key={item}>
                                    <Paper variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9', borderColor: 'primary.main' } }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{item}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        {renderFAQ()}
                    </Box>
                );
            case "Registry":
                return renderRegistry();
            case "Gift Cards":
                return (
                    <Box>
                        <Typography paragraph>Shop for Gift Cards for every occasion.</Typography>
                        <Grid container spacing={3}>
                            {[1, 2, 3].map(i => (
                                <Grid item xs={12} sm={4} key={i}>
                                    <Card sx={{ bgcolor: i === 1 ? '#000' : i === 2 ? '#1a237e' : '#b71c1c', color: 'white', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                        <Typography variant="h5">Amazon Clone Gift Card</Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box mt={4}>
                            <Button variant="contained">Reload Your Balance</Button>
                        </Box>
                    </Box>
                );
            case "Sell on Amazon Clone":
                return (
                    <Box textAlign="center">
                        <Storefront sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                        <Typography variant="h4" gutterBottom>Become an Amazon Clone Seller</Typography>
                        <Typography paragraph>Reach millions of customers and grow your business with us.</Typography>
                        <Grid container spacing={2} justifyContent="center" sx={{ my: 4 }}>
                            {['Low Fees', 'Secure Payments', 'Global Reach', '24/7 Support'].map(feat => (
                                <Grid item xs={6} sm={3} key={feat}>
                                    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                                        <CheckCircle color="success" sx={{ mb: 1 }} />
                                        <Typography variant="subtitle2">{feat}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Button variant="contained" size="large" color="secondary">Sign Up to Sell</Button>
                    </Box>
                );
            case "Contact Us":
                return renderContactForm();
            case "Shipping Information":
                return (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <LocalShipping sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                            <Typography variant="h5">Fast & Reliable Shipping</Typography>
                        </Box>
                        <Typography paragraph>We offer a variety of shipping options to meet your needs.</Typography>
                        <Paper variant="outlined">
                            <Box p={2} sx={{ bgcolor: '#eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                <Box>Shipping Speed</Box><Box>Cost</Box>
                            </Box>
                            <List>
                                <ListItem divider>
                                    <ListItemText primary="Standard Shipping (4-5 business days)" />
                                    <Typography>FREE on orders over $25</Typography>
                                </ListItem>
                                <ListItem divider>
                                    <ListItemText primary="Two-Day Shipping" />
                                    <Typography>$9.99 (Free for Prime)</Typography>
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="One-Day Shipping" />
                                    <Typography>$14.99</Typography>
                                </ListItem>
                            </List>
                        </Paper>
                    </Box>
                );
            case "Privacy Policy":
                return (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Security sx={{ mr: 1 }} />
                            <Typography variant="h6">We value your privacy</Typography>
                        </Box>
                        <Typography paragraph>
                            Last updated: December 11, 2025
                        </Typography>
                        <Typography paragraph>
                            At Amazon Clone, we know that you care how information about you is used and shared, and we appreciate your trust that we will do so carefully and sensibly.
                        </Typography>
                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Information We Collect</Typography>
                        <Typography paragraph>
                            We collect your personal information in order to provide and continually improve our products and services.
                            Here are the types of personal information we collect...
                        </Typography>
                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>How We Use Your Information</Typography>
                        <Typography paragraph>
                            We use your personal information to operate, provide, develop, and improve the products and services that we offer our customers.
                            These purposes include: Purchase and delivery of products and services, Recommendations and personalization, etc.
                        </Typography>
                    </Box>
                );
            case "Returns & Replacements":
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>Returns Center</Typography>
                        <Typography paragraph>
                            Props to you for giving it a shot! If it didn't work out, you can return most items within 30 days of delivery.
                        </Typography>
                        <Button variant="contained" sx={{ mb: 4 }}>Start a Return</Button>
                        {renderFAQ()}
                    </Box>
                );
            default: // About Us, etc.
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>About {title}</Typography>
                        <Typography paragraph>
                            Amazon Clone is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.
                        </Typography>
                        <Typography paragraph>
                            We strive to have the positive impact on customers, employees, small businesses, the economy, and communities.
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 4, bgcolor: '#f5f5f5', height: '200px' }}>
                                    <Typography variant="h6">Our Mission</Typography>
                                    <Typography>To be Earth's most customer-centric company.</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 4, bgcolor: '#f5f5f5', height: '200px' }}>
                                    <Typography variant="h6">Our Vision</Typography>
                                    <Typography>Building the future of e-commerce, today.</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                );
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e0e0e0', minHeight: '60vh' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3, borderBottom: '3px solid #febd69', display: 'inline-block' }}>
                    {title}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {getContent()}
                </Box>
            </Paper>
        </Container>
    );
};

export default InfoPage;
