import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote,
  CheckCircle2,
  Building2,
  Globe2,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  country: 'Brasil' | 'Estados Unidos' | 'Paraguai' | 'Transfronteiriço';
  flag: string;
  transactionType: string;
  propertyDetail: string;
  quote: string;
  rating: number;
  date: string;
  avatarUrl: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Dr. Carlos Eduardo Mendonça',
    role: 'Investidor Privado & Cirurgião',
    location: 'Curitiba, PR',
    country: 'Brasil',
    flag: '🇧🇷',
    transactionType: 'Aquisição Corporativa & Gestão',
    propertyDetail: 'Andar Corporativo no Batel · 480m²',
    quote:
      'A Bratu conduziu toda a negociação do andar corporativo com discrição absoluta e rigor documental. A solidez jurídica e a clareza em cada cláusula contratual me deram a convicção de estar assessorado pela melhor administradora do mercado.',
    rating: 5,
    date: 'Fevereiro, 2026',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    name: 'Ing. Sofia Valenzuela Martínez',
    role: 'Diretora de Family Office',
    location: 'Asunción',
    country: 'Paraguai',
    flag: '🇵🇾',
    transactionType: 'Portfólio Residencial em Dólar',
    propertyDetail: 'Edifício Residencial na Av. Santa Teresa',
    quote:
      'Para nossa família, investir com a Bratu na ponte Brasil-Paraguai foi uma experiência impecável. A equipe domina tanto as normativas paraguaias de incentivo fiscal quanto as remessas internacionais seguras. Confiança inegociável.',
    rating: 5,
    date: 'Janeiro, 2026',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    name: 'Marcelo Silveira Fontes',
    role: 'Sócio de Grupo Agroindustrial',
    location: 'Foz do Iguaçu / Ciudad del Este',
    country: 'Transfronteiriço',
    flag: '🇧🇷 🇵🇾',
    transactionType: 'Logística & Residência',
    propertyDetail: 'Galpão Logístico & Paraná Country Club',
    quote:
      'Operar nas duas margens da fronteira exige parceiros que compreendam as nuances cambiais e tributárias de ambos os países. A Bratu viabilizou nosso complexo logístico e a casa da família com agilidade e total respaldo contratual.',
    rating: 5,
    date: 'Dezembro, 2025',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '4',
    name: 'Beatriz Albuquerque & Família',
    role: 'Proprietários e Investidores de Renda',
    location: 'São Paulo, SP',
    country: 'Brasil',
    flag: '🇧🇷',
    transactionType: 'Administração Patrimonial Completa',
    propertyDetail: '3 Apartamentos Alto Padrão nos Jardins',
    quote:
      'Confiamos três imóveis à administração integral da Bratu. Há dois anos os repasses de aluguel ocorrem com pontualidade britânica, sem vacância e com inquilinos corporativos rigorosamente avaliados. Tranquilidade absoluta.',
    rating: 5,
    date: 'Novembro, 2025',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '5',
    name: 'Guillermo Benítez Ramos',
    role: 'Desenvolvedor Imobiliário',
    location: 'Hernandarias / Ciudad del Este',
    country: 'Paraguai',
    flag: '🇵🇾',
    transactionType: 'Expansão de Empreendimentos',
    propertyDetail: 'Condomínio Residencial Fechado',
    quote:
      'A capacidade da Bratu de conectar compradores brasileiros qualificados a projetos seguros no Paraguai acelerou nossas vendas. A seriedade no acompanhamento cartorário e a postura ética da diretoria são exemplares.',
    rating: 5,
    date: 'Outubro, 2025',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '6',
    name: 'Helena Ramos Camargo',
    role: 'Empresária de Tecnologia',
    location: 'Balneário Camboriú, SC',
    country: 'Brasil',
    flag: '🇧🇷',
    transactionType: 'Compra de Residencial de Luxo',
    propertyDetail: 'Cobertura Duplex Frente Mar · 390m²',
    quote:
      'Processo de aquisição memorável. Da curadoria reservada de imóveis até a lavratura da escritura pública definitiva, senti total segurança patrimonial. O atendimento consultivo da equipe Bratu superou todas as expectativas.',
    rating: 5,
    date: 'Setembro, 2025',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '7',
    name: 'Dr. Roberto & Mariana Sampaio',
    role: 'Investidores Internacionais & Médicos',
    location: 'Miami / Orlando, FL',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    transactionType: 'Aquisição de Imóvel em Dólar & LLC',
    propertyDetail: 'Apartamento em Brickell & Vacation Home em Lake Nona',
    quote:
      'A consultoria internacional da Bratu foi determinante para nossa diversificação nos Estados Unidos. Cuidaram desde a criação da nossa LLC até o fechamento com a Title Company na Flórida. Renda em dólar garantida com suporte primoroso.',
    rating: 5,
    date: 'Março, 2026',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
];

type FilterCountry = 'Todos' | 'Brasil' | 'Estados Unidos' | 'Paraguai' | 'Transfronteiriço';

export const TestimonialsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCountry>('Todos');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Responsive items count per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTestimonials = TESTIMONIALS.filter((t) => {
    if (activeFilter === 'Todos') return true;
    return t.country === activeFilter;
  });

  const totalPages = Math.ceil(filteredTestimonials.length / cardsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  }, [totalPages]);

  const visibleTestimonials = filteredTestimonials.slice(
    currentIndex * cardsPerPage,
    currentIndex * cardsPerPage + cardsPerPage
  );

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  return (
    <section
      id="depoimentos"
      className="py-24 bg-[#050B1A] relative overflow-hidden border-t border-[#D4AF37]/20"
    >
      {/* Subtle architectural background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,31,82,0.4),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C378] text-xs font-mono tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Credibilidade & Satisfação Comprovada</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Confiança de Quem Investe no{' '}
              <span className="bg-gradient-to-r from-[#ECC97E] via-[#D4AF37] to-[#C59B27] bg-clip-text text-transparent">
                Brasil e no Paraguai
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl font-light">
              Depoimentos reais de proprietários, investidores corporativos e famílias que
              realizaram operações imobiliárias com assessoria jurídica de excelência e segurança patrimonial.
            </p>
          </div>

          {/* Minimalist Carousel Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Page Count */}
            <div className="text-xs font-mono text-slate-400">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span>{Math.max(1, totalPages)}</span>
            </div>

            {/* Navigation Buttons with Modern High-Tech Controls */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrev}
                disabled={totalPages <= 1}
                aria-label="Depoimento anterior"
                className="tech-btn-secondary w-10 h-10 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <ChevronLeft className="w-5 h-5 text-[#ECC97E]" />
              </button>
              <button
                onClick={handleNext}
                disabled={totalPages <= 1}
                aria-label="Próximo depoimento"
                className="tech-btn-secondary w-10 h-10 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <ChevronRight className="w-5 h-5 text-[#ECC97E]" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Selection Tabs with Modern Tech Effects */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs scrollbar-none">
          <button
            onClick={() => setActiveFilter('Todos')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'Todos'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            Todos os Depoimentos ({TESTIMONIALS.length})
          </button>
          <button
            onClick={() => setActiveFilter('Brasil')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeFilter === 'Brasil'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <span>🇧🇷</span>
            <span>Transações no Brasil</span>
          </button>
          <button
            onClick={() => setActiveFilter('Paraguai')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeFilter === 'Paraguai'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <span>🇵🇾</span>
            <span>Transações no Paraguai</span>
          </button>
          <button
            onClick={() => setActiveFilter('Transfronteiriço')}
            className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeFilter === 'Transfronteiriço'
                ? 'tech-btn-primary'
                : 'tech-btn-secondary text-slate-300'
            }`}
          >
            <span>🇧🇷 🇵🇾</span>
            <span>Operações Transfronteiriças</span>
          </button>
        </div>

        {/* 3-Column Minimalist Carousel Grid */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300"
        >
          {visibleTestimonials.map((item) => (
            <article
              key={item.id}
              className="bg-[#F8F9FB] rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.22)] hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Card Top: Stars & Transaction Verification Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-1 text-[#C59B27]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#C59B27]" />
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Transação Verificada</span>
                  </div>
                </div>

                {/* Property / Transaction Anchor */}
                <div className="mb-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-[#B8860B]" />
                    <span>{item.transactionType}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">
                    {item.propertyDetail}
                  </div>
                </div>

                {/* Quote Content */}
                <div className="relative my-4">
                  <Quote className="w-7 h-7 text-slate-300/60 absolute -top-2 -left-1 pointer-events-none" />
                  <p className="text-slate-700 text-sm leading-relaxed pl-5 font-normal italic">
                    "{item.quote}"
                  </p>
                </div>
              </div>

              {/* Card Bottom: Real Photo Avatar, Client Info & Geography */}
              <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Real Person Photo Avatar with Technological Ring Accent */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)] bg-[#050B1A]">
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="w-full h-full object-cover object-top filter contrast-[1.05]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="w-full h-full flex items-center justify-center text-xs font-bold text-[#E5C378]">${item.name.slice(0, 2)}</span>`;
                          }
                        }}
                      />
                    </div>
                    {/* Small Flag Badge Overlaid on Photo */}
                    <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full shadow-xs px-0.5 border border-slate-200">
                      {item.flag.split(' ')[0]}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-600 truncate">{item.role}</p>
                  </div>
                </div>

                {/* Geographic & Country Indicator */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-800">
                    <span className="text-[11px] font-semibold">{item.country}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {item.location}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Carousel Pagination Pips / Dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir para página ${i + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === i
                    ? 'w-10 bg-gradient-to-r from-[#ECC97E] to-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                    : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* Institutional Trust Footer Banner with Tech Button */}
        <div className="mt-14 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#070F26] via-[#0B173E] to-[#070F26] border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Globe2 className="w-5 h-5 text-[#ECC97E]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Assessoria Transfronteiriça Especializada
              </div>
              <div className="text-xs text-slate-300">
                Acompanhamento jurídico, documental e cartorário de ponta a ponta em Curitiba, São Paulo, Asunción e Ciudad del Este.
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/5521980984243?text=Ol%C3%A1%2C+gostaria+de+conhecer+mais+sobre+as+oportunidades+e+depoimentos+de+investimento+no+Brasil+e+Paraguai."
            target="_blank"
            rel="noopener noreferrer"
            className="tech-btn-primary px-6 py-3 rounded-xl text-xs whitespace-nowrap"
          >
            Falar com um Consultor Especialista
          </a>
        </div>
      </div>
    </section>
  );
};
