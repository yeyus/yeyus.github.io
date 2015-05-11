import React from 'react';
import PostsStore from '../../stores/posts-store';
import PostsActions from '../../actions/posts-actions';
import Markdown from '../Markdown';

require('./posts.scss');

export default class Posts extends React.Component {
  constructor(props) {
    super();
    this.state = PostsStore.getState();
  }

  componentDidMount() {
    PostsStore.listen(this.onChange.bind(this));
    PostsActions.fetchPosts();
  }

  componentWillUnmount() {
    PostsStore.unlisten(this.onChange);
  }

  onChange() {
    this.setState(PostsStore.getState());
  }

  render() {
    var posts;

    if (this.state && this.state.loading) {
      posts = (<h3>Loading posts...</h3>);
    } else if (this.state && this.state.error) {
      posts = (<h3>Error</h3>);
    } else {
      posts = this.state.posts.map(function (element) {
        return (
          <div className="post">
            <Markdown path={element.markdown} />
          </div>
        );
      });
    }

    return (
      <div className="posts">
        {posts}
      </div>
    );
  }
}