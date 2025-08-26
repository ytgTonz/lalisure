'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PolicyType } from '@prisma/client';
import { Home, Car, Heart, Shield, Building } from 'lucide-react';
import { CreatePolicyInput } from '@/lib/validations/policy';

const policyTypes = [
  {
    type: PolicyType.HOME,
    title: 'Home Insurance',
    description: 'Protect your home and personal belongings',
    icon: Home,
    color: 'bg-blue-500',
  },
  {
    type: PolicyType.AUTO,
    title: 'Auto Insurance',
    description: 'Coverage for your vehicles and driving liability',
    icon: Car,
    color: 'bg-green-500',
  },
  {
    type: PolicyType.LIFE,
    title: 'Life Insurance',
    description: 'Financial protection for your loved ones',
    icon: Heart,
    color: 'bg-red-500',
  },
  {
    type: PolicyType.HEALTH,
    title: 'Health Insurance',
    description: 'Medical coverage and healthcare benefits',
    icon: Shield,
    color: 'bg-purple-500',
  },
  {
    type: PolicyType.BUSINESS,
    title: 'Business Insurance',
    description: 'Protect your business operations and assets',
    icon: Building,
    color: 'bg-orange-500',
  },
];

export function PolicyTypeStep() {
  const { register, watch, setValue } = useFormContext<CreatePolicyInput>();
  const selectedType = watch('type');

  const handleTypeSelect = (type: PolicyType) => {
    setValue('type', type, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Policy Type</h3>
        <p className="text-muted-foreground">
          Choose the type of insurance coverage you need. Each policy type has different coverage options and requirements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policyTypes.map((policy) => {
          const Icon = policy.icon;
          const isSelected = selectedType === policy.type;

          return (
            <Card
              key={policy.type}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent'
              }`}
              onClick={() => handleTypeSelect(policy.type)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-3 rounded-full ${policy.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm">{policy.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {policy.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-full pt-2 border-t">
                      <div className="h-2 w-2 bg-primary rounded-full mx-auto"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">What's Next?</h4>
          <p className="text-sm text-muted-foreground">
            {selectedType === PolicyType.HOME && "You'll need to provide details about your property, including address, construction type, and safety features."}
            {selectedType === PolicyType.AUTO && "You'll need to provide vehicle information including make, model, year, VIN, and driving history."}
            {selectedType === PolicyType.LIFE && "You'll need to provide personal information including health details, occupation, and beneficiary information."}
            {selectedType === PolicyType.HEALTH && "You'll need to provide medical history, current health status, and preferred coverage options."}
            {selectedType === PolicyType.BUSINESS && "You'll need to provide business details including industry type, number of employees, and business assets."}
          </p>
        </div>
      )}

      <input
        type="hidden"
        {...register('type')}
        value={selectedType}
      />
    </div>
  );
}