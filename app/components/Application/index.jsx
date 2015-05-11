import React from 'react';
import Header from '../Header';
import Posts from '../Posts';

/*
  Component specific stylesheet
  Can also use .less, .scss, or plain .css files here
*/
require('./style.scss');

export default class Application extends React.Component {
  render() {
    return <div className="app">
      <div className="app-wrap">
        <Header />

        <main className="app-body">          
          <Posts />
        </main>
      </div>
    </div>;
  }
}
