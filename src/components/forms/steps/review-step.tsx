'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
              <Badge variant="outline">{formData.policyType}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Coverage Amount</p>
              <p className="font-semibold">${formData.coverageAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deductible</p>
              <p className="font-semibold">${formData.deductible?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Term</p>
              <p className="font-semibold">{formData.termLength} months</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold">{formData.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold">{formData.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Previous Claims</p>
              <p className="font-semibold">{formData.previousClaims}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Credit Score Range</p>
              <p className="font-semibold">{formData.creditScore}</p>
            </div>
          </div>
        </div>

        {formData.policyType === 'AUTO' && formData.vehicleInfo && (
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
                  <p className="font-semibold">{formData.vehicleInfo.mileage?.toLocaleString()} miles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Safety Features</p>
                  <p className="font-semibold">{formData.vehicleInfo.safetyFeatures}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {formData.policyType === 'HOME' && formData.propertyInfo && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Property Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{formData.propertyInfo.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold">{formData.propertyInfo.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="font-semibold">{formData.propertyInfo.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Square Footage</p>
                  <p className="font-semibold">{formData.propertyInfo.squareFootage?.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Security Features</p>
                  <p className="font-semibold">{formData.propertyInfo.securityFeatures}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {(formData.policyType === 'LIFE' || formData.policyType === 'HEALTH') && formData.personalInfo && (
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
                ${calculatedPremium?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Annual Premium:</span>
              <span className="text-lg font-semibold">
                ${((calculatedPremium || 0) * 12).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}