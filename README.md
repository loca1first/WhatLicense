# WhatLicense
WhatLicense is a local first Firefox/Chrome extension that retrieves and displays the license of any github project linked on HackerNews and Reddit 

# Why ?

For many developers, startups, companies anything other than MIT/BSD license is a non-starter.

I built this to quickly communicate on the page what type of license the linked github project is using to filter out MIT/BSD projects.

# How ?

1) It scans the github links on a hackernews page

2) It retrieves that github project page and scrapes the license

3) It displays the license near the github project link or Show HN title.

4) There is no API to call, no data being collected, everything runs locally in your browser.

# Roadmap

- [x] license displayed in hackernews submission title
- [x] license displayed in projects linked in hackernews comments
- [x] license displayed in reddit submission title
- [x] license displayed in projects linked in reddit comments
