//  Declare variables
const form = document.querySelector('form');
const input = document.querySelector('#searchInspector');
const start = document.querySelector('#searchStartDate');
const end = document.querySelector('#searchEndDate');
const tableSection = document.querySelector('#inspectionTableBody');
var API_URL = `https://apis.accela.com/v4/inspections?module=Building`;
var request = {};
var fullLineAddresses = [];
var today = new Date();
var yyyymmdd = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
var directionsService = new google.maps.DirectionsService();
var bradenton = new google.maps.LatLng(27.495661, -82.573033);
var directionsDisplay = new google.maps.DirectionsRenderer();
var mapOptions = {
    zoom: 12,
    center: bradenton
};



directionsDisplay.setPanel(document.getElementById('right-panel'));

var trafficLayer = new google.maps.TrafficLayer();
    




var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

//  Set default dates to today
start.defaultValue = yyyymmdd;
end.defaultValue = yyyymmdd;

//  Actions for buttons
form.addEventListener('submit', formSubmitted);

//  Clear contents before next search
function searchStart() {
    tableSection.innerHTML = "";
    fullLineAddresses = [];
    API_URL = `https://apis.accela.com/v4/inspections?module=Building`;
    request = {};
}

//  MAIN FUNCTION : Create variables from form input, search API, display results, and display route
function formSubmitted(event) {
    event.preventDefault();
    var searchTerm = "&inspectorIds=" + input.value.toUpperCase();
    var startDate = "&scheduledDateFrom=" + start.value;
    var endDate = "&scheduledDateTo=" + end.value;
    
    searchStart();
    search(searchTerm, startDate, endDate)
    .then(displayResults)
    .then(calcRoute);
}


//  Filter returned Accela API Array to only Scheduled or Rescheduled statuses
function filterResults(resultAll) {
    var scheduled = ["Scheduled"];
    var filteredArray = resultAll.result.filter(function(itm) {
        return scheduled.indexOf(itm.status.value) > -1;
    });
    return {result: filteredArray};
}

//  Call Accela API
function search(searchTerm, startDate, endDate) {
    API_URL = `${API_URL}${searchTerm}${startDate}${endDate}&limit=8`;
    request = new Request(API_URL, {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-accela-appid': '636325413213503834',

            'Authorization': 'Rlgs4CndhyNu36B4YWw4BDh1NIujv0Zo2fmnl8am3sps8Efrb0Izdv1aerLfN6pUTfNC66KygM7QF3P6LVS6WGvuDCTI8ImWMpgD10rn29OLuYlRG-WelRlugS1doGrdvbxjhTCA2FxkJFrOfIrCWHA199V0oCvwM7RDFij7oKPdhqN93sO26oGM9ixlJ-gLkdsgGQipc-A4Af4PsFWv_1lcruOrJdbRDCwAL-nS48yq4G0g64VBvCUCukMcaMVlO-y0jItHRSAWYZKlReFAs8KFaCCIcHqzrhXo7GanaKDgcwPuYzXq1qT7pkafiKNXykXbgE1eKGFnUHcIYKnIHFHTsxfVodIAW4lI4cgGRJA2EsHVHQQQfjXIrOWalaQwm-JYu72G09ZPxDL5VvFMh4aLpyWWMHtAK9vkQpRYAaseDDkfcPNc4E5VL1VjPZYdoVWLbYfd78bmwjE1Px56NNq5ZqcAMVdFEqEJrbi3LTc7LeU2DEU7PztxogpVaJ3PHX4a_P6Er3h61xcpU_IBzNNzAbJdhp91FVfqZWsLAlMhmOQUsCb0zaF-uH_Wh9WOXclo2NhpY_7HJuPu69GcawWz5S0tFzhowe9vYhINprCf8wKaaIFY8XJIPh7zQL3GnSaLLw_rNXk1nsojGlAdPsBiawyWANBJ0px_iYb2dU-iYv2cB7l6KlKO3RF1WrX70'
        })
    });
    return fetch(request)
    .then(response => response.json())
    .then(resultAll => filterResults(resultAll))
    .then(result => {
        return result.result;
    });
}



function displayResults(returnResult) {


    returnResult.forEach(returnResultEach => {
        console.log(returnResultEach);
        var scheduledDateToShort = returnResultEach.scheduleDate.split("-");
        scheduledDateToShort = scheduledDateToShort[1] + "/" + scheduledDateToShort[2] + "/" + scheduledDateToShort[0];
        var tableRows = document.createElement("tr");
        var tableElement = document.createElement("td");

         tableElement.appendChild(document.createTextNode(returnResultEach.recordId.customId));

           tableElement.appendChild(document.createElement("br"));

        tableElement.appendChild(document.createTextNode(returnResultEach.recordType.type));


         tableRows.appendChild(tableElement);
         tableElement = document.createElement("td");
         tableElement.appendChild(document.createTextNode(returnResultEach.type.value));
         tableRows.appendChild(tableElement);
         tableElement = document.createElement("td");
    tableElement.appendChild(document.createTextNode(returnResultEach.address.streetStart + ' ' + returnResultEach.address.streetName + ' ' + returnResultEach.address.streetSuffix.text));
       

        tableElement.appendChild(document.createElement("br"));


    tableElement.appendChild(document.createTextNode(returnResultEach.address.city + ', ' + 'FL' + ' ' + returnResultEach.address.postalCode));
        tableRows.appendChild(tableElement);
         tableElement = document.createElement("td");
         tableElement.appendChild(document.createTextNode(scheduledDateToShort));
         tableRows.appendChild(tableElement);
         tableSection.appendChild(tableRows);
         tableElement = document.createElement("td");
         tableElement.appendChild(document.createTextNode(returnResultEach.status.value));
         tableRows.appendChild(tableElement);
         tableSection.appendChild(tableRows);
         tableElement = document.createElement("td");
         tableElement.appendChild(document.createTextNode(returnResultEach.inspectorFullName));
         tableRows.appendChild(tableElement);
         tableSection.appendChild(tableRows);
        // Push full address to variable to pass into Google Maps routing
       // fullLineAddresses.push(returnResultEach.address.streetAddress + ', ' + returnResultEach.address.city + ', ' + 'FL' + ' ' + returnResultEach.address.postalCode);
        fullLineAddresses.push(returnResultEach.address.streetStart + ' ' + returnResultEach.address.streetName + returnResultEach.address.streetSuffix.text + ', ' + returnResultEach.address.city + ', ' + 'FL' + ' ' + returnResultEach.address.postalCode);


    //fullLineAddresses.push(returnResultEach.address.streetStart + ' ' + returnResultEach.address.streetName + ' ' + returnResultEach.address.streetSuffix.text + ' ' + returnResultEach.address.streetSuffixDirection.text + ', ' + returnResultEach.address.city + ', ' + returnResultEach.address.state.text + ' ' + returnResultEach.address.postalCode);
    // })

    })
return fullLineAddresses;
}

//  Call Google Maps API
function calcRoute(fullLineAddresses) {
    var addresses = fullLineAddresses;
    console.log(addresses);
    var start = "1112 Manatee Ave W, Bradenton, FL 34205";
    var end = "1112 Manatee Ave W, Bradenton, FL 34205";


    var waypoints = [];
    for (var i = 0; i < addresses.length; i++) {
        waypoints.push({
            location: addresses[i],
            stopover: true
        });
    }
    var request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    };


    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(map);


            var route = response.routes[0];


            var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            // For each route, display summary information.
            for (var j = 0; j < route.legs.length; j++) {
                var routeSegment = j + 1;
                summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                '</b><br>';
                summaryPanel.innerHTML += `<a href="https://maps.google.com/?q=${route.legs[j].start_address}" target="_blank">${route.legs[j].start_address.replace(/, USA|, United States/gi,"")}</a>` + ' to ';
                summaryPanel.innerHTML += `<a href="https://maps.google.com/?q=${route.legs[j].end_address}" target="_blank">${route.legs[j].end_address.replace(/, USA|, United States/gi,"")}</a>` + '<br>';
                summaryPanel.innerHTML += route.legs[j].distance.text + '<br><br>';

         
            }
        } else {
           alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
        }
    });
}

function initialize() {
    directionsDisplay.setMap(map);
	trafficLayer.setMap(map);
}

function mapLocation() {
    
    google.maps.event.addDomListener(window, 'load', initialize());
}