# CIT_Frontend

## REACT2SHELL

So, during our work on the project, a major vulnerability was discovered in
React. Specifically, React2Shell (CVE-2025-55182) [https://react2shell.com/] is
a critical security flaw that allows attackers to execute arbitrary shell
commands on a server running a vulnerable version of React. Although we assume
that it is unlikely to be a problem for us, since we are not exposing our React
server to the internet, we should still take the appropriate steps to resolve
this.

### How are we exposed?

As far as we understand, the issue in our case arises from the fact that we are
using react-router, which not only affected by the vulnerability, but also
incredibly popular in general.

Further details on the specifics can be found at
[https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components]

Upon further investigation, it appears that our project is potentially not
direclty vulnerable (Although this is far above my paygrade to say with any level
of certainty im comfortable with). As i understand it: in short Having a
"vulnerable dependency" is not strictly the same as being vulnerable. However,
it is still a good idea to update to the patched versions to eliminate any
potential risks.

### How to fix it?

The React team has released a patch to address this vulnerability. To fix the
issue, we need to update the affected dependencies to appropriate patched
versions.

### Steps to update dependencies

As far as i understand, it is a simple matter of updating the dependencies in our
`package.json` file to the following versions:

* react 19.2.0 -> 19.2.1
* react-dom 19.2.0 -> 19.2.1

Hopefully, this should be all that is required to resolve the issue.

In our case, this was done by running the following command:

```bash
npm update react react-dom
```

Additionally, i just ensured that vite was up to date as well:

```bash
npm update vite
npx vite build
```

Finally, the project was run as usal with:

```bash
npm run dev -- --open
```

