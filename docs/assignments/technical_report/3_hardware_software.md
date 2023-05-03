## Hardware

The MoDNS Framework is designed to run on any device that can run Ubuntu Linux. The device is intended to be set up on a LAN network as a dedicated local DNS Server.

## Software

MoDNS is a modular DNS server where all functionality is provided by plugins. Plugins are small user defined programs loaded by the server at launch.These plugins are used to determine how incoming DNS requests are handled. By using these plugins for individual services a user can have all of the benefits of a layered DNS solution without the need to chain a stream of individual DNS servers.

### Back-End

The MoDNS Back-End implements plugin integration, hosts a Rest API, and hosts the Front-End webserver. By default, MoDNS will ship with plugins that implement basic DNS resolution and caching. MoDNS is designed to allow its admin to change any aspect of the DNS process on their local network.  The Backend will load the plugins on startup and implement their functionality. The Rest API will be used for Back-End and Front-End communication. Alongside communication, the API will also allow the front-end to make plugin configuration changes and plugin management changes. The Back-End will host a Front-End for easy server management.

### Plugins

Plugins handle the DNS process by implementing atleast one of the following modules:
 - Listeners: Controls how incomining packets are parsed into a DNS Requeset
 - Interceptors: Responds to or drops a DNS request before it is resolved
 - Resolvers: Controls how outbound DNS requests are handled
 - Validators: Can drop a DNS response
 - Inspectors: Sees the DNS response
These plugins will form the foundation of the DNS server and allow administrators and hobbyists to develop their own plugins for their DNS server.

### API

To facilitate communication of data between the framework itself and a user-friendly front end website, we created an API baked into the backend. This API uses the plugin manager provided by the framework to grab plugin data, lists, and statistics and sends the data in JSON format to the frontend. In addition to the communication, the frontend can send requests to the API that will modify plugin configuration and handle plugin management. This allows users unfamiliar with command line interfaces or programming languages to easily change plugin configurations from the frontend website.

### Front-End

One major goal of this project was to be accessible to the average hobbyist user who may not be as familiar with command line interfaces. To accomplish this goal, we created a user friendly web interface to manage the server. The Front-End is a web interface designed to allow the administrator to easily manage the MoDNS Server and any implemented plugins. The web server will be hosted locally by the MoDNS server, providing access to it anywhere on the local network. The Front-End also provides functionality to monitor plugins.

