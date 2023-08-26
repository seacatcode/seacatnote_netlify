const { NetlifyDeploy, NetlifyRedirect } = require('../dist/index');

(async function () {
    // Window Command : set NETLIFY_ACCESS_TOKEN=$Value
    // Window Powershell : $env:NETLIFY_ACCESS_TOKEN=$Value
    const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

    const netlifyDeploy = new NetlifyDeploy(NETLIFY_ACCESS_TOKEN);
    const sites = await netlifyDeploy.getSimpleSites();

    const siteId = sites[0].site_id;
    const siteUrl = sites[0].url;

    netlifyDeploy.file('timestamp', String(Date.now()));

    netlifyDeploy.file('index.html', `<!DOCTYPE html><html><body>준비중입니다 <a href="${siteUrl}">${siteUrl}</a></body></html>`);

    const netlifyRedirect = new NetlifyRedirect();

    /** HTTP 500 */
    netlifyDeploy.file('500.html', 'Internal Server Error');
    netlifyRedirect.add({ // '/error /500.html 500!'
        status: 500,
        from: '/error',
        to: '/500.html',
        force: true
    });

    netlifyRedirect.add({ // '/blog/* /post/:splat'
        from: '/blog/' + NetlifyRedirect.fromSplat,
        to: '/post/' + NetlifyRedirect.toSplat,
    });

    netlifyRedirect.add({ // '/page page=:page /page/:page 301!'
        from: '/page',
        query: { page: 'page' },
        to: '/page/:page',
        force: true
    });

    /** HTTP 404 */
    netlifyDeploy.file('404.html', 'Page Not Found');
    netlifyRedirect.add({ // '/* /404.html 404'
        status: 404,
        from: '/' + NetlifyRedirect.fromSplat,
        to: '/404.html',
    });

    await netlifyDeploy.file(netlifyRedirect);

    netlifyDeploy.writeZipFile(__dirname, 'deploy.zip');

    await netlifyDeploy.deploy(siteId);
})();