// Event fired when join button clicked, requests play page if fields are filled
$('#play-button').on('click', function(event) {
    var name = $('#name-input').val();
    var id = $('#room-input').val();
    
    if (!name || !id){
        alert('Please don\'t let blank fields!');
    } else {
        window.location = window.location.origin + '/play/rooms/' + id + '/players/' + name;
    }
});

// Update checkbox
$("#quality-checkbox").prop('checked', Cookies.get('high quality') == 'yes');

// Function to change render quality and store it in a cookie
function changeQuality(checkbox) {
    if (checkbox.checked) {
        Cookies.set('high quality', 'yes');
        renderer.setPixelRatio(1);
    } else {
        Cookies.set('high quality', 'no');
        renderer.setPixelRatio(.25);
    }
}
