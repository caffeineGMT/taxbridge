/**
 * Stripe initialization and utilities
 * Server-side Stripe instance for payment processing
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export const STRIPE_CONFIG = {
  proPriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1ProAnnual',
  enterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_1EntAnnual',
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?upgrade=cancelled`,
};
