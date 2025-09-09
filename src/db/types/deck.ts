import { Card } from "./card";

export type Deck = {
  id: number;
  name: string;
  description: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
};
