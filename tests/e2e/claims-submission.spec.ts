import { test, expect } from '@playwright/test';

test.describe('Claims Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

      // Mock user's active policies
      if (url.includes('policy.getAll') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                items: [
                  {
                    id: 'policy_123',
                    policyNumber: 'POL-HOME-001',
                    type: 'HOME',
                    status: 'ACTIVE',
                    coverageAmount: 500000,
                    premium: 850,
                    propertyAddress: '123 Main Street, Johannesburg'
                  },
                  {
                    id: 'policy_456',
                    policyNumber: 'POL-HOME-002',
                    type: 'CONTENTS',
                    status: 'ACTIVE',
                    coverageAmount: 200000,
                    premium: 350,
                    propertyAddress: '123 Main Street, Johannesburg'
                  }
                ],
                total: 2,
                hasMore: false
              }
            }
          })
        });
      }

      // Mock claim submission
      else if (url.includes('claim.create') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                id: 'claim_new123',
                claimNumber: 'CLM-001-2025',
                policyId: 'policy_123',
                type: 'THEFT',
                status: 'SUBMITTED',
                amount: 50000,
                description: 'Items stolen from property',
                dateOfLoss: new Date().toISOString(),
                createdAt: new Date().toISOString()
              }
            }
          })
        });
      }

      // Mock claim status check
      else if (url.includes('claim.getById') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                id: 'claim_new123',
                claimNumber: 'CLM-001-2025',
                status: 'SUBMITTED',
                type: 'THEFT',
                amount: 50000,
                description: 'Items stolen from property',
                policy: {
                  policyNumber: 'POL-HOME-001',
                  type: 'HOME'
                }
              }
            }
          })
        });
      }

      // Mock user's claims
      else if (url.includes('claim.getAll') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                items: [
                  {
                    id: 'claim_existing1',
                    claimNumber: 'CLM-002-2025',
                    status: 'UNDER_REVIEW',
                    type: 'FIRE',
                    amount: 100000,
                    dateOfLoss: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    policy: {
                      policyNumber: 'POL-HOME-001'
                    }
                  }
                ],
                total: 1,
                hasMore: false
              }
            }
          })
        });
      }

      else {
        await route.continue();
      }
    });

    // Mock file upload
    await page.route('**/api/uploadthing*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            url: 'https://utfs.io/f/test-file-123.jpg',
            key: 'test-file-123.jpg'
          }
        })
      });
    });
  });

  test('should display new claim page correctly', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Check page title
    await expect(page.locator('h1')).toContainText('Submit New Claim');

    // Check form fields present
    await expect(page.locator('label:has-text("Select Policy")')).toBeVisible();
    await expect(page.locator('label:has-text("Claim Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Date of Loss")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();
    await expect(page.locator('label:has-text("Claimed Amount")')).toBeVisible();
  });

  test('should show user active policies in dropdown', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Click policy dropdown
    await page.click('[name="policyId"]');

    // Verify policies appear
    await expect(page.locator('text=POL-HOME-001 - Home Building')).toBeVisible();
    await expect(page.locator('text=POL-HOME-002 - Contents')).toBeVisible();
  });

  test('should complete claim submission form', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Select policy
    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-001');

    // Select claim type
    await page.click('[name="type"]');
    await page.click('text=Theft');

    // Enter date of loss
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateString = yesterday.toISOString().split('T')[0];
    await page.fill('[name="dateOfLoss"]', dateString);

    // Enter description
    await page.fill('[name="description"]', 'Electronics and jewelry stolen during break-in. Window was broken to gain entry.');

    // Enter claimed amount
    await page.fill('[name="amount"]', '50000');

    // Verify form filled
    await expect(page.getByDisplayValue('50000')).toBeVisible();
  });

  test('should add location information', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Fill basic info
    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-001');

    // Click add location
    await page.click('text=Add Location Details');

    // Fill location
    await page.fill('[name="location.address"]', '123 Main Street, Johannesburg, Gauteng');

    // Fill what3words (optional)
    await page.fill('[name="location.what3words"]', '///filled.count.soap');

    // Verify location fields visible
    await expect(page.getByDisplayValue('123 Main Street, Johannesburg, Gauteng')).toBeVisible();
    await expect(page.getByDisplayValue('///filled.count.soap')).toBeVisible();
  });

  test('should add police report information', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Select theft (requires police report)
    await page.click('[name="type"]');
    await page.click('text=Theft');

    // Police report section should appear
    await expect(page.locator('text=Police Report Details')).toBeVisible();

    // Fill police report
    await page.fill('[name="policeReportNumber"]', 'CAS123/10/2025');
    await page.fill('[name="policeStation"]', 'Johannesburg Central');
    await page.fill('[name="investigatingOfficer"]', 'Sergeant Smith');

    // Verify police report fields
    await expect(page.getByDisplayValue('CAS123/10/2025')).toBeVisible();
  });

  test('should add witness information', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Click add witness
    await page.click('text=Add Witness');

    // Fill witness details
    await page.fill('[name="witnesses[0].name"]', 'Jane Smith');
    await page.fill('[name="witnesses[0].phone"]', '+27821234567');
    await page.fill('[name="witnesses[0].email"]', 'jane.smith@example.com');

    // Verify witness added
    await expect(page.getByDisplayValue('Jane Smith')).toBeVisible();

    // Can add another witness
    await page.click('text=Add Another Witness');
    await expect(page.locator('[name="witnesses[1].name"]')).toBeVisible();
  });

  test('should upload supporting documents', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Find file upload section
    await page.click('text=Upload Supporting Documents');

    // Mock file input (Playwright can't interact with file input directly in some cases)
    const fileInput = await page.locator('input[type="file"]');
    
    // Verify upload section visible
    await expect(page.locator('text=Drag and drop files here, or click to browse')).toBeVisible();
    await expect(page.locator('text=Accepted formats: JPG, PNG, PDF')).toBeVisible();
    await expect(page.locator('text=Maximum 10MB per file')).toBeVisible();
  });

  test('should submit claim successfully', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Fill complete form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-001');

    await page.click('[name="type"]');
    await page.click('text=Theft');

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await page.fill('[name="dateOfLoss"]', yesterday.toISOString().split('T')[0]);

    await page.fill('[name="description"]', 'Electronics stolen during break-in');
    await page.fill('[name="amount"]', '50000');

    await page.fill('[name="policeReportNumber"]', 'CAS123/10/2025');

    // Agree to terms
    await page.check('text=I declare that the information provided is true and accurate');

    // Submit claim
    await page.click('button:has-text("Submit Claim")');

    // Wait for success page
    await page.waitForSelector('text=Claim Submitted Successfully');

    // Verify success message
    await expect(page.locator('text=CLM-001-2025')).toBeVisible();
    await expect(page.locator('text=Your claim has been submitted')).toBeVisible();
    await expect(page.locator('text=We will review your claim')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Try to submit without filling fields
    await page.click('button:has-text("Submit Claim")');

    // Wait for validation errors
    await page.waitForTimeout(500);

    // Verify error messages
    await expect(page.locator('text=Please select a policy')).toBeVisible();
    await expect(page.locator('text=Please select claim type')).toBeVisible();
    await expect(page.locator('text=Date of loss is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
    await expect(page.locator('text=Claimed amount is required')).toBeVisible();
  });

  test('should validate claim amount within coverage', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Select policy with R500,000 coverage
    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-001');

    // Try to claim more than coverage
    await page.fill('[name="amount"]', '600000');
    await page.click('button:has-text("Submit Claim")');

    // Should show error
    await expect(page.locator('text=Claim amount exceeds policy coverage')).toBeVisible();
    await expect(page.locator('text=Maximum: R500,000')).toBeVisible();
  });

  test('should validate date of loss', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Wait for form
    await page.waitForSelector('h1:has-text("Submit New Claim")');

    // Try future date
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await page.fill('[name="dateOfLoss"]', tomorrow.toISOString().split('T')[0]);
    await page.click('button:has-text("Submit Claim")');

    // Should show error
    await expect(page.locator('text=Date of loss cannot be in the future')).toBeVisible();

    // Try date before policy start
    const longAgo = new Date(2020, 0, 1);
    await page.fill('[name="dateOfLoss"]', longAgo.toISOString().split('T')[0]);
    await page.click('button:has-text("Submit Claim")');

    // Should show error
    await expect(page.locator('text=Date must be after policy start date')).toBeVisible();
  });

  test('should view existing claims', async ({ page }) => {
    await page.goto('/customer/claims');

    // Wait for claims list
    await page.waitForSelector('h1:has-text("My Claims")');

    // Verify claim appears
    await expect(page.locator('text=CLM-002-2025')).toBeVisible();
    await expect(page.locator('text=Fire Damage')).toBeVisible();
    await expect(page.locator('text=Under Review')).toBeVisible();
    await expect(page.locator('text=R100,000')).toBeVisible();
  });

  test('should filter claims by status', async ({ page }) => {
    await page.goto('/customer/claims');

    // Wait for page
    await page.waitForSelector('h1:has-text("My Claims")');

    // Click filter dropdown
    await page.click('text=Filter by Status');

    // Select filter
    await page.click('text=Under Review');

    // Verify URL updated
    await expect(page).toHaveURL(/status=UNDER_REVIEW/);

    // Only under review claims should show
    await expect(page.locator('text=Under Review')).toBeVisible();
  });

  test('should view claim details', async ({ page }) => {
    await page.goto('/customer/claims/claim_existing1');

    // Wait for claim details
    await page.waitForSelector('h1:has-text("Claim Details")');

    // Verify claim information
    await expect(page.locator('text=CLM-002-2025')).toBeVisible();
    await expect(page.locator('text=Status: Under Review')).toBeVisible();
    await expect(page.locator('text=Claim Type: Fire Damage')).toBeVisible();
    await expect(page.locator('text=Claimed Amount: R100,000')).toBeVisible();
  });

  test('should show claim status timeline', async ({ page }) => {
    await page.goto('/customer/claims/claim_existing1');

    // Wait for claim details
    await page.waitForSelector('h1:has-text("Claim Details")');

    // Verify timeline
    await expect(page.locator('text=Status Timeline')).toBeVisible();
    await expect(page.locator('text=Submitted')).toBeVisible();
    await expect(page.locator('text=Under Review')).toBeVisible();

    // Future statuses grayed out
    await expect(page.locator('text=Approved').first()).toBeVisible();
    await expect(page.locator('text=Settled').first()).toBeVisible();
  });

  test('should allow adding notes to claim', async ({ page }) => {
    await page.goto('/customer/claims/claim_existing1');

    // Wait for claim details
    await page.waitForSelector('h1:has-text("Claim Details")');

    // Click add note
    await page.click('text=Add Note');

    // Fill note
    await page.fill('[name="note"]', 'Additional photos attached via email');

    // Submit note
    await page.click('button:has-text("Add Note")');

    // Verify note added
    await page.waitForSelector('text=Note added successfully');
    await expect(page.locator('text=Additional photos attached via email')).toBeVisible();
  });

  test('should show claim types based on policy type', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // Select home building policy
    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-001 - Home Building');

    // Click claim type dropdown
    await page.click('[name="type"]');

    // Building-related claims should be available
    await expect(page.locator('text=Fire')).toBeVisible();
    await expect(page.locator('text=Water Damage')).toBeVisible();
    await expect(page.locator('text=Storm Damage')).toBeVisible();
    await expect(page.locator('text=Structural Damage')).toBeVisible();

    // Select contents policy
    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-002 - Contents');

    // Click claim type dropdown
    await page.click('[name="type"]');

    // Contents-related claims should be available
    await expect(page.locator('text=Theft')).toBeVisible();
    await expect(page.locator('text=Burglary')).toBeVisible();
  });

  test('should calculate estimated processing time', async ({ page }) => {
    await page.goto('/customer/claims/new');

    // After selecting claim type
    await page.click('[name="policyId"]');
    await page.click('text=POL-HOME-001');

    await page.click('[name="type"]');
    await page.click('text=Theft');

    // Should show estimated time
    await expect(page.locator('text=Estimated Processing Time')).toBeVisible();
    await expect(page.locator('text=3-5 business days')).toBeVisible();

    // Complex claims show longer time
    await page.click('[name="type"]');
    await page.click('text=Fire');

    await expect(page.locator('text=5-10 business days')).toBeVisible();
  });
});

