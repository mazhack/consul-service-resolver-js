"use strict";

var chai = require('chai');
var expect = chai.expect;
var Bunyan = require("bunyan");

const logger = Bunyan.createLogger({ name: 'app'/*, level: Bunyan.ERROR */ });

const ConsulServiceResolver = require('../');

const data = [
    {
        "Checks": [
            {
                "ModifyIndex": 90796,
                "CreateIndex": 56257,
                "Node": "vm_docker_3_s1.lostaxis.com",
                "CheckID": "serfHealth",
                "Name": "Serf Health Status",
                "Status": "passing",
                "Notes": "",
                "Output": "Agent alive and reachable",
                "ServiceID": "",
                "ServiceName": ""
            },
            {
                "ModifyIndex": 91055,
                "CreateIndex": 91050,
                "Node": "vm_docker_3_s1.lostaxis.com",
                "CheckID": "service:f56d25af11eb:taxidispatch_zmqbroker:9001",
                "Name": "service:f56d25af11eb:taxidispatch_zmqbroker:9001",
                "Status": "passing",
                "Notes": "",
                "Output": "TCP connect 192.168.100.113:9001: Success",
                "ServiceID": "f56d25af11eb:taxidispatch_zmqbroker:9001",
                "ServiceName": "zmqbroker.sub.td"
            }
        ],
        "Service": {
            "ModifyIndex": 91055,
            "CreateIndex": 90904,
            "EnableTagOverride": false,
            "Port": 9001,
            "Address": "192.168.100.113",
            "Tags": [
                "zmq sub"
            ],
            "Service": "zmqbroker.sub.td",
            "ID": "f56d25af11eb:taxidispatch_zmqbroker:9001"
        },
        "Node": {
            "ModifyIndex": 91055,
            "CreateIndex": 56253,
            "TaggedAddresses": {
                "wan": "192.168.100.113"
            },
            "Address": "192.168.100.113",
            "Node": "vm_docker_3_s1.lostaxis.com"
        }
    },
    {
        "Checks": [
            {
                "ModifyIndex": 56256,
                "CreateIndex": 56256,
                "Node": "vm_docker_3_s2.lostaxis.com",
                "CheckID": "serfHealth",
                "Name": "Serf Health Status",
                "Status": "passing",
                "Notes": "",
                "Output": "Agent alive and reachable",
                "ServiceID": "",
                "ServiceName": ""
            }
        ],
        "Service": {
            "ModifyIndex": 91079,
            "CreateIndex": 91079,
            "EnableTagOverride": false,
            "Port": 9001,
            "Address": "192.168.100.123",
            "Tags": [
                "zmq sub"
            ],
            "Service": "zmqbroker.sub.td",
            "ID": "16f1479b3b0f:taxidispatch_zmqbroker:9001"
        },
        "Node": {
            "ModifyIndex": 91080,
            "CreateIndex": 56256,
            "TaggedAddresses": {
                "wan": "192.168.100.123"
            },
            "Address": "192.168.100.123",
            "Node": "vm_docker_3_s2.lostaxis.com"
        }
    }
];

describe("test1.js", function () {

    it('test 1', function (done) {

        let resolver = new ConsulServiceResolver('zmqbroker.sub.td');

        resolver.on('resolve_consul_config', function (data) {
            let expected = {
                name: 'zmqbroker.sub.td',
                index: 0,
                del: [],
                new: [
                    { address: '192.168.100.113', port: 9001 },
                    { address: '192.168.100.123', port: 9001 }
                ]
            };
            expect(expected).to.be.deep.equals(data);

            let address=[
                { address: '192.168.100.113', port: 9001 },
                { address: '192.168.100.123', port: 9001 }
            ];
            expect(address).to.be.deep.equal(this.service_addresses);

            done();
        });

        resolver.consul_process(data);
    });

    it('test 2', function (done) {

        let resolver = new ConsulServiceResolver('zmqbroker.sub.td');
        resolver.service_addresses = [
                { address: '192.168.100.113', port: 9001 },
                { address: '192.168.100.133', port: 9001 }
            ];

        resolver.on('resolve_consul_config', function (data) {
           let expected = {
                name: 'zmqbroker.sub.td',
                index: 0,
                del: [
                    { address: '192.168.100.133', port: 9001 }
                ],
                new: [
                    { address: '192.168.100.123', port: 9001 },
                ]
            };
            expect(expected).to.be.deep.equals(data);

            let address=[
                { address: '192.168.100.113', port: 9001 },
                { address: '192.168.100.123', port: 9001 }
            ];
            expect(address).to.be.deep.equal(this.service_addresses);

            done();
        });

        resolver.consul_process(data);
    });

    it('test 3', function (done) {

        let resolver = new ConsulServiceResolver('zmqbroker.sub.td');
        resolver.service_addresses = [
                { address: '192.168.100.113', port: 9001 },
                { address: '192.168.100.123', port: 9001 },
                { address: '192.168.100.133', port: 9001 }
            ];

        resolver.on('resolve_consul_config', function (data) {
           let expected = {
                name: 'zmqbroker.sub.td',
                index: 0,
                del: [
                    { address: '192.168.100.133', port: 9001 }
                ],
                new: []
            };
            expect(expected).to.be.deep.equals(data);

            let address=[
                { address: '192.168.100.113', port: 9001 },
                { address: '192.168.100.123', port: 9001 }
            ];
            expect(address).to.be.deep.equal(this.service_addresses);

            done();
        });

        resolver.consul_process(data);
    });

    it('test 4', function (done) {

        let resolver = new ConsulServiceResolver('zmqbroker.sub.td');
        resolver.service_addresses = [
                { address: '192.168.100.113', port: 9001 },
                { address: '192.168.100.123', port: 9001 },
                { address: '192.168.100.133', port: 9001 }
            ];

        resolver.on('resolve_consul_config', function (data) {
           let expected = {
                name: 'zmqbroker.sub.td',
                index: 0,
                del: [
                    { address: '192.168.100.113', port: 9001 },
                    { address: '192.168.100.123', port: 9001 },
                    { address: '192.168.100.133', port: 9001 }
                ],
                new: []
            };
            expect(expected).to.be.deep.equals(data);

            let address=[];
            expect(address).to.be.deep.equal(this.service_addresses);
        });

        resolver.on('resolve_consul_no_servers', function(){
            done();
        })

        resolver.consul_process([]);
    });

});