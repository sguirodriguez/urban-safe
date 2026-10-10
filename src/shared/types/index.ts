export type Role = {
  id: number;
  name: string;
  slug: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type RiskLevel = 'baixo' | 'medio' | 'alto';

export type Neighborhood = {
  id: number;
  name: string;
  city: string;
  state: string;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
};

export type EventStatus = 'pending' | 'confirmed' | 'expired' | 'removed';

export type AlertEvent = {
  id: string;
  userId: string | null;
  categoryId: number;
  neighborhoodId: number;
  status: EventStatus;
  description: string;
  street: string;
  streetNumber: string;
  cep: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmationType = 'confirmar' | 'denunciar';

export type EventConfirmation = {
  id: string;
  eventId: string;
  userId: string;
  type: ConfirmationType;
  createdAt: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};
