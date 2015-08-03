/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // Application Constructor
    initialize: function() {
    	// console.log("Initialising app.");
        this.bindEvents();        
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
    	document.addEventListener('deviceready', this.onDeviceReady, false);
    	//document.addEventListener('pause', this.onPause, false); 
        //document.addEventListener('resume', this.onResume, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if (id === 'deviceready') 
        {
            // console.log('Received Event: ' + id);
            // console.log('Window plugins is: ' + window.plugins);
            // console.log('Cordova plugins is: ' + cordova.plugins);
            //Initialise Google API 
            app.setupAPI();
    	};  	
    },      
    // Display message depending which beacon is closest.
    didRangeBeaconsInRegion: function(pluginResult)
    {   
        // console.log('***** outOfRangeCounter = ' + app.outOfRangeCounter);
        
        // There must be a beacon within range to continue.
        if (0 === pluginResult.beacons.length)
        {
            // console.log('***** No beacon ranged.');
            app.outOfRangeCounter++;
            if (app.outOfRangeCounter === 10) {
                // console.log('***** Displaying default message.');
                app.displayDefaultMessage();
            }
            return;
        }

        // We got a beacon, reset outOfRangeCounter to 0;
        app.outOfRangeCounter = 0;
        // Our regions are defined so that there is one beacon per region.
        // Get the first (and only) beacon in range in the region.
        var beacon = pluginResult.beacons[0];
        // The region identifier is the message id.
        var rangedBeacon = pluginResult.region.identifier;
        // console.log('************* OBJ ibeaconDemo: ranged beacon: ' + rangedBeacon + ' ' + beacon.proximity);
        // console.log('************* Current beacon is: ' + app.currentBeaconRegion );

        if (beacon.proximity === 'ProximityFar' || beacon.proximity === 'ProximityUnknown') {
            app.currentBeaconRegion = null;
            return;
            
        } else {

            // Only display a message if it isn't already displayed.
            if (app.currentBeaconRegion !== rangedBeacon)
            {
                var newBeacon = app.getBeaconForRegion(rangedBeacon);
                //console.log('***** Ranged beacon, showing message: ' + newBeacon.message);
                    app.currentBeaconRegion = rangedBeacon;
                    $("#message").html(newBeacon.message);
                    return;
            } 

        }
        
    }
  
};

// Regions that define which page to show for each beacon.    
app.beaconRegions = new Array();
// Id of the most recently detected beaconRegion;
app.currentBeaconRegion = null;
// This counter is incremented every time a beacon scan fails to see a beacon.
app.outOfRangeCounter = 0;

app.setupAPI = function() {
    
    console.log('gapi client is ' + JSON.stringify(gapi.client));
    
    gapi.client.load('beaconendpoint', 'v1', null,'https://*** YOUR APP ID ***.appspot.com/_ah/api').then(function() { 
        // Populate the beacon list.
        console.log('About to call getBeacons');
        app.getBeacons();
    });
};

app.getBeacons = function() {

    console.log('About to list beacons');

    // Reload Beacons.
    gapi.client.beaconendpoint.listBeacon().execute(function(resp) {
        if (!resp.code) {
            resp.items = resp.items || [];
            for (var i=0;i<resp.items.length;i++) {
                console.log('In getBeacons(), just got this beacon from response:' + JSON.stringify(resp.items[i]));

                var region = resp.items[i].label;
                var uuid  = resp.items[i].uuid;
                var major = resp.items[i].major;
                var minor = resp.items[i].minor;
                var label = resp.items[i].label;
                var message = resp.items[i].message;            
               
                var newBeacon = {'region': region, 
                                 'uuid':uuid,
                                 'major': major,
                                 'minor': minor,
                                 'label': label,
                                 'message': message};
                app.beaconRegions.push(newBeacon);
            };
            
            console.log('Loaded these beacons: ' + JSON.stringify(app.beaconRegions));
            // Assuming beacons are loaded from back end here - now set them up.
            app.setupBeacons();
            app.displayDefaultMessage();
        };   
    });
};      

app.getBeaconForRegion = function(region) {
    // Get the beacon correspondoing to the region passed in.
    // Definitely more efficient ways of doing this, but this'll do for now.
    for (var i=0;i<app.beaconRegions.length;i++) {
        if (region === app.beaconRegions[i].region) {
            console.log('**** This is the beacon for the current region: ' + app.beaconRegions[i].label);
            return app.beaconRegions[i];
        }
    };
}; 

app.displayDefaultMessage = function() {  
    $("#message").html("<h1>Welcome to the beaconate demo app.</h1><p>This app will provide you with information relevant to your location.</p>");
    app.currentBeaconRegion = null;
};
    
app.setupBeacons = function() { 
    
    try {
        
        // console.log("Setting up beacons - cordova.plugins is " + JSON.stringify(cordova.plugins)); 

	// Specify a shortcut for the location manager holding the iBeacon functions.
	var locationManager = cordova.plugins.locationManager;
        // console.log("Setting up beacons - cordova.plugins.locationManager is " + JSON.stringify(locationManager));

        // Setup beacons.
        var delegate = new locationManager.Delegate();  
        cordova.plugins.locationManager.setDelegate(delegate);
        // console.log("Setting up beacons - delegate is " + JSON.stringify(delegate));

        // required in iOS 8+
        //cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
        cordova.plugins.locationManager.requestAlwaysAuthorization();

	// Start monitoring and ranging our beacons.
	for (var r in app.beaconRegions)
	{
		var region = app.beaconRegions[r];
                
		var beaconRegion = new locationManager.BeaconRegion(
			region.label, region.uuid, region.major, region.minor);

		// Start monitoring.
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();

		// Start ranging.
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();
	}
        
        delegate.didDetermineStateForRegion = function (pluginResult) {
            // console.log('didDetermineStateForRegion:' + JSON.stringify(pluginResult));
            cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
                + JSON.stringify(pluginResult));
        };

        delegate.didStartMonitoringForRegion = function (pluginResult) {
            // console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
        };

        delegate.didRangeBeaconsInRegion = function (pluginResult) {
            // console.log('didRangeBeaconsInRegion:' + JSON.stringify(pluginResult));
            app.didRangeBeaconsInRegion(pluginResult);
        };

    } catch (e) {
        console.log("Error initialising beacon service: " + e);
    }
};

app.initialize();