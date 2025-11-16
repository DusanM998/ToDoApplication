export default interface GroupMessage {
  id: number;
  senderId: string;
  senderEmail: string;
  content: string;
  sendAt: string;  
  imageUrls?: string[];
}
