#!/usr/bin/env node

/**
 * TextiSur - Webhook & Push Notification Test Script
 * 
 * This script simulates Stripe webhooks and Web Push notifications
 * for testing purposes without needing real Stripe events or user subscriptions.
 * 
 * Usage:
 *   node scripts/test-webhooks.js stripe
 *   node scripts/test-webhooks.js push
 *   node scripts/test-webhooks.js all
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');

// ==========================================
// Configuration
// ==========================================
const CONFIG = {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret',
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
};

// ==========================================
// Stripe Webhook Simulator
// ==========================================
async function simulateStripeWebhook() {
    console.log('🔔 Simulating Stripe Webhook: checkout.session.completed\n');

    // Create a mock Stripe event
    const mockEvent = {
        id: `evt_test_${Date.now()}`,
        object: 'event',
        api_version: '2024-11-20.acacia',
        created: Math.floor(Date.now() / 1000),
        type: 'checkout.session.completed',
        data: {
            object: {
                id: `cs_test_${Date.now()}`,
                object: 'checkout.session',
                amount_total: 5000, // $50.00
                currency: 'mxn',
                customer_email: 'test@example.com',
                payment_status: 'paid',
                metadata: {
                    orderId: '123',
                    userId: '456',
                },
            },
        },
    };

    const payload = JSON.stringify(mockEvent);

    // Generate Stripe signature
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateStripeSignature(payload, timestamp, CONFIG.stripeWebhookSecret);

    // Send webhook request
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': `t=${timestamp},v1=${signature}`,
        },
    };

    console.log('📤 Sending webhook to: /api/webhooks/stripe');
    console.log('📦 Payload:', JSON.stringify(mockEvent, null, 2));
    console.log('🔐 Signature:', signature.substring(0, 20) + '...');
    console.log('');

    try {
        const response = await makeRequest(`${CONFIG.baseUrl}/api/webhooks/stripe`, options, payload);
        console.log('✅ Webhook Response:', response.statusCode, response.body);
    } catch (error) {
        console.error('❌ Webhook Error:', error.message);
    }
}

function generateStripeSignature(payload, timestamp, secret) {
    const signedPayload = `${timestamp}.${payload}`;
    return crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');
}

// ==========================================
// Push Notification Simulator
// ==========================================
async function simulatePushNotification() {
    console.log('📲 Simulating Push Notification\n');

    if (!CONFIG.vapidPublicKey || !CONFIG.vapidPrivateKey) {
        console.error('❌ VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY');
        return;
    }

    const mockNotification = {
        userId: 1, // Change to a real user ID in your database
        title: 'Test Notification',
        body: 'This is a test push notification from the test script',
        url: '/messages',
        icon: '/icon-192x192.png',
    };

    console.log('📤 Sending push notification via: /api/notifications/send');
    console.log('📦 Payload:', JSON.stringify(mockNotification, null, 2));
    console.log('');

    // You need a valid auth token for this endpoint
    console.log('⚠️  Note: You need to login first and get a JWT token');
    console.log('⚠️  Then set it as: export AUTH_TOKEN="your_jwt_token"');
    console.log('');

    const authToken = process.env.AUTH_TOKEN;
    if (!authToken) {
        console.log('ℹ️  To test with authentication:');
        console.log('   1. Login via /api/auth/login');
        console.log('   2. Copy the JWT token');
        console.log('   3. Run: export AUTH_TOKEN="your_token"');
        console.log('   4. Run this script again');
        return;
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
    };

    try {
        const response = await makeRequest(`${CONFIG.baseUrl}/api/notifications/send`, options, JSON.stringify(mockNotification));
        console.log('✅ Push Notification Response:', response.statusCode, response.body);
    } catch (error) {
        console.error('❌ Push Notification Error:', error.message);
    }
}

// ==========================================
// Quick Health Check
// ==========================================
async function checkHealth() {
    console.log('🏥 Checking Application Health\n');

    try {
        const response = await makeRequest(`${CONFIG.baseUrl}/api/health`, { method: 'GET' });
        console.log('✅ Health Check Passed');
        console.log('📊 Response:', JSON.stringify(JSON.parse(response.body), null, 2));
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        process.exit(1);
    }
}

// ==========================================
// HTTP Request Helper
// ==========================================
function makeRequest(url, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.request(urlObj, {
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

// ==========================================
// Login Helper (to get JWT token)
// ==========================================
async function login(email = 'test@example.com', password = 'TestPassword123!') {
    console.log('🔐 Logging in to get JWT token\n');

    const loginData = JSON.stringify({ email, password });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await makeRequest(`${CONFIG.baseUrl}/api/auth/login`, options, loginData);

        if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            console.log('✅ Login successful');
            console.log('🎫 Token:', data.token.substring(0, 20) + '...');
            console.log('');
            console.log('💡 Set this token: export AUTH_TOKEN="' + data.token + '"');
            return data.token;
        } else {
            console.error('❌ Login failed:', response.statusCode, response.body);
            return null;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return null;
    }
}

// ==========================================
// Main Execution
// ==========================================
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    console.log('='.repeat(60));
    console.log('🧪 TextiSur - Webhook & Push Notification Test Script');
    console.log('='.repeat(60));
    console.log('');

    // Always check health first
    await checkHealth();
    console.log('');

    switch (command.toLowerCase()) {
        case 'stripe':
            await simulateStripeWebhook();
            break;

        case 'push':
            await simulatePushNotification();
            break;

        case 'login':
            await login(args[1], args[2]);
            break;

        case 'all':
            await simulateStripeWebhook();
            console.log('\n' + '-'.repeat(60) + '\n');
            await simulatePushNotification();
            break;

        case 'help':
        default:
            console.log('Usage:');
            console.log('  node scripts/test-webhooks.js stripe           # Test Stripe webhook');
            console.log('  node scripts/test-webhooks.js push             # Test push notification');
            console.log('  node scripts/test-webhooks.js login [email] [password]  # Get JWT token');
            console.log('  node scripts/test-webhooks.js all              # Test all');
            console.log('');
            console.log('Environment Variables:');
            console.log('  TEST_BASE_URL              # Default: http://localhost:3000');
            console.log('  STRIPE_WEBHOOK_SECRET      # Your Stripe webhook secret');
            console.log('  AUTH_TOKEN                 # JWT token for authenticated requests');
            console.log('');
            break;
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Test script completed');
    console.log('='.repeat(60));
}

// Run script
main().catch(console.error);
