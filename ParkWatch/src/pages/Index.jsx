/** @jsxImportSource react */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Car, Users, Shield, AlertTriangle } from 'lucide-react';

const Index = () => {
  return React.createElement('div', { className: 'flex flex-col min-h-screen bg-white' },
    // Hero Section
    React.createElement('section', { className: 'flex-1 flex items-center justify-center py-12 lg:py-24' },
      React.createElement('div', { className: 'container px-4 md:px-6' },
        React.createElement('div', { className: 'flex flex-col items-center space-y-6 text-center' },
          React.createElement('div', { className: 'rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-600 mb-4' },
            'Simplified Parking Management'
          ),
          React.createElement(motion.h1, {
            className: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900',
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 }
          },
            'Modern Solution for',
            React.createElement('br'),
            React.createElement('span', { className: 'text-blue-600' }, 'Residential Parking')
          ),
          React.createElement(motion.p, {
            className: 'mt-4 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8',
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.2 }
          },
            'Streamline your residential parking operations with our intuitive management system. Monitor, manage, and maintain your parking facilities effortlessly.'
          ),
          React.createElement(motion.div, {
            className: 'mt-6 flex flex-wrap justify-center gap-4',
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.4 }
          },
            React.createElement(Button, {
              asChild: true,
              size: 'lg',
              className: 'h-11 px-8 bg-blue-600 text-white hover:bg-blue-700'
            },
              React.createElement(Link, { to: '/login' }, 'Get Started')
            ),
            React.createElement(Button, {
              asChild: true,
              variant: 'outline',
              size: 'lg',
              className: 'h-11 px-8 border-blue-600 text-blue-600 hover:bg-blue-50'
            },
              React.createElement(Link, { to: '/visitor-request' }, 'Request Visitor Pass')
            )
          )
        )
      )
    ),

    // Features Section
    React.createElement('section', { className: 'border-t bg-gray-50/50 py-12 lg:py-20' },
      React.createElement('div', { className: 'container px-4 md:px-6' },
        React.createElement(motion.div, {
          className: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4',
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.6 }
        },
          React.createElement('div', { className: 'group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md' },
            React.createElement('div', { className: 'flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4' },
              React.createElement(Car, { className: 'h-6 w-6' })
            ),
            React.createElement('h3', { className: 'mb-2 text-xl font-semibold text-gray-900' }, 'Vehicle Management'),
            React.createElement('p', { className: 'text-muted-foreground' }, 'Track and manage all vehicles in your facility with ease.')
          ),
          React.createElement('div', { className: 'group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md' },
            React.createElement('div', { className: 'flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4' },
              React.createElement(Users, { className: 'h-6 w-6' })
            ),
            React.createElement('h3', { className: 'mb-2 text-xl font-semibold text-gray-900' }, 'Visitor Pass System'),
            React.createElement('p', { className: 'text-muted-foreground' }, 'Streamlined visitor registration and pass management.')
          ),
          React.createElement('div', { className: 'group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md' },
            React.createElement('div', { className: 'flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4' },
              React.createElement(Shield, { className: 'h-6 w-6' })
            ),
            React.createElement('h3', { className: 'mb-2 text-xl font-semibold text-gray-900' }, 'Real-time Monitoring'),
            React.createElement('p', { className: 'text-muted-foreground' }, 'Monitor parking space usage and availability in real-time.')
          ),
          React.createElement('div', { className: 'group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md' },
            React.createElement('div', { className: 'flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4' },
              React.createElement(AlertTriangle, { className: 'h-6 w-6' })
            ),
            React.createElement('h3', { className: 'mb-2 text-xl font-semibold text-gray-900' }, 'Violation Tracking'),
            React.createElement('p', { className: 'text-muted-foreground' }, 'Efficiently manage and track parking violations.')
          )
        )
      )
    )
  );
};

export default Index;
