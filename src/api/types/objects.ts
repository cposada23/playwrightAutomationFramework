export type ObjectData = {
  year: number;
  price: number;
  "CPU model": string;
  "Hard disk size": string;
};

export type CreateObjectRequest = {
  name: string;
  data: ObjectData;
};

export type CreatedObjectResponse = {
  id: string;
  name: string;
  data: ObjectData;
  createdAt: string; // ISO date string
};

export type ObjectByIdResponse = {
  id: string;
  name: string;
  data: ObjectData;
};

export type UpdatedObjectResponse = {
  id: string;
  name: string;
  data: ObjectData;
  updatedAt: string; // ISO date string
};

export type DeletedObjectResponse = {
  message: string;
};
