$(window).ready(function () {
    var banner = $('#banner');
	if (banner.length) {
	    $(window).on('scroll', function () {
	        var top = window.scrollY*0.5;
		    banner.css('background-position', 'top calc(50% + ' + top + 'px) center');
		});
	}
});