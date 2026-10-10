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
