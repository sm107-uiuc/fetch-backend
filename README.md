<style scoped>
table {
  font-size: 15px
}
</style>

## Introduction

This repository contains the script for Fetch's  [backend task](https://docs.google.com/document/d/1Yn_xAonwLOINma3MquU5ag6KoNMkrH3uA-99pJvqaWs/edit)

## Setup instructions

This repository has been developed and tested for NodeJS version v18.12.1 and NPM version v9.2.0 **but it is likely to work on all latest LTS versions post Node 16 and stable NPM versions**. 

### Node installation


Please follow the links given to install NodeJS v18.12.1 for specific platforms

| Operating system      | Installation instructions and binaries |
| ----------- | ----------- |
| Windows      | https://nodejs.org/download/release/v18.12.1/       |
| Linux   |      https://snapcraft.io/node   |
| Mac OSX  |    https://nodejs.org/dist/v18.12.1/node-v18.12.1.pkg        |


Node installation can be verified using 

``` 
~ node --version 
v18.12.1
~ npm --version
v9.2.0
```

Once they are installed, from the root directory of the folder run, 

```
~ npm ci 
```

This installs dependencies (lodash and csv2json)

## Execution instructions

Make sure that transactions.csv is present in the working directory

If the file is not present, the script throws an error

```
~ node fetch-backend.js 5000
File not found in the current working directory
```

### Usage :

```
Usage: node fetch-backend.js <number of points to spend> [`true` to exit if insufficient points]
~ node fetch-backend.js 5000 
```

The last option is an optional argument, when set to `true` the program exits if total points to be spent exceeds the points supplied by the payers. Refer to 
for an example. 

Some example usecases: 

#### ***1. Success case***

```
~ cat transactions.csv
"payer","points","timestamp"
"DANNON",1000,"2020-11-02T14:00:00Z"
"UNILEVER",200,"2020-10-31T11:00:00Z"
"DANNON",-200,"2020-10-31T15:00:00Z"
"MILLER COORS",10000,"2020-11-01T14:00:00Z"
"DANNON",300,"2020-10-31T10:00:00Z"% 

~ node fetch-backend.js 5000
{
  "DANNON": 1000,
  "UNILEVER": 0,
  "MILLER COORS": 5300
}
```


#### ***2. Case when points to be spent exceeds points supplied by payers***
```
~ node fetch-backend.js 5000000 true
Insufficient points
```
```
~ node fetch-backend.js 5000000
{
  "DANNON": 0,
  "UNILEVER": 0,
  "MILLER COORS": 0
}
```

#### ***3. Corner case***

In this case, there is a -200 present for DANNON, which would initially not be sufficient to pay for the amount being spent by the user (200). Hence, 100 points are payed by DANNON and the remaining 100 by UNILEVER

```
~ node fetch-backend.js 200
{
  "DANNON": 1000,
  "UNILEVER": 100,
  "MILLER COORS": 10000
}
```












