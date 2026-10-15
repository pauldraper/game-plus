"""Supplied shared CLI. Run with python3 -m src.cli (starter by default)."""
import argparse
import sys
import traceback
from typing import TextIO
from .implementation import load_implementation
from .model import State, clone_board, assert_state, InvalidMoveError, MissingImplementationError
from .state import create_game, load_position
from .ui import parse_command, format_move, render_board, HELP


def run_cli(target: str = "starter", *, initial_state: State | None = None,
            input_stream: TextIO | None = None, output_stream: TextIO | None = None) -> State:
    impl = load_implementation(target)
    before = create_game() if initial_state is None else initial_state
    assert_state(before)
    state = State(clone_board(before.board), before.player, before.status)
    incoming = sys.stdin if input_stream is None else input_stream
    outgoing = sys.stdout if output_stream is None else output_stream

    def say(text: str) -> None:
        print(text, file=outgoing, flush=True)

    def prompt() -> None:
        if incoming.isatty():
            print(f"{state.player} > ", end="", file=outgoing, flush=True)

    def announce() -> bool:
        say(render_board(state.board))
        if state.status == "finished":
            result = impl.get_result(state)
            say(f"Final score: B {result['black']}, W {result['white']}, empty {result['empty']}")
            say("Draw." if result["draw"] else f"{result['winner']} wins.")
            return True
        say(f"Turn: {state.player}")
        return False

    say(f"Othello Python | {target.upper()} mode")
    say("Type help for commands.")
    try:
        if announce():
            return state
    except MissingImplementationError as error:
        say(str(error))
    prompt()
    for line in incoming:
        try:
            kind, move = parse_command(line)
            if kind == "quit":
                say("Session ended.")
                return state
            if kind == "help":
                say(HELP.rstrip())
            elif kind == "board":
                say(render_board(state.board))
            elif kind == "moves":
                moves = impl.get_legal_moves(state.board, state.player)
                say(", ".join(map(format_move, moves)) if moves else "No legal moves. Use pass.")
            elif kind == "score":
                counts = impl.count_discs(state.board)
                say(f"B {counts['black']}, W {counts['white']}, empty {counts['empty']}")
            elif kind in ("move", "pass"):
                next_state = impl.pass_turn(state) if kind == "pass" else impl.play_move(state, move)
                assert_state(next_state)
                state = next_state
                if announce():
                    return state
        except (InvalidMoveError, MissingImplementationError) as error:
            prefix = "Invalid move: " if isinstance(error, InvalidMoveError) else ""
            say(prefix + str(error))
        # Unexpected exceptions deliberately escape: coding bugs are not bad player input.
        prompt()
    say("Session ended (end of input).")
    return state


def main(argv: list[str] | None = None, *, target: str = "starter") -> int:
    parser = argparse.ArgumentParser(description="Othello CLI; default target is the unfinished starter.")
    parser.add_argument("--example", action="store_true", help="Explicitly run the completed example.")
    parser.add_argument("--position", help="Path to a local board/player/status JSON position.")
    args = parser.parse_args(argv)
    selected = "example" if args.example else target
    try:
        initial = load_position(args.position) if args.position else create_game()
    except (OSError, ValueError, TypeError) as error:
        print(f"Configuration error: {error}", file=sys.stderr)
        return 1
    try:
        run_cli(selected, initial_state=initial)
    except KeyboardInterrupt:
        print("\nSession interrupted.")
        return 130
    except Exception:
        traceback.print_exc()
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
