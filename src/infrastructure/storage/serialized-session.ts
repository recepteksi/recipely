export interface SerializedSession {
  id: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string;
  };
}
