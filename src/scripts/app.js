// Listen for submit
document.querySelector("#zipForm").addEventListener('submit', getLocationInfo);

// Listen for delete
document.querySelector('body').addEventListener('click', deleteLocation);

function getLocationInfo(e) {
  // Get zip value from input
  const zip = document.querySelector('.zip').value;

  // Make request
  fetch(`http://api.zippopotam.us/se/${zip}`)
    .then(res => {
      if (res.status != 200) {
				showIcon('remove');
        document.querySelector("#output").innerHTML =
        `<article class="message is-danger">
        	<div class="message-body">Fel postnummer, skriv in rätt!!</div>
        </article>`;
        throw Error(res.statusText);
      } else {
				showIcon('check');
        return res.json();
      }
    })
    .then(data => {
      // Show location info
      let output = '';
      data.places.forEach(place => {
        output += `
          <article class="message is-primary">
            <div class="message-header">
              <p>Information</p>
              <button class="delete"></button>
            </div>
            <div class="">
              <ul>
                <li><strong>Stad: </strong>${place['place name']}</li>
                <li><strong>Län: </strong>${place['state']}</li>
                <li><strong>Longitude: </strong>${place['longitude']}</li>
                <li><strong>Latitude: </strong>${place['latitude']}</li>
              </ul>
            </div>
          </article>
        `;
      });
      // Insert in output div
      document.querySelector('#output').innerHTML = output;
    })
    .catch(err => console.log(err));

  e.preventDefault();
}

function showIcon(icon) {
	// Clear icons
	document.querySelector('.icon-remove').style.display = 'none';
	document.querySelector('.icon-check').style.display = 'none';
	document.querySelector(`.icon-${icon}`).style.display = 'inline-flex';
}

// Delete location box
function deleteLocation(e) {
	if(e.target.className == 'delete') {
		document.querySelector('.message').remove();
		document.querySelector('.zip').value = '';
		document.querySelector('.icon-check').remove();
	}
}
