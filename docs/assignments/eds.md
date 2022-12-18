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

DNS services are often single-use, requiring multiple servers to be used upstream of one another for more than one functionality.

### Primary use case
