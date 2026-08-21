import React from 'react';

export function LandingSurface({ onStart, onSignIn, user, onLogout }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md w-full">
      {/* TopNavBar */}
      <nav className="bg-surface/80 backdrop-blur-md dark:bg-surface-dim/80 fixed top-0 w-full z-50 border-b border-secondary/10 dark:border-outline-variant shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full max-w-container-max-width mx-auto">
          <div className="flex items-center gap-6">
            <a className="font-display-lg text-display-lg text-primary dark:text-primary-fixed tracking-tight" href="#" style={{ fontSize: '24px', lineHeight: '32px' }}>CompareX</a>
            <div className="hidden md:flex items-center gap-4 ml-8">
              <a className="text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1 hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg transition-all px-3 py-2 scale-95 active:scale-90 transition-transform duration-200" href="#">Browse</a>
              <a className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed transition-colors hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 scale-95 active:scale-90 transition-transform duration-200" href="#">Compare</a>
              <a className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed transition-colors hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 scale-95 active:scale-90 transition-transform duration-200" href="#">Offers</a>
              <a className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed transition-colors hover:bg-primary/5 dark:hover:bg-primary-fixed/10 rounded-lg px-3 py-2 scale-95 active:scale-90 transition-transform duration-200" href="#">History</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-secondary/10 focus-within:border-primary focus-within:shadow-[0_0_0_4px_hsla(260,40%,40%,0.1)] transition-all">
              <span className="material-symbols-outlined text-tertiary mr-2 text-xl">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-sm p-0 w-48 text-on-surface outline-none" placeholder="Search..." type="text"/>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-primary font-label-md">{user.email}</span>
                <button onClick={onLogout} className="text-on-surface-variant hover:text-primary transition-colors font-label-md">Log Out</button>
              </div>
            ) : (
              <button onClick={onSignIn} className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-[16px] hover:bg-primary/90 transition-colors shadow-level-1 hover-elevate">
                  Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto w-full">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6">
              Discover Your Next Favorite Thing
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl">
              Personalized recommendations across books, gaming, and retail, all in one seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onStart} className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-[16px] hover:bg-primary/90 transition-colors shadow-level-1 hover-elevate text-lg">
                Get Started
            </button>
            <button onClick={onStart} className="bg-secondary-container/20 text-secondary font-label-md text-label-md px-8 py-4 rounded-[16px] hover:bg-secondary-container/30 transition-colors text-lg border border-secondary-container">
                Learn More
            </button>
          </div>
        </section>

        {/* Bento Grid Feature Section */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* BookCrossing Card */}
            <div className="bg-surface-container-lowest border border-secondary/10 rounded-[16px] p-6 shadow-level-1 hover-elevate flex flex-col h-full">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container flex items-center justify-center">
                <img alt="BookCrossing Illustration" className="w-full h-full object-contain" src="/book_illustration.png"/>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">menu_book</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">BookCrossing</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                  Discover hidden literary gems and track physical books as they travel the globe. Connect with fellow readers.
              </p>
              <button onClick={onStart} className="mt-6 text-primary font-label-md text-label-md flex items-center gap-1 hover:underline w-fit">
                  Explore Books <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Steam Gaming Card */}
            <div className="bg-surface-container-lowest border border-secondary/10 rounded-[16px] p-6 shadow-level-1 hover-elevate flex flex-col h-full md:-translate-y-4">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container flex items-center justify-center">
                <img alt="Steam Gaming Illustration" className="w-full h-full object-contain" src="/controller_illustration.png"/>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">sports_esports</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Gaming Hub</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                  Find your next adventure. Tailored game recommendations based on your unique playstyle and library.
              </p>
              <button onClick={onStart} className="mt-6 text-primary font-label-md text-label-md flex items-center gap-1 hover:underline w-fit">
                  Find Games <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* RetailRocket Card */}
            <div className="bg-surface-container-lowest border border-secondary/10 rounded-[16px] p-6 shadow-level-1 hover-elevate flex flex-col h-full">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container flex items-center justify-center">
                <img alt="Retail Shopping Illustration" className="w-full h-full object-contain" src="/cart_illustration.png"/>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">shopping_bag</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">RetailRocket</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                  Smart shopping assistant that learns your preferences to suggest the perfect products at the best prices.
              </p>
              <button onClick={onStart} className="mt-6 text-primary font-label-md text-label-md flex items-center gap-1 hover:underline w-fit">
                  Start Shopping <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-low border-t border-secondary/10 dark:border-outline-variant w-full py-12 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto gap-4">
          <div className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface">
              CompareX
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm hover:underline transition-all opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm hover:underline transition-all opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm hover:underline transition-all opacity-80 hover:opacity-100 transition-opacity" href="#">Cookie Policy</a>
          </div>
          <div className="font-body-sm text-body-sm text-primary dark:text-primary-fixed-dim">
              © 2024 CompareX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
