import type { GroupMember, GroupMessage } from ".";

export default interface Group {
  id: number;
  name: string;
  messages: GroupMessage[];
  members?: GroupMember[];
}
