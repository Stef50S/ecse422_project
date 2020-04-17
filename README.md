# ECSE 422 Final Project

### Set up and Run

Once the repository is cloned, make sure that npm is downloaded through the following link:

https://www.npmjs.com/get-npm

After the installation, traverse to the project folder and enter the following command:
```
npm install
```
This command will install any dependencies needed for the program to run.
After the dependencies are installed, enter the following command to stat the program:

```
npm start
```
Write input into the input.txt file in the proper format as specified in assignment.
Otherwise use produceRandomInputData function from the utils file to create valid
random data.  

  
If you want the program to read from input.txt and prompt the user for a reliability and cost goal, set line 79 in index.ts to **false**.  
If you want to program to run for a range of N, where N is the number of cities, then set line 100 in index.ts to **true**. The minimum and maximum values of this range can be changed in line 93 while the requirement and cost goal can be set in line 96.  
**Note**: If line 79 is set to false, then line 100 must be true and vice versa.
