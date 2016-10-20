'use strict';


//
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
//
var MIDIMessageTypes = {
  // Channel Voice Messages
  '10000000': 'noteOff',
  '10010000': 'noteOn',
  '10100000': 'polyphonicKeyPressure', // after touch
  '10110000': 'controlChange',
  '11000000': 'programChange',
  '11010000': 'channelPressure', // after touch
  '11100000': 'pitchBendChange',
  // Channel Mode Messages
  '10110000': 'channelModeMessages',
  '10110001': 'channelModeMessages',
  '10110010': 'channelModeMessages',
  '10110011': 'channelModeMessages',
  '10110100': 'channelModeMessages',
  '10110101': 'channelModeMessages',
  '10110110': 'channelModeMessages',
  '10110111': 'channelModeMessages',
  // System Common Messages
  '11110000': 'systemExclusive',
  '11110001': 'timeCodeQuarterFrame',
  '11110010': 'songPositionPointer',
  '11110011': 'songSelect',
  '11110110': 'tuneRequest',
  '11110111': 'endOfExclusive',
  // System Real-Time Messages
  '11111000': 'timingClock',
  '11111010': 'start',
  '11111011': 'continue',
  '11111100': 'stop',
  '11111110': 'activeSensing',
  '11111111': 'reset'
};

var body = document.getElementsByTagName('body')[0];

var parseRGBA = function (rgba) {

  var matches = /(rgb|rgba)\((.*)\)/.exec(rgba);

  if (!matches || matches.length < 3) {
    return [255, 255, 255, 1];
  }

  var parts = matches[2].split(',').map(function (part) {

    return parseInt(part.trim(), 10);
  });

  console.log(matches[1], parts);

  return parts;
};

var onMIDIMessage = function (message) {

  var typeKey = (message.data[0] >>> 0).toString(2);
  var type = MIDIMessageTypes[typeKey];
  var cc = message.data[1];
  var value = message.data[2];

  if (!type) {
    console.log(typeKey);
    return;
  }

  if (type === 'activeSensing') {
    return false;
  }
  else if (type === 'channelModeMessages') {

    if (cc < 4) {
      var bgColor = body.style.backgroundColor || 'rgba(255,255,255,1)';
      var rgba = parseRGBA(bgColor);

      if (cc === 1) {
        rgba[0] = value * 2;
      }
      else if (cc === 2) {
        rgba[1] = value * 2;
      }
      else if (cc === 3) {
        rgba[2] = value * 2;
      }

      body.style.backgroundColor = 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',1)';
    }
    else if (cc === 9) {
      constraints.minBodies = value;
      constraints.maxBodies = value;
      $('#canvas-container').self()
    }
  }

  console.log(type, cc, value);
};


navigator.requestMIDIAccess().then(function (midi) {

  var inputs = midi.inputs.values();

  for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
    // each time there is a midi message call the onMIDIMessage function
    input.value.onmidimessage = onMIDIMessage;
  }

  console.log('success', arguments);
}, function (err) {

  console.log('failure', err);
});
