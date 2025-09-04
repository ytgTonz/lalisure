
import Image from 'next/image';
import { FC } from 'react';

interface TestimonialCardProps {
  testimonial: string;
  customerName: string;
  customerTitle: string;
  avatarUrl: string;
}

const TestimonialCard: FC<TestimonialCardProps> = ({
  testimonial,
  customerName,
  customerTitle,
  avatarUrl,
}) => {
  return (
    <div className="group perspective-1000">
      <div className="relative w-full max-w-sm h-64 transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center">
          <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
            "{testimonial}"
          </p>
        </div>
        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden bg-blue-600 dark:bg-blue-800 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center rotate-y-180">
          <Image
            src={avatarUrl}
            alt={customerName}
            width={80}
            height={80}
            className="rounded-full border-4 border-white"
          />
          <h3 className="mt-4 text-xl font-bold text-white">{customerName}</h3>
          <p className="text-sm text-gray-200">{customerTitle}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
