/**
 * Base class for all domain entities. Entities are identified by a string `id`
 * and support identity-based equality via `equals`.
 */
export abstract class Entity<Props extends { id: string }> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  equals(other: Entity<Props>): boolean {
    return this.props.id === other.props.id;
  }
}
