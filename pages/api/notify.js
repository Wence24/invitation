import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { date, time, message, selectedImageLabel } = req.body; // Destructure location

    // Log the received data
    console.log("Received data:", { date, time, message, selectedImageLabel });

    // Validate that all required fields are provided
    if (!date || !time || !message || !selectedImageLabel) {
      console.error("Missing data:", { date, time, message, selectedImageLabel });
      return res.status(400).json({ message: "Missing data in the request" });
    }

    // Log SMTP configuration for debugging
    console.log("SMTP Host:", process.env.SMTP_HOST);
    console.log("SMTP Port:", process.env.SMTP_PORT);
    console.log("Email User:", process.env.EMAIL_USER);

    // Create a Nodemailer transporter with the correct SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,    // SMTP server (e.g., smtp.gmail.com)
      port: process.env.SMTP_PORT,    // SMTP port (e.g., 587 for TLS)
      secure: false,                  // false for TLS, true for SSL
      auth: {
        user: process.env.EMAIL_USER, // Email user from environment variables
        pass: process.env.EMAIL_PASS, // Email password from environment variables
      },
      tls: {
        rejectUnauthorized: false,   // Accept self-signed certificates
      },
      logger: true,                   // Enable logging for debugging
      debug: true,                    // Enable debugging logs
    });

    // Set up the email data
    const mailOptions = {
      from: process.env.EMAIL_USER,    // Sender's email address
      to: "aiakosedt@gmail.com",      // Recipient's email address (replace with actual recipient)
      subject: `Event Notification for ${date}`,
      text: `
        You have an event scheduled for ${date} at ${time}.
        Message: ${message}
        Location: ${selectedImageLabel}
      `,
    };

    try {
      // Send the email with the prepared options
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      // Log any error that occurs when sending the email
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email", error: error.message });
    }
  } else {
    // Handle unsupported methods
    console.error("Method Not Allowed");
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
