Emits
=====

Core
----

# Reserved

For every trigger you emit, the **eventManager** will, as a convience, will emit
a `_finished` upon completion.

Providers
---------

# Handlers (required)

## listAllRepos

## listManagedRepos

# Handlers (optional)

# Triggers

## webhook_push

    {
        type: 'commit',
        repository: {
            name: String (usually the repo information from provider url),
            display_name: String (the friendly name of the url),
            display_url: 'https://' + provider.base '/' + repo.organization + '/' + repo.name,
            organization: repo.organization,
            private: repo.private,
            config: {
                auth: {
                    type: "ssh" || "http" || "https",
                    private_key: String (if type == "ssh") or null (to use default or not "ssh"),
                    public_key: String (if type == "ssh") or null (to use default or not "ssh"),
                    username: String (if type != "ssh") or null (if type == "ssh"),
                    password: String (if type != "ssh") or null (if type == "ssh"),
                },
                scm: 'git' || 'hg',
                clone_url: 'https://' + provider.base '/' + repo.organization + '/' + repo.name || 'git@' + provider.base ':' + repo.organization + '/' + repo.name
                organization: repo.organization,
                repo: repo.name,
            },
        },
        commit: {
            author: {
                name: String,
                email: String,
                username: String,
                image: String (link to gravatar.url)
            },
            url: String (url directly to provider for this commit),
            message: String,
            timestamp: Int (unix time since epoc in seconds),
            ref: {
                branch: String,
                hash: String (full commit hash),
                short: String (truncated to 7 characters)
            }
        },
        source: {
            type: 'plugin',
            plugin: String (name of plugin)
        },
    }


Notify
------

# Required

## notify

The `notify` emit is intended to trigger any plugin within the **notify**
subsystem. In order to accomodate the many different types of
notifications, the developer of the plugin which emits `notify` should
attempt to fill in as many fields as possible as notify-plugin developers
may use any of the fields for their specific implementation.

### Parameters

* `message` - message to send to the user. *Limited to 140 characters*

#### Optional Parameters

* `subject` - title of the message. *Limited to 80 characters*
* `body` - details of the message. Traditionally used for the body
of an email or post.
* `priority` - one of ["low", "normal", "high"].
* `type` - one of ["build", user_defined]

### Sample

    {
        subject: 'Build has finished successfully!',
        message: 'The build of your project has completed successfully.',
        priority: 'normal',
        type: 'build'
    }