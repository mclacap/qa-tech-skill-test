export const FIND_BY_STATUS_END_POINT = 'https://petstore.swagger.io/v2/pet/findByStatus';
export const PET_END_POINT = 'https://petstore.swagger.io/v2/pet';
export const ORDER_END_POINT = 'https://petstore.swagger.io/v2/store/order';
export const INVENTORY_END_POINT = 'https://petstore.swagger.io/v2/store/inventory';
export const USER_END_POINT = 'https://petstore.swagger.io/v2/user';
export const MULTIPLE_USERS_END_POINT = 'https://petstore.swagger.io/v2/user/createWithArray';
export const USER_LOGIN_END_POINT = 'https://petstore.swagger.io/v2/user/login';
export const USER_LOGOUT_END_POINT = 'https://petstore.swagger.io/v2/user/logout';

export enum PetStatus {
    Available = 'available',
    Pending = 'pending',
    Sold = 'sold'
}

export enum OrderStatus {
    Placed = 'placed',
    Approved = 'approved',
    Delivered = 'delivered'
}

// TODO: Update with correct status enum (Currently not indicated in Swagger Spec)
export enum UserStatus {
    Stat1 = 0,
    Stat2 = 1
}