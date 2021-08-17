var $18ZZr$axios = require("axios");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

const $966386b0caebf603$export$4a142f624dd0fa8 = async function(email, password) {
    try {
        const res = await $parcel$interopDefault($18ZZr$axios).post('http://localhost:3000/api/v1/users/login', {
            email: email,
            password: password
        });
        console.log(res);
    // if (res.data.status === 'success') {
    //     alert('welcome!')
    //     window.setTimeout(() => {
    //         location.assign('/')
    //     }, 1000);
    // }
    // const res = await axios({
    //     method: 'POST',
    //     url: 'http://localhost:3000/api/v1/users/login',
    //     data: {
    //         email,
    //         password
    //     }
    // })
    // if (res.data.status === 'success') {
    //     alert('welcome!')
    //     window.setTimeout(() => {
    //         location.assign('/')
    //     }, 1000);
    // }
    } catch (err) {
        // console.log('SOMETHING WENT WRONG', error.response.data)
        console.log(err.response.data);
        alert(err.response.data);
    }
};


const $63b3e42aeaec99ab$var$locations = JSON.parse(document.getElementById('map').dataset.locations);
mapboxgl.accessToken = 'pk.eyJ1IjoidG9tbXl2ZWU4OCIsImEiOiJjanY3NHhmcWIwYzl2M3lwb2twb3h1MWx4In0.WwMbnS3HfAjjYpPILtiONg';
const $63b3e42aeaec99ab$var$map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/tommyvee88/cksaovit5av4m17pe7s4es4ix',
    scrollZoom: false
});
const $63b3e42aeaec99ab$var$bounds = new mapboxgl.LngLatBounds();
$63b3e42aeaec99ab$var$locations.forEach((loc)=>{
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo($63b3e42aeaec99ab$var$map);
    // Add popup
    new mapboxgl.Popup({
        offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo($63b3e42aeaec99ab$var$map);
    // Extend map bounds to include curretn location
    $63b3e42aeaec99ab$var$bounds.extend(loc.coordinates);
});
$63b3e42aeaec99ab$var$map.fitBounds($63b3e42aeaec99ab$var$bounds, {
    padding: {
        top: 200,
        bottom: 200,
        left: 100,
        right: 100
    }
}) // navigator.geolocation.getCurrentPosition((position) => {
 //     // console.log(position)
 //     // Create marker
 //     const {
 //         longitude,
 //         latitude
 //     } = position.coords
 //     const el = document.createElement('div')
 //     el.className = 'marker'
 //     // Add marker
 //     new mapboxgl.Marker({
 //         element: el,
 //         anchor: 'bottom'
 //     }).setLngLat([longitude, latitude]).addTo(map)
 //     // Extend map bounds to include curretn location
 //     bounds.extend([longitude, latitude])
 //     map.fitBounds(bounds, {
 //         maxZoom: 15
 //     })
 // })
;


const $6d00357f9692ec59$var$form = document.querySelector('form');
$6d00357f9692ec59$var$form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    $966386b0caebf603$export$4a142f624dd0fa8(email, password);
});


//# sourceMappingURL=index.js.map
