"""Completed rules. This file is excluded from every fresh practice attempt."""
from src.model import (
    SIZE, BLACK, WHITE, EMPTY, Board, Player, Move, Counts,
    assert_board, assert_player, assert_move, clone_board, other_player, InvalidMoveError,
)


def get_flips(board: Board, player: Player, move: Move) -> list[Move]:
    assert_board(board)
    assert_player(player)
    assert_move(move)
    if board[move.row][move.col] != EMPTY:
        return []
    opponent = other_player(player)
    captured: list[Move] = []
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == dc == 0:
                continue
            row, col = move.row + dr, move.col + dc
            line: list[Move] = []
            while 0 <= row < SIZE and 0 <= col < SIZE and board[row][col] == opponent:
                line.append(Move(row, col))
                row, col = row + dr, col + dc
            # Only a friendly endpoint closes the bracket. Empty/edge discards it.
            if line and 0 <= row < SIZE and 0 <= col < SIZE and board[row][col] == player:
                captured.extend(line)
    return captured


def get_legal_moves(board: Board, player: Player) -> list[Move]:
    assert_board(board)
    assert_player(player)
    return [Move(row, col) for row in range(SIZE) for col in range(SIZE)
            if board[row][col] == EMPTY and get_flips(board, player, Move(row, col))]


def apply_move(board: Board, player: Player, move: Move) -> Board:
    assert_board(board)
    assert_player(player)
    assert_move(move)
    flips = get_flips(board, player, move)
    if not flips:
        raise InvalidMoveError("Move must occupy an empty square and capture at least one disc.")
    after = clone_board(board)
    after[move.row][move.col] = player
    for captured in flips:
        after[captured.row][captured.col] = player
    return after


def count_discs(board: Board) -> Counts:
    assert_board(board)
    counts: Counts = {"black": 0, "white": 0, "empty": 0}
    labels = {BLACK: "black", WHITE: "white", EMPTY: "empty"}
    for row in board:
        for cell in row:
            counts[labels[cell]] += 1
    return counts
