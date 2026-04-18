export class Container {
  private factories = new Map<symbol, () => unknown>();
  private instances = new Map<symbol, unknown>();

  register<T>(token: symbol, factory: () => T): void {
    this.factories.set(token, factory);
    this.instances.delete(token);
  }

  resolve<T>(token: symbol): T {
    const cached = this.instances.get(token);
    if (cached !== undefined) {
      return cached as T;
    }
    const factory = this.factories.get(token);
    if (!factory) {
      // WHY: resolving an unregistered token is a programmer error, not a runtime failure path.
      throw new Error(`No factory registered for token: ${token.toString()}`);
    }
    const created = factory() as T;
    this.instances.set(token, created);
    return created;
  }

  reset(): void {
    this.factories.clear();
    this.instances.clear();
  }
}
