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

**TODO**