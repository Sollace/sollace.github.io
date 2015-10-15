function visitUser(id) {
  var proto = document.location.protocol == 'https:' ? 'https:' : 'http:';
  var domain = '//www.fimfiction.net';
  $.ajax({
    method: 'GET',
    dataType: 'html',
    url: proto + '//cors-anywhere.herokuapp.com/' + proto + domain + '/index.php',
    data: { view: 'category', user: id},
    success: function(htm) {
      htm = $(htm).find('.user-page-header h1.resize_text a');
      if (htm.length) {
        var url = htm.attr('href').replace(/http(s|):/,'').replace(document.location.hostname, '');
        if (url.indexOf(domain) != 0) {
          url = domain + url;
        }
        document.location.href = proto + url;
      } else {
        $('.pinkie .text').text('Error: Requested user was not found');
      }
    },
    'error': function(e) {
      $('.pinkie .text').text('Error: Could not contact "' + proto + domain + '"');
    }
  });
}