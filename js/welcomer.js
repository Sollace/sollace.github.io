
(() => {
  const message = pickOne([
    {
      title: 'Oh, wow, this is awkward...',
      body: [
        'It seems you found my website. Congrats! I knew you could do it!',
        'Now for your reward, I have hidden a key somewhere inside your r--',
        'What\'s that? Someone already did that? Saw?',
        'Okay, so my PR team said I can\'t do that. Something about human decency and copyright law, so, um... Here\'s a list of my socials and projects I work on. Enjoy!'
      ]
    },
    {
      title: 'Hello fine people of the interwebs!',
      body: [
        'Congratulations on finding my website!',
        'You win a cookie!',
        'No, you can\t eat it.'
      ]
    },
    {
      title: 'I have done nothing productive all day',
      body: [
        'Pbpbpbpbpbpbpbpt'
      ]
    },
    {
      title: 'This is MY page',
      body: [
        'and I\'m going to READ IT!'
      ]
    },
    {
      title: 'TODO',
      body: [
        'Lore'
      ]
    },
    {
      title: 'Ponies Ponie Ponie Ponies',
      body: [
        'Ponies Ponie Ponie Ponies',
        'Ponies Ponie Ponie Ponies',
        'Ponies Ponie Ponie Ponies',
        'Ponies Ponie Ponie Ponies'
      ]
    },
    {
      title: 'Rubber Baby Buggie Bumpers',
      body: [
        'Rubber Baby Buggie Bumpers',
        'Rubber Baby Buggie Bumpers'
      ]
    },
    {
      title: 'The world\s second strongest writer™',
      body: [
      ]
    },
    {
      title: 'Lyra is best Pony',
      body: [
        'I will refuse to elaborate further'
      ]
    },
    {
      title: 'I stole your waifu',
      body: [
        'I will refuse to elaborate further'
      ]
    },
    {
      title: 'Horsing around is what I do',
      body: [
        'This is an automated message.'
      ]
    },
    {
      title: 'If you can read this...',
      body: [
        'You\'re too g**d**mn close.'
      ]
    },
    {
      title: 'Pear Butter is a national treasure',
      body: [
        'Anyone who disagrees can close this tab now.'
      ]
    },
    {
      title: 'Proud resident of the GalaCon stairwell',
      body: [
      ]
    }
  ]);
  
  document.querySelector('.welcome-message-box h2').innerText = message.title;
  document.querySelector('.welcome-message-box span').innerHTML = '<p>' + message.body.join('</p><p>') + '</p>';
  
  function pickOne(options) {
    return options[Math.floor(Math.random() * options.length)];
  }
})();