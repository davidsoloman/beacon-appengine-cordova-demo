var app = {};

app.initialize = function()
{	
    document.addEventListener(
            'deviceready',
            app.onDeviceReady,
            false);
};

app.onDeviceReady = function()
{
    // Initialise Google API
    setupAPI();
};

setupAPI = function() {
    console.log('In setupAPI: gapi client is ' + JSON.stringify(gapi.client));
    gapi.client.load('beaconendpoint', 'v1', getBeacons);
};

// Keeping this here for now as failing to provide a success method to the gapi.client.load call causes a load failure for some weird reason.
getBeacons = function() {
    var beaconArray;
    console.log('About to list beacons');
    console.log('In getBeacons: gapi client is ' + JSON.stringify(gapi.client));
    // Reload Beacons.
    gapi.client.beaconendpoint.listBeacon().then(function(resp) {
    	console.log('Response is: ' + JSON.stringify(resp));
        if (!resp.code) {
        	beaconArray = resp.result.items || [];
            console.log('We got these beacons back from gae: ' + JSON.stringify(beaconArray));           
        };  
    });
    return beaconArray;
};

// *** Beacons ***

asyncGetBeacons = function() {
    var deferred = $.Deferred();
    gapi.client.beaconendpoint.listBeacon().then(function(resp) {
    	console.log('Response is: ' + JSON.stringify(resp));
        if (!resp.code) {
            console.log('We got these beacons back from gae: ' + JSON.stringify(resp.result.items));
            deferred.resolve(resp.result.items);
        } else {
            deferred.reject("Endpoint returned an error: " + JSON.stringify(resp));
        }  
    });
    return deferred.promise();
};

asyncGetBeacon = function() {
    var deferred = $.Deferred();
    var requestData = {};
    requestData.id = beaconViewModel.id();
    console.log('In getBeacon: gapi client is ' + JSON.stringify(gapi.client));
    gapi.client.beaconendpoint.getBeacon(requestData).then(function(resp) {
    	console.log('Response is: ' + JSON.stringify(resp));
        if (!resp.code) {
            // Single beacon, just return resp
            console.log('We got this beacon back from gae: ' + JSON.stringify(resp.result));
            deferred.resolve(resp.result);
        } else {
        	deferred.reject("Endpoint returned an error: " + JSON.stringify(resp));
        }  
    });
    return deferred.promise();
};

asyncSaveBeacon = function() {
    var deferred = $.Deferred();
    var requestData = {};

    requestData.id = beaconViewModel.id();
    requestData.label = beaconViewModel.label();
    requestData.description = beaconViewModel.description();
    requestData.type = beaconViewModel.type();
    requestData.uuid = beaconViewModel.uuid();
    requestData.major = beaconViewModel.major();
    requestData.minor = beaconViewModel.minor();
    requestData.message = beaconViewModel.message();
    
    if (requestData.id === "") {
        gapi.client.beaconendpoint.insertBeacon(requestData).then(function(resp) {
            if (!resp.code) {
                deferred.resolve(resp.result);
            } else {
                deferred.reject("Endpoint returned an error: " + JSON.stringify(resp));
            } 
        });
    } else {
        console.log("Updating beacon, request data is: " + JSON.stringify(requestData));
        gapi.client.beaconendpoint.updateBeacon(requestData).then(function(resp) {
            if (!resp.code) {
                deferred.resolve(resp.result);
            } else {
                    deferred.reject("Endpoint returned an error: " + JSON.stringify(resp));
            } 
        });
    };
    return deferred.promise();
};

asyncRemoveBeacon = function() {
    var deferred = $.Deferred();
    var requestData = {};
    requestData.id = beaconsViewModel.selectedBeaconId;
    gapi.client.beaconendpoint.removeBeacon(requestData).then(function(resp) {
        if (!resp.code) {
            deferred.resolve(resp.result);
        } else {
        	deferred.reject("Endpoint returned an error: " + JSON.stringify(resp));
        }  
    });
    return deferred.promise();
};


// *** ViewModel definition ***

//Model for an Array of Beacons
function BeaconsViewModel() {

    var self = this;
    self.selectedBeaconId = ko.observable("");
    self.beacons = ko.observableArray([]);

    // Load up the BeaconsViewModel
    self.load = function() {

        var beaconsPromise = asyncGetBeacons();

        beaconsPromise.done(function(loadedBeacons){
            self.beacons([]);
            console.log("Promise done - got these beacons: " + JSON.stringify(loadedBeacons));
            self.beacons(loadedBeacons);
        });

        beaconsPromise.fail(function(ex){
          console.log("An error occured loading beacons: " + ex);
        });

    };
	
    self.removeBeacon = function(beacon) { 
        self.selectedBeaconId = beacon.id;
        var beaconPromise = asyncRemoveBeacon();
        console.log("Removing beacon: " + JSON.stringify(beacon));
        beaconPromise.done(function(removedBeacon){
            console.log("Beacon removed, response was: " + JSON.stringify(removedBeacon));
            self.beacons.remove(beacon);
            self.selectedBeaconId = "";
        });

        beaconPromise.fail(function(ex){
          console.log("An error occured deleting a beacon: " + ex);
        });

    };

    self.editBeacon = function(beacon) { 
        console.log("Editing beacon: " + JSON.stringify(beacon));
        beaconViewModel.id(beacon.id);
        $(location).attr('href',"#page-beacon-detail");
    };

    self.createNewBeacon = function() { 
        console.log("Creating a new beacon.");
        beaconViewModel.id("");
        $(location).attr('href',"#page-beacon-detail");
    };
	
};

//Model for an individual Beacon
function BeaconViewModel() {
	
    var self = this;

    self.id = ko.observable("");
    self.label = ko.observable("");
    self.description = ko.observable("");
    self.type = ko.observable("");
    self.uuid = ko.observable("");
    self.major = ko.observable("");
    self.minor = ko.observable("");
    self.message = ko.observable("");
    
    // Load up the BeaconsViewModel
    self.load = function() {

        console.log("self.id is :" + self.id() + ".");
        if (self.id() !== "") { 
            // We're editing an existing beacon, go and get the latest version from the back end. 

            var beaconPromise = asyncGetBeacon();

            beaconPromise.done(function(loadedBeacon){
                console.log("Promise done - got this beacon: " + JSON.stringify(loadedBeacon));
                console.log("Beacon ID is : " + JSON.stringify(loadedBeacon.id));
                self.id(loadedBeacon.id);
                self.label(loadedBeacon.label);
                self.description(loadedBeacon.description);
                self.type(loadedBeacon.type);
                self.uuid(loadedBeacon.uuid);
                self.major(loadedBeacon.major);
                self.minor(loadedBeacon.minor);
                self.message(loadedBeacon.message);
            });

            beaconPromise.fail(function(ex){
              console.log("An error occured loading a beacon: " + ex);
            });
        } else {
            // Clear down fields, we're in insert mode.
            self.clear();
        }

    };
	
    self.save = function() {

        var beaconPromise = asyncSaveBeacon();

        beaconPromise.done(function(loadedBeacon){
            // Clean up and return to list page.
            self.clear();
            console.log("Beacon saved.");
            $(location).attr('href',"#page-beacon-list");
        });

        beaconPromise.fail(function(ex){
          console.log("An error occured saving a beacon: " + ex);
        });

    };

    self.clear = function() {
        self.id("");
        self.label("");
        self.description("");
        self.type("");
        self.uuid("");
        self.major("");
        self.minor("");
        self.message("");
    };
	    
};

var beaconsViewModel = new BeaconsViewModel();
var beaconViewModel = new BeaconViewModel();

ko.applyBindings(beaconsViewModel, document.getElementById('page-beacon-list'));

ko.applyBindings(beaconViewModel, document.getElementById('page-beacon-detail'));

// Set up the application.
app.initialize();
