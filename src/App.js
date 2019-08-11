import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react'
import './App.css'
import axios from 'axios'

var map;
var marker = ''
var infoWindow

class App extends Component {
  state = {
    restaurants: [],
    filteredRestaurants: [],
    // infowindows: [],
    // infowindow: null,
    markers: []
    // filteredMarkers: [],
    // marker: ''
  }

  componentDidMount() {
    this.getRestaurants();
  }

  renderMap = () => {    
    loadScript("https://maps.googleapis.com/maps/api/js?key=&callback=initMap")
    //AIzaSyD1DrDBUd6GNL2EIBCxK-K0OjkTny8kbuA
    window.initMap = this.initMap
  }

  getRestaurants = () => {
    const endPoint = "https://api.foursquare.com/v2/venues/explore?"
    const parameters = {
      client_id: "503SSLTFBQE5VYVQAM1FZSBGHHPG0OFXB1TC5QI5BWS33ZLZ",
      client_secret: "GGHRZNCAO4OTK4IYKFK51YJ4HHVUC3OWJA1Q3W2NJOFZV0K1",
      query: "restaurant",
      near: "Atlanta",
      v: "20182507",
      limit: "8"      
    }

    axios.get(endPoint + new URLSearchParams(parameters))
      .then(response => {
        this.setState({
          restaurants: response.data.response.groups[0].items,
          filteredRestaurants: response.data.response.groups[0].items,
          // allFilteredRestaurants: response.data.response.groups[0].items
        }, this.renderMap())
      })
      .catch(error => {
        console.log("ERROR!! " + error)
      })
  }

  initMap = () => {
    //Create A Map
    map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.7808076, lng: -84.3669668},
      zoom: 13
    })
    // Create An InfoWindow
    var infowindow = new window.google.maps.InfoWindow()
    // Display Dynamic Markers
    this.state.restaurants.map(restaurant => {
      var contentString = `${restaurant.venue.name} <br> ${restaurant.venue.location.address}, ${restaurant.venue.location.city}` 
      // Create A Marker
      const markerObj = new window.google.maps.Marker({
        position: {lat: restaurant.venue.location.lat , lng: restaurant.venue.location.lng},
        map: map,
        title: restaurant.venue.name,
        animation: window.google.maps.Animation.DROP
      })
      markerObj.setVisible(true)
 
      const newMarker = {marker:markerObj, restaurantId:restaurant.venue.id};
      this.state.markers.push(newMarker);     
        //Click on A Marker!
        markerObj.addListener('click', function() {
        //Change the content
        infowindow.setContent(contentString)
       // Open An InfoWindow
        infowindow.open(map, markerObj)
        markerObj.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(function () {
          markerObj.setAnimation(null);}, 700);        
       })
    })
  }

  updateMarkers = () => {
    this.state.markers.map(el => {
      const restaurant = this.state.filteredRestaurants.find(restaurant => restaurant.venue.id === el.restaurantId);
      if(!restaurant) el.marker.setVisible(false);
      else el.marker.setVisible(true);
    });

  }

  handleFilter = (newFilter) => {
    //console.log(newFilter, newFilter.length)
    const filteredRestaurants = this.state.restaurants.filter(restaurant => restaurant.venue.name.toLowerCase().includes(newFilter.toLowerCase()));
   // console.log(newFilter);
    // console.log(newFilter.length)
    if (newFilter.length > 0) {
      this.setState(() => ({
        filteredRestaurants        
      }), this.updateMarkers);
    } else {
      this.setState(() => ({
        filteredRestaurants: this.state.restaurants
      }),this.updateMarkers);
      //filteredMarker();
    }
  };

  render() {
    return (
      <main>       
      <div className = "container-full-width">
      <div className="d-flex">
        <div className="options-box">
          <h1>Restaurant Finder Near Atlanta</h1>
          <div>
          <Filter handleFilter={this.handleFilter} />         
            {this.state.filteredRestaurants.map((restaurant) => (             
              <div className="list-group">
                <ul 
                    aria-label = 'List of Restaurants'>                  
                      <button type="button" className="list-group-item list-group-item-action"
                          onClick = {() => {readMap(restaurant); populateInfoWindow (marker, infoWindow)
                          }}> 
                            {restaurant.venue.name}                                                     
                      </button>                                         
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div >
        <div id="map"></div>
        </div>
      </div>
    </div>
      </main>
    )
  }
}

//Search Function
const Filter = (props) => (
  <div className= "filter-list">
    <input 
        id='form-control' 
        type='text' 
        className='input'
        placeholder='Enter a Restaurant Name' 
        aria-label="text filter"
        name="filter"
        onChange={(e) => {
          props.handleFilter(e.target.value); 
        }}/>
  </div>
  );

function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker !== marker) {
    // Clear the infowindow content to give the streetview time
    // to load.   
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    //infowindow.setContent(contentString);
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(function () {
      marker.setAnimation(null);}, 700); 
  }
}

var infowindow;
function readMap(key)
{
  infowindow = new window.google.maps.InfoWindow()
        // Create A Marker
        var marker = new window.google.maps.Marker({
          position: {lat: key.venue.location.lat , lng: key.venue.location.lng},
          map: map,
        })
        // marker.setVisible(false);
        infowindow.setContent(key.venue.name +`<br>`+ key.venue.location.address+',' +' '+ key.venue.location.city)        
        // Open An InfoWindow
        infowindow.open(map, marker)
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(function () {
          marker.setAnimation(null);}, 700);
}

function loadScript(url) {
  var index  = window.document.getElementsByTagName("script")[0]
  var script = window.document.createElement("script")
  script.src = url
  script.async = true
  script.defer = true
  index.parentNode.insertBefore(script, index)
}

export default App;
