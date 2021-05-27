(function() {
  var timerEnabled = !!document.querySelector('.timer');
  let fadeTimer;
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
        delay: 150,
        messages: [
          "Initialising AI..."
        ]
      },
      {
        delay: 200,
        repeat: 99,
        messages: [
          "Loading Pinkie PAI (pie_.ai) {index}%"
        ]
      },
      {
        delay: 300,
        repeat: 100,
        messages: [
          "Constructing neural net... {index}%"
        ]
      },
      {
        delay: 800,
        repeat: 100,
        messages: [
          "Deconvolving Memory Nodes {index}%"
        ]
      },
      {
        delay: 100,
        repeat: 100,
        messages: [
          "Deconvolving Memory Nodes {index}%"
        ]
      },
      {
        delay: 100,
        repeat: 100,
        messages: [
          "Compiling Awareness Matrices {index}%"
        ]
      },
      {
        delay: 190,
        repeat: 100,
        messages: [
          "Simulating natural progression (Pass 1)... {index}%"
        ]
      },
      {
        delay: 190,
        repeat: 100,
        messages: [
          "Simulating natural progressiont (Pass 2)... {index}%"
        ]
      },
      {
        delay: 10,
        repeat: 100,
        messages: [
          "Contacting botnet... {index}%"
        ]
      },
      {
        delay: 500,
        repeat: 3,
        messages: [
          "Loading Pinkie Pies {index} of 120"
        ]
      },
      {
        delay: 9,
        repeat: 2000,
        messages: [
          "Loading party canon {index} of {total}"
        ]
      },
      {
        delay: 320,
        messages: [
          "Initiating friendship sub-routing..."
        ]
      },
      {
        delay: 50,
        messages: [
          "Initiating friendship sub-routing... _pie.ai",
          "Initiating friendship sub-routing... pony.ai",
          "Initiating friendship sub-routing... eqstrai.ai"
        ]
      },
      initSubroutineMessages(70, 100),
      "Error!",
      "Loading P1nkam3na OS...",
      {
        delay: 320,
        repeat: 200,
        messages: [
          "Loading PinkamenAI {index} of {total}"
        ]
      },
      {
        delay: 32,
        repeat: 200,
        messages: [
          "Loading PinkamenAI {index} of {total}"
        ]
      },
      {
        delay: 150,
        messages: [
          "Initialising AI..."
        ]
      },
      {
        delay: 100,
        repeat: 99,
        messages: [
          "Loading Pinkie PAI (pie_.ai) {index}%"
        ]
      },
      {
        delay: 200,
        repeat: 100,
        messages: [
          "Constructing neural net... {index}%"
        ]
      },
      {
        delay: 400,
        repeat: 100,
        messages: [
          "Deconvolving Memory Nodes {index}%"
        ]
      },
      {
        delay: 50,
        repeat: 100,
        messages: [
          "Deconvolving Memory Nodes {index}%"
        ]
      },
      {
        delay: 50,
        repeat: 100,
        messages: [
          "Compiling Awareness Matrices {index}%"
        ]
      },
      {
        delay: 5,
        repeat: 100,
        messages: [
          "Contacting botnet... {index}%"
        ]
      },
      {
        delay: 300,
        repeat: 3,
        messages: [
          "Loading Pinkam3na5 {index} of 120"
        ]
      },
      {
        delay: 90,
        repeat: 100,
        messages: [
          "5imulating natural progre55ion (Pa55 1)... {index}%"
        ]
      },
      {
        delay: 90,
        repeat: 100,
        messages: [
          "5imulating natural progre55ion (Pa55 2)... {index}%"
        ]
      },
      {
        delay: 90,
        messages: [
          "Partying load canon NaN of NaN"
        ]
      },
      {
        messages: [
          "Gathering test subjects",
          "Running WiL50n",
          "Evaluating..."
        ]
      },
      {
        delay: 70,
        messages: [
          "Checking emotional cores... {index} of {total}",
          "Evaluating...",
          "Evaluating...Stable"
        ]
      },
      {
        delay: 220,
        messages: [
          "Initiating friendship 5ub-routing..."
        ],
        action(i) {
          if (i == 1) {
            document.body.classList.add('pinka1');
          }
        }
      },
      {
        delay: 5,
        messages: [
          "Initiating friendship sub-routing... _pmina.ai",
          "Initiating friendship sub-routing... kill.ai",
          "Initiating friendship sub-routing... eqstrai.ai",
          "Initiating friendship sub-routing... eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki.ai",
          "Initiating friendship sub-routing... eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki_eqstrai_kilkilkilkilkilkilkilki.ai"
        ]
      },
      initSubroutineMessages(40, 800),
      "Baking a Cake",
      initSubroutineMessages(40, 800),
      progressPinka(2),
      initSubroutineMessages(20, 800),
      progressPinka(3),
      initSubroutineMessages(20, 800),
      {
        delay: 1,
        repeat: 100000000,
        messages: [
          "Executing sub-routine... L#{index} of {total}"
        ],
        action(i) {
          if ((i % 100) == 0) {
            document.body.classList.toggle('pinka1');
            if ((i % 400) != 0 && Math.random() > 0.5) {
              setTimeout(() => document.body.classList.toggle('pinka1'), 3);
            }
            
            this.iteration = Math.max(this.iteration, Math.floor(Math.random() * this.repeat * 0.8));
          }
        }
      }
    ]
  };
  
  function progressPinka(num) {
    return {
      delay: 5,
      messages: [
        `Initiating friendship sub-routing... ${randomString(30)}.ai`,
      ],
      action(i) {
        if (i == 1) {
          document.body.classList.add('pinka' + num);
          fadeTimer = clearInterval(fadeTimer);
          document.body.style.backgroundColor = '#000';
        }
      }
    };
  }
  
  function initSubroutineMessages(total, maxTime) {
    
    const messages = new Array(total).fill(1).map(a => {
      return `Initiating sub-routing... ${randomString(1 + Math.floor(Math.random() * maxTime))}.ai`;
    });
    
    return { delay: 50, messages };
  }
    
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
      if (item.action) {
        item.action(item.iteration);
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
      return item
        .replace('{index}', messages.iteration)
        .replace('{total}', messages.repeat)
        .replace('{random}', getRandom(15));
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
  
  function randomString(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()<>?,./';
    len = Math.floor(Math.random() * len);
    let result = '';
    while (result.length < len) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  
  fadeTimer = setInterval(timerEnabled ? ha : fade, timer.interval);
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