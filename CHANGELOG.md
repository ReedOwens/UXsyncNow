# Change Log
## 1.0
### BREAKING CHANGES
**table_dir** and **multifile** options defaults will change the names and directories that the synced files are stored. 
Because of this you need to do one of the following:

* Keep same functionality of .9 Release
  * Before upgrade ensure your filesystem and instance are in sync.
  * Upgrade **uxsyncnow** and Load/Preview/and Commit the Updateset on your Instance
  * run **uxsyncnow** with with new --noinit option and setup options to mimic .9 release behavior
     ```bash
      $ uxsyncnow --noinit
      Reading config file: uxsyncnow-config-dev.json
      You are connected but no synchronization is started.  Use command 'sync' to start synchronization.
      uxsyncnow: refresh tables
      uxsyncnow: set option table_dir name
      uxsyncnow: set option multifile flat
      uxsyncnow: sync
     ```
* Switch to the new directory and file format.  
  * Before upgrade ensure your filesystem and instance are in sync.
  * Upgrade **uxsyncnow** and Load/Preview/and Commit the Updateset on your Instance
  * Remove all .uxsyncnow-??? cache directories
  * **If the files are under source control don't do this step**.  Remove the directory where your files from the Instance are synced.
  * run **uxsyncnow** with with new --noinit option to refresh tables to have the table labels retrieved.  If you don't do this then the new method to create the table directories with their labels will not work.
    ```bash
    $ uxsyncnow --noinit
    Reading config file: uxsyncnow-config-dev.json
    You are connected but no synchronization is started.  Use command 'sync' to start synchronization.
    uxsyncnow: refresh tables
    uxsyncnow: sync
    ```
  * If your files were under source control
    * Determine how to "rename" a file in your source control system.   You will have both the old and new directory structure with the "history" on the old file items.   The Source System must see the files as a move to the new path and name.
    * After everything is "moved", then ensure that there are no "old" files or directories
    

### New features
  * Table directories will be the label for the table instead of the database name.  For instance **sys_script** will be **Business Rules**.
  * If a table has multiple fields that are "files" then there are two new modes to handle the files.  **record** and **field**, both will create directories under the table directory and organize the different files.
  * New command line option **--noinit** added
  * New option added to handle Table Directory naming (**table_dir**).
  * New option added to handle Multiple Fields (**multifile**).
  * With new UpdateSet
    * Two new "blank" templates are added to ignore sys_policy and business rule templates that are "blank" templates and have data but have not been changed on the instance.
    * Ignore the message field on sys_scipt table as a "file."  The message is an html_text field that is shown to the user if the show message field is checked.   This field is not a large HTML field to be under control and is now ignored.

### Bugs Fixed

 * \#17 Some files are created that should not be because the initial "blank" value contains text
 * \#14 Add option to connect without syncing enhancement
 * \#9 Service Portal widgets do not sync correctly enhancement
 * \#15 Collapse "file" field from name if it is the only one for the table