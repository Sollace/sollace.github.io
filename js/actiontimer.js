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
  
  var direction = 5;
  var backgroundWidth = 0;
  var timer = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  
  setInterval(timerEnabled ? ha : bouncePinkie, 1000);
  if (timerEnabled) {
    $('.timer span.count').click(function() {
      timer[$(this).text('0').attr('class').replace('count ','')] = 0;
    });
  }
  
  function ha() {
    if (++timer.seconds >= 60) {
      timer.seconds = 0;
      if (++timer.minutes >= 60) {
        timer.minutes = 0;
        ++timer.hours;
        change('hours');
      }
      change('minutes');
    }
    change('seconds');
    bouncePinkie();
  }

  function bouncePinkie() {
    backgroundWidth += direction;
    if (backgroundWidth >= 100 && direction > 0) {
      direction = -direction;
      $('.testBody').css('background-color', colours());
      $('.testBody').addClass('coloured');
    }
    if (backgroundWidth <= 0 && direction < 0) direction = -direction;
  }

  function change(name) {
    $('.' + name).text(timer[name]);
    $('.' + name + ',.' + name + ' + .letter').css('display', 'inline-block');
  }
})();