// IMPORTANT: This needs to be first (before any other components)
// to get around CSS order randomness in webpack.
require('./css/base.sass');

// Some ES6+ features require the babel polyfill
// More info here: https://babeljs.io/docs/usage/polyfill/
// Uncomment the following line to enable the polyfill
// require("babel/polyfill");

import React from 'react';
import Application from './components/Application';
import Alt from './alt';
import PostsStore from './stores/posts-store';

// assets load
require('file?name=posts/posts.json!./posts/posts.json');
require('file?name=posts/demo.md!./posts/demo.md');
require('file?name=posts/lipsum.md!./posts/lipsum.md');
require('file?name=posts/gh-pages-deploy-notes.md!./posts/gh-pages-deploy-notes.md');

React.render(<Application />, document.getElementById('app'));
