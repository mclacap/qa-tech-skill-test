import axios from 'axios';
import { User } from '../../models/User';
import { MULTIPLE_USERS_END_POINT, USER_END_POINT, USER_LOGIN_END_POINT, USER_LOGOUT_END_POINT, UserStatus } from '../../utils/constants';
import JSONbigint from 'json-bigint';
import { ApiResponse } from '../../models/ApiResponse';

describe('User API Tests', () => {
    let newUserIdStr: string;
    const newUser: User = {
        id: 0n,
        username: 'qa-mercari-test',
        firstName: 'QA',
        lastName: 'Mercari',
        email: 'user@user.com',    
        password: 'qamercaripass',
        phone: '1234567890',
        userStatus: UserStatus.Stat1
    };

    async function createUser(user: User): Promise<ApiResponse> {
        const userResponse = await axios.post(USER_END_POINT, JSONbigint.stringify(user), 
            {
               headers: { "Content-Type": 'application/json' },
               transformResponse: [data  => data]
            });
        expect(userResponse.status).toBe(200);
        return JSONbigint.parse(userResponse.data);
    }

    beforeAll(async () => {
        newUserIdStr = (await createUser(newUser)).message;
    });

    test('Can create a single user', async () => {
        const testUser: User = {
            id: 0n,
            username: 'qamercaritest',
            firstName: 'QA',
            lastName: 'Mercari',
            email: 'user@user.com',    
            password: 'qamercaripass',
            phone: '1234567890',
            userStatus: UserStatus.Stat2
        };

        const userResponseData = await createUser(testUser);
        expect(userResponseData.message).not.toBe('0'); // ID should update
    });

    test('Can create multiple users', async () => {
        const testUser: User = {
            id: 0n,
            username: 'user',
            firstName: 'QA',
            lastName: 'Mercari',
            email: 'user@user.com',    
            password: 'qamercaripass',
            phone: '1234567890',
            userStatus: UserStatus.Stat1
        };
        const testUser2: User = {
            id: 0n,
            username: 'user2',
            firstName: 'QA',
            lastName: 'Mercari',
            email: 'user@user.com',    
            password: 'qamercaripass',
            phone: '1234567890',
            userStatus: UserStatus.Stat2
        };

        const listUsers: User[] = [];
        listUsers.push(testUser);
        listUsers.push(testUser2);

        const userResponse = await axios.post(MULTIPLE_USERS_END_POINT, JSONbigint.stringify(listUsers),
            {
               headers: { "Content-Type": 'application/json' },
               transformResponse: [data  => data]
            });
        expect(userResponse.status).toBe(200);
    });

    test('Can get user by username', async () => {
        const userResponse = await axios.get(USER_END_POINT + `/${newUser.username}`, 
            {
               headers: { "Content-Type": 'application/json' },
               transformResponse: [data  => data]
            });
        const userResponseData = JSONbigint.parse(userResponse.data);
        expect(userResponse.status).toBe(200);
        expect(userResponseData.id.toString()).toBe(newUserIdStr);
        expect(userResponseData.username).toBe(newUser.username);
        expect(userResponseData.firstName).toBe(newUser.firstName);
        expect(userResponseData.lastName).toBe(newUser.lastName);
        expect(userResponseData.email).toBe(newUser.email);
        expect(userResponseData.password).toBe(newUser.password);
        expect(userResponseData.phone).toBe(newUser.phone);
        expect(userResponseData.userStatus).toBe(newUser.userStatus);
    });

    test('Can catch Not Found (404) error on retrieving a user', async () => {
        const username = 'unknown-user';
        try {
            await axios.get(USER_END_POINT + `/${username}`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    test('Can log into the system', async () => {
        const response = await axios.get(USER_LOGIN_END_POINT, 
            { params: { username: 'string', password: 'string' } });
        expect(response.status).toBe(200);
        expect(response.headers).toHaveProperty('x-expires-after');
        expect(response.headers).toHaveProperty('x-rate-limit');
    });

    test('Can catch Invalid (400) error when logging-in using incorrect credentials', async () => {
        try {
            await axios.get(USER_LOGIN_END_POINT, 
                { params: { username: newUser.username, password: 'incorrect' } });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    });

    test('Can log out from the system', async () => {
        const response = await axios.get(USER_LOGOUT_END_POINT);
        expect(response.status).toBe(200);
    });
});