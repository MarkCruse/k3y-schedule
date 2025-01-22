## Steps to Update nvm and Node:  

1. Check for the Latest nvm Version  
Open your terminal  
Run the following command to get the latest release tag:
```bash
git -C ~/.nvm ls-remote --tags origin | grep refs/tags/v | sort -V | tail -n 1 | cut -d/ -f3  
```
This command will:  
*   Access the nvm repository within your ~/.nvm directory.  
*   List all remote tags.  
*   Filter for tags starting with "v".  
*   Sort the tags in version order.  
*   Extract the latest version tag.  

2. Update nvm  
Run the following command to update nvm to the latest version:  
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
Replace v0.40.1 with the latest version tag you obtained in step 1.  

Close and reopen your terminal for the changes to take effect.  

3. Verify the Update   

In the terminal, run:  
```bash
nvm --version
```
4. Install the latest LTS (Long-Term Support) version of Node.js    
```bash
nvm install node --latest-npm  
```
5. Set the installed node version as the default version   
```bash
nvm alias default node  
```
6. Output the current version of Node.js  
```bash
node -v  
```

## Here's a step-by-step guide with detailed instructions to install, run, and maintain the JavaScript code:

1. Set Up a Project Directory
Create a directory for your project: Choose a meaningful name, such as k3y-schedule.  
```bash
mkdir k3y-schedule
cd k3y-schedule
```

2. Initialize the directory: Run the following command to initialize a Node.js project in the directory. This creates a package.json file to manage dependencies.  
```bash
npm init -y  
```
3. Install Required Libraries  
In the k3y-schedule directory, install the libraries:  
```bash
npm install axios jsdom  
```

4. Save the JavaScript Code  
Create a file named k3y_schedule.js in the k3y-schedule directory.  
Copy the JavaScript code from the previous response and paste it into the file.  

5. Run the Script  
Run the script in the terminal:  
```bash
node k3y_schedule.js  
```

6. Open the Webpage  
To view the output:  

Open the generated k3y_schedule.html file in your browser.  
Refresh the browser manually if needed (or wait 60 seconds for automatic updates).   

## Run Script in the Background: Use a process manager like pm2 to run the script continuously.  

1. Install pm2 globally  
```bash 
npm install -g pm2  
```

2. Start the script with pm2:  
```bash
pm2 start k3y_schedule.js --name k3y-schedule
```

3. To check its status:  
```bash
pm2 status
```

4. Stop the script:  
```bash
pm2 stop k3y-schedule
```

5. After making changes to the javascript
```bash
pm2 reload k3y-schedule  # Use this after making changes
```