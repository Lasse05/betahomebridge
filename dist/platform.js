"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleHomebridgePlatform = void 0;
const settings_1 = require("./settings");
const platformAccessory_1 = require("./platformAccessory");
const request = require('request');
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class ExampleHomebridgePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        /**
         * This is an example method showing how to register discovered accessories.
         * Accessories must only be registered once, previously created accessories
         * must not be registered again t3o prevent "duplicate UUID" errors.
         */
        this.getdevices = new Promise((resolve, reject) => {
            var to_return = [];
            request.get({
                headers: { 'content-type': 'application/json' },
                url: 'http://' + this.config.ip + ':3000/api/discoverhomebridge',
                body: ""
            }, function (error, response, body) {
                var body = JSON.parse(body);
                body.forEach(element => {
                    console.log(element);
                    Object.entries(element).forEach(([key, value]) => {
                        var tmp = { exampleUniqueId: key + value, exampleDisplayName: key + value, raum: key, person: value };
                        to_return.push(tmp);
                    });
                });
                resolve(to_return);
            });
        });
        this.log.debug('Finished initializing platform:', this.config.name);
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }
    discoverDevices() {
        this.getdevices.then(exampleDevices => {
            for (const device of exampleDevices) {
                // generate a unique id for the accessory this should be generated from
                // something globally unique, but constant, for example, the device serial
                // number or MAC address
                const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);
                // see if an accessory with the same uuid has already been registered and restored from
                // the cached devices we stored in the `configureAccessory` method above
                const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
                if (existingAccessory) {
                    // the accessory already exists
                    if (device) {
                        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                        // existingAccessory.context.device = device;
                        // this.api.updatePlatformAccessories([existingAccessory]);
                        // create the accessory handler for the restored accessory
                        // this is imported from `platformAccessory.ts`
                        new platformAccessory_1.ExamplePlatformAccessory(this, existingAccessory, this.config.ip, this.config.password, device.raum, device.person);
                        // update accessory cache with any changes to the accessory details and information
                        this.api.updatePlatformAccessories([existingAccessory]);
                    }
                    else if (!device) {
                        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                        // remove platform accessories when no longer present
                        this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [existingAccessory]);
                        this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
                    }
                }
                else {
                    // the accessory does not yet exist, so we need to create it
                    this.log.info('Adding new accessory:', device.exampleDisplayName);
                    // create a new accessory
                    const accessory = new this.api.platformAccessory(device.exampleDisplayName, uuid);
                    // store a copy of the device object in the `accessory.context`
                    // the `context` property can be used to store any data about the accessory you may need
                    accessory.context.device = device;
                    // create the accessory handler for the newly create accessory
                    // this is imported from `platformAccessory.ts`
                    new platformAccessory_1.ExamplePlatformAccessory(this, accessory, this.config.ip, this.config.password, device.raum, device.person);
                    // link the accessory to your platform
                    this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
                }
            }
            console.log('resolved', exampleDevices);
        });
        this.getdevices.catch(error => {
            console.log('rejected', error);
        });
    }
}
exports.ExampleHomebridgePlatform = ExampleHomebridgePlatform;
//# sourceMappingURL=platform.js.map