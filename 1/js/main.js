(function ($) {

  var $body = $('body');

  var constraints = {
    minBodies: 1,
    maxBodies: 8,
    minVertices: 2,
    maxVertices: 30
  };

  var bodyDefaults = {
    position: { x: 0, y: 0 },
    vertices: [],
    strokeStyle: '#000000',
    fillStyle: '#222222'
  };


  var slice = Array.prototype.slice;


  var extend = function (obj) {
    $.each(slice.call(arguments, 1), function (idx, source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };


  var random = function (min, max) {
    if (max == null) { max = min; min = 0; }
    return min + Math.floor(Math.random() * (max - min + 1));
  };


  var randomColour = function () {
    return [
      'rgba(',
      random(0, 255), ', ',
      random(0, 255), ', ',
      random(0, 255), ', ',
      (random(0, 100) / 100).toFixed(1),
      ')'
    ].join('');
  };


  function Body(spec) {
    extend(this, bodyDefaults, spec);
    var vtx = this.vtx = [];
    var position = this.position;
    var vertices = this.vertices;
    var i = vertices.length - 1;
    while (i >= 1) {
      vtx[i] = vertices[i--] + position.y;
      vtx[i] = vertices[i--] + position.x;
    }
  }


  var createRandomBody = function (stage) {
    var width = stage.getWidth();
    var height = stage.getHeight();
    var verts = [ 0, 0 ];
    var i = random(constraints.minVertices, constraints.maxVertices);
    do {
      verts = verts.concat([ random(0, width/2), random(0, height/2) ]);
    } while (i--);

    return new Body({
      position: {
        x: random(-1 * (width * 0.2), width * 0.8),
        y: random(-1 * (height * 0.2), height * 0.8)
      },
      vertices: verts,
      strokeStyle: randomColour(),
      fillStyle: randomColour()
    });
  };


  var createStage = function ($el) {
    var bodies = [];
    var $canvas = $('<canvas>');
    var ctx = $canvas[0].getContext('2d');
    var $win = $(window);
    var width = $win.width();
    var height = $win.height();

    function drawBody(body) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = body.strokeStyle;
      ctx.fillStyle = body.fillStyle;
      if (body.vertices.length > 1) { // polygon
        var vtx = body.vtx;
        var i = body.vertices.length - 1;
        ctx.moveTo(vtx[i - 1], vtx[i]);
        i -= 2;
        while (i >= 1) {
          ctx.lineTo(vtx[i - 1], vtx[i]);
          i -= 2;
        }
        ctx.closePath();
      } else { // circle
        ctx.arc(
          body.position.x, body.position.y,
          body.vertices[0], 0, 2 * Math.PI
        );
      }
      ctx.stroke();
      ctx.fill();
    }

    function drawInfoTable() {
      $('<table id="info">').html([
        '<tr>',
        '<th width="33%">Created</th><td>', (new Date()).toUTCString(),'</td>',
        '</tr>',
        '<tr><th>No. bodies</th><td>', bodies.length ,'</td></tr>',
        '<tr><th>Vertices *</th><td>', bodies.map(function (body) {
          return body.vertices.length;
        }).join(', '), '</td></tr>',
        '<tr><th>Stroke colours *</th><td>', bodies.map(function (body) {
          return [
            '<div class="colour" style="background:', body.strokeStyle, ';"></div>'
          ].join('');
        }).join(' '), '</td></tr>',
        '<tr><th>Fill colours *</th><td>', bodies.map(function (body) {
          return [
            '<div class="colour" style="background:', body.fillStyle, ';"></div>'
          ].join('');
        }).join(' '), '</td></tr>',
        '<tr><th>Constraints</th>',
        '<td>',
        (function () {
          var str = '';
          for (var k in constraints) {
            if (str) { str += ', '; }
            str += k + ': ' + constraints[k];
          }
          return str;
        }()),
        '</td>'
      ].join('')).appendTo($body);
    }

    function draw() {
      var i = bodies.length;
      while (i) { drawBody(bodies[--i]); }
      drawInfoTable();
      $body.append('<div id="countdown">3</div>');
    }

    // Resize stage to fit window size.
    function resize() {
      width = $win.width();
      height = $win.height();
      $canvas.attr('width', width + 'px');
      $canvas.attr('height', height + 'px');
    }

    $win.on('resize', function () { resize(); draw(); });
    // Call `resize` to initialise the stage size.
    resize();

    $el.append($canvas);

    return {
      getWidth: function () { return width; },
      getHeight: function () { return height; },
      addBody: function (body) { bodies.push(body); },
      draw: draw
    };
  };


  $.fn.self = function (options) {
    var stage = createStage(this);
    var bodycount = random(constraints.minBodies, constraints.maxBodies);

    do {
      stage.addBody(createRandomBody(stage));
    } while (--bodycount);

    stage.draw();

    // Coundown to next reload...
    var $countdown = $('#countdown');
    var paused = false;

    $body.click(function (e) {
      paused = !paused;

      if (paused) {
        $body.addClass('paused');
      }
      else {
        $body.removeClass('paused');
      }
    });

    var intvl = setInterval(function () {
      if (paused) {
        return;
      }

      var count = parseInt($countdown.text(), 10);

      if (!--count) {
        clearInterval(intvl);
        window.location.reload();
      }
      else {
        $countdown.text(count);
      }
    }, 1000);
  };

}(jQuery));
