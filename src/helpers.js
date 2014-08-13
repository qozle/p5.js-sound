define(function (require) {

  'use strict';

  var p5sound = require('master');

  /**
   *  <p>Set the master amplitude (volume) for sound in this sketch.</p>
   *
   *  <p>Note that values greater than 1.0 may lead to digital distortion.</p>
   * 
   *  <p><b>How This Works</b>: When you load the p5.sound module, it
   *  creates a single instance of p5sound. All sound objects in this
   *  module output to p5sound before reaching your computer's output.
   *  So if you change the amplitude of p5sound, it impacts all of the
   *  sound in this module.</p>
   *
   *  @method masterVolume
   *  @param {Number} volume   Master amplitude (volume) for sound in
   *                           this sketch. Should be between 0.0
   *                           (silence) and 1.0. Values greater than
   *                           1.0 may lead to digital distortion.
   *  @example
   *  <div><code>
   *  masterVolume(.5);
   *  </code></div>
   *   
   */
  p5.prototype.masterVolume = function(vol){
    p5sound.output.gain.value = vol;
  };


  /**
   * Returns a number representing the sample rate, in samples per second,
   * of all sound objects in this audio context. It is determined by the
   * sampling rate of your operating system's sound card, and it is not
   * currently possile to change.
   * It is often 44100, or twice the range of human hearing.
   *
   * @method sampleRate
   * @return {Number} samplerate samples per second
   */
  p5.prototype.sampleRate = function(){
    return p5sound.audiocontext.sampleRate;
  };


  p5.prototype.getMasterVolume = function(){
    return p5sound.output.gain.value;
  };

  /**
   *  Returns the closest MIDI note value for
   *  a given frequency.
   *  
   *  @param  {Number} frequency A freqeuncy, for example, the "A"
   *                             above Middle C is 440Hz
   *  @return {Number}   MIDI note value
   */
  p5.prototype.freqToMidi = function(f){
    var mathlog2 = Math.log(f/440) / Math.log(2);
    var m = Math.round(12*mathlog2)+57;
    return m;
  };

  /**
   *  Returns the frequency value of a MIDI note value.
   *  General MIDI treats notes as integers where middle C
   *  is 60, C# is 61, D is 62 etc. Useful for generating
   *  musical frequencies with oscillators.
   *  
   *  @method  midiToFreq
   *  @param  {Number} midiNote The number of a MIDI note
   *  @return {Number} Frequency value of the given MIDI note
   *  @example
   *  <div><code>
   *  var notes = [60, 64, 67, 72];
   *  var i = 0;
   *  
   *  function setup() {
   *    osc = new p5.Oscillator('Triangle');
   *    osc.start();
   *    frameRate(1);
   *  }
   *  
   *  function draw() {
   *    var freq = midiToFreq(notes[i]);
   *    osc.freq(freq);
   *    i++;
   *    if (i >= notes.length){
   *      i = 0;
   *    }
   *  }
   *  </code></div>
   */
  p5.prototype.midiToFreq = function(m) {
    return 440 * Math.pow(2, (m-69)/12.0);
  };

  /**
   *  List the SoundFile formats that you will include. LoadSound 
   *  will search your directory for these extensions, and will pick
   *  a format that is compatable with the client's web browser.
   *  <a href="http://media.io/">Here</a> is a free online file
   *  converter.
   *  
   *  @method soundFormats
   *  @param {String|Strings} formats i.e. 'mp3', 'wav', 'ogg'
   *  @example
   *  <div><code>
   *  function preload() {
   *    // set the global sound formats
   *    soundFormats('mp3', 'ogg');
   *    
   *    // load either beatbox.mp3, or .ogg, depending on browser
   *    mySound = loadSound('../sounds/beatbox.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.soundFormats = function(){
    // reset extensions array
    p5sound.extensions = [];
    // add extensions
    for (var i = 0; i < arguments.length; i++){
      arguments[i] = arguments[i].toLowerCase();
      if (['mp3','wav','ogg', 'm4a', 'aac'].indexOf(arguments[i]) > -1){
        p5sound.extensions.push(arguments[i]);
      } else {
        throw arguments[i] + ' is not a valid sound format!';
      }
    }
  };

  // register removeSound to dispose of p5sound SoundFiles and Oscillators when sketch ends
  p5.prototype._registerRemoveFunc('disposeSound');

  p5.prototype.disposeSound = function(){
    for (var i = 0; i < p5sound.soundArray.length; i++){
      p5sound.soundArray[i].dispose();
    }
  };

  p5.prototype._checkFileFormats = function(paths) {
    var path;
    // if path is a single string, check to see if extension is provided
    if (typeof(paths) === 'string') {
      path = paths;
      // see if extension is provided
      var extTest = path.split('.').pop();
      // if an extension is provided...
      if (['mp3','wav','ogg', 'm4a', 'aac'].indexOf(extTest) > -1) {
        var supported = p5.prototype.isFileSupported(extTest);
        if (supported){
          path = path;
        }
        else {
          var pathSplit = path.split('.');
          var pathCore = pathSplit[pathSplit.length - 1];
          for (var i = 0; i<p5sound.extensions.length; i++){
            var extension = p5sound.extensions[i];
            var supported = p5.prototype.isFileSupported(extension);
            if (supported) {
              pathCore = '';
              if (pathSplit.length === 2) {
                pathCore += pathSplit[0];
              }
              for (var i = 1; i <= pathSplit.length - 2; i++){
                var p = pathSplit[i];
                pathCore += '.' + p;
              }
              path = pathCore += '.';
              path = path += extension;
              break;
            }
          }
        }
      }
      // if no extension is provided...
      else {
        for (var i = 0; i<p5sound.extensions.length; i++){
          var extension = p5sound.extensions[i];
          var supported = p5.prototype.isFileSupported(extension);
          if (supported) {
            path = path + '.' + extension;
            break;
          }
        }
      }
    } // end 'if string'

    // path can either be a single string, or an array
    else if (typeof(paths) === 'object') {
      for (var i = 0; i<paths.length; i++) {
        var extension = paths[i].split('.').pop();
        var supported = p5.prototype.isFileSupported(extension);
        if (supported) {
          // console.log('.'+extension + ' is ' + supported +
          //  ' supported by your browser.');
          path = paths[i];
          break;
        }
      }
    }
    return path;
  };

});