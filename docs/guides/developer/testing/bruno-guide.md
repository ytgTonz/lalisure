# 🚀 Bruno Quick Reference - OTP Testing

## ✅ Pre-flight Checklist
- [ ] Dev server running at `http://localhost:3000`
- [ ] Real policy number in database
- [ ] Phone number associated with policy
- [ ] Phone can receive SMS

---

## 🎯 Complete Test Flow

### 1️⃣ Verify Policy & Phone
```
POST http://localhost:3000/api/trpc/mobileAuth.verifyPolicy

Body:
{
  "policyNumber": "POL-HOME-12345",
  "phoneNumber": "+27831234567"
}

✅ Expected: 200 OK
Response: { success: true, maskedPhone: "+27XXXXX67", policyholderName: "..." }
```

### 2️⃣ Request OTP Code
```
POST http://localhost:3000/api/trpc/mobileAuth.requestOtp

Body:
{
  "policyNumber": "POL-HOME-12345",
  "phoneNumber": "+27831234567"
}

✅ Expected: 200 OK
Response: { success: true, message: "OTP sent successfully", expiresAt: "..." }
📱 CHECK YOUR PHONE FOR SMS!
```

### 3️⃣ Verify OTP & Get Session Token
```
POST http://localhost:3000/api/trpc/mobileAuth.verifyOtp

Body:
{
  "policyNumber": "POL-HOME-12345",
  "phoneNumber": "+27831234567",
  "otpCode": "123456",  ⬅️ REPLACE WITH CODE FROM SMS
  "deviceInfo": {
    "userAgent": "Bruno API Client",
    "platform": "Windows"
  }
}

✅ Expected: 200 OK
Response: {
  success: true,
  session: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ⬅️ COPY THIS!
    expiresAt: "2025-11-12T11:00:00Z"
  },
  user: { ... }
}

🔑 COPY THE SESSION TOKEN FOR NEXT STEPS!
```

### 4️⃣ Get Session Info
```
GET http://localhost:3000/api/trpc/mobileAuth.getSession?input={"sessionToken":"YOUR_TOKEN_HERE"}

⬅️ Replace YOUR_TOKEN_HERE with token from step 3

✅ Expected: 200 OK
Response: { user: {...}, expiresAt: "...", issuedAt: "..." }
```

### 5️⃣ Refresh Session
```
POST http://localhost:3000/api/trpc/mobileAuth.refreshSession

Body:
{
  "sessionToken": "YOUR_TOKEN_HERE"  ⬅️ Your session token
}

✅ Expected: 200 OK
Response: { success: true, session: { token: "...", expiresAt: "..." } }
```

### 6️⃣ Logout
```
POST http://localhost:3000/api/trpc/mobileAuth.logout

Body:
{
  "sessionToken": "YOUR_TOKEN_HERE"  ⬅️ Your session token
}

✅ Expected: 200 OK
Response: { success: true, message: "Session revoked successfully" }
```

---

## ❌ Error Cases to Test

### Invalid Policy Number
```json
{
  "policyNumber": "POL-INVALID-99999",
  "phoneNumber": "+27831234567"
}
Expected: 404 NOT_FOUND - "Policy not found"
```

### Phone Number Mismatch
```json
{
  "policyNumber": "POL-HOME-12345",
  "phoneNumber": "+27829999999"
}
Expected: 401 UNAUTHORIZED - "Phone number does not match policy"
```

### Invalid OTP Code
```json
{
  "otpCode": "000000"
}
Expected: 400 INVALID_OTP - "Invalid OTP code" + attemptsRemaining
```

### Expired OTP
Wait 6+ minutes after requesting OTP, then verify
Expected: 400 EXPIRED - "OTP has expired"
```

### Rate Limit
Send 4 OTP requests in < 15 minutes
Expected: 429 TOO_MANY_REQUESTS - "Too many OTP requests"
```

---

## 🔧 Bruno Tips

### Use Environment Variables
Instead of hardcoding, use:
```
{{BASE_URL}}/api/trpc/mobileAuth.verifyPolicy
{{POLICY_NUMBER}}
{{PHONE_NUMBER}}
{{SESSION_TOKEN}}
```

### Set Environment Variables:
1. Click dropdown (top-right) → "Local"
2. Click gear icon → Edit environment
3. Add variables

### View Response:
- Response body appears in right panel
- Status code shown at top
- Use JSON formatter for pretty print

### Keyboard Shortcuts:
- `Ctrl + Enter` - Send request
- `Ctrl + S` - Save request
- `Ctrl + N` - New request
- `Ctrl + /` - Search

---

## 📊 Monitoring Tips

### Watch Dev Server Logs
```bash
# In terminal where dev server is running
# You'll see:
POST /api/trpc/mobileAuth.verifyPolicy 200 in 50ms
POST /api/trpc/mobileAuth.requestOtp 200 in 120ms
```

### Check for Errors
Look for these in server logs:
- ❌ tRPC failed on mobileAuth.*
- ✅ POST /api/trpc/mobileAuth.* 200

### Database Check
```bash
# After successful OTP verification:
# Check User record has:
# - otpCode: null (cleared)
# - mobileSessionToken: "..."
# - mobileSessionExpiry: future date
# - lastLoginAt: recent timestamp
```

---

## 🐛 Troubleshooting

### "Policy not found"
→ Policy doesn't exist or wrong policy number

### "Phone number does not match"
→ Phone in request doesn't match policy owner's phone

### "OTP not found or expired"
→ OTP expired (> 5 min) or never requested

### "Too many OTP requests"
→ Sent > 3 OTP requests in 15 minutes, wait or reset DB

### "Invalid session token"
→ Token expired or revoked

### "SMS not sending"
→ Check Twilio credentials in `.env`

---

## 📱 Test Data Template

```javascript
// Replace these with YOUR actual data:
POLICY_NUMBER: "POL-HOME-12345"  // From your database
PHONE_NUMBER: "+27831234567"      // Phone of policy owner
OTP_CODE: "123456"                // From SMS (changes each time)
SESSION_TOKEN: "eyJhbGci..."      // From verify OTP response
```

---

## 🎉 Success Indicators

✅ Step 1: Returns masked phone number
✅ Step 2: SMS received with 6-digit code
✅ Step 3: Returns session token
✅ Step 4-6: All work with session token

---

**Happy Testing! 🚀**
