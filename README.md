# UW Seattle Bus Map

## Description
For our final project in GEOG 328, we decided to make a webmap showing live-updating positions of buses in Seattle, specifically those that go to and from UW. We chose to display the following routes: 43, 44, 45, 48, 49, 65, 67, and 70.

[Check out the map here!]() -> ADD LINK WHEN EVERYTHING IS DONE; DOES NOTHING RIGHT NOW

## Goal
We intend for this webmap to be used as a fun yet realistic display of a few buses that serve the UW Seattle campus. The webmap is not meant to be used for actual navigational purposes.

## Main Functions - have screenshots for each function
[insert here]

## Data Sources
Our webmap utilizes General Transit Feed Specification (GTFS) data from King County Metro that comes in two forms: static and real-time (GTFS-RT). The static GTFS data is a collection of 11 CSVs represented as .txt files that describe a variety of characteristics for King County Metro Transit Services, such as scheduling, fares, routes, stops, and trips. The GTFS-RT data comes from King County Metro’s S3 AWS link, which we pull from every 7.5 seconds. The data that comes from the link describes the live positions of individual buses for all of King County and is in JSON.

## Applied Libraries and Webservices
Due to a Cross-Origin Resource Sharing (CORS) error, we were not able to pull from King County Metro's S3 AWS link directly. To work around this, we used Cloudflare Workers to create a third-party proxy that helps us pull data indirectly.

## Acknowledgements
[insert here]

## AI Disclosure - how have we used AI?
1. (for the front end), we used AI to help us make the menu look fancier, also, it did teach us how to filter the routes we want.
