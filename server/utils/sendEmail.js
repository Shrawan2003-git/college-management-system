const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"College Events" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
};

const registrationConfirmationEmail = (user, event, ticketId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6C63FF, #5A52D5); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 30px; }
    .ticket { background: #f8f7ff; border: 2px dashed #6C63FF; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .ticket-id { font-size: 28px; font-weight: bold; color: #6C63FF; letter-spacing: 3px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .footer { background: #f8f7ff; padding: 20px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Registration Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">You're all set for the event</p>
    </div>
    <div class="body">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your registration for <strong>${event.title}</strong> has been confirmed!</p>
      <div class="ticket">
        <p style="margin: 0; color: #666; font-size: 13px;">Your Ticket ID</p>
        <div class="ticket-id">${ticketId}</div>
        <p style="margin: 8px 0 0; color: #666; font-size: 12px;">Show this at the event entrance</p>
      </div>
      <div class="info-row">
        <span><strong>Event</strong></span>
        <span>${event.title}</span>
      </div>
      <div class="info-row">
        <span><strong>Date</strong></span>
        <span>${new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
      </div>
      <div class="info-row">
        <span><strong>Venue</strong></span>
        <span>${event.venue}</span>
      </div>
      <div class="info-row">
        <span><strong>Category</strong></span>
        <span style="text-transform: capitalize">${event.category}</span>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} College Event Management System</p>
      <p>Keep this ticket ID safe – you'll need it at the event entrance!</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, registrationConfirmationEmail };
