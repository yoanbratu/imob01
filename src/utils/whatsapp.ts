export const COMPANY_INFO = {
  name: 'Bratu Imobiliária e Administradora',
  phoneDisplay: '+55 21 98098-4243',
  phoneRaw: '5521980984243',
  phoneParaguay: '+595 983 500 200',
  phoneUSA: '+1 (786) 405-9240',
  email: 'Demy@Bratu.com.br',
  addressBrazil: 'Av. Cândido de Abreu, 526 - Centro Cívico, Curitiba - PR, Brasil',
  addressParaguay: 'Av. Santa Teresa esq. Aviadores del Chaco, Asunción, Paraguai',
  addressUSA: '1200 Brickell Ave, Suite 1950, Miami, FL 33131, Estados Unidos',
  creci: 'CRECI-PR J-08240 | Matrícula PY 45.290 | Florida RE Desk FL-USA',
  hours: 'Segunda a Sexta: 08:30 às 18:30 | Sábados com agendamento prévio',
};

export function getWhatsAppLink(message: string, rawPhone = COMPANY_INFO.phoneRaw): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${rawPhone}?text=${encoded}`;
}

export function getPropertyWhatsAppLink(propertyCode: string, propertyTitle: string, price: string): string {
  const msg = `Olá! Tenho interesse no imóvel "${propertyTitle}" (Cód: ${propertyCode}) no valor de ${price} que vi no site da Bratu Imobiliária. Gostaria de mais informações e verificar a disponibilidade para visita.`;
  return getWhatsAppLink(msg);
}

export function getListingWhatsAppLink(data: {
  ownerName: string;
  propertyType: string;
  city: string;
  purpose: string;
  details?: string;
}): string {
  const msg = `Olá, equipe Bratu! Meu nome é ${data.ownerName}. Gostaria de anunciar meu imóvel para ${data.purpose} (${data.propertyType} em ${data.city}). ${data.details ? `Observações: ${data.details}` : ''}`;
  return getWhatsAppLink(msg);
}

export function getComparisonWhatsAppLink(
  properties: { code: string; title: string; priceFormatted: string; city: string }[]
): string {
  const list = properties
    .map((p, i) => `${i + 1}. [${p.code}] ${p.title} - ${p.priceFormatted} (${p.city})`)
    .join('\n');
  const msg = `Olá, equipe Bratu Imobiliária! Estive comparando os seguintes imóveis no site da Bratu:\n\n${list}\n\nGostaria de uma orientação especializada sobre liquidez, valorização e agendar uma consultoria comparativa para me ajudar a escolher a melhor opção.`;
  return getWhatsAppLink(msg);
}
