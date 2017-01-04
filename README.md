# Chinese New Year 2017 - Year of the Rooster Card & Game

This is a combination Chinese New Year greeting card and mini video game to celebrate the Year of the Rooster. Gong Xi Fa Cai, everyone!

Playable at http://shaunanoordin.com/cny2017/ - or if you're looking at the _source code_ - by opening `index.html` on a web browser.

Previous Chinese New Year greeting cards/games:
* http://shaunanoordin.com/cny2016/
* http://shaunanoordin.com/cny2015/
* http://shaunanoordin.com/cny2014/
* http://shaunanoordin.com/cny2013/

Developed by [Shaun A. Noordin](http://shaunanoordin.com)

## Development/Technical Stuff

* Target audience: Casual gamers who celebrate Chinese New Year.
* Target devices: PCs and mobile devices - that means keyboard _and_ touch screen compatibility.
* This is a web app built on HTML5, JavaScript and CSS.
* The source code is based on https://github.com/shaunanoordin/avo-adventure
* Developing the web app requires Node.js installed on your machine and a handy command line interface. (Bash, cmd.exe, etc)
* However, the _compiled_ web app itself can be run simply by opening the `index.html` in a web browser. (Chrome, Firefox, etc)

Project anatomy:

* Source JS (ES6 JavaScript) and STYL (Stylus CSS) files are in the `/src` folder.
* Compiled JS and CSS files are in the `/app` folder.
* Media assets are meant to be placed in the `/assets` folder.
* Entry point is `index.html`.

Starting the project (locally):

1. Install the project dependencies by running `npm install`
2. Run `npm start` to start the server.
3. Open `http://localhost:3000` on your browser to view the app.

Alternatively, there's a developer mode:

1. `npm install`
2. `npm run dev`
3. `http://localhost:3000`
4. Changes to the JS and STYL files will now be compiled automatically; i.e. Babel and Stylus now _watch_ the files. Refreshing the browser window should should show the latest edits.
