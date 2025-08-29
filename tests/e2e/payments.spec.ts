import { test, expect } from '@playwright/test';

test.describe('Payment Flow with Paystack', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - simulate logged in user
    await page.route('**/api/auth/**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user_test123',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock tRPC API calls
    await page.route('**/api/trpc/**', async route => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Mock payment stats
      if (url.includes('payment.getPaymentStats') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                totalPaid: 15000,
                pendingPayments: 2,
                thisYearPayments: 12000,
              }
            }
          })
        });
      }
      
      // Mock upcoming payments
      else if (url.includes('payment.getUpcomingPayments') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: [
                {
                  id: 'payment_upcoming1',
                  amount: 1500,
                  status: 'PENDING',
                  type: 'PREMIUM',
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                  policy: {
                    policyNumber: 'POL-HOME-001',
                    type: 'HOME',
                  },
                },
              ]
            }
          })
        });
      }
      
      // Mock payment history
      else if (url.includes('payment.getPaymentHistory') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                payments: [
                  {
                    id: 'payment_history1',
                    amount: 1200,
                    status: 'COMPLETED',
                    type: 'PREMIUM',
                    createdAt: new Date().toISOString(),
                    policy: {
                      policyNumber: 'POL-HOME-002',
                      type: 'HOME',
                    },
                  },
                ],
                total: 1,
                hasMore: false,
              }
            }
          })
        });
      }
      
      // Mock customer transactions
      else if (url.includes('payment.getCustomerTransactions') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                email: 'test@example.com',
                customer_code: 'CUS_test123',
                first_name: 'John',
                last_name: 'Doe',
              }
            }
          })
        });
      }
      
      // Mock payment intent creation
      else if (url.includes('payment.createPaymentIntent') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                authorization_url: 'https://checkout.paystack.com/pay/mock_test_123',
                reference: 'ref_mock_123456789',
              }
            }
          })
        });
      }
      
      // Mock payment verification
      else if (url.includes('payment.verifyPayment') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                success: true,
                transaction: {
                  reference: 'ref_mock_123456789',
                  amount: 150000, // 1500 ZAR in kobo
                  status: 'success',
                  channel: 'card',
                  paid_at: new Date().toISOString(),
                }
              }
            }
          })
        });
      }
      
      // Mock payment details
      else if (url.includes('payment.getPayment') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                id: 'payment_detail123',
                amount: 1500,
                status: 'PENDING',
                type: 'PREMIUM',
                policyId: 'policy_123',
                policy: {
                  policyNumber: 'POL-HOME-001',
                  type: 'HOME',
                },
              }
            }
          })
        });
      }
      
      else {
        await route.continue();
      }
    });
  });

  test('should display payments overview page correctly', async ({ page }) => {
    await page.goto('/payments');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Payments & Billing")');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Payments & Billing');
    
    // Check navigation tabs
    await expect(page.locator('button:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button:has-text("Payment History")')).toBeVisible();
    await expect(page.locator('button:has-text("Payment Methods")')).toBeVisible();
    
    // Check stats cards are displayed with ZAR currency
    await expect(page.locator('text=Total Paid This Year')).toBeVisible();
    await expect(page.locator('text=R12,000')).toBeVisible(); // thisYearPayments
    
    await expect(page.locator('text=Total Paid')).toBeVisible();
    await expect(page.locator('text=R15,000')).toBeVisible(); // totalPaid
    
    await expect(page.locator('text=Pending Payments')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible(); // pendingPayments count
    
    // Check upcoming payments section
    await expect(page.locator('text=Upcoming Payments')).toBeVisible();
    await expect(page.locator('text=POL-HOME-001')).toBeVisible();
    await expect(page.locator('text=R1,500')).toBeVisible(); // payment amount in ZAR
    await expect(page.locator('button:has-text("Pay Now")')).toBeVisible();
  });

  test('should navigate to payment tabs correctly', async ({ page }) => {
    await page.goto('/payments');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Payments & Billing")');
    
    // Click on Payment History tab
    await page.click('button:has-text("Payment History")');
    await expect(page.locator('text=Complete history of your payments')).toBeVisible();
    await expect(page.locator('text=POL-HOME-002')).toBeVisible(); // from mock history
    
    // Click on Payment Methods tab
    await page.click('button:has-text("Payment Methods")');
    await expect(page.locator('text=Manage your saved payment methods')).toBeVisible();
    await expect(page.locator('text=Paystack Account')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
    await expect(page.locator('text=CUS_test123')).toBeVisible();
  });

  test('should initiate Paystack payment flow', async ({ page }) => {
    await page.goto('/payments');
    
    // Wait for page to load and click Pay Now button
    await page.waitForSelector('button:has-text("Pay Now")');
    await page.click('button:has-text("Pay Now")');
    
    // Should navigate to payment page
    await expect(page).toHaveURL(/\/payments\/payment_upcoming1\/pay/);
    
    // Wait for payment page to load
    await page.waitForSelector('h1:has-text("Complete Payment")');
    
    // Check payment page elements
    await expect(page.locator('text=Complete your payment securely using Paystack')).toBeVisible();
    await expect(page.locator('text=Premium Payment - Policy POL-HOME-001')).toBeVisible();
    await expect(page.locator('text=R1,500')).toBeVisible(); // amount in ZAR
    
    // Check Paystack-specific elements
    await expect(page.locator('text=Pay with Paystack')).toBeVisible();
    await expect(page.locator('text=You\'ll be redirected to Paystack')).toBeVisible();
    await expect(page.locator('text=Reference: ref_mock_123456789')).toBeVisible();
    
    // Check payment buttons
    await expect(page.locator('button:has-text("Pay R1,500")')).toBeVisible();
    await expect(page.locator('button:has-text("Verify Payment")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });

  test('should handle Paystack redirect flow', async ({ page, context }) => {
    await page.goto('/payments/payment_detail123/pay');
    
    // Wait for payment page to load
    await page.waitForSelector('h1:has-text("Complete Payment")');
    
    // Mock external Paystack redirect - simulate new page opening
    const paystackPromise = context.waitForEvent('page');
    
    // Click the Pay button to simulate Paystack redirect
    await page.click('button:has-text("Pay R1,500")');
    
    // In a real scenario, this would redirect to Paystack
    // For testing, we simulate the redirect behavior
    await page.waitForTimeout(1000); // Simulate redirect delay
    
    // After payment on Paystack (simulated), user returns with reference
    await page.goto('/payments/verify?reference=ref_mock_123456789');
    
    // Wait for verification page
    await page.waitForSelector('h1:has-text("Payment Verification")');
    
    // Check verification page elements
    await expect(page.locator('text=Verifying your payment with Paystack')).toBeVisible();
    await expect(page.locator('text=Reference: ref_mock_123456789')).toBeVisible();
    
    // Wait for verification to complete (simulated success)
    await page.waitForSelector('text=Payment Successful!', { timeout: 10000 });
    
    // Check success message
    await expect(page.locator('text=Payment of R1,500 was successful!')).toBeVisible();
    await expect(page.locator('text=Redirecting to payments page')).toBeVisible();
  });

  test('should handle manual payment verification', async ({ page }) => {
    await page.goto('/payments/payment_detail123/pay');
    
    // Wait for payment page to load
    await page.waitForSelector('h1:has-text("Complete Payment")');
    
    // Click Verify Payment button (for users returning from Paystack)
    await page.click('button:has-text("Verify Payment")');
    
    // Wait for verification to complete
    await page.waitForTimeout(2000);
    
    // Should show success message
    await expect(page.locator('text=Payment Successful!')).toBeVisible();
    await expect(page.locator('text=Your payment for R1,500 has been processed successfully')).toBeVisible();
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    // Mock failed payment verification
    await page.route('**/api/trpc/**', async route => {
      const url = route.request().url();
      
      if (url.includes('payment.verifyPayment') && route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: 'Payment not successful',
              data: {
                code: 'BAD_REQUEST',
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/payments/verify?reference=ref_failed_123');
    
    // Wait for verification page
    await page.waitForSelector('h1:has-text("Payment Verification")');
    
    // Wait for error to appear
    await page.waitForSelector('text=Payment Failed', { timeout: 10000 });
    
    // Check error handling
    await expect(page.locator('text=Payment Failed')).toBeVisible();
    await expect(page.locator('button:has-text("Back to Payments")')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should display payment history with ZAR currency', async ({ page }) => {
    await page.goto('/payments');
    
    // Click on Payment History tab
    await page.click('button:has-text("Payment History")');
    
    // Wait for history to load
    await page.waitForSelector('text=Complete history of your payments');
    
    // Check that amounts are displayed in ZAR
    await expect(page.locator('text=R1,200')).toBeVisible(); // from mock history
    await expect(page.locator('text=POL-HOME-002')).toBeVisible();
    await expect(page.locator('text=Paid')).toBeVisible(); // status badge
    
    // Check export button is present
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test('should show Paystack integration in payment methods', async ({ page }) => {
    await page.goto('/payments');
    
    // Click on Payment Methods tab
    await page.click('button:has-text("Payment Methods")');
    
    // Wait for methods to load
    await page.waitForSelector('text=Manage your saved payment methods');
    
    // Check Paystack-specific elements
    await expect(page.locator('text=Paystack Account')).toBeVisible();
    await expect(page.locator('text=test@example.com • Customer Code: CUS_test123')).toBeVisible();
    await expect(page.locator('button:has-text("Active")')).toBeVisible();
    
    // Check disabled integration button
    await expect(page.locator('button:has-text("Paystack Integration")')).toBeVisible();
    await expect(page.locator('button:has-text("Paystack Integration")')).toBeDisabled();
  });

  test('should handle empty payment states', async ({ page }) => {
    // Mock empty responses
    await page.route('**/api/trpc/**', async route => {
      const url = route.request().url();
      
      if (url.includes('payment.getUpcomingPayments')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: { data: [] }
          })
        });
      } else if (url.includes('payment.getPaymentHistory')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                payments: [],
                total: 0,
                hasMore: false,
              }
            }
          })
        });
      } else if (url.includes('payment.getCustomerTransactions')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: { data: null }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/payments');
    
    // Check empty upcoming payments
    await expect(page.locator('text=No upcoming payments')).toBeVisible();
    
    // Check payment history tab
    await page.click('button:has-text("Payment History")');
    await expect(page.locator('text=No payment history')).toBeVisible();
    await expect(page.locator('text=You haven\'t made any payments yet')).toBeVisible();
    
    // Check payment methods tab
    await page.click('button:has-text("Payment Methods")');
    await expect(page.locator('text=No payment methods')).toBeVisible();
    await expect(page.locator('text=Your Paystack account will be created automatically')).toBeVisible();
  });
});