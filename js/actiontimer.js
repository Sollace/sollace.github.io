(function() {
  var timerEnabled = !!$('.timer').length;
  
  var colours = (function() {
    var colours = [ '#ea80b0', '#6aaadd', '#e97135', '#5e51a3', '#e6b91f', '#a66ebe' ];
    var pointer = 0;
    return function() {
      pointer = (pointer + 1) % colours.length;
      return colours[pointer];
    }
  })();
  
  var timer = window['timer'] || {
    interval: 1000,
    hours: 0,
    minutes: 0,
    seconds: 0,
    tick: function(callback) {
       if (++this.seconds >= 60) {
         this.seconds = 0;
         if (++this.minutes >= 60) {
           this.minutes = 0;
           ++this.hours;
           callback('hours');
         }
         callback('minutes');
       }
       callback('seconds');
    }
  };
  
  setInterval(timerEnabled ? ha : fade, timer.interval);
  if (timerEnabled) {
    if (!timer.init || !timer.init(change)) {
      $('.timer span.count').click(function() {
        timer[$(this).text('0').attr('class').replace('count ','')] = 0;
      });
    }
  }
  updateAM();
  
  function ha() {
    timer.tick(change);
    updateAM();
    fade();
  }
  
  function updateAM() {
    var am = $('.time .am');
    if (am.length) {
        var neu = timer.hours > 12 ? 'PM' : 'AM';
        am.each(function() {
            if ($(this).text().toUpperCase() != neu) $(this).text(neu);
        });
    }
  }

  function fade() {
    if (Math.random() * 20 < 15) {
        $('.fade-target').css('background-color', colours());
        $('.fade-target').addClass('coloured');
    }
  }

  function change(name) {
    $('.' + name).text(timer[name]);
    $('.' + name + ',.' + name + ' + .letter').css('display', 'inline-block');
  }
})();