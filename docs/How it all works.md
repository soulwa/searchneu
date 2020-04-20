# Search NEU

One of the big beliefs with adding new features, designs, and functionality to Search NEU is that everything should be super simple, easy to understand, and "Just Work". This enables more people to understand the site, the codebase, and just get up to speed with everything in general!

# The stack

React is used for the Frontend and Node.js is used on the backend. The site itself runs on Amazon Web Services on ECS. A scheduled task is set to trigger the scrapers every night. An updater to get seat data and send notifications to subscribed users runs in an ECS service as well. The server itself is sitting behind CloudFlare which provides free https and helps with caching. The frontend is built with React and Webpack, and follow the standard React development patterns. Redux isn't used yet but may be added in the future. 

# Git branches and deploying to production

The master branch is the main branch for all the development. Merging into master deploys to staging.searchneu.com. Releasing to searchneu.com must be done by running the reploy script, which catches prod up to staging. When making a PR, request to merge it into the master branch. 
