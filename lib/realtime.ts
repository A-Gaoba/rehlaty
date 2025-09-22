export interface RealtimeClient {
  subscribeToConversation: (
    conversationId: string,
    onMessage: (msg: any) => void
  ) => () => void;
}

// Stub implementation; wire Pusher/Ably later
export const realtime: RealtimeClient = {
  subscribeToConversation: (_conversationId, _onMessage) => {
    // no-op; return unsubscribe
    return () => {};
  },
};
