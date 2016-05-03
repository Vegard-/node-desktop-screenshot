"use strict";

module.exports = function(options, callback) {

	var path = require('path');
	var fs = require('fs');
	var childProcess = require('child_process');
	var temp = require('temp');

	// due to bug in jpgjs processing OSX jpg images https://github.com/notmasteryet/jpgjs/issues/34
	// when requesting JPG capture as PNG, so JIMP can read it
	var ext = extension(options.output);
	if(ext === "jpeg" || ext === "jpg") {
		options.intermediate = temp.path({ suffix: '.png' });; // create an intermediate file that can be processed, then deleted
		capture(options.intermediate, function(error, completed){
			callbackReturn.apply(this, arguments);
		});
	}
	else {
		capture(options.output, callbackReturn); // when jpegjs bug fixed, only need this line
	}

	return;

	function callbackReturn(error, success) {
		// called from capture
		// callback with options, in case options added
		callback(error, options);
	}

	function uniqueId() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

	function extension(file) {
		return path.extname(file).toLowerCase().substring(1);
	}

	function capture(output, callback) {
		var cmdBuilder = [
			"screencapture",
			"-t", path.extname(output).toLowerCase().substring(1), // will create PNG by default
			"-x", output
		];
		if (options.windowId){
			// Will only capture the specified window id.
			cmdBuilder.push('-t');
			cmdBuilder.push(options.windowId);
		}
		var cmd = cmdBuilder.join(' ');

		childProcess.exec(cmd, function(error, stdout, stderr) {
			if(error)
				callback(error, null);
			else {
				try {
					fs.statSync(output);
					callback(null, true);
				}
				catch (error) {
					callback(error, null);
				}
			}
		});
	}
};
