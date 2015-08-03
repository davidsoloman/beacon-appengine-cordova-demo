# beacon-appengine-cordova-demo
Suite of demo apps featuring Hybrid mobile apps that store and interact with beacon data and integrate with a Google app engine back end for persistence.

Instructions and link to blog post(s) to follow.

*** You'll need to make changes in a few files before you can get up and running:

1) On lines 201 to 207 of /admin-app/www/index.html you'll find the following code block, which connects the app to the google app engine back-end:
	<script src="https://apis.google.com/js/client.js?onload=init">
    { "client": {},
      "googleapis.config": {
        root: "https://*** YOUR APP ID ***/_ah/api"
      }
    }
	</script>
You'll need to replace *** YOUR APP ID *** with the endpoint address that appengine provided when you deployed your back-end application (e.g. 'https://1-dot-my-supercool-service.appspot.com/_ah/api').

2) In the call to gapi.client.load on line 113 of /beacon-app/www/js/index.js, you'll need to replace *** YOUR APP ID *** in the following string 'https://*** YOUR APP ID ***.appspot.com/_ah/api' with the endpoint address that appengine provided when you deployed your back-end application (e.g. 'https://1-dot-my-supercool-service.appspot.com/_ah/api').

*** Known Issues:

Please note that this is a proof of concept demo that has been developed for instructional purposes only. There are some rough edges which mean that the software is not suitable for use in a production environment in its present form. No warranty is implied or should be inferred.

* You may find there is some lag in the UI while the app loads data from the back-end and renders it. A "loading" indicator would definitely be a good thing where this occurs, but I haven't implemented such functionality here.
* There's no validation on input fields, so inserting an incorrect value can cause problems - the admin app will allow you to save a beacon without supplying a UUID, major and minor, but the interactive beacon app will not scan for beacons if it loads such a beacon from the back-end.
