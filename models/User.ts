import { UserStatus } from '../utils/constants';

export class User {
    id: bigint = 0n;
    username: string = '';
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';
    phone: string = '';
    userStatus: UserStatus = UserStatus.Stat1;
}