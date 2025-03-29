/** @jsxImportSource react */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const Header = () => {
  const navigate = useNavigate();

  return React.createElement('header', { 
    className: 'fixed w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b'
  },
    React.createElement('div', { 
      className: 'container flex h-16 items-center justify-between'
    },
      // Logo and Brand
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Link, { to: '/', className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'p-2 rounded-md bg-primary/10' },
            React.createElement(Car, { className: 'h-5 w-5 text-primary' })
          ),
          React.createElement('span', { className: 'font-bold text-lg' }, 'ParkWatch')
        )
      ),
      
      // Navigation and User Menu
      React.createElement('div', { className: 'flex items-center gap-4' },
        // Show Pay Ticket link for all users
        React.createElement('div', { 
          className: 'flex items-center cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors',
          onClick: () => navigate('/pay-ticket')
        },
          React.createElement(CreditCard, { className: 'mr-2 h-4 w-4' }),
          'Pay Ticket'
        ),
        // User Menu
        React.createElement(UserMenu)
      )
    )
  );
};

export default Header;
