export interface UserDTO {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly userRole: string;
  readonly orgUnitId: string;
  readonly featureIds: string[];
}

export interface UsersDTO {
  readonly users: UserDTO[];
}
