import React from 'react';
import { Car, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">My App</h1>
            <nav className="flex gap-4">
                <Link to="/" className="hover:underline">Home</Link>
                <Link to="/about" className="hover:underline">About</Link>
            </nav>
            <div className="flex gap-3">
                <Car size={24} />
                <CreditCard size={24} />
            </div>
        </header>
    );
};

export default Header;