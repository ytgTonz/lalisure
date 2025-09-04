
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
    <div className="bg-white rounded-xl shadow-lg p-6 h-80 flex flex-col justify-between transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col items-center text-center">
        <Image
          src={avatarUrl}
          alt={customerName}
          width={64}
          height={64}
          className="rounded-full border-3 border-stone-200 mb-3"
        />
        <h3 className="text-lg font-bold text-stone-800 mb-1">{customerName}</h3>
        <p className="text-xs text-stone-600 mb-4">{customerTitle}</p>
      </div>
      <blockquote className="text-sm text-gray-700 text-center italic leading-snug line-clamp-4 overflow-hidden">
        "{testimonial}"
      </blockquote>
    </div>
  );
};

export default TestimonialCard;
