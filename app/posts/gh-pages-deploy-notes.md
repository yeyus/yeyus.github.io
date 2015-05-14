Notes on deploying to gh-pages
------------------------------

* If you're trying to create a {username}.github.io repo for publishing your pages note that the branch deployed is ```master``` instead of the more common ```gh-pages``` that is used just for project or organization pages.

* When deploying to a pages branch make sure you disable *jekyll* in case you're not using it. https://help.github.com/articles/using-jekyll-with-pages/#turning-jekyll-off

Otherwise you may receive obscure emails stating that your build was incorrect (gh won't push any incorrect build to their CDN).

>The page build failed with the following error:
>
>Page build failed. For more information, see https://help.github.com/articles/troubleshooting-github-pages-build-failures.
>
>If you have any questions you can contact us by replying to this email.