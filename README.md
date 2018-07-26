# outback-slack-app

[Slack](https://slack.com) app that delivers random words from the infamous [Outback blacklist](https://www.reddit.com/r/webdev/comments/91mi29/the_source_over_at_outback_steakhouse_is_mighty/). How vulgar!

[![Add to Slack](https://platform.slack-edge.com/img/add_to_slack.png)](https://slack.com/oauth/authorize?client_id=404565662049.404406837920&scope=commands)</a>

## Infrastructure

An AWS API Gateway proxies HTTP requests from a public url to a Lambda which runs the code in this repo.


## Development

I suggest setting up [ngrok](https://ngrok.com/). ngrok gives you a public URL that redirects to localhost. This way, you can do all of your development and testing locally and with your debugger instead of having to update and republish the Lambda over and over.

Seriously, it saves a ton of time and it's extreemly easy to setup.

1. Start the test server with `node test/server.js`
2. Create a ngrok proxy to the test server: `ngrok http 3000`
3. Replace the request URLs in your Slack app with your ngrok HTTPS URL. Don't forget to set them back when you are done.


## Releasing

Use `/tools/build` to build the project and make it ready to run on Lambda. It ensures only necessary node modules are included and zips everything up. You can also just manually zip up this repo. After everything is zipped, use the zip to update the Lambda.


## Useful Links

- [Slack App Docs](https://api.slack.com/slack-apps)
