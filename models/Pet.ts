import { PetStatus } from '../utils/constants';
import { PetTag } from './PetTag';
import { PetCategory } from './PetCategory';

export class Pet {
    id: bigint = 0n;
    category: PetCategory = new PetCategory();
    name: string = '';
    photoUrls: string[] = [];
    tags: PetTag[] = [];
    status: PetStatus = PetStatus.Available;
}