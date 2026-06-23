export interface TokenPayload {
  userId: string;
  role: string;
}

export interface TokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
