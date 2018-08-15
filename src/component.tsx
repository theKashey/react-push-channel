import * as React from 'react';

interface ChannelProps<T, K> {
  merge?: boolean;

  callback(t: K, all: T[]): void;
}

interface ChannelContext<T, K> {
  construct(t: T): void;

  push(t: T): void;

  pop(t: T): void;

  touch(): void

  value?: K;
}

export type CollectorType<T, K> = React.ComponentClass<ChannelProps<T, K>, ChannelContext<T, K>>;

export type PushChannel<T, K> = {
  Collector: CollectorType<T, K>,
  Push: React.SFC<T>
  Pop: React.SFC<{ children: (v?: K) => React.ReactNode }>
};

function isEqual(a: any, b: any): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.reduce((acc: boolean, key: string) => acc && a[key] === b[key], true);
}

export function createChannel<T extends object, K = T>
(initialValue?: T, reducer?: (acc: K, item: T) => K, initial?: K)
  : PushChannel<T, K> {
  const {Provider, Consumer} = React.createContext(initialValue as ChannelContext<T, K>);

  const empty: T[] = [];
  const mergeReducer = (acc: T, item: T) => Object.assign(acc, item);
  let passContructionPoint = false;

  class Collector extends React.Component<ChannelProps<T, K>, ChannelContext<T, K>> {
    private values: T[] = [];
    private costructed: T[] = [];

    update(newValues?: T[]) {
      const values = newValues || this.values;

      console.log(values);

      const topValue = this.props.merge
        ? values.reduce((reducer || mergeReducer) as any, initial === undefined ? {} as T : initial)
        : values[values.length - 1] as any;

      this.props.callback(topValue, values);
      this.setState({
        value: topValue
      });
    }

    private construct = (value: any) => this.update(this.costructed = [...this.costructed, value]);
    private push = (value: any) => this.update((this.costructed = empty, this.values = [...this.values, value]));
    private pop = (value: any) => this.update(this.values = this.values.filter(v => v !== value));
    private touch = () => this.update();

    state = {
      construct: this.construct,
      push: this.push,
      pop: this.pop,
      touch: this.touch,
    };

    render() {
      return <Provider value={this.state}>{this.props.children}</Provider>
    }
  }

  type PushProps = { channel: ChannelContext<T, K>, props: T };

  class PushAction extends React.PureComponent<PushProps> {
    private record: any = Object.assign({}, this.props.props);

    constructor(props: PushProps) {
      super(props);

      if (!passContructionPoint) {
        this.props.channel.construct(this.record);
      }
    }

    componentDidMount() {
      passContructionPoint = true;
      this.props.channel.push(this.record);
    }

    componentWillUnmount() {
      this.props.channel.pop(this.record);
    }

    componentDidUpdate(props: PushProps) {
      if (!isEqual(this.props.props, props.props)) {
        Object.assign(this.record, this.props.props);
        this.props.channel.touch();
      }
    }

    render(): null {
      return null;
    }
  }

  const Push: React.SFC<T> = (props) => (
    <Consumer>{value => <PushAction channel={value} props={props}/>}</Consumer>
  );

  const Pop: React.SFC<{ children: (v?: K) => React.ReactNode }> = ({children}) => (
    <Consumer>{value => children(value.value)}</Consumer>
  );

  return {
    Collector,
    Push,
    Pop
  }
}