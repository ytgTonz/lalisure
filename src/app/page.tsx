import { CheckCircle, ChevronRight, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Page = () => {
  return (
    <div className="bg-white text-gray-800">
      <Navbar />
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#F5F5DC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Why Choose Lalisure?</h2>
            <p className="text-lg text-gray-600">We provide more than just insurance; we provide a promise.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <Shield className="h-12 w-12 text-stone-700 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Comprehensive Coverage</h3>
              <p className="text-gray-600">From natural disasters to theft, our policies are designed to protect your home and belongings against a wide range of risks.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <CheckCircle className="h-12 w-12 text-stone-700 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Simple & Fast Claims</h3>
              <p className="text-gray-600">Our streamlined claims process ensures that you get the support you need, when you need it, without unnecessary delays.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2">
              <Star className="h-12 w-12 text-stone-700 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Exceptional Service</h3>
              <p className="text-gray-600">Our dedicated team is always ready to assist you with personalized service and expert advice, ensuring a seamless experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Get Covered in 3 Easy Steps</h2>
            <p className="text-lg text-gray-600">A straightforward path to securing your home.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="text-center max-w-xs">
              <div className="text-5xl font-bold text-stone-700 mb-2">1</div>
              <h3 className="text-2xl font-semibold mb-2">Get a Quote</h3>
              <p className="text-gray-600">Answer a few simple questions to receive a personalized quote in minutes.</p>
            </div>
            <ChevronRight className="h-8 w-8 text-gray-300 hidden md:block" />
            <div className="text-center max-w-xs">
              <div className="text-5xl font-bold text-stone-700 mb-2">2</div>
              <h3 className="text-2xl font-semibold mb-2">Customize Your Plan</h3>
              <p className="text-gray-600">Adjust your coverage and payment options to fit your needs and budget.</p>
            </div>
            <ChevronRight className="h-8 w-8 text-gray-300 hidden md:block" />
            <div className="text-center max-w-xs">
              <div className="text-5xl font-bold text-stone-700 mb-2">3</div>
              <h3 className="text-2xl font-semibold mb-2">Get Insured</h3>
              <p className="text-gray-600">Finalize your policy online and enjoy immediate peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Loved by Homeowners Nationwide</h2>
            <p className="text-lg text-gray-600">Real stories from our satisfied customers.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img src="/avatars/avatar-1.jpg" alt="Customer" className="h-12 w-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-bold">Thabo Nkosi</h4>
                  <p className="text-sm text-gray-500">Gauteng</p>
                </div>
              </div>
              <p className="text-gray-600">"The best decision I made for my home. The process was incredibly simple and the team was so helpful. I feel secure knowing Lalisure has my back."</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img src="/avatars/avatar-2.jpg" alt="Customer" className="h-12 w-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-bold">Anelisa van der Merwe</h4>
                  <p className="text-sm text-gray-500">Western Cape</p>
                </div>
              </div>
              <p className="text-gray-600">"I was impressed by the affordable rates and the level of coverage offered. Lalisure is a game-changer for home insurance in South Africa."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-stone-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Protect Your Home?</h2>
          <p className="text-xl mb-8">Get a personalized quote today and and join the growing family of protected Lalisure homeowners.</p>
          <Link href="/sign-up" className="bg-white text-stone-700 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
            Get Your Free Quote
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Page;