'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateForDisplay } from '@/lib/utils/date-formatter';

interface ReviewStepProps {
  form: UseFormReturn<CreatePolicyInput>;
  calculatedPremium?: number;
}

export function ReviewStep({ form, calculatedPremium }: ReviewStepProps) {
  const formData = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Policy Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Policy Type</p>
              <Badge variant="outline">{formData.type}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Coverage Amount</p>
              <p className="font-semibold" suppressHydrationWarning>
                R{formData.coverage?.dwelling?.toLocaleString() || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deductible</p>
              <p className="font-semibold" suppressHydrationWarning>
                R{formData.deductible?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-semibold" suppressHydrationWarning>
                {formatDateForDisplay(formData.startDate)}
              </p>
            </div>
          </div>
        </div>

        {/* <Separator /> */}

        {/* <div>
          <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold">{formData.riskFactors?.demographics?.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold">
                {formData.riskFactors?.location?.province && formData.riskFactors?.location?.postalCode
                  ? `${formData.riskFactors.location.province}, ${formData.riskFactors.location.postalCode}`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Credit Score</p>
              <p className="font-semibold">{formData.riskFactors?.personal?.creditScore || 'Not specified'}</p>
            </div>
          </div>
        </div> */}

        {formData.type === 'AUTO' && formData.vehicleInfo && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">
                    {formData.vehicleInfo.year} {formData.vehicleInfo.make} {formData.vehicleInfo.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">VIN</p>
                  <p className="font-semibold">{formData.vehicleInfo.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="font-semibold" suppressHydrationWarning>
                    {formData.vehicleInfo.mileage?.toLocaleString()} miles
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Safety Features</p>
                  <p className="font-semibold">{formData.vehicleInfo.safetyFeatures}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {formData.type === 'HOME' && formData.propertyInfo && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Property Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">
                    {formData.propertyInfo.address}
                    {formData.propertyInfo.city && `, ${formData.propertyInfo.city}`}
                    {formData.propertyInfo.province && `, ${formData.propertyInfo.province}`}
                    {formData.propertyInfo.postalCode && ` ${formData.propertyInfo.postalCode}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold">{formData.propertyInfo.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="font-semibold">{formData.propertyInfo.buildYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Square Footage</p>
                  <p className="font-semibold" suppressHydrationWarning>
                    {formData.propertyInfo.squareFeet?.toLocaleString()} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Security Features</p>
                  <p className="font-semibold">{formData.propertyInfo.safetyFeatures?.join(', ')}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {(formData.type === 'LIFE' || formData.type === 'HEALTH') && formData.personalInfo && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">
                    {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold">{formData.personalInfo.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Height/Weight</p>
                  <p className="font-semibold">
                    {formData.personalInfo.height}cm / {formData.personalInfo.weight}kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Smoking Status</p>
                  <p className="font-semibold">{formData.personalInfo.smokingStatus}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Premium Calculation</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Monthly Premium:</span>
              <span className="text-2xl font-bold text-blue-600">
                R{calculatedPremium?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Annual Premium:</span>
              <span className="text-lg font-semibold">
                R{((calculatedPremium || 0) * 12).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}