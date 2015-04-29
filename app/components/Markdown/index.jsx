import React from 'react';
import marked from 'marked';

require('./style.sass');

export default class Markdown extends React.Component {
  render() {
    var markdownOutput = marked('I am using __markdown__.');

    return <div className="markdown" dangerouslySetInnerHTML={{__html: markdownOutput}} />;
  }
}