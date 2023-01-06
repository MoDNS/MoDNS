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
---

## Introduction

### Design problem

DNS server with plugins to expand capabilities

### Intended purpose

Provide DNS services on a residential or SOHO network

### Unintended purposes

Provide DNS services for a corporate network

### Special Features

All DNS functionality is provided by plugin modules. This way, DNS functionality is infinitely configurable

## Requirements

# Functional Performance
 - MoDNS should provide DNS resolution services for a residential or SOHO network
 - Should allow the installation and use of modules to alter the DNS resolution process
 - Easily managed from local web server hosted alongside MoDNS daemon

# Opeerating Requirements
 - Server runs on a Linux server operating system

# Reliability, Robustness
 - Errors in one resolution process should not affect others
 - Will accommodate many needs through the use of user-defined modules
 - An easy-to-use command line interface should be available to perform maintenance in the event that the web interface is inaccessible

# Ease of Use
 - Should have a simple installation process, including instructions on configuring internal network settings
 - Should provide intuitive interface for managing installed and enabled modules
 - Should provide intuitive interface for managing server settings such as static IP, TLS, and authentication
 - Should provide developer-friendly APIs and documentation for writing plugins

# Human Factors
 - Web interface should be intuitive
 - Use UI elements whose meanings are well-known
 - Dashboard is designed for quick information gathering

# Appearance
 - Web interface should be attractive to users
 - Allow users to select themes to modify the appearance

# Deployment
 - MoDNS should be deployed on GitHub with installers available via releases
