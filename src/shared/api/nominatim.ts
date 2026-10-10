export type ReverseAddress = {
  street: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  municipality?: string;
  village?: string;
  'ISO3166-2-lvl4'?: string;
  postcode?: string;
};

type NominatimResponse = {
  error?: string;
  address?: NominatimAddress;
};

export class NominatimError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NominatimError';
  }
}

function readState(address: NominatimAddress): string {
  const iso = address['ISO3166-2-lvl4'];
  const code = iso?.split('-').pop() ?? '';
  return /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : '';
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseAddress> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    lat: String(latitude),
    lon: String(longitude),
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);

  if (!response.ok) {
    throw new NominatimError('Não foi possível consultar o endereço');
  }

  const data = (await response.json()) as NominatimResponse;
  const address = data.address;
  const street = address?.road || address?.pedestrian || '';
  const city = address?.city || address?.town || address?.municipality || address?.village || '';

  if (data.error || !address || !street || !city) {
    throw new NominatimError('Não encontramos o endereço dessa localização');
  }

  return {
    street,
    streetNumber: address.house_number ?? '',
    neighborhood:
      address.suburb || address.neighbourhood || address.quarter || address.city_district || '',
    city,
    state: readState(address),
    cep: (address.postcode ?? '').replace(/\D/g, ''),
  };
}
