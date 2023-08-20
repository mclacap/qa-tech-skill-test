import { OrderStatus } from '../utils/constants';

export class Order {
    id: bigint = 0n;
    petId: bigint = 0n ;
    quantity: number = 0;
    shipDate: string = '';
    status: OrderStatus = OrderStatus.Approved;
    complete: boolean = true;
}