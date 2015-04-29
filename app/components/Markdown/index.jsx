import React from 'react';
import marked from 'marked';

require('github-markdown-css/github-markdown.css');

var demoFile = require('raw!./demo.md');

export default class Markdown extends React.Component {
  render() {
    var markdownOutput = marked(demoFile);

    return <div className="markdown-body" dangerouslySetInnerHTML={{__html: markdownOutput}} />;
  }
}