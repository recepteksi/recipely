/**
 * Base class for domain value objects. Equality is structural: two instances are
 * equal when their serialised props are identical. Only suitable for flat,
 * primitive-valued prop shapes where JSON key order is stable.
 */
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
