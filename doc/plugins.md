Plugins
=======

# General Guidelines

* use promises if you want your code to wait for you to finish before moving on.
* NEVER emit a `_finished` with your plugin, the `eventManager` handles that.
* the `eventManager` will automatically send out a `_finished` for your emit,
so that you can bind to that. (E.g., if I trigger a `build` event, eventManager
will trigger `build_finished` when all handlers have been called).  Notice I
said "called", not "finished processing" or "returned data", functions that have
registered to `build` may be synchronous or asynchronous.


Authentication vs. Authorization
--------------------------------

It is very important to understand the difference between **authentication**
and **authorization** when it comes to diagnosing OAuth problems within kodrIO.

**Authentication** is allowing you access to kodrIO, **authorization** permits
read or write access to another side UNDER your account.

For example, the `github` plugin allows both **authentication** and
**authorization**.  **Authentication** logs me in to kodrIO with my GitHub
credentials. This way, it creates an account (or user space) on kodrIO so that
actions may be associated with a user.

**Authorization** will allow me access to GitHub resources (repositories)under
my account on kodrIO so that I may access my repositories at each location.

* You **authenticate** to kodrIO to gain access to the site.
* You **authorize** kodrIO to access external resources.

Using a specific example with the `github` plugin, the following two activities
are logically mutually exclusive, you do not need one to complete the other.

* You **authenticate** to kodrIO with your GitHub credentials.
* You **authorize** kodrIO to access your GitHub repositories.

I star that sentence with an asterisk, as with most OAuth plugins, if you
**authenticate** you automatically **authorize**.

Plugin developers should be conscious of the difference and should code routes
and functions for each scenario (if they provide both scenarios).

## Authentication

A plugin which provides *authentication* will need to have a `pluginType` of
`authentication` and provide routes and functions so that a user can be
uniquely identified within kodrIO.  Authentication plugins should `passport`-
capable and store data within `req.user`.

## Authorization

A plugin which provides *authorization* can be any type, as any plugin could
require authorization to perform a function.  Typically, repository providers
(plugins of type `repository`) grant authorization to your repositories, and
deploy providers (plugins of type `deploy`) may require authorization to
seemlessly deploy to your environment (e.g. Heroku).

Authorization plugins should note that the user may NOT be authenticated at the
time of authorization, and thus should store their information in `req.session`
always, and `req.user` if found.