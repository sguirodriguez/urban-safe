export type ViaCepAddress = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export class ViaCepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ViaCepError';
  }
}

export async function lookupCep(cep: string): Promise<ViaCepAddress> {
  const digits = cep.replace(/\D/g, '');
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!response.ok) {
    throw new ViaCepError('Não foi possível consultar o CEP');
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro || !data.localidade) {
    throw new ViaCepError('CEP não encontrado');
  }

  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade,
    state: data.uf ?? '',
  };
}
