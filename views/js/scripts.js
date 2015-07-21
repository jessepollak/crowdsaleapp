$(function() {

	$( "#video-tabs" ).tabs();

	$('#home-slider').flexslider({
		animation: "slide",
		slideshow: false,
		slideshowSpeed: 3000,
		controlsContainer: '#home-slider .custom-pagination'
	});

	$('.flexslider .button-autoplay').click(function(ev){
		var $this = $(this);
		if(!$this.is('.active')){
			$this.closest('.flexslider').flexslider('play');
			$this.addClass('active');
		} else {
			$this.closest('.flexslider').flexslider('pause');
			$this.removeClass('active');
		}
		ev.preventDefault();
	});

	$('.flex-control-nav li').click(function(){
		$(this).parent().siblings('.button-autoplay').removeClass('active');
	});

	$('#button-mobile-menu').click(function(ev){
		if(!$('.main-navigation').is(':visible')){
			$('.main-navigation').slideDown(400);
		} else {
			$('.main-navigation').slideUp(400, function(){
				$('.main-navigation').css('display', '');
			});
		}
		ev.preventDefault();
	});

});
