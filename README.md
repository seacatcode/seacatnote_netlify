# seacatnote_netlify


### install
```
npm install --save git+https://github.com/seacatcode/seacatnote_netlify
```

### example (Nodejs)
```
const { NetlifyDeploy } = require('seacatnote_netlify');

const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

const netlifyDeploy = new NetlifyDeploy(NETLIFY_ACCESS_TOKEN);

async function call() {
    const sites = await netlifyDeploy.getSimpleSites();

    const siteId = sites[0].site_id;
    const siteUrl = sites[0].url;

    netlifyDeploy.file('timestamp', String(Date.now()));

    netlifyDeploy.file('index.html', `<!DOCTYPE html><html><body>준비중입니다 <a href="${siteUrl}">${siteUrl}</a></body></html>`);

    netlifyDeploy.writeZipFile(__dirname, 'deploy.zip');

    await netlifyDeploy.deploy(siteId);
}

call();
```

### example (Typescript)
```
import { NetlifyDeploy } from 'seacatnote_netlify';

const netlifyDeploy = new NetlifyDeploy();

async function call() {
    const sites = await netlifyDeploy.getSimpleSites();

    const siteId = sites[0].site_id;
    const siteUrl = sites[0].url;

    netlifyDeploy.file('timestamp', String(Date.now()));

    netlifyDeploy.file('index.html', `<!DOCTYPE html><html><body>준비중입니다 <a href="${siteUrl}">${siteUrl}</a></body></html>`);

    netlifyDeploy.writeZipFile(__dirname, 'deploy.zip');

    await netlifyDeploy.deploy(siteId);
}

call();
```

### License
MIT License