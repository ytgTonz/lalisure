# Lalisure V2 - OTP Authentication API Test Collection

## 🚀 Quick Start

### 1. Open Collection in Bruno
```bash
# Launch Bruno
bruno

# Then: File → Open Collection → Select the "bruno-collection" folder
```

### 2. Configure Environment
- Select "Local" environment from the dropdown (top-right)
- Update environment variables if needed:
  - `BASE_URL`: http://localhost:3000
  - `POLICY_NUMBER`: Your test policy number
  - `PHONE_NUMBER`: Your test phone number

### 3. Run the OTP Flow

#### Step-by-Step Testing:
1. **Verify Policy & Phone** → Should return masked phone
2. **Request OTP Code** → Check your phone for SMS
3. **Verify OTP & Create Session** → Copy the session token from response
4. **Get Session Info** → Replace `YOUR_SESSION_TOKEN_HERE` with actual token
5. **Refresh Session** → Test session renewal
6. **Logout** → Test session revocation

---

## 📁 Collection Structure

```
bruno-collection/
├── bruno.json                    # Collection metadata
├── environments/
│   └── Local.bru                 # Local environment variables
├── Mobile-Auth-OTP-Flow/         # Main authentication flow (6 requests)
│   ├── 1-Verify-Policy-and-Phone.bru
│   ├── 2-Request-OTP-Code.bru
│   ├── 3-Verify-OTP-and-Create-Session.bru
│   ├── 4-Get-Session-Info.bru
│   ├── 5-Refresh-Session.bru
│   └── 6-Logout.bru
└── Error-Cases/                  # Error handling tests
    ├── Invalid-Policy-Number.bru
    └── Invalid-OTP-Code.bru
```

---

## 🧪 Testing Tips

### Before Testing:
1. ✅ Dev server running: `npm run dev`
2. ✅ Database migrated: `npm run db:generate && npm run db:push`
3. ✅ Environment variables set in `.env`
4. ✅ Real policy and phone number in database

### During Testing:
- **Copy session tokens**: After step 3, copy the token for subsequent requests
- **Check SMS**: OTP codes are sent via Twilio SMS
- **Monitor console**: Watch dev server logs for errors
- **Rate limits**: Max 3 OTP requests per 15 minutes
- **OTP expiry**: Codes expire after 5 minutes

### Testing Error Cases:
- Test with invalid policy numbers
- Test with wrong phone numbers
- Test with incorrect OTP codes
- Test rate limiting by sending multiple requests quickly

---

## 🔧 Bruno Features Used

- **Environments**: Switch between Local/Production
- **Variables**: Use `{{POLICY_NUMBER}}` in requests
- **Secret Variables**: Store session tokens securely
- **Documentation**: Each request has inline docs
- **Sequencing**: Requests numbered for logical flow

---

## 📚 Related Documentation

- **Full Documentation**: `docs/V2_OTP_AUTHENTICATION_IMPLEMENTATION.md`
- **Quick Start Guide**: `QUICK_START_OTP.md`
- **Implementation Summary**: `OTP_IMPLEMENTATION_SUMMARY.md`

---

## ⚙️ Environment Variables

### Local Environment
```
BASE_URL=http://localhost:3000
POLICY_NUMBER=POL-HOME-12345
PHONE_NUMBER=+27831234567
SESSION_TOKEN=(set after successful login)
```

### Production Environment
```
BASE_URL=https://lalisure.onrender.com
POLICY_NUMBER=POL-HOME-XXXXX
PHONE_NUMBER=+27XXXXXXXXX
SESSION_TOKEN=(set after successful login)
```

---

## 🎯 Expected Responses

### Verify Policy (Success)
```json
{
  "success": true,
  "maskedPhone": "+27XXXXX67",
  "policyholderName": "John Doe"
}
```

### Request OTP (Success)
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "maskedPhone": "+27XXXXX67",
  "expiresAt": "2025-10-13T12:05:00Z"
}
```

### Verify OTP (Success)
```json
{
  "success": true,
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-11-12T11:00:00Z"
  },
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

---

**Created**: October 13, 2025
**Version**: 1.0.0
**Format**: Bruno Collection (.bru)
