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

Balance Book is an open-source, cross-platform desktop application for managing personal finance. The primary functions of this app feature tools for filtering, sorting, and graphing recent transactions and account balances. This application uses Plaid open banking API to automatically synchronize transactions and account balances.

The goal of Balance Book is to provide free, useful information and statistics to the user about their financial data, while ensuring privacy. Your financial data is only stored on your computer. This means that ONLY YOU have access to your data, but it also disallows cloud backups and storage.

<h2 id='start'>Getting Started </h2>

If you would like to use this application on your computer, these instructions are for you (no programming experience required):

To use this app, you must sign up for a free account with [Plaid](https://plaid.com/). In order for this project to remain free for myself and all users, each user must bring their own Plaid client_id and Plaid development environment secret (Plaid allows for free API use in hobby projects, and each Plaid client supports 100 bank accounts). 

*Each Plaid account can support 100 bank account logins. If your friend has made a Plaid account for his app, you can safely share client_id and dev_secret without fear of leaking financial information (keep in mind: once accounts are added they cannot be removed from the limit).*

After you create an account with Plaid, we need to do a few things:
<h3 id='plaid'>Configure Plaid: </h3>

1. On the <a href='https://dashboard.plaid.com/overview'/>Dashboard page</a>, you need to Request Development Access. There is a small checklist to follow in order to submit and be approved (may take ~2 days to be approved). This grants your Plaid client access to the Development environment, which is necessary for fetching real-world data.

2. On the <a href='https://dashboard.plaid.com/developers/api'/>API page</a>, you need to configure the allowed redirect URLs. Add the following redirect URL: ```https://us-central1-balance-book-auth.cloudfunctions.net/balance/callback```, and save changes. This is necessary for OAuth support for institutions.

3. Finally, go to the <a href='https://dashboard.plaid.com/developers/keys'/>Keys page</a>. Copy two of these values to use later: client_id and Development secret. Once you launch the application you can submit these to enable access to real-world data.

Once you have configured the redirect URL and have working access to the development environment:
<h3 id='app'>Configure Application: </h3>

1. Go to <a href='https://github.com/zekissel/balance-book/releases'/>Releases</a> on this repository page. Download the appropiate installer for your system (Windows, MacOS, Linux).

2. Once downloaded, install on your system like any other application.

3. On first launch, you will need to register a user and password.

4. Once logged in, go to the "Profile" tab on the navigation menu. On the "Financial" tab you are presented with two inputs: one for your client_id and secret respectively. Fill in these values with the values found in  <a href='https://dashboard.plaid.com/developers/keys'>Configure Plaid: Step 3</a>, and select the button to update Plaid info.

5. At this point, you can select to "Start Link Process", which will open Plaid/Link and allow you to select your financial institution. Typically logins can be completed within the application, however (depending on institution) it is also normal to be temporarily redirected to your default browser for authentication.

<h2 id='feature'>Features </h2>

<h3 id='general'>General: </h3>

- Without connecting to Plaid, Balance Book can still be used to manually track expenses, purchases, and account balances. The same statistics will be provided as well. If Plaid is not initialized, it is the duty of the user to enter financial information periodically and accurately.

- It is highly encouraged to connect Plaid to maximize potential of the application. Upon logging into your bank account the first time, all selected financial accounts will be recognized by Balance Book and mirrored within the app. Also, the past 90 days of transaction info will be read and stored locally. Now, every time* you login to the app, recent transactions with your financial institution will be synchronized and stored locally. **will not refresh for consecutive logins within 6 hours (max 4 refreshes/day); also dependent upon your personal financial institution availability (status info available in application under "Profile" tab)*



<h3 id='activity'>Activity: </h3>

- List and calendar views of recent transactions. Filter and sort by transaction date, source, category, amount, and account

<img align='center' src="./.github/img/list.png" alt="Activity view (list)">



<h3 id='stats'>Statistics: </h3>

- Multiple charts and graphs to illustrate income and expenses. Adjustable timeframe and filterable fields. Double click charts to see full-screen.

<img align='center' src="./.github/img/statistics.png" alt="Statistics view">

---

<img align='center' src="./.github/img/statistics2.png" alt="Statistics alt view">



<h3 id='account'>Accounts: </h3>

- View current and recent account balances, for all types of accounts

<img align='center' src="./.github/img/accounts.png" alt="Accounts view">



<h2 id='dev'>For Developers </h2>

<h3 id='stack'>Stack: </h3>

- Frontend: <a href='https://www.typescriptlang.org/'>TypeScript</a>, <a href='https://react.dev/'>React</a>, <a href='https://echarts.apache.org/en/index.html'>Apache ECharts</a>, <a href='https://developer.mozilla.org/en-US/docs/Web/CSS'>Vanilla CSS</a>

- Backend: <a href='https://www.rust-lang.org/'>Rust</a>, <a href='https://tauri.app/'>Tauri</a> (v1), <a href='https://diesel.rs/'>Diesel</a>, <a href='https://www.sqlite.org/'>SQLite</a>

- 3rd Party API: <a href='https://plaid.com/'>Plaid</a> (requires HTTPS redirect: <a href='https://cloud.google.com/?hl=en'>GCP</a> and <a href='https://go.dev/'>Go</a>)


<h3 id='arch'>Architecture: </h3>

<img src='./.github/img/architecture.png' />

#### Link Initialization

When the user requests to initialize the Plaid/Link process:

1. Rust spawns a server to listen for redirects using tauri-oauth-plugin

2. Rust will query the Plaid API to create a link token, which is then passed to react-link on the frontend. Link uses this token to begin and proceed through login verification with private institutions.

3. Upon successful verification with private institution, user will be redirected to provided HTTPS URL (GCP cloud function), which redirects again to server spawned by tauri-oauth-plugin (localhost).

4. The server on localhost will extract the public token from the redirect query. This is returned to Rust and in turn exchanged for an access token through the Plaid API. Rust associates the access token with the current user and stores both in the database.
