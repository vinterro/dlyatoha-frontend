import { User } from '../user';
import { Reaction } from '../reactions/reaction';
import { Disreaction } from '../disreactions/disreaction';

export interface Comment {
    id: number;
    createdAt: Date;
    author: User;
    body: string;
    reactions: Reaction[];
    disreactions: Disreaction[];
}
