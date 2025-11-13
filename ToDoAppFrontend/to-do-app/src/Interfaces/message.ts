export default interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sendAt: string; // string for DateTime serialization
  isRead: boolean;
  imageUrls?: string[] | string;
  sender: {
    id: string;
    email: string;
    name?: string;
  };
  receiver: {
    id: string;
    email: string;
    name?: string;
  };
}
