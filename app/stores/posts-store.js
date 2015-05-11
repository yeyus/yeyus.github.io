import alt from '../alt';
import PostsActions from '../actions/posts-actions';

class PostsStore {

  constructor() {
    this.bindActions(PostsActions);

    this.posts = [];
    this.loading = true;
    this.filtering = {
      sortBy: 'date',
      sortDirection: 'desc'
    }
    this.error = null;
  }

  doSorting() {
    var filtering = this.filtering;
    this.posts = this.posts.sort(function (a,b) {
      if (filtering.sortDirection === 'desc') {
        return a[filtering.sortBy] <= b[filtering.sortBy] ? 1 : -1;
      } else {
        return a[filtering.sortBy] >= b[filtering.sortBy] ? 1 : -1;
      }
    })
  }

  onSetPosts(posts) {
    this.posts = posts;
    this.loading = false;
    this.doSorting();
  }

  onSetPostsFailed(err) {
    this.error = err;
    this.loading = false;
  }

  onSetFiltering(filters) {
    this.filtering = filters;
    this.doSorting();
  }

}

export default alt.createStore(PostsStore, 'PostsStore');