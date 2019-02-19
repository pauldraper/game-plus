import 'source-map-support/register';
import { ArgumentParser } from 'argparse';
import { AiConsoleActor, ConsoleActor, ConsoleGame } from './console';
import * as ttt from './example/tic-tac-toe';
import { Actor, Player } from './game';
import { Minimax } from './minimax';

const parser = new ArgumentParser();
parser.addArgument('game', { choices: ['ttt'] });
parser.addArgument('--player1', { choices: ['ai', 'console'], defaultValue: 'console' });
parser.addArgument('--player2', { choices: ['ai', 'console'], defaultValue: 'console' });

const args = parser.parseArgs();

let game: ConsoleGame<any, any>;
switch (args.game) {
  case 'ttt':
    game = ttt.interactiveGame;
    break;
}

let player1: Actor<any, any>;
switch (args.player1) {
  case 'ai':
    player1 = new AiConsoleActor(game!, new Minimax(game!.game));
    break;
  case 'console':
    player1 = new ConsoleActor(game!);
    break;
}
let player2: Actor<any, any>;
switch (args.player2) {
  case 'ai':
    player2 = new AiConsoleActor(game!, new Minimax(game!.game));
    break;
  case 'console':
    player2 = new ConsoleActor(game!);
    break;
}

let { state, player } = game!.initial();
(async function next() {
  console.error(game!.print(state));
  console.error();

  const score = game!.game.score(state);
  if (score === Infinity) {
    console.error('Player 1 wins');
    process.stdin.destroy();
    return;
  }
  if (score === -Infinity) {
    console.error('Player 2 wins');
    process.stdin.destroy();
    return;
  }

  let playerNumber: number;
  switch (player) {
    case Player.MAX:
      playerNumber = 1;
      break;
    case Player.MIN:
      playerNumber = 2;
      break;
  }

  let moves = game!.game.moves(state, player);
  if (!moves.length) {
    switch (player) {
      case Player.MAX:
        player = Player.MIN;
        break;
      case Player.MIN:
        player = Player.MAX;
        break;
    }
    moves = game!.game.moves(state, player);
    if (moves.length) {
      console.error(`Player ${playerNumber!} has no moves; switching`);
    } else {
      console.error('Tie');
      process.stdin.destroy();
      return;
    }
  }

  console.error(`Player ${playerNumber!}, enter move:`);
  let move: any;
  switch (player) {
    case Player.MAX:
      move = await player1!.nextMove(state, Player.MAX);
      break;
    case Player.MIN:
      move = await player2!.nextMove(state, Player.MIN);
      break;
  }
  state = game!.game.move(state, move, player);

  console.error();
  switch (player) {
    case Player.MAX:
      player = Player.MIN;
      break;
    case Player.MIN:
      player = Player.MAX;
      break;
  }
  process.nextTick(next);
})();
