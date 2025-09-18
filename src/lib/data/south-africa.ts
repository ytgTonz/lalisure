// South African provinces and related data for auto-completion

export interface Province {
  code: string;
  name: string;
  fullName: string;
  population: number;
  area: number; // in km²
  crimeRate: 'low' | 'medium' | 'high';
  naturalDisasterRisk: 'low' | 'medium' | 'high';
  ruralPercentage: number; // percentage of rural areas
}

export const SOUTH_AFRICAN_PROVINCES: Province[] = [
  {
    code: 'WC',
    name: 'Western Cape',
    fullName: 'Western Cape Province',
    population: 7.1,
    area: 129462,
    crimeRate: 'medium',
    naturalDisasterRisk: 'low',
    ruralPercentage: 35
  },
  {
    code: 'EC',
    name: 'Eastern Cape',
    fullName: 'Eastern Cape Province',
    population: 6.7,
    area: 168966,
    crimeRate: 'high',
    naturalDisasterRisk: 'medium',
    ruralPercentage: 65
  },
  {
    code: 'NC',
    name: 'Northern Cape',
    fullName: 'Northern Cape Province',
    population: 1.3,
    area: 372889,
    crimeRate: 'low',
    naturalDisasterRisk: 'low',
    ruralPercentage: 85
  },
  {
    code: 'FS',
    name: 'Free State',
    fullName: 'Free State Province',
    population: 2.9,
    area: 129825,
    crimeRate: 'medium',
    naturalDisasterRisk: 'low',
    ruralPercentage: 60
  },
  {
    code: 'KZN',
    name: 'KwaZulu-Natal',
    fullName: 'KwaZulu-Natal Province',
    population: 11.5,
    area: 94361,
    crimeRate: 'high',
    naturalDisasterRisk: 'high',
    ruralPercentage: 55
  },
  {
    code: 'NW',
    name: 'North West',
    fullName: 'North West Province',
    population: 4.1,
    area: 104882,
    crimeRate: 'medium',
    naturalDisasterRisk: 'low',
    ruralPercentage: 70
  },
  {
    code: 'GP',
    name: 'Gauteng',
    fullName: 'Gauteng Province',
    population: 15.8,
    area: 18178,
    crimeRate: 'high',
    naturalDisasterRisk: 'low',
    ruralPercentage: 15
  },
  {
    code: 'MP',
    name: 'Mpumalanga',
    fullName: 'Mpumalanga Province',
    population: 4.7,
    area: 76495,
    crimeRate: 'medium',
    naturalDisasterRisk: 'medium',
    ruralPercentage: 65
  },
  {
    code: 'LP',
    name: 'Limpopo',
    fullName: 'Limpopo Province',
    population: 5.9,
    area: 125754,
    crimeRate: 'medium',
    naturalDisasterRisk: 'medium',
    ruralPercentage: 75
  }
];

// Property types specific to rural South Africa
export const RURAL_PROPERTY_TYPES = [
  { value: 'FARMHOUSE', label: 'Farmhouse', description: 'Traditional farm dwelling' },
  { value: 'RURAL_HOMESTEAD', label: 'Rural Homestead', description: 'Family home in rural area' },
  { value: 'COUNTRY_ESTATE', label: 'Country Estate', description: 'Large rural property with multiple buildings' },
  { value: 'SMALLHOLDING', label: 'Smallholding', description: 'Small agricultural property' },
  { value: 'GAME_FARM_HOUSE', label: 'Game Farm House', description: 'Dwelling on game farm' },
  { value: 'VINEYARD_HOUSE', label: 'Vineyard House', description: 'Home on wine farm' },
  { value: 'MOUNTAIN_CABIN', label: 'Mountain Cabin', description: 'Remote mountain dwelling' },
  { value: 'COASTAL_COTTAGE', label: 'Coastal Cottage', description: 'Beach or coastal property' }
];

// Construction types common in rural South Africa
export const RURAL_CONSTRUCTION_TYPES = [
  { value: 'BRICK', label: 'Brick', description: 'Traditional brick construction' },
  { value: 'STONE', label: 'Stone', description: 'Natural stone construction' },
  { value: 'CONCRETE', label: 'Concrete', description: 'Concrete block construction' },
  { value: 'STEEL_FRAME', label: 'Steel Frame', description: 'Modern steel frame construction' },
  { value: 'WOOD_FRAME', label: 'Wood Frame', description: 'Timber frame construction' },
  { value: 'MIXED_CONSTRUCTION', label: 'Mixed Construction', description: 'Combination of materials' },
  { value: 'TRADITIONAL_MUD', label: 'Traditional Mud', description: 'Traditional mud brick construction' },
  { value: 'THATCH_ROOF', label: 'Thatch Roof', description: 'Traditional thatch roofing' }
];

// Roof types for rural properties
export const RURAL_ROOF_TYPES = [
  { value: 'TILE', label: 'Tile', description: 'Clay or concrete tiles' },
  { value: 'THATCH', label: 'Thatch', description: 'Traditional thatch roofing' },
  { value: 'METAL', label: 'Metal', description: 'Corrugated metal sheeting' },
  { value: 'SLATE', label: 'Slate', description: 'Natural slate tiles' },
  { value: 'SHINGLE', label: 'Shingle', description: 'Asphalt shingles' },
  { value: 'CONCRETE', label: 'Concrete', description: 'Concrete slab roofing' },
  { value: 'CORRUGATED_IRON', label: 'Corrugated Iron', description: 'Traditional corrugated iron' }
];

// Safety features for rural properties
export const RURAL_SAFETY_FEATURES = [
  { value: 'SMOKE_DETECTORS', label: 'Smoke Detectors', description: 'Fire detection system' },
  { value: 'SECURITY_ALARM', label: 'Security Alarm', description: 'Basic security alarm' },
  { value: 'MONITORED_ALARM', label: 'Monitored Alarm', description: '24/7 monitored security' },
  { value: 'SECURITY_CAMERAS', label: 'Security Cameras', description: 'CCTV surveillance' },
  { value: 'ELECTRIC_FENCING', label: 'Electric Fencing', description: 'Perimeter electric fence' },
  { value: 'SECURITY_GATES', label: 'Security Gates', description: 'Controlled access gates' },
  { value: 'SAFE_ROOM', label: 'Safe Room', description: 'Secure room for emergencies' },
  { value: 'FIRE_EXTINGUISHERS', label: 'Fire Extinguishers', description: 'Portable fire suppression' },
  { value: 'SPRINKLER_SYSTEM', label: 'Sprinkler System', description: 'Automatic fire suppression' },
  { value: 'NONE', label: 'None', description: 'No special safety features' }
];

// Heating types for rural areas
export const RURAL_HEATING_TYPES = [
  { value: 'GAS', label: 'Gas', description: 'LPG or natural gas heating' },
  { value: 'ELECTRIC', label: 'Electric', description: 'Electric heating system' },
  { value: 'WOOD_BURNING', label: 'Wood Burning', description: 'Traditional wood stove/fireplace' },
  { value: 'SOLAR', label: 'Solar', description: 'Solar heating system' },
  { value: 'HEAT_PUMP', label: 'Heat Pump', description: 'Energy efficient heat pump' },
  { value: 'COAL', label: 'Coal', description: 'Coal burning stove' },
  { value: 'NONE', label: 'None', description: 'No heating system' }
];

// Access road types for rural properties
export const ACCESS_ROAD_TYPES = [
  { value: 'TARRED', label: 'Tarred Road', description: 'Paved public road access' },
  { value: 'GRAVEL', label: 'Gravel Road', description: 'Gravel road access' },
  { value: 'DIRT', label: 'Dirt Road', description: 'Unpaved dirt road' },
  { value: 'PRIVATE', label: 'Private Road', description: 'Private access road' }
];

// Helper functions
export function getProvinceByCode(code: string): Province | undefined {
  return SOUTH_AFRICAN_PROVINCES.find(p => p.code === code);
}

export function getProvinceByName(name: string): Province | undefined {
  return SOUTH_AFRICAN_PROVINCES.find(p => 
    p.name.toLowerCase().includes(name.toLowerCase()) ||
    p.fullName.toLowerCase().includes(name.toLowerCase())
  );
}

export function getRuralProvinces(): Province[] {
  return SOUTH_AFRICAN_PROVINCES.filter(p => p.ruralPercentage > 50);
}

export function getHighRiskProvinces(): Province[] {
  return SOUTH_AFRICAN_PROVINCES.filter(p => 
    p.crimeRate === 'high' || p.naturalDisasterRisk === 'high'
  );
}

export function calculateRuralRiskFactor(province: Province, propertyType: string): number {
  let factor = 1.0;
  
  // Base factor from province
  if (province.ruralPercentage > 70) factor *= 1.1;
  else if (province.ruralPercentage > 50) factor *= 1.05;
  
  // Property type adjustments
  const ruralPropertyTypes = ['FARMHOUSE', 'RURAL_HOMESTEAD', 'COUNTRY_ESTATE', 'SMALLHOLDING'];
  if (ruralPropertyTypes.includes(propertyType)) {
    factor *= 1.15; // Higher risk for rural properties
  }
  
  // Crime rate adjustment
  if (province.crimeRate === 'high') factor *= 1.2;
  else if (province.crimeRate === 'medium') factor *= 1.05;
  
  // Natural disaster risk
  if (province.naturalDisasterRisk === 'high') factor *= 1.25;
  else if (province.naturalDisasterRisk === 'medium') factor *= 1.1;
  
  return Math.max(0.8, Math.min(1.5, factor));
}
