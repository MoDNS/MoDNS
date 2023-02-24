## Hardware
The MoDNS Framework is designed to run on any device that can run Ubuntu. The device is intended to be set up on a network as a dedicated local DNS Server.

## Software
MoDNS is a modular DNS server where all functionality is provided by plugins. Plugins are self-contained libraries or scripts which are loaded by the MoDNS server at launch and used to determine how incoming DNS requests are handled. 

### Back-End
The MoDNS Back-End implements plugin integration, hosts a Rest API, and hosts the Front-End webserver. By default, MoDNS will ship with plugins that implement basic DNS resolution and caching. MoDNS is designed to allow its admin to change any aspect of the DNS process on their local network.  The Backend will load the plugins on startup and implement their functionality. The Rest API will be used for Back-End and Front-End communication. The Back-End will host a Front-End for easy server management.

### Plugins
Plugins handle the DNS process by implementing atleast one of the following modules:
 - Listeners: control how incomining packets are parsed into a DNS Requeset
 - Interceptors: respond to or drops a DNS request before it is resolved
 - Resolvers: control how outbound DNS requests are handled
 - Validators: can drop a response
 - Inspectors: sees the DNS response
These plugins will form the foundation of the DNS server and allow administrators to develop their own plugins for their DNS server.

### API
The API will be used for communication between the Back-End and Front-End. This API will draw data from the MoDNS framework while managing and containing the plugins and send it to the web server to be presented to the user. It will also manage administrator authentication and plugin configuration.

### Front-End
The Front-End is a web interface designed to allow the administrator to easily manage the MoDNS Server and any implemented plugins. The web server will be hosted locally by the MoDNS server, providing access to it anywhere on the local network. The Front-End also provides functionality to monitor plugins.

