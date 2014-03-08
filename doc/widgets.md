Widgets
=======

Widgets are customizable displays for your plugin within other pages. You can
have a widget on the main page, or on another plugin's page (if they accept
widgets.)

The purpose of a widget is to display data unique to your plugin for the user.
Since the content is customizable, you can make charts, paragraphs or
lists (or any combination thereof within your space.

You can customize your widgets for the individual pages.  You may wish to have
a "dashboard"-style plug that fits on the main page, or plugins for a page you
write with more detail.

# Code

Within the code, you should expose a function called `_widget_page_uniqueName`.
The `page` variable will add your widget to that page. The `uniqueName` must be
unique across ALL plugins and should describe your widget's function.

You may have more than one plugin per page (if you need it), just choose another
`uniqueName`.

# Structure

All widgets should return the following structure, or `null` if you do not want
them to appear at this time (perhaps they must login or have to do something
before the widget appears).

    return {
        title: String
        content: String,
        width: Number,
        actions: {
            String: {
                url: String,
                icon: String
            }
        },
        icon: String,
        jadeLocals: {
            String: Variable
        }
    }

* title - The widget (a Bootstrap well) heading.
* content - The jade file found in `yourplugin/views/` directory.
* width - The Bootstrap width (1 through 12), most widgets should be 12.
* actions - The name of the list item under the "Actions" button in the heading.
* url - A global or relative url to call on click.
* icon - The Font Awesome v4 icon name without the fa- (e.g. "cog")
* jadeLocals - Any variables or data computed in the calling of the widget you
wish to expose directly to Jade before markup.

For Jade to be able to get the variables, the data must be in the session.
Example, `widget_index_listRepos` will be called from `index.jade` which
calls all widgets with:

    - var widgetData = kodrIO.plugins[pluginName][functionName](session);

which will be called from `routes.js` as
`res.render("page", { session: req.session }`.

There are a number of layers we are passing the data through in order to get
it to the user, so any plugin which requires data within a widget should store
all the data within the `req.session` namespace.  Please note, you are sharing
the `req.session` namespace, so please be kind to other plugins and store your
data under a unique name; stay away from generic terms like `data` or `user`.

## Actions

The "Actions" button will only appear when there are actions contained. Actions
can also take `divider` to put a Bootstrap list item divider.

    actions: {
        "Refresh": { url: "/refresh", icon: "refresh" },
        "divider": {}
        "Logout": { url: "/logout", icon: "user" }
    }
