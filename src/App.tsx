import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SegmentShowcase } from './components/SegmentShowcase';
import { PropertyGrid } from './components/PropertyGrid';
import { ServicesBento } from './components/ServicesBento';
import { CrossBorderSection } from './components/CrossBorderSection';
import { TeamSection } from './components/TeamSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { YieldCalculator } from './components/YieldCalculator';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PropertyModal } from './components/PropertyModal';
import { PropertyComparisonBar } from './components/PropertyComparisonBar';
import { PropertyComparisonModal } from './components/PropertyComparisonModal';
import { SellPropertyModal } from './components/SellPropertyModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminTabType } from './components/AdminDashboardOverview';
import { validateAdminSession, clearAdminSession } from './utils/security';
import {
  Property,
  PropertyFilters,
  LeadSubmission,
  HomepageSegmentsConfig,
  INITIAL_HOMEPAGE_SEGMENTS,
  TeamMember,
  INITIAL_TEAM_MEMBERS,
} from './types/property';
import {
  fetchProperties,
  subscribeToProperties,
  saveProperty,
  fetchLeads,
  fetchHomepageSegments,
  subscribeToHomepageSegments,
  fetchTeamMembers,
  subscribeToTeamMembers,
} from './services/propertyService';
import { injectOrUpdateJSONLD } from './utils/seoStructuredData';

const INITIAL_FILTERS: PropertyFilters = {
  searchQuery: '',
  purpose: 'Todos',
  type: 'Todos',
  location: '',
  category: 'todos',
  priceRange: 'Todos',
};

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [homepageSegments, setHomepageSegments] = useState<HomepageSegmentsConfig>(INITIAL_HOMEPAGE_SEGMENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [filters, setFilters] = useState<PropertyFilters>(INITIAL_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [forceCinemaMode, setForceCinemaMode] = useState(false);
  const [activeSection, setActiveSection] = useState<'inicio' | 'imoveis' | 'galeria' | 'servicos' | 'contato'>('inicio');

  // Property Comparison Side-by-Side System (up to 3 properties)
  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonToast, setComparisonToast] = useState<string | null>(null);

  const handleToggleCompare = (property: Property) => {
    setComparedPropertyIds((prev) => {
      if (prev.includes(property.id)) {
        setComparisonToast(`Imóvel "${property.title}" removido do comparativo.`);
        setTimeout(() => setComparisonToast(null), 3000);
        return prev.filter((id) => id !== property.id);
      }
      if (prev.length >= 3) {
        setComparisonToast('Limite atingido: você pode comparar no máximo 3 imóveis simultaneamente.');
        setTimeout(() => setComparisonToast(null), 4000);
        return prev;
      }
      setComparisonToast(`Imóvel "${property.title}" adicionado ao comparativo (${prev.length + 1}/3).`);
      setTimeout(() => setComparisonToast(null), 3000);
      return [...prev, property.id];
    });
  };

  const handleRemoveComparedProperty = (propertyId: string) => {
    setComparedPropertyIds((prev) => prev.filter((id) => id !== propertyId));
  };

  const handleClearComparison = () => {
    setComparedPropertyIds([]);
    setComparisonToast('Comparativo limpo.');
    setTimeout(() => setComparisonToast(null), 2500);
  };

  const comparedProperties = useMemo(() => {
    return properties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [properties, comparedPropertyIds]);

  // Admin authentication and modal state backed by cryptographic token verification
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return validateAdminSession();
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTabType>('overview');

  // Periodically check session expiry
  useEffect(() => {
    const checkSession = () => {
      const valid = validateAdminSession();
      if (!valid && isAdmin) {
        setIsAdmin(false);
        setIsAdminPanelOpen(false);
      }
    };
    const timer = setInterval(checkSession, 30000);
    return () => clearInterval(timer);
  }, [isAdmin]);

  // Load properties, team members, and homepage segments from Firestore and set up subscriptions
  useEffect(() => {
    let unsubscribeProps: (() => void) | undefined;
    let unsubscribeSegments: (() => void) | undefined;
    let unsubscribeTeam: (() => void) | undefined;

    async function loadData() {
      const initialProps = await fetchProperties();
      setProperties(initialProps);

      unsubscribeProps = subscribeToProperties((updatedList) => {
        setProperties(updatedList);
      });

      const initialLeads = await fetchLeads();
      setLeads(initialLeads);

      const initialSegments = await fetchHomepageSegments();
      setHomepageSegments(initialSegments);

      unsubscribeSegments = subscribeToHomepageSegments((updatedSegments) => {
        setHomepageSegments(updatedSegments);
      });

      const initialTeam = await fetchTeamMembers();
      setTeamMembers(initialTeam);

      unsubscribeTeam = subscribeToTeamMembers((updatedTeam) => {
        setTeamMembers(updatedTeam);
      });
    }

    loadData();

    return () => {
      if (unsubscribeProps) unsubscribeProps();
      if (unsubscribeSegments) unsubscribeSegments();
      if (unsubscribeTeam) unsubscribeTeam();
    };
  }, []);

  // Automatically generate and inject Schema.org JSON-LD for Google, ChatGPT, Perplexity & AI engines
  useEffect(() => {
    if (properties.length > 0) {
      injectOrUpdateJSONLD(properties);
    }
  }, [properties]);

  const refreshData = async () => {
    const updatedProps = await fetchProperties();
    setProperties(updatedProps);
    const updatedLeads = await fetchLeads();
    setLeads(updatedLeads);
    const updatedSegments = await fetchHomepageSegments();
    setHomepageSegments(updatedSegments);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminPanelOpen(true);
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  const handleOpenAdminTrigger = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleFilterChange = (newFilters: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSearchSubmit = () => {
    const target = document.getElementById('imoveis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCinemaGallery = () => {
    setForceCinemaMode(true);
    setActiveSection('galeria');
    const target = document.getElementById('imoveis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const imoveisEl = document.getElementById('imoveis');
      const servicosEl = document.getElementById('servicos');
      const contatoEl = document.getElementById('contato');

      if (contatoEl && y >= contatoEl.offsetTop - 320) {
        setActiveSection('contato');
      } else if (servicosEl && y >= servicosEl.offsetTop - 320) {
        setActiveSection('servicos');
      } else if (imoveisEl && y >= imoveisEl.offsetTop - 320) {
        setActiveSection((prev) => (prev === 'galeria' ? 'galeria' : 'imoveis'));
      } else {
        setActiveSection('inicio');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveAdminNotes = async (property: Property, notes: string) => {
    await saveProperty({
      ...property,
      adminNotes: notes,
    });
    // Update local state and current selected property
    setSelectedProperty((prev) => (prev ? { ...prev, adminNotes: notes } : null));
    await refreshData();
  };

  // Helper to approximate property value in BRL for the range filter
  const parsePropertyValueBRL = (prop: Property): number => {
    if (prop.priceFormatted.includes('US$')) {
      const num = parseFloat(prop.priceFormatted.replace(/[^0-9]/g, '')) || 0;
      return num * 5.5; // Conversion approx for filter grouping
    }
    const num = parseFloat(prop.priceFormatted.replace(/[^0-9]/g, '')) || 0;
    return num;
  };

  // Filter properties according to user selections
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // 1. Purpose Filter (Venda / Locação)
      if (filters.purpose !== 'Todos' && property.purpose !== filters.purpose) {
        return false;
      }

      // 2. Category Filter (residencial, comercial, lancamento, alto-padrao)
      if (filters.category !== 'todos') {
        if (!property.category.includes(filters.category)) {
          return false;
        }
      }

      // 3. Type Filter (Casa, Apartamento, Cobertura, Comercial)
      if (filters.type !== 'Todos' && property.type !== filters.type) {
        return false;
      }

      // 4. Location Filter (City / Region)
      if (filters.location) {
        const locLower = filters.location.toLowerCase();
        const cityMatch = property.city.toLowerCase().includes(locLower);
        const countryMatch = property.country.toLowerCase().includes(locLower);
        const neighborhoodMatch = property.neighborhood.toLowerCase().includes(locLower);
        if (!cityMatch && !countryMatch && !neighborhoodMatch) {
          return false;
        }
      }

      // 5. Price Range Filter
      if (filters.priceRange !== 'Todos') {
        const val = parsePropertyValueBRL(property);
        if (filters.priceRange === 'ate-1m' && val > 1000000) return false;
        if (filters.priceRange === '1m-3m' && (val < 1000000 || val > 3000000)) return false;
        if (filters.priceRange === '3m-5m' && (val < 3000000 || val > 5000000)) return false;
        if (filters.priceRange === 'acima-5m' && val < 5000000) return false;
      }

      // 6. Search Query Filter (Real-time auto search across neighborhood, city, code, title, address)
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const inTitle = property.title.toLowerCase().includes(q);
        const inCode = property.code.toLowerCase().includes(q);
        const inCity = property.city.toLowerCase().includes(q);
        const inNeighborhood = property.neighborhood ? property.neighborhood.toLowerCase().includes(q) : false;
        const inAddress = property.address ? property.address.toLowerCase().includes(q) : false;
        const inCountry = property.country ? property.country.toLowerCase().includes(q) : false;
        const inDesc = property.description ? property.description.toLowerCase().includes(q) : false;
        if (!inTitle && !inCode && !inCity && !inNeighborhood && !inAddress && !inCountry && !inDesc) {
          return false;
        }
      }

      // 7. Only Featured Filter
      if (filters.onlyFeatured && !property.featured) {
        return false;
      }

      // 8. Virtual Tour 360 Filter
      if (filters.hasVirtualTour360 && !property.virtualTour360Url) {
        return false;
      }

      return true;
    });
  }, [properties, filters]);

  return (
    <div className="min-h-screen bg-[#050B1A] text-white font-sans selection:bg-[#D4AF37]/30 selection:text-[#FFF1D0] pb-16 lg:pb-0">
      {/* Top Bar Navigation */}
      <Header
        onOpenSellModal={() => setIsSellModalOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={handleOpenAdminTrigger}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero
          filters={filters}
          properties={properties}
          onFilterChange={handleFilterChange}
          onSearchSubmit={handleSearchSubmit}
          onOpenSellModal={() => setIsSellModalOpen(true)}
          onSelectProperty={setSelectedProperty}
          onOpenCinemaGallery={handleOpenCinemaGallery}
        />

        {/* Commercial & Residential Specialized Pillars Showcase */}
        <SegmentShowcase
          onSelectCategory={(cat) => handleFilterChange({ category: cat })}
          config={homepageSegments}
          isAdmin={isAdmin}
          onOpenAdminSegments={() => {
            setAdminInitialTab('segments');
            handleOpenAdminTrigger();
          }}
        />

        {/* Featured Properties Grid & Categories */}
        <PropertyGrid
          properties={filteredProperties}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onSelectProperty={setSelectedProperty}
          forceCinemaMode={forceCinemaMode}
          onResetCinemaMode={() => setForceCinemaMode(false)}
          comparedPropertyIds={comparedPropertyIds}
          onToggleCompare={handleToggleCompare}
        />

        {/* Bento Services Section: Venda, Locação, Administração e Investidores */}
        <ServicesBento
          onOpenSellModal={() => setIsSellModalOpen(true)}
        />

        {/* Cross-border Institutional Section: Brasil & Paraguai */}
        <CrossBorderSection />

        {/* Equipe de Especialistas & Liderança: Bratu Imobiliária & Administradora LTDA */}
        <TeamSection
          teamMembers={teamMembers}
          isAdmin={isAdmin}
          onOpenAdminTeam={() => {
            setAdminInitialTab('team');
            handleOpenAdminTrigger();
          }}
        />

        {/* Client Testimonials Minimalist Carousel: Brasil & Paraguai */}
        <TestimonialsSection />

        {/* Interactive Rental Yield & Investment Projection Calculator */}
        <YieldCalculator />

        {/* Lead Capture Contact Section */}
        <ContactSection />
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Discreet Floating WhatsApp Trigger */}
      <FloatingWhatsApp />

      {/* Mobile & Tablet Ergonomic Bottom Navigation Bar */}
      <MobileBottomNav
        activeSection={activeSection}
        onOpenSellModal={() => setIsSellModalOpen(true)}
        onOpenCinemaGallery={handleOpenCinemaGallery}
      />

      {/* Floating Property Comparison Dock Bar */}
      <PropertyComparisonBar
        comparedProperties={comparedProperties}
        onRemoveProperty={handleRemoveComparedProperty}
        onClearAll={handleClearComparison}
        onOpenModal={() => setIsComparisonModalOpen(true)}
      />

      {/* Side-by-Side Property Comparison Matrix Modal */}
      <PropertyComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        comparedProperties={comparedProperties}
        onRemoveProperty={handleRemoveComparedProperty}
        onClearAll={handleClearComparison}
        onSelectProperty={setSelectedProperty}
      />

      {/* Real-time Comparison Toast Notification */}
      {comparisonToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#070F26]/95 border border-[#D4AF37]/60 text-white text-xs sm:text-sm font-mono shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span>{comparisonToast}</span>
        </div>
      )}

      {/* Property Details Modal with Conditional Admin Section */}
      <PropertyModal
        property={selectedProperty}
        isAdmin={isAdmin}
        onClose={() => setSelectedProperty(null)}
        onSaveAdminNotes={handleSaveAdminNotes}
        isCompared={selectedProperty ? comparedPropertyIds.includes(selectedProperty.id) : false}
        onToggleCompare={handleToggleCompare}
      />

      {/* Sell / Administer Property Modal for Public Owners */}
      <SellPropertyModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
      />

      {/* Admin Login Modal (Password Protected) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Full Admin Management Panel */}
      <AdminPanel
        properties={properties}
        leads={leads}
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onLogout={handleAdminLogout}
        onRefreshData={refreshData}
        initialTab={adminInitialTab}
      />
    </div>
  );
}
