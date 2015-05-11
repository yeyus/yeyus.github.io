import alt from '../alt';
import Qajax from 'qajax';

class PostsActions {
	constructor() {
		this.generateActions('setPosts', 'setPostsFailed', 'setFiltering');
	}

	fetchPosts() {
		var _this = this;

		Qajax('./posts/posts.json').then(
			function success(r) {
				var jsonObj;
				if (r.status === 200 && r.response) {
					try{
						jsonObj = JSON.parse(r.response);
						_this.actions.setPosts(jsonObj.posts);
					}catch(e){
						_this.actions.setPostsFailed(e);
					}
				}
			}, function error(err) {
				_this.actions.setPostsFailed(err);
			});
	}
}

export default alt.createActions(PostsActions);