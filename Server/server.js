const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Agenda = require('agenda');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Use dotenv for environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/email_sequence'); // Use 127.0.0.1 for compatibility with IPv4
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Schema for saving flow
const flowSchema = new mongoose.Schema({
  flow: Object,
});
const Flow = mongoose.model('Flow', flowSchema);

// Agenda setup
const agenda = new Agenda({ db: { address: 'mongodb://127.0.0.1:27017/agenda' } });

agenda.define('send email', async (job) => {
  const { email, subject, body } = job.attrs.data;
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // Secure email user in .env
        pass: process.env.EMAIL_PASSWORD, // Secure email password in .env
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: body,
    });

    console.log('Email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
});

agenda.start();

// API endpoints
app.post('/save-flow', async (req, res) => {
  try {
    const { flow } = req.body;
    const savedFlow = new Flow({ flow });
    await savedFlow.save();
    res.status(200).send('Flow saved successfully');
  } catch (error) {
    console.error('Error saving flow:', error);
    res.status(500).send('Error saving flow');
  }
});

app.post('/schedule-email', async (req, res) => {
  try {
    const { email, subject, body, delay } = req.body;

    await agenda.schedule(delay, 'send email', { email, subject, body });
    res.status(200).send('Email scheduled successfully');
  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).send('Error scheduling email');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
