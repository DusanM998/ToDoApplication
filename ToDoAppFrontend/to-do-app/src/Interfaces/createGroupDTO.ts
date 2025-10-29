export interface CreateGroupDTO {
  name: string;
  members: string[]; // moze biti ID ili email
}