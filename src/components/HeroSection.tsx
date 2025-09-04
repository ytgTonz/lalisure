'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    '/hero-background.jpg',
    '/hero-background-2.jpg',
    '/hero-background-3.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
        {heroImages.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('${image}')`, 
              filter: "brightness(0.7)" 
            }}
          />
        ))}
      </div>
      {/* Logo Watermark */}
      <div className="absolute top-8 right-8 z-20 opacity-60 hidden md:block">
        <img 
          src="/lalisure1.svg" 
          alt="Lalisure Watermark" 
          className="h-40 w-40 filter invert brightness-0 contrast-100" 
        />
      </div>
      
      <div className="relative z-10 text-center text-white px-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        <h1 className="text-5xl md:text-7xl font-bold mb-4">Secure Your Home, Secure Your Future</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Lalisure offers modern, accessible home insurance for every South African. Get peace of mind with our reliable and affordable coverage.</p>
        <div className="flex justify-center">
          <Link href="/sign-up" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-full text-xl transition-transform transform hover:scale-105 shadow-lg">
            Get Covered
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
