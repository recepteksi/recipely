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
