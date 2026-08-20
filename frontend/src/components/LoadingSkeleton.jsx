import React from 'react';

// Rich Card skeleton
const RichCardSkeleton = () => (
  <div className="h-48 rounded-lg mb-4">
    <div className="h-16 rounded w-3/4 mb-3"></div>
    <div className="h-6 rounded w-1/2 mb-2"></div>
    <div className="h-4 rounded w-1/3"></div>
    <div className="flex space-x-3 mt-2">
      <div className="h-5 rounded w-12"></div>
      <div className="h-5 rounded w-10"></div>
      <div className="h-5 rounded w-8"></div>
    </div>
  </div>
);

// Medium Card skeleton
const MediumCardSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
    <div className="h-14 rounded w-2/3 mb-3"></div>
    <div className="h-10 rounded w-1/2 mb-2"></div>
    <div className="flex items-center space-x-2 mt-4">
      <div className="h-6 w-14 rounded"></div>
      <div className="h-6 w-8 rounded"></div>
    </div>
  </div>
);

// Minimal Card skeleton
const MinimalSkeleton = () => (
  <div className="bg-gray-100 rounded-lg mb-4 h-32"></div>
);

// Empty/No Results state
const EmptyState = ({ domain, message }) => (
  <div className="flex flex-col items-center py-12">
    <div className="w-12 h-12 rounded-full bg-gray-200 mb-4 flex items-center justify-center flex-shrink-0">
      {domain === 'bookcrossing' && <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.49 0-2.682.555-3.5 1.43" stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : 
      {domain === 'steam' && <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-5.43-5.43M10 11V5l-3.5 3.5M4 12l8-8m0 0l8 8m0 0L12 21l8-8"/></svg> : 
      {domain === 'retailrocket' && <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 1-1.4 1.4L18.3 7.7a1 1 0 0 1-1.4-1.4l-1.6-1.6zM6 12l8 8M6 12l-8 8"/></svg>} 
    </div>
    <h3 className="mb-2 text-lg font-medium">{message}</h3>
    <p className="text-sm text-gray-500">{domain === 'retailrocket' ? 'No items available matching these criteria. Retailrocket data doesn't include titles or descriptions.' : 'No results match your current filters. Try adjusting your search criteria.'}</p>
  </div>
);

export { RichCardSkeleton, MediumCardSkeleton, MinimalSkeleton, EmptyState };
