export abstract class ValueObject<Props extends object> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  equals(other: ValueObject<Props>): boolean {
    // WHY: JSON stringify is acceptable only for flat, primitive-valued VOs; ordering must stay stable.
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
