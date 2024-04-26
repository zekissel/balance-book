<h1 align="center">
  <img src="./src-tauri/icons/icon.png" alt="Balance Book Logo" /><br/>
  Balance Book
</h1>

## Contents
1. <a href='#intro'>Introduction</a>
2. <a href='#start'>Getting Started</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;a. <a href='#plaid'>Configure Plaid</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;b. <a href='#app'>Configure Application</a><br/>
3. <a href='#feature'>Features</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;a. <a href='#general'>General</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;b. <a href='#activity'>Activity</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;c. <a href='#stats'>Statistics</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;d. <a href='#account'>Accounts</a><br/>
4. <a href='#dev'>For Developers</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;a. <a href='#stack'>Stack</a><br/>
&nbsp;&nbsp;&nbsp;&nbsp;b. <a href='#arch'>Architecture</a><br/>

<h2 id='intro'>Introduction </h2>

Balance Book is an open-source, cross-platform desktop application for managing personal finance. The primary functions of this app feature tools for filtering, sorting, and visualizing recent transactions and account balances. This application uses Plaid open banking API to synchronize transactions and account balances, automatically.

The goal of Balance Book is to provide users with free, useful information and insightful statistics regarding their financial data, which is periodically updated and stored locally for accuracy and privacy (since your financial data is only stored on your computer, ONLY YOU have access to your data, but this disallows cloud backups and storage).

<h2 id='start'>Getting Started </h2>

If you would like to use this application on your computer, these instructions are for you (no programming experience required):

To use this app on your own device (desktop only at the moment), please sign up for a free account with [Plaid](https://plaid.com/). For this project to remain free for myself and all users, each user must bring their own (Plaid) client ID and (Plaid) environment secret. Plaid allows for free API use in hobby projects, and each client supports 100 bank account items.

> *Use <a href='./PLAID.md'>PLAID.md</a> as a reference while reading through these instructions*

After you create an account with Plaid, we need to do a few things:
<h3 id='plaid'>Configure Plaid: </h3>

1. On the <a href='https://dashboard.plaid.com/overview'/>Dashboard page</a>, you need to request Development Access. You must verify your email and submit a short application, which may take ~2 days to be approved (Balance Book can be described when a product description is requested). This grants your Plaid client access to the Development environment, which is necessary for fetching real-world data (on June 20, 2024 the Dev environment will be decomissioned and free item testing will be available within Production environment).

2. Apply for Production access (necessary for OAuth compliance; after June 2024 will be compulsory regardless). 

3. On the <a href='https://dashboard.plaid.com/developers/api'/>API page</a>, you need to configure the allowed redirect URLs. Add the following redirect URL: ```https://us-central1-balance-book-auth.cloudfunctions.net/balance/callback```, and save changes. This is necessary for OAuth support for institutions.

4. Finally, go to the <a href='https://dashboard.plaid.com/developers/keys'/>Keys page</a>. Copy two of these values to use later: client_id and Development secret. Once you launch the application you can submit these to enable access to real-world data.

Once you have configured the redirect URL and have working access to the development environment:
<h3 id='app'>Configure Application: </h3>

1. Go to <a href='https://github.com/zekissel/balance-book/releases'/>Releases</a> on this repository page. Download the appropriate installer for your system (Windows, MacOS, Linux).

2. Once downloaded, install it on your system like any other application.

3. On the first launch, you will need to register a username and password.

4. Once logged in, go to the "Profile" tab on the navigation menu. On the "Financial" tab you are presented with two inputs: one for your client_id and secret respectively. Fill in these values with the values found in  <a href='https://dashboard.plaid.com/developers/keys'>Configure Plaid: Step 4</a>, and select the button to update Plaid info.

5. At this point, you can select "Start Link Process", which will open Plaid/Link and allow you to choose your financial institution. Typically logins can be completed within the application, however (depending on the institution) it is also normal to be temporarily redirected to your default browser for authentication.

<h2 id='feature'>Features </h2>

<h3 id='general'>General: </h3>

- Without connecting to Plaid, Balance Book can still be used to manually track expenses, purchases, and account balances. The same statistics will be provided. If Plaid is not initialized, the user must enter financial information periodically and accurately.

- It is highly encouraged to connect Plaid to maximize the potential of the application. Upon logging into your bank account the first time, all selected financial accounts will be recognized by Balance Book and mirrored within the database. Also, the past 90 days of transaction information will be read and stored locally. Now, every time* you log in to the app, recent transactions with your financial institution will be synchronized and stored for future retrieval. **will not refresh for consecutive logins within 6 hours (max 4 refreshes/day); refreshes are also dependent upon your financial institution availability (status info available in Balance Book under "Profile" tab)*


<h3 id='activity'>Activity: </h3>

- List and calendar views of recent transactions. Filter and sort by transaction date, source, category, amount, account, etc.

<img align='center' src="./.github/img/list.png" alt="Activity view (list)">



<h3 id='stats'>Statistics: </h3>

- Multiple charts and graphs to illustrate income and expenses. Adjustable timeframe and filterable fields. Double-click charts to view fullscreen.

<img align='center' src="./.github/img/statistics.png" alt="Statistics view">

---

<img align='center' src="./.github/img/statistics2.png" alt="Statistics alt view">



<h3 id='account'>Accounts: </h3>

- View current and recent account balances, for all types of financial accounts

<img align='center' src="./.github/img/accounts.png" alt="Accounts view">



<h2 id='dev'>For Developers </h2>

<h3 id='stack'>Stack: </h3>

- Frontend: <a href='https://www.typescriptlang.org/'>TypeScript</a>, <a href='https://react.dev/'>React</a>, <a href='https://echarts.apache.org/en/index.html'>Apache ECharts</a>, <a href='https://developer.mozilla.org/en-US/docs/Web/CSS'>Vanilla CSS</a>

- Backend: <a href='https://www.rust-lang.org/'>Rust</a>, <a href='https://tauri.app/'>Tauri</a> (v1), <a href='https://diesel.rs/'>Diesel</a>, <a href='https://www.sqlite.org/'>SQLite</a>

- 3rd Party API: <a href='https://plaid.com/'>Plaid</a> (requires HTTPS redirect: <a href='https://go.dev/'>Go</a> hosted on <a href='https://cloud.google.com/?hl=en'>GCP</a> (realistically cloud agnostic))


<h3 id='arch'>Architecture: </h3>

<img src='./.github/img/architecture.png' />

#### Link Initialization

When the user requests to initialize the Plaid/Link process:

1. Rust spawns a server to listen for redirects using tauri-oauth-plugin

2. Rust will query the Plaid API to create a link token, which is then passed to react-link on the frontend. Link uses this token to begin and proceed through login verification with private institutions.

3. Upon successful verification with a financial institution, the user will be redirected to the provided HTTPS URL (GCP cloud function), which redirects again to the server spawned by tauri-oauth-plugin (localhost).

4. The server on localhost will extract the public token from the redirect query. This is then exchanged for an access token through the Plaid API. Rust associates the access token with the current user and stores both in the database.

#### Misc

Plaid requires confirming a HTTPS redirect that financial institutions can send users to after account verification. Currently, I personally host the redirect URL that is hardcoded into the application, which lowers the barrier to entry for everyone. You can find the exact code I host at ./server/main.go. GCP offers 2 million free cloud function invocations per month, which I dont expect to surpass anytime soon. However, if you find that the redirect URL in <a href='#plaid'>Configure Plaid: Step 3</a> does not redirect to localhost (you can test this right now by pasting the URL in your address bar), you must host the server yourself and configure the redirect URL in ./src/component/link/PlaidLink.tsx:getServerURL and your Plaid dashboard.