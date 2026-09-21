export class AccessDeniedError extends Error {
  constructor(message = "This account doesn't have admin access.") {
    super(message);
    this.name = 'AccessDeniedError';
  }
}
