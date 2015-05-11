import React from 'react';

/*
  Component specific stylesheet
  Can also use .less, .scss, or plain .css files here
*/
require('./style.scss');

/*
  Reference an image and get back a URL automatically via webpack.
  webpack takes care of versioning, bundling for production, etc.
*/
const logoURL = require('./images/react-logo.svg');
const mePic = require('./images/me.jpg');

export default class Header extends React.Component {

  componentDidMount() {

    (function() {
      var throttle = function(type, name, obj) {
          var obj = obj || window;
          var running = false;
          var func = function() {
              if (running) { return; }
              running = true;
              requestAnimationFrame(function() {
                  obj.dispatchEvent(new CustomEvent(name));
                  running = false;
              });
          };
          obj.addEventListener(type, func);
      };

      /* init - you can init any event */
      throttle ("scroll", "optimizedScroll");
    })();

    // handle event
    window.addEventListener("optimizedScroll", function() {
        if (window.scrollY > 40) {
          document.querySelector(".header").classList.add("mini");
        } else {
          document.querySelector(".header").classList.remove("mini");
        }
    });
  }

  render() {
    return <header className="header">
      <div className="header-wrap clearfix">
        <img className="header-logo" src={mePic} />
        <h1 className="header-title">Disassemble. Learn. Repeat</h1>
        <h2 className="header-tagline">EA7JMF - AG6VW</h2>
      </div>
    </header>;
  }
}
