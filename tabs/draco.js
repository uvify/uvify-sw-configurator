'use strict';
var Draco_OSD_Serial_Port = 7;

var PID_Default = [ 
				[44, 40, 20],
				[58, 50, 22],
				[70, 45, 20]
	];
var PID_Basic_Tunings = {
	RC_EXPO:	 	0.4,
	RC_RATE:		1.2,
	RC_YAW_EXPO:	0.4,
	rcYawRate:		1.2,
	pitch_rate:		0.0,
	roll_rate:		0.0,
	yaw_rate:		0.0,
	};
var PID_BasicIntermediate_Tunings = {
	RC_EXPO:	 	0.5,
	RC_RATE:		2.0,
	RC_YAW_EXPO:	0.5,
	rcYawRate:		2.0,
	pitch_rate:		0.0,
	roll_rate:		0.0,
	yaw_rate:		0.0,
};
var PID_Intermediate_Tunings = {
	RC_EXPO:	 	0.6,
	RC_RATE:		2.07,
	RC_YAW_EXPO:	0.6,
	rcYawRate:		2.07,
	pitch_rate:		0.0,
	roll_rate:		0.0,
	yaw_rate:		0.0,
};
var PID_Advanced_Tunings = {
	RC_EXPO:	 	0.6,
	RC_RATE:		2.13,
	RC_YAW_EXPO:	0.6,
	rcYawRate:		2.13,
	pitch_rate:		0.0,
	roll_rate:		0.0,
	yaw_rate:		0.0,	
};
	/*
var PID_Default_Tunings = [{
		RC_EXPO:	 	0.4,
		RC_RATE:		1.2,
		RC_YAW_EXPO:	0.4,
		rcYawRate:		1.2,
		pitch_rate:		0.0,
		roll_rate:		0.0,
		yaw_rate:		0.0,
	},{
 		RC_EXPO:	 	0.5,
		RC_RATE:		2.0,
		RC_YAW_EXPO:	0.5,
		rcYawRate:		2.0,
		pitch_rate:		0.0,
		roll_rate:		0.0,
		yaw_rate:		0.0,
	}, {
 		RC_EXPO:	 	0.6,
		RC_RATE:		2.07,
		RC_YAW_EXPO:	0.6,
		rcYawRate:		2.07,
		pitch_rate:		0.0,
		roll_rate:		0.0,
		yaw_rate:		0.0,
	},{
 		RC_EXPO:	 	0.6,
		RC_RATE:		2.13,
		RC_YAW_EXPO:	0.6,
		rcYawRate:		2.13,
		pitch_rate:		0.0,
		roll_rate:		0.0,
		yaw_rate:		0.0,
	}]
};
*/
TABS.draco = {

};

TABS.draco.initialize = function (callback, scrollPosition) {
    var self = this;
	if (BF_CONFIG) {
		updateTabList(BF_CONFIG.features);
	}
    if (GUI.active_tab != 'draco') {
        GUI.active_tab = 'draco';
    }

    function load_html() {
        $('#content').load("./tabs/draco.html", process_html);
    }
	

    MSP.send_message(MSPCodes.MSP_BF_CONFIG, false, false, function () {
		MSP.send_message(MSPCodes.MSP_RX_CONFIG, false, false, function () {
			MSP.send_message(MSPCodes.MSP_MISC, false, false, function () {
				MSP.send_message(MSPCodes.MSP_RX_MAP, false, false, function () {
					MSP.send_message(MSPCodes.MSP_RC, false, false, function () {
						MSP.send_message(MSPCodes.MSP_BOXNAMES, false, false, function () {
							MSP.send_message(MSPCodes.MSP_MODE_RANGES, false, false, function () {
								MSP.send_message(MSPCodes.MSP_BOXIDS, false, false, function () {	
									MSP.send_message(MSPCodes.MSP_CF_SERIAL_CONFIG, false, false, function () {	
										MSP.send_message(MSPCodes.MSP_PIDNAMES, false, false, function () {	
											MSP.send_message(MSPCodes.MSP_PID, false, false, function () {	
												MSP.send_message(MSPCodes.MSP_RC_TUNING, false, false, function () {	
													MSP.send_message(MSPCodes.MSP_DATAFLASH_SUMMARY, false, false, function () {	
														MSP.send_message(MSPCodes.MSP_SDCARD_SUMMARY, false, false, function () {
															MSP.send_message(MSPCodes.MSP_BLACKBOX_CONFIG, false, false, load_html);
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
    function pid_and_rc_to_form() {
        self.setProfile();
        if (semver.gte(CONFIG.flightControllerVersion, "3.0.0")) {
            self.setRateProfile();
        }

        // Fill in the data from PIDs array
        var i = 0;
        $('.pid_tuning .ROLL input').each(function () {
            switch (i) {
                case 0:
                    $(this).val(PIDs[0][i++]);
                    break;
                case 1:
                    $(this).val(PIDs[0][i++]);
                    break;
                case 2:
                    $(this).val(PIDs[0][i++]);
                    break;
            }
        });

        i = 0;
        $('.pid_tuning .PITCH input').each(function () {
            switch (i) {
                case 0:
                    $(this).val(PIDs[1][i++]);
                    break;
                case 1:
                    $(this).val(PIDs[1][i++]);
                    break;
                case 2:
                    $(this).val(PIDs[1][i++]);
                    break;
            }
        });

        i = 0;
        $('.pid_tuning .YAW input').each(function () {
            switch (i) {
                case 0:
                    $(this).val(PIDs[2][i++]);
                    break;
                case 1:
                    $(this).val(PIDs[2][i++]);
                    break;
            }
        });

        // Fill in data from RC_tuning object
        $('.pid_tuning input[name="rc_rate"]').val(RC_tuning.RC_RATE.toFixed(2));
        $('.pid_tuning input[name="roll_pitch_rate"]').val(RC_tuning.roll_pitch_rate.toFixed(2));
        $('.pid_tuning input[name="roll_rate"]').val(RC_tuning.roll_rate.toFixed(2));
        $('.pid_tuning input[name="pitch_rate"]').val(RC_tuning.pitch_rate.toFixed(2));
        $('.pid_tuning input[name="yaw_rate"]').val(RC_tuning.yaw_rate.toFixed(2));
        $('.pid_tuning input[name="rc_expo"]').val(RC_tuning.RC_EXPO.toFixed(2));
        $('.pid_tuning input[name="rc_yaw_expo"]').val(RC_tuning.RC_YAW_EXPO.toFixed(2));
		$('.pid_tuning input[name="rc_rate_yaw"]').val(RC_tuning.rcYawRate.toFixed(2));
		var j=0;
		var detected_mode = -1;
		for (i=0;i<3;i++){
			for (j=0;j<3;j++){
				if (i == 2 && j == 2)
					continue;
				if (PIDs[i][j] != PID_Default[i][j]) {
					detected_mode = 4;
					break;
				}
			}
			if (detected_mode == 4)
				break;
		}

		if (detected_mode != 4) {
			if (RC_tuning.RC_RATE == PID_Basic_Tunings.RC_RATE && 
				RC_tuning.RC_EXPO == PID_Basic_Tunings.RC_EXPO && 
				RC_tuning.RC_YAW_EXPO == PID_Basic_Tunings.RC_YAW_EXPO && 
				RC_tuning.rcYawRate == PID_Basic_Tunings.rcYawRate && 
				RC_tuning.pitch_rate == PID_Basic_Tunings.pitch_rate && 
				RC_tuning.roll_rate == PID_Basic_Tunings.roll_rate && 
				RC_tuning.yaw_rate == PID_Basic_Tunings.yaw_rate) {
					detected_mode = 0;
				}
			else if (RC_tuning.RC_RATE == PID_BasicIntermediate_Tunings.RC_RATE && 
				RC_tuning.RC_EXPO == PID_BasicIntermediate_Tunings.RC_EXPO && 
				RC_tuning.RC_YAW_EXPO == PID_BasicIntermediate_Tunings.RC_YAW_EXPO && 
				RC_tuning.rcYawRate == PID_BasicIntermediate_Tunings.rcYawRate && 
				RC_tuning.pitch_rate == PID_BasicIntermediate_Tunings.pitch_rate && 
				RC_tuning.roll_rate == PID_BasicIntermediate_Tunings.roll_rate && 
				RC_tuning.yaw_rate == PID_BasicIntermediate_Tunings.yaw_rate) {
					detected_mode = 1;
				}
			else if (RC_tuning.RC_RATE == PID_Intermediate_Tunings.RC_RATE && 
				RC_tuning.RC_EXPO == PID_Intermediate_Tunings.RC_EXPO && 
				RC_tuning.RC_YAW_EXPO == PID_Intermediate_Tunings.RC_YAW_EXPO && 
				RC_tuning.rcYawRate == PID_Intermediate_Tunings.rcYawRate && 
				RC_tuning.pitch_rate == PID_Intermediate_Tunings.pitch_rate && 
				RC_tuning.roll_rate == PID_Intermediate_Tunings.roll_rate && 
				RC_tuning.yaw_rate == PID_Intermediate_Tunings.yaw_rate) {
					detected_mode = 2;
				}
			else if (RC_tuning.RC_RATE == PID_Advanced_Tunings.RC_RATE && 
				RC_tuning.RC_EXPO == PID_Advanced_Tunings.RC_EXPO && 
				RC_tuning.RC_YAW_EXPO == PID_Advanced_Tunings.RC_YAW_EXPO && 
				RC_tuning.rcYawRate == PID_Advanced_Tunings.rcYawRate && 
				RC_tuning.pitch_rate == PID_Advanced_Tunings.pitch_rate && 
				RC_tuning.roll_rate == PID_Advanced_Tunings.roll_rate && 
				RC_tuning.yaw_rate == PID_Advanced_Tunings.yaw_rate) {
					detected_mode = 3;
				}
			else
				detected_mode = 4;
		}
		var pid_mode_e = $('select.pidMode-select');
		if (detected_mode == 4) { // Expert mode
			pid_mode_e.append('<option value="' + 4 + '">'+ 'Expert' + '</option>');
			pid_mode_e.val(4);
		}
		else {
			pid_mode_e.val(detected_mode);
		}
		
		
		pid_mode_e.change(function() {
			if (this.value == 4) {
				i = 0;
				$('.pid_tuning .ROLL input').each(function () {
					switch (i) {
						case 0:
							$(this).val(PIDs[0][i++]);
							break;
						case 1:
							$(this).val(PIDs[0][i++]);
							break;
						case 2:
							$(this).val(PIDs[0][i++]);
							break;
					}
				});

				i = 0;
				$('.pid_tuning .PITCH input').each(function () {
					switch (i) {
						case 0:
							$(this).val(PIDs[1][i++]);
							break;
						case 1:
							$(this).val(PIDs[1][i++]);
							break;
						case 2:
							$(this).val(PIDs[1][i++]);
							break;
					}
				});

				i = 0;
				$('.pid_tuning .YAW input').each(function () {
					switch (i) {
						case 0:
							$(this).val(PIDs[2][i++]);
							break;
						case 1:
							$(this).val(PIDs[2][i++]);
							break;
					}
				});	
				$('.pid_tuning input[name="rc_rate"]').val(RC_tuning.RC_RATE.toFixed(2));
				$('.pid_tuning input[name="roll_pitch_rate"]').val(RC_tuning.roll_pitch_rate.toFixed(2));
				$('.pid_tuning input[name="roll_rate"]').val(RC_tuning.roll_rate.toFixed(2));
				$('.pid_tuning input[name="pitch_rate"]').val(RC_tuning.pitch_rate.toFixed(2));
				$('.pid_tuning input[name="yaw_rate"]').val(RC_tuning.yaw_rate.toFixed(2));
				$('.pid_tuning input[name="rc_expo"]').val(RC_tuning.RC_EXPO.toFixed(2));
				$('.pid_tuning input[name="rc_yaw_expo"]').val(RC_tuning.RC_YAW_EXPO.toFixed(2));
				$('.pid_tuning input[name="rc_rate_yaw"]').val(RC_tuning.rcYawRate.toFixed(2));				
			}
			else {
				i = 0;
				$('.pid_tuning .ROLL input').each(function () {
					switch (i) {
						case 0:
							$(this).val(PID_Default[0][i++]);
							break;
						case 1:
							$(this).val(PID_Default[0][i++]);
							break;
						case 2:
							$(this).val(PID_Default[0][i++]);
							break;
					}
				});
				i = 0;
				$('.pid_tuning .PITCH input').each(function () {
					switch (i) {
						case 0:
							$(this).val(PID_Default[1][i++]);
							break;
						case 1:
							$(this).val(PID_Default[1][i++]);
							break;
						case 2:
							$(this).val(PID_Default[1][i++]);
							break;
					}
				});
				i = 0;
				$('.pid_tuning .YAW input').each(function () {
					switch (i) {
						case 0:
							$(this).val(PID_Default[2][i++]);
							break;
						case 1:
							$(this).val(PID_Default[2][i++]);
							break;
					}
				});
				var Tuning;
				if (this.value == 0) 
					Tuning = PID_Basic_Tunings;
				else if (this.value == 1)
					Tuning = PID_BasicIntermediate_Tunings;
				else if(this.value == 2)
					Tuning = PID_Intermediate_Tunings;
				else if(this.value == 3)
					Tuning = PID_Advanced_Tunings;
		
				$('.pid_tuning input[name="rc_rate"]').val(Tuning.RC_RATE.toFixed(2));
				$('.pid_tuning input[name="roll_rate"]').val(Tuning.roll_rate.toFixed(2));
				$('.pid_tuning input[name="pitch_rate"]').val(Tuning.pitch_rate.toFixed(2));
				$('.pid_tuning input[name="yaw_rate"]').val(Tuning.yaw_rate.toFixed(2));
				$('.pid_tuning input[name="rc_expo"]').val(Tuning.RC_EXPO.toFixed(2));
				$('.pid_tuning input[name="rc_yaw_expo"]').val(Tuning.RC_YAW_EXPO.toFixed(2));
				$('.pid_tuning input[name="rc_rate_yaw"]').val(Tuning.rcYawRate.toFixed(2));				
			}
		});
    }

    function form_to_pid_and_rc() {
        // Fill in the data from PIDs array
        // Catch all the changes and stuff the inside PIDs array
        var i = 0;
        $('table.pid_tuning tr.ROLL .pid_data input').each(function () {
            PIDs[0][i++] = parseFloat($(this).val());
        });

        i = 0;
        $('table.pid_tuning tr.PITCH .pid_data input').each(function () {
            PIDs[1][i++] = parseFloat($(this).val());
        });

        i = 0;
        $('table.pid_tuning tr.YAW .pid_data input').each(function () {
            PIDs[2][i++] = parseFloat($(this).val());
        });

        // catch RC_tuning changes
        RC_tuning.RC_RATE = parseFloat($('.pid_tuning input[name="rc_rate"]').val());
        RC_tuning.roll_pitch_rate = parseFloat($('.pid_tuning input[name="roll_pitch_rate"]').val());
        RC_tuning.roll_rate = parseFloat($('.pid_tuning input[name="roll_rate"]').val());
        RC_tuning.pitch_rate = parseFloat($('.pid_tuning input[name="pitch_rate"]').val());
        RC_tuning.yaw_rate = parseFloat($('.pid_tuning input[name="yaw_rate"]').val());
        RC_tuning.RC_EXPO = parseFloat($('.pid_tuning input[name="rc_expo"]').val());
        RC_tuning.RC_YAW_EXPO = parseFloat($('.pid_tuning input[name="rc_yaw_expo"]').val());
        RC_tuning.rcYawRate = parseFloat($('.pid_tuning input[name="rc_rate_yaw"]').val());
    }	
    function configureRangeTemplate(auxChannelCount) {

        var rangeTemplate = $('#tab-auxiliary-templates .range');
        
        var channelList = $(rangeTemplate).find('.channel');
        var channelOptionTemplate = $(channelList).find('option');
        channelOptionTemplate.remove();
        for (var channelIndex = 0; channelIndex < auxChannelCount; channelIndex++) {
            var channelOption = channelOptionTemplate.clone();
            channelOption.text('AUX ' + (channelIndex + 1));
            channelOption.val(channelIndex);
            channelList.append(channelOption);
        }
        channelList.val(0);
    }
	function createMode(modeIndex, modeId) {
        var modeTemplate = $('#tab-draco-templates .mode');
        var newMode = modeTemplate.clone();
        
        var modeName = AUX_CONFIG[modeIndex];
        $(newMode).attr('id', 'mode-' + modeIndex);
        $(newMode).find('.name').text(modeName);
        
        $(newMode).data('index', modeIndex);
        $(newMode).data('id', modeId);
        
        $(newMode).find('.name').data('modeElement', newMode);
        $(newMode).find('a.addRange').data('modeElement', newMode);

        return newMode; 
    }
    function addRangeToMode(modeElement, auxChannelIndex, range) {
        var modeIndex = $(modeElement).data('index');

        var channel_range = {
                'min': [  900 ],
                'max': [ 2100 ]
            };
        
        var rangeValues = [1300, 1700]; // matches MultiWii default values for the old checkbox MID range.
        if (range != undefined) {
            rangeValues = [range.start, range.end];
        }

        var rangeIndex = $(modeElement).find('.range').length;
        
        var rangeElement = $('#tab-draco-templates .range').clone();
        rangeElement.attr('id', 'mode-' + modeIndex + '-range-' + rangeIndex);
        modeElement.find('.ranges').append(rangeElement);
        
        $(rangeElement).find('.channel-slider').noUiSlider({
            start: rangeValues,
            behaviour: 'snap-drag',
            margin: 50,
            step: 25,
            connect: true,
            range: channel_range,
            format: wNumb({
                decimals: 0,
            })
        });

        var elementName =  '#mode-' + modeIndex + '-range-' + rangeIndex;
        $(elementName + ' .channel-slider').Link('lower').to($(elementName + ' .lowerLimitValue'));
        $(elementName + ' .channel-slider').Link('upper').to($(elementName + ' .upperLimitValue'));

        $(rangeElement).find(".pips-channel-range").noUiSlider_pips({
            mode: 'values',
            values: [900, 1000, 1200, 1400, 1500, 1600, 1800, 2000, 2100],
            density: 4,
            stepped: true
        });
        
        $(rangeElement).find('.deleteRange').data('rangeElement', rangeElement);

        $(rangeElement).find('a.deleteRange').click(function () {
            var rangeElement = $(this).data('rangeElement');
            rangeElement.remove();
        });
        
        $(rangeElement).find('.channel').val(auxChannelIndex);
    }	
	function box_highlight(auxChannelIndex, channelPosition) {
		if (channelPosition < 900) {
			channelPosition = 900;
		} else if (channelPosition > 2100) {
			channelPosition = 2100;
		}
	}
	
	function update_marker(auxChannelIndex, channelPosition) {
		var percentage = (channelPosition - 900) / (2100-900) * 100;
		
		$('.modes .ranges .range').each( function () {
			var auxChannelCandidateIndex = $(this).find('.channel').val();
			if (auxChannelCandidateIndex != auxChannelIndex) {
				return;
			}
			
			$(this).find('.marker').css('left', percentage + '%');
		});
	}
	
    function process_html() {
        // translate to user-selected language
        localize();
/*
        var auxChannelCount = RC.active_channels - 4;

        configureRangeTemplate(auxChannelCount);

        var modeTableBodyElement = $('.tab-draco .modes tbody') 

		for (var modeIndex = 0; modeIndex < AUX_CONFIG.length; modeIndex++) {
			var modeId = AUX_CONFIG_IDS[modeIndex];
			if (!(AUX_CONFIG[modeIndex] == "ARM" || AUX_CONFIG[modeIndex] == "ANGLE" || AUX_CONFIG[modeIndex] == "HORIZON"))
				continue;
			var newMode = createMode(modeIndex, modeId);
			
			modeTableBodyElement.append(newMode);
            for (var modeRangeIndex = 0; modeRangeIndex < MODE_RANGES.length; modeRangeIndex++) {
                var modeRange = MODE_RANGES[modeRangeIndex];
                
                if (modeRange.id != modeId) {
                    continue;
                }
                
                var range = modeRange.range;
                if (!(range.start < range.end)) {
                    continue; // invalid!
                }
                addRangeToMode(newMode, modeRange.auxChannelIndex, range);
            }
			
		}
		
        
		*/
        var bar_names = [
                chrome.i18n.getMessage('controlAxisRoll'),
                chrome.i18n.getMessage('controlAxisPitch'),
                chrome.i18n.getMessage('controlAxisYaw'),
                chrome.i18n.getMessage('controlAxisThrottle')
            ],
            bar_container = $('.tab-draco .bars'),
            aux_index = 1;

        var num_bars = (RC.active_channels > 0) ? RC.active_channels : 8;

        for (var i = 0; i < num_bars; i++) {
            var name;
            if (i < bar_names.length) {
                name = bar_names[i];
            } else {
                name = chrome.i18n.getMessage("controlAxisAux" + (aux_index++));
            }

            bar_container.append('\
                <ul>\
                    <li class="name">' + name + '</li>\
                    <li class="meter">\
                        <div class="meter-bar">\
                            <div class="label"></div>\
                            <div class="fill' + (RC.active_channels == 0 ? 'disabled' : '') + '">\
                                <div class="label"></div>\
                            </div>\
                        </div>\
                    </li>\
                </ul>\
            ');
        }

        // we could probably use min and max throttle for the range, will see
        var meter_scale = {
            'min': 800,
            'max': 2200
        };

        var meter_fill_array = [];
        $('.meter .fill', bar_container).each(function () {
            meter_fill_array.push($(this));
        });

        var meter_label_array = [];
        $('.meter', bar_container).each(function () {
            meter_label_array.push($('.label' , this));
        });

        // correct inner label margin on window resize (i don't know how we could do this in css)
        self.resize = function () {
            var containerWidth = $('.meter:first', bar_container).width(),
                labelWidth = $('.meter .label:first', bar_container).width(),
                margin = (containerWidth) - (labelWidth / 2);

            for (var i = 0; i < meter_label_array.length; i++) {
                meter_label_array[i].css('margin-left', margin);
            }
        };
		
		$('#content').scrollTop((scrollPosition) ? scrollPosition : 0);

		function update_ui() {
			// update bars with latest data
			for (var i = 0; i < RC.active_channels; i++) {
				meter_fill_array[i].css('width', ((RC.channels[i] - meter_scale.min) / (meter_scale.max - meter_scale.min) * 100).clamp(0, 100) + '%');
				meter_label_array[i].text(RC.channels[i]);
			}
			for (var i = 0; i < AUX_CONFIG.length; i++) {
				var modeElement = $('#mode-' + i); 
				if (modeElement.find(' .range').length == 0) {
					// if the mode is unused, skip it
					modeElement.removeClass('off').removeClass('on');
					continue;
				}
				
				if (bit_check(CONFIG.mode, i)) {
					$('.mode .name').eq(i).data('modeElement').addClass('on').removeClass('off');
				} else {
					$('.mode .name').eq(i).data('modeElement').removeClass('on').addClass('off');
				}
			}

			var auxChannelCount = RC.active_channels - 4;

			for (var i = 0; i < (auxChannelCount); i++) {
				box_highlight(i, RC.channels[i + 4]);
				update_marker(i, RC.channels[i + 4]);
			}   
		}		
		
		function get_fast_data() {
			MSP.send_message(MSPCodes.MSP_RC, false, false, function () {
				update_ui();
			});
        }
		function get_slow_data() {
			MSP.send_message(MSPCodes.MSP_RC, false, false, function () {
				update_ui();
			});
			
        }
		function get_very_slow_data() {
			MSP.send_message(MSPCodes.MSP_DATAFLASH_SUMMARY, false, false, function () {	
				MSP.send_message(MSPCodes.MSP_SDCARD_SUMMARY, false, false, function () {
					MSP.send_message(MSPCodes.MSP_BLACKBOX_CONFIG, false, false, update_blackbox);
				});
			});
			
		}
		function stick_to_form() {
			$('.sticks input[name="stick_min"]').val(RX_CONFIG.mincheck);
			$('.sticks input[name="stick_center"]').val(RX_CONFIG.midrc);
			$('.sticks input[name="stick_max"]').val(RX_CONFIG.maxcheck);
		}
		function form_to_stick() {
			RX_CONFIG.mincheck = parseInt($('.sticks input[name="stick_min"]')["0"].value);
			RX_CONFIG.midrc = parseInt($('.sticks input[name="stick_center"]')["0"].value);
			RX_CONFIG.maxcheck = parseInt($('.sticks input[name="stick_max"]')["0"].value);
		}
		function formatFilesizeKilobytes(kilobytes) {
			if (kilobytes < 1024) {
				return Math.round(kilobytes) + "kB";
			}
			
			var 
				megabytes = kilobytes / 1024,
				gigabytes;
			
			if (megabytes < 900) {
				return megabytes.toFixed(1) + "MB";
			} else {
				gigabytes = megabytes / 1024;
				
				return gigabytes.toFixed(1) + "GB";
			}
		}		
		function formatFilesizeBytes(bytes) {
			if (bytes < 1024) {
				return bytes + "B";
			}
			return formatFilesizeKilobytes(bytes / 1024);
		}		
		function update_bar_width(bar, value, total, label, valuesAreKilobytes) {
			if (value > 0) {
				bar.css({
					width: (value / total * 100) + "%",
					display: 'block'
				});
				
				$("div", bar).text((label ? label + " " : "") + (valuesAreKilobytes ? formatFilesizeKilobytes(value) : formatFilesizeBytes(value)));
			} else {
				bar.css({
					display: 'none'
				});
			}
		}
		
		function update_blackbox() {
			switch (SDCARD.state) {
				case MSP.SDCARD_STATE_NOT_PRESENT:
					$(".sdcard-status").text("No card inserted");
				break;
				case MSP.SDCARD_STATE_FATAL:
					$(".sdcard-status").html("Fatal error<br>Reboot to retry");
				break;
				case MSP.SDCARD_STATE_READY:
					$(".sdcard-status").text("Card ready");
				break;
				case MSP.SDCARD_STATE_CARD_INIT:
					$(".sdcard-status").text("Card starting...");
				break;
				case MSP.SDCARD_STATE_FS_INIT:
					$(".sdcard-status").text("Filesystem starting...");
				break;
				default:
					$(".sdcard-status").text("Unknown state " + SDCARD.state);
			}			
			$(".tab-draco")
				.toggleClass("sdcard-error", SDCARD.state == MSP.SDCARD_STATE_FATAL)
				.toggleClass("sdcard-initializing", SDCARD.state == MSP.SDCARD_STATE_CARD_INIT || SDCARD.state == MSP.SDCARD_STATE_FS_INIT)
				.toggleClass("sdcard-ready", SDCARD.state == MSP.SDCARD_STATE_READY);
				
			update_bar_width($(".tab-draco .draco-dataflash-used"), DATAFLASH.usedSize, DATAFLASH.totalSize, "Used space", false);
			update_bar_width($(".tab-draco .draco-dataflash-free"), DATAFLASH.totalSize - DATAFLASH.usedSize, DATAFLASH.totalSize, "Free space", false);
			if (SDCARD.state == MSP.SDCARD_STATE_READY){
				update_bar_width($(".tab-draco .draco-sdcard-other"), SDCARD.totalSizeKB - SDCARD.freeSizeKB, SDCARD.totalSizeKB, "Unavailable space", true);
				update_bar_width($(".tab-draco .draco-sdcard-free"), SDCARD.freeSizeKB, SDCARD.totalSizeKB, "Free space for logs", true);
			}
			else {
				update_bar_width($(".tab-draco .draco-sdcard-other"), 0, SDCARD.totalSizeKB, "Unavailable space", true);
				update_bar_width($(".tab-draco .draco-sdcard-free"), 0, SDCARD.totalSizeKB, "Free space for logs", true);				
			}
		}
		function populate_blackbox_device() {
			var
				deviceSelect = $(".draco-blackboxDevice select").empty();
			
			if (DATAFLASH.ready) {
				deviceSelect.append('<option value="1">On-board dataflash chip</option>');
			}
			if (SDCARD.supported) {
				deviceSelect.append('<option value="2">On-board SD card slot</option>');
			}
			deviceSelect.val(BLACKBOX.blackboxDevice);			
		}
		function gcd(a, b) {
			if (b == 0)
				return a;
			
			return gcd(b, a % b);
		}		
		function save_to_eeprom() {
			MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, reboot);
		}		
		function reboot() {
			GUI.log(chrome.i18n.getMessage('configurationEepromSaved'));

			GUI.tab_switch_cleanup(function() {
				MSP.send_message(MSPCodes.MSP_SET_REBOOT, false, false, reinitialize);
			});
		}
		function reinitialize() {
			GUI.log(chrome.i18n.getMessage('deviceRebooting'));

			if (BOARD.find_board_definition(CONFIG.boardIdentifier).vcp) { // VCP-based flight controls may crash old drivers, we catch and reconnect
				$('a.connect').click();
				GUI.timeout_add('start_connection',function start_connection() {
					$('a.connect').click();
				},2500);
			} else {

				GUI.timeout_add('waiting_for_bootup', function waiting_for_bootup() {
					MSP.send_message(MSPCodes.MSP_STATUS, false, false, function() {
						GUI.log(chrome.i18n.getMessage('deviceReady'));
						TABS.configuration.initialize(false, $('#content').scrollTop());
					});
				},1500); // 1500 ms seems to be just the right amount of delay to prevent data request timeouts
			}
		}
		function populate_blackbox_logging_rate() {
			var 
				loggingRates = [
					 {num: 1, denom: 1},
					 {num: 1, denom: 2},
					 {num: 1, denom: 3},
					 {num: 1, denom: 4},
					 {num: 1, denom: 5},
					 {num: 1, denom: 6},
					 {num: 1, denom: 7},
					 {num: 1, denom: 8},
					 {num: 1, denom: 16},
					 {num: 1, denom: 32},
				],
				loggingRatesSelect = $(".draco-blackboxRate select");
			
			var addedCurrentValue = false;
			var pidRate = 8000 / PID_ADVANCED_CONFIG.gyro_sync_denom / PID_ADVANCED_CONFIG.pid_process_denom; 
			for (var i = 0; i < loggingRates.length; i++) {
				var loggingRate = Math.round(pidRate / loggingRates[i].denom);
				var loggingRateUnit = " Hz";
				if (loggingRate != Infinity) {
					if (gcd(loggingRate, 1000)==1000) {
						loggingRate /= 1000;
						loggingRateUnit = " KHz";	
					}
				}
				loggingRatesSelect.append('<option value="' + loggingRates[i].num + '/' + loggingRates[i].denom + '">' 
					+ loggingRate + loggingRateUnit + ' (' + Math.round(loggingRates[i].num / loggingRates[i].denom * 100) + '%)</option>');
				
			}
			loggingRatesSelect.val(BLACKBOX.blackboxRateNum + '/' + BLACKBOX.blackboxRateDenom);			
		}
		function populate_serialrx_provider() {
			var serialRXtypes = [
				'SPEKTRUM1024',
				'SPEKTRUM2048',
				'SBUS',
				'SUMD',
				'SUMH',
				'XBUS_MODE_B',
				'XBUS_MODE_B_RJ01'
			];

			serialRXtypes.push('IBUS');
			serialRXtypes.push('JETIEXBUS');
			serialRXtypes.push('CRSF');
			serialRXtypes.push('SRXL');

			var serialRX_e = $("select.draco-rxMode-select");
			for (var i = 0; i < serialRXtypes.length; i++) {
				serialRX_e.append('<option value="' + i + '">' + serialRXtypes[i] + '</option>');
			}

			serialRX_e.change(function () {
				RX_CONFIG.serialrx_provider = parseInt($(this).val());
			});

			// select current serial RX type
			serialRX_e.val(RX_CONFIG.serialrx_provider);
		}
		function populate_channel_map() {
			var RC_MAP_Letters = ['A', 'E', 'R', 'T', '1', '2', '3', '4'];

			var strBuffer = [];
			for (var i = 0; i < RC_MAP.length; i++) {
				strBuffer[RC_MAP[i]] = RC_MAP_Letters[i];
			}

			// reconstruct
			var str = strBuffer.join('');

			// set current value
			$('input[name="rcmap"]').val(str);

			// validation / filter
			var last_valid = str;

			$('input[name="rcmap"]').on('input', function () {
				var val = $(this).val();

				// limit length to max 8
				if (val.length > 8) {
					val = val.substr(0, 8);
					$(this).val(val);
				}
			});

			$('input[name="rcmap"]').focusout(function () {
				var val = $(this).val(),
					strBuffer = val.split(''),
					duplicityBuffer = [];

				if (val.length != 8) {
					$(this).val(last_valid);
					return false;
				}

				// check if characters inside are all valid, also check for duplicity
				for (var i = 0; i < val.length; i++) {
					if (RC_MAP_Letters.indexOf(strBuffer[i]) < 0) {
						$(this).val(last_valid);
						return false;
					}

					if (duplicityBuffer.indexOf(strBuffer[i]) < 0) {
						duplicityBuffer.push(strBuffer[i]);
					} else {
						$(this).val(last_valid);
						return false;
					}
				}
			});

			// handle helper
			$('select[name="rcmap_helper"]').val(0); // go out of bounds
			$('select[name="rcmap_helper"]').change(function () {
				$('input[name="rcmap"]').val($(this).val());
			});			
		}
		function update_video_mode() {
			var i=0;
			var videoMode_e = $("select.videoMode-select");
			
			for (i=0;i<SERIAL_CONFIG.ports.length;i++){
				if (SERIAL_CONFIG.ports[i].identifier == Draco_OSD_Serial_Port) {
					if (SERIAL_CONFIG.ports[i].functions[0] == "MSP") {
						videoMode_e.val(0);
					}
					else if (SERIAL_CONFIG.ports[i].functions[0] == "TELEMETRY_MAVLINK" && BF_CONFIG.features.isEnabled('TELEMETRY')) {
						videoMode_e.val(1);
					}
					else {
						videoMode_e.append('<option value="' + 2 + '">' + 'Unknown' + '</option>');
						videoMode_e.val(2);
					}
					break;
				}
			}
		}
		function populate_rssi_channel() {
			var rssi_channel_e = $('select[name="draco-Rssi-Channel-select"]');
			rssi_channel_e.append('<option value="0">Disabled</option>');
			for (var i = 1; i < RC.active_channels + 1; i++) {
				rssi_channel_e.append('<option value="' + i + '">' + i + '</option>');
			}

			rssi_channel_e.val(MISC.rssi_channel);
			
		}
		function form_to_video_mode() {
			var videoMode_e = $("select.videoMode-select");
			
			for (var i=0;i<SERIAL_CONFIG.ports.length;i++){
				if (SERIAL_CONFIG.ports[i].identifier == Draco_OSD_Serial_Port) {
					if (videoMode_e["0"].value == 0) {
						SERIAL_CONFIG.ports[i].functions[0] = "TELEMETRY_MAVLINK";
						if (BF_CONFIG.features.isEnabled('TELEMETRY') == false) {
							var mask = BF_CONFIG.features.getMask();
							BF_CONFIG.features.setMask(bit_set(mask, 10));
						}
					}
					break;
				}
			}
		}
		pid_and_rc_to_form();
		stick_to_form();
		update_blackbox();
		
		populate_blackbox_device();
		populate_blackbox_logging_rate();
		
		populate_serialrx_provider();
		populate_channel_map();
		populate_rssi_channel();
		
		update_video_mode();
		
		$('a.save').click(function () {		
			form_to_pid_and_rc();
			MISC.rssi_channel = parseInt($('select[name="draco-Rssi-Channel-select"]').val());
			
			var rate = $(".draco-blackboxRate select").val().split('/');
			
			BLACKBOX.blackboxRateNum = parseInt(rate[0], 10);
			BLACKBOX.blackboxRateDenom = parseInt(rate[1], 10);
			BLACKBOX.blackboxDevice = parseInt($(".draco-blackboxDevice select").val(), 10);

            var RC_MAP_Letters = ['A', 'E', 'R', 'T', '1', '2', '3', '4'];
            var strBuffer = $('input[name="rcmap"]').val().split('');

            for (var i = 0; i < RC_MAP.length; i++) {
                RC_MAP[i] = strBuffer.indexOf(RC_MAP_Letters[i]);
            }

			form_to_stick();
			// form_to_video_mode();
			
			MSP.send_message(MSPCodes.MSP_SET_BLACKBOX_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_BLACKBOX_CONFIG), false, function() {
				MSP.send_message(MSPCodes.MSP_SET_PID, mspHelper.crunch(MSPCodes.MSP_SET_PID), false, function() {
					MSP.send_message(MSPCodes.MSP_SET_PID_ADVANCED, mspHelper.crunch(MSPCodes.MSP_SET_PID_ADVANCED), false, function() {
						MSP.send_message(MSPCodes.MSP_SET_RC_TUNING, mspHelper.crunch(MSPCodes.MSP_SET_RC_TUNING), false, function() {
							MSP.send_message(MSPCodes.MSP_SET_MISC, mspHelper.crunch(MSPCodes.MSP_SET_MISC), false, function() {
								MSP.send_message(MSPCodes.MSP_SET_RX_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_RX_CONFIG), false, function() {
									MSP.send_message(MSPCodes.MSP_SET_RX_MAP, mspHelper.crunch(MSPCodes.MSP_SET_RX_MAP), false, save_to_eeprom);
								});
							});
						});
					});
				});
			});
			
		});
		
		GUI.interval_add('draco_data_fast', get_fast_data, 33, true); // 30 fps
		GUI.interval_add('draco_data_slow', get_slow_data, 250, true); // 4 fps
		GUI.interval_add('draco_data_very_slow', get_very_slow_data, 2000, true); // 4 fps
        GUI.content_ready(callback);
    }
};

TABS.draco.setProfile = function () {
    var self = this;

    self.currentProfile = CONFIG.profile;
    $('.tab-pid_tuning select[name="profile"]').val(self.currentProfile);
};

TABS.draco.setRateProfile = function () {
    var self = this;

    self.currentRateProfile = CONFIG.rateProfile;
    $('.tab-pid_tuning select[name="rate_profile"]').val(self.currentRateProfile);
};

TABS.draco.setDirty = function (isDirty) {
    var self = this;

    self.dirty = isDirty;
    $('.tab-pid_tuning select[name="profile"]').prop('disabled', isDirty);
    if (semver.gte(CONFIG.flightControllerVersion, "3.0.0")) {
        $('.tab-pid_tuning select[name="rate_profile"]').prop('disabled', isDirty);
    }
};

TABS.draco.cleanup = function (callback) {
    if (callback) callback();
};
