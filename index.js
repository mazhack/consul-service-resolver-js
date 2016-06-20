"use strict";

const Unirest = require('unirest');
const util = require('util');
const EventEmitter = require('events');

class ConsulResolver extends EventEmitter {

    constructor(service_name) {
        super();
        this.service_name = service_name;
        this.service_index = 0;
        this.service_addresses = [];

        this.consul_server = process.env.CONSUL_URL || 'http://localhost:8500';
    }

    resolve() {
        const url = util.format('%s/v1/health/service/%s?passing&index=%s', this.consul_server, this.service_name, this.service_index);

        Unirest.get(url)
            .end((response) => {

                setTimeout(() => {
                    this.resolve();
                }, 2000);

                // not connect to consul
                if (response.error) {
                    this.emit('resolve_consul_error', {
                        err: response.error,
                        service_name: this.service_name,
                        url
                    });
                    return;
                }

                this.service_index = response.headers['x-consul-index'];

                const addresses = [];

                response.body.forEach((s) => {
                    const address = s.Service.Address;
                    const port = s.Service.Port;

                    addresses.push({
                        address, port
                    });
                });

                const anew = addresses.filter((item) => {
                    return this.service_addresses.every((old) => {
                        return item.address !== old.address && item.port !== old.port;
                    })
                });

                const adel = this.service_addresses.filter((old) => {
                    return addresses.every((item) => {
                        return item.address !== old.address && item.port !== old.port;
                    })
                });

                this.service_addresses = addresses;

                if (anew.length > 0 || adel.length > 0) {
                    this.emit('resolve_consul_config', {
                        name: this.service_name,
                        index: this.service_index,
                        del: adel,
                        new: anew
                    });
                }

                // not servers availables
                if (this.service_addresses.length === 0) {
                    this.emit('resolve_consul_no_servers', {
                        service_name: this.service_name,
                        url
                    });
                }

            });
    }

}

module.exports = ConsulResolver;
