'use strict';

TABS.currentstate = {
    yaw_fix: 0.0
};

TABS.currentstate.initialize = function (callback) {
    var self = this;
	if (BF_CONFIG) {
		updateTabList(BF_CONFIG.features);
	}
    if (GUI.active_tab != 'currentstate') {
        GUI.active_tab = 'currentstate';
    }

    function load_config() {
        MSP.send_message(MSPCodes.MSP_BF_CONFIG, false, false, load_status);
    }
    function load_status() {
        MSP.send_message(MSPCodes.MSP_STATUS, false, false, load_fc_version);
    }
    function load_fc_version() {
        MSP.send_message(MSPCodes.MSP_FC_VERSION, false, false, load_board_info);
    }
    function load_board_info() {
        MSP.send_message(MSPCodes.MSP_BOARD_INFO, false, false, load_build_info);
    }
    function load_build_info() {
        MSP.send_message(MSPCodes.MSP_BUILD_INFO, false, false, load_sd_summary);
    }
    function load_sd_summary() {
        MSP.send_message(MSPCodes.MSP_SDCARD_SUMMARY, false, false, load_analog);
    }
	function load_analog() {
		MSP.send_message(MSPCodes.MSP_ANALOG, false, false, load_html);
	}
	
/*
    function load_config() {
        MSP.send_message(MSPCodes.MSP_BF_CONFIG, false, false, load_misc_data);
    }

    function load_misc_data() {
        MSP.send_message(MSPCodes.MSP_MISC, false, false, load_rx_config);
    }
    function load_rx_config() {
        var next_callback = load_html;
        if (semver.gte(CONFIG.flightControllerVersion, "3.0.0")) {
            MSP.send_message(MSPCodes.MSP_RX_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }	
    function get_rc_map() {
        MSP.send_message(MSPCodes.MSP_RX_MAP, false, false, load_html);
    }
	*/
    function load_html() {
        $('#content').load("./tabs/currentstate.html", process_html);
    }
	MSP.send_message(MSPCodes.MSP_ADVANCED_CONFIG, false, false, load_config);

    function process_html() {
        // translate to user-selected language
        localize();

        if (semver.lt(CONFIG.apiVersion, CONFIGURATOR.backupRestoreMinApiVersionAccepted)) {
            $('#content .backup').addClass('disabled');
            $('#content .restore').addClass('disabled');

            GUI.log(chrome.i18n.getMessage('initialSetupBackupAndRestoreApiVersion', [CONFIG.apiVersion, CONFIGURATOR.backupRestoreMinApiVersionAccepted]));
        }

        // initialize 3D Model
        self.initModel();

		// set roll in interactive block
        $('span.roll').text(chrome.i18n.getMessage('initialSetupAttitude', [0]));
		// set pitch in interactive block
        $('span.pitch').text(chrome.i18n.getMessage('initialSetupAttitude', [0]));
        // set heading in interactive block
        $('span.heading').text(chrome.i18n.getMessage('initialSetupAttitude', [0]));

        // check if we have accelerometer and magnetometer
        if (!have_sensor(CONFIG.activeSensors, 'acc')) {
            $('a.calibrateAccel').addClass('disabled');
            $('default_btn').addClass('disabled');
        }

        if (!have_sensor(CONFIG.activeSensors, 'mag')) {
            $('a.calibrateMag').addClass('disabled');
            $('default_btn').addClass('disabled');
        }

        self.initializeInstruments();
		/*
        var bat_voltage_e = $('.bat-voltage'),
            bat_mah_drawn_e = $('.bat-mah-drawn'),
            bat_mah_drawing_e = $('.bat-mah-drawing'),
            rssi_e = $('.rssi'),
            gpsFix_e = $('.gpsFix'),
            gpsSats_e = $('.gpsSats'),
            gpsLat_e = $('.gpsLat'),
            gpsLon_e = $('.gpsLon'),
            roll_e = $('dd.roll'),
            pitch_e = $('dd.pitch'),
            heading_e = $('dd.heading');
		*/
		var gyro_pid_e = $('.gyro-pid'),
			cpu_load_e = $('.cpuload'),
			current_version_e = $('.firmware-version'),
			sd_card_e = $('.sd-card'),
            roll_e = $('dd.roll'),
            pitch_e = $('dd.pitch'),
            heading_e = $('dd.heading'),
			battery_voltage_title_e = $('.battery-voltage-title'),
			battery_voltage_e = $('.battery-voltage'),
			battery_percent_e = $('.battery-percent'),
			current_draw_e = $('.current-draw'),
			battery_temperature_e = $('.battery-temperature');
			
        function get_slow_data() {
            MSP.send_message(MSPCodes.MSP_STATUS, false, false, function() {
				
			});
            MSP.send_message(MSPCodes.MSP_STATUS_EX, false, false, function() {
				cpu_load_e.text(chrome.i18n.getMessage('currentstateCpuLoadValue', [CONFIG.cpuload]));
			});			
			
			MSP.send_message(MSPCodes.MSP_ADVANCED_CONFIG, false, false, function() {
				var gyro_base_freq;
				if (PID_ADVANCED_CONFIG.gyroUse32kHz == 0)
					gyro_base_freq = 8;
				else
					gyro_base_freq = 32;
				
				var pidBaseFreq = gyro_base_freq / PID_ADVANCED_CONFIG.gyro_sync_denom;
				
				gyro_pid_e.text(chrome.i18n.getMessage('currentstateGyroPidValue', [((gyro_base_freq / PID_ADVANCED_CONFIG.gyro_sync_denom * 100).toFixed(0) / 100),
																					((pidBaseFreq / PID_ADVANCED_CONFIG.pid_process_denom * 100).toFixed(0) / 100)]
				));
			});
			MSP.send_message(MSPCodes.MSP_FC_VERSION, false, false, function() {
				MSP.send_message(MSPCodes.MSP_BOARD_INFO, false, false, function() {
					MSP.send_message(MSPCodes.MSP_BUILD_INFO, false, false, function() {
						current_version_e.text(chrome.i18n.getMessage('currentstateFirmwareVersionValue', [CONFIG.flightControllerVersion, CONFIG.boardIdentifier, CONFIG.buildInfo]));
					});
				});
			});
			MSP.send_message(MSPCodes.MSP_SDCARD_SUMMARY, false, false, function() {
				if (SDCARD.state == MSP.SDCARD_STATE_NOT_PRESENT){
					sd_card_e.text(chrome.i18n.getMessage('currentstateSDCardNotInserted'));
				}
				else if (SDCARD.state == MSP.SDCARD_STATE_FATAL){
					sd_card_e.text(chrome.i18n.getMessage('currentstateSDCardFatal'));
				}
				else if (SDCARD.state == MSP.SDCARD_STATE_READY){
					sd_card_e.text(chrome.i18n.getMessage('currentstateSDCardValue', [(SDCARD.totalSizeKB / 1024/1024).toFixed(1)]));
				}
				else {
					sd_card_e.text(chrome.i18n.getMessage('currentstateSDCardInitializing'));
				}
			});
			MSP.send_message(MSPCodes.MSP_ANALOG, false, false, function() {
				if (ANALOG.smartbattery_enabled <= 1) {
					battery_voltage_title_e.text(chrome.i18n.getMessage('currentstateBatteryVoltage'));
					battery_voltage_e.text(chrome.i18n.getMessage('currentstateBatteryVoltageValue', [ANALOG.voltage]));
					battery_percent_e.text(chrome.i18n.getMessage('currentstateValueNA'));
					current_draw_e.text(chrome.i18n.getMessage('currentstateCurrentDrawValue', [ANALOG.amperage]));
					battery_temperature_e.text(chrome.i18n.getMessage('currentstateValueNA'));
				}
				else if (ANALOG.smartbattery_enabled == 2) {
					MSP.send_message(MSPCodes.MSP_SMARTBATTERY, false, false, function() {
						battery_voltage_title_e.text(chrome.i18n.getMessage('currentstateBatteryVoltageSmartbatteryEnabled'));
						battery_voltage_e.text(chrome.i18n.getMessage('currentstateBatteryVoltageValue', [ANALOG.voltage]));
						battery_percent_e.text(chrome.i18n.getMessage('currentstatePercentRemainValue', [SMARTBATTERY.percentage]));
						current_draw_e.text(chrome.i18n.getMessage('currentstateCurrentDrawValue', [ANALOG.amperage]));
						battery_temperature_e.text(chrome.i18n.getMessage('currentstateBatteryTemperatureValue', [SMARTBATTERY.temperature]));
					});
				}
			});
			
/*
            MSP.send_message(MSPCodes.MSP_ANALOG, false, false, function () {
                bat_voltage_e.text(chrome.i18n.getMessage('initialSetupBatteryValue', [ANALOG.voltage]));
                bat_mah_drawn_e.text(chrome.i18n.getMessage('initialSetupBatteryMahValue', [ANALOG.mAhdrawn]));
                bat_mah_drawing_e.text(chrome.i18n.getMessage('initialSetupBatteryAValue', [ANALOG.amperage.toFixed(2)]));
                rssi_e.text(chrome.i18n.getMessage('initialSetupRSSIValue', [((ANALOG.rssi / 1023) * 100).toFixed(0)]));
            });

            if (have_sensor(CONFIG.activeSensors, 'gps')) {
                MSP.send_message(MSPCodes.MSP_RAW_GPS, false, false, function () {
                    gpsFix_e.html((GPS_DATA.fix) ? chrome.i18n.getMessage('gpsFixTrue') : chrome.i18n.getMessage('gpsFixFalse'));
                    gpsSats_e.text(GPS_DATA.numSat);
                    gpsLat_e.text((GPS_DATA.lat / 10000000).toFixed(4) + ' deg');
                    gpsLon_e.text((GPS_DATA.lon / 10000000).toFixed(4) + ' deg');
                });
            }
			*/
        }

        function get_fast_data() {
            MSP.send_message(MSPCodes.MSP_ATTITUDE, false, false, function () {
	            roll_e.text(chrome.i18n.getMessage('initialSetupAttitude', [SENSOR_DATA.kinematics[0]]));
	            pitch_e.text(chrome.i18n.getMessage('initialSetupAttitude', [SENSOR_DATA.kinematics[1]]));
                heading_e.text(chrome.i18n.getMessage('initialSetupAttitude', [SENSOR_DATA.kinematics[2]]));

                self.renderModel();
                self.updateInstruments();
            });
        }		
/*
        // UI Hooks
        $('a.calibrateAccel').click(function () {
            var self = $(this);

            if (!self.hasClass('calibrating')) {
                self.addClass('calibrating');

                // During this period MCU won't be able to process any serial commands because its locked in a for/while loop
                // until this operation finishes, sending more commands through data_poll() will result in serial buffer overflow
                GUI.interval_pause('setup_data_pull');
                MSP.send_message(MSPCodes.MSP_ACC_CALIBRATION, false, false, function () {
                    GUI.log(chrome.i18n.getMessage('initialSetupAccelCalibStarted'));
                    $('#accel_calib_running').show();
                    $('#accel_calib_rest').hide();
                });

                GUI.timeout_add('button_reset', function () {
                    GUI.interval_resume('setup_data_pull');

                    GUI.log(chrome.i18n.getMessage('initialSetupAccelCalibEnded'));
                    self.removeClass('calibrating');
                    $('#accel_calib_running').hide();
                    $('#accel_calib_rest').show();
                }, 2000);
            }
        });

        $('a.calibrateMag').click(function () {
            var self = $(this);

            if (!self.hasClass('calibrating') && !self.hasClass('disabled')) {
                self.addClass('calibrating');

                MSP.send_message(MSPCodes.MSP_MAG_CALIBRATION, false, false, function () {
                    GUI.log(chrome.i18n.getMessage('initialSetupMagCalibStarted'));
                    $('#mag_calib_running').show();
                    $('#mag_calib_rest').hide();
                });

                GUI.timeout_add('button_reset', function () {
                    GUI.log(chrome.i18n.getMessage('initialSetupMagCalibEnded'));
                    self.removeClass('calibrating');
                    $('#mag_calib_running').hide();
                    $('#mag_calib_rest').show();
                }, 30000);
            }
        });

        $('a.resetSettings').click(function () {
            MSP.send_message(MSPCodes.MSP_RESET_CONF, false, false, function () {
                GUI.log(chrome.i18n.getMessage('initialSetupSettingsRestored'));

                GUI.tab_switch_cleanup(function () {
                    TABS.currentstate.initialize();
                });
            });
        });

        // display current yaw fix value (important during tab re-initialization)

        $('#content .backup').click(function () {
            if ($(this).hasClass('disabled')) {
                return;
            }

            configuration_backup(function () {
                GUI.log(chrome.i18n.getMessage('initialSetupBackupSuccess'));
            });
        });

        $('#content .restore').click(function () {
            if ($(this).hasClass('disabled')) {
                return;
            }

            configuration_restore(function () {
                // get latest settings
                TABS.currentstate.initialize();

                GUI.log(chrome.i18n.getMessage('initialSetupRestoreSuccess'));
            });
        });
*/
        // cached elements

        $('div#interactive_block > a.reset').text(chrome.i18n.getMessage('initialSetupButtonResetZaxisValue', [self.yaw_fix]));

        // reset yaw button hook
        $('div#interactive_block > a.reset').click(function () {
            self.yaw_fix = SENSOR_DATA.kinematics[2] * - 1.0;
            $(this).text(chrome.i18n.getMessage('initialSetupButtonResetZaxisValue', [self.yaw_fix]));

            console.log('YAW reset to 0 deg, fix: ' + self.yaw_fix + ' deg');
        });

        GUI.interval_add('setup_data_pull_fast', get_fast_data, 33, true); // 30 fps
        GUI.interval_add('setup_data_pull_slow', get_slow_data, 250, true); // 4 fps

        GUI.content_ready(callback);
    }
};

TABS.currentstate.initializeInstruments = function() {
    var options = {size:90, showBox : false, img_directory: 'images/flightindicators/'};
    var attitude = $.flightIndicator('#attitude', 'attitude', options);
    var heading = $.flightIndicator('#heading', 'heading', options);

    this.updateInstruments = function() {
        attitude.setRoll(SENSOR_DATA.kinematics[0]);
        attitude.setPitch(SENSOR_DATA.kinematics[1]);
        heading.setHeading(SENSOR_DATA.kinematics[2]);
    };
};

TABS.currentstate.initModel = function () {
    this.model = new Model($('.model-and-info #canvas_wrapper'), $('.model-and-info #canvas'));

    $(window).on('resize', $.proxy(this.model.resize, this.model));
};

TABS.currentstate.renderModel = function () {
    var x = (SENSOR_DATA.kinematics[1] * -1.0) * 0.017453292519943295,
        y = ((SENSOR_DATA.kinematics[2] * -1.0) - this.yaw_fix) * 0.017453292519943295,
        z = (SENSOR_DATA.kinematics[0] * -1.0) * 0.017453292519943295;

    this.model.rotateTo(x, y, z);
};

TABS.currentstate.cleanup = function (callback) {
    if (this.model) {
        $(window).off('resize', $.proxy(this.model.resize, this.model));
    }

    if (callback) callback();
};
