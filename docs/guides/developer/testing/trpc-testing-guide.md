# ✅ tRPC Request Format - FIXED!

## 🔧 What Was Wrong

The initial Bruno collection had an incorrect request body format for tRPC endpoints.

**Incorrect Format (was causing 400 errors)**:
```json
{
  "policyNumber": "POL-HOME-12345",
  "phoneNumber": "+27831234567"
}
```

**Correct tRPC Format (now fixed)**:
```json
{
  "json": {
    "policyNumber": "POL-HOME-12345",
    "phoneNumber": "+27831234567"
  }
}
```

---

## 🎯 Why This Format?

tRPC's HTTP adapter expects the input to be wrapped in a `"json"` key when using POST requests. This tells tRPC to parse the body as JSON input for the mutation.

### tRPC Input Wrapping:
- **Mutations (POST)**: Require `{"json": { ...your data... }}`
- **Queries (GET)**: Use URL query params with `?input={"json":{...}}`

---

## ✅ All Files Have Been Fixed

The following Bruno request files have been updated with the correct format:

### Main Flow:
- ✅ `1-Verify-Policy-and-Phone.bru`
- ✅ `2-Request-OTP-Code.bru`
- ✅ `3-Verify-OTP-and-Create-Session.bru`
- ✅ `5-Refresh-Session.bru`
- ✅ `6-Logout.bru`

### Error Cases:
- ✅ `Invalid-Policy-Number.bru`
- ✅ `Invalid-OTP-Code.bru`

---

## 🚀 Ready to Test

**Bruno should reload the collection automatically** if it's still open. If not:
1. Close Bruno
2. Reopen: `bruno` (from terminal)
3. File → Open Collection → Select `bruno-collection` folder

**Now try sending a request again!**

The requests should now return proper responses instead of validation errors.

---

## 📋 Quick Test

**Try this first request**:
1. Open Bruno
2. Navigate to: `Mobile-Auth-OTP-Flow` → `1. Verify Policy & Phone`
3. Update the body with your real policy number and phone
4. Click "Send" (or `Ctrl+Enter`)

**Expected Result**:
- ✅ 200 OK status
- ✅ Response with masked phone number
- ✅ No more "invalid_type" or "undefined" errors

---

`✶ Insight ─────────────────────────────────────`
**Why tRPC Uses This Format**: tRPC supports multiple input serialization methods (JSON, FormData, etc.). The `"json"` wrapper tells tRPC which serialization method to use. This design allows tRPC to handle complex data types like Dates, Files, and binary data more reliably than standard REST APIs.

**Alternative: Using tRPC Client**: In production frontend code, you'd use `@trpc/client` which handles this wrapping automatically:
```typescript
// With tRPC client (automatic wrapping)
trpc.mobileAuth.verifyPolicy.mutate({
  policyNumber: "POL-HOME-12345",
  phoneNumber: "+27831234567"
});

// Bruno/HTTP request (manual wrapping required)
POST /api/trpc/mobileAuth.verifyPolicy
{ "json": { "policyNumber": "...", "phoneNumber": "..." } }
```
`─────────────────────────────────────────────────`

---

**Updated**: October 13, 2025
**Issue**: tRPC validation error - "invalid_type, expected object, received undefined"
**Solution**: Wrap request body in `{"json": {...}}` format
**Status**: ✅ Fixed - Ready for testing
