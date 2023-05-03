## Design Considerations

### Codes & Standards

MoDNS default plugins will comply with RFC 1035 (Found in appendices).


### Safety & Environmental Protection

MoDNS is intended to run on a dedicated server at all times. It is up to the user to safely maintain the server. In regard to power conspution, the DNS Server should not consume more power than necessary to complete its tasks.


### Manufacturability

MoDNS will be easily distributable and installable onto devices that runs Ubuntu.

### Social & Political Considerations

One of the goals of this project is to give those unfamiliar with DNS the ability to modify and enhance their DNS service. Some of these modifications include bypassing geo-restrictions and dropping specific DNS requests. As part of this, some countries will be able to access parts of the internet that their government prohibits them from accessing. Combining this with other modifications that encrypt and secure DNS requests, it could open doors for many to reach past limitations given by their government. Lawsuits or public outcry for enabling user's with this ability could be a result of this. On the other hand, others may praise and support the porject for allowing just that. While we cannot make a conclusion on how people and/or governments would react to this, but we should definitely keep this in consideration as we move further toward release.

### International Context

All users on the internet, including international users, use DNS. MoDNS is not responsible for plugins that violate government internet restrictions.