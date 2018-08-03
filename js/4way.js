

function _4way_command_to_string(command) {
    for (var field in _4way_commands)
        if (_4way_commands[field] == command)
            return field;

    return "invalid command: " + command;
};

function _4way_ack_to_string(ack) {
    for (var field in _4way_ack)
        if (_4way_ack[field] == ack)
            return field;

    return "invalid ack: " + ack;
}

// It is not advisable to queue-up commands as the serial interface may overflow.
// Multiple commands with the same `command` tag may be resolved incorrectly.
var _4way = {
	send_message: function (code, data, callback_sent, callback_msp, callback_onerror) {
		
	},
	cleanup: function() {
		
	},
    initFlash: function(target, callback_sent, callback_msp, callback_onerror) {
		if (!callback_onerror) {
		 var callbackOnError = false;
		} else {
		 var callbackOnError = true;
		}
		
        //return this.sendMessagePromised(_4way_commands.cmd_DeviceInitFlash, [ target ], 0).delay(250)
    },
	
};