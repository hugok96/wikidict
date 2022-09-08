import React from 'react';
import './Initializing.css';

export class Initializing extends React.Component<any, any> {
  constructor(props : any) {
    super(props);
    this.state = { status: ''};
  }

  render() {
    return (
        <div className="Initializing">
          <span className="Spinner">♻</span>
          <h1>Loading WikiDict</h1>
          <h2>{this.props.status}</h2>
        </div>
    );
  }
}