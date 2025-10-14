# Validation Errors Implementation Guide

## 🎯 Overview

This guide explains how validation errors are implemented and displayed to users in the Lalisure insurance application. The system provides real-time validation feedback with clear error messages, visual indicators, and comprehensive error summaries.

## 🚀 Features

### **Real-Time Validation**

- **Instant Feedback**: Errors appear as users type or change values
- **Visual Indicators**: Red borders and error icons for invalid fields
- **Clear Messages**: Specific error messages explaining what's wrong
- **Error Summary**: Comprehensive list of all validation errors

### **User Experience**

- **Non-Intrusive**: Errors don't block user interaction
- **Helpful**: Clear guidance on how to fix errors
- **Accessible**: Screen reader compatible error messages
- **Consistent**: Uniform error styling across all forms

## 📦 Implementation

### **1. Form Configuration**

The form uses React Hook Form with Zod validation and real-time validation:

```typescript
const form = useForm<CreatePolicyInput>({
  resolver: zodResolver(createPolicySchema),
  mode: "onChange", // Real-time validation
  defaultValues: {
    // ... default values
  },
});
```

### **2. Validation Schema**

Validation rules are defined in the Zod schema:

```typescript
export const coverageOptionsSchema = z.object({
  dwelling: z
    .number()
    .min(50000, "Minimum dwelling coverage is R50,000")
    .max(5000000, "Maximum dwelling coverage is R5,000,000")
    .optional(),
  personalProperty: z
    .number()
    .min(10000, "Minimum personal property coverage is R10,000")
    .max(1000000, "Maximum personal property coverage is R1,000,000")
    .optional(),
  liability: z
    .number()
    .min(100000, "Minimum liability coverage is R100,000")
    .max(2000000, "Maximum liability coverage is R2,000,000")
    .optional(),
  medicalPayments: z
    .number()
    .min(1000, "Minimum medical payments coverage is R1,000")
    .max(50000, "Maximum medical payments coverage is R50,000")
    .optional(),
});
```

### **3. Error Display Components**

#### **Helper Functions**

```typescript
// Helper function to get error message
const getErrorMessage = (fieldPath: string) => {
  const error = errors.coverage?.[fieldPath as keyof typeof errors.coverage];
  return error?.message;
};

// Helper function to check if field has error
const hasError = (fieldPath: string) => {
  return !!errors.coverage?.[fieldPath as keyof typeof errors.coverage];
};
```

#### **Field-Level Error Display**

```typescript
<div>
  <div className="flex items-center gap-2 mb-2">
    <Label htmlFor="dwelling">Dwelling Coverage</Label>
    <InsuranceHelpButtons.DwellingCoverage />
  </div>
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
      R
    </span>
    <Input
      id="dwelling"
      type="number"
      placeholder="300000"
      className={`pl-8 ${
        hasError("dwelling")
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : ""
      }`}
      {...register("coverage.dwelling", {
        valueAsNumber: true,
        required: "Dwelling coverage is required",
        min: { value: 50000, message: "Minimum dwelling coverage is R50,000" },
        max: {
          value: 5000000,
          message: "Maximum dwelling coverage is R5,000,000",
        },
      })}
    />
  </div>
  {hasError("dwelling") ? (
    <div className="flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 text-red-500" />
      <p className="text-xs text-red-500">{getErrorMessage("dwelling")}</p>
    </div>
  ) : (
    <p className="text-xs text-muted-foreground mt-1">
      Coverage for your home structure (R50,000 - R5,000,000)
    </p>
  )}
</div>
```

#### **Error Summary Section**

```typescript
{
  /* Error Summary */
}
{
  hasValidationErrors && (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Please fix the following errors:
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {errors.coverage?.dwelling && (
            <p className="text-xs text-red-700">
              • Dwelling Coverage: {errors.coverage.dwelling.message}
            </p>
          )}
          {errors.coverage?.personalProperty && (
            <p className="text-xs text-red-700">
              • Personal Property: {errors.coverage.personalProperty.message}
            </p>
          )}
          {errors.coverage?.liability && (
            <p className="text-xs text-red-700">
              • Liability Coverage: {errors.coverage.liability.message}
            </p>
          )}
          {errors.coverage?.medicalPayments && (
            <p className="text-xs text-red-700">
              • Medical Payments: {errors.coverage.medicalPayments.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Visual Design

### **Error States**

#### **Input Field Styling**

- **Normal State**: Default border color
- **Error State**: Red border (`border-red-500`)
- **Focus State**: Red focus ring (`focus:border-red-500 focus:ring-red-500`)

#### **Error Message Styling**

- **Icon**: Red alert circle (`AlertCircle` with `text-red-500`)
- **Text**: Red text (`text-red-500`)
- **Size**: Small text (`text-xs`)

#### **Error Summary Styling**

- **Background**: Light red (`bg-red-50`)
- **Border**: Red border (`border-red-200`)
- **Title**: Dark red text (`text-red-800`)
- **Messages**: Medium red text (`text-red-700`)

### **Color Palette**

```css
/* Error Colors */
--error-border: #ef4444; /* border-red-500 */
--error-text: #ef4444; /* text-red-500 */
--error-bg: #fef2f2; /* bg-red-50 */
--error-border-light: #fecaca; /* border-red-200 */
--error-text-dark: #991b1b; /* text-red-800 */
--error-text-medium: #b91c1c; /* text-red-700 */
```

## 📱 Responsive Design

### **Mobile**

- Error messages stack below input fields
- Error summary appears above form fields
- Touch-friendly error indicators

### **Desktop**

- Error messages appear inline with fields
- Error summary positioned prominently
- Hover states for better interaction

### **Tablet**

- Optimized spacing for touch interaction
- Responsive error message layout
- Appropriate sizing for medium screens

## ♿ Accessibility Features

### **Screen Reader Support**

- Error messages are properly associated with form fields
- ARIA attributes for error states
- Descriptive error messages

### **Keyboard Navigation**

- Error states are visible during keyboard navigation
- Focus management for error correction
- Tab order includes error messages

### **Visual Indicators**

- High contrast error colors
- Clear visual distinction between error and normal states
- Consistent error iconography

## 🔧 Validation Rules

### **Coverage Amounts**

#### **Dwelling Coverage**

- **Required**: Yes
- **Minimum**: R50,000
- **Maximum**: R5,000,000
- **Error Messages**:
  - Required: "Dwelling coverage is required"
  - Too Low: "Minimum dwelling coverage is R50,000"
  - Too High: "Maximum dwelling coverage is R5,000,000"

#### **Personal Property**

- **Required**: No
- **Minimum**: R10,000
- **Maximum**: R1,000,000
- **Error Messages**:
  - Too Low: "Minimum personal property coverage is R10,000"
  - Too High: "Maximum personal property coverage is R1,000,000"

#### **Liability Coverage**

- **Required**: No
- **Minimum**: R100,000
- **Maximum**: R2,000,000
- **Error Messages**:
  - Too Low: "Minimum liability coverage is R100,000"
  - Too High: "Maximum liability coverage is R2,000,000"

#### **Medical Payments**

- **Required**: No
- **Minimum**: R1,000
- **Maximum**: R50,000
- **Error Messages**:
  - Too Low: "Minimum medical payments coverage is R1,000"
  - Too High: "Maximum medical payments coverage is R50,000"

### **Deductible**

- **Required**: Yes
- **Options**: R250, R500, R1,000, R2,500, R5,000
- **Error Messages**:
  - Required: "Please select a deductible amount"

## 🧪 Testing

### **Demo Page**

Visit `/demo/validation-errors` to see validation errors in action and test their functionality.

### **Test Scenarios**

#### **1. Invalid Input Values**

- Enter values below minimum thresholds
- Enter values above maximum thresholds
- Leave required fields empty

#### **2. Real-Time Validation**

- Type invalid values and see immediate feedback
- Correct values and see errors disappear
- Test with different input methods (typing, pasting, etc.)

#### **3. Error Summary**

- Trigger multiple validation errors
- Verify error summary shows all errors
- Check that errors disappear when fixed

#### **4. Accessibility**

- Test with screen reader
- Verify keyboard navigation
- Check color contrast ratios

## 🎯 Best Practices

### **1. Error Message Guidelines**

- **Clear and Specific**: Explain exactly what's wrong
- **Actionable**: Tell users how to fix the error
- **Consistent**: Use the same language and format
- **Concise**: Keep messages brief but informative

### **2. Visual Design**

- **High Contrast**: Ensure error colors are clearly visible
- **Consistent Styling**: Use the same error styling across all forms
- **Non-Intrusive**: Don't block user interaction with errors
- **Progressive Disclosure**: Show errors when relevant

### **3. User Experience**

- **Real-Time Feedback**: Validate as users type
- **Error Recovery**: Make it easy to fix errors
- **Contextual Help**: Provide guidance on valid values
- **Error Prevention**: Use input constraints where possible

### **4. Technical Implementation**

- **Performance**: Validate efficiently without blocking UI
- **Type Safety**: Use TypeScript for error handling
- **Reusability**: Create reusable error display components
- **Maintainability**: Centralize validation logic

## 🔄 Integration Examples

### **Form Field with Validation**

```typescript
<div>
  <div className="flex items-center gap-2 mb-2">
    <Label htmlFor="field">Field Label</Label>
    <HelpButton />
  </div>
  <Input
    id="field"
    className={`${hasError("field") ? "border-red-500" : ""}`}
    {...register("field", {
      required: "Field is required",
      min: { value: 0, message: "Value must be positive" },
    })}
  />
  {hasError("field") ? (
    <div className="flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 text-red-500" />
      <p className="text-xs text-red-500">{getErrorMessage("field")}</p>
    </div>
  ) : (
    <p className="text-xs text-muted-foreground mt-1">Field description</p>
  )}
</div>
```

### **Error Summary Component**

```typescript
const ErrorSummary = ({ errors }: { errors: any }) => {
  const hasErrors = Object.keys(errors).length > 0;

  if (!hasErrors) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Please fix the following errors:
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {Object.entries(errors).map(([field, error]: [string, any]) => (
            <p key={field} className="text-xs text-red-700">
              • {field}: {error.message}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 🚀 Future Enhancements

### **Planned Features**

- **Field-Level Validation**: Validate individual fields as users leave them
- **Cross-Field Validation**: Validate relationships between fields
- **Custom Validation Rules**: Allow dynamic validation rules
- **Error Analytics**: Track which validation errors occur most frequently

### **Advanced Features**

- **Smart Suggestions**: Suggest valid values based on user input
- **Progressive Validation**: Show errors only after user interaction
- **Error Grouping**: Group related validation errors
- **Validation Hints**: Show hints before errors occur

## 📚 Related Documentation

- [Form Validation Guide](./FORM_VALIDATION.md)
- [Help Buttons Guide](./HELP_BUTTONS_GUIDE.md)
- [UI Components Guide](./UI_COMPONENTS.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)

## 🆘 Support

For questions or issues with validation errors:

1. **Check the Demo Page**: `/demo/validation-errors`
2. **Review Validation Rules**: See the validation schema in `/src/lib/validations/policy.ts`
3. **Test Error Display**: Use the demo controls to trigger errors
4. **Check Console**: Look for any JavaScript errors

## 🎉 Conclusion

The validation error system provides users with clear, immediate feedback when they enter invalid values. The implementation includes:

- **Real-time validation** with instant feedback
- **Visual error indicators** with red borders and icons
- **Clear error messages** explaining what's wrong
- **Comprehensive error summary** showing all validation issues
- **Accessible design** that works with assistive technologies
- **Responsive layout** that works on all devices

The system is designed to be user-friendly while maintaining data integrity and providing a smooth form completion experience.
