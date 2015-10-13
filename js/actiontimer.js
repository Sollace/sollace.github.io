(function() {
  setInterval(function() {
    ha();
  }, 1000);
  
  var timer = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  
  $('.timer span.count').click(function() {
    timer[$(this).text('0').attr('class').replace('count ','')] = 0;
  });
  
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
  }

  function change(name) {
    $('.' + name).text(timer[name]);
    $('.' + name + ',.' + name + ' + .letter').css('opacity', '1');
  }
})();