## Hardware
The MoDNS Framework is designed to run on any device that can run Ubuntu. The device is intended to be set up on a network as a dedicated local DNS Server.

## Software
MoDNS is a modular DNS server where all functionality is provided by plugins. Plugins are self-contained libraries or scripts which are loaded by the MoDNS server at launch and used to determine how incoming DNS requests are handled. Plugins implement atleast one of the following modules:
 - Listeners: control how incomining packets are parsed into a DNS Requeset
 - Interceptors: respond to or drops a DNS request before it is resolved
 - Resolvers: control how outbound DNS requests are handled
 - Validators: can drop a response
 - Inspectors: sees the DNS response

### Backend
The MoDNS Back-End implements plugin integration, hosts a Rest API, and hosts the Front-End webserver. By default, MoDNS will ship with plugins that implement basic DNS resolution and caching. MoDNS is designed to allow its admin to change any aspect of the DNS process on their local network.  The Backend will load the plugins on startup and implement their functionality. The Rest API will be used for Back-End and Front-End communication. The Back-End will host a Front-End for easy server management.

### Plugins

### API


### Frontend