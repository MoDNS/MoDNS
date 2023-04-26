\pagebreak
# Introduction

The Domain Name System, or DNS, is known as the phonebook of the internet. It allows users to use domain names instead of IP addreses to connect to websites. 

DNS was created in 1983 and has not changed much since then. Some of the largest issues impacting the DNS process are privacy, integrity, and security. Standard DNS requests are not encrypted, which allows anyone in the network as well as whoever operates your DNS resolver to view the requests. This leaves DNS open to attacks such as cache poisoning, DNS tunneling, and DNS hijacking. Since its creation, security protocols such as DNSSEC and DNS Over HTTPS have been developed to help combat the DNS security concerns. However, these security features are not always enabled or available.

DNS is an interesting topic, as setting up a custom local DNS server has many possibilities. A user can set up a local DNS server to block request to unwanted domains, increase security, cache requests, and even cache large downloads. By default, devices will use the DNS Servers provided by their internet's ISP, but a user can easily change this to use DNS Servers that are more secure, avoid censorship, or even bypass geo-restrictions. Typically, if a user wanted to combine many of these benefits, they would have to chain multple DNS servers together by settings each one as another one's resolver until the request finally goes out to an external DNS server.

The MoDNs Framework aims to provide functionality for easily implementing any process that a network administrator wishes to add. MoDNS opens up the process of DNS by allowing the installation of plugins to change how DNS queries are handled.

