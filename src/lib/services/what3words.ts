// What3Words API integration service
// Note: This is a mock implementation as we don't have API keys
// In production, you would use the actual What3Words API

export interface What3WordsLocation {
  words: string;
  map: string;
  language: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  country: string;
  square: {
    southwest: { lat: number; lng: number };
    northeast: { lat: number; lng: number };
  };
}

export interface What3WordsValidationResult {
  isValid: boolean;
  words?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  error?: string;
}

export class What3WordsService {
  private static instance: What3WordsService;
  private apiKey: string;
  private baseUrl = 'https://api.what3words.com/v3';

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_WHAT3WORDS_API_KEY || 'mock-api-key';
  }

  public static getInstance(): What3WordsService {
    if (!What3WordsService.instance) {
      What3WordsService.instance = new What3WordsService();
    }
    return What3WordsService.instance;
  }

  /**
   * Validate a What3Words address
   */
  async validateWords(words: string): Promise<What3WordsValidationResult> {
    try {
      // Clean up the input
      const cleanWords = words.replace(/^\/+/, '').replace(/\/+$/, '');
      
      // Basic format validation
      const wordPattern = /^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/;
      if (!wordPattern.test(cleanWords)) {
        return {
          isValid: false,
          error: 'Invalid format. Use format: word.word.word'
        };
      }

      // Mock validation for development
      if (this.apiKey === 'mock-api-key') {
        return this.mockValidateWords(cleanWords);
      }

      // Real API call
      const response = await fetch(
        `${this.baseUrl}/words?words=${encodeURIComponent(cleanWords)}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          isValid: false,
          error: data.error.message
        };
      }

      return {
        isValid: true,
        words: data.words,
        coordinates: {
          lat: data.coordinates.lat,
          lng: data.coordinates.lng
        }
      };

    } catch (error) {
      console.error('What3Words validation error:', error);
      return {
        isValid: false,
        error: 'Unable to validate What3Words address'
      };
    }
  }

  /**
   * Convert coordinates to What3Words
   */
  async coordinatesToWords(lat: number, lng: number): Promise<What3WordsValidationResult> {
    try {
      // Mock conversion for development
      if (this.apiKey === 'mock-api-key') {
        return this.mockCoordinatesToWords(lat, lng);
      }

      const response = await fetch(
        `${this.baseUrl}/convert-to-3wa?coordinates=${lat},${lng}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return {
          isValid: false,
          error: data.error.message
        };
      }

      return {
        isValid: true,
        words: data.words,
        coordinates: { lat, lng }
      };

    } catch (error) {
      console.error('Coordinates to What3Words error:', error);
      return {
        isValid: false,
        error: 'Unable to convert coordinates to What3Words'
      };
    }
  }

  /**
   * Get location details from What3Words
   */
  async getLocationDetails(words: string): Promise<What3WordsLocation | null> {
    try {
      const validation = await this.validateWords(words);
      
      if (!validation.isValid || !validation.coordinates) {
        return null;
      }

      // Mock location details for development
      if (this.apiKey === 'mock-api-key') {
        return this.mockLocationDetails(words, validation.coordinates);
      }

      // Real API would provide more detailed location information
      const response = await fetch(
        `${this.baseUrl}/words?words=${encodeURIComponent(words)}&key=${this.apiKey}`
      );

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Get location details error:', error);
      return null;
    }
  }

  /**
   * Mock validation for development
   */
  private mockValidateWords(words: string): What3WordsValidationResult {
    // Simulate some invalid cases
    const invalidWords = ['invalid.invalid.invalid', 'test.test.test', 'fake.fake.fake'];
    
    if (invalidWords.includes(words)) {
      return {
        isValid: false,
        error: 'What3Words address not found'
      };
    }

    // Generate mock coordinates based on words
    const hash = this.stringHash(words);
    const lat = 40.7128 + (hash % 1000) / 10000; // Around NYC
    const lng = -74.0060 + (hash % 1000) / 10000;

    return {
      isValid: true,
      words: words,
      coordinates: { lat, lng }
    };
  }

  /**
   * Mock coordinate conversion
   */
  private mockCoordinatesToWords(lat: number, lng: number): What3WordsValidationResult {
    // Generate mock words based on coordinates
    const words = this.generateMockWords(lat, lng);
    
    return {
      isValid: true,
      words: words,
      coordinates: { lat, lng }
    };
  }

  /**
   * Mock location details
   */
  private mockLocationDetails(words: string, coordinates: { lat: number; lng: number }): What3WordsLocation {
    return {
      words: words,
      map: `https://w3w.co/${words}`,
      language: 'en',
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      country: 'US',
      square: {
        southwest: {
          lat: coordinates.lat - 0.00001,
          lng: coordinates.lng - 0.00001
        },
        northeast: {
          lat: coordinates.lat + 0.00001,
          lng: coordinates.lng + 0.00001
        }
      }
    };
  }

  /**
   * Generate mock What3Words from coordinates
   */
  private generateMockWords(lat: number, lng: number): string {
    const words1 = ['index', 'home', 'raft', 'spoon', 'eagle', 'table', 'chair', 'house'];
    const words2 = ['banana', 'tiger', 'ocean', 'mountain', 'forest', 'river', 'cloud', 'stone'];
    const words3 = ['purple', 'golden', 'silver', 'bright', 'fresh', 'clean', 'sharp', 'smooth'];

    const hash1 = Math.floor(Math.abs(lat * 100000)) % words1.length;
    const hash2 = Math.floor(Math.abs(lng * 100000)) % words2.length;
    const hash3 = Math.floor(Math.abs((lat + lng) * 50000)) % words3.length;

    return `${words1[hash1]}.${words2[hash2]}.${words3[hash3]}`;
  }

  /**
   * Simple string hash function
   */
  private stringHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Format What3Words address for display
   */
  static formatWords(words: string): string {
    if (!words) return '';
    const cleaned = words.replace(/^\/+/, '').replace(/\/+$/, '');
    return `///${cleaned}`;
  }

  /**
   * Extract words from formatted address
   */
  static extractWords(formattedWords: string): string {
    return formattedWords.replace(/^\/+/, '').replace(/\/+$/, '');
  }
}

// Export singleton instance
export const what3words = What3WordsService.getInstance();