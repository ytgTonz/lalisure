'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreatePolicyInput } from '@/lib/validations/policy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SOUTH_AFRICAN_PROVINCES, RURAL_PROPERTY_TYPES, RURAL_CONSTRUCTION_TYPES, RURAL_ROOF_TYPES, RURAL_SAFETY_FEATURES, RURAL_HEATING_TYPES, ACCESS_ROAD_TYPES } from '@/lib/data/south-africa';

interface PropertyInfoStepProps {
  form: UseFormReturn<CreatePolicyInput>;
}

export function PropertyInfoStep({ form }: PropertyInfoStepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const policyType = watch('type');

  if (policyType !== 'HOME') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          This information is collected for documentation purposes only and does not affect your premium.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="propertyInfo.address">Property Address</Label>
          <Input
            id="propertyInfo.address"
            placeholder="e.g., 123 Main Street, Suburb"
            {...register('propertyInfo.address')}
          />
          {errors.propertyInfo?.address && (
            <p className="text-sm text-red-500">{errors.propertyInfo.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="propertyInfo.city">City</Label>
            <Input
              id="propertyInfo.city"
              placeholder="e.g., Cape Town"
              {...register('propertyInfo.city')}
            />
            {errors.propertyInfo?.city && (
              <p className="text-sm text-red-500">{errors.propertyInfo.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="propertyInfo.province">Province</Label>
            <Select onValueChange={(value) => setValue('propertyInfo.province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {SOUTH_AFRICAN_PROVINCES.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyInfo?.province && (
              <p className="text-sm text-red-500">{errors.propertyInfo.province.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="propertyInfo.postalCode">Postal Code</Label>
            <Input
              id="propertyInfo.postalCode"
              {...register('propertyInfo.postalCode')}
            />
            {errors.propertyInfo?.postalCode && (
              <p className="text-sm text-red-500">{errors.propertyInfo.postalCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="propertyInfo.propertyType">Property Type</Label>
          <Select onValueChange={(value) => setValue('propertyInfo.propertyType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SINGLE_FAMILY">Single Family Home</SelectItem>
              <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
              <SelectItem value="CONDO">Condominium</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="FARMHOUSE">Farmhouse</SelectItem>
              <SelectItem value="RURAL_HOMESTEAD">Rural Homestead</SelectItem>
              <SelectItem value="COUNTRY_ESTATE">Country Estate</SelectItem>
              <SelectItem value="SMALLHOLDING">Smallholding</SelectItem>
              <SelectItem value="GAME_FARM_HOUSE">Game Farm House</SelectItem>
              <SelectItem value="VINEYARD_HOUSE">Vineyard House</SelectItem>
              <SelectItem value="MOUNTAIN_CABIN">Mountain Cabin</SelectItem>
              <SelectItem value="COASTAL_COTTAGE">Coastal Cottage</SelectItem>
            </SelectContent>
          </Select>
          {errors.propertyInfo?.propertyType && (
            <p className="text-sm text-red-500">{errors.propertyInfo.propertyType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.buildYear">Year Built</Label>
          <Input
            id="propertyInfo.buildYear"
            type="number"
            placeholder="e.g., 2015"
            {...register('propertyInfo.buildYear', { valueAsNumber: true })}
          />
          {errors.propertyInfo?.buildYear && (
            <p className="text-sm text-red-500">{errors.propertyInfo.buildYear.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyInfo.squareFeet">Floor Area (m²)</Label>
          <Input
            id="propertyInfo.squareFeet"
            type="number"
            placeholder="e.g., 150"
            {...register('propertyInfo.squareFeet', { valueAsNumber: true })}
          />
          {errors.propertyInfo?.squareFeet && (
            <p className="text-sm text-red-500">{errors.propertyInfo.squareFeet.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyInfo.constructionType">Construction Type</Label>
            <Select onValueChange={(value) => setValue('propertyInfo.constructionType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select construction type" />
              </SelectTrigger>
              <SelectContent>
                {RURAL_CONSTRUCTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="propertyInfo.roofType">Roof Type</Label>
            <Select onValueChange={(value) => setValue('propertyInfo.roofType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select roof type" />
              </SelectTrigger>
              <SelectContent>
                {RURAL_ROOF_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyInfo.heatingType">Heating Type</Label>
            <Select onValueChange={(value) => setValue('propertyInfo.heatingType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select heating type" />
              </SelectTrigger>
              <SelectContent>
                {RURAL_HEATING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="propertyInfo.accessRoad">Access Road</Label>
            <Select onValueChange={(value) => setValue('propertyInfo.accessRoad', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select access road type" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ROAD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Safety Features</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {RURAL_SAFETY_FEATURES.map((feature) => (
              <div key={feature.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`safety-${feature.value}`}
                  onCheckedChange={(checked) => {
                    const currentFeatures = watch('propertyInfo.safetyFeatures') || [];
                    if (checked) {
                      setValue('propertyInfo.safetyFeatures', [...currentFeatures, feature.value]);
                    } else {
                      setValue('propertyInfo.safetyFeatures', currentFeatures.filter(f => f !== feature.value));
                    }
                  }}
                />
                <Label htmlFor={`safety-${feature.value}`} className="text-sm">
                  {feature.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.propertyInfo?.safetyFeatures && (
            <p className="text-sm text-red-500">{errors.propertyInfo.safetyFeatures.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasPool"
              onCheckedChange={(checked) => setValue('propertyInfo.hasPool', !!checked)}
            />
            <Label htmlFor="hasPool">Has Swimming Pool</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasGarage"
              onCheckedChange={(checked) => setValue('propertyInfo.hasGarage', !!checked)}
            />
            <Label htmlFor="hasGarage">Has Garage</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasFarmBuildings"
              onCheckedChange={(checked) => setValue('propertyInfo.hasFarmBuildings', !!checked)}
            />
            <Label htmlFor="hasFarmBuildings">Has Farm Buildings</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasLivestock"
              onCheckedChange={(checked) => setValue('propertyInfo.hasLivestock', !!checked)}
            />
            <Label htmlFor="hasLivestock">Has Livestock</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="propertyInfo.propertySize">Property Size (Hectares)</Label>
          <Input
            id="propertyInfo.propertySize"
            type="number"
            placeholder="e.g., 2.5"
            {...register('propertyInfo.propertySize', { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave blank if property is less than 1 hectare
          </p>
        </div>
      </CardContent>
    </Card>
  );
}