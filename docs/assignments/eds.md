---
# create a pdf from this file with [pandoc](www.pandoc.org): `pandoc eds.md -o eds.pdf`
# or use the docker image: `docker run pandoc/latex -v .:/data pandoc eds.md -o eds.pdf`

title: "MoDS: A Modular DNS Server"
subtitle: Engineering Product Design Document
author:
- Seth Warren
- Bronson Jordan
- Aankit Pokhrel
- Carter Ray
- Tim Huhn

date: 17 December 2022

documentclass: article
geometry:
- margin=0.5in

fontfamily: cmbright
---

## Introduction

### Design problem

DNS server with plugins to expand capabilities

### Intended purpose

Provide DNS services on a residential or SOHO network

### Unintended purposes

Provide DNS services for a corporate network

### Special Features

All functionality is provided by plugin modules. This way, server functionality is infinitely configurable

## Requirements

# Functional Performance
 - MoDNS should provide DNS services
 - Should allow the installation and use of modules to alter the DNS process
 - Easily Managed from local web server hosted by MoDNS

# Opeerating Requirements
 - Linux Operating Systems

# Reliability, Robustness
 - No DNS servicing failures should occur
 - Will accommodate many needs through the use of user-defined modules

# Ease of Use
 - Should have a simple installation process
 - Should guide the user through configuring router
 - Managing enabled modules will be simple
 - Managing settings such as static IP address and hosted local address should be simple
 - Should guide the user through writing and installing modules

# Human FActors
 - Attractive Web Design
 - Use UI elements whose meanings are well-known
 - Dashboard is designed for quick information gathering

# Appearance
 - Web Server should be attractive to look at
 - Allow users to select themes to modify the appearance

# Deployment
 - MoDNS should be deployed on GitHub using an installer
