const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmation = async (order, userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Order Confirmation - #${order._id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order ID: ${order._id}</p>
      <p>Total: $${order.totalPrice.toFixed(2)}</p>
      <h3>Order Items:</h3>
      <ul>
        ${order.orderItems.map(item => `
          <li>${item.name} - Quantity: ${item.quantity} - $${item.price}</li>
        `).join('')}
      </ul>
      <p>We'll send you a shipping confirmation when your items ship.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordReset = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Our E-commerce Store!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for registering with us.</p>
      <p>Start shopping now and enjoy exclusive deals!</p>
      <a href="${process.env.CLIENT_URL}/products">Browse Products</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOrderConfirmation,
  sendPasswordReset,
  sendWelcomeEmail,
};
