
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Check, Star, Truck, MapPin, Shield, Users, BarChart3, Zap, Route } from 'lucide-react';
import BookDemoDialog from '@/components/BookDemoDialog';

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show mobile splash screen on mobile devices
  if (isMobile) {
    return <MobileSplashScreen />;
  }

  useEffect(() => {
    // Reveal on scroll animation
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    
    // Add staggered animation for hero elements
    const heroElements = document.querySelectorAll('.hero-animate');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 200);
    });
    
    // Add floating animation to dashboard
    const dashboard = document.querySelector('.dashboard-float');
    if (dashboard) {
      setTimeout(() => {
        dashboard.classList.add('float-in');
      }, 1000);
    }
    
    return () => {
      document.querySelectorAll('.reveal').forEach(el => io.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-white text-gray-900 selection:bg-green-600 selection:text-white">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-green-600 grid place-items-center shadow-[0_0_0_3px_rgba(0,0,0,0.06)]">
              <span className="font-black text-white">L</span>
            </div>
            <span className="font-semibold tracking-tight text-gray-900 group-hover:text-green-600 transition-colors">Logistics Solution Resources</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-gray-700">Features</a>
            <a href="#platform" className="hover:text-gray-700">Platform</a>
            <a href="#results" className="hover:text-gray-700">Results</a>
            <a href="#customers" className="hover:text-gray-700">Customers</a>
            <a href="#pricing" className="hover:text-gray-700">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/book-demo" className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300">Book demo</Link>
            <Link to="/auth" className="inline-flex items-center px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 font-medium text-white shadow-lg shadow-green-600/30">Sign In</Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Hero Text - Centered */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="reveal">
              <p className="hero-animate inline-flex items-center text-xs uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 opacity-0 transform translate-y-8">
                PSV • School Transport • Council Contracts
              </p>
              <h1 className="hero-animate mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight opacity-0 transform translate-y-8">
                Professional Transport <span className="text-green-600">Management Platform</span>
              </h1>
              <p className="hero-animate mt-4 text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto opacity-0 transform translate-y-8">
                Streamline your transport operations with our comprehensive fleet management solution. Trusted by professionals across the UK.
              </p>
              
              {/* Enhanced Social Proof */}
              <div className="hero-animate mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 opacity-0 transform translate-y-8">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-orange-600 rounded-full border-2 border-white"></div>
                  </div>
                  <span>500+ Fleet Managers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <span>2,500+ Vehicles Managed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span>4.9/5 Rating</span>
                </div>
              </div>
              
              <div className="hero-animate mt-8 flex flex-col sm:flex-row gap-4 justify-center opacity-0 transform translate-y-8">
                <Link to="/auth" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-500 font-semibold text-white shadow-lg shadow-green-600/30 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Start Free Trial
                </Link>
                <Link to="/book-demo" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Book Demo
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="hero-animate mt-8 flex flex-wrap justify-center items-center gap-6 opacity-0 transform translate-y-8">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">DVSA Compliant</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">UK Transport Council</span>
                </div>
              </div>
            </div>
          </div>

          {/* Large Admin Interface Mockup - Full Width */}
          <div className="relative reveal">
            <div className="dashboard-float w-full max-w-6xl mx-auto opacity-0 transform translate-y-12 scale-95">
              <div className="aspect-[16/9] rounded-3xl bg-gray-100 border border-gray-200 p-4 shadow-2xl">
                <div className="h-full w-full rounded-2xl bg-white border border-gray-200 overflow-hidden">
                  {/* Browser Header */}
                  <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-red-400"></span>
                        <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
                        <span className="w-4 h-4 rounded-full bg-green-400"></span>
                      </div>
                      <div className="flex items-center gap-3 text-base text-gray-600">
                        <div className="w-6 h-6 bg-green-600 rounded"></div>
                        <span className="font-medium">Logistics Solution Resources</span>
                        <span className="text-gray-400">•</span>
                        <span>Fleet Operations Dashboard</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>Lindsey Smith</span>
                      <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Main Interface */}
                  <div className="flex h-full">
                    {/* Sidebar */}
                    <div className="w-80 bg-green-800 text-white p-6">
                      <div className="mb-8">
                        <h3 className="font-semibold text-green-100 text-lg">City Transport Ltd</h3>
                        <p className="text-sm text-green-200">Lindsey Smith</p>
                      </div>
                      <nav className="space-y-2">
                        <div className="flex items-center gap-4 p-3 rounded bg-green-700">
                          <div className="w-5 h-5 bg-white rounded-sm"></div>
                          <span className="text-base">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded hover:bg-green-700">
                          <div className="w-5 h-5 bg-green-300 rounded-sm"></div>
                          <span className="text-base">Vehicles</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded hover:bg-green-700">
                          <div className="w-5 h-5 bg-green-300 rounded-sm"></div>
                          <span className="text-base">Drivers</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded hover:bg-green-700">
                          <div className="w-5 h-5 bg-green-300 rounded-sm"></div>
                          <span className="text-base">Routes</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded hover:bg-green-700">
                          <div className="w-5 h-5 bg-green-300 rounded-sm"></div>
                          <span className="text-base">Maintenance</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded hover:bg-green-700">
                          <div className="w-5 h-5 bg-green-300 rounded-sm"></div>
                          <span className="text-base">Reports</span>
                        </div>
                      </nav>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 p-8 bg-gray-50">
                      <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">Fleet Operations Dashboard</h1>
                        <p className="text-gray-600 text-lg">Real-time overview of your transport operations</p>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Active Vehicles</p>
                              <p className="text-3xl font-bold text-green-600">24</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                              <div className="w-6 h-6 bg-green-600 rounded"></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Active Drivers</p>
                              <p className="text-3xl font-bold text-blue-600">18</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Today's Routes</p>
                              <p className="text-3xl font-bold text-purple-600">12</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <div className="w-6 h-6 bg-purple-600 rounded"></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Maintenance Due</p>
                              <p className="text-3xl font-bold text-orange-600">3</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                              <div className="w-6 h-6 bg-orange-600 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Charts Row */}
                      <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Monthly Fuel Costs</h3>
                          <div className="h-40 bg-gray-100 rounded-lg flex items-end justify-between p-4">
                            <div className="w-12 bg-green-500 rounded-t" style={{height: '60%'}}></div>
                            <div className="w-12 bg-green-500 rounded-t" style={{height: '80%'}}></div>
                            <div className="w-12 bg-green-500 rounded-t" style={{height: '45%'}}></div>
                            <div className="w-12 bg-green-500 rounded-t" style={{height: '90%'}}></div>
                            <div className="w-12 bg-green-500 rounded-t" style={{height: '70%'}}></div>
                            <div className="w-12 bg-green-500 rounded-t" style={{height: '85%'}}></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mt-3">
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                            <span>Jan</span>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Vehicle Status</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base text-gray-600">Active</span>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span className="text-base font-medium">24 vehicles</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-base text-gray-600">In Maintenance</span>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                                <span className="text-base font-medium">3 vehicles</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-base text-gray-600">Out of Service</span>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                <span className="text-base font-medium">1 vehicle</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Logos Section */}
        <div className="py-12 border-y border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trusted by leading transport companies</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
              <div className="flex items-center justify-center h-12 w-full">
                <div className="text-xl font-bold text-gray-400">Arriva</div>
              </div>
              <div className="flex items-center justify-center h-12 w-full">
                <div className="text-xl font-bold text-gray-400">Stagecoach</div>
              </div>
              <div className="flex items-center justify-center h-12 w-full">
                <div className="text-xl font-bold text-gray-400">Go-Ahead</div>
              </div>
              <div className="flex items-center justify-center h-12 w-full">
                <div className="text-xl font-bold text-gray-400">Transdev</div>
              </div>
              <div className="flex items-center justify-center h-12 w-full">
                <div className="text-xl font-bold text-gray-400">Keolis</div>
              </div>
              <div className="flex items-center justify-center h-12 w-full">
                <div className="text-xl font-bold text-gray-400">First Bus</div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">And 500+ other transport companies across the UK</p>
            </div>
          </div>
        </div>

        {/* Decorative swoosh / arrow */}
        <div className="relative h-24" aria-hidden="true">
          <svg viewBox="0 0 1200 120" className="absolute inset-0 w-full h-full">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#16a34a" />
              </marker>
            </defs>
            <path d="M0,80 C300,10 900,150 1200,30" fill="none" stroke="#86efac" strokeWidth="2" markerEnd="url(#arrow)"/>
          </svg>
        </div>
      </section>

      {/* VALUE STATS (small KPI cards) */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-gray-200 p-6 text-center bg-white reveal hover-lift">
            <div className="text-3xl font-extrabold">99.9%</div>
            <div className="text-sm text-gray-500 mt-1">Uptime</div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6 text-center bg-white reveal">
            <div className="text-3xl font-extrabold">-35%</div>
            <div className="text-sm text-gray-500 mt-1">Admin time</div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6 text-center bg-white reveal">
            <div className="text-3xl font-extrabold">+22%</div>
            <div className="text-sm text-gray-500 mt-1">On-time KPI</div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6 text-center bg-white reveal">
            <div className="text-3xl font-extrabold">&lt;5min</div>
            <div className="text-sm text-gray-500 mt-1">Defect → notify</div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl reveal">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Everything you need to operate — <span className="text-green-600">without the chaos</span>
            </h2>
            <p className="mt-3 text-gray-600">Built for UK PSV, school transport, and council contracts.</p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 border border-gray-200 bg-white hover:border-gray-300 transition reveal hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-green-100 grid place-items-center text-green-600 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">PSV Operator Dashboard</h3>
              <p className="mt-2 text-gray-600 text-sm">Live overview of vehicles, drivers, routes, and compliance alerts with real-time KPIs and performance metrics.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
                <Check className="w-3 h-3" />
                Real-time monitoring
              </div>
            </div>
            <div className="rounded-2xl p-6 border border-gray-200 bg-white hover:border-gray-300 transition reveal hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-100 grid place-items-center text-blue-600 mb-4">
                <Route className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Driver & Route Scheduling</h3>
              <p className="mt-2 text-gray-600 text-sm">Intelligent scheduling prevents conflicts with calendar-first workflow and automated route optimization.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium">
                <Check className="w-3 h-3" />
                Conflict prevention
              </div>
            </div>
            <div className="rounded-2xl p-6 border border-gray-200 bg-white hover:border-gray-300 transition reveal hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-purple-100 grid place-items-center text-purple-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Compliance & Walk-around</h3>
              <p className="mt-2 text-gray-600 text-sm">DVSA-ready defects, daily checks, digital signatures, and comprehensive audit trails for full compliance.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 font-medium">
                <Check className="w-3 h-3" />
                DVSA compliant
              </div>
            </div>
            <div className="rounded-2xl p-6 border border-gray-200 bg-white hover:border-gray-300 transition reveal hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-orange-100 grid place-items-center text-orange-600 mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Fleet & MOT Tracking</h3>
              <p className="mt-2 text-gray-600 text-sm">Automated tracking of MOT, service, insurance expiries with proactive alerts and maintenance scheduling.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 font-medium">
                <Check className="w-3 h-3" />
                Proactive alerts
              </div>
            </div>
            <div className="rounded-2xl p-6 border border-gray-200 bg-white hover:border-gray-300 transition reveal hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 grid place-items-center text-indigo-600 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Parent & Council Portals</h3>
              <p className="mt-2 text-gray-600 text-sm">Secure role-based access with isolated per-organisation portals for parents, councils, and operators.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 font-medium">
                <Check className="w-3 h-3" />
                Role-based access
              </div>
            </div>
            <div className="rounded-2xl p-6 border border-gray-200 bg-white hover:border-gray-300 transition reveal hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-red-100 grid place-items-center text-red-600 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Reports & Exports</h3>
              <p className="mt-2 text-gray-600 text-sm">One-click PDF/CSV exports for compliance reporting, performance analytics, and regulatory submissions.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600 font-medium">
                <Check className="w-3 h-3" />
                One-click exports
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS (Fleetio-style stat cards) */}
      <section id="results" className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Save time. Cut costs. Drive real results.</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-green-300 bg-white p-8 soft-shadow">
              <div className="text-6xl font-black tracking-tight">40%</div>
              <p className="mt-4 text-gray-600">Reduced admin time for fleet managers</p>
              <div className="mt-4 text-xs tracking-widest text-gray-400">UK TRANSPORT</div>
            </div>
            <div className="rounded-2xl border border-green-300 bg-white p-8 soft-shadow">
              <div className="text-6xl font-black tracking-tight">99.9%</div>
              <p className="mt-4 text-gray-600">Compliance rate achieved by customers</p>
              <div className="mt-4 text-xs tracking-widest text-gray-400">FLEET OPERATORS</div>
            </div>
            <div className="rounded-2xl border border-green-300 bg-white p-8 soft-shadow">
              <div className="text-6xl font-black tracking-tight">5×</div>
              <p className="mt-4 text-gray-600">Faster reporting and analytics</p>
              <div className="mt-4 text-xs tracking-widest text-gray-400">LOGISTICS COMPANIES</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM ICONS GRID */}
      <section id="platform" className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">The modern way to manage your fleet</h2>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 grid place-items-center">🔧</div>
              <div className="text-sm font-medium">Fleet Maintenance</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 grid place-items-center">🧾</div>
              <div className="text-sm font-medium">Work Orders</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 grid place-items-center">💲</div>
              <div className="text-sm font-medium">Cost Tracking</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 grid place-items-center">⛽</div>
              <div className="text-sm font-medium">Fuel Management</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 grid place-items-center">⚙️</div>
              <div className="text-sm font-medium">Parts Inventory</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 grid place-items-center">✅</div>
              <div className="text-sm font-medium">Inspections</div>
            </div>
          </div>
        </div>

        {/* Bottom swoosh */}
        <div className="relative h-24" aria-hidden="true">
          <svg viewBox="0 0 1200 120" className="absolute inset-0 w-full h-full">
            <defs>
              <marker id="arrow2" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#16a34a" />
              </marker>
            </defs>
            <path d="M0,90 C400,120 800,0 1200,70" fill="none" stroke="#86efac" strokeWidth="2" markerEnd="url(#arrow2)"/>
          </svg>
        </div>
      </section>

      {/* OPTIMIZE EVERYTHING */}
      <section id="optimize" className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Optimize everything</h2>
          <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
            Put a stop to stagnant spreadsheets. Transentrix centralizes your data — assets, drivers, fuel,
            parts, costs and more — so you can make informed decisions, improve performance and scale operations at a glance.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-green-300 overflow-hidden">
              <div className="h-40 speckle"></div>
              <div className="p-6 text-gray-700">Use your data to truly understand the value and lifespan of your assets</div>
            </div>
            <div className="rounded-2xl border border-green-300 overflow-hidden">
              <div className="h-40 speckle"></div>
              <div className="p-6 text-gray-700">Analyze your maintenance and repairs to limit downtime and spending</div>
            </div>
            <div className="rounded-2xl border border-green-300 overflow-hidden">
              <div className="h-40 speckle"></div>
              <div className="p-6 text-gray-700">Forecast costs with lifecycle modeling and parts tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMERS / TESTIMONIALS */}
      <section id="customers" className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Section Header */}
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">What teams say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real operators improving KPIs and compliance across the UK transport industry.</p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-8">
                "Reduced admin time by 40% and improved compliance to 99.9%. Logistics Solution Resources has transformed our fleet management completely."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">LS</div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Lisa Smith</p>
                  <p className="text-gray-600">Fleet Manager, London School Transport</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-8">
                "Real-time tracking and reporting is excellent. Everything we need in one comprehensive platform that actually works."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">MJ</div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Michael Johnson</p>
                  <p className="text-gray-600">Operations Director, City Bus Services</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-8">
                "Customer support is outstanding. The team at Logistics Solution Resources is always helpful and responsive to our needs."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">SW</div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Sarah Williams</p>
                  <p className="text-gray-600">Transport Coordinator, Regional Council</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-8">
                "The compliance features are game-changing. We've never been more confident about our DVSA inspections."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">DB</div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">David Brown</p>
                  <p className="text-gray-600">Compliance Manager, National Express</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-8">
                "Route optimization has saved us 25% in fuel costs and improved our on-time performance significantly."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">RK</div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Robert King</p>
                  <p className="text-gray-600">Fleet Operations Manager, Regional Transport</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-8">
                "The maintenance tracking system is brilliant. We've reduced vehicle downtime by 30% since implementation."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">AM</div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Amanda Miller</p>
                  <p className="text-gray-600">Maintenance Supervisor, City Fleet Services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 reveal">
            <p className="text-lg text-gray-600 mb-6">Join hundreds of satisfied transport companies</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book-demo" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-500 font-semibold text-white shadow-lg shadow-green-600/30 text-lg transition-all duration-300 hover:scale-105">
                Book Your Demo
              </Link>
              <Link to="/auth" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-gray-300 hover:border-gray-400 text-lg transition-all duration-300 hover:scale-105">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto reveal">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Simple pricing that scales</h2>
            <p className="mt-3 text-gray-600">Start free. Upgrade when your fleet grows.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="relative rounded-3xl border border-gray-200 bg-white p-6 reveal hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold">Starter</h3>
              <div className="mt-2 text-3xl font-extrabold">£29<span className="text-lg text-gray-500 font-normal">/month</span></div>
              <p className="text-gray-500 mt-1">For small fleets</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Up to 5 vehicles</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Driver management</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Basic compliance</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Email support</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Basic reporting</li>
              </ul>
              <div className="mt-6 space-y-3">
                <Link to="/auth" className="inline-flex w-full items-center justify-center px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 font-medium text-white">Choose Starter</Link>
                <BookDemoDialog>
                  <Button variant="outline" className="w-full">Book Demo</Button>
                </BookDemoDialog>
              </div>
            </div>
            <div className="relative rounded-3xl border border-gray-200 bg-white p-6 ring-1 ring-green-600 reveal hover:shadow-lg transition-shadow">
              <span className="absolute -top-3 left-6 text-[11px] uppercase tracking-wider bg-green-600 text-white px-2 py-1 rounded-md">Most popular</span>
              <h3 className="text-xl font-bold">Professional</h3>
              <div className="mt-2 text-3xl font-extrabold">£79<span className="text-lg text-gray-500 font-normal">/month</span></div>
              <p className="text-gray-500 mt-1">For growing fleets</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Up to 25 vehicles</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Advanced scheduling</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Full compliance suite</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Priority support</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Advanced analytics</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>API access</li>
              </ul>
              <div className="mt-6 space-y-3">
                <Link to="/auth" className="inline-flex w-full items-center justify-center px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 font-medium text-white">Choose Professional</Link>
                <BookDemoDialog>
                  <Button variant="outline" className="w-full">Book Demo</Button>
                </BookDemoDialog>
              </div>
            </div>
            <div className="relative rounded-3xl border border-gray-200 bg-white p-6 reveal hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold">Enterprise</h3>
              <div className="mt-2 text-3xl font-extrabold">£199<span className="text-lg text-gray-500 font-normal">/month</span></div>
              <p className="text-gray-500 mt-1">For large operations</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Unlimited vehicles</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Multi-site management</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Custom integrations</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>Dedicated account manager</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>White-label options</li>
                <li className="flex items-start gap-2"><span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>24/7 phone support</li>
              </ul>
              <div className="mt-6 space-y-3">
                <Link to="/auth" className="inline-flex w-full items-center justify-center px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 font-medium text-white">Choose Enterprise</Link>
                <BookDemoDialog>
                  <Button variant="outline" className="w-full">Book Demo</Button>
                </BookDemoDialog>
              </div>
            </div>
          </div>
          
          {/* Feature Comparison Table */}
          <div className="mt-12 reveal">
            <h3 className="text-xl font-bold text-center mb-6">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Starter</th>
                    <th className="text-center p-4 font-semibold">Professional</th>
                    <th className="text-center p-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="p-4 font-medium">Vehicles</td>
                    <td className="text-center p-4">Up to 5</td>
                    <td className="text-center p-4">Up to 25</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="p-4 font-medium">Drivers</td>
                    <td className="text-center p-4">✓</td>
                    <td className="text-center p-4">✓</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-4 font-medium">Route Planning</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">Advanced</td>
                    <td className="text-center p-4">Advanced</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="p-4 font-medium">Compliance Tools</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4">Full Suite</td>
                    <td className="text-center p-4">Full Suite</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-4 font-medium">API Access</td>
                    <td className="text-center p-4">✗</td>
                    <td className="text-center p-4">✓</td>
                    <td className="text-center p-4">✓</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="p-4 font-medium">Support</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Priority</td>
                    <td className="text-center p-4">24/7 Phone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-green-700 tracking-widest text-xs font-semibold">READY TO GET STARTED?</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold">Join thousands of satisfied customers using Logistics Solution Resources</h2>
          <p className="mt-3 text-gray-600">Questions? Call us at <a className="text-green-700 underline" href="tel:+447911123456">+44 7911 123456</a> or email <a className="text-green-700 underline" href="mailto:transport@logisticssolutionresources.com">transport@logisticssolutionresources.com</a></p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/book-demo" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-500 font-semibold text-white shadow-lg shadow-green-600/30">Book a Demo</Link>
            <Link to="/auth" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-gray-200 hover:border-gray-300">Start Free Trial</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-gray-600">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-600 grid place-items-center"><span className="font-black text-white">L</span></div>
              <span className="font-semibold text-gray-900">Logistics Solution Resources</span>
            </div>
            <p className="mt-3">Professional transport management platform for fleet operators, schools, and logistics companies across the UK.</p>
          </div>
          <div>
            <p className="text-gray-900 font-semibold">Solutions</p>
            <ul className="mt-2 space-y-2">
              <li><a className="hover:text-gray-900" href="#">Fleet Management System</a></li>
              <li><a className="hover:text-gray-900" href="#">Maintenance Software</a></li>
              <li><a className="hover:text-gray-900" href="#">Fuel Management</a></li>
              <li><a className="hover:text-gray-900" href="#">Automated Fleet Management</a></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-900 font-semibold">Features</p>
            <ul className="mt-2 space-y-2">
              <li><a className="hover:text-gray-900" href="#">Maintenance Work Orders</a></li>
              <li><a className="hover:text-gray-900" href="#">Parts Inventory Tracking</a></li>
              <li><a className="hover:text-gray-900" href="#">Driver Scheduling</a></li>
              <li><a className="hover:text-gray-900" href="#">Reports & Exports</a></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-900 font-semibold">Connect</p>
            <ul className="mt-2 space-y-2">
              <li><a className="hover:text-gray-900" href="#">About Us</a></li>
              <li><a className="hover:text-gray-900" href="#">Careers</a></li>
              <li><a className="hover:text-gray-900" href="#">Help Center</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Logistics Solution Resources — All rights reserved.
        </div>
      </footer>

      {/* Floating social-proof pill */}
      <div className="floating-pill">
        <div className="flex items-stretch rounded-xl border border-green-600 bg-white overflow-hidden soft-shadow">
          <div className="bg-green-600 text-white px-4 py-3 font-bold tracking-widest">24</div>
          <div className="px-4 py-3 text-sm text-gray-700">Companies using Logistics Solution Resources!</div>
        </div>
      </div>

      {/* Chat button placeholder */}
      <button className="chat-btn" aria-label="Chat">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"/>
        </svg>
      </button>
    </div>
  );
};

export default Index;
