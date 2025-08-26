'use client';

import { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LocationMapProps {
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    what3words?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  title?: string;
  className?: string;
  showDetails?: boolean;
}

export function LocationMap({ 
  location, 
  title = "Location", 
  className,
  showDetails = true 
}: LocationMapProps) {
  const [mapUrl, setMapUrl] = useState<string>('');
  
  useEffect(() => {
    if (location.coordinates) {
      // Generate Google Maps static map URL
      const { latitude, longitude } = location.coordinates;
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=400x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`;
      
      // For development, use a placeholder or OpenStreetMap-based solution
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
      setMapUrl(osmUrl);
    }
  }, [location.coordinates]);

  const getGoogleMapsUrl = () => {
    if (location.coordinates) {
      return `https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}`;
    }
    if (location.address) {
      const query = encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zipCode}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return null;
  };

  const getWhat3WordsUrl = () => {
    if (location.what3words) {
      return `https://what3words.com/${location.what3words}`;
    }
    return null;
  };

  if (!location.coordinates && !location.address) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>No location information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        {showDetails && location.address && (
          <CardDescription>
            {location.address}, {location.city}, {location.state} {location.zipCode}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Embed */}
        {location.coordinates && mapUrl && (
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3]">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title={`Map showing ${title}`}
              className="absolute inset-0"
            />
          </div>
        )}

        {/* Location Details */}
        {showDetails && (
          <div className="space-y-3">
            {location.coordinates && (
              <div>
                <h4 className="text-sm font-medium mb-1">Coordinates</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
                  </Badge>
                </div>
              </div>
            )}

            {location.what3words && (
              <div>
                <h4 className="text-sm font-medium mb-1">What3Words</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    ///{location.what3words}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {getGoogleMapsUrl() && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={getGoogleMapsUrl()!} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
          )}

          {getWhat3WordsUrl() && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={getWhat3WordsUrl()!} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View What3Words
              </a>
            </Button>
          )}
        </div>

        {/* Fallback for no coordinates */}
        {!location.coordinates && location.address && (
          <div className="text-center p-6 bg-muted rounded-lg">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Interactive map not available without precise coordinates
            </p>
            {getGoogleMapsUrl() && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={getGoogleMapsUrl()!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}