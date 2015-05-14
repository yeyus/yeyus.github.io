var ghpages = require('gh-pages');
var path = require('path');

ghpages.publish(path.join(__dirname, 'dist'), { 
	branch: 'master',
	dotfiles: true,
	logger: function(msg) {
		console.log(msg);
	}
});