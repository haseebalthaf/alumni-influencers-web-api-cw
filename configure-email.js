#!/usr/bin/env node

/**
 * Gmail Configuration Helper for Alumni Influencers
 *
 * This script helps you configure Gmail settings for password reset functionality.
 * Requires 2FA enabled and an App Password.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function configureGmail() {
  console.log('🔧 Gmail Configuration Helper for Alumni Influencers');
  console.log('==================================================\n');

  console.log('📧 Gmail Configuration:');
  console.log('Note: You need 2FA enabled and an App Password from https://myaccount.google.com/apppasswords\n');

  const email = await askQuestion('Enter your Gmail address: ');
  const appPassword = await askQuestion('Enter your Gmail App Password (16 characters): ');

  const config = {
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: '587',
    EMAIL_USER: email,
    EMAIL_PASS: appPassword
  };

  // Update .env file
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add email configuration
    Object.keys(config).forEach(key => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${config[key]}`;

      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Gmail configuration updated successfully!');

    // Test the configuration
    console.log('\n🧪 Testing Gmail configuration...');
    const { spawn } = require('child_process');

    const testProcess = spawn('node', ['-e', `
      const nodemailer = require('nodemailer');
      require('dotenv').config();

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      transporter.verify((error, success) => {
        if (error) {
          console.log('❌ Gmail configuration test failed:', error.message);
          process.exit(1);
        } else {
          console.log('✅ Gmail server connection successful!');
          process.exit(0);
        }
      });
    `], { stdio: 'inherit' });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Gmail configuration is working!');
        console.log('You can now use the password reset feature.');
      } else {
        console.log('\n❌ Gmail configuration test failed.');
        console.log('Please check your credentials and try again.');
        console.log('Make sure:');
        console.log('1. 2FA is enabled on your Google account');
        console.log('2. You are using an App Password (not your regular password)');
        console.log('3. The App Password is exactly 16 characters');
      }
      rl.close();
    });

  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    rl.close();
  }
}

configureGmail().catch(console.error);