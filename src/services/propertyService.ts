import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property, LeadSubmission } from '../types/property';
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

export async function saveProperty(property: Property): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, property.id);
  await setDoc(
    docRef,
    {
      ...property,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  await deleteDoc(docRef);
}

export async function updateProperty(propertyId: string, updates: Partial<Property>): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, propertyId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
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
