# Help Buttons Implementation Guide

## 🎯 Overview

This guide explains how to implement and use interactive help buttons for insurance terms in the Lalisure application. The help buttons provide users with quick tooltips and detailed explanations to help them understand complex insurance terminology.

## 🚀 Features

### **Dual-Level Help System**

- **Quick Tooltips**: Hover for brief explanations
- **Detailed Dialogs**: Click for comprehensive information with examples and tips

### **Accessibility**

- Keyboard navigation support
- Screen reader compatible
- ARIA labels and descriptions
- Focus management

### **Mobile-Friendly**

- Touch-friendly interactions
- Responsive design
- Optimized for mobile devices

## 📦 Components

### **1. Tooltip Component (`src/components/ui/tooltip.tsx`)**

```typescript
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
```

### **2. Help Button Component (`src/components/ui/help-button.tsx`)**

```typescript
import { HelpButton, InsuranceHelpButtons } from "@/components/ui/help-button";
```

## 🔧 Implementation

### **Basic Usage**

#### **1. Import the Components**

```typescript
import { InsuranceHelpButtons } from "@/components/ui/help-button";
```

#### **2. Add Help Button to Form Field**

```typescript
<div className="flex items-center gap-2 mb-2">
  <Label htmlFor="dwelling">Dwelling Coverage</Label>
  <InsuranceHelpButtons.DwellingCoverage />
</div>
```

#### **3. Custom Help Button**

```typescript
<HelpButton
  term="Custom Term"
  shortExplanation="Brief explanation for tooltip"
  detailedExplanation="Comprehensive explanation for dialog"
  examples={["Example 1", "Example 2"]}
  tips={["Tip 1", "Tip 2"]}
  icon={<CustomIcon className="h-4 w-4" />}
/>
```

### **Predefined Help Buttons**

The `InsuranceHelpButtons` object provides ready-to-use help buttons for common insurance terms:

#### **Available Help Buttons:**

- `DwellingCoverage` - Home structure coverage
- `PersonalProperty` - Belongings and furniture coverage
- `LiabilityCoverage` - Lawsuit and claims protection
- `MedicalPayments` - Medical expenses coverage
- `Deductible` - Out-of-pocket amount explanation
- `AdditionalLivingExpenses` - Temporary housing coverage

#### **Usage Example:**

```typescript
// In your form component
<div className="flex items-center gap-2 mb-2">
  <Label htmlFor="liability">Liability Coverage</Label>
  <InsuranceHelpButtons.LiabilityCoverage />
</div>
```

## 🎨 Customization

### **Custom Help Button with Different Icon**

```typescript
<HelpButton
  term="Security Features"
  shortExplanation="Protection measures for your property"
  detailedExplanation="Security features include alarms, cameras, and other protective measures that can reduce your insurance premium."
  examples={["Monitored alarm system", "Security cameras", "Electric fencing"]}
  tips={[
    "Security features can reduce premiums by up to 15%",
    "Keep documentation of all security installations",
    "Regular maintenance ensures continued coverage",
  ]}
  icon={<Shield className="h-4 w-4" />}
  variant="outline"
  size="sm"
/>
```

### **Custom Styling**

```typescript
<HelpButton
  term="Custom Term"
  shortExplanation="Brief explanation"
  detailedExplanation="Detailed explanation"
  className="text-blue-600 hover:text-blue-800"
  variant="outline"
  size="lg"
/>
```

## 📱 Responsive Design

The help buttons are designed to work seamlessly across all device sizes:

### **Desktop**

- Hover for tooltip
- Click for detailed dialog
- Keyboard navigation support

### **Mobile**

- Tap for tooltip
- Tap again for detailed dialog
- Touch-friendly sizing

### **Tablet**

- Touch interactions
- Optimized spacing
- Responsive dialogs

## ♿ Accessibility Features

### **Keyboard Navigation**

- Tab to focus on help button
- Enter or Space to activate
- Escape to close dialog

### **Screen Reader Support**

- ARIA labels for all interactive elements
- Descriptive text for help content
- Proper heading structure in dialogs

### **Focus Management**

- Focus returns to trigger after dialog closes
- Focus trapped within open dialog
- Visible focus indicators

## 🎯 Best Practices

### **1. Content Guidelines**

- **Short Explanation**: 1-2 sentences maximum
- **Detailed Explanation**: 2-3 paragraphs with clear structure
- **Examples**: 2-3 real-world scenarios
- **Tips**: 2-4 actionable recommendations

### **2. Placement**

- Place help button next to the field label
- Use consistent spacing (gap-2)
- Align with the label baseline

### **3. Icons**

- Use appropriate icons for the content type
- Keep icons consistent in size (h-4 w-4)
- Use Lucide React icons for consistency

### **4. Content Structure**

```typescript
const helpContent = {
  term: "Clear, descriptive term",
  shortExplanation: "Brief, clear explanation",
  detailedExplanation: "Comprehensive explanation with context",
  examples: [
    "Real-world scenario 1",
    "Real-world scenario 2",
    "Real-world scenario 3",
  ],
  tips: ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
};
```

## 🔄 Integration Examples

### **Form Field Integration**

```typescript
// In your form component
<div className="space-y-4">
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Label htmlFor="dwelling">Dwelling Coverage</Label>
      <InsuranceHelpButtons.DwellingCoverage />
    </div>
    <Input
      id="dwelling"
      type="number"
      placeholder="300000"
      {...register("coverage.dwelling")}
    />
    <p className="text-xs text-muted-foreground mt-1">
      Coverage for your home structure
    </p>
  </div>
</div>
```

### **Card Header Integration**

```typescript
<CardHeader>
  <CardTitle className="flex items-center gap-2">
    <Home className="h-5 w-5" />
    Home Insurance Coverage
    <InsuranceHelpButtons.DwellingCoverage />
  </CardTitle>
</CardHeader>
```

### **Table Header Integration**

```typescript
<th className="flex items-center gap-2">
  Premium Amount
  <InsuranceHelpButtons.Deductible />
</th>
```

## 🧪 Testing

### **Demo Page**

Visit `/demo/help-buttons` to see all help buttons in action and test their functionality.

### **Test Cases**

1. **Tooltip Display**: Hover over help button to see tooltip
2. **Dialog Opening**: Click help button to open detailed dialog
3. **Dialog Closing**: Click outside or press Escape to close
4. **Keyboard Navigation**: Tab to focus, Enter to activate
5. **Mobile Interaction**: Tap to see tooltip, tap again for dialog

## 🚀 Future Enhancements

### **Planned Features**

- **Video Explanations**: Embed video content in dialogs
- **Interactive Calculators**: Built-in premium calculators
- **Multi-language Support**: Localized help content
- **Analytics**: Track which help content is most viewed
- **Custom Themes**: Different visual styles for different contexts

### **Extension Points**

- **Custom Content Types**: Support for different content formats
- **External Links**: Link to external resources
- **Progressive Disclosure**: Show more details based on user level
- **Contextual Help**: Show relevant help based on form state

## 📚 Related Documentation

- [UI Components Guide](./UI_COMPONENTS.md)
- [Form Validation Guide](./FORM_VALIDATION.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)
- [Mobile Development Guide](./MOBILE_DEVELOPMENT.md)

## 🆘 Support

For questions or issues with help buttons:

1. **Check the Demo Page**: `/demo/help-buttons`
2. **Review Examples**: See implementation examples above
3. **Test Accessibility**: Use keyboard navigation and screen readers
4. **Check Console**: Look for any JavaScript errors

## 🎉 Conclusion

The help button system provides a user-friendly way to explain complex insurance terms without cluttering the interface. The dual-level approach (tooltip + dialog) ensures users can get quick help or detailed information as needed.

The system is designed to be:

- **Easy to implement** - Just import and use
- **Highly customizable** - Modify content, icons, and styling
- **Accessible** - Works with assistive technologies
- **Mobile-friendly** - Optimized for all devices
- **Extensible** - Easy to add new help content

Start with the predefined help buttons and customize as needed for your specific use cases!
