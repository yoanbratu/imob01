import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Property,
  LeadSubmission,
  Realtor,
  PropertyOwner,
  Condominium,
  HomepageSegment,
  HomepageSegmentsConfig,
  SegmentItem,
  INITIAL_HOMEPAGE_SEGMENTS,
  TeamMember,
  INITIAL_TEAM_MEMBERS,
  GoogleReviewConfig,
  INITIAL_GOOGLE_REVIEW_CONFIG,
} from '../types/property';
import { PROPERTIES as INITIAL_PROPERTIES } from '../data/properties';

const PROPERTIES_COLLECTION = 'properties';
const LEADS_COLLECTION = 'leads';

// Initial sample owner and realtor metadata for the portfolio
const SAMPLE_ADMIN_METADATA: Record<string, Partial<Property>> = {
  'brt-01': {
    ownerName: 'Dr. Roberto Silveira da Cunha',
    ownerPhone: '+55 (41) 99123-4567',
    ownerEmail: 'roberto.cunha@silveiraadvogados.com.br',
    ownerDocument: '184.920.489-02 (CPF)',
    ownerBankDetails: 'Banco Itaú (341) Ag: 0084 CC: 39482-1 | PIX: 41991234567',
    ownerMinNegotiationValue: 'R$ 7.500.000',
    realtorName: 'Alexandre Bratu',
    realtorCreci: 'CRECI-PR 32.410',
    realtorPhone: '+55 (21) 98098-4243',
    realtorEmail: 'Demy@Bratu.com.br',
    realtorCommission: '6% (Honorários de Venda Padrão)',
    adminNotes: 'Imóvel com documentação 100% desembaraçada e escritura pronta no 2º Cartório de Imóveis de Curitiba. Chaves estão na sede da Bratu Centro Cívico. Proprietário aceita até 20% em permuta por apartamento no Batel.',
  },
  'brt-03': {
    ownerName: 'Inversiones y Desarrollos Santa Teresa S.A.',
    ownerPhone: '+595 981 445 220',
    ownerEmail: 'directorio@santateresainversiones.com.py',
    ownerDocument: 'RUC 80094820-4',
    ownerBankDetails: 'Banco Itaú Paraguay | Cta Corriente USD 984029482',
    ownerMinNegotiationValue: 'US$ 600.000',
    realtorName: 'Carlos M. Bogado / Bratu Asunción',
    realtorCreci: 'Matrícula Registro PY 45.290',
    realtorPhone: '+55 (21) 98098-4243',
    realtorEmail: 'Demy@Bratu.com.br',
    realtorCommission: '5% em USD',
    adminNotes: 'Laje corporativa desocupada pronta para ocupação imediata. Ideal para empresas sob regime Maquila ou escritórios internacionais. Asunción é zona de alta valorização.',
  },
  'brt-10': {
    ownerName: 'Grupo Patrimonial Batel Participações Ltda',
    ownerPhone: '+55 (41) 98844-1100',
    ownerEmail: 'gestao@batelparticipacoes.com.br',
    ownerDocument: '04.829.194/0001-44 (CNPJ)',
    ownerBankDetails: 'Banco Bradesco (237) Ag: 1202 CC: 88291-0',
    ownerMinNegotiationValue: 'R$ 35.000/mês para contrato mínimo de 36 meses',
    realtorName: 'Alexandre Bratu',
    realtorCreci: 'CRECI-PR 32.410',
    realtorPhone: '+55 (21) 98098-4243',
    realtorEmail: 'Demy@Bratu.com.br',
    realtorCommission: '1º aluguel integral + 8% taxa de administração mensal',
    adminNotes: 'Andar corporativo recém-reformado. Acesso por catraca biométrica. O proprietário exige seguro fiança locatícia Porto Seguro ou carta de fiança bancária.',
  },
  'brt-us01': {
    ownerName: 'Brickell Bay Investments LLC (Florida)',
    ownerPhone: '+1 (786) 405-9240',
    ownerEmail: 'investments@brickellbayfl.com',
    ownerDocument: 'EIN / Tax ID 84-2940291',
    ownerBankDetails: 'JPMorgan Chase Bank, Miami Brickell Branch | Wire Routing: 021000021',
    ownerMinNegotiationValue: 'US$ 1.390.000 à vista',
    realtorName: 'Alexandre Bratu / Desk Miami',
    realtorCreci: 'CRECI-PR 32.410 | Florida DBPR Affiliate',
    realtorPhone: '+55 (21) 98098-4243',
    realtorEmail: 'Demy@Bratu.com.br',
    realtorCommission: '5% em Dólar (USD)',
    adminNotes: 'Unidade quitada sem hipoteca (free and clear). Documentação transferível via Title Company em Miami com escrow seguro.',
  },
  'brt-us02': {
    ownerName: 'Lake Nona Holdings Group Inc.',
    ownerPhone: '+1 (407) 829-4100',
    ownerEmail: 'closing@lakenonagroup.com',
    ownerDocument: 'EIN 59-3829104',
    ownerBankDetails: 'Bank of America | Orlando Orange Ave Branch',
    ownerMinNegotiationValue: 'US$ 2.250.000',
    realtorName: 'Alexandre Bratu',
    realtorCreci: 'CRECI-PR 32.410',
    realtorPhone: '+55 (21) 98098-4243',
    realtorEmail: 'Demy@Bratu.com.br',
    realtorCommission: '5%',
    adminNotes: 'Mansão com licença ativa para short-term vacation rental de alto padrão. Gestão completa de property management disponível.',
  },
};

export async function fetchProperties(): Promise<Property[]> {
  try {
    const colRef = collection(db, PROPERTIES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed Firestore with curated properties on first boot
      await seedInitialProperties();
      return INITIAL_PROPERTIES.map((p) => ({
        ...p,
        ...(SAMPLE_ADMIN_METADATA[p.id] || {
          ownerName: 'Proprietário Confidencial Bratu',
          ownerPhone: '+55 (21) 98098-4243',
          ownerEmail: 'atendimento@bratuimoveis.com.br',
          realtorName: 'Equipe Comercial Bratu',
          realtorPhone: '+55 (21) 98098-4243',
          realtorCommission: '6%',
          adminNotes: 'Imóvel sob gestão da Bratu Imobiliária e Administradora.',
        }),
      }));
    }

    const properties: Property[] = [];
    const initialMap = new Map(INITIAL_PROPERTIES.map((p) => [p.id, p]));

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const initialMatch = initialMap.get(docSnap.id);
      properties.push({
        id: docSnap.id,
        ...(initialMatch?.coordinates ? { coordinates: initialMatch.coordinates } : {}),
        ...(initialMatch?.virtualTour360Url ? { virtualTour360Url: initialMatch.virtualTour360Url } : {}),
        ...(initialMatch?.virtualTour360Image ? { virtualTour360Image: initialMatch.virtualTour360Image } : {}),
        ...data,
      });
    });

    return properties;
  } catch (error) {
    console.error('Error fetching properties from Firestore:', error);
    // Fallback to local properties if offline
    return INITIAL_PROPERTIES.map((p) => ({
      ...p,
      ...(SAMPLE_ADMIN_METADATA[p.id] || {}),
    }));
  }
}

async function seedInitialProperties() {
  try {
    for (const prop of INITIAL_PROPERTIES) {
      const docRef = doc(db, PROPERTIES_COLLECTION, prop.id);
      const adminData = SAMPLE_ADMIN_METADATA[prop.id] || {
        ownerName: 'Proprietário Cadastrado Bratu',
        ownerPhone: '+55 (21) 98098-4243',
        ownerEmail: 'contato@bratuimoveis.com.br',
        ownerDocument: 'Documento Verificado Bratu',
        realtorName: 'Corretor Sênior Bratu',
        realtorPhone: '+55 (21) 98098-4243',
        realtorCommission: '6%',
        adminNotes: 'Imóvel ativo com documentação checada pelo departamento jurídico.',
      };

      await setDoc(
        docRef,
        {
          ...prop,
          ...adminData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Error seeding initial properties:', err);
  }
}

export function subscribeToProperties(callback: (properties: Property[]) => void) {
  const colRef = collection(db, PROPERTIES_COLLECTION);
  const initialMap = new Map(INITIAL_PROPERTIES.map((p) => [p.id, p]));

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Property[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        const initialMatch = initialMap.get(d.id);
        list.push({
          id: d.id,
          ...(initialMatch?.coordinates ? { coordinates: initialMatch.coordinates } : {}),
          ...(initialMatch?.virtualTour360Url ? { virtualTour360Url: initialMatch.virtualTour360Url } : {}),
          ...(initialMatch?.virtualTour360Image ? { virtualTour360Image: initialMatch.virtualTour360Image } : {}),
          ...data,
        });
      });
      if (list.length > 0) {
        callback(list);
      }
    },
    (err) => {
      console.error('Snapshot error on properties:', err);
    }
  );
}

/**
 * Sanitiza o objeto antes de persistir no Firestore:
 * 1. Remove qualquer propriedade com valor 'undefined' (que o Firebase rejeita com erro fatal).
 * 2. Garante tipos numéricos corretos para metragem e cômodos.
 * 3. Preenche valores padrão de segurança para campos obrigatórios do esquema.
 */
function sanitizePropertyPayload(property: Partial<Property>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(property)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }

  // Garantir tipos numéricos
  if (sanitized.areaM2 !== undefined) {
    sanitized.areaM2 = Number(sanitized.areaM2) || 0;
  }
  if (sanitized.bathrooms !== undefined) {
    sanitized.bathrooms = Number(sanitized.bathrooms) || 0;
  }
  if (sanitized.bedrooms !== undefined) {
    sanitized.bedrooms = Number(sanitized.bedrooms) || 0;
  }
  if (sanitized.suites !== undefined) {
    sanitized.suites = Number(sanitized.suites) || 0;
  }
  if (sanitized.parkingSpots !== undefined) {
    sanitized.parkingSpots = Number(sanitized.parkingSpots) || 0;
  }

  // Campos centrais obrigatórios com fallback seguro
  if (!sanitized.code || typeof sanitized.code !== 'string') {
    sanitized.code = `BRT-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (!sanitized.title || typeof sanitized.title !== 'string') {
    sanitized.title = 'Imóvel Exclusivo Bratu';
  }
  if (!sanitized.purpose) {
    sanitized.purpose = 'Venda';
  }
  if (!sanitized.type) {
    sanitized.type = 'Apartamento';
  }
  if (!sanitized.country) {
    sanitized.country = 'Brasil';
  }
  if (!sanitized.city) {
    sanitized.city = 'Curitiba';
  }
  if (!sanitized.priceFormatted) {
    sanitized.priceFormatted = 'Sob Consulta';
  }
  if (!sanitized.stateOrDept) {
    sanitized.stateOrDept = sanitized.country === 'Paraguai' ? 'Distrito Capital' : sanitized.country === 'Estados Unidos' ? 'FL' : 'PR';
  }
  if (!sanitized.images || !Array.isArray(sanitized.images) || sanitized.images.length === 0) {
    sanitized.images = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ];
  }

  return sanitized;
}

export async function saveProperty(property: Property): Promise<void> {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, property.id);
    const sanitizedData = sanitizePropertyPayload(property);
    await setDoc(
      docRef,
      {
        ...sanitizedData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    console.error('Erro ao salvar imóvel no Firestore:', error);
    const msg = error?.message || 'Erro desconhecido ao salvar imóvel.';
    throw new Error(msg);
  }
}

export async function deleteProperty(propertyId: string): Promise<void> {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Erro ao deletar imóvel do Firestore:', error);
    throw new Error(error?.message || 'Erro ao deletar imóvel.');
  }
}

export async function updateProperty(propertyId: string, updates: Partial<Property>): Promise<void> {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
    const cleanedUpdates: Record<string, any> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) cleanedUpdates[key] = val;
    }
    await updateDoc(docRef, {
      ...cleanedUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar imóvel no Firestore:', error);
    throw new Error(error?.message || 'Erro ao atualizar imóvel.');
  }
}

export async function saveLead(lead: Omit<LeadSubmission, 'id'>): Promise<string> {
  const leadId = `lead-${Date.now()}`;
  const docRef = doc(db, LEADS_COLLECTION, leadId);
  await setDoc(docRef, {
    ...lead,
    id: leadId,
    createdAt: new Date().toISOString(),
    status: 'Novo',
  });
  return leadId;
}

export async function fetchLeads(): Promise<LeadSubmission[]> {
  try {
    const colRef = collection(db, LEADS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: LeadSubmission[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as any) });
    });
    return list.sort((a, b) => ((b.createdAt || '') > (a.createdAt || '') ? 1 : -1));
  } catch (err) {
    console.error('Error fetching leads:', err);
    return [];
  }
}

// ==========================================
// CORRETORES (REALTORS) MANAGEMENT SERVICES
// ==========================================
const REALTORS_COLLECTION = 'realtors';

export const INITIAL_REALTORS: Realtor[] = [
  {
    id: 'corretor-alexandre',
    name: 'Alexandre Bratu',
    creci: 'CRECI-PR 32.410',
    phone: '+55 (21) 98098-4243',
    email: 'Demy@Bratu.com.br',
    defaultCommission: '6% Padrão Venda',
    specialty: 'Curitiba & Negócios Internacionais',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corretor-carlos',
    name: 'Carlos M. Bogado',
    creci: 'Matrícula Registro PY 45.290',
    phone: '+55 (21) 98098-4243',
    email: 'Demy@Bratu.com.br',
    defaultCommission: '5% em USD',
    specialty: 'Paraguai & Mercosul (Asunción / CDE)',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corretor-juliana',
    name: 'Juliana Mendes',
    creci: 'CRECI-PR 38.120',
    phone: '+55 (41) 99882-1020',
    email: 'juliana.mendes@bratu.com.br',
    defaultCommission: '6%',
    specialty: 'Residencial Alto Padrão Batel & Ecoville',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'corretor-marcus',
    name: 'Marcus Vinicius',
    creci: 'CRECI-SC 42.890',
    phone: '+55 (47) 99112-8877',
    email: 'marcus.sc@bratu.com.br',
    defaultCommission: '6%',
    specialty: 'Balneário Camboriú & Litoral SC',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export async function fetchRealtors(): Promise<Realtor[]> {
  try {
    const colRef = collection(db, REALTORS_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      await seedInitialRealtors();
      return INITIAL_REALTORS;
    }

    const list: Realtor[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error fetching realtors from Firestore:', err);
    return INITIAL_REALTORS;
  }
}

async function seedInitialRealtors() {
  try {
    for (const realtor of INITIAL_REALTORS) {
      const docRef = doc(db, REALTORS_COLLECTION, realtor.id);
      await setDoc(docRef, realtor);
    }
  } catch (err) {
    console.error('Error seeding initial realtors:', err);
  }
}

export function subscribeToRealtors(callback: (realtors: Realtor[]) => void) {
  const colRef = collection(db, REALTORS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_REALTORS);
        return;
      }
      const list: Realtor[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list.sort((a, b) => a.name.localeCompare(b.name)));
    },
    (err) => {
      console.error('Firestore realtors snapshot error:', err);
      callback(INITIAL_REALTORS);
    }
  );
}

export async function saveRealtor(realtor: Realtor): Promise<void> {
  try {
    const realtorId = realtor.id || `corretor-${Date.now()}`;
    const docRef = doc(db, REALTORS_COLLECTION, realtorId);
    const payload: Realtor = {
      id: realtorId,
      name: (realtor.name || '').trim(),
      creci: (realtor.creci || '').trim(),
      phone: (realtor.phone || '').trim(),
      email: (realtor.email || '').trim(),
      defaultCommission: (realtor.defaultCommission || '6%').trim(),
      specialty: (realtor.specialty || '').trim(),
      active: realtor.active !== false,
      avatarUrl: (realtor.avatarUrl || '').trim(),
      updatedAt: new Date().toISOString(),
      createdAt: realtor.createdAt || new Date().toISOString(),
    };

    // Filter out undefined values
    const cleanedPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(payload)) {
      if (val !== undefined) cleanedPayload[key] = val;
    }

    await setDoc(docRef, cleanedPayload, { merge: true });
  } catch (err: any) {
    console.error('Erro ao salvar corretor no Firestore:', err);
    throw new Error(err?.message || 'Falha ao salvar corretor.');
  }
}

export async function deleteRealtor(realtorId: string): Promise<void> {
  try {
    const docRef = doc(db, REALTORS_COLLECTION, realtorId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error('Erro ao excluir corretor do Firestore:', err);
    throw new Error(err?.message || 'Falha ao excluir corretor.');
  }
}

// ==========================================
// PROPRIETÁRIOS (OWNERS) MANAGEMENT SERVICES
// ==========================================
const OWNERS_COLLECTION = 'owners';

export const INITIAL_OWNERS: PropertyOwner[] = [
  {
    id: 'prop-roberto',
    name: 'Dr. Roberto Silveira da Cunha',
    phone: '+55 (41) 99123-4567',
    email: 'roberto.cunha@silveiraadvogados.com.br',
    document: '184.920.489-02 (CPF)',
    bankDetails: 'Banco Itaú (341) Ag: 0084 CC: 39482-1 | PIX: 41991234567',
    minNegotiationValue: 'R$ 7.500.000',
    notes: 'Imóvel com documentação 100% desembaraçada. Proprietário aceita permuta de até 20% em apartamento no Batel.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop-santateresa',
    name: 'Inversiones y Desarrollos Santa Teresa S.A.',
    phone: '+595 981 445 220',
    email: 'directorio@santateresainversiones.com.py',
    document: 'RUC 80094820-4',
    bankDetails: 'Banco Itaú Paraguay | Cta Corriente USD 984029482',
    minNegotiationValue: 'US$ 600.000',
    notes: 'Laje corporativa desocupada. Ideal para empresas sob regime Maquila em Asunción.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop-batel',
    name: 'Grupo Patrimonial Batel Participações Ltda',
    phone: '+55 (41) 98844-1100',
    email: 'gestao@batelparticipacoes.com.br',
    document: '04.829.194/0001-44 (CNPJ)',
    bankDetails: 'Banco Bradesco (237) Ag: 1202 CC: 88291-0',
    minNegotiationValue: 'R$ 35.000/mês para contrato mínimo de 36 meses',
    notes: 'Exige seguro fiança locatícia Porto Seguro ou fiança bancária.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop-brickell',
    name: 'Brickell Bay Investments LLC (Florida)',
    phone: '+1 (786) 405-9240',
    email: 'investments@brickellbayfl.com',
    document: 'EIN / Tax ID 84-2940291',
    bankDetails: 'JPMorgan Chase Bank, Miami Brickell Branch | Wire Routing: 021000021',
    minNegotiationValue: 'US$ 1.390.000 à vista',
    notes: 'Unidade quitada sem hipoteca (free and clear). Fechamento via Title Company em Miami com escrow.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop-lakenona',
    name: 'Lake Nona Holdings Group Inc.',
    phone: '+1 (407) 829-4100',
    email: 'closing@lakenonagroup.com',
    document: 'EIN 59-3829104',
    bankDetails: 'Bank of America | Orlando Orange Ave Branch',
    minNegotiationValue: 'US$ 2.250.000',
    notes: 'Mansão de veraneio de alto padrão com licença para short-term rental ativa.',
    createdAt: new Date().toISOString(),
  },
];

export async function fetchOwners(): Promise<PropertyOwner[]> {
  try {
    const colRef = collection(db, OWNERS_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      await seedInitialOwners();
      return INITIAL_OWNERS;
    }

    const list: PropertyOwner[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error fetching owners from Firestore:', err);
    return INITIAL_OWNERS;
  }
}

async function seedInitialOwners() {
  try {
    for (const owner of INITIAL_OWNERS) {
      const docRef = doc(db, OWNERS_COLLECTION, owner.id);
      await setDoc(docRef, owner);
    }
  } catch (err) {
    console.error('Error seeding initial owners:', err);
  }
}

export function subscribeToOwners(callback: (owners: PropertyOwner[]) => void) {
  const colRef = collection(db, OWNERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_OWNERS);
        return;
      }
      const list: PropertyOwner[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list.sort((a, b) => a.name.localeCompare(b.name)));
    },
    (err) => {
      console.error('Firestore owners snapshot error:', err);
      callback(INITIAL_OWNERS);
    }
  );
}

export async function saveOwner(owner: PropertyOwner): Promise<void> {
  try {
    const ownerId = owner.id || `prop-${Date.now()}`;
    const docRef = doc(db, OWNERS_COLLECTION, ownerId);
    const payload: PropertyOwner = {
      id: ownerId,
      name: (owner.name || '').trim(),
      phone: (owner.phone || '').trim(),
      email: (owner.email || '').trim(),
      document: (owner.document || '').trim(),
      bankDetails: (owner.bankDetails || '').trim(),
      minNegotiationValue: (owner.minNegotiationValue || '').trim(),
      notes: (owner.notes || '').trim(),
      updatedAt: new Date().toISOString(),
      createdAt: owner.createdAt || new Date().toISOString(),
    };

    // Filter out undefined values
    const cleanedPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(payload)) {
      if (val !== undefined) cleanedPayload[key] = val;
    }

    await setDoc(docRef, cleanedPayload, { merge: true });
  } catch (err: any) {
    console.error('Erro ao salvar proprietário no Firestore:', err);
    throw new Error(err?.message || 'Falha ao salvar proprietário.');
  }
}

export async function deleteOwner(ownerId: string): Promise<void> {
  try {
    const docRef = doc(db, OWNERS_COLLECTION, ownerId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error('Erro ao excluir proprietário do Firestore:', err);
    throw new Error(err?.message || 'Falha ao excluir proprietário.');
  }
}

// -------------------------------------------------------------
// CONDOMÍNIOS / EDIFÍCIOS REGISTRATION & PERSISTENCE
// -------------------------------------------------------------
const CONDOMINIUMS_COLLECTION = 'condominiums';

export const INITIAL_CONDOMINIUMS: Condominium[] = [
  {
    id: 'condo-01',
    name: 'Edifício Maison Batel Platinum',
    condoFee: 'R$ 2.450 / mês',
    address: 'Av. Desembargador Motta, 1420',
    neighborhood: 'Batel',
    city: 'Curitiba',
    stateOrDept: 'PR',
    country: 'Brasil',
    zipCode: '80420-190',
    amenities: ['Portaria Blindada 24h', 'Piscina Aquecida Coberta', 'Academia Technogym', 'Espaço Gourmet', 'Elevador Privativo'],
    notes: 'Zelador Sr. Ademir (41 99888-1122). Mudanças apenas em dias úteis das 9h às 17h. Acesso para visitas com pré-aviso de 1h na portaria.',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'condo-02',
    name: 'Residencial Villa Jardins Ecoville',
    condoFee: 'R$ 1.680 / mês',
    address: 'Rua Professor Pedro Viriato Parigot de Souza, 2800',
    neighborhood: 'Ecoville (Mossunguê)',
    city: 'Curitiba',
    stateOrDept: 'PR',
    country: 'Brasil',
    zipCode: '81200-100',
    amenities: ['Bosque Privativo Preservado', 'Quadra de Tênis Saibro', 'Piscina Externa com Borda Infinita', 'Sauna Seca e Úmida', 'Pet Place'],
    notes: 'Administradora Apolar. Taxa inclui consumo de água do condomínio e manutenção do bosque.',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'condo-03',
    name: 'Torre Corporativa Santa Teresa',
    condoFee: 'US$ 420 / mês',
    address: 'Avenida Santa Teresa, 2450',
    neighborhood: 'Santa Teresa / Ycuá Satí',
    city: 'Asunción',
    stateOrDept: 'Distrito Capital',
    country: 'Paraguai',
    zipCode: '1820',
    amenities: ['Heliponto Homologado', 'Lobby com Controle Biométrico', 'Salas de Reunião Corporativas', 'Segurança 24h Armada', 'Gerador Full'],
    notes: 'Complexo empresarial triple A. Portaria com cadastro de documento internacional (RG ou Passaporte).',
    createdAt: '2026-02-01T09:30:00Z',
    updatedAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'condo-04',
    name: 'Brickell Flatiron Luxury Residences',
    condoFee: 'US$ 1.850 / mês',
    address: '1000 Brickell Plaza',
    neighborhood: 'Brickell Financial District',
    city: 'Miami',
    stateOrDept: 'FL',
    country: 'Estados Unidos',
    zipCode: '33131',
    amenities: ['Sky Club 64th Floor', 'Rooftop Pool 360°', 'Spa & Fitness Center', 'Serviço de Concierge 24/7', 'Valet Parking'],
    notes: 'Taxa de condomínio (HOA) cobre internet de alta velocidade, seguro predial e acesso irrestrito às áreas sociais.',
    createdAt: '2026-02-10T14:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'condo-05',
    name: 'Condomínio Alphaville Graciosa Residencial',
    condoFee: 'R$ 1.350 / mês',
    address: 'Estrada da Graciosa, 800',
    neighborhood: 'Alphaville Graciosa',
    city: 'Pinhais',
    stateOrDept: 'PR',
    country: 'Brasil',
    zipCode: '83321-000',
    amenities: ['Campo de Golfe Oficial 18 Buracos', 'Clube Completo', 'Monitoramento por Câmeras e Drones', 'Rondas Motorizadas 24h'],
    notes: 'Acesso pela Portaria Principal Graciosa. Prestadores de serviço devem portar crachá fornecido pela associação.',
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
];

export async function fetchCondominiums(): Promise<Condominium[]> {
  try {
    const colRef = collection(db, CONDOMINIUMS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedInitialCondominiums();
      return INITIAL_CONDOMINIUMS;
    }
    const list: Condominium[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error fetching condominiums from Firestore:', err);
    return INITIAL_CONDOMINIUMS;
  }
}

async function seedInitialCondominiums() {
  try {
    for (const condo of INITIAL_CONDOMINIUMS) {
      const docRef = doc(db, CONDOMINIUMS_COLLECTION, condo.id);
      await setDoc(docRef, condo);
    }
  } catch (err) {
    console.error('Error seeding initial condominiums:', err);
  }
}

export function subscribeToCondominiums(callback: (condos: Condominium[]) => void) {
  const colRef = collection(db, CONDOMINIUMS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_CONDOMINIUMS);
        return;
      }
      const list: Condominium[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      callback(list.sort((a, b) => a.name.localeCompare(b.name)));
    },
    (err) => {
      console.error('Firestore condominiums snapshot error:', err);
      callback(INITIAL_CONDOMINIUMS);
    }
  );
}

export async function saveCondominium(condo: Condominium): Promise<void> {
  try {
    const condoId = condo.id || `condo-${Date.now()}`;
    const docRef = doc(db, CONDOMINIUMS_COLLECTION, condoId);
    const payload: Condominium = {
      id: condoId,
      name: (condo.name || '').trim(),
      condoFee: (condo.condoFee || '').trim(),
      address: (condo.address || '').trim(),
      neighborhood: (condo.neighborhood || '').trim(),
      city: (condo.city || '').trim(),
      stateOrDept: (condo.stateOrDept || '').trim(),
      country: condo.country || 'Brasil',
      zipCode: (condo.zipCode || '').trim(),
      amenities: Array.isArray(condo.amenities) ? condo.amenities.filter(Boolean) : [],
      notes: (condo.notes || '').trim(),
      updatedAt: new Date().toISOString(),
      createdAt: condo.createdAt || new Date().toISOString(),
    };

    // Filter out undefined values
    const cleanedPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(payload)) {
      if (val !== undefined) cleanedPayload[key] = val;
    }

    await setDoc(docRef, cleanedPayload, { merge: true });
  } catch (err: any) {
    console.error('Erro ao salvar condomínio no Firestore:', err);
    throw new Error(err?.message || 'Falha ao salvar condomínio.');
  }
}

export async function deleteCondominium(condoId: string): Promise<void> {
  try {
    const docRef = doc(db, CONDOMINIUMS_COLLECTION, condoId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error('Erro ao excluir condomínio do Firestore:', err);
    throw new Error(err?.message || 'Falha ao excluir condomínio.');
  }
}

// ==========================================
// SEGMENTOS DA PÁGINA INICIAL (SHOWCASE 01 & 02)
// ==========================================

const HOMEPAGE_SEGMENTS_COLLECTION = 'homepage_segments';
const SHOWCASE_DOC_ID = 'showcase';

export async function fetchHomepageSegments(): Promise<HomepageSegmentsConfig> {
  try {
    const docRef = doc(db, HOMEPAGE_SEGMENTS_COLLECTION, SHOWCASE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      return {
        headerTag: data.headerTag || INITIAL_HOMEPAGE_SEGMENTS.headerTag,
        headerTitle: data.headerTitle || INITIAL_HOMEPAGE_SEGMENTS.headerTitle,
        headerDescription: data.headerDescription || INITIAL_HOMEPAGE_SEGMENTS.headerDescription,
        segment1: {
          ...INITIAL_HOMEPAGE_SEGMENTS.segment1,
          ...(data.segment1 || {}),
          items: Array.isArray(data.segment1?.items) ? data.segment1.items : (INITIAL_HOMEPAGE_SEGMENTS.segment1.items || []),
        },
        segment2: {
          ...INITIAL_HOMEPAGE_SEGMENTS.segment2,
          ...(data.segment2 || {}),
          items: Array.isArray(data.segment2?.items) ? data.segment2.items : (INITIAL_HOMEPAGE_SEGMENTS.segment2.items || []),
        },
        customSegments: Array.isArray(data.customSegments) ? data.customSegments : [],
        updatedAt: data.updatedAt,
      };
    }
    return INITIAL_HOMEPAGE_SEGMENTS;
  } catch (err) {
    console.warn('Erro ao carregar segmentos da página inicial do Firestore, usando padrão:', err);
    return INITIAL_HOMEPAGE_SEGMENTS;
  }
}

export function subscribeToHomepageSegments(callback: (config: HomepageSegmentsConfig) => void): () => void {
  const docRef = doc(db, HOMEPAGE_SEGMENTS_COLLECTION, SHOWCASE_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        callback({
          headerTag: data.headerTag || INITIAL_HOMEPAGE_SEGMENTS.headerTag,
          headerTitle: data.headerTitle || INITIAL_HOMEPAGE_SEGMENTS.headerTitle,
          headerDescription: data.headerDescription || INITIAL_HOMEPAGE_SEGMENTS.headerDescription,
          segment1: {
            ...INITIAL_HOMEPAGE_SEGMENTS.segment1,
            ...(data.segment1 || {}),
            items: Array.isArray(data.segment1?.items) ? data.segment1.items : (INITIAL_HOMEPAGE_SEGMENTS.segment1.items || []),
          },
          segment2: {
            ...INITIAL_HOMEPAGE_SEGMENTS.segment2,
            ...(data.segment2 || {}),
            items: Array.isArray(data.segment2?.items) ? data.segment2.items : (INITIAL_HOMEPAGE_SEGMENTS.segment2.items || []),
          },
          customSegments: Array.isArray(data.customSegments) ? data.customSegments : [],
          updatedAt: data.updatedAt,
        });
      } else {
        callback(INITIAL_HOMEPAGE_SEGMENTS);
      }
    },
    (err) => {
      console.warn('Snapshot error para segmentos da página inicial, usando padrão:', err);
      callback(INITIAL_HOMEPAGE_SEGMENTS);
    }
  );
}

export async function saveHomepageSegments(config: HomepageSegmentsConfig): Promise<void> {
  try {
    const docRef = doc(db, HOMEPAGE_SEGMENTS_COLLECTION, SHOWCASE_DOC_ID);
    const payload = {
      title: config.headerTitle || 'Segmentos de Atuação Especializada',
      imageUrl: config.segment1.imageUrl || INITIAL_HOMEPAGE_SEGMENTS.segment1.imageUrl,
      headerTag: config.headerTag || '',
      headerTitle: config.headerTitle || '',
      headerDescription: config.headerDescription || '',
      segment1: {
        id: 'segment_01',
        segmentTag: config.segment1.segmentTag || 'SEGMENTO 01',
        title: config.segment1.title || '',
        badge: config.segment1.badge || '',
        imageUrl: config.segment1.imageUrl || '',
        imageBadge: config.segment1.imageBadge || '',
        description: config.segment1.description || '',
        features: Array.isArray(config.segment1.features) ? config.segment1.features : [],
        items: Array.isArray(config.segment1.items) ? config.segment1.items : [],
        ctaText: config.segment1.ctaText || '',
        category: config.segment1.category || 'residencial',
        footerLabel: config.segment1.footerLabel || '',
        techEffect: config.segment1.techEffect || 'holo-gold',
      },
      segment2: {
        id: 'segment_02',
        segmentTag: config.segment2.segmentTag || 'SEGMENTO 02',
        title: config.segment2.title || '',
        badge: config.segment2.badge || '',
        imageUrl: config.segment2.imageUrl || '',
        imageBadge: config.segment2.imageBadge || '',
        description: config.segment2.description || '',
        features: Array.isArray(config.segment2.features) ? config.segment2.features : [],
        items: Array.isArray(config.segment2.items) ? config.segment2.items : [],
        ctaText: config.segment2.ctaText || '',
        category: config.segment2.category || 'comercial',
        footerLabel: config.segment2.footerLabel || '',
        techEffect: config.segment2.techEffect || 'cyber-lidar',
      },
      customSegments: Array.isArray(config.customSegments) ? config.customSegments : [],
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err: any) {
    console.error('Erro ao salvar segmentos no Firestore:', err);
    throw new Error(err?.message || 'Falha ao salvar segmentos da página inicial.');
  }
}

// ==========================================
// EQUIPE BRATU IMOBILIÁRIA & ADMINISTRADORA LTDA
// ==========================================

const TEAM_MEMBERS_COLLECTION = 'team_members';
const TEAM_LOCAL_STORAGE_KEY = 'bratu_team_members_cache';

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const q = query(collection(db, TEAM_MEMBERS_COLLECTION), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<TeamMember, 'id'>),
      }));
      try {
        localStorage.setItem(TEAM_LOCAL_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        // ignore storage quota
      }
      return list;
    }

    // Fallback to initial team members if Firestore collection is empty
    return INITIAL_TEAM_MEMBERS;
  } catch (err) {
    console.warn('Erro ao buscar equipe do Firestore, tentando cache local:', err);
    try {
      const cached = localStorage.getItem(TEAM_LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_TEAM_MEMBERS;
  }
}

export function subscribeToTeamMembers(callback: (members: TeamMember[]) => void): () => void {
  const colRef = collection(db, TEAM_MEMBERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TeamMember, 'id'>),
        }));
        list.sort((a, b) => (a.order || 99) - (b.order || 99));
        try {
          localStorage.setItem(TEAM_LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
          // ignore
        }
        callback(list);
      } else {
        callback(INITIAL_TEAM_MEMBERS);
      }
    },
    (err) => {
      console.warn('Snapshot error para equipe Bratu, usando padrão/cache:', err);
      try {
        const cached = localStorage.getItem(TEAM_LOCAL_STORAGE_KEY);
        if (cached) {
          callback(JSON.parse(cached));
          return;
        }
      } catch (e) {
        // ignore
      }
      callback(INITIAL_TEAM_MEMBERS);
    }
  );
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  try {
    const cleanId = (member.id || `member_${Date.now()}`).trim();
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, cleanId);

    const payload: Partial<TeamMember> = {
      name: member.name.trim(),
      role: member.role.trim(),
      department: (member.department || 'Diretoria Executiva').trim(),
      photoUrl: member.photoUrl || '',
      creci: (member.creci || '').trim(),
      phone: (member.phone || '').trim(),
      email: (member.email || '').trim(),
      bio: (member.bio || '').trim(),
      order: typeof member.order === 'number' ? member.order : 99,
      active: member.active !== false,
      updatedAt: new Date().toISOString(),
      createdAt: member.createdAt || new Date().toISOString(),
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (err: any) {
    console.error('Erro ao salvar membro da equipe:', err);
    throw new Error(err?.message || 'Falha ao salvar membro da equipe no Firestore.');
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error('Erro ao excluir membro da equipe:', err);
    throw new Error(err?.message || 'Falha ao excluir membro da equipe no Firestore.');
  }
}

// =========================================================================
// GOOGLE REVIEWS CONFIGURATION & DIRECT CLIENT DISPATCH PERSISTENCE
// =========================================================================
const SETTINGS_COLLECTION = 'settings';
const GOOGLE_REVIEW_DOC_ID = 'google_review';
const GOOGLE_REVIEW_LOCAL_STORAGE_KEY = 'bratu_google_review_config_cache';

export async function fetchGoogleReviewConfig(): Promise<GoogleReviewConfig> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GOOGLE_REVIEW_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GoogleReviewConfig;
      const merged: GoogleReviewConfig = {
        ...INITIAL_GOOGLE_REVIEW_CONFIG,
        ...data,
        templates: data.templates && data.templates.length > 0 ? data.templates : INITIAL_GOOGLE_REVIEW_CONFIG.templates,
      };
      try {
        localStorage.setItem(GOOGLE_REVIEW_LOCAL_STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore
      }
      return merged;
    }
  } catch (err) {
    console.warn('Erro ao carregar configurações do Google Review do Firestore, tentando cache local:', err);
  }

  try {
    const cached = localStorage.getItem(GOOGLE_REVIEW_LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore
  }

  return INITIAL_GOOGLE_REVIEW_CONFIG;
}

export async function saveGoogleReviewConfig(config: GoogleReviewConfig): Promise<void> {
  const payload: GoogleReviewConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GOOGLE_REVIEW_DOC_ID);
    await setDoc(docRef, payload, { merge: true });
    try {
      localStorage.setItem(GOOGLE_REVIEW_LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  } catch (err: any) {
    console.error('Erro ao persistir configurações do Google Review no Firestore:', err);
    // Persist in localStorage regardless so client never loses changes
    try {
      localStorage.setItem(GOOGLE_REVIEW_LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
    throw new Error(err?.message || 'Falha ao sincronizar com Firestore, salvo localmente.');
  }
}

export function subscribeToGoogleReviewConfig(
  callback: (config: GoogleReviewConfig) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, GOOGLE_REVIEW_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GoogleReviewConfig;
        const merged: GoogleReviewConfig = {
          ...INITIAL_GOOGLE_REVIEW_CONFIG,
          ...data,
          templates: data.templates && data.templates.length > 0 ? data.templates : INITIAL_GOOGLE_REVIEW_CONFIG.templates,
        };
        try {
          localStorage.setItem(GOOGLE_REVIEW_LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {
          // ignore
        }
        callback(merged);
      } else {
        callback(INITIAL_GOOGLE_REVIEW_CONFIG);
      }
    },
    (err) => {
      console.warn('Snapshot error para Google Review config, usando cache local:', err);
      try {
        const cached = localStorage.getItem(GOOGLE_REVIEW_LOCAL_STORAGE_KEY);
        if (cached) {
          callback(JSON.parse(cached));
          return;
        }
      } catch (e) {
        // ignore
      }
      callback(INITIAL_GOOGLE_REVIEW_CONFIG);
    }
  );
}
