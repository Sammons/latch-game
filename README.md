#LATCH

###Rules?

- (Math.ceil(0.10) * players) == num players allowed to latch
- When you maintain your latch, you get points 
	- the server checks every 100ms, and adds 1 point for the latched players
- When you don't maintain your latch nothing happens
- The goal is to get as many points as possible!

###How to play

- Use the enum in latch-game-client.ts to issue requests to the server.... this is as simple as writing numbers to the socket delimitted by `\n`. The server always responds with JSON for valid numbers.
	- Note you can play with netcat by just typing the numbers into the console and hitting enter. *hardmode*?
- When you disconnect and reconnect you are always treated as a new player.

###Actions you can perform:

- LATCH (just for you)
	- LATCH_SUCCESS (if < max allowed latches present)
	- LATCH_FAILURE (if >= max allowed latches present)
- UNLATCH (everyone including you)
	- UNLATCH_SUCCESS
- REPORT
	- tells you how you are doing in the game
- MYLATCHSTATUS
	- tells you if you are currently latched 

###This code is open and free, use it at your own risk.

###This is the first (unstable and dirty) rendition of Latch. *don't judge*
