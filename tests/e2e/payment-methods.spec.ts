import { test, expect } from '@playwright/test';

test.describe('Payment Method Setup Flow', () => {
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

    // Mock tRPC API calls for payment methods
    await page.route('**/api/trpc/**', async route => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Mock payment methods list (empty initially)
      if (url.includes('payment.getPaymentMethods') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: { data: [] }
          })
        });
      }
      
      // Mock setup intent creation
      else if (url.includes('payment.createSetupIntent') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                authorizationUrl: 'https://checkout.paystack.com/setup/mock_test_123',
                clientSecret: 'setup_mock_123456789',
                customerId: 'cus_mock_test123'
              }
            }
          })
        });
      }
      
      // Mock setup verification (success)
      else if (url.includes('payment.verifySetup') && method === 'GET') {
        const urlObj = new URL(url);
        const reference = urlObj.searchParams.get('input');
        
        if (reference?.includes('success')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: {
                data: {
                  success: true,
                  transaction: {
                    reference: reference,
                    status: 'success',
                    amount: 100, // R1.00 setup fee
                    channel: 'card',
                    paid_at: new Date().toISOString(),
                  },
                  customer: {
                    customer_code: 'CUS_test123',
                    email: 'test@example.com'
                  }
                }
              }
            })
          });
        } else {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: {
                message: 'Setup verification failed',
                data: { code: 'BAD_REQUEST' }
              }
            })
          });
        }
      }
      
      else {
        await route.continue();
      }
    });
  });

  test('should display payment methods page with breadcrumbs', async ({ page }) => {
    await page.goto('/customer/payments/methods');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Payment Methods")');
    
    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Payments')).toBeVisible();
    await expect(page.locator('text=Payment Methods')).toBeVisible();
    
    // Check page content
    await expect(page.locator('h1')).toContainText('Payment Methods');
    await expect(page.locator('text=Manage your saved payment methods')).toBeVisible();
    
    // Check empty state
    await expect(page.locator('text=No payment methods')).toBeVisible();
    await expect(page.locator('text=Your Paystack account will be created automatically')).toBeVisible();
    
    // Check add payment method button
    await expect(page.locator('button:has-text("Add Payment Method")')).toBeVisible();
  });

  test('should navigate to add payment method page with proper breadcrumbs', async ({ page }) => {
    await page.goto('/customer/payments/methods');
    
    // Click add payment method button
    await page.click('button:has-text("Add Payment Method")');
    
    // Should navigate to add page
    await expect(page).toHaveURL(/\/customer\/payments\/methods\/add/);
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Add Payment Method")');
    
    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Payments')).toBeVisible();
    await expect(page.locator('text=Add Payment Method')).toBeVisible();
    
    // Check page content
    await expect(page.locator('h1')).toContainText('Add Payment Method');
    await expect(page.locator('text=Save a payment method for faster checkout')).toBeVisible();
    
    // Check setup form
    await expect(page.locator('text=Set Up Payment Method')).toBeVisible();
    await expect(page.locator('text=Setup Fee (refunded immediately)')).toBeVisible();
    await expect(page.locator('text=R1.00')).toBeVisible();
    await expect(page.locator('button:has-text("Continue to Paystack")')).toBeVisible();
  });

  test('should handle Paystack redirect flow for setup', async ({ page, context }) => {
    await page.goto('/customer/payments/methods/add');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Add Payment Method")');
    
    // Mock external Paystack redirect
    const paystackPromise = context.waitForEvent('page');
    
    // Click the Continue to Paystack button
    await page.click('button:has-text("Continue to Paystack")');
    
    // In real scenario, user would complete setup on Paystack and return
    // Simulate successful return with setup parameters
    await page.goto('/customer/payments/methods?reference=setup_mock_123456789&trxref=setup_success&setup=success');
    
    // Should redirect to success page
    await expect(page).toHaveURL(/\/customer\/payments\/methods\/success/);
  });

  test('should display payment method setup success page', async ({ page }) => {
    // Navigate directly to success page with successful setup reference
    await page.goto('/customer/payments/methods/success?reference=setup_success_123&trxref=setup_success_123');
    
    // Wait for verification to complete
    await page.waitForSelector('h1:has-text("Payment Method Added Successfully!")');
    
    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator('text=Setup Successful')).toBeVisible();
    
    // Check success content
    await expect(page.locator('h1')).toContainText('Payment Method Added Successfully!');
    await expect(page.locator('text=Your payment method has been securely saved')).toBeVisible();
    
    // Check success details
    await expect(page.locator('text=Setup Complete')).toBeVisible();
    await expect(page.locator('text=Reference:')).toBeVisible();
    await expect(page.locator('text=setup_success_123')).toBeVisible();
    
    // Check next steps
    await expect(page.locator('text=What\'s Next?')).toBeVisible();
    await expect(page.locator('text=Make payments faster')).toBeVisible();
    await expect(page.locator('text=Set up automatic payments')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('button:has-text("View Payment Methods")')).toBeVisible();
    await expect(page.locator('button:has-text("Make a Payment")')).toBeVisible();
  });

  test('should display payment method setup failure page', async ({ page }) => {
    // Navigate directly to failure page with failed setup reference  
    await page.goto('/customer/payments/methods/failure?reference=setup_failed_123&error=card_declined');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Payment Method Setup Failed")');
    
    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator('text=Setup Failed')).toBeVisible();
    
    // Check failure content
    await expect(page.locator('h1')).toContainText('Payment Method Setup Failed');
    await expect(page.locator('text=We couldn\'t add your payment method')).toBeVisible();
    
    // Check error details
    await expect(page.locator('text=Transaction Details')).toBeVisible();
    await expect(page.locator('text=Reference:')).toBeVisible();
    await expect(page.locator('text=setup_failed_123')).toBeVisible();
    await expect(page.locator('text=Error:')).toBeVisible();
    await expect(page.locator('text=card_declined')).toBeVisible();
    
    // Check common issues section
    await expect(page.locator('text=Common Issues & Solutions')).toBeVisible();
    await expect(page.locator('text=Insufficient Funds')).toBeVisible();
    await expect(page.locator('text=Card Declined')).toBeVisible();
    await expect(page.locator('text=Network Issues')).toBeVisible();
    await expect(page.locator('text=Bank Restrictions')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    await expect(page.locator('button:has-text("Back to Payment Methods")')).toBeVisible();
    await expect(page.locator('button:has-text("Contact Support")')).toBeVisible();
  });

  test('should handle success page loading and verification states', async ({ page }) => {
    // Navigate to success page
    await page.goto('/customer/payments/methods/success?reference=setup_verification_123');
    
    // Should show loading state initially
    await expect(page.locator('text=Verifying Payment Method')).toBeVisible();
    await expect(page.locator('text=Please wait while we verify')).toBeVisible();
    
    // Wait for verification to complete and show success
    await page.waitForSelector('h1:has-text("Payment Method Added Successfully!")');
    
    // Check that loading state is gone
    await expect(page.locator('text=Verifying Payment Method')).not.toBeVisible();
  });

  test('should handle verification failure in success page', async ({ page }) => {
    // Mock failed verification
    await page.route('**/api/trpc/**', async route => {
      const url = route.request().url();
      
      if (url.includes('payment.verifySetup') && route.request().method() === 'GET') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: 'Verification failed',
              data: { code: 'BAD_REQUEST' }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/customer/payments/methods/success?reference=setup_failed_verification');
    
    // Should show failure message
    await page.waitForSelector('h1:has-text("Setup Failed")');
    await expect(page.locator('text=There was an issue verifying your payment method setup')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('button:has-text("Payment Methods")')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should handle missing reference parameters', async ({ page }) => {
    // Navigate to success page without reference
    await page.goto('/customer/payments/methods/success');
    
    // Should show error state
    await expect(page.locator('text=No reference provided')).toBeVisible();
    await expect(page.locator('text=Unable to verify payment method setup')).toBeVisible();
    
    // Check back button
    await expect(page.locator('button:has-text("Back to Payment Methods")')).toBeVisible();
  });

  test('should navigate back from failure page', async ({ page }) => {
    await page.goto('/customer/payments/methods/failure?reference=test123');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Payment Method Setup Failed")');
    
    // Click back to payment methods
    await page.click('button:has-text("Back to Payment Methods")');
    
    // Should navigate back to payment methods page
    await expect(page).toHaveURL(/\/customer\/payments\/methods$/);
    await expect(page.locator('h1')).toContainText('Payment Methods');
  });

  test('should retry setup from failure page', async ({ page }) => {
    await page.goto('/customer/payments/methods/failure?reference=test123');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Payment Method Setup Failed")');
    
    // Click try again
    await page.click('button:has-text("Try Again")');
    
    // Should navigate to add payment method page
    await expect(page).toHaveURL(/\/customer\/payments\/methods\/add/);
    await expect(page.locator('h1')).toContainText('Add Payment Method');
  });

  test('should handle redirect logic from main payment methods page', async ({ page }) => {
    // Test successful setup redirect
    await page.goto('/customer/payments/methods?reference=success123&trxref=success123&setup=success');
    
    // Should redirect to success page
    await expect(page).toHaveURL(/\/customer\/payments\/methods\/success/);
    
    // Test failed setup redirect
    await page.goto('/customer/payments/methods?reference=failed123&trxref=failed123&setup=failed');
    
    // Should redirect to failure page
    await expect(page).toHaveURL(/\/customer\/payments\/methods\/failure/);
    
    // Test error redirect
    await page.goto('/customer/payments/methods?reference=error123&error=card_declined');
    
    // Should redirect to failure page
    await expect(page).toHaveURL(/\/customer\/payments\/methods\/failure/);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test payment methods page
    await page.goto('/customer/payments/methods');
    await expect(page.locator('h1')).toContainText('Payment Methods');
    
    // Test add payment method page
    await page.goto('/customer/payments/methods/add');
    await expect(page.locator('h1')).toContainText('Add Payment Method');
    
    // Test success page
    await page.goto('/customer/payments/methods/success?reference=mobile_test');
    await page.waitForSelector('h1'); // Wait for any header to load
    
    // Test failure page
    await page.goto('/customer/payments/methods/failure?reference=mobile_test');
    await expect(page.locator('h1')).toContainText('Payment Method Setup Failed');
    
    // All pages should be functional on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
