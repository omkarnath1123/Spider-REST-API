# Spider-REST-API

[![Deploy](https://www.herokucdn.com/deploy/button.png)](http://spider-rest-api.herokuapp.com/Brands)
[![npm version](https://badge.fury.io/js/express.svg)](https://badge.fury.io/js/express)
[![Cocoapods](https://img.shields.io/badge/license-MIT-green.svg)](http://doge.mit-license.org)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

<img src="Examples/mern.png" alt="Stack" />

<b>SPIDER is an open source REST API.</b> Under the hood when a user hit a request it throw data which is stored in database and also start fetching the latest and greatest gadgets information so, you will always stay updated about your favourate gadgets information. <br>
In the nutshell it uses _authentication_, _caching_, _encryption_ and _server crash reports_.
<br>

## Uses

- can be used a gadgets shopping website [Like This](https://github.com/omkarnath1123/My-Awesome-Shop)
- can used to create a gadgets comparision portal
- (ML application) recommend a user which device is best suited for you keeping some parameters in mind like screen resolution, processor, ram, os etc. { lib you might need [brain.js](https://github.com/BrainJS/brain.js) }
- (ML application) can be used to predict the specs and future of gadgets by keeping in mind that api is your training data set { lib you might need [brain.js](https://github.com/BrainJS/brain.js) [plotly.js](https://plot.ly/javascript/) }

## Server Structure

The spider rest server uses _mongoDb_ as a database, _Redis_ as a caching server, _Express_ handles all the routes of the api, _Puppeteer_ used to get latest data and at last but not the least _Node_ which link all the above and adds functionality like token generation, authentication, token validation, routes validation, encryption etc.

<img src="Examples/Server_Diagram.jpg" alt="Server Structure" />

## Client Site Rendering

The spider uses client site rendring rendring and technology used are _Redux_ for state management, _GraphQl_ used for front end query language and also used in node to convert query GraphQL to mongoDb query and last but not the least _React_ which is used to create and handle all the UI in form of components.

<img src="Examples/Client.jpg" alt="Server Structure" />
<br/>

It takes :iphone: <b>Company/Companies</b> or <b>Device/Devices</b> and get latest subject data, update database and return a detailed description of that Company/Companies or Device/Devices.

Give it a try !! just follow these symple steps :hammer: -

> To setup and types of request please go to the [Wiki](https://github.com/omkarnath1123/Spider-REST-API/wiki) page.

<img src="Examples/curl_get.png" alt="SPIDER curl get request" />
