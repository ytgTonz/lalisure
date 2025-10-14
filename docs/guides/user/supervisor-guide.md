---
title: Supervisor Guide
description: Guide for Lalisure supervisors approving policies and claims
status: active
last_updated: 2025-10-14
---

# Supervisor Guide

> **For supervisors** reviewing and approving policies and claims

---

## 👨‍💼 Your Role as a Supervisor

As a Lalisure supervisor, you:
- **Approve or reject policies** created by agents
- **Review and approve claims** submitted by customers
- **Monitor agent performance**
- **Ensure quality control**
- **Handle escalations**

**You have higher privileges than agents** but work as a team to serve customers.

---

## 🚀 Getting Started

### First Login

1. Check email for invitation link
2. Set your password
3. Login at: `https://lalisure.com/staff/login`
4. Complete supervisor profile

### Supervisor Dashboard

Your dashboard shows:
- **Pending Policies**: Awaiting your approval (count)
- **Pending Claims**: Awaiting your review (count)
- **Team Performance**: Agent statistics
- **Alerts**: Urgent items requiring attention
- **Recent Activity**: Latest approvals/rejections

---

## ✅ Approving Policies

### Policy Review Queue

1. Go to "Pending Policies"
2. See list sorted by:
   - Submission date (oldest first)
   - Agent name
   - Coverage amount
   - Priority

### Reviewing a Policy

Click any policy to see:

#### Customer Information
```
Name: John Doe
ID: 8501015800084 ✓ Valid
Phone: +27831234567 ✓ Valid format
Email: john@example.com
```

#### Coverage Details
```
Tier: R50,000
Monthly Premium: R250
Property Type: House - Brick
Location: index.home.raft (What3Words)
```

#### Property Location Map
- See What3Words location on map
- Verify it's on land (not water!)
- Check it's in South Africa
- Look at satellite view

#### Agent Notes
```
"Customer has burglar bars and security door installed.
Property in good condition. Photos attached."
```

#### Photos (if uploaded)
- Front of property
- Inside views
- Security features

### Approval Checklist

Before approving, verify:

**✅ Customer Information**
- [ ] Valid SA ID number
- [ ] Phone number format correct (+27XXXXXXXXX)
- [ ] No duplicate policies for same person

**✅ Location**
- [ ] What3Words address is valid
- [ ] Location is on land (not water)
- [ ] Location is in South Africa
- [ ] Reasonable distance from major roads/towns

**✅ Property Details**
- [ ] Property type selected
- [ ] Construction type specified
- [ ] Reasonable for coverage tier
- [ ] Photos provided (if available)

**✅ Coverage**
- [ ] Tier selection appropriate
- [ ] Premium calculated correctly (automatic)
- [ ] No obvious fraud indicators

### Making a Decision

#### To Approve

1. Review all information
2. Click "Approve Policy"
3. Add approval note (optional):
   ```
   "All information verified. Property location confirmed.
   Approved for R50,000 coverage."
   ```
4. Click "Confirm Approval"

**What Happens**:
- Customer receives SMS with policy number
- Customer receives payment link (Paystack)
- Policy status: PENDING_PAYMENT
- Agent receives approval notification
- Agent gets credit for policy

#### To Reject

1. Select rejection reason:
   - ☐ Invalid customer information
   - ☐ Invalid location (What3Words)
   - ☐ Incomplete property details
   - ☐ Suspected fraud
   - ☐ Duplicate policy
   - ☐ Other (specify)

2. Add detailed explanation:
   ```
   "What3Words location shows property in ocean.
   Please reverify location at property and resubmit."
   ```

3. Click "Reject Policy"

**What Happens**:
- Agent receives rejection notification with reason
- Agent can fix issues and resubmit
- Customer does NOT receive notification (policy not created)

### Bulk Actions

For multiple policies:
1. Select policies (checkbox)
2. Choose bulk action:
   - Approve all selected
   - Reject all selected
   - Assign to another supervisor

**Use bulk approve only** when you've verified all individually!

---

## 🆘 Reviewing Claims

### Claims Review Queue

1. Go to "Pending Claims"
2. See claims sorted by:
   - Submission date
   - Claim amount
   - Policy coverage
   - Priority (high-value claims first)

### Reviewing a Claim

Click any claim to see:

#### Claim Information
```
Claim Type: Fire Damage
Date of Incident: Oct 10, 2025
Estimated Amount: R15,000
Policy Coverage: R50,000
Remaining Coverage: R50,000 (no previous claims)
```

#### Customer & Policy Details
```
Customer: John Doe
Policy: POL-HOME-12345 (ACTIVE ✓)
Premium Paid: Up to date ✓
Policy Start: Jan 1, 2025
```

#### Incident Description
```
"Kitchen fire started from stove.
Cabinets burned, wall damage, smoke throughout house.
Fire department responded.
Police report filed."
```

#### Supporting Documents
- Photos of damage (6 photos)
- Police report (if applicable)
- Fire department report (if applicable)
- Repair quotations (if available)

#### Agent Notes
```
"Visited customer on Oct 11. Damage appears legitimate.
Customer needs kitchen rebuilt. Approx R15,000 repair cost."
```

### Claims Review Checklist

**✅ Policy Status**
- [ ] Policy is ACTIVE
- [ ] Premiums up to date
- [ ] Coverage sufficient for claim
- [ ] Incident date during policy period

**✅ Claim Validity**
- [ ] Damage type covered by policy
- [ ] Photos show real damage
- [ ] Story is consistent
- [ ] Amount reasonable for damage
- [ ] No fraud indicators

**✅ Documentation**
- [ ] Clear photos provided (minimum 3)
- [ ] Police report (if required for claim type)
- [ ] Repair quotations (if available)
- [ ] Incident description complete

### Claim Decision Options

#### Option 1: Approve Fully
```
Requested Amount: R15,000
Approved Amount: R15,000
Decision: Approve full amount
```

#### Option 2: Approve Partially
```
Requested Amount: R15,000
Approved Amount: R12,000
Reason: "Ceiling repair not covered (pre-existing).
Kitchen repair approved."
```

#### Option 3: Request Assessment
```
Decision: Send assessor to property
Reason: "Damage extent unclear from photos.
Need in-person assessment before approval."
```

#### Option 4: Request More Information
```
Decision: More info needed
Required: "Need repair quotation from contractor.
Current estimate too vague."
```

#### Option 5: Reject Claim
```
Reason: Damage not covered
Explanation: "Water damage from neglected maintenance.
Policy excludes damage from lack of upkeep."
```

### After Approval

1. **Payment Processed** (automatic)
   - Finance team processes payment
   - Money sent to customer's bank account
   - Or paid directly to repair company (if arranged)

2. **Customer Notified**
   - SMS with approval notification
   - Payment timeline (2-3 days)
   - Claim status updated in app

3. **Records Updated**
   - Policy remaining coverage reduced
   - Claim history updated
   - Agent notified of decision

---

## 📊 Agent Performance Monitoring

### Team Overview

View all agents under your supervision:

```
Agent Name    | Policies Created | Approval Rate | Active Customers
--------------|------------------|---------------|------------------
John Smith    | 15 this month    | 85%           | 45
Mary Johnson  | 12 this month    | 92%           | 38
Peter Brown   | 8 this month     | 75%           | 28
```

### Individual Agent Review

Click any agent to see:
- **Recent policies**: Last 10 policies submitted
- **Rejection reasons**: Why policies were rejected
- **Customer feedback**: Ratings and comments
- **Training needs**: Areas for improvement

### Quality Feedback

Provide feedback to agents:
1. Review their rejected policies
2. Identify patterns:
   - Common mistakes
   - Areas needing training
   - Good practices to encourage
3. Schedule feedback session
4. Document training provided

---

## 🚨 Handling Escalations

### When to Escalate

Escalate to Admin if:
- Claim amount > R100,000
- Suspected fraud
- Policy coverage dispute
- Agent misconduct
- System/technical issues
- Legal matters

### Customer Complaints

Handle customer complaints:
1. Listen to customer concern
2. Review relevant policies/claims
3. Make fair decision
4. Document resolution
5. Follow up with customer

---

## 💡 Supervisor Best Practices

### For Policy Approval

**Do**:
- ✅ Review each policy thoroughly
- ✅ Verify What3Words locations
- ✅ Provide clear rejection reasons
- ✅ Approve within 24 hours when possible
- ✅ Give agents constructive feedback

**Don't**:
- ❌ Approve without checking location
- ❌ Reject without clear explanation
- ❌ Let policies sit for days
- ❌ Bulk approve without individual review

### For Claims Review

**Do**:
- ✅ Be fair and consistent
- ✅ Request assessor when needed
- ✅ Communicate decisions clearly
- ✅ Process claims within 48 hours
- ✅ Document your reasoning

**Don't**:
- ❌ Deny claims without investigation
- ❌ Approve suspicious claims
- ❌ Delay processing legitimate claims
- ❌ Ignore fraud indicators

### For Team Management

**Do**:
- ✅ Provide regular feedback
- ✅ Celebrate agent successes
- ✅ Offer training opportunities
- ✅ Be available for questions
- ✅ Lead by example

**Don't**:
- ❌ Only provide negative feedback
- ❌ Ignore struggling agents
- ❌ Be unavailable when needed
- ❌ Show favoritism

---

## 🎯 Performance Metrics

Your performance is measured by:

**Approval Speed**:
- Target: 90% of policies approved within 24 hours
- Target: 90% of claims processed within 48 hours

**Quality**:
- Target: <5% of approved policies result in claims issues
- Target: <2% of approved claims result in disputes

**Team Performance**:
- Target: Agent approval rate > 80%
- Target: Customer satisfaction > 4.0/5.0

---

## 🔧 Common Scenarios

### Scenario 1: Agent Submits Duplicate Policy

**Problem**: Same customer, same property, second policy submitted

**Action**:
1. Reject new policy
2. Reason: "Duplicate policy for same property"
3. Contact agent: Explain customer already has coverage
4. Check if customer wants to upgrade existing policy instead

### Scenario 2: What3Words Location Invalid

**Problem**: Location shows in ocean/outside SA

**Action**:
1. Reject policy
2. Reason: "Invalid What3Words location"
3. Note: "Please reverify location at property"
4. Suggest agent use What3Words app on-site

### Scenario 3: Claim Photos Unclear

**Problem**: Can't determine damage extent from photos

**Action**:
1. Select "Request More Information"
2. Specify: "Need clearer photos showing full extent of damage"
3. Or: Send assessor to property
4. Wait for additional information before deciding

### Scenario 4: High-Value Claim

**Problem**: Claim for R95,000 on R100,000 policy

**Action**:
1. Mandatory assessor visit for claims > R50,000
2. Request detailed repair quotations
3. Verify damage legitimacy thoroughly
4. Escalate to Admin for final approval
5. Document decision process carefully

---

## 📞 Support & Resources

### For Policy Questions
- Policy Guidelines Document
- What3Words Validation Guide
- Fraud Indicators Checklist

### For Claims Questions
- Claims Processing Manual
- Coverage Guidelines
- Assessor Contact List

### Technical Support
- IT Helpdesk: help@lalisure.com
- Phone: Ext 101
- Available: 8am-6pm weekdays

---

## 🎓 Continuing Education

### Mandatory Training
- Fraud Detection (Quarterly)
- Policy Guidelines Updates (Monthly)
- Compliance Training (Annual)

### Optional Training
- Advanced Claims Assessment
- Team Leadership
- Customer Service Excellence

---

**Your role is crucial to Lalisure's success**. You ensure quality, protect against fraud, and help agents serve customers better.

**Thank you for your commitment to excellence!**

---

**Version**: 2.0
**Last Updated**: October 14, 2025
**Role**: Supervisor
