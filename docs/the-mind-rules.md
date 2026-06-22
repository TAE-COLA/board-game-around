# The Mind rules reference

This document is the implementation reference for The Mind in this repository.
It summarizes the game rules as behavior and state transitions rather than
copying the rulebook text.

Sources checked:

- https://en.wikipedia.org/wiki/The_Mind_(card_game)
- https://ru.wikipedia.org/wiki/The_Mind_(%D0%B8%D0%B3%D1%80%D0%B0)

## Game identity

- Title: The Mind
- Designer: Wolfgang Warsch
- Type: cooperative real-time card game
- Players: 2 to 4
- Deck: number cards 1 through 100
- Objective: the team wins by completing all required levels without losing all
  lives.

## Core concept

Players collectively play all cards in ascending numeric order, but they may not
communicate card values, timing plans, counts, signals, or strategy during a
level. There is no turn order. Any player may play a card whenever they believe
it is currently the lowest unplayed card held by the team.

## Components and state

- Number cards: 1 through 100.
- Life tokens/cards: team retry resource. When a level fails while at least 1
  life remains, lose 1 life and restart that level. If the level fails while
  lives are already 0, the game is lost.
- Throwing star tokens/cards: team resource used to discard each player's lowest
  card.
- Level cards: determine the current level and milestone rewards.

Implementation state should include:

- player count
- current level
- max level
- team lives
- team throwing stars
- shuffled deck
- each player's hidden hand
- played pile
- discarded cards
- ready state per player
- current phase: setup, ready, playing, resolving mistake, level complete,
  game won, game lost

## Setup

1. Choose 2, 3, or 4 players.
2. Set the team's starting lives equal to the player count.
3. Set the team's starting throwing stars to 1.
4. Set the final level by player count:
   - 2 players: level 12
   - 3 players: level 10
   - 4 players: level 8
5. Start at level 1.

Physical component limits matter if modeled strictly:

- life supply has 5 total life cards
- throwing star supply has 3 total throwing star cards
- rewards cannot increase a resource beyond available supply

## Level setup

At the start of each level:

1. Shuffle the full 1-100 number deck.
2. Deal cards face down to each player.
3. Each player receives cards equal to the current level number.
   - Level 1: each player receives 1 card.
   - Level 2: each player receives 2 cards.
   - Continue similarly.
4. Players may look at only their own hand.
5. When ready, every player indicates readiness. In the physical game this is
   represented by placing a hand on the table.
6. The level begins only after all players are ready.

Implementation note: once a level begins, hands should usually be sorted for the
local user's readability, but other players' cards must remain hidden.

## Playing a level

- There is no turn sequence.
- Any player can play their own lowest card at any time.
- A player cannot choose a higher card while holding a lower card.
- Cards must be played in strictly ascending order across the entire team.
- Players may not reveal, hint at, or encode information about their cards.
- The team is expected to rely on timing and shared intuition.
- A level is complete when all players have no cards remaining.

## Mistake resolution

A mistake occurs when a player plays a card while one or more lower-numbered
cards are still in another player's hand.

When this happens:

1. The level fails immediately.
2. If the team has at least 1 life, lose exactly 1 life.
3. Shuffle and redeal the same level.
4. Return to ready state for that level.
5. If the team has 0 lives when the mistake happens, the game is lost.

Important implementation detail:

- A failed level does not continue from the current hands.
- Played and discarded piles reset when the failed level restarts.
- Lives may be 0; the next level failure at 0 lives ends the game.

## Throwing stars

Throwing stars are a shared team resource.

To use one:

1. A player proposes using a throwing star.
2. All players must agree.
3. If unanimous and at least 1 throwing star is available, spend 1 throwing star.
4. Each player with at least one card discards their lowest card face up.
5. Continue the level.

Notes for implementation:

- Players with no cards discard nothing.
- If the vote is not unanimous, no throwing star is spent and play continues.
- The discarded cards are public information.
- A throwing star action does not cost a life.

## Level completion and rewards

When all player hands are empty, the level is complete.

After completing a level, apply that level's reward if any:

- Complete level 2: gain 1 throwing star.
- Complete level 3: gain 1 life.
- Complete level 5: gain 1 throwing star.
- Complete level 6: gain 1 life.
- Complete level 8: gain 1 throwing star.
- Complete level 9: gain 1 life.

Respect the physical supply caps if strict component modeling is enabled:

- lives cap at 5
- throwing stars cap at 3

Then:

- If the completed level was the final level for the player count, the team wins.
- Otherwise, advance to the next level and repeat level setup.

## End conditions

The team loses when:

- a level fails while team lives are already 0.

The team wins when:

- the team completes the final required level:
  - level 12 with 2 players
  - level 10 with 3 players
  - level 8 with 4 players

## Communication restrictions

During a level, players may not:

- say or show card values
- say whether their cards are high, low, close, safe, or risky
- count down or coordinate exact timing
- use secret signs, gestures, or coded signals
- discuss who should play next

Allowed interaction:

- readiness confirmation before the level starts
- proposing and voting on a throwing star
- normal non-informational presence/tension, as long as it does not encode card
  information

For a digital implementation, the safest interpretation is to prevent all chat
or emotes during active play except explicit throwing-star vote controls.

## Advanced blind variant

After winning the normal game, the team may continue in a harder blind mode:

1. Return to level 1.
2. Keep the remaining lives and throwing stars from the completed game.
3. Play cards face down instead of face up.
4. At the end of the level, reveal and verify the played sequence.
5. If an ordering mistake occurred, lose 1 life.
6. Other rules remain the same, including throwing stars discarding cards face
   up.

This should be implemented as an optional mode, not as part of the normal win
condition.

## Implementation priorities

Minimum viable The Mind implementation:

1. 2-4 player setup.
2. Level progression and final level by player count.
3. Random 1-100 deck shuffle each level.
4. Hidden hands, local player hand visibility.
5. Ready phase before each level.
6. Real-time card play without turns.
7. Mistake detection, same-level restart, and one-life penalty per failed level.
8. Throwing star proposal, unanimous vote, and discard resolution.
9. Level rewards.
10. Win/loss handling.

Optional later features:

- strict component supply visualization
- multiplayer networking / synchronized state
- AI players for solo testing
- blind variant
- animations and tension-building timing UI
