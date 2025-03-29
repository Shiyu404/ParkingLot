/** @jsxImportSource react */
import React from 'react';
import { Building2, Shield, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About ParkWatch</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Revolutionizing parking management with smart technology and seamless user experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6 mx-auto">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">Our Mission</h2>
          <p className="text-gray-600 text-center leading-relaxed">
            ParkWatch is dedicated to providing intelligent and efficient parking management solutions for communities. 
            Through innovative technology, we help property managers better manage parking resources and provide residents 
            with a more convenient parking experience.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6 mx-auto">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">Our Values</h2>
          <p className="text-gray-600 text-center leading-relaxed">
            We believe that through technological innovation and quality service, we can create a safer and more 
            organized parking environment for communities. We always put users first and provide reliable, 
            user-friendly solutions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6 mx-auto">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">Our Team</h2>
          <p className="text-gray-600 text-center leading-relaxed">
            ParkWatch has a passionate team of professionals from diverse backgrounds, all committed to the same goal: 
            providing the best parking management solutions for communities. We continuously learn and innovate to 
            deliver better service.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-8">Join thousands of communities that trust ParkWatch for their parking management needs.</p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Get Started
          </button>
          <button className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default About; 