# Websocket Schema

### Client sent events

- Join a space
    
    ```go
    {
        "type": "join",
        "payload": {
    	    "spaceId": "123",
    	    "token": "token_received_during_login"
        }
    }
    ```
    
- Movement
    
    ```go
    {
        "type": "move",
        "payload": {
    	    "x": 2,
    	    "y": 3
        }
    }
    ```
    

### Server sent events

- Space joined
    
    ```go
    {
        "type": "space-joined",
        "payload": {
    	    "spawn": {
    		    "x": 2,
    		    "y": 3
    	    },
    	    "users": [{
    		    "id": 1,
    	    }]
        }
    }
    ```
    
- Movement Rejected
    
    Sent if the server found a collission and prevented you from moving to a block. It’ll return you back x, y of where you should be pushed back to.
    Used for cases like
    
    1. User moves beyond the wall
    2. User collided with a different user
    3. User tried to sit on an element that is st
    
    ```go
    {
       "type": "movement-rejected",
       "payload": {
    	   x: 2,
    	   y: 3
       }
    }
    ```
    
- Movement
    
    ```go
    {
    	"type": "movement",
    	"payload": {
    	  "x": 1,
    	  "y": 2,
    	  "userId": "123"
    	}
    }
    ```
    
- Leave
    
    ```go
    {
    	"type": "user-left",
    	"payload": {
    		"userId": 1
    	}
    }
    ```
    
- Join event
    
    ```go
    {
    	"type": "user-join",
    	"payload": {
    		"userId": 1,
    		"x": 1,
    		"y": 2
    	}
    }
    ```