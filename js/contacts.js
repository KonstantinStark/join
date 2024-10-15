function toggleOverlay() {
    var overlay = document.getElementById('overlay');

    if (overlay.classList.contains('d-none')) {
        overlay.classList.remove('d-none'); 
        
        setTimeout(function() {
            overlay.classList.add('show');
        }, 10);
    } else {
        overlay.classList.remove('show'); 
        setTimeout(function() {
            overlay.classList.add('d-none'); 
        }, 500); 
    }
}