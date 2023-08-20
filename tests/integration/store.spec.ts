import axios from 'axios';
import { Order } from '../../models/Order';
import { Pet } from '../../models/Pet';
import { FIND_BY_STATUS_END_POINT, INVENTORY_END_POINT, ORDER_END_POINT, OrderStatus, PetStatus } from '../../utils/constants';
import JSONbigint from 'json-bigint';

describe('Store API Integration Tests', () => {
    async function findAvailablePets() : Promise<Pet[]> {
        const findResponse = await axios.get(FIND_BY_STATUS_END_POINT, 
            { 
                params: { status: 'available' },
               transformResponse: [data  => data]
            });
        expect(findResponse.status).toBe(200);
        return JSON.parse(findResponse.data); 
    }

    async function placeOrder(order: Order): Promise<Order> {
        const orderResp = await axios.post(ORDER_END_POINT, JSONbigint.stringify(order),
            {
               headers: { "Content-Type": 'application/json' },
               transformResponse: [data  => data]
            });
        expect(orderResp.status).toBe(200);
        return JSONbigint.parse(orderResp.data);
    }

    async function getOrder(orderId: string): Promise<Order> {
        const orderResp = await axios.get(ORDER_END_POINT + `/${orderId}`,
            { transformResponse: [data  => data] });
        expect(orderResp.status).toBe(200);
        return JSON.parse(orderResp.data);
    }

    test('Can check available pets named “pupo” with category name “pajaro” and place an order for a pet', async () => {
        // Note: This test assumes that "pupo" with category "pajaro" exists
        // To reduce possible flakiness, add creating of specific Pet on setup
        const nameFilter = 'pupo';
        const categoryFilter = 'pajaro';
    
        // Find available pets with the given Pet information
        const availablePets: Pet[] = await findAvailablePets();
        expect(availablePets.length).toBeGreaterThanOrEqual(1);
    
        const filteredPet: Pet = availablePets.filter(x => x.name == nameFilter && x.category.name == categoryFilter)[0];
        expect(filteredPet).not.toEqual(undefined);
    
        // Place an order for a pet from the filtered pets
        const shipDate = new Date().toISOString();
        const order: Order = { id: 0n, petId: filteredPet.id, quantity: 1, shipDate: shipDate, status: OrderStatus.Placed, complete: true };
        const orderRespData = await placeOrder(order);
        expect(orderRespData.petId.toString()).toBe(filteredPet.id.toString());
    
        // Verify that the order is placed
        const findOrderRespData = await getOrder(orderRespData.id.toString());
        expect(findOrderRespData.petId).toEqual(filteredPet.id);
    });

    test('Can place an order on a pet named "Tokyo" with an attached photo and delete order after', async () => {
        // Note: This test assumes that "Tokyo" with photo exists
        // To reduce possible flakiness, add creating of specific Pet on setup
        const nameFilter = 'Tokyo';
    
        // Find available pets with the given Pet information
        const availablePets: Pet[] = await findAvailablePets();
        expect(availablePets.length).toBeGreaterThanOrEqual(1);
    
        const filteredPet: Pet = availablePets.filter(x => x.name == nameFilter && x.photoUrls.length > 0)[0];
        expect(filteredPet).not.toEqual(undefined);
    
        // Place an order for a pet from the filtered pets
        const order: Order = { id: 0n, petId: filteredPet.id, quantity: 1, shipDate: new Date().toISOString(), status: OrderStatus.Placed, complete: true };
        const orderRespData = await placeOrder(order);
        expect(orderRespData.petId.toString()).toBe(filteredPet.id.toString());
    
        // Verify that the order is placed
        const findOrderRespData = await getOrder(orderRespData.id.toString());
        expect(findOrderRespData.petId).toEqual(filteredPet.id);

        // Delete an order
        const response = await axios.delete(ORDER_END_POINT + `/${orderRespData.id}`);
        expect(response.status).toBe(200);
        expect(response.data.message).toBe(orderRespData.id.toString());

        // Verify that order does not exists anymore
        try {
            await axios.get(ORDER_END_POINT + `/${orderRespData.id}`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    test('Can retrieve pet inventories', async () => {
        const response = await axios.get(INVENTORY_END_POINT);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty(PetStatus.Available);
        expect(response.data).toHaveProperty(PetStatus.Pending);
        expect(response.data).toHaveProperty(PetStatus.Sold);
    });

    test('Can catch Invalid ID (400) error on deleting an order', async () => {
        const orderId = 'abcd';
        try {
            await axios.delete(ORDER_END_POINT + `/${orderId}`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    }); 

    test('Can catch Not Found (404) error on deleting an order', async () => {
        const orderId = 8;
        try {
            await axios.delete(ORDER_END_POINT + `/${orderId}`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    }); 

    test('Can catch Invalid ID (400) error on retrieving an order', async () => {
        const orderId = '11';
        try {
            await axios.get(ORDER_END_POINT + `/${orderId}`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    }); 
});