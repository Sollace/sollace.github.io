(function() {
  var timerEnabled = !!document.querySelector('.timer');
  
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
  var messages = {
    delay: 500,
    repeat: 1,
    messages: [
      "Initialising",
      "Loading assets",
      "Checking...",
      {
        delay: 70,
        messages: [
          "Readying party planner.js"
        ]
      },
      {
        delay: 50,
        repeat: 70,
        messages: [
          "Executing party.js {index} of {total}",
        ]
      },
      {
        delay: 50,
        messages: [
          "Initialising AI..."
        ]
      },
      {
        delay: 500,
        repeat: 3,
        messages: [
          "Loading Pinkie Pies {index} of 120"
        ]
      },
      "Error!",
      "Loading P1nkam3na OS...",
      {
        delay: 3000,
        repeat: 200,
        messages: [
          "Loading Pinkamena {index} of {total}"
        ]
      },
      {
        delay: 15000,
        repeat: 12000,
        messages: [
          "Loading party cannon... {index} of {total}"
        ]
      }
    ]
  };
  
  MessageIterator(messages, function(msg) {
    document.querySelector('.loading-message').innerText = msg;
  });
  
  function MessageIterator(messages, callback) {
    messages.delay = messages.delay || 200;
    messages.index = 0;
    messages.iteration = 0;
    setTimeout(next, messages.delay);
    
    function incriment(item) {
      if (!item) return item;
      item.index++;
      if (item.index >= item.messages.length) {
        if (item.iteration < item.repeat) {
          item.iteration++;
          item.index = 0;
        } else {
          return incriment(item.parent);
        }
      }
      return item;
    }
    
    function next() {
      messages = incriment(messages);
      if (messages) {
      var item = messages.messages[messages.index];
        if (typeof item == 'string') {
          callback(parse(item));
        } else {
          item.repeat = item.repeat || 1;
          item.delay = item.delay || messages.delay;
          item.parent = messages;
          item.index = 0;
          item.iteration = 0;
          messages = item;
        }
        
        setTimeout(next, messages.delay);
      }
    }
    
    function parse(item) {
      return item.replace('{index}', messages.iteration).replace('{total}', messages.repeat).replace('{random}', getRandom(15));
    }
    
    function getRandom(len) {
      var possibles = 'abcdefghjiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var result = '';
      while (result.length < len) {
        result += possibles[Math.floor(Math.random() * possibles.length)]
      }
      return result;
    }
  }
  
  setInterval(timerEnabled ? ha : fade, timer.interval);
  if (timerEnabled) {
    if (!timer.init || !timer.init(change)) {
      var counts = document.querySelectorAll('.timer span.count');
      each(counts, function(el) {
        el.addEventListener('click', function() {
          this.innerText = '0';
          timer[this.getAttribute('class').replace('count ','')] = 0;
        });
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
    var am = document.querySelectorAll('.time .am');
    if (am.length) {
        var neu = timer.hours > 12 ? 'PM' : 'AM';
        each(am, function(el) {
            if (el.innerText.toUpperCase() != neu) el.innerText = neu;
        });
    }
  }

  function fade() {
    var fadeTarget = document.querySelector('.fade-target');
    if (!fadeTarget.style.backgroundColor || Math.random() * 20 < 15) {
        fadeTarget.style.backgroundColor = colours();
        fadeTarget.classList.add('coloured');
    }
  }

  function change(name) {
    each(document.querySelectorAll('.' + name), function(el) {
      el.innerText = timer[name];
      el.style.display = 'inline-block';
    });
  }
  
  function each(arr, func) {
    return Array.prototype.forEach.call(arr, func);
  }
})();