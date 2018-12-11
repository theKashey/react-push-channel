# react-push-channel 
[![Build Status](https://travis-ci.org/theKashey/react-push-channel.svg?branch=master)](https://travis-ci.org/theKashey/react-push-channel)
[![Greenkeeper badge](https://badges.greenkeeper.io/theKashey/react-push-channel.svg)](https://greenkeeper.io/)

----

[![NPM](https://nodei.co/npm/react-push-channel.png?downloads=true&stars=true)](https://nodei.co/npm/react-push-channel/) 

Context is to drill props down. React Push Channel drill props up.

# API
#### `createChannel(initialValue, reducer?, initialValueForReducer?)`
creates a channel, with given initialValue(used for typing), and optional reducer.
Reducer will be applied to all stored `messages`, producing the result.

createChannel return an object with 3 fields:
 - `Collector` - to collect all messages. 
    - `callback` - current value will be reported via callback.
    - `[merge]` - enabled reducer on data. Ie merges everything into a single value. Otherwise would return last value.
 - `Push` - put message into the channel
    - any props from initialValue
 - `Pop` - read the current active message. Pop __doesn't remove the message__(ie "pops"). Only `Push` component unmount removes it.

## Use as React-helmet?

```js
import {createChannel} from 'react-push-channel';

const helmet = createChannel({
  title: '',
  description: ''
});

// the root collector
<helmet.Collector 
  callback={helmet => this.setState({helmet})} // transfer reported info into the state 
  merge                                        // merge all data in reverse order 
>
   <helmet.Push title="Page Title"/>
   <helmet.Push description="Page description"/>
</helmet.Collector>

// or actually do the job

<helmet.Collector 
  callback={helmet => document.title=helmet.title} // actually SET THE TITLE! 
  merge                                         
>
   <helmet.Push title="Page Title"/>
   <helmet.Push description="Page description"/>
</helmet.Collector
```

## React-Lock

This example uses reducer to basically calculate number or active locks, and `Pop`
to read active value down the tree.
```js
const Lock = createChannel({}, acc => acc + 1, 0);

<Lock.Collector merge callback={locked => this.setState({locked: !!locked})}>
  <Lock.Push />
  <Lock.Pop>{locked => <span> is {locked?'locked':'unlocked'}</Lock.Pop>
  // ^^ would be 1 and `locked`
</Lock.Collector>  
```

# Licence
 MIT
