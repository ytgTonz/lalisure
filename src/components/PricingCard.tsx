import { Check, X } from 'lucide-react';
import { Button } from './ui';

interface PricingFeature {
  feature: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  highlighted?: boolean;
  buttonText?: string;
  onSelect?: () => void;
}

const PricingCard = ({
  title,
  price,
  period = '/month',
  description,
  features,
  highlighted = false,
  buttonText = 'Get Started',
  onSelect
}: PricingCardProps) => {
  return (
    <div 
      className={`relative rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
        highlighted 
          ? 'border-2 border-stone-700 bg-white scale-105' 
          : 'border border-gray-200 bg-white hover:border-stone-300'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-stone-700 text-white px-4 py-2 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">R{price}</span>
          <span className="text-gray-500 ml-1">{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((item, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-1">
              {item.included ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <span 
              className={`text-sm ${
                item.included ? 'text-gray-700' : 'text-gray-400 line-through'
              }`}
            >
              {item.feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        variant={highlighted ? 'primary' : 'outline'}
        size="lg"
        rounded="full"
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PricingCard;