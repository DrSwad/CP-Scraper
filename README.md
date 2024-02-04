# CP Scraper

Instructions:

1. Make sure [Node](https://nodejs.org/) and [npm](https://www.npmjs.com/) is installed.

2. Clone this repository and run `npm install` in the project root directory.

3. If you're trying to parse standings from CF contests, [get](https://codeforces.com/apiHelp) an API key in CF and populate the `CF_API_KEY` and the `CF_API_SECRET` fields in the `.env` file properly.

4. If you're trying to parse standings from VJudge contests -

    1. Your VJudge account needs to have at least viewing access to the contest.

    2. Sign-in to your VJudge account and get the browser cookie named `JSESSIONID` that the VJudge website sets. This cookie is essential for the script to automate parsing on your behalf, and the cookie gets refreshed automatically very often. So if you receive an error from the script regarding VJudge access, your cookie might have expired and you need to update the `.env` file with the new cookie. This issue can possibly be solved by automating the login process in VJudge using your handle and password and then retrieving the cookie, but I haven't felt the need to go through the trouble of implementing that yet.

5. Customize the `.env` file according to the your scoring method requirements.

6. Place the necessary files in the input folders:, and  folders.

    1. `dist/data/contests`: contains all the contests to parse.

    2. `dist/data/inputs`: contains the information of all the contestants.

    3. `dist/data/cf handle remaps`: allows forcefully mapping a certain CF handle to a new one. Especially useful during the Christmas magic season.

    4. `dist/data/score overwrites`: allows manually overwriting the score for a particular contestant. I found it to be very handy quite often. For example, when a contestant mistakenly used their VJudge team handle in an individual VJudge contest, or when a contestant is found to have used unfair means in a particular contest.

7.  Start parsing by running the command `npm run dev` in the project root directory.