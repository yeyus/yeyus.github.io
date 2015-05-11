import React from 'react';
import PostsStore from '../../stores/posts-store';
import Qajax from 'qajax';
import marked from 'marked';

require('github-markdown-css/github-markdown.css');

export default class Markdown extends React.Component {

  constructor(props) {
    super();
    this.state = {
      data: null,
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    var _this = this;

    Qajax('./posts/' + this.props.path).then(
      function success(r) {
        if (r.status === 200 && r.response) {
          _this.setState({
            data: r.response,
            error: null,
            loading: false
          });
        }
      }, function error(err) {
        _this.setState({
            data: null,
            error: err,
            loading: false
          });
      });
  }

  componentWillUnmount() {
  }

  render() {
    if (this.state.loading) {
      return (<div className="markdown-loading">Loading post...</div>);
    } else if (this.state.error) {
      return (<div className="markdown-error">{this.state.error}</div>);
    } else if (this.state.data) {
      var markdownOutput = marked(this.state.data);
      return (<div className="markdown-body" dangerouslySetInnerHTML={{__html: markdownOutput}} />);
    }
    

    
  }
}