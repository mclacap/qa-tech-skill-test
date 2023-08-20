import axios from 'axios';
import { FIND_BY_STATUS_END_POINT, PET_END_POINT, PetStatus } from '../../utils/constants';
import { Pet } from '../../models/Pet';
import JSONbigint from 'json-bigint';
import { PetTag } from '../../models/PetTag';

describe('Pet API Tests', () => {
    let petIdStr: string;
    const newPet: Pet = {
        id: 0n,
        category: {
            id: 0,
            name: 'Love Birds'
        },
        name: 'Beaky',
        photoUrls: [
            'sample'
        ],
        tags: [
        {
            id: 0,
            name: 'Small Pets'
        }
        ],
        status: PetStatus.Available
    }

    async function addNewPet(): Promise<Pet> {
        const addPetResp = await axios.post(PET_END_POINT, JSONbigint.stringify(newPet),
            {
               headers: { "Content-Type": 'application/json' },
               transformResponse: [data  => data]
            });
        expect(addPetResp.status).toBe(200);
        return JSONbigint.parse(addPetResp.data);  
    };

    async function getPetData(id: string): Promise<Pet> {
        const findPetResp = await axios.get(PET_END_POINT + `/${id}`,
            { transformResponse: [data => data]}
        );
        expect(findPetResp.status).toBe(200);
        return JSONbigint.parse(findPetResp.data); 
    };

    beforeAll(async () => {
        // Get existing data to be used in this spec file
        const findStatusResp = await axios.get(FIND_BY_STATUS_END_POINT + `/?status=available&status=pending`,
            { transformResponse: [data  => data] });
        const availablePets: Pet[] = JSON.parse(findStatusResp.data);        
        expect(findStatusResp.status).toBe(200);

        petIdStr = availablePets[0].id.toString();
    });

    test('Can add a pet and find that newly added pet using the pet ID', async () => {
        // Add a new pet
        const addPetRespData = await addNewPet();
        expect(addPetRespData.id.toString()).not.toEqual('0');
        expect(addPetRespData.category).toEqual(newPet.category);
        expect(addPetRespData.name).toBe(newPet.name);
        expect(addPetRespData.photoUrls).toEqual(newPet.photoUrls);
        expect(addPetRespData.tags).toEqual(newPet.tags);
        expect(addPetRespData.status).toBe(newPet.status);

        // Verify that we can find the new pet
        const findPetResp = await axios.get(PET_END_POINT + `/${addPetRespData.id.toString()}`);
        expect(findPetResp.status).toBe(200);
    });

    test('Can update the pet information of pets named “kurikuri” under category “Pomeranian” to add the tag “Super Cute”', async () => {
        // Note: This test assumes that a pet named “kurikuri” with category “Pomeranian” exists
        const nameFilter = 'kurikuri';
        const categoryFilter = 'Pomeranian';
        const newTagName = 'Super Cute';

        // Find available pets with the given Pet information
        const findStatusResp = await axios.get(FIND_BY_STATUS_END_POINT, { params: { status: 'available' } });
        expect(findStatusResp.status).toBe(200);
        expect(findStatusResp.data.length).toBeGreaterThanOrEqual(1);

        const availablePets: Pet[] = findStatusResp.data;
        const filteredPet: Pet = availablePets.filter(x => x.name == nameFilter && x.category.name == categoryFilter)[0];
        expect(filteredPet).not.toEqual(undefined);

        // Update information of a pet from the filtered pets
        const newTag: PetTag = { id: 0, name: newTagName };
        filteredPet.tags.push(newTag)
        const updateResp = await axios.put(PET_END_POINT, filteredPet);
        expect(updateResp.status).toBe(200);
        expect(updateResp.data).toEqual(filteredPet);

        // Find pet and check if new tag is added
        const findPetRespData = await getPetData(filteredPet.id.toString());
        expect(findPetRespData.tags).toEqual(filteredPet.tags);
    });

    test('Can find pets using one status', async () => {
        const status = 'available';

        const response = await axios.get(FIND_BY_STATUS_END_POINT, { params: { status: status } });
        expect(response.status).toBe(200);
        
        // Count retrieved pets with "available" status
        const count = response.data.filter((x: Pet) => x.status == PetStatus.Available).length;
        expect(count).toBe(response.data.length);
    });

    test('Can find pets using multiple status', async () => {
        const status1 = 'pending';
        const status2 = 'sold';

        const response = await axios.get(FIND_BY_STATUS_END_POINT + `/?status=${status1}&status=${status2}`);
        expect(response.status).toBe(200);
        
        // Count retrieved pets with "pending" and "sold" status
        const availableCount = response.data.filter((x: Pet) => x.status == PetStatus.Available).length;
        const pendingCount = response.data.filter((x: Pet) => x.status == PetStatus.Pending).length;
        const soldCount = response.data.filter((x: Pet) => x.status == PetStatus.Sold).length;
        expect(pendingCount + soldCount).toBe(response.data.length);
        expect(availableCount).toBe(0);
    });

    test('Can catch Invalid ID (400) error on searching pets using invalid status', async () => {
        const status = 'invalidStatus';

        try {
            await axios.get(FIND_BY_STATUS_END_POINT, { params: { status: status } });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    });

    test('Can update a pet using Form Data', async () => {
        const updatedName = 'Tokyo Marie';
        const updatedStatus = PetStatus.Sold;
        
        // Update pet's info
        const updatePetResp = await axios.post(PET_END_POINT + `/${petIdStr}`, 
            {
                name: updatedName,
                status: updatedStatus
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        expect(updatePetResp.status).toBe(200);
        expect(updatePetResp.data.message).toBe(petIdStr);

        // Verify if the pet's info are updated
        const findPetRespData = await getPetData(petIdStr);
        expect(findPetRespData.id.toString()).toBe(petIdStr);
        expect(findPetRespData.name).toBe(updatedName);
        expect(findPetRespData.status).toBe(updatedStatus);
    });

    test('Can delete a newly added pet and confirm that pet is deleted and could not be updated', async () => {
        // Add a new pet
        const addPetRespData = await addNewPet();
        const petId = addPetRespData.id.toString();

        // Delete newly added pet
        const response = await axios.delete(PET_END_POINT + `/${petId}`);
        expect(response.status).toBe(200);
        expect(response.data.message).toBe(petId);

        // Confirm pet deletion
        try {
            await axios.get(PET_END_POINT + `/${petId}`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }

        // Confirm that we can't update deleted pet 
        try {
            await axios.put(PET_END_POINT, JSONbigint.stringify(newPet),
                {
                headers: { "Content-Type": 'application/json' },
                transformResponse: [data  => data]
                });
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    test(`Can't add a pet using existing ID`, async () => {
        // Get a pet and try to add using the same ID
        const petData = await getPetData(petIdStr);
        const origStatus = petData.status;
        petData.status = PetStatus.Pending;
        
        const addPetResp = await axios.post(PET_END_POINT, JSONbigint.stringify(petData),
            {
               headers: { "Content-Type": 'application/json' },
               transformResponse: [data  => data]
            });
        expect(addPetResp.status).toBe(200);
        const addPetData = JSONbigint.parse(addPetResp.data); 

        // Confirm that data is not updated
        expect(addPetData.status).toBe(origStatus);
    });
});