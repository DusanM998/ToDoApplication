export default interface ConversationPartner {
  userId: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string;
  hasUnread: boolean;
  profileImageUrl?: string;
  totalMessages?: number;
}