const btnShowTrips = document.getElementById('btnShowTrips');
const tripSelected = document.getElementById('triplist');
const carSelect = document.getElementById('carlist');
const vinInput = document.getElementById('vin');
const bntSetInt = document.getElementById('btnSetInt');

/*This function is called on page load, used to set dropbox with cars names*/
const AllCarsListHandler = async() => {
    var res;
    var select = document.getElementById("carlist");
    document.getElementById("triplist").hidden = true;
    document.getElementById("triplistLabel").hidden = true;
    document.getElementById("map").hidden = true;
    document.getElementById("Carlist_h3").hidden = true;
    try {
        res = await fetch('/clikedCarInfoAll', {method: 'GET'});
        const data = await res.json();
        if (res.ok) {
            let data_print = [];
            for (let i = 0; i < data.length; i++) {
                data_print[i] = "";
                data_print[i] += data[i]["vin"].toString() + " ";                
            }           
            let all_list_unique = [... new Set(data_print)];
            console.log(all_list_unique);
            for(let j = 0; j < all_list_unique.length; j++){
                var option = document.createElement('option');
                option.text = option.value = all_list_unique[j];
                select.add(option, 0);
            }
            return;
        }
        throw new Error('Request faild.');
    } catch (error) {
        console.log(error);    
    }
};

/* This function is called when showtrip button is clicked, used to set dropbox with trip list*/
const ShowTripsClickHandler = async () =>
{
    let res;
    let selectCar = document.getElementById("carlist");
    let selectTrip = document.getElementById("triplist");
    let showAll = document.getElementById("myCheckAll");
    document.getElementById("triplist").hidden = false;
    document.getElementById("triplistLabel").hidden = false;
    document.getElementById("triplist").innerHTML = '';

    let index = 0;
    try {
        res = await fetch('/clikedCarInfoAll', {method: 'GET'});
        const data = await res.json();
        if (res.ok) {
            let data_print = [];
            for (let i = 0; i < data.length; i++) {                
                if( showAll.checked == true ) {
                    data_print[i] = "";
                    data_print[i] += data[i]["tripid"].toString();
                }
                else{
                    let input = [];
                    input += selectCar.options[selectCar.selectedIndex].value.toString();
                    let inp = data[i]["vin"].toString() + " ";
                    if( input === inp ) {
                        console.log("if");
                        data_print[index] = "";
                        data_print[index] += data[i]["tripid"].toString();
                        index++;
                    }
                    else{
                        console.log("else");
                    }
                }
            }           
            let all_list_unique = [... new Set(data_print)];
            console.log(all_list_unique);
            for(let j = 0; j < all_list_unique.length; j++){
                var option = document.createElement('option');
                option.text = option.value = all_list_unique[j];
                selectTrip.add(option, 0);
            }
            all_list_unique.length = 0;
            data_print.length = 0;
            input = 0;
            return;
        }
        throw new Error('Request faild.');
    } catch (error) {
        console.log(error);    
    }
};

/* This function is called when trip is selected, used to set harsh events numbers and print map*/
const ShowTripOnMap = async () => {
    console.log("show map");
    const tripSelected = document.getElementById('triplist').value;
    console.log(tripSelected);
    var map;
    var markers = [];
    let res;
    try {
        res = await fetch('/clikedCarInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tripid: tripSelected })
        });
        const data = await res.json();
        console.log(data);
        if (res.ok) {
            let brakes_num = 0;
            let turns_num = 0;
            let acceleration_num = 0;
            let location_list = new Array();
            for (let i = 0; i < data.length; i++) {
                //Collect info about harsh events
                if ( data[i]["event"].toString() == 'B') {
                    brakes_num++;
                }
                else if ( data[i]["event"].toString() == 'T') {
                    turns_num++;
                }
                else if ( data[i]["event"].toString() == 'A') {
                    acceleration_num++;
                }
                else {
                    //do nothing
                }

                //Collect coordinates of trip
                location_list += parseFloat(data[i]["latitude"]) + ",";
                location_list += parseFloat(data[i]["longitude"]);
                if(i < data.length - 1){
                    location_list +=  "|";
                }
            }

            var coordinates = location_list.split("|");
            
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 10,
                center: new google.maps.LatLng(coordinates[0].split(',')[0],coordinates[0].split(',')[1]),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            
            var flightPlanCoordinates = new Array();
            for(let ii=0;ii<coordinates.length;ii++)
            {  
                var point =new google.maps.LatLng(coordinates[ii].split(',')[0],coordinates[ii].split(',')[1]);
                flightPlanCoordinates.push(point);                
            }
            // Get number of Locations
            var num_markers = data.length;
            // Create Line
            console.log(location_list);
            console.log(coordinates);
            console.log(flightPlanCoordinates);
            var flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            // Create Markers
            for (var i = 0; i < num_markers; i++) {
                if( data[i]["event"].toString() == 'S' ) {
                    markers[i] = new google.maps.Marker({
                        position: {lat:data[i]["latitude"], lng:data[i]["longitude"]},
                        map: map,
                        html: data[i]["latitude"],
                        id: i,
                        icon: {
                            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                            strokeColor: "yellow",
                            scale: 3
                        },
                        label: {
                            text:"Start",
                            color: "yellow",
                            fontSize: "15px"
                        }                    
                    });
                }
                else if( data[i]["event"].toString() == 'E' ) {
                    markers[i] = new google.maps.Marker({
                        position: {lat:data[i]["latitude"], lng:data[i]["longitude"]},
                        map: map,
                        html: data[i]["latitude"],
                        id: i,
                        icon: {
                            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                            strokeColor: "blue",
                            scale: 3
                        },
                        label: {
                            text:"End",
                            color: "blue",
                            fontSize: "15px"
                        }            
                    });
                }
                else{
                    markers[i] = new google.maps.Marker({
                        position: {lat:data[i]["latitude"], lng:data[i]["longitude"]},
                        map: map,
                        html: data[i]["latitude"],
                        id: i,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            strokeColor: "red",
                            scale: 3
                        }                  
                    });
                }   
            };
            
            // Add line to map
            flightPath.setMap(map);
            // Print all harsh events data
            document.getElementById('Brakes').innerHTML = brakes_num;
            document.getElementById('Pressure').innerHTML = turns_num;
            document.getElementById('Acceleration').innerHTML = acceleration_num;

            location_list.length = 0;
            flightPlanCoordinates.length = 0;
            coordinates.length = 0;
            markers.length = 0;
            map = 0;
            document.getElementById("map").hidden = false;
            document.getElementById("Carlist_h3").hidden = false;
        }
    } catch (error) {
        console.log(error);    
    }
};

/*This function is called when car is selected, used to hide trip list and map*/
const HideTipHandler = async() => {
    document.getElementById("triplist").hidden = true;
    document.getElementById("triplistLabel").hidden = true;
    document.getElementById("map").hidden = true;
    document.getElementById("Carlist_h3").hidden = true;
};

/*This function is called when input (vin) is changed, used to enable and disable button for interval setup */
const vinInputHandler = async() => {
    const valid = document.getElementById('vin').checkValidity();
    console.log(valid);//only for debug purposes, remove later
    if (valid == true) {
        document.getElementById("btnSetInt").disabled = false;
    }
    else {
        document.getElementById("btnSetInt").disabled = true;
    }
};

/*This function is called when button Set Interval is clicked, used to send interval value for specific VIN to backend */
const vinSetIntervalHandler = async() => {
    console.log("btn clicked");//only for debug purposes, remove it later
    const vinVal = document.getElementById('vin').value;
    const intVal = document.getElementById('IntervalList').value;
    document.getElementById('vin').value = "";
    try {
        res = await fetch('/intervalSet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vinVal: vinVal, intVal: intVal})
        });
    } catch (error) {
        console.log(error);    
    }
};

document.addEventListener('DOMContentLoaded', AllCarsListHandler);
btnShowTrips.addEventListener('click', ShowTripsClickHandler);
tripSelected.addEventListener('click', ShowTripOnMap);
carSelect.addEventListener('click', HideTipHandler);
vinInput.addEventListener('change', vinInputHandler);
bntSetInt.addEventListener('click', vinSetIntervalHandler);
