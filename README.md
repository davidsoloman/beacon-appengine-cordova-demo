# beacon-appengine-cordova-demo
Suite of demo apps featuring Hybrid mobile apps that store and interact with beacon data and integrate with a Google app engine back end for persistence.

Instructions and link to blog post(s) to follow.



In the call to gapi.client.load on line 113, you'll need to replace <<YOUR APP ID>> in the following string 'https://<<YOUR APP ID>>.appspot.com/_ah/api' with the endpoint address that appengine provided when you deployed your backend app (e.g. 'https://1-dot-my-supercool-service.appspot.com/_ah/api').
