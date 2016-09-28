# gulp-template
```
npm install
```
Boot on development: (all JS files will be appended to the HTML output file separately)
```
gulp
````

Compile for deployment: (JS files merged and minified)
```
gulp --env production
````

The output of both modes is the folder "www", on development a local webserver + file changes watcher is enabled at http://localhost:2211