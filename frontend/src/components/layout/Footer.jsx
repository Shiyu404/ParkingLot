/** @jsxImportSource react */
import React from 'react';
import { Car, Info, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <Car className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold">ParkWatch</span>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <Link to="/about" className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
              <Info className="mr-2 h-4 w-4" />
              About Us
            </Link>
            <Link to="/contact" className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
              <Mail className="mr-2 h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ParkWatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
