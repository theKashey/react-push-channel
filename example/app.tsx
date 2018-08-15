import * as React from 'react';
import {Component} from 'react';
import {createChannel} from '../src';

interface Title {
  title: string;
  description?: string;
  meta?: string;
};

const titleCh = createChannel({title: "none", description: "none"} as Title);
const lockCh = createChannel({}, (acc: number) => acc + 1, 0);

class Toggle extends React.Component<{}, { enabled: boolean }> {
  state = {
    enabled: true
  };

  render() {
    return (
      <div>
        <button onClick={() => this.setState(({enabled}) => ({enabled: !enabled}))}>toggle</button>
        {this.state.enabled ? this.props.children : 'disabled'}
      </div>
    )
  }
}

export default class App extends Component {

  state = {} as any;

  render() {
    return (
      <div>
        <titleCh.Collector callback={title => this.setState({title})} merge>
          <lockCh.Collector callback={lock => this.setState({lock})} merge>

            <Toggle>t
              <titleCh.Push title="Library test"/>
            </Toggle>
            <Toggle>tm
              <titleCh.Push title="overriden title" meta="Library meta"/>
            </Toggle>
            <Toggle>td
              <titleCh.Push title="Actual title" description="Library test"/>
            </Toggle>

            <Toggle>lock1
              <lockCh.Push/>
            </Toggle>
            <Toggle>lock2
              <lockCh.Push/>
            </Toggle>

            <div>
              title:
              <titleCh.Pop>{title => title && title.title}</titleCh.Pop>
              description:
              <titleCh.Pop>{title => title && title.description}</titleCh.Pop>
              meta:
              <titleCh.Pop>{title => title && title.meta}</titleCh.Pop>
            </div>

            <div>
              lock count:
              <lockCh.Pop>{lock => <div>{JSON.stringify(lock)}</div>}</lockCh.Pop>
            </div>

          </lockCh.Collector>
        </titleCh.Collector>

      </div>
    )
  }
}