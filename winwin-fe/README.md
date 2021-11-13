# Win-Win
React + Tailwind-css web application for the Win-Win product

The codebase is in Typescript for React.

&nbsp;

---
## Directories

&nbsp;

- ./src
    - All sourcecode
- ./src/assets
    - Images
- ./src/components
    - All reusable React components. All components should be written as:
        - const functionComponentName: React.FC&lt;PropInterface&gt; =  ({destructuredProp1, destructuredProp2}:PropInterface) => ...
- ./src/views
    - Main constructed views which hold components.
- ./src/providers
    - The context providers. Providers should export a provider component and a use&lt;Provider&gt; hook
    - Think auth &lt;AuthProvider&gt, and useAuth() providing username, permissions, etc.
- ./src/contexts
    - The contexts for state (should export the created context and an interface for the value the context holds)

&nbsp;

----

&nbsp;
## Routing

Routing is done with react-router-dom, common imports for that library are:
- BrowserRouter
    - A very common router, usually imported as Router
- Switch
    - Common switch to handle routes
- Route
    - a Route on a path to a view
- Link
    - a href to a path in the routes
- useRouteMatch
    - A way to check the route path
- useParams
    - A way to get URI params with the 
- useHistory
    - A way to push or get history programmatically
- useLocation
    - The current window location relative to the router

&nbsp;

----

&nbsp;

## Architecture

The visual architecture of win-win is that of a mobile-first application. 
[XD link](https://xd.adobe.com/view/f1d9be1e-b8d9-422e-6265-a8db42f8c012-87e8/)
ask Eli or Matthias for password
