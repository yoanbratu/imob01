import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SegmentShowcase } from './components/SegmentShowcase';
import { PropertyGrid } from './components/PropertyGrid';
import { ServicesBento } from './components/ServicesBento';
import { CrossBorderSection } from './components/CrossBorderSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { YieldCalculator } from './components/YieldCalculator';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PropertyModal } from './components/PropertyModal';
import { SellPropertyModal } from './components/SellPropertyModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { validateAdminSession, clearAdminSession } from './utils/security';
import { Property, PropertyFilters, LeadSubmission } from './types/property';
import {
  fetchProperties,
  subscribeToProperties,
  saveProperty,
  fetchLeads,
} from './services/propertyService';
import { injectOrUpdateJSONLD } from './utils/seoStructuredData';
import { SemanticCatalogIndex } from './components/SemanticCatalogIndex';

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
  const [filters, setFilters] = useState<PropertyFilters>(INITIAL_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Admin authentication and modal state backed by cryptographic token verification
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return validateAdminSession();
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

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

  // Load properties from Firestore and set up subscription
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function loadData() {
      const initialProps = await fetchProperties();
      setProperties(initialProps);

      unsubscribe = subscribeToProperties((updatedList) => {
        setProperties(updatedList);
      });

      const initialLeads = await fetchLeads();
      setLeads(initialLeads);
    }

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
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
    <div className="min-h-screen bg-[#050B1A] text-white font-sans selection:bg-[#D4AF37]/30 selection:text-[#FFF1D0]">
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
          onFilterChange={handleFilterChange}
          onSearchSubmit={handleSearchSubmit}
          onOpenSellModal={() => setIsSellModalOpen(true)}
        />

        {/* Commercial & Residential Specialized Pillars Showcase */}
        <SegmentShowcase
          onSelectCategory={(cat) => handleFilterChange({ category: cat })}
        />

        {/* Featured Properties Grid & Categories */}
        <PropertyGrid
          properties={filteredProperties}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onSelectProperty={setSelectedProperty}
        />

        {/* Bento Services Section: Venda, Locação, Administração e Investidores */}
        <ServicesBento
          onOpenSellModal={() => setIsSellModalOpen(true)}
        />

        {/* Cross-border Institutional Section: Brasil & Paraguai */}
        <CrossBorderSection />

        {/* Client Testimonials Minimalist Carousel: Brasil & Paraguai */}
        <TestimonialsSection />

        {/* Interactive Rental Yield & Investment Projection Calculator */}
        <YieldCalculator />

        {/* Lead Capture Contact Section */}
        <ContactSection />

        {/* Semantic Catalog Index for Google Search and AI Web Crawlers */}
        <SemanticCatalogIndex
          properties={properties}
          onSelectProperty={setSelectedProperty}
        />
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Discreet Floating WhatsApp Trigger */}
      <FloatingWhatsApp />

      {/* Property Details Modal with Conditional Admin Section */}
      <PropertyModal
        property={selectedProperty}
        isAdmin={isAdmin}
        onClose={() => setSelectedProperty(null)}
        onSaveAdminNotes={handleSaveAdminNotes}
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
      />
    </div>
  );
}
