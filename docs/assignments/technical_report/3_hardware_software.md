\pagebreak
## Hardware

The MoDNS Framework is designed to run on any device that can run Ubuntu Linux. The device is intended to be set up on a LAN network as a dedicated local DNS Server.

## Software

MoDNS is a modular DNS server where all functionality is provided by plugins. Plugins are small user defined programs loaded by the server at launch.These plugins are used to determine how incoming DNS requests are handled. By using these plugins for individual services a user can have all of the benefits of a layered DNS solution without the need to chain a stream of individual DNS servers.

### Back-End

The MoDNS Back-End implements plugin integration, hosts a Rest API, and hosts the Front-End web server. By default, MoDNS will ship with plugins that implement basic DNS resolution and caching. MoDNS is designed to allow its admin to change any aspect of the DNS process on their local network. The Backend will load the plugins on startup and implement their functionality. The Rest API will be used for Back-End and Front-End communication. Alongside communication, the API will also allow the front-end to make plugin configuration changes and plugin management changes. The Back-End will host a Front-End for easy server management.

### Plugins

Plugins handle the DNS process by implementing at least one of the following modules:
 - Listeners: Controls how incoming packets are parsed into a DNS Request
 - Interceptors: Responds to or drops a DNS request before it is resolved
 - Resolvers: Controls how outbound DNS requests are handled
 - Validators: Can drop a DNS response
 - Inspectors: Sees the DNS response
These plugins will form the foundation of the DNS server and allow administrators and hobbyists to develop their own plugins for their DNS server. 

Plugins are created by the user in any compiled language that can expose C functions. Prime examples of these languages would be C/C++ itself, Go, and Rust which the backend is built with. These plugins can access functions within the MoDNS sdk that allows users to directly interact with the framework and manipulate the DNS requests as they see fit. You can see an example of a user defined plugin in the appendices. 

### API

To facilitate communication of data between the framework itself and a user-friendly front end website, we created an API baked into the backend. This API uses the plugin manager provided by the framework to grab plugin data, lists, and statistics and sends the data in JSON format to the frontend. In addition to the communication, the frontend can send requests to the API that will modify plugin configuration and handle plugin management. This allows users unfamiliar with command line interfaces or programming languages to easily change plugin configurations from the frontend website. 

### Front-End

One major goal of this project was to be accessible to the average hobbyist user who may not be as familiar with command line interfaces. To accomplish this goal, we created a user friendly web interface to manage the server. The website consists of four main pages: Dashboard, Plugins, Tools, and Settings. 
 
#### Dashboard

The dashboard will serve as an at-a-glance look into the current state of the plugins currently installed in the local server. A feature of this dashboard is the customization the user is allowed. Any graph, number, or label applied to the dashboard is done by the user. See Appendices for screenshots. 

#### Plugins

This webpage allows the user to manage the plugins without the need for entering a command line interface. Two views exist for this page: the overview and sequential view. The overview allows the user to see all plugins listen in their respective module. The sequential view gives the user a look into the order by which the intalled plugins are being called. The user will have the ability to change the order of certain plugins and also disable and enable plugins as they please. 

#### Tools

Plugin developers will also hold the ability to create custom settings page for their plugins. By using the tools page, they gain access to a custom settings page builder that allows them to link certain buttons, switches, and other widgets to their plugin. They can then download this page as a JSON file to include in their plugin package. 

#### Settings

The settings page allows the user to configure the local DNS server settings. Here the page is categorized into three different types of settings: General, Web, and Web Security. 

Under general the user will find generic settings such as the website's theme and settings for the dashboard. In Advanced settings, the user can configure the paths the server looks at to find the plugins to install, a filter for any logs they would want for the server, and settings to decide what type of database and the information for that database. In web security, the user can find where they can give the path for the TLS cert and key for HTTPs use along with the port used for the API and a place to update the password used to enter the website.
 
Screenshots of the webpages can be found in the appendices.
