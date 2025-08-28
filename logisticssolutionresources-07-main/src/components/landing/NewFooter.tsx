import React from 'react';

const NewFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-muted-foreground">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary grid place-items-center">
              <span className="font-black text-primary-foreground">T</span>
            </div>
            <span className="font-semibold text-foreground">Transentrix</span>
          </div>
          <p className="mt-3">
            AI-driven transport management for PSV operators, schools, and councils.
          </p>
        </div>
        <div>
          <p className="text-foreground font-semibold">Solutions</p>
          <ul className="mt-2 space-y-2">
            <li>
              <a className="hover:text-foreground" href="#">
                Fleet Management System
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Maintenance Software
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Fuel Management
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Automated Fleet Management
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-foreground font-semibold">Features</p>
          <ul className="mt-2 space-y-2">
            <li>
              <a className="hover:text-foreground" href="#">
                Maintenance Work Orders
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Parts Inventory Tracking
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Driver Scheduling
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Reports & Exports
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-foreground font-semibold">Connect</p>
          <ul className="mt-2 space-y-2">
            <li>
              <a className="hover:text-foreground" href="#">
                About Us
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Careers
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#">
                Help Center
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {currentYear} Transentrix — All rights reserved.
      </div>
    </footer>
  );
};

export default NewFooter;