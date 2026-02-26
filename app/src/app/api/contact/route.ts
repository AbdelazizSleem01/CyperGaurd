import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: (process.env.SMTP_USER || '').trim(),
      pass: (process.env.SMTP_PASS || '').trim(),
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing, logging message instead:', { name, email, subject });
      return NextResponse.json({
        success: true,
        message: 'Message received (Development mode: SMTP not configured)'
      });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'cyperguard@gmail.com',
      replyTo: email,
      subject: `[CyberGuard Contact] ${getSubjectLabel(subject)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0ea5e9; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Name:</strong>
              <p style="color: #666; margin: 5px 0;">${name}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Email:</strong>
              <p style="color: #666; margin: 5px 0;">
                <a href="mailto:${email}" style="color: #0ea5e9;">${email}</a>
              </p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Subject:</strong>
              <p style="color: #666; margin: 5px 0;">${getSubjectLabel(subject)}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #333;">Message:</strong>
              <p style="color: #666; margin: 5px 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              This email was sent from the CyberGuard contact form.
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send auto-reply to the user
    const autoReplyOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting CyberGuard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0ea5e9; margin-bottom: 20px;">Thank You for Contacting Us</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Dear ${name},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for reaching out to CyberGuard. We have received your message and will get back to you within 24 hours.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              For urgent matters, please call us at +1 (234) 567-890.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              CyberGuard Security Inc.<br />
              Enterprise Security Monitoring Platform
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(autoReplyOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

function getSubjectLabel(subject: string): string {
  const subjects: Record<string, string> = {
    general: 'General Inquiry',
    sales: 'Sales & Pricing',
    support: 'Technical Support',
    partnership: 'Partnership',
    other: 'Other',
  };
  return subjects[subject] || subject;
}