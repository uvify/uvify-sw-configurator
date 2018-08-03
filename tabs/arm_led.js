'use strict';

TABS.arm_led = {
        wireMode: false,
        directions: ['n', 'e', 's', 'w', 'u', 'd']
    };
var _4way_mode = false;
var message111;
var interfaceMode;
var selected_mode_color;

TABS.arm_led.initialize = function (callback, scrollPosition) {
    var self = this;
    var selectedColorIndex = [null, null];
    var selectedModeColor = [null, null];
	
	var buffer_delay = false;
	var selected_esc = 0;
	var esc_settings = [];
	var esc_available = [];
	var esc_count = 0;
	var readBackSettings = null;
	var loading_data = false;
	var before_tab;
	var led_left = [0, 200, 400, 600, 0, 200];
	var led_top = [0, 0, 0, 0, 0, 300];	
	var led_width = 200;
	var led_height = 100;
	function compare(lhs_array, rhs_array) {
		if (lhs_array.byteLength != rhs_array.byteLength) {
			return false;
		}

		for (var i = 0; i < lhs_array.byteLength; ++i) {
			if (lhs_array[i] !== rhs_array[i]) {
				return false;
			}
		}

		return true;
	}	
    if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
        TABS.arm_led.functions = ['i', 'w', 'f', 'a', 't', 'r', 'c', 'g', 's', 'b'];
        TABS.arm_led.baseFuncs = ['c', 'f', 'a', 'b', 'g', 'r'];
        TABS.arm_led.overlays = ['t', 's', 'i', 'w'];
    } else {
        TABS.arm_led.functions = ['i', 'w', 'f', 'a', 't', 'r', 'c', 'g', 's', 'b', 'l', 'o', 'n'];
        TABS.arm_led.baseFuncs = ['c', 'f', 'a', 'l', 's', 'g', 'r'];
        TABS.arm_led.overlays = ['t', 'o', 'b', 'n', 'i', 'w'];
    }

    TABS.arm_led.wireMode = false;
	
    if (GUI.active_tab != 'arm_led') {
		before_tab = GUI.active_tab;
        GUI.active_tab = 'arm_led';
    }
	function applySettings() {
		if (loading_data)
			return;
		for (var i=0;i<ESC_CONFIG.connectedESCs;i++) {
			var led_display_e = $('.lights' + (i+1));
			if (esc_available[i] == true) {
				var led_red_e = $('input[id="esc-red-' + i + '"]');
				var led_green_e = $('input[id="esc-green-' + i + '"]');
				var led_blue_e = $('input[id="esc-blue-' + i + '"]');
				var led_display_e = $('.lights' + (i+1));
				var r, g, b;
				
				
				
				led_red_e.prop('disabled', false);
				led_green_e.prop('disabled', false);
				led_blue_e.prop('disabled', false);				
				if (esc_settings[i].LED_CONTROL & 0x30) {
					led_red_e.prop('checked', true);
					r = 255;
				}
				else {
					led_red_e.prop('checked', false);
					r = 0;
				}
				if (esc_settings[i].LED_CONTROL & 0x0C) {
					led_green_e.prop('checked', true);
					g = 255;
				}
				else {
					led_green_e.prop('checked', false);
					g = 0;
				}
				if (esc_settings[i].LED_CONTROL & 0x03) {
					led_blue_e.prop('checked', true);
					b = 255;
				}
				else {
					led_blue_e.prop('checked', false);
					b = 0;
				}
				if (r == 0 && g == 0 && b == 0){
					led_display_e.hide();
				}
				else {
					led_display_e.show();
					led_display_e.css('left', led_left[i]);
					led_display_e.css('top', led_top[i]); 
					led_display_e.css('width', led_width);
					led_display_e.css('height', led_height);
					led_display_e.css('background-image', 'radial-gradient(ellipse at center , rgb(' + r +', ' + g + ', ' + b +') 0%,' + 'rgb(' + r +', ' + g + ', ' + b +') 10%, rgba(0,0,0,0) 50%');
				}
			}
			else {
				var led_red_e = $('input[id="esc-red-' + i + '"]');
				var led_green_e = $('input[id="esc-green-' + i + '"]');
				var led_blue_e = $('input[id="esc-blue-' + i + '"]');				

				led_red_e.prop('checked', false);
				led_green_e.prop('checked', false);
				led_blue_e.prop('checked', false);

				led_red_e.prop('disabled', true);
				led_green_e.prop('disabled', true);
				led_blue_e.prop('disabled', true);
				
				led_display_e.hide();
			}
				
		}
	}
	function readSettings() {
		if (selected_esc < ESC_CONFIG.connectedESCs - 1) {
			selected_esc ++;
			MSP._4way_testAlive(aliveReceived);
		}
		else {
//			applySettings();

			if (_4way_mode) {
				_4way.exit();
				_4way_mode = false;
			}
//			GUI.log('Reading complete');
			$('.content_wrapper').disabled = false;
			loading_data = false;
			if ($(".dataflash-processing")[0])
				$(".dataflash-processing")[0].close();
			load_html();	
		}
	}
	function readReceived(msg) {
//		GUI.log("Read Flash");
		//GUI.log(chrome.i18n.getMessage('escInspectionOk', [selected_esc]));
		var settings = blheliSettingsObject(msg.params);
		esc_settings.push(settings);
		MSP._4way_reset(selected_esc, readSettings);
//		var delayed_setting = setTimeout(function() {
//			readSettings();
//		}, 500);
	}
	
	function deviceInitReceived(msg) {
		if (msg.ack === _4way_ack.ACK_OK){
//			GUI.log("Init Flash");
			esc_available.push(true);
//			$('.gui_box_titlebar .ledESC' + (esc_count+1)).addClass('available');
			esc_count++;
			MSP._4way_read(0x1A00, 0x70, readReceived);
		}
		else {
//			GUI.log("NA");
//			GUI.log(chrome.i18n.getMessage('escInspectionFail', [selected_esc]));
			esc_available.push(false);
//			$('.gui_box_titlebar .ledESC' + (esc_count+1)).removeClass('available');
			esc_settings.push({});
			readSettings();
		}
	}
	function aliveReceived(msg) {
//		GUI.log("Alive");
		if (!buffer_delay){
			buffer_delay = setTimeout(function () {
				MSP._4way_initFlash(selected_esc, deviceInitReceived);
				buffer_delay = false;
			}, 500);		
		}
	}
	
	function read_setup_all() {
//		GUI.log(chrome.i18n.getMessage('connectedESC', [ESC_CONFIG.connectedESCs]));
		buffer_delay = false;
		selected_esc = 0;
		readBackSettings = null;
		MSP._4way_testAlive(aliveReceived);
	}	
	function init_4way() {
		_4way_mode = true;
		read_setup_all();
//		load_html();
	}	
	function load_arm_led_setup() {

//		GUI.log('Enter to 4-way Interface');
//		GUI.log('Reading all setup');
		MSP.send_message(MSPCodes.MSP_SET_4WAY_IF, false, false, init_4way);
	}
    function load_led_config() {
		loading_data = true;
		$('.content_wrapper').disabled = true;
        MSP.send_message(MSPCodes.MSP_LED_STRIP_CONFIG, false, false, load_led_colors);
    }

    function load_led_colors() {
        MSP.send_message(MSPCodes.MSP_LED_COLORS, false, false, load_led_mode_colors);
    }

    function load_led_mode_colors() {
        MSP.send_message(MSPCodes.MSP_LED_STRIP_MODECOLOR, false, false, load_arm_led_setup);
    }
        
    function load_html() {
        $('#content').load("./tabs/arm_led.html", process_html);
    }
	var load_settings = setTimeout(function () {
		$(".prop-remove")[0].showModal();
		$('.content_wrapper').disabled = true;		
		/*
		*/
	}, 500);
	
	load_html();
	// load_led_config();

    function buildUsedWireNumbers() {
        var usedWireNumbers = [];
        $('.mainGrid .gPoint .wire').each(function () {
            var wireNumber = parseInt($(this).html());
            if (wireNumber >= 0) {
                usedWireNumbers.push(wireNumber);
            }
        });
        usedWireNumbers.sort(function(a,b){return a - b});
        return usedWireNumbers;
    }
	function readReceivedforWrite(msg) {
		if (msg.ack === _4way_ack.ACK_OK){
			readBackSettings = msg.params;
			var escSetting = blheliSettingsArray(esc_settings[selected_esc]);
			if (escSetting.byteLength != readBackSettings.byteLength) {
				writeSettings();
				return;
			}
			if (compare(escSetting, readBackSettings)) {
//				GUI.log(chrome.i18n.getMessage('armLedNothingToWrite', [selected_esc]));
				MSP._4way_reset(selected_esc, writeSettings);
				return;
			}
			MSP._4way_pageErase(0x1A00 / 0x0200, eraseComplete);
		}
		else {
			MSP._4way_reset(selected_esc, writeSettings);
		}
	}
	function readReceivedAfterWrite(msg) {
		if (msg.ack === _4way_ack.ACK_OK){
			readBackSettings = msg.params;
			var escSetting = blheliSettingsArray(esc_settings[selected_esc]);
			if (escSetting.byteLength != readBackSettings.byteLength) {
				writeSettings();
				return;
			}
			if (!compare(escSetting, readBackSettings)) {
				MSP._4way_reset(selected_esc, writeSettings);
				return;
			}
//			GUI.log(chrome.i18n.getMessage('armLedVerifyComplete', [selected_esc]));
			MSP._4way_reset(selected_esc, writeSettings);
		}
		else {
			MSP._4way_reset(selected_esc, writeSettings);
		}
	}
	function writeComplete(msg) {
		if (msg.ack == _4way_ack.ACK_OK) {
			MSP._4way_read(0x1A00, 0x70, readReceivedAfterWrite);
		}
		else {
			MSP._4way_reset(selected_esc, writeSettings);
		}
	}
	function eraseComplete(msg) {
		if (msg.ack === _4way_ack.ACK_OK){
			var escSetting = blheliSettingsArray(esc_settings[selected_esc]);
			MSP._4way_write(0x1A00, escSetting, writeComplete);
		}
		else {
			MSP._4way_reset(selected_esc, writeSettings);
		}
	}
    function saveInitFlash(msg) {
		if (msg.ack === _4way_ack.ACK_OK){
			MSP._4way_read(0x1A00, 0x70, readReceivedforWrite);
		}
		else {
			MSP._4way_reset(selected_esc, writeSettings);
		}
	}
	function writeAllSetting(msg) {
//		GUI.log('Writing complete');
//		GUI.log('Verifying');
		$(".data-processing-text").text(chrome.i18n.getMessage('ledReadingData'));
		var delayed_setting = setTimeout(function() {
			load_led_config();
		}, 5000);
		buffer_delay = false;
		selected_esc = 0;
		esc_settings = [];
		esc_available = [];
		esc_count = 0;
		readBackSettings = null;		
	}
	function writeSettings() {
		selected_esc++;
		while (esc_available[selected_esc] == false && selected_esc < ESC_CONFIG.connectedESCs) {
			selected_esc++;
		}
		readBackSettings = null;
		if (selected_esc < ESC_CONFIG.connectedESCs) {
			MSP._4way_initFlash(selected_esc, saveInitFlash);
		}
		else {
//			applySettings();
//			GUI.log('Reset 4-way interface');
			MSP._4way_exit(writeAllSetting);
//			load_html();	
		}		
	}
	function led_change(index, rgb, set) {
		if (index >= ESC_CONFIG.connectedESCs)
			return;
		if (esc_available[index] == false)
			return;
		var byte1 = 0;
		if (rgb == 0)
			byte1 = 0x30;
		else if (rgb == 1)
			byte1 = 0x0C;
		else if (rgb == 2)
			byte1 = 0x03;
		if (set == 0) {
			esc_settings[index].LED_CONTROL &= ~(byte1);
		}
		else if (set == 1) {
			esc_settings[index].LED_CONTROL |= byte1;
		}
	}
	function tintImage(imgElement,tintColor) {
		// create hidden canvas (using image dimensions)
		var canvas = document.createElement("canvas");
		canvas.width = imgElement.offsetWidth;
		canvas.height = imgElement.offsetHeight;

		var ctx = canvas.getContext("2d");
		ctx.drawImage(imgElement,0,0);

		var map = ctx.getImageData(0,0,320,240);
		var imdata = map.data;

		// convert image to grayscale
		var r,g,b,avg;
		for(var p = 0, len = imdata.length; p < len; p+=4) {
			r = imdata[p]
			g = imdata[p+1];
			b = imdata[p+2];
			// alpha channel (p+3) is ignored           

			avg = Math.floor((r+g+b)/3);

			imdata[p] = imdata[p+1] = imdata[p+2] = avg;
		}

		ctx.putImageData(map,0,0);

		// overlay filled rectangle using lighter composition
		ctx.globalCompositeOperation = "lighter";
		ctx.globalAlpha = 0.5;
		ctx.fillStyle=tintColor;
		ctx.fillRect(0,0,canvas.width,canvas.height);

		// replace image source with canvas data
		imgElement.src = canvas.toDataURL();
	}	
	function set_led_color() {
		var lights_e = [];
		for (var i=1;i<=6;i++) {
			lights_e.push($('.lights-' + i));
		}
	}
	function prop_removed() {
		$(".data-processing").removeClass("done");
		$(".data-processing-text").text(chrome.i18n.getMessage('ledReadingData'));
		$(".data-processing")[0].showModal();
		$('.content_wrapper').disabled = true;
		load_led_config();		
	}
	function prop_removed_cancel() {
		$('#tabs .tab_currentstate a').click();
	}
	function update_led_strip() {
		if (loading_data)
			return;
		
		if (LED_STRIP.length == 0 || LED_STRIP[0].functions == undefined) {
			for (var j=0;j<2;j++){
				var warning_e = $('input[id="esc-warning-' + (j+5) + '"]');
				var function_e = $('.led-function-select-' + (j+5));
				function_e.val(0);
				$('.mode_colors' + (j+1)).hide();					
			}
			return;
		}
		
		for (var j=0;j<2;j++){
			var warning_e = $('input[id="esc-warning-' + (j+5) + '"]');
			var function_e = $('.led-function-select-' + (j+5));
			var led_display_e = $('.lights' + (j+5));
			led_display_e.css('left', led_left[j+4]);
			led_display_e.css('top', led_top[j+4]);
			led_display_e.css('width', led_width + 'px');
			led_display_e.css('height', led_height + 'px');
			var arm_state_found = false;
			var warning_found = false;
			var color_found = false;
			for (var i=0;i<LED_STRIP[j].functions.length;i++){
				if (LED_STRIP[j].functions[i] == "a") {
					function_e.val(1);
					arm_state_found = true;
					$('.mode_colors' + (j+1)).show();
					if (LED_COLORS[getModeColor(6, 0)].h == 0 && LED_COLORS[getModeColor(6, 0)].s == 0 && LED_COLORS[getModeColor(6, 0)].v == 0)
						led_display_e.hide();
					else {
						led_display_e.show();
						led_display_e.css('background-image', 'radial-gradient(ellipse at center ,' + HSVtoRGB(LED_COLORS[getModeColor(6, 0)]) + ' 0%,' + HSVtoRGB(LED_COLORS[getModeColor(6, 0)]) + ' 10%,' + 'rgba(0,0,0,0) 50%');
						// HsvToColor(LED_COLORS[getModeColor(6, 0)]));						
					}
				}
				else if (LED_STRIP[j].functions[i] == "w") {
					warning_e.prop('checked', true);
					warning_found = true;
				}
				else if (LED_STRIP[j].functions[i] == "c"){
					color_found = true;
				}
			}
			if (arm_state_found == false) {
				function_e.val(0);
				$('.mode_colors' + (j+1)).hide();
			}
			if (warning_found == false)
				warning_e.prop('checked', false);
			if (color_found) {
				$('.colors' + (j+1)).children().each(function() { setColorActivate($(this), LED_STRIP[j].color);} );
				if (LED_COLORS[LED_STRIP[j].color].h == 0 && LED_COLORS[LED_STRIP[j].color].s == 0 && LED_COLORS[LED_STRIP[j].color].v == 0)
					led_display_e.hide();
				else {
					led_display_e.show();
					led_display_e.css('background-image', 'radial-gradient(ellipse at center ,' + HSVtoRGB(LED_COLORS[LED_STRIP[j].color]) + ' 0%,' + HSVtoRGB(LED_COLORS[LED_STRIP[j].color]) + ' 10%,' + 'rgba(0,0,0,0) 50%');
				}
//					led_display_e.css('background-color', HsvToColor(LED_COLORS[LED_STRIP[j].color]));
			}
			$('.mode_colors' + (j+1)).each(function() { setModeBackgroundColor($(this)); });
			$('.colors' + (j+1)).children().each(function() { setBackgroundColor($(this)); });
		}
	}	
	function setColorActivate(element, index) {
		if (element.is('[class*="color"]')) {
			var colorIndex = 0;
			
			var match = element.attr("class").match(/(^|\s)color-([0-9]+)-([0-9]+)(\s|$)/);
			if (match) {
				colorIndex = match[3];
				if (colorIndex == index)
					element.addClass('btnOn');
				else
					element.removeClass('btnOn');
				//warning_e.prop('checked', false);
			}
		}
	}	
	function calculate_led_position() {
		var img = $('.img_background');
		var width = img.width();
		var height = img.height();
		led_left[0] = parseInt(width * 0.36);
		led_top[0] = parseInt(height * 0.36);
		
		led_left[1] = parseInt(width * 0.36);
		led_top[1] = parseInt(height * 0.76);
		
		led_left[2] = parseInt(width * 0.65);
		led_top[2] = parseInt(height * 0.36);
		
		led_left[3] = parseInt(width * 0.65);
		led_top[3] = parseInt(height * 0.76);
		
		led_left[4] = parseInt(width * 0.5); // FRONT
		led_top[4] = parseInt(height * 0.82);

		led_left[5] = parseInt(width * 0.5); //REAR
		led_top[5] = parseInt(height * 0.22); 
		
		led_width = parseInt(width * 0.25);
		led_height = parseInt(height * 0.15);
		update_led_strip();
		applySettings();
	}
    function process_html() {
		
		localize();
		
		self.resize = function () {
			calculate_led_position();
		}
		$(window).on('resize', self.resize).resize();
		
		$('.tab-arm-led a.prop-remove-confirm').click(prop_removed);
		$('.tab-arm-led a.prop-remove-cancel').click(prop_removed_cancel);
		GUI.interval_add('arm-led-resize', calculate_led_position, 250, true); // 4 fps
		
		$('a.save').click(function () {
			if (loading_data == true)
				return;
//			GUI.log('Writing settings');
			loading_data = true;
			$(".data-processing").removeClass("done");
			$(".data-processing-text").text(chrome.i18n.getMessage('ledWritingData'));
			$(".data-processing")[0].showModal();
			$('.content_wrapper').disabled = true;
            mspHelper.sendLedStripConfig(send_led_strip_colors);
             
            function send_led_strip_colors() {
                mspHelper.sendLedStripColors(send_led_strip_mode_colors);
            }
            
            function send_led_strip_mode_colors() {
                if (semver.gte(CONFIG.apiVersion, "1.19.0"))
                    mspHelper.sendLedStripModeColors(save_to_eeprom);
                else
                    save_to_eeprom();
            }
            
            function save_to_eeprom() {
                MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function() {
					if (_4way_mode){
						selected_esc = 0;
						while (esc_available[selected_esc] == false && selected_esc < ESC_CONFIG.connectedESCs) {
							selected_esc++;
						}
						MSP._4way_initFlash(selected_esc, saveInitFlash);
					}
					else {
						// GUI.log('Enter to 4-way Interface');
						MSP.send_message(MSPCodes.MSP_SET_4WAY_IF, false, false, function() {
							_4way_mode = true;
							var delayed_setting = setTimeout(function() {
								selected_esc = 0;
								while (esc_available[selected_esc] == false && selected_esc < ESC_CONFIG.connectedESCs) {
									selected_esc++;
								}
								MSP._4way_initFlash(selected_esc, saveInitFlash);
							}, 1000);
						});
					}
                });
            }			
		});
		for (var mode_color_index=0;mode_color_index<2;mode_color_index++){
			$('.mode_colors' + (mode_color_index+1)).on('click', 'button', function() {
				var that = this;
				var match = $(this).attr("class").match(/(^|\s)mode_color-([0-9]+)-([0-9]+)-([0-9]+)(\s|$)/);
				
				if (match) {
					var index = parseInt(match[2]) - 5;
					LED_MODE_COLORS.forEach(function(mc) {
						if ($(that).is('.mode_color-' + (index+5) + '-' + mc.mode + '-' + mc.direction)) {
							if ($(that).is('.btnOn')) {
								$(that).removeClass('btnOn');
								$('.ui-selected').removeClass('mode_color-' + mc.mode + '-' + mc.direction);
								selectedModeColor[index] = null;
							} else {
								$(that).addClass('btnOn');
								selectedModeColor[index] = { mode: mc.mode, direction: mc.direction };

								// select the color button
								for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
									var className = '.color-' + (index+5) + '-' + colorIndex;
									if (colorIndex == getModeColor(mc.mode, mc.direction)) {
										$(className).addClass('btnOn');
										selectedColorIndex[index] = colorIndex;
										setColorSliders(colorIndex);
										
									} else {
										$(className).removeClass('btnOn');
									}
								}
							}
						}
					});
					$('.mode_colors' + (index+1)).each(function() {
						$(this).children().each(function() {
							if (! $(this).is($(that))) {
								if ($(this).is('.btnOn')) {
									$(this).removeClass('btnOn');
								}                            
							}
						});
					});				
				}
			});
			$('.led-function-select-' + (mode_color_index+5)).on('change', function() {
				var match = $(this).attr("class").match(/(^|\s)led-function-select-([0-9]+)(\s|$)/);
				if (match) {
					var index = parseInt(match[2]) - 5;
					var function_index = $(this).val();
					var color_text=["c","a"];
					var found = false;
					for (var i=0;i<LED_STRIP[index].functions.length;i++) {
						for (var j=0;j<2;j++){
							if (LED_STRIP[index].functions[i] == color_text[j]) {
								LED_STRIP[index].functions[i] = color_text[1-j];
								found = true;
								break;
							}
						}
						if (found)
							break;
					}
					update_led_strip();
				}
				
			});
			$('input[id="esc-warning-' + (mode_color_index+5) + '"]').on('change', function() {
				var match = $(this).attr("id").match(/(^|\s)esc-warning-([0-9]+)(\s|$)/);
				if (match) {
					var index = parseInt(match[2]) - 5;
					var found = false;
					if ($(this).is(':checked')){
						for (var i=0;i<LED_STRIP[index].functions.length;i++){
							if (LED_STRIP[index].functions[i] == "w") {
								found = true;
								break;
							}
						}
						if (!found) {
							LED_STRIP[index].functions.push("w");
						}
					}
					else {
						for (var i=0;i<LED_STRIP[index].functions.length;i++){
							if (LED_STRIP[index].functions[i] == "w") {
								LED_STRIP[index].functions.splice(i, 1);
								break;
							}
						}
					}
				}
			});
			
			$('.colors' + (mode_color_index+1)).on('click', 'button', function(e) {
				var that = this;
				var colorButtons = $(this).parent().find('button');
				var match = $(this).attr("class").match(/(^|\s)color-([0-9]+)-([0-9]+)(\s|$)/);
				var selectedColorIndex;
				
				if (match) {
					var led_index = parseInt(match[2]) - 5;
					var color_index = parseInt(match[3]);
					
					for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
						if ($(that).is('.color-' + (led_index+5) + '-' + colorIndex)) {
							selectedColorIndex = colorIndex;
						}
					}				
					
					if ($('.led-function-select-' + (led_index+5)).val() == 0) {
						colorButtons.removeClass('btnOn');
						var color_found = false;
						for (var i=0;i<LED_STRIP[led_index].functions.length;i++) {
							if (LED_STRIP[led_index].functions[i] == "c") {
								color_found = true;
								break;
							}
						}
						if (color_found) {
							LED_STRIP[led_index].color = selectedColorIndex;
							$(this).addClass('btnOn');
						}
					}
					else if ($('.led-function-select-' + (led_index+5)).val() == 1) {
						if (selectedModeColor[led_index] != null) {
							colorButtons.removeClass('btnOn');
							$(this).addClass('btnOn');
							setModeColor(selectedModeColor[led_index].mode, selectedModeColor[led_index].direction, selectedColorIndex);
						}
					}
					setColorSliders(selectedColorIndex);
					update_led_strip();
				}
/*				for (var j=0;j<2;j++){
					for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
						colorButtons.removeClass('btnOn');
						if (selectedModeColor == undefined)
							$('.ui-selected').removeClass('color-' + (j+5) + '-' + colorIndex);
						
						if ($(that).is('.color-' + (j+5) + '-' + colorIndex)) {
							selectedColorIndex = colorIndex;
							if (selectedModeColor == undefined)
								$('.ui-selected').addClass('color-' + (j+5) + '-' + colorIndex);
						}
					}
				}
				*/
			});	
					
		}



		for (var i=0;i<4;i++){ 
			var led_red_e = $('input[id="esc-red-' + i + '"]');
			var led_green_e = $('input[id="esc-green-' + i + '"]');
			var led_blue_e = $('input[id="esc-blue-' + i + '"]');
        	led_red_e.change(function(e) {
				if (!e.originalEvent)
					return;
				if (esc_count == 0)
					return;
				if (esc_available[i] == false)
					return;
				var id = $(this).prop('id');
				var num = parseInt(id.substr(id.length - 1));
				if ($(this).is(':checked')) {
					led_change(num,0,1);
				}
				else {
					led_change(num,0,0);
				}
			});
			led_green_e.change(function(e) {
				if (!e.originalEvent)
					return;				
				if (esc_count == 0)
					return;
				
				if (esc_available[i] == false)
					return;
				var id = $(this).prop('id');
				var num = parseInt(id.substr(id.length - 1));

				if ($(this).is(':checked')) {
					led_change(num,1,1);
				}
				else {
					led_change(num,1,0);
				}
			});
			led_blue_e.change(function(e){
				if (!e.originalEvent)
					return;				
				if (esc_count == 0)
					return;
				
				if (esc_available[i] == false)
					return;
				var id = $(this).prop('id');
				var num = parseInt(id.substr(id.length - 1));

				if ($(this).is(':checked')) {
					led_change(num,2,1);
				}
				else {
					led_change(num,2,0);
				}
			});
			
		}
		applySettings();
		update_led_strip();
		GUI.content_ready(callback);
        // UI: select LED function from drop-down
/*		
        $('.functionSelect').on('change', function() {
            clearModeColorSelection();
            applyFunctionToSelectedLeds();
            drawColorBoxesInColorLedPoints();
            setOptionalGroupsVisibility();
            updateBulkCmd();
        });

        // UI: select mode from drop-down
        $('.modeSelect').on('change', function() {

            var that = this;
            
            var mode = Number($(that).val());
            $('.mode_colors').find('button').each(function() {
                for (var i = 0; i < 6; i++)
                    for (var j = 0; j < 6; j++)
                        if ($(this).hasClass('mode_color-' + i + '-' + j)) {
                            $(this).removeClass('mode_color-' + i + '-' + j);
                            $(this).addClass('mode_color-' + mode + '-' + j);
                        }
            });

            $('.mode_colors').each(function() { setModeBackgroundColor($(this)); });
        });
        
        function toggleSwitch(that, letter)
        {
            if ($(that).is(':checked')) {
                $('.ui-selected').find('.wire').each(function() {
                    if ($(this).text() != "") {
                        
                        var p = $(this).parent();

                        TABS.arm_led.functions.forEach(function(f) {
                            if (p.is('.function-' + f)) {

                                switch (letter) {
                                case 't':
                                case 'o':
                                case 's':
                                    if (areModifiersActive('function-' + f))
                                        p.addClass('function-' + letter);
                                    break;
                                case 'b':
                                case 'n':
                                    if (areBlinkersActive('function-' + f))
                                        p.addClass('function-' + letter);
                                    break;
                                case 'i':
                                    if (areOverlaysActive('function-' + f))
                                        p.addClass('function-' + letter);
                                    break;
                                case 'w':
                                    if (areOverlaysActive('function-' + f))
                                        if (isWarningActive('function-' + f))
                                            p.addClass('function-' + letter);
                                    break;
                                }
                            }
                        });
                    }
                });
            } else {
                $('.ui-selected').removeClass('function-' + letter);
            }
            return $(that).is(':checked');
        }
        
        // UI: check-box toggle
        $('.checkbox').change(function(e) { 
            if (e.originalEvent) {
                // user-triggered event
                var that = $(this).find('input');
                if ($('.ui-selected').length > 0) {
                    
                    TABS.arm_led.overlays.forEach(function(letter) {
                        if ($(that).is('.function-' + letter)) {
                            var ret = toggleSwitch(that, letter);
                            
                            var cbn = $('.checkbox .function-n'); // blink on landing
                            var cbb = $('.checkbox .function-b'); // blink
                            
                            if (ret) {
                                if (letter == 'b' && cbn.is(':checked')) {
                                    cbn.prop('checked', false);
                                    cbn.change();
                                    toggleSwitch(cbn, 'n');
                                } else if (letter == 'n' && cbb.is(':checked')) {
                                    cbb.prop('checked', false);
                                    cbb.change();
                                    toggleSwitch(cbb, 'b');
                                }    
                            }
                        }
                    });
                                        
                    clearModeColorSelection();
                    updateBulkCmd();
                    setOptionalGroupsVisibility();
                }
            } else {
                // code-triggered event
            }
        });
        

        
        $('.mainGrid').disableSelection();

        $('.gPoint').each(function(){
            var gridNumber = ($(this).index() + 1);
            var row = Math.ceil(gridNumber / 16) - 1;
            var col = gridNumber / 16 % 1 * 16 - 1;
            if (col < 0) {
                col = 15;
            }
            
            var ledResult = findLed(col, row);
            if (!ledResult) {
                return;
            }
            
            var ledIndex = ledResult.index;
            var led = ledResult.led;
            
            if (led.functions[0] == 'c' && led.functions.length == 1 && led.directions.length == 0 && led.color == 0 && led.x == 0 && led.y == 0) {
                return;
            }
            
            $(this).find('.wire').html(ledIndex);

            for (var modeIndex = 0; modeIndex < led.functions.length; modeIndex++) {
                $(this).addClass('function-' + led.functions[modeIndex]);
            }
            
            for (var directionIndex = 0; directionIndex < led.directions.length; directionIndex++) {
                $(this).addClass('dir-' + led.directions[directionIndex]);
            }
            
            $(this).addClass('color-' + led.color);

        });
        
        $('a.save').click(function () {

            mspHelper.sendLedStripConfig(send_arm_led_colors);
             
            function send_arm_led_colors() {
                mspHelper.sendLedStripColors(send_arm_led_mode_colors);
            }
            
            function send_arm_led_mode_colors() {
                if (semver.gte(CONFIG.apiVersion, "1.19.0"))
                    mspHelper.sendLedStripModeColors(save_to_eeprom);
                else
                    save_to_eeprom();
            }
            
            function save_to_eeprom() {
                MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function() {
                    GUI.log(chrome.i18n.getMessage('ledStripEepromSaved'));
                });
            }

        });

        $('.colorDefineSliders').hide();
        
        applyFunctionToSelectedLeds();
        drawColorBoxesInColorLedPoints();
        setOptionalGroupsVisibility();
        
        updateBulkCmd();
        
		*/
        
    }
    
    
    
    



    function findLed(x, y) {
        for (var ledIndex = 0; ledIndex < LED_STRIP.length; ledIndex++) {
            var led = LED_STRIP[ledIndex];
            if (led.x == x && led.y == y) {
                return { index: ledIndex, led: led };
            }
        }
        return undefined;
    }
    
        
    function updateBulkCmd() {
        var ledStripLength = LED_STRIP.length;
        
        LED_STRIP = [];
        
        $('.gPoint').each(function(){
            if ($(this).is('[class*="function"]')) {
                var gridNumber = ($(this).index() + 1);
                var row = Math.ceil(gridNumber / 16) - 1;
                var col = gridNumber/16 % 1 * 16 - 1;
                if (col < 0) {col = 15;}

                var wireNumber = $(this).find('.wire').html();
                var functions = '';
                var directions = '';
                var colorIndex = 0;
                var that = this;
                
                var match = $(this).attr("class").match(/(^|\s)color-([0-9]+)(\s|$)/);
                if (match) {
                    colorIndex = match[2];
                }

                TABS.arm_led.baseFuncs.forEach(function(letter){
                    if ($(that).is('.function-' + letter)) {
                        functions += letter;
                    }
                });
                TABS.arm_led.overlays.forEach(function(letter){
                    if ($(that).is('.function-' + letter)) {
                        functions += letter;
                    }
                });

                TABS.arm_led.directions.forEach(function(letter){
                    if ($(that).is('.dir-' + letter)) {
                        directions += letter;
                    }
                });

                if (wireNumber != '') {
                    var led = {
                        x: col,
                        y: row,
                        directions: directions,
                        functions: functions,
                        color: colorIndex
                    }
                    
                    LED_STRIP[wireNumber] = led;
                }
            }
        });

        var defaultLed = {
            x: 0,
            y: 0,
            directions: '',
            functions: ''
        };
        
        for (var i = 0; i < ledStripLength; i++) {
            if (LED_STRIP[i]) {
                continue;
            }
            LED_STRIP[i] = defaultLed;
        }
        
        var usedWireNumbers = buildUsedWireNumbers();

        var remaining = LED_STRIP.length - usedWireNumbers.length;
        
        $('.wires-remaining div').html(remaining);
    }

    // refresh mode color buttons
    function setModeBackgroundColor(element) {
        if (semver.gte(CONFIG.apiVersion, "1.19.0")) {
            element.find('[class*="mode_color"]').each(function() { 
                var m = 0;
                var d = 0;
                
                var match = $(this).attr("class").match(/(^|\s)mode_color-([0-9]+)-([0-9]+)-([0-9]+)(\s|$)/);
                if (match) {
                    m = Number(match[3]);
                    d = Number(match[4]);
                    $(this).css('background-color', HsvToColor(LED_COLORS[getModeColor(m, d)]));
                }
            });
        }
    }
    
    function setBackgroundColor(element) {
        if (element.is('[class*="color"]')) {
            var colorIndex = 0;
            
            var match = element.attr("class").match(/(^|\s)color-([0-9]+)-([0-9]+)(\s|$)/);
            if (match) {
                colorIndex = match[3];
                element.css('background-color', HsvToColor(LED_COLORS[colorIndex]));
            }
        }
    }

    function areModifiersActive(activeFunction) {
        switch (activeFunction) {
            case "function-c": 
            case "function-a": 
            case "function-f":
                return true;
            break;
        }
        return false;
    }

    function areOverlaysActive(activeFunction) {
        if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
            switch (activeFunction) {
                case "function-c": 
                case "function-a": 
                case "function-f":
                case "function-g":
                    return true;
                break;
            }
        } else {
            switch (activeFunction) {
                case "": 
                case "function-c": 
                case "function-a": 
                case "function-f":
                case "function-s":
                case "function-l":
                case "function-r": 
                case "function-o":
                case "function-g":
                    return true;
                break;
            }
        }
        return false;
    }

    function areBlinkersActive(activeFunction) {
        if (semver.gte(CONFIG.apiVersion, "1.20.0")) {
            switch (activeFunction) {
                case "function-c": 
                case "function-a": 
                case "function-f":
                    return true;
                break;
            }
        }
        return false;
    }

    function isWarningActive(activeFunction) {
        switch (activeFunction) {
            case "function-l": 
            case "function-s":
            case "function-g":
                return false;
                break;
            case "function-r":
            case "function-b":
                if (semver.lt(CONFIG.apiVersion, "1.20.0"))
                    return false;
            break;
            default: 
                return true;
            break; 
        }
    }
    
    function setOptionalGroupsVisibility() {
        
        var activeFunction = $('select.functionSelect').val();
        $('select.functionSelect').addClass(activeFunction);


        if (semver.lte(CONFIG.apiVersion, "1.18.0")) { 
            // <= 18
            // Hide GPS (Func)
            // Hide RSSI (O/L), Blink (Func)
            // Hide Battery, RSSI (Func), Larson (O/L), Blink (O/L), Landing (O/L)
            $(".extra_functions20").hide();
            $(".mode_colors").hide();
        } else { 
            // >= 20
            // Show GPS (Func)
            // Hide RSSI (O/L), Blink (Func)
            // Show Battery, RSSI (Func), Larson (O/L), Blink (O/L), Landing (O/L)
            $(".extra_functions20").show();
            $(".mode_colors").show();
        }
        
        
        // set color modifiers (check-boxes) visibility
        $('.overlays').hide();
        $('.modifiers').hide();
        $('.blinkers').hide();
        $('.warningOverlay').hide();
        
        if (areOverlaysActive(activeFunction))
            $('.overlays').show();

        if (areModifiersActive(activeFunction))
            $('.modifiers').show();

        if (areBlinkersActive(activeFunction))
            $('.blinkers').show();

        if (isWarningActive(activeFunction))
            $('.warningOverlay').show();
            
            

        // set directions visibility
        if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
            switch (activeFunction) {
                case "function-r":
                    $('.indicatorOverlay').hide();
                    $('.directions').hide();
                break;
                default: 
                    $('.indicatorOverlay').show();
                    $('.directions').show();
                break; 
            }
        }
        
        $('.mode_colors').hide();
        if (semver.gte(CONFIG.apiVersion, "1.19.0")) { 
            // set mode colors visibility

            if (semver.gte(CONFIG.apiVersion, "1.20.0"))
	            if (activeFunction == "function-f")
	                $('.mode_colors').show(); 
            
            // set special colors visibility
            $('.special_colors').show();
            $('.mode_color-6-0').hide();
            $('.mode_color-6-1').hide();
            $('.mode_color-6-2').hide();
            $('.mode_color-6-3').hide();
            $('.mode_color-6-4').hide();
            $('.mode_color-6-5').hide();
            $('.mode_color-6-6').hide();
            $('.mode_color-6-7').hide();
            
            switch (activeFunction) {
                case "":           // none
                case "function-f": // Modes & Orientation
                case "function-l": // Battery 
                    // $('.mode_color-6-3').show(); // background
                    $('.special_colors').hide();
                    break;
                case "function-g": // GPS
                    $('.mode_color-6-5').show(); // no sats
                    $('.mode_color-6-6').show(); // no lock
                    $('.mode_color-6-7').show(); // locked
                    // $('.mode_color-6-3').show(); // background
                    break;
                case "function-b": // Blink
                    $('.mode_color-6-4').show(); // blink background 
                    break;
                case "function-a": // Arm state
                    $('.mode_color-6-0').show(); // disarmed 
                    $('.mode_color-6-1').show(); // armed 
                    break;
                    
                case "function-r": // Ring
                default:
                    $('.special_colors').hide();
                break; 
            }
        }
    }
    
    function applyFunctionToSelectedLeds() {
        var activeFunction = $('select.functionSelect').val();
        TABS.arm_led.baseFuncs.forEach(function(letter) {
            
            if (activeFunction == 'function-' + letter) {
                $('select.functionSelect').addClass('function-' + letter);
                
                $('.ui-selected').find('.wire').each(function() {
                    if ($(this).text() != "")
                        $(this).parent().addClass('function-' + letter);
                });
                
                unselectOverlays(letter);

            } else {
                $('select.functionSelect').removeClass('function-' + letter);
                $('.ui-selected').removeClass('function-' + letter);
            }
            
            if (activeFunction == '') {
                unselectOverlays(activeFunction);
            }

        });
    }
    
    function unselectOverlays(letter) {
        if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
            if (letter == 'b' || letter == 'r') {
                unselectOverlay(letter, 'i');
            }
            if (letter == 'b' || letter == 'r' || letter == 'l' || letter == 'g') {
                unselectOverlay(letter, 'w');
                unselectOverlay(letter, 't');
                unselectOverlay(letter, 's');
            }
        } else {
            // MSP 1.20
            if (letter == 'r' || letter == '') {
                unselectOverlay(letter, 'o');
                unselectOverlay(letter, 'b');
                unselectOverlay(letter, 'n');
                unselectOverlay(letter, 't');
            }
            if (letter == 'l' || letter == 'g' || letter == 's') {
                unselectOverlay(letter, 'w');
                unselectOverlay(letter, 't');
                unselectOverlay(letter, 'o');
                unselectOverlay(letter, 'b');
                unselectOverlay(letter, 'n');
            }
        }
    }
    
    function unselectOverlay(func, overlay) {
        $('input.function-' + overlay).prop('checked', false);
        $('input.function-' + overlay).change();
        $('.ui-selected').each(function() {
            if (func == '' || $(this).is('.function-' + func)) {
                $(this).removeClass('function-' + overlay);
            }
        });
    }
    
    function updateColors(value, hsvIndex) {
        var change = false;
        
        value = Number(value);
        
        var className = '.color-' + selectedColorIndex;
        if ($(className).hasClass('btnOn')) {
            switch (hsvIndex) {
                case 0:
                    if (LED_COLORS[selectedColorIndex].h != value) {
                        LED_COLORS[selectedColorIndex].h = value;
                        $('.colorDefineSliderValue.Hvalue').text(LED_COLORS[selectedColorIndex].h);
                        change = true
                    }
                    break;
                case 1: 
                    if (LED_COLORS[selectedColorIndex].s != value) {
                        LED_COLORS[selectedColorIndex].s = value;
                        $('.colorDefineSliderValue.Svalue').text(LED_COLORS[selectedColorIndex].s);
                        change = true
                    }
                    break;
                case 2: 
                    if (LED_COLORS[selectedColorIndex].v != value) {
                        LED_COLORS[selectedColorIndex].v = value;
                        $('.colorDefineSliderValue.Vvalue').text(LED_COLORS[selectedColorIndex].v);
                        change = true
                    }
                    break;
            }                
        }
        

        // refresh color buttons 
        $('.colors').children().each(function() { setBackgroundColor($(this)); });
        $('.overlay-color').each(function() { setBackgroundColor($(this)); });
        
        $('.mode_colors').each(function() { setModeBackgroundColor($(this)); });
        $('.special_colors').each(function() { setModeBackgroundColor($(this)); });
        
        if (change)
            updateBulkCmd();
    }
    
    function drawColorBoxesInColorLedPoints() {
        $('.gPoint').each(function() {
            if ($(this).is('.function-c') || $(this).is('.function-r') || $(this).is('.function-b')) {
                $(this).find('.overlay-color').show();
                
                for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
                    var className = 'color-' + colorIndex;
                    if ($(this).is('.' + className)) {
                        $(this).find('.overlay-color').addClass(className);
                        $(this).find('.overlay-color').css('background-color', HsvToColor(LED_COLORS[colorIndex]))
                    } else {
                        if ($(this).find('.overlay-color').is('.' + className))
                            $(this).find('.overlay-color').removeClass(className);
                    }
                }
            } else {
                $(this).find('.overlay-color').hide();
            }
        });
    }
    
    function setColorSliders(colorIndex) {

        var sliders = $('div.colorDefineSliders input');
        var change = false;
        
        if (!LED_COLORS[colorIndex])
            return;
        
        if (LED_COLORS[colorIndex].h != Number(sliders.eq(0).val())) {
            sliders.eq(0).val(LED_COLORS[colorIndex].h);
            $('.colorDefineSliderValue.Hvalue').text(LED_COLORS[colorIndex].h);
            change = true;
        }
        
        if (LED_COLORS[colorIndex].s != Number(sliders.eq(1).val())) {
            sliders.eq(1).val(LED_COLORS[colorIndex].s);
            $('.colorDefineSliderValue.Svalue').text(LED_COLORS[colorIndex].s);
            change = true;
        }
        
        if (LED_COLORS[colorIndex].v != Number(sliders.eq(2).val())) {
            sliders.eq(2).val(LED_COLORS[colorIndex].v);
            $('.colorDefineSliderValue.Vvalue').text(LED_COLORS[colorIndex].v);
            change = true;
        }

        // only fire events when all values are set
        if (change)
            sliders.trigger('input');
        
    }
	function HSVtoRGB(hsv) {
	  var h = hsv.h, s = (1 - hsv.s / 255), v = hsv.v / 255;
	  var rgb, i, data = [];
	  if (s === 0) {
		rgb = [v,v,v];
	  } else {
		h = h / 60;
		i = Math.floor(h);
		data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
		switch(i) {
		  case 0:
			rgb = [v, data[2], data[0]];
			break;
		  case 1:
			rgb = [data[1], v, data[0]];
			break;
		  case 2:
			rgb = [data[0], v, data[2]];
			break;
		  case 3:
			rgb = [data[0], data[1], v];
			break;
		  case 4:
			rgb = [data[2], data[0], v];
			break;
		  default:
			rgb = [v, data[0], data[1]];
			break;
		}
	  }
	  return 'rgb(' + Math.round(rgb[0]*255) + ', ' + Math.round(rgb[1]*255) + ', ' + Math.round(rgb[2]*255) + ')';
	};	
	/*
	function HSVtoRGB(input) {
		var HSV = { h:Number(input.h), s:Number(input.s), v:Number(input.v) };
		var h = HSV.h;
		var s = HSV.s;
		var v = HSV.v;
		if (input == undefined)
            return "";
        if (HSV.s == 0 && HSV.v == 0)
            return "rgb(0, 0, 0)";
		if (HSV.s == 255)
			return "rgb(255, 255, 255)";
		var r, g, b, i, f, p, q, t;
		
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		var ret = 'rgb(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' + Math.round(b * 255) + ')';
		return ret;
		/*
		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255)
		};
		
	}    
	*/
    function HsvToColor(input) {
        if (input == undefined)
            return "";
        
        var HSV = { h:Number(input.h), s:Number(input.s), v:Number(input.v) };
        
        if (HSV.s == 0 && HSV.v == 0)
            return "";
        
        HSV = { h:HSV.h, s:1 - HSV.s / 255, v:HSV.v / 255 };
        
        var HSL = { h:0, s:0, v:0};
        HSL.h = HSV.h;
        HSL.l = (2 - HSV.s) * HSV.v / 2;
        HSL.s = HSL.l && HSL.l < 1 ? HSV.s * HSV.v / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
        
        var ret = 'hsl(' + HSL.h + ', ' + HSL.s * 100 + '%, ' + HSL.l * 100 + '%)';
        return ret;
    }

    function getModeColor(mode, dir) {
        for (var i = 0; i < LED_MODE_COLORS.length; i++) {
            var mc = LED_MODE_COLORS[i];
            if (mc.mode == mode && mc.direction == dir)
                return mc.color;
        }
        return "";
    }

    function setModeColor(mode, dir, color) {
        for (var i = 0; i < LED_MODE_COLORS.length; i++) {
            var mc = LED_MODE_COLORS[i];
            if (mc.mode == mode && mc.direction == dir) {
                mc.color = color;
                return 1;
            }
        }
        return 0;
    }
    
    function clearModeColorSelection() {
        selectedModeColor = null;
        $('.mode_colors').each(function() {
            $(this).children().each(function() {
                if ($(this).is('.btnOn')) {
                    $(this).removeClass('btnOn');
                }                            
            });
        });
    }
};

TABS.arm_led.cleanup = function (callback) {
	if (_4way_mode) {
		// GUI.log('Exit 4-way Interface');
		_4way.exit();
	}
    if (callback) callback();
};
