'use client';

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { what3words } from '@/lib/services/what3words';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  value?: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    what3words?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  onChange: (location: any) => void;
  className?: string;
  required?: boolean;
}

export function LocationInput({ value = {
  address: '',
  city: '',
  province: '',
  postalCode: ''
}, onChange, className, required = false }: LocationInputProps) {
  const [what3wordsInput, setWhat3wordsInput] = useState(value.what3words || '');
  const [what3wordsValidation, setWhat3wordsValidation] = useState<{
    isValid?: boolean;
    isValidating?: boolean;
    error?: string;
  }>({});
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Debounced What3Words validation
  useEffect(() => {
    if (!what3wordsInput.trim()) {
      setWhat3wordsValidation({});
      return;
    }

    const timer = setTimeout(async () => {
      setWhat3wordsValidation({ isValidating: true });
      
      try {
        const result = await what3words.validateWords(what3wordsInput);
        setWhat3wordsValidation({
          isValid: result.isValid,
          error: result.error,
        });

        if (result.isValid && result.coordinates) {
          onChange({
            ...value,
            what3words: result.words,
            coordinates: {
              latitude: result.coordinates.lat,
              longitude: result.coordinates.lng,
            },
          });
        }
      } catch (error) {
        setWhat3wordsValidation({
          isValid: false,
          error: 'Validation failed',
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [what3wordsInput]);

  const handleLocationChange = (field: string, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setUseCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Convert coordinates to What3Words
          const result = await what3words.coordinatesToWords(latitude, longitude);
          
          if (result.isValid && result.words) {
            setWhat3wordsInput(result.words);
            setWhat3wordsValidation({ isValid: true });
            onChange({
              ...value,
              what3words: result.words,
              coordinates: { latitude, longitude },
            });
          }
        } catch (error) {
          console.error('Error converting location:', error);
        } finally {
          setUseCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setUseCurrentLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getValidationIcon = () => {
    if (what3wordsValidation.isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (what3wordsValidation.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-insurance-green" />;
    }
    if (what3wordsValidation.isValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Standard Address Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Street Address {required && <span className="text-red-500">*</span>}</Label>
          <Input
            id="address"
            value={value.address}
            onChange={(e) => handleLocationChange('address', e.target.value)}
            placeholder="123 Main Street"
            required={required}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="city">City {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id="city"
              value={value.city}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder="New York"
              required={required}
            />
          </div>

          <div>
            <Label htmlFor="province">Province {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id="province"
              value={value.province}
              onChange={(e) => handleLocationChange('province', e.target.value)}
              placeholder="Western Cape"
              required={required}
            />
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code {required && <span className="text-red-500">*</span>}</Label>
            <Input
              id="postalCode"
              value={value.postalCode}
              onChange={(e) => handleLocationChange('postalCode', e.target.value)}
              placeholder="8001"
              maxLength={4}
              required={required}
            />
          </div>
        </div>
      </div>

      {/* What3Words Section */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="what3words" className="text-sm font-medium">
                What3Words Address (Optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={useCurrentLocation}
                className="h-7 px-2 text-xs"
              >
                {useCurrentLocation ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <MapPin className="h-3 w-3 mr-1" />
                )}
                Use Current Location
              </Button>
            </div>

            <div className="relative">
              <Input
                id="what3words"
                value={what3wordsInput}
                onChange={(e) => setWhat3wordsInput(e.target.value)}
                placeholder="index.banana.purple"
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {getValidationIcon()}
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs">
              <div className="flex-1 text-muted-foreground">
                What3Words provides a precise location using just three words.
                <a 
                  href="https://what3words.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-insurance-blue hover:underline ml-1"
                >
                  Learn more →
                </a>
              </div>
            </div>

            {/* Validation Feedback */}
            {what3wordsValidation.isValid === true && (
              <div className="flex items-center gap-2 p-2 bg-insurance-green/10 rounded-md">
                <CheckCircle className="h-4 w-4 text-insurance-green" />
                <span className="text-sm text-insurance-green font-medium">
                  Valid What3Words address
                </span>
                {value.coordinates && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {value.coordinates.latitude.toFixed(6)}, {value.coordinates.longitude.toFixed(6)}
                  </Badge>
                )}
              </div>
            )}

            {what3wordsValidation.isValid === false && what3wordsValidation.error && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">
                  {what3wordsValidation.error}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}