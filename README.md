# UXsyncNow

## Brief History
Development in ServiceNow Studio allows for the creation of tables, forms, and many scripts and HTML/XML.  While Studio is great for many things, the code editor lacks from a developers perspective as it requires a button press to go full screen and when it saves, it reverts back to a forms view.  To continue editing, you must click a button to go full screen and search for the line you were working on.  This makes it time consuming to do a simple save and test.  In addition, the version control is very rudimentary.    This makes it difficult for multiple developers coding or releasing on a singular code base.

To solve these issues, UXstorm has used sn-filesync.   This is a great tool but from our use we found the following issues to limit our use:

*  Requires editing config files and many of them for different releases/product.  
	*  Handling conflicts must be done by hand
	*  May require clearing changes in the cache
*  Special table changes have to be added by hand.  
*  Doesn't handle conflicts
*  Can't switch between instances in the same project
*  Designed for global development and not Applications
*  Can't be used in automated builds and pushing to our Integration Instance

To solve these issues, we've developed an internal too, **UXsyncNow**

## Features

* Provides two way syncing between a local work area and a ServiceNow instance
	* Changes to tracked files on the local work area is pushed into the instance
	* Changes to tracked files on the instance are pulled into the work area
* Autodetects all "*files*" on the ServiceNow instance that can be managed
	* Can easily resolve conflicts
		* Pull from Instance and overwrite local file
		* Push local file to the Instance
		* Merge by pulling file from instance and saving it in the local work area with the same name plus extension .merge.  You can then merge with your favorite merge tool
	* Can resolve one or all conflicts in one command
* Works with ServiceNow Applications
	* Note: You can create a ServiceNow Application in the Global Scope if you need your work to be in global.
*  Provides an application command line interface for easy interaction and setup
*  Easy setup
*  Can support many different configurations in the project to connect to different instances
	* Defaults to a dev config
	* Command line option -p (or --prod) to use production configuration
* Can run without watching the work-area to support pull or pushing
	* Pull all files from Instance and overwrite create local work area
	*  Push the files from the local work area to the instance.  We uses this for production builds to our Integration Instance
*    Can override a *file* from the Instance to be stored/watched in another location.  This is useful for specifying files from a build/generate area to the appropriate ServiceNow file.  We use this for our WebPack bundles to UI Scripts.
*    Supports using a Proxy Server
# Initial Setup

## Installation
Install from NPM

```
npm install uxsyncnow -g
```

Download the UpdateSet from [ServiceNow Share](https://share.servicenow.com).  Load the update set into your instance.  **NOTE**: This application is designed for development and should only be used in Development and Test, do not use this on a production instance.

Once the UpdateSet is loaded, any users that you want to use **UXsyncNow** must have two roles assigned  -- *admin* and *uxsyncnow_user_*.   If the user used to connect to the instance doesn't have these roles, the application will not connect.

The updateset only adds a webserve and roles.
 
## Setup initial Work Area

Goto the directory where you want the work area to be created and follow the following steps:
* Execute uxsyncnow
	* Set missing options
		* host -  `set option host uxstormdev1.service-now.com`
		* user - `set option user reed.owens`
		* password - `set option password` and enter the password in via the keyboard
	* Connect to the instance -- `connect`
	* Retrieve all the applications and tables from the instance - `refresh all`
	* List all the applications - `list apps`
	* Specify the application to sync/watch - `set app 14`
	* Start the sync/watching - `sync`

Here is the command output of an initial connection using 

| Option        | Value          |
| ------------- | ---------------|
| host          | uxstormdev1.service-now.com
| user          | reed.owens
| password      | not shown


```
%uxsyncnow
You are not connected to your instance.  Please setup your connection.
host is not defined
user is not defined
password is not defined
uxsyncnow: set option host uxstormdev1.service-now.com
uxsyncnow: set option user reed.owens
uxsyncnow: set option password
The ServiceNow user password to use to connect to the Instance
password = ******
uxsyncnow: connect
Connected!
uxsyncnow: refresh all
Refreshing applications
Refreshing tables
Done.
uxsyncnow: list apps
1)  x_uxs_expreport01    Expense Reports                          version: 1.0.0
2)  x_testapp_for_uxsh   TestApp for UXsheets                     version: 1.0.0
3)  x_demo_sample        Demo Sample                              version: 1.0.0
4)  global               [WS] Xplore: Developer Toolkit           version: 4.4
5)  global               Sample Global Application                version: 1.0.0
6)  global               UXstorm's UXsyncNow                      version: 1.0.0
7)  x_uxs_ls             UXstorm LocalScript                      version: 1.1.17
8)  x_uxs_demo_printcr   UXstorm Printable CR Demo                version: 1.0.0
9)  x_invoice            Invoice                                  version: 1.0.0
10) x_193105_invoice     Invoice Demo                             version: 2.0.2
11) x_uxs_leave          Leave Request                            version: 1.0.3
12) x_uxs_pdf            UXstorm PDF                              version: 1.3.13
13) x_uxs_uxsheets       UXsheets                                 version: 0.1.12
14) x_test_app_for_uxs   Test App for UXsyncNow                   version: 1.0.0
uxsyncnow: set app 14
lookup :14
Found : Test App for UXsyncNow (f58f6f7df793030022d7e4c7238dff47)
uxsyncnow: sync
uxsyncnow:
```

This initialization will create a file in the current directory named uxsyncnow-config-XXX.json and a directory named .uxsyncnow-XXX where XXX is the configuration type.  By default this will be dev.  If ran with a -p option then it will be prod.  The .json file should be put under source control and the directory ignored by source control.  The directory contains the cache information.

## Running with existing Work Area

If a work area has already been setup, then all you need to do is run **uxsyncnow**.  If the work area is the dev work area, nothing extra needs to be specified.  You can specify the production work area by using the command line argument -p `uxsyncnow -p` .  Additional work areas can be used by specifying their name with the -c option.  For example a work area called reed can be specified by `uxsyncnow -c reed`.

# Command Line Options

**uxsyncnow** supports both short and long format for the command line options.  Short options are one char and are preceded by a single -.  Long options are words and preceded by two -.

| ---------------------- | -------------------------------------|
| Option                  | Description                             |
|-a *\<areas>**, --areas  *\<areas>* | Specifies the areas in the application that the debug statements will be printed.  *\<areas>* is a comma decimated list of the areas.  *See debug areas Application Command for list of areas* |
|-c *\<type>*, --config *\<type>* | Specifies the type of configuration to use by *\<type>* |
| -d *num*, --debug *num* | Sets the debug level to *num* |
 


# Application Command Line 

# Conflicts

# Syntonization Modes

## Sync

## Pull

## Push

