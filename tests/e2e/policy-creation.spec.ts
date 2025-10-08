import { test, expect } from '@playwright/test';

test.describe('Policy Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - simulate logged in customer
    await page.route('**/api/auth/**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user_test123',
              email: 'customer@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'CUSTOMER',
              profileComplete: true
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

      // Mock get quote
      if (url.includes('policy.getQuote') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                premium: 850,
                annualPremium: 10200,
                breakdown: {
                  basePremium: 750,
                  riskFactors: [
                    { factor: 'Property Type', adjustment: 50 },
                    { factor: 'Location Risk', adjustment: 100 }
                  ],
                  discounts: [
                    { reason: 'Security Features', amount: -50 }
                  ]
                }
              }
            }
          })
        });
      }

      // Mock policy creation
      else if (url.includes('policy.create') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                id: 'policy_new123',
                policyNumber: 'POL-HOME-123',
                type: 'HOME',
                status: 'PENDING_PAYMENT',
                premium: 850,
                coverageAmount: 500000,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
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
                authorization_url: 'https://checkout.paystack.com/pay/test_auth_123',
                reference: 'ref_test_policy_payment_123'
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

  test('should display get quote page correctly', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Get Insurance Quote")');

    // Check page title
    await expect(page.locator('h1')).toContainText('Get Insurance Quote');

    // Check form fields are present
    await expect(page.locator('label:has-text("Policy Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Property Address")')).toBeVisible();
    await expect(page.locator('label:has-text("Property Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Coverage Amount")')).toBeVisible();
  });

  test('should complete quote request form', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Wait for form to load
    await page.waitForSelector('h1:has-text("Get Insurance Quote")');

    // Select policy type
    await page.click('[name="type"]');
    await page.click('text=Home Building Insurance');

    // Fill in property address
    await page.fill('[name="propertyAddress"]', '123 Main Street, Johannesburg, Gauteng');

    // Select property type
    await page.click('[name="propertyType"]');
    await page.click('text=House');

    // Fill in coverage amount
    await page.fill('[name="coverageAmount"]', '500000');

    // Fill in building value
    await page.fill('[name="buildingValue"]', '500000');

    // Select province
    await page.click('[name="province"]');
    await page.click('text=Gauteng');

    // Select security features
    await page.check('text=Alarm System');
    await page.check('text=Security Gates');

    // Click calculate quote button
    await page.click('button:has-text("Calculate Quote")');

    // Wait for quote to display
    await page.waitForSelector('text=Monthly Premium');

    // Verify quote results
    await expect(page.locator('text=R850')).toBeVisible(); // monthly premium
    await expect(page.locator('text=R10,200')).toBeVisible(); // annual premium
    await expect(page.locator('text=Coverage Amount: R500,000')).toBeVisible();
  });

  test('should show quote breakdown details', async ({ page }) => {
    await page.goto('/customer/policies/quote?type=HOME&coverageAmount=500000');

    // Wait for quote to load
    await page.waitForSelector('h2:has-text("Your Quote")');

    // Verify breakdown section
    await expect(page.locator('text=Premium Breakdown')).toBeVisible();
    await expect(page.locator('text=Base Premium')).toBeVisible();
    await expect(page.locator('text=R750')).toBeVisible();

    // Verify risk factors
    await expect(page.locator('text=Risk Factors')).toBeVisible();
    await expect(page.locator('text=Property Type')).toBeVisible();
    await expect(page.locator('text=Location Risk')).toBeVisible();

    // Verify discounts
    await expect(page.locator('text=Discounts')).toBeVisible();
    await expect(page.locator('text=Security Features')).toBeVisible();
    await expect(page.locator('text=-R50')).toBeVisible();
  });

  test('should allow customization of quote', async ({ page }) => {
    await page.goto('/customer/policies/quote?type=HOME&coverageAmount=500000');

    // Wait for quote to load
    await page.waitForSelector('h2:has-text("Your Quote")');

    // Adjust deductible
    await page.click('text=Customize Coverage');
    await page.waitForSelector('[name="deductible"]');
    await page.selectOption('[name="deductible"]', '10000');

    // Add optional coverage
    await page.check('text=Geyser Burst Cover');
    await page.check('text=Natural Disaster Cover');

    // Click recalculate
    await page.click('button:has-text("Recalculate Quote")');

    // Wait for updated quote
    await page.waitForTimeout(1000);

    // Verify quote updated (values would change with real calculation)
    await expect(page.locator('text=Monthly Premium')).toBeVisible();
  });

  test('should proceed to purchase policy', async ({ page }) => {
    await page.goto('/customer/policies/quote?type=HOME&coverageAmount=500000');

    // Wait for quote to load
    await page.waitForSelector('h2:has-text("Your Quote")');

    // Click purchase button
    await page.click('button:has-text("Purchase Policy")');

    // Should navigate to application page
    await expect(page).toHaveURL(/\/customer\/policies\/apply/);

    // Wait for application form
    await page.waitForSelector('h1:has-text("Complete Your Application")');

    // Verify form sections
    await expect(page.locator('text=Property Details')).toBeVisible();
    await expect(page.locator('text=Coverage Details')).toBeVisible();
    await expect(page.locator('text=Personal Information')).toBeVisible();
  });

  test('should complete policy application', async ({ page }) => {
    await page.goto('/customer/policies/apply');

    // Wait for application form
    await page.waitForSelector('h1:has-text("Complete Your Application")');

    // Fill in property details (some pre-filled from quote)
    await page.fill('[name="propertyAddress"]', '123 Main Street, Johannesburg, Gauteng');
    await page.fill('[name="postalCode"]', '2001');
    await page.fill('[name="numberOfRooms"]', '4');
    await page.fill('[name="yearBuilt"]', '2010');

    // Select construction type
    await page.click('[name="constructionType"]');
    await page.click('text=Brick');

    // Confirm coverage details
    await page.fill('[name="coverageAmount"]', '500000');
    await page.fill('[name="buildingValue"]', '500000');

    // Agree to terms
    await page.check('text=I agree to the terms and conditions');
    await page.check('text=I confirm that all information provided is accurate');

    // Submit application
    await page.click('button:has-text("Submit Application")');

    // Wait for payment page
    await page.waitForSelector('text=Complete Payment');

    // Verify policy created
    await expect(page.locator('text=Policy POL-HOME-123')).toBeVisible();
    await expect(page.locator('text=Monthly Premium: R850')).toBeVisible();
  });

  test('should handle policy payment', async ({ page }) => {
    await page.goto('/customer/policies/policy_new123/pay');

    // Wait for payment page
    await page.waitForSelector('h1:has-text("Complete Payment")');

    // Verify payment details
    await expect(page.locator('text=Policy POL-HOME-123')).toBeVisible();
    await expect(page.locator('text=R850')).toBeVisible();
    await expect(page.locator('text=First Month Premium')).toBeVisible();

    // Click pay button
    await page.click('button:has-text("Pay R850")');

    // Should get payment reference
    await expect(page.locator('text=ref_test_policy_payment_123')).toBeVisible();

    // Verify Paystack redirect message
    await expect(page.locator('text=Redirecting to Paystack')).toBeVisible();
  });

  test('should show validation errors for incomplete form', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Wait for form to load
    await page.waitForSelector('h1:has-text("Get Insurance Quote")');

    // Try to submit without filling required fields
    await page.click('button:has-text("Calculate Quote")');

    // Wait for validation errors
    await page.waitForTimeout(500);

    // Verify error messages
    await expect(page.locator('text=Policy type is required')).toBeVisible();
    await expect(page.locator('text=Property address is required')).toBeVisible();
    await expect(page.locator('text=Coverage amount is required')).toBeVisible();
  });

  test('should validate coverage amount range', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Get Insurance Quote")');

    // Try too low coverage
    await page.fill('[name="coverageAmount"]', '10000');
    await page.click('button:has-text("Calculate Quote")');

    // Should show error
    await expect(page.locator('text=Minimum coverage is R50,000')).toBeVisible();

    // Try too high coverage
    await page.fill('[name="coverageAmount"]', '20000000');
    await page.click('button:has-text("Calculate Quote")');

    // Should show error
    await expect(page.locator('text=Maximum coverage is R10,000,000')).toBeVisible();
  });

  test('should allow saving as draft', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Fill partial form
    await page.fill('[name="propertyAddress"]', '123 Main Street');
    await page.click('[name="type"]');
    await page.click('text=Home Building Insurance');

    // Click save as draft
    await page.click('button:has-text("Save as Draft")');

    // Wait for confirmation
    await page.waitForSelector('text=Draft Saved');

    // Verify success message
    await expect(page.locator('text=You can complete your application later')).toBeVisible();
  });

  test('should load saved draft', async ({ page }) => {
    // Mock draft policy
    await page.route('**/api/trpc/**', async route => {
      const url = route.request().url();

      if (url.includes('policy.getDrafts')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: [{
                id: 'draft_123',
                type: 'HOME',
                propertyAddress: '123 Main Street',
                status: 'DRAFT',
                createdAt: new Date().toISOString()
              }]
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/customer/policies');

    // Click on drafts tab
    await page.click('text=Drafts');

    // Wait for draft to appear
    await page.waitForSelector('text=123 Main Street');

    // Click resume draft
    await page.click('button:has-text("Resume")');

    // Should navigate back to form with pre-filled data
    await expect(page).toHaveURL(/\/customer\/policies\/edit\/draft_123/);
    await expect(page.getByDisplayValue('123 Main Street')).toBeVisible();
  });

  test('should show policy type selection options', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Click policy type dropdown
    await page.click('[name="type"]');

    // Verify all policy types available
    await expect(page.locator('text=Home Building Insurance')).toBeVisible();
    await expect(page.locator('text=Contents Insurance')).toBeVisible();
    await expect(page.locator('text=Combined (Building + Contents)')).toBeVisible();
  });

  test('should calculate different premiums for different property types', async ({ page }) => {
    await page.goto('/customer/policies/new');

    // Fill form for House
    await page.click('[name="propertyType"]');
    await page.click('text=House');
    await page.fill('[name="coverageAmount"]', '500000');
    await page.click('button:has-text("Calculate Quote")');

    // Note house premium
    await page.waitForSelector('text=Monthly Premium');
    const housePremium = await page.locator('text=R').first().textContent();

    // Go back and try Apartment
    await page.click('button:has-text("Modify Quote")');
    await page.click('[name="propertyType"]');
    await page.click('text=Apartment');
    await page.click('button:has-text("Calculate Quote")');

    // Premium should be different (apartments typically lower risk)
    await page.waitForSelector('text=Monthly Premium');
    const aptPremium = await page.locator('text=R').first().textContent();

    // Premiums should differ
    expect(housePremium).not.toBe(aptPremium);
  });
});

